/*
 * Copyright (c) 2026 opencode-wechat contributors
 *
 * The approval model is derived from the earlier bridge prototype and kept
 * as a standalone-friendly implementation here.
 */

import type { Command } from "./model/command"
import type { ApprovalRecord } from "./model/runtime"
import type { StateStore } from "./state/types"
import { randomId } from "./util/hash"

const TTL_MS = 10 * 60 * 1000

export function detectRisk(text: string, kinds: string[]) {
  const value = text.toLowerCase()
  return kinds.find((kind) => {
    if (kind === "git_push") return value.includes("git push") || value.includes("推送")
    if (kind === "rm") return value.includes("rm ") || value.includes("删除")
    if (kind === "bulk_edit") return value.includes("批量修改") || value.includes("批量编辑")
    if (kind === "exec_dangerous_command") return value.includes("sudo ") || value.includes("危险命令")
    if (kind === "dependency_install") return value.includes("npm install") || value.includes("bun install")
    return false
  })
}

export async function createApproval(
  store: StateStore,
  input: { wechat_user_id: string; project_id: string; project_dir: string; session_id?: string; request_text: string; risk_type: string },
) {
  const all = await store.getApprovals()
  const record: ApprovalRecord = {
    approval_id: randomId("approval"),
    wechat_user_id: input.wechat_user_id,
    project_id: input.project_id,
    project_dir: input.project_dir,
    session_id: input.session_id,
    request_text: input.request_text,
    risk_type: input.risk_type,
    status: "pending",
    created_at: Date.now(),
    expires_at: Date.now() + TTL_MS,
  }
  await store.setApprovals([
    ...all.filter((item) => (item.status === "pending" ? item.wechat_user_id !== input.wechat_user_id : true)),
    record,
  ])
  return record
}

export async function resolveApproval(store: StateStore, wechatUserId: string, command: Command) {
  const all = await store.getApprovals()
  const current = all.find((item) => item.wechat_user_id === wechatUserId && item.status === "pending")
  if (!current) return null
  const now = Date.now()
  const next = all.map((item) => {
    if (item.approval_id !== current.approval_id) return item
    if (item.expires_at < now) return { ...item, status: "expired" as const }
    if (command.type === "confirm") return { ...item, status: "approved" as const }
    if (command.type === "cancel") return { ...item, status: "rejected" as const }
    return item
  })
  await store.setApprovals(next)
  return next.find((item) => item.approval_id === current.approval_id) ?? null
}

export async function expireApprovals(store: StateStore) {
  const now = Date.now()
  const all = await store.getApprovals()
  const next = all.map((item) =>
    item.status === "pending" && item.expires_at < now ? { ...item, status: "expired" as const } : item,
  )
  await store.setApprovals(next)
}

