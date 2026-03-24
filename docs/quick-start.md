# Quick Start

[English](./quick-start.md) | [简体中文](./quick-start.zh-CN.md)

This document describes the intended first-run experience for `opencode-wechat`.

## 1. Prerequisites

Before you start, make sure you have:

- Bun installed
- a working `opencode` command available in your `PATH`
- a local project directory you want OpenCode to operate on
- a supported WeChat bridge login flow available in your environment

You can verify OpenCode is available with:

```bash
opencode --help
```

## 2. Clone and Install

```bash
git clone https://github.com/zhengxilong/opencode-wechat.git
cd opencode-wechat
bun install
```

## 3. Create Your Local Config

Copy the example config:

```bash
cp wechat-channel.example.json wechat-channel.json
```

Then edit `wechat-channel.json` and update at least:

- `opencode.working_directory`
- `projects[0].dir`
- `security.default_project_id`

If you already have `opencode serve` running successfully in your environment, you can also set:

- `opencode.base_url`

### Local Development In This Workspace

If you are working inside the current `opencode-joinAI` workspace, a ready-to-use local config is already prepared:

```text
opencode-wechat/wechat-channel.json
```

It points to:

- the built local OpenCode binary at `/Users/stevenzheng/ai_projects/opencode-joinAI/opencode/packages/opencode/dist/opencode-darwin-arm64/bin/opencode`
- the current workspace root
- the local `opencode-wechat` project directory

So for local development in this workspace, you usually do not need to edit the config before running `doctor`, `smoke`, or `start`.

## 4. Run Diagnostics

Run:

```bash
bun run doctor
```

For the current local workspace, this is also a useful sequence:

```bash
cd /Users/stevenzheng/ai_projects/opencode-joinAI/opencode-wechat
bun run doctor
bun run smoke
```

The expected checks should confirm:

- `opencode` is executable
- the config file is present
- the state directory is writable
- the configured project directories exist

## 5. Start the Bridge

```bash
bun run start
```

If you prefer to validate the packaged CLI entrypoint:

```bash
bun run build
./dist/opencode-wechat status
./dist/opencode-wechat start
```

At startup, the bridge should:

- load the config
- initialize runtime state
- prepare WeChat login or reuse an existing login state
- start message polling

By default, the bridge now requires a real WeChat login. It will no longer silently persist a placeholder account during normal startup.

If you intentionally want local placeholder mode for development, set:

```bash
export OPENCODE_WECHAT_ALLOW_PLACEHOLDER_LOGIN=true
```

## 6. Log In With WeChat

If a QR code login flow is required, scan the QR code with your phone and finish the login flow in WeChat.

After login, send a simple test message such as:

```text
Help me inspect the current project and reply in Chinese.
```

## 7. Verify the Result

A successful verification usually means:

- your message is received by the bridge
- the bridge resolves a target project
- OpenCode processes the prompt
- the reply is returned to WeChat

## 8. Common Commands

```bash
bun run status
bun run login
bun run logout
bun run smoke
bun run build
```

## 9. Common Problems

### `opencode` command not found

Make sure the built `opencode` binary or installed command is available in your shell `PATH`.

If you are using the prepared local `wechat-channel.json` in this workspace, the config already points to the built binary directly, so you do not need to set `PATH` just to run `doctor` or `smoke`.

### Reuse an existing OpenCode server

If `opencode serve` is already stable in your environment, set `opencode.base_url` to that server URL. `opencode-wechat` will try to attach to the running server before asking the SDK to spawn a new one.

### Config validation failed

Check that:

- the file name is `wechat-channel.json`
- the JSON is valid
- required fields such as project directory are set

### WeChat login cannot be reused after restart

Check whether the runtime state directory is writable and whether login state is being persisted correctly.

### `start` fails because real WeChat login is required

This is expected if the current machine cannot reach the WeChat endpoint or if an old placeholder account was stored earlier.

Recommended actions:

- run `bun run logout` once to clear old placeholder state
- confirm the WeChat endpoint is reachable
- start again and complete QR login

If you intentionally want local placeholder mode for development, set `OPENCODE_WECHAT_ALLOW_PLACEHOLDER_LOGIN=true` before `bun run start`.

## 10. Next Steps

After the first successful run, the next recommended tasks are:

- bind more than one project
- test multi-turn conversations
- verify risky-action approval flows
- review security settings before longer-term use
