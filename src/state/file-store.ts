/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

import path from "node:path"
import type { ApprovalRecord, LoginState, RuntimeState, SessionBinding, StateStore, WechatAccount } from "./types"

export function createFileStore(root: string): StateStore {
  return {
    root,
    async getAccount() {
      return await readJson<WechatAccount | null>(path.join(root, "account.json"), null)
    },
    async setAccount(value) {
      await writeJson(path.join(root, "account.json"), value)
    },
    async getLogin() {
      return await readJson<LoginState>(path.join(root, "login.json"), defaultLogin())
    },
    async setLogin(value) {
      await writeJson(path.join(root, "login.json"), value)
    },
    async getRuntime() {
      return await readJson<RuntimeState>(path.join(root, "runtime.json"), defaultRuntime())
    },
    async setRuntime(value) {
      await writeJson(path.join(root, "runtime.json"), value)
    },
    async getBindings() {
      return await readJson<SessionBinding[]>(path.join(root, "bindings.json"), [])
    },
    async setBindings(value) {
      await writeJson(path.join(root, "bindings.json"), value)
    },
    async getApprovals() {
      return await readJson<ApprovalRecord[]>(path.join(root, "approvals.json"), [])
    },
    async setApprovals(value) {
      await writeJson(path.join(root, "approvals.json"), value)
    },
    async getProjectBindings() {
      return await readJson<Record<string, string>>(path.join(root, "project-bindings.json"), {})
    },
    async setProjectBindings(value) {
      await writeJson(path.join(root, "project-bindings.json"), value)
    },
  }
}

async function readJson<T>(file: string, fallback: T) {
  const handle = Bun.file(file)
  if (!(await handle.exists())) return fallback
  try {
    return (await handle.json()) as T
  } catch {
    return fallback
  }
}

async function writeJson(file: string, value: unknown) {
  await Bun.write(file, `${JSON.stringify(value, null, 2)}\n`)
}

function defaultLogin(): LoginState {
  return {
    logged_in: false,
    updated_at: null,
    mode: "none",
    note: "No login state yet",
  }
}

function defaultRuntime(): RuntimeState {
  return {
    started_at: null,
    status: "idle",
    mode: "polling",
  }
}
