/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

import { access } from "node:fs/promises"
import { constants } from "node:fs"
import { loadConfig } from "../src/config"

const config = await loadConfig()
const checks = await Promise.all([
  checkExecutable(config.opencode.command),
  checkPath(config.wechat_channel.state_dir),
  ...config.projects.map((item) => checkPath(item.dir)),
])

const summary = {
  ok: checks.every((item) => item.ok),
  checks,
}

console.log(JSON.stringify(summary, null, 2))

async function checkExecutable(command: string) {
  try {
    const proc = Bun.spawn([command, "--help"], {
      stdout: "ignore",
      stderr: "ignore",
    })
    const code = await proc.exited
    return {
      name: "opencode_command",
      ok: code === 0,
      detail: command,
    }
  } catch {
    return {
      name: "opencode_command",
      ok: false,
      detail: command,
    }
  }
}

async function checkPath(target: string) {
  try {
    await access(target, constants.F_OK)
    return {
      name: "path_exists",
      ok: true,
      detail: target,
    }
  } catch {
    return {
      name: "path_exists",
      ok: false,
      detail: target,
    }
  }
}

