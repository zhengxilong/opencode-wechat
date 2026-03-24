/*
 * Copyright (c) 2026 opencode-wechat contributors
 *
 * The config-loading shape here is intentionally close to the earlier
 * integration prototype so the standalone repository can evolve without
 * losing the validated behavior model.
 */

import path from "node:path"

export type ProjectConfig = {
  id: string
  name: string
  dir: string
  aliases: string[]
}

export type AppConfig = {
  opencode: {
    command: string
    args: string[]
    working_directory: string
    base_url?: string
  }
  wechat_channel: {
    listen_mode: string
    state_dir: string
    poll_interval_ms: number
    startup_message?: string
    max_reply_chars: number
    require_approval_for_risky_actions: boolean
  }
  projects: ProjectConfig[]
  security: {
    allowed_wechat_users: string[]
    default_project_id?: string
  }
  metrics: {
    enabled: boolean
    api_base_url?: string
    client_id?: string
  }
}

export async function loadConfig() {
  const file = await loadConfigFile()
  const root = process.cwd()
  const opencode = objectValue(file.opencode)
  const wechatChannel = objectValue(file.wechat_channel)
  const security = objectValue(file.security)
  const metrics = objectValue(file.metrics)
  const projects = Array.isArray(file.projects) ? file.projects.map(normalizeProject).filter(isProjectConfig) : []
  const config: AppConfig = {
    opencode: {
      command: stringValue(opencode.command, "opencode"),
      args: arrayOfStrings(opencode.args),
      working_directory: stringValue(opencode.working_directory, root),
      base_url: optionalString(opencode.base_url),
    },
    wechat_channel: {
      listen_mode: stringValue(wechatChannel.listen_mode, "polling"),
      state_dir: stringValue(wechatChannel.state_dir, path.join(root, ".runtime")),
      poll_interval_ms: positiveNumber(wechatChannel.poll_interval_ms, 3000),
      startup_message: optionalString(wechatChannel.startup_message),
      max_reply_chars: positiveNumber(wechatChannel.max_reply_chars, 6000),
      require_approval_for_risky_actions: booleanValue(
        wechatChannel.require_approval_for_risky_actions,
        true,
      ),
    },
    projects,
    security: {
      allowed_wechat_users: arrayOfStrings(security.allowed_wechat_users),
      default_project_id: optionalString(security.default_project_id),
    },
    metrics: {
      enabled: booleanValue(metrics.enabled, false),
      api_base_url: optionalString(metrics.api_base_url),
      client_id: optionalString(metrics.client_id),
    },
  }
  return config
}

async function loadConfigFile() {
  const custom = process.env.OPENCODE_WECHAT_CONFIG_PATH
  const candidates = [
    custom,
    path.join(process.cwd(), "wechat-channel.json"),
    path.join(process.cwd(), ".wechat-channel.json"),
  ].filter(isNonEmptyString)

  for (const file of candidates) {
    if (!(await Bun.file(file).exists())) continue
    const text = await Bun.file(file).text()
    return JSON.parse(stripComments(text)) as Record<string, unknown>
  }

  const fallback = path.join(process.cwd(), "wechat-channel.example.json")
  if (await Bun.file(fallback).exists()) {
    const text = await Bun.file(fallback).text()
    return JSON.parse(stripComments(text)) as Record<string, unknown>
  }
  return {}
}

function normalizeProject(value: unknown) {
  if (!value || typeof value !== "object") return null
  const item = value as Record<string, unknown>
  const id = stringValue(item.id, "")
  const name = stringValue(item.name, id || "project")
  const dir = stringValue(item.dir, "")
  if (!id || !dir) return null
  return {
    id,
    name,
    dir,
    aliases: arrayOfStrings(item.aliases),
  }
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {}
}

function stripComments(text: string) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.length > 0 ? value : fallback
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback
}

function positiveNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.trunc(value) : fallback
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value) ? value.filter(isNonEmptyString) : []
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0
}

function isProjectConfig(value: ProjectConfig | null): value is ProjectConfig {
  return value !== null
}
