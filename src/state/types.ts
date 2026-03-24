/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

export type LoginState = {
  logged_in: boolean
  updated_at: string | null
  mode: string
  note: string
}

export type RuntimeState = {
  started_at: string | null
  status: string
  mode: string
  last_poll_at?: number
  last_success_at?: number
  last_error?: string
}

export type SessionBinding = import("../model/runtime").SessionBinding
export type ApprovalRecord = import("../model/runtime").ApprovalRecord
export type WechatAccount = import("../model/wechat").WechatAccount

export type StateStore = {
  root: string
  getAccount(): Promise<WechatAccount | null>
  setAccount(value: WechatAccount | null): Promise<void>
  getLogin(): Promise<LoginState>
  setLogin(value: LoginState): Promise<void>
  getRuntime(): Promise<RuntimeState>
  setRuntime(value: RuntimeState): Promise<void>
  getBindings(): Promise<SessionBinding[]>
  setBindings(value: SessionBinding[]): Promise<void>
  getApprovals(): Promise<ApprovalRecord[]>
  setApprovals(value: ApprovalRecord[]): Promise<void>
  getProjectBindings(): Promise<Record<string, string>>
  setProjectBindings(value: Record<string, string>): Promise<void>
}
