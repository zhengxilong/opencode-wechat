/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

import type { AppConfig, ProjectConfig } from "./config"
import type { SessionBinding } from "./model/runtime"
import type { StateStore } from "./state/types"

export async function resolveProject(store: StateStore, config: AppConfig, wechatUserId: string): Promise<ProjectConfig> {
  const projectBindings = await store.getProjectBindings()
  const selected = projectBindings[wechatUserId] ?? config.security.default_project_id ?? config.projects[0]?.id
  const project = config.projects.find((item) => item.id === selected || item.aliases.includes(selected ?? ""))
  if (!project) throw new Error(`project not found for user: ${wechatUserId}`)
  return project
}

export async function setProject(store: StateStore, wechatUserId: string, projectId: string) {
  const all = await store.getProjectBindings()
  await store.setProjectBindings({
    ...all,
    [wechatUserId]: projectId,
  })
}

export async function resetBindings(store: StateStore, wechatUserId: string) {
  const next = (await store.getBindings()).filter((item) => item.wechat_user_id !== wechatUserId)
  await store.setBindings(next)
}

export async function findBinding(
  store: StateStore,
  wechatUserId: string,
  projectId: string,
  timeoutMinutes: number,
) {
  const all = await store.getBindings()
  const current = all.find(
    (item) => item.wechat_user_id === wechatUserId && item.project_id === projectId && item.status === "active",
  )
  if (!current) return null
  if (Date.now() - current.last_active_at > timeoutMinutes * 60_000) {
    const next = all.map((item) =>
      item.binding_key === current.binding_key ? { ...item, status: "expired" as const } : item,
    )
    await store.setBindings(next)
    return null
  }
  return current
}

export async function saveBinding(store: StateStore, binding: SessionBinding) {
  const all = await store.getBindings()
  const next = all.filter((item) => item.binding_key !== binding.binding_key)
  next.push(binding)
  await store.setBindings(next)
}

