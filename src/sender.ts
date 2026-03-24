/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

import type { SendTextInput, SendTextResult, WechatAccount } from "./model/wechat"
import { apiFetch } from "./poller"
import { randomId } from "./util/hash"
import { splitReply } from "./util/text"

export async function sendTextMessage(account: WechatAccount, input: SendTextInput): Promise<SendTextResult> {
  const clientId = randomId("wechat")
  await apiFetch({
    base_url: account.base_url,
    endpoint: "ilink/bot/sendmessage",
    body: JSON.stringify({
      msg: {
        from_user_id: "",
        to_user_id: input.to,
        client_id: clientId,
        message_type: 2,
        message_state: 2,
        item_list: [{ type: 1, text_item: { text: input.text } }],
        context_token: input.context_token,
      },
      base_info: {
        channel_version: "0.1.0",
      },
    }),
    token: account.token,
    timeout_ms: 15_000,
  })
  return { client_id: clientId }
}

export async function sendReplyChunks(account: WechatAccount, input: { to: string; text: string; context_token: string; max: number }) {
  const chunks = splitReply(input.text, input.max)
  for (const chunk of chunks) {
    await sendTextMessage(account, {
      to: input.to,
      text: chunk,
      context_token: input.context_token,
    })
  }
}
