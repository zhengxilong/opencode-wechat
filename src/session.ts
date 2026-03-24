/*
 * Copyright (c) 2026 opencode-wechat contributors
 *
 * This standalone version keeps the session lifecycle model from the
 * integration prototype, but uses a local adapter boundary so the repository
 * can evolve without requiring immediate tight coupling to the monorepo.
 */

import type { AppConfig } from "./config"
import path from "node:path"
import { loadSdk } from "./sdk"
import type { InboundMessage } from "./model/wechat"
import type { StateStore } from "./state/types"
import { findBinding, resolveProject, saveBinding } from "./router"
import { randomId } from "./util/hash"
import { log, logError } from "./util/log"
import { normalizeWechatText, trimReply } from "./util/text"

export type SessionRuntime = {
  adapter: SessionAdapter
  close?: () => void
}

type SessionAdapter = {
  createSession(input: { directory: string; title: string }): Promise<{ session_id: string }>
  promptSession(input: { session_id: string; directory: string; text: string }): Promise<{ text: string }>
}

export async function createRuntime(config: AppConfig): Promise<SessionRuntime> {
  try {
    ensureOpencodePath(config)
    ensureOpencodeEnvironment()
    const sdk = await loadSdk()
    const attached = await attachToExistingRuntime(config, sdk)
    if (attached) return attached
    const runtime = await sdk.createOpencode({
      port: 4097,
    })
    log("session", "OpenCode runtime created via SDK-managed server")
    return createSdkRuntime(config, runtime.client, () => runtime.server.close())
  } catch (error) {
    logError("session", "Failed to create SDK runtime, using placeholder adapter", error)
    return {
      adapter: createPlaceholderAdapter(config),
    }
  }
}

function ensureOpencodePath(config: AppConfig) {
  if (!path.isAbsolute(config.opencode.command)) return
  const dir = path.dirname(config.opencode.command)
  const current = process.env.PATH ?? ""
  const parts = current.split(":").filter(Boolean)
  if (parts.includes(dir)) return
  process.env.PATH = `${dir}:${current}`
}

function ensureOpencodeEnvironment() {
  process.env.OPENCODE_DISABLE_MODELS_FETCH = process.env.OPENCODE_DISABLE_MODELS_FETCH ?? "true"
}

async function attachToExistingRuntime(config: AppConfig, sdk: Awaited<ReturnType<typeof loadSdk>>) {
  const urls = getCandidateBaseUrls(config)
  for (const url of urls) {
    if (!(await isServerHealthy(url))) continue
    log("session", `Attaching to existing OpenCode server at ${url}`)
    return createSdkRuntime(config, sdk.createOpencodeClient({ baseUrl: url }))
  }
  return null
}

function createSdkRuntime(
  config: AppConfig,
  client: Awaited<ReturnType<typeof loadSdk>>["createOpencodeClient"] extends (options: { baseUrl: string }) => infer T
    ? T
    : never,
  close?: () => void,
): SessionRuntime {
  return {
    adapter: {
      async createSession(input) {
        const result = await client.session.create({
          query: {
            directory: input.directory,
          },
          body: {
            title: input.title,
          },
        })
        if (result.error) {
          throw new Error(JSON.stringify(result.error))
        }
        return {
          session_id: result.data.id,
        }
      },
      async promptSession(input) {
        const result = await client.session.prompt({
          path: { id: input.session_id },
          query: {
            directory: input.directory,
          },
          body: {
            parts: [{ type: "text", text: input.text }],
          },
        })
        if (result.error) {
          throw new Error(JSON.stringify(result.error))
        }
        const text = result.data.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("\n")
        return {
          text: trimReply(
            normalizeWechatText(text || result.data.info.id || "Request received, but no text response was returned."),
            config.wechat_channel.max_reply_chars,
          ),
        }
      },
    },
    close,
  }
}

function getCandidateBaseUrls(config: AppConfig) {
  const envUrl = process.env.OPENCODE_WECHAT_OPENCODE_BASE_URL
  const configUrl = config.opencode.base_url
  return [envUrl, configUrl, "http://127.0.0.1:4097"].filter(isNonEmptyString)
}

async function isServerHealthy(baseUrl: string) {
  try {
    const response = await fetch(new URL("/global/health", ensureTrailingSlash(baseUrl)), {
      signal: AbortSignal.timeout(1000),
    })
    return response.ok
  } catch {
    return false
  }
}

function ensureTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`
}

export async function ensureSession(input: {
  runtime: SessionRuntime
  config: AppConfig
  store: StateStore
  wechat_user_id: string
}) {
  const project = await resolveProject(input.store, input.config, input.wechat_user_id)
  const existing = await findBinding(input.store, input.wechat_user_id, project.id, 120)
  if (existing) {
    return {
      binding: { ...existing, last_active_at: Date.now() },
      project,
      created: false,
    }
  }
  const created = await input.runtime.adapter.createSession({
    directory: project.dir,
    title: `WeChat ${input.wechat_user_id} ${project.name}`,
  })
  const binding = {
    binding_key: randomId("binding"),
    wechat_user_id: input.wechat_user_id,
    session_id: created.session_id,
    project_id: project.id,
    project_dir: project.dir,
    project_name: project.name,
    created_at: Date.now(),
    last_active_at: Date.now(),
    status: "active" as const,
  }
  await saveBinding(input.store, binding)
  return {
    binding,
    project,
    created: true,
  }
}

export async function executePrompt(input: {
  runtime: SessionRuntime
  config: AppConfig
  store: StateStore
  message: InboundMessage
}) {
  const { binding, project } = await ensureSession({
    runtime: input.runtime,
    config: input.config,
    store: input.store,
    wechat_user_id: input.message.wechat_user_id,
  })
  await saveBinding(input.store, {
    ...binding,
    last_active_at: Date.now(),
  })
  const result = await input.runtime.adapter.promptSession({
    session_id: binding.session_id,
    directory: project.dir,
    text: input.message.text,
  })
  return {
    binding,
    text: result.text,
  }
}

function createPlaceholderAdapter(config: AppConfig): SessionAdapter {
  return {
    async createSession(input) {
      return {
        session_id: randomId(`session_${sanitize(input.directory)}`),
      }
    },
    async promptSession(input) {
      return {
        text: trimReply(
          normalizeWechatText(
            [
              "OpenCode SDK runtime is not available yet in this environment.",
              `session_id: ${input.session_id}`,
              `directory: ${input.directory}`,
              `prompt: ${input.text}`,
              `expected opencode command: ${config.opencode.command}`,
            ].join("\n"),
          ),
          config.wechat_channel.max_reply_chars,
        ),
      }
    },
  }
}

function sanitize(value: string) {
  return value.replaceAll(/[^a-zA-Z0-9]+/g, "_").replaceAll(/^_+|_+$/g, "") || "project"
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0
}
