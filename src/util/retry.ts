/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

export async function retry<T>(
  task: () => Promise<T>,
  options?: {
    retries?: number
    delay_ms?: number
  },
) {
  const retries = options?.retries ?? 2
  const delayMs = options?.delay_ms ?? 1000
  let last: unknown
  for (let i = 0; i <= retries; i++) {
    try {
      return await task()
    } catch (error) {
      last = error
      if (i === retries) break
      await sleep(delayMs)
    }
  }
  throw last
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

