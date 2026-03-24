/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

import type { AppConfig } from "./config"
import { createApproval, detectRisk, resolveApproval } from "./approval"
import type { Command } from "./model/command"
import type { InboundMessage } from "./model/wechat"
import { isPlaceholderAccount } from "./login"
import { parseCommand, parseMessage } from "./parser"
import { pollLoop } from "./poller"
import { resetBindings, resolveProject, setProject } from "./router"
import type { SessionRuntime } from "./session"
import { executePrompt } from "./session"
import { sendReplyChunks } from "./sender"
import type { StateStore } from "./state/types"
import { log, logError } from "./util/log"

const RISK_TYPES = ["git_push", "rm", "bulk_edit", "exec_dangerous_command", "dependency_install"]

export async function createBridge(input: { config: AppConfig; store: StateStore; runtime: SessionRuntime }) {
  return {
    async start() {
      await input.store.setRuntime({
        started_at: new Date().toISOString(),
        status: "running",
        mode: input.config.wechat_channel.listen_mode,
      })
      console.log("[opencode-wechat] bridge started")
      console.log(`[opencode-wechat] state dir: ${input.config.wechat_channel.state_dir}`)
      console.log(`[opencode-wechat] project count: ${input.config.projects.length}`)
      console.log("[opencode-wechat] message pipeline is wired")
      console.log(`[opencode-wechat] sample command parse: ${parseCommand("#status").type}`)
      console.log(`[opencode-wechat] session adapter ready: ${Boolean(input.runtime.adapter)}`)

      const account = await input.store.getAccount()
      if (!account) {
        log("bridge", "no account is available, startup stopped")
        return
      }
      if (isPlaceholderAccount(account)) {
        log("bridge", "placeholder account detected, skipping real poll loop")
        return
      }

      await pollLoop({
        account,
        store: input.store,
        on_messages: async (messages) => {
          for (const raw of messages) {
            const inbound = parseMessage(raw as InboundMessage["raw"])
            if (!inbound) continue
            await handleInbound({
              config: input.config,
              store: input.store,
              runtime: input.runtime,
              message: inbound,
              send: async (text) => {
                if (!inbound.context_token) {
                  log("bridge", "skipping send because context token is missing", { message_id: inbound.message_id })
                  return
                }
                await sendReplyChunks(account, {
                  to: inbound.wechat_user_id,
                  text,
                  context_token: inbound.context_token,
                  max: input.config.wechat_channel.max_reply_chars,
                })
              },
            })
          }
        },
      })
    },
  }
}

async function handleInbound(input: {
  config: AppConfig
  store: StateStore
  runtime: SessionRuntime
  message: InboundMessage
  send: (text: string) => Promise<void>
}) {
  try {
    const command = parseCommand(input.message.text)
    const approval = await resolveApproval(input.store, input.message.wechat_user_id, command)
    if (approval?.status === "approved") {
      await input.send(`已确认，可继续执行。\n风险类型: ${approval.risk_type}`)
      return
    }
    if (approval?.status === "rejected") {
      await input.send("已取消本次高风险操作。")
      return
    }
    if (approval?.status === "expired") {
      await input.send("确认已过期，请重新发起请求。")
      return
    }

    if (command.type !== "unknown") {
      await input.send(await handleCommand(input.config, input.store, input.message.wechat_user_id, command))
      return
    }

    const project = await resolveProject(input.store, input.config, input.message.wechat_user_id)
    const risk = detectRisk(input.message.text, RISK_TYPES)
    if (risk && input.config.wechat_channel.require_approval_for_risky_actions) {
      await createApproval(input.store, {
        wechat_user_id: input.message.wechat_user_id,
        project_id: project.id,
        project_dir: project.dir,
        request_text: input.message.text,
        risk_type: risk,
      })
      await input.send(`检测到高风险操作，需要确认后才会继续执行。\n风险类型: ${risk}\n回复“确认”继续，回复“取消”放弃。`)
      return
    }

    const result = await executePrompt({
      runtime: input.runtime,
      config: input.config,
      store: input.store,
      message: input.message,
    })
    await input.send(result.text)
  } catch (error) {
    logError("bridge", "failed to process inbound message", error)
    await input.send(`处理失败：${error instanceof Error ? error.message : String(error)}`)
  }
}

async function handleCommand(config: AppConfig, store: StateStore, wechatUserId: string, command: Command) {
  if (command.type === "help") {
    return [
      "可用命令：",
      "#help",
      "#status",
      "#reset",
      "#project list",
      "#project use <project>",
      "确认",
      "取消",
    ].join("\n")
  }
  if (command.type === "status") {
    const project = await resolveProject(store, config, wechatUserId)
    const runtime = await store.getRuntime()
    return [
      "当前状态：",
      `运行状态: ${runtime.status}`,
      `监听模式: ${runtime.mode}`,
      `当前项目: ${project.name}`,
      `项目目录: ${project.dir}`,
    ].join("\n")
  }
  if (command.type === "reset") {
    await resetBindings(store, wechatUserId)
    return "会话绑定已重置。"
  }
  if (command.type === "project.list") {
    return ["可用项目：", ...config.projects.map((item) => `- ${item.id}: ${item.name} (${item.dir})`)].join("\n")
  }
  if (command.type === "project.use") {
    const target = config.projects.find((item) => item.id === command.project || item.aliases.includes(command.project))
    if (!target) return `未找到项目：${command.project}`
    await setProject(store, wechatUserId, target.id)
    return `已切换到项目：${target.name}`
  }
  if (command.type === "confirm") return "当前没有待确认的高风险操作。"
  if (command.type === "cancel") return "当前没有待取消的高风险操作。"
  return "无法识别的命令。"
}
