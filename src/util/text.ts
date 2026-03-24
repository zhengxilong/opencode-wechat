/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

export function trimReply(text: string, max: number) {
  if (text.length <= max) return text
  return `${text.slice(0, Math.max(0, max - 32))}\n\n[content truncated]`
}

export function splitReply(text: string, max: number) {
  if (text.length <= max) return [text]
  const result: string[] = []
  let rest = text
  while (rest.length > max) {
    result.push(rest.slice(0, max))
    rest = rest.slice(max)
  }
  if (rest.length > 0) result.push(rest)
  return result
}

export function normalizeWechatText(text: string) {
  return text.replace(/```[\s\S]*?```/g, "[code block omitted]").replace(/\r\n/g, "\n").trim()
}

