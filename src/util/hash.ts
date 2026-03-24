/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

import { createHash } from "node:crypto"

export function sha1(value: string) {
  return createHash("sha1").update(value).digest("hex")
}

export function randomId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

