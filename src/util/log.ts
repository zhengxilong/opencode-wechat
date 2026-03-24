/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

export function log(scope: string, message: string, data?: unknown) {
  const line = data === undefined ? message : `${message} ${safe(data)}`
  console.error(`[opencode-wechat:${scope}] ${line}`)
}

export function logError(scope: string, message: string, error?: unknown) {
  const line = error === undefined ? message : `${message} ${safe(error)}`
  console.error(`[opencode-wechat:${scope}] ERROR ${line}`)
}

function safe(value: unknown) {
  if (value instanceof Error) {
    return JSON.stringify({
      name: value.name,
      message: value.message,
      stack: value.stack,
    })
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
