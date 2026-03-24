/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

import path from "node:path"
import { pathToFileURL } from "node:url"

type SdkModule = {
  createOpencode: (options?: { port?: number }) => Promise<{
    client: {
      session: {
        create: (input: {
          query?: { directory?: string }
          body?: { title?: string }
        }) => Promise<{ data: { id: string }; error?: unknown }>
        prompt: (input: {
          path: { id: string }
          query?: { directory?: string }
          body: { parts: Array<{ type: "text"; text: string }> }
        }) => Promise<{
          data: {
            info: { id: string }
            parts: Array<{ type: string; text?: string }>
          }
          error?: unknown
        }>
      }
    }
    server: {
      close: () => void
    }
  }>
  createOpencodeClient: (options: { baseUrl: string }) => {
    session: {
      create: (input: {
        query?: { directory?: string }
        body?: { title?: string }
      }) => Promise<{ data: { id: string }; error?: unknown }>
      prompt: (input: {
        path: { id: string }
        query?: { directory?: string }
        body: { parts: Array<{ type: "text"; text: string }> }
      }) => Promise<{
        data: {
          info: { id: string }
          parts: Array<{ type: string; text?: string }>
        }
        error?: unknown
      }>
    }
  }
}

export async function loadSdk(): Promise<SdkModule> {
  const errors: unknown[] = []
  const packageName = "@opencode-ai/sdk"

  try {
    return (await import(packageName)) as SdkModule
  } catch (error) {
    errors.push(error)
  }

  const localDist = path.resolve(process.cwd(), "../opencode/packages/sdk/js/dist/index.js")
  try {
    return (await import(pathToFileURL(localDist).href)) as SdkModule
  } catch (error) {
    errors.push(error)
  }

  throw new Error(
    `Unable to load OpenCode SDK from package import or local workspace dist. Errors: ${errors
      .map((item) => (item instanceof Error ? item.message : String(item)))
      .join(" | ")}`,
  )
}
