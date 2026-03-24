/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

import { createApproval, detectRisk, resolveApproval } from "../src/approval"
import { loadConfig } from "../src/config"
import { parseCommand } from "../src/parser"
import { resolveProject, setProject } from "../src/router"
import { createRuntime, executePrompt } from "../src/session"
import { createStateStore } from "../src/state/store"

const config = await loadConfig()
const store = await createStateStore(config.wechat_channel.state_dir)
const runtime = await createRuntime(config)
const smokeUser = `smoke-user-${Date.now()}`

const result: Record<string, unknown> = {}

result.command_status = parseCommand("#status")
result.risk_detection = detectRisk("please run bun install and git push", [
  "dependency_install",
  "git_push",
])

if (config.projects[0]) {
  await setProject(store, smokeUser, config.projects[0].id)
}

result.resolved_project = await resolveProject(store, config, smokeUser)

const approval = await createApproval(store, {
  wechat_user_id: smokeUser,
  project_id: config.projects[0]?.id ?? "demo",
  project_dir: config.projects[0]?.dir ?? process.cwd(),
  request_text: "git push origin main",
  risk_type: "git_push",
})
result.approval_created = approval
result.approval_resolved = await resolveApproval(store, smokeUser, { type: "confirm" })

result.prompt_result = await executePrompt({
  runtime,
  config,
  store,
  message: {
    message_id: `smoke-message-${Date.now()}`,
    wechat_user_id: smokeUser,
    session_key: `smoke-session-${Date.now()}`,
    text: "Explain the current project briefly.",
    create_time_ms: Date.now(),
    raw: {
      message_type: 1,
      from_user_id: smokeUser,
    },
  },
})

console.log(JSON.stringify(result, null, 2))
