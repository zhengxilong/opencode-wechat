/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

import { retry } from "./util/retry"

export type MetricsSnapshot = {
  inbound_message_count: number
  outbound_message_count: number
  session_create_count: number
  session_reuse_count: number
  error_count: number
  updated_at: number
}

export function defaultMetrics(): MetricsSnapshot {
  return {
    inbound_message_count: 0,
    outbound_message_count: 0,
    session_create_count: 0,
    session_reuse_count: 0,
    error_count: 0,
    updated_at: Date.now(),
  }
}

export async function syncMetrics(metrics: MetricsSnapshot, baseUrl?: string) {
  if (!baseUrl) return
  await retry(async () => {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/metrics/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: "wechat",
        entrypoint: "wechat_channel",
        metrics,
      }),
    })
    if (!response.ok) {
      throw new Error(`management report failed: ${response.status}`)
    }
  })
}
