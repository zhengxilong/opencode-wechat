/*
 * Copyright (c) 2026 opencode-wechat contributors
 *
 * This parsing logic is adapted from the validated prototype in
 * opencode/packages/wechat and kept intentionally simple here.
 */

import type { Command } from "./model/command"
import type { InboundMessage, WechatRawMessage } from "./model/wechat"
import { sha1 } from "./util/hash"

const MSG_TYPE_USER = 1
const MSG_ITEM_TEXT = 1
const MSG_ITEM_VOICE = 3

export function parseMessage(raw: WechatRawMessage): InboundMessage | null {
  if (raw.message_type !== MSG_TYPE_USER) return null
  const text = extractText(raw)
  if (!text) return null
  const wechatUserId = raw.from_user_id ?? "unknown"
  const createTimeMs = raw.create_time_ms ?? Date.now()
  return {
    message_id: raw.client_id ?? sha1(`${wechatUserId}:${createTimeMs}:${text}`),
    wechat_user_id: wechatUserId,
    session_key: raw.session_id ?? wechatUserId,
    text,
    context_token: raw.context_token,
    create_time_ms: createTimeMs,
    raw,
  }
}

export function parseCommand(text: string): Command {
  const value = text.trim()
  if (value === "#help") return { type: "help" }
  if (value === "#status") return { type: "status" }
  if (value === "#reset") return { type: "reset" }
  if (value === "#project list") return { type: "project.list" }
  if (value.startsWith("#project use ")) return { type: "project.use", project: value.slice("#project use ".length).trim() }
  if (value === "确认") return { type: "confirm" }
  if (value === "取消") return { type: "cancel" }
  return { type: "unknown", text }
}

function extractText(raw: WechatRawMessage) {
  for (const item of raw.item_list ?? []) {
    if (item.type === MSG_ITEM_TEXT && item.text_item?.text) {
      const ref = item.ref_msg?.title ? `[引用: ${item.ref_msg.title}]\n` : ""
      return `${ref}${item.text_item.text}`.trim()
    }
    if (item.type === MSG_ITEM_VOICE && item.voice_item?.text) return item.voice_item.text.trim()
  }
  return ""
}

