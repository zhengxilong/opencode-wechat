# 快速开始

[English](./quick-start.md) | [简体中文](./quick-start.zh-CN.md)

本文档描述 `opencode-wechat` 预期的首次运行体验。

## 1. 前置条件

开始之前，请先确保你已经具备：

- 已安装 Bun
- `PATH` 中可以直接执行 `opencode`
- 已准备一个希望让 OpenCode 操作的本地项目目录
- 当前环境支持可用的微信桥接登录流程

你可以先用下面的命令确认 OpenCode 可用：

```bash
opencode --help
```

## 2. 克隆并安装依赖

```bash
git clone https://github.com/your-org/opencode-wechat.git
cd opencode-wechat
bun install
```

## 3. 创建本地配置文件

复制示例配置：

```bash
cp wechat-channel.example.json wechat-channel.json
```

然后编辑 `wechat-channel.json`，至少修改这些字段：

- `opencode.working_directory`
- `projects[0].dir`
- `security.default_project_id`

如果你的环境里已经能稳定运行 `opencode serve`，也可以额外配置：

- `opencode.base_url`

### 当前工作区的本地开发方式

如果你当前就在这个 `opencode-joinAI` 工作区里开发，仓库中已经准备好一份可直接使用的本地配置：

```text
opencode-wechat/wechat-channel.json
```

它已经指向：

- 本地构建好的 OpenCode 二进制：`/Users/stevenzheng/ai_projects/opencode-joinAI/opencode/packages/opencode/dist/opencode-darwin-arm64/bin/opencode`
- 当前工作区根目录
- 本地的 `opencode-wechat` 项目目录

所以对于当前工作区里的本地开发场景，通常不需要先手工改配置，就可以直接运行 `doctor`、`smoke` 和 `start`。

## 4. 运行诊断

执行：

```bash
bun run doctor
```

在当前本地工作区里，推荐直接这样跑：

```bash
cd /Users/stevenzheng/ai_projects/opencode-joinAI/opencode-wechat
bun run doctor
bun run smoke
```

预期会检查以下内容：

- `opencode` 是否可执行
- 配置文件是否存在
- 状态目录是否可写
- 配置的项目目录是否真实存在

## 5. 启动 Bridge

```bash
bun run start
```

如果你更希望验证构建后的 CLI 入口，也可以这样运行：

```bash
bun run build
./dist/opencode-wechat status
./dist/opencode-wechat start
```

启动后，Bridge 应该会完成以下动作：

- 加载配置
- 初始化运行状态
- 准备微信登录态或复用历史登录态
- 启动消息轮询

默认情况下，Bridge 现在要求使用真实微信登录，不会在正常启动流程里再静默持久化 placeholder 账号。

如果你是为了本地开发，明确希望启用 placeholder 模式，可以手工设置：

```bash
export OPENCODE_WECHAT_ALLOW_PLACEHOLDER_LOGIN=true
```

## 6. 使用微信登录

如果当前登录方式需要二维码，请使用手机微信扫描二维码并完成登录。

登录完成后，可以发送一条简单测试消息，例如：

```text
帮我检查一下当前项目，并用中文回复。
```

## 7. 验证结果

一次成功的验证通常意味着：

- Bridge 收到了你的微信消息
- Bridge 成功解析并定位目标项目
- OpenCode 成功处理了 Prompt
- 返回结果被正常发回微信

## 8. 常用命令

```bash
bun run status
bun run login
bun run logout
bun run smoke
bun run build
```

## 9. 常见问题

### 找不到 `opencode` 命令

请确认构建后的 `opencode` 二进制或安装好的命令已经正确加入当前 shell 的 `PATH`。

如果你使用的是当前工作区中已经准备好的 `wechat-channel.json`，那么配置已经直接写入了本地构建产物路径，因此为了跑 `doctor` 或 `smoke`，通常不需要额外设置 `PATH`。

### 复用已经启动的 OpenCode server

如果 `opencode serve` 在你的环境里已经比较稳定，可以把 `opencode.base_url` 配置成现有 server 地址。这样 `opencode-wechat` 会优先附着到这个正在运行的 server，而不是先让 SDK 再起一个新的。

### 配置校验失败

请确认：

- 文件名是 `wechat-channel.json`
- JSON 格式合法
- 已填写项目目录等必要字段

### 重启后微信登录态无法复用

请检查运行状态目录是否可写，以及登录态是否已经被正确持久化。

### `start` 因为要求真实微信登录而失败

如果当前机器无法访问微信接口，或者之前已经写入过旧的 placeholder 账号，就可能出现这种情况。

建议按下面顺序处理：

- 先执行一次 `bun run logout` 清理旧的 placeholder 状态
- 确认当前机器可以访问微信登录接口
- 重新启动并完成二维码登录

如果你确实只是为了本地开发，想主动使用 placeholder 模式，可以在启动前设置 `OPENCODE_WECHAT_ALLOW_PLACEHOLDER_LOGIN=true`。

## 10. 下一步建议

首次成功跑通之后，建议继续验证这些内容：

- 绑定多个项目目录
- 测试多轮对话
- 验证高风险操作确认流程
- 在长期使用前检查安全配置
