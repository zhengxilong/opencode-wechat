/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

import { chmod } from "node:fs/promises"
import type { AppConfig } from "./config"
import type { QrCodeInfo, QrStatus, WechatAccount } from "./model/wechat"
import type { StateStore } from "./state/types"
import { log, logError } from "./util/log"
import { sleep } from "./util/retry"

const BOT_TYPE = "3"

export async function ensureLogin(config: AppConfig, store: StateStore, force = false) {
  const existing = force ? null : await store.getAccount()
  if (existing && !isPlaceholderAccount(existing)) return existing
  if (existing && isPlaceholderAccount(existing)) {
    log("login", "placeholder account found, retrying real WeChat login")
  }
  return await login(config, store)
}

export async function login(config: AppConfig, store: StateStore) {
  const baseUrl = process.env.OPENCODE_WECHAT_BASE_URL ?? "https://ilinkai.weixin.qq.com"
  const allowPlaceholder = process.env.OPENCODE_WECHAT_ALLOW_PLACEHOLDER_LOGIN === "true"
  try {
    const qr = await fetchQrCode(baseUrl)
    log("login", "scan this qr with WeChat")
    console.error(qr.qrcode_img_content)
    const deadline = Date.now() + 8 * 60 * 1000
    while (Date.now() < deadline) {
      const status = await pollQrStatus(baseUrl, qr.qrcode)
      if (status.status === "confirmed" && status.bot_token && status.ilink_bot_id) {
        const account: WechatAccount = {
          account_id: status.ilink_bot_id,
          token: status.bot_token,
          base_url: status.baseurl || baseUrl,
          user_id: status.ilink_user_id,
          saved_at: new Date().toISOString(),
        }
        await store.setAccount(account)
        await store.setLogin({
          logged_in: true,
          updated_at: new Date().toISOString(),
          mode: config.wechat_channel.listen_mode,
          note: "WeChat account login stored",
        })
        await chmod(`${store.root}/account.json`, 0o600).catch(() => {})
        log("login", "wechat login success", { account_id: account.account_id })
        return account
      }
      if (status.status === "expired") break
      await sleep(1000)
    }
    throw new Error("wechat login timeout")
  } catch (error) {
    if (allowPlaceholder) {
      logError("login", "real login unavailable, using placeholder login because OPENCODE_WECHAT_ALLOW_PLACEHOLDER_LOGIN=true", error)
      const account: WechatAccount = {
        account_id: "placeholder-account",
        token: "placeholder-token",
        base_url: baseUrl,
        saved_at: new Date().toISOString(),
      }
      await store.setAccount(account)
      await store.setLogin({
        logged_in: true,
        updated_at: new Date().toISOString(),
        mode: config.wechat_channel.listen_mode,
        note: "Placeholder login state for local development",
      })
      return account
    }

    await store.setAccount(null)
    await store.setLogin({
      logged_in: false,
      updated_at: new Date().toISOString(),
      mode: config.wechat_channel.listen_mode,
      note: "Real WeChat login failed",
    })
    throw error instanceof Error
      ? new Error(
          `${error.message}. Real WeChat login is required. If you intentionally want local placeholder mode, set OPENCODE_WECHAT_ALLOW_PLACEHOLDER_LOGIN=true.`,
        )
      : new Error(
          `Real WeChat login failed. If you intentionally want local placeholder mode, set OPENCODE_WECHAT_ALLOW_PLACEHOLDER_LOGIN=true.`,
        )
  }
}

export function isPlaceholderAccount(account: WechatAccount | null | undefined) {
  return account?.account_id === "placeholder-account"
}

export async function logout(store: StateStore) {
  await store.setAccount(null)
  await store.setLogin({
    logged_in: false,
    updated_at: new Date().toISOString(),
    mode: "none",
    note: "Logged out",
  })
  console.log("[opencode-wechat] login state cleared")
}

async function fetchQrCode(baseUrl: string): Promise<QrCodeInfo> {
  const url = new URL(`ilink/bot/get_bot_qrcode?bot_type=${encodeURIComponent(BOT_TYPE)}`, withSlash(baseUrl))
  const response = await fetch(url)
  if (!response.ok) throw new Error(`fetch qr failed: ${response.status}`)
  return (await response.json()) as QrCodeInfo
}

async function pollQrStatus(baseUrl: string, qrcode: string): Promise<QrStatus> {
  const url = new URL(`ilink/bot/get_qrcode_status?qrcode=${encodeURIComponent(qrcode)}`, withSlash(baseUrl))
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 35_000)
  try {
    const response = await fetch(url, {
      headers: { "iLink-App-ClientVersion": "1" },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`fetch qr status failed: ${response.status}`)
    return (await response.json()) as QrStatus
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return { status: "wait" }
    logError("login", "poll qr status failed", error)
    throw error
  } finally {
    clearTimeout(id)
  }
}

function withSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`
}
