# Configuration

[English](./configuration.md) | [简体中文](./configuration.zh-CN.md)

This document describes the intended configuration structure for `opencode-wechat`.

## 1. Configuration File

The default local configuration file is expected to be:

```text
wechat-channel.json
```

This file should not be committed if it contains machine-specific paths, credentials, or operational values.

Use the example file as the starting point:

```bash
cp wechat-channel.example.json wechat-channel.json
```

## 2. Example

```json
{
  "opencode": {
    "command": "opencode",
    "args": [],
    "working_directory": "/absolute/path/to/your/workspace",
    "base_url": ""
  },
  "wechat_channel": {
    "listen_mode": "polling",
    "state_dir": ".runtime",
    "poll_interval_ms": 3000,
    "startup_message": "opencode-wechat is ready.",
    "max_reply_chars": 6000,
    "require_approval_for_risky_actions": true
  },
  "projects": [
    {
      "id": "demo",
      "name": "Demo Project",
      "dir": "/absolute/path/to/your/project",
      "aliases": ["demo", "test"]
    }
  ],
  "security": {
    "allowed_wechat_users": [],
    "default_project_id": "demo"
  },
  "metrics": {
    "enabled": false,
    "api_base_url": "",
    "client_id": ""
  }
}
```

## 3. Section Reference

### `opencode`

Controls how the bridge invokes OpenCode.

- `command`
  - The command used to launch OpenCode.
  - Example: `opencode`
- `args`
  - Optional extra CLI arguments for OpenCode.
- `working_directory`
  - Default workspace root used by the bridge.
- `base_url`
  - Optional existing OpenCode server URL.
  - Example: `http://127.0.0.1:4097`
  - When set, `opencode-wechat` will try to attach to that server before spawning a new one.

### `wechat_channel`

Controls bridge runtime behavior.

- `listen_mode`
  - Message receiving mode, such as `polling`.
- `state_dir`
  - Directory used to store local runtime state and login state.
- `poll_interval_ms`
  - Polling interval in milliseconds.
- `startup_message`
  - Optional startup notification text.
- `max_reply_chars`
  - Soft response length limit before truncation or splitting logic.
- `require_approval_for_risky_actions`
  - Whether risky actions require an explicit confirmation flow.

### `projects`

Defines the project directories that users can target.

Each project entry should include:

- `id`
  - A stable internal identifier.
- `name`
  - A readable project name.
- `dir`
  - Absolute project path.
- `aliases`
  - Optional names that users can reference in messages or commands.

### `security`

Controls basic access behavior.

- `allowed_wechat_users`
  - Optional allowlist of WeChat users.
  - Empty usually means no explicit allowlist is enforced yet.
- `default_project_id`
  - The fallback project used when a message does not resolve a project explicitly.

### `metrics`

Optional metrics reporting controls.

- `enabled`
  - Enables metrics collection or reporting.
- `api_base_url`
  - Metrics endpoint base URL.
- `client_id`
  - Client or environment identifier for reporting.

## 4. Recommended Practices

- Keep `wechat-channel.json` local to your machine or deployment environment.
- Use absolute paths for project directories.
- Start with a single project before adding multiple projects.
- Keep risky actions gated by approval in early deployments.
- Do not store secrets in tracked example files.

## 5. Future Evolution

The configuration schema may evolve as the standalone repository is refined. Areas likely to expand include:

- richer user access control
- more project routing options
- safer command and approval policies
- more explicit metrics and observability settings
