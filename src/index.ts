/*
 * Copyright (c) 2026 opencode-wechat contributors
 *
 * This file is part of the standalone opencode-wechat repository skeleton.
 * The initial structure is derived from the WeChat bridge prototype created
 * in the opencode-joinAI integration workspace.
 */

import { createBridge } from "./bridge"
import { runCli } from "./cli"
import { loadConfig } from "./config"
import { createRuntime } from "./session"
import { createStateStore } from "./state/store"

const config = await loadConfig()
const store = await createStateStore(config.wechat_channel.state_dir)
const runtime = await createRuntime(config)

await runCli({
  command: process.argv[2] ?? "start",
  config,
  store,
  start: async () => {
    const bridge = await createBridge({ config, store, runtime })
    await bridge.start()
  },
  status: async () => ({
    runtime: await store.getRuntime(),
    login: await store.getLogin(),
    bindings: await store.getBindings(),
    approvals: await store.getApprovals(),
    projects: config.projects,
  }),
})
