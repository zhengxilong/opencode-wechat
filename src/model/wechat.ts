/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

export type WechatAccount = {
  account_id: string
  token: string
  base_url: string
  user_id?: string
  saved_at: string
}

export type WechatRawMessage = {
  client_id?: string
  from_user_id?: string
  to_user_id?: string
  session_id?: string
  context_token?: string
  create_time_ms?: number
  message_type?: number
  message_state?: number
  item_list?: Array<{
    type?: number
    text_item?: {
      text?: string
    }
    voice_item?: {
      text?: string
    }
    ref_msg?: {
      title?: string
    }
  }>
}

export type InboundMessage = {
  message_id: string
  wechat_user_id: string
  session_key: string
  text: string
  context_token?: string
  create_time_ms: number
  raw: WechatRawMessage
}

export type GetUpdatesResult = {
  ret?: number
  errcode?: number
  errmsg?: string
  msgs?: WechatRawMessage[]
  get_updates_buf?: string
  longpolling_timeout_ms?: number
}

export type SendTextInput = {
  to: string
  text: string
  context_token: string
}

export type SendTextResult = {
  client_id: string
}

export type QrCodeInfo = {
  qrcode: string
  qrcode_img_content: string
}

export type QrStatus =
  | { status: "wait" | "scaned" | "expired" }
  | {
      status: "confirmed"
      bot_token?: string
      ilink_bot_id?: string
      baseurl?: string
      ilink_user_id?: string
    }
