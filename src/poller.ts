/*
 * Copyright (c) 2026 opencode-wechat contributors
 *
 * This file adapts the long-polling design from the original prototype while
 * keeping the standalone repository behavior explicit and reviewable.
 */

import { createHash, randomBytes } from "node:crypto"
import type { GetUpdatesResult, WechatAccount } from "./model/wechat"
import type { StateStore } from "./state/types"
import { logError } from "./util/log"
import { sleep } from "./util/retry"

const LONG_POLL_TIMEOUT_MS = 35_000

export async function getUpdates(account: WechatAccount, cursor: string) {
  const raw = await apiFetch({
    base_url: account.base_url,
    endpoint: "ilink/bot/getupdates",
    body: JSON.stringify({
      get_updates_buf: cursor,
      base_info: { channel_version: "0.1.0" },
    }),
    token: account.token,
    timeout_ms: LONG_POLL_TIMEOUT_MS,
  })
  return JSON.parse(raw) as GetUpdatesResult
}

export async function pollLoop(input: {
  account: WechatAccount
  store: StateStore
  on_messages: (messages: unknown[]) => Promise<void>
}) {
  let failures = 0
  let cursor = ""
  while (true) {
    try {
      const result = await getUpdates(input.account, cursor)
      const isError = (result.ret !== undefined && result.ret !== 0) || (result.errcode !== undefined && result.errcode !== 0)
      if (isError) {
        failures++
        throw new Error(`poll failed: ret=${result.ret} errcode=${result.errcode} errmsg=${result.errmsg}`)
      }
      failures = 0
      cursor = result.get_updates_buf ?? cursor
      await input.on_messages((result.msgs ?? []) as unknown[])
      await input.store.setRuntime({
        ...(await input.store.getRuntime()),
        status: "running",
        last_poll_at: Date.now(),
        last_success_at: Date.now(),
      })
    } catch (error) {
      failures++
      logError("poller", "poll loop failed", error)
      const runtime = await input.store.getRuntime()
      await input.store.setRuntime({
        ...runtime,
        status: "degraded",
        last_error: error instanceof Error ? error.message : String(error),
        last_poll_at: Date.now(),
      })
      await sleep(failures >= 3 ? 30_000 : 2_000)
    }
  }
}

type ApiFetchInput = {
  base_url: string
  endpoint: string
  body: string
  token?: string
  timeout_ms: number
}

export async function apiFetch(input: ApiFetchInput) {
  const url = new URL(input.endpoint, input.base_url.endsWith("/") ? input.base_url : `${input.base_url}/`).toString()
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), input.timeout_ms)
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: buildHeaders(input.token, input.body),
      body: input.body,
      signal: controller.signal,
    })
    const text = await response.text()
    if (!response.ok) throw new Error(`http ${response.status}: ${text}`)
    return text
  } finally {
    clearTimeout(id)
  }
}

function buildHeaders(token?: string, body?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    AuthorizationType: "ilink_bot_token",
    "X-WECHAT-UIN": Buffer.from(String(randomBytes(4).readUInt32BE(0)), "utf-8").toString("base64"),
  }
  if (body) headers["Content-Length"] = String(Buffer.byteLength(body, "utf-8"))
  if (token?.trim()) headers.Authorization = `Bearer ${token.trim()}`
  return headers
}

export function dedupeKey(wechatUserId: string, createTimeMs: number, text: string) {
  return createHash("sha1").update(`${wechatUserId}:${createTimeMs}:${text}`).digest("hex")
}

