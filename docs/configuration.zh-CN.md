# 配置说明

[English](./configuration.md) | [简体中文](./configuration.zh-CN.md)

本文档说明 `opencode-wechat` 预期使用的配置结构。

## 1. 配置文件

默认本地配置文件预计为：

```text
wechat-channel.json
```

如果该文件中包含机器相关路径、凭据或运行参数，则不应直接提交到版本控制系统。

建议从示例文件开始：

```bash
cp wechat-channel.example.json wechat-channel.json
```

## 2. 配置示例

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

## 3. 字段说明

### `opencode`

用于控制 Bridge 如何调用 OpenCode。

- `command`
  - 启动 OpenCode 使用的命令。
  - 示例：`opencode`
- `args`
  - 可选的 OpenCode 附加命令行参数。
- `working_directory`
  - Bridge 默认使用的工作区根目录。
- `base_url`
  - 可选的现有 OpenCode server 地址。
  - 示例：`http://127.0.0.1:4097`
  - 配置后，`opencode-wechat` 会优先附着到该 server，而不是先尝试再起一个新的。

### `wechat_channel`

用于控制 Bridge 的运行时行为。

- `listen_mode`
  - 消息接收模式，例如 `polling`。
- `state_dir`
  - 用于保存本地运行状态和登录状态的目录。
- `poll_interval_ms`
  - 轮询时间间隔，单位毫秒。
- `startup_message`
  - 可选的启动提示消息。
- `max_reply_chars`
  - 回复内容的软长度限制，超出时可截断或拆分。
- `require_approval_for_risky_actions`
  - 是否对高风险操作启用显式确认流程。

### `projects`

定义用户可以访问的项目目录。

每个项目建议包含：

- `id`
  - 稳定的内部标识符。
- `name`
  - 易读的项目名称。
- `dir`
  - 项目的绝对路径。
- `aliases`
  - 用户在消息或命令中可使用的别名。

### `security`

用于控制基础访问策略。

- `allowed_wechat_users`
  - 可选的微信用户白名单。
  - 留空通常表示暂时不启用显式白名单。
- `default_project_id`
  - 当消息没有明确命中项目时使用的默认项目。

### `metrics`

用于可选的指标采集和上报配置。

- `enabled`
  - 是否启用指标采集或上报。
- `api_base_url`
  - 指标接口地址。
- `client_id`
  - 上报使用的客户端或环境标识。

## 4. 建议做法

- 将 `wechat-channel.json` 保留在本地或部署环境中。
- 项目目录尽量使用绝对路径。
- 先从单项目配置开始，再逐步扩展到多项目。
- 在早期部署中，建议默认开启高风险操作确认。
- 不要把密钥或敏感配置放进示例文件。

## 5. 后续演进方向

随着独立仓库逐步完善，配置 schema 还可能继续扩展，重点可能包括：

- 更细的用户访问控制
- 更灵活的项目路由策略
- 更安全的命令和审批策略
- 更明确的指标和可观测性配置
