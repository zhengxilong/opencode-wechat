/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

export type SessionBinding = {
  binding_key: string
  wechat_user_id: string
  session_id: string
  project_id: string
  project_dir: string
  project_name: string
  created_at: number
  last_active_at: number
  status: "active" | "expired" | "blocked"
}

export type ApprovalRecord = {
  approval_id: string
  wechat_user_id: string
  project_id: string
  project_dir: string
  session_id?: string
  request_text: string
  risk_type: string
  status: "pending" | "approved" | "rejected" | "expired"
  created_at: number
  expires_at: number
}

export type RuntimeSnapshot = {
  started_at: string | null
  status: "idle" | "running" | "degraded" | "stopped"
  mode: string
  last_poll_at?: number
  last_success_at?: number
  last_error?: string
}

