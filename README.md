# opencode-wechat

[English](./README.en.md) | [简体中文](./README.md)

`opencode-wechat` 是一个将微信消息桥接到 OpenCode 的通道服务，让你可以直接通过手机微信和 OpenCode 交互。

它主要面向个人开发者和小团队，目标是在不引入额外 Web 控制台或复杂企业 IM 集成的前提下，为 OpenCode 提供一个轻量、直接、可本地部署的移动端入口。

## 为什么要做这个项目

OpenCode 在桌面端和终端里很好用，但很多时候你并不在电脑前，仍然希望能够：

- 让 OpenCode 查看当前项目
- 继续一轮未完成的多轮对话
- 发起一个轻量任务
- 确认一个高风险操作
- 通过手机查看最新执行结果

`opencode-wechat` 的目标，就是把微信变成一个可实际使用的 OpenCode 控制通道。

## 核心能力

- 微信二维码登录
- 微信文本消息接收与发送
- 微信会话映射到 OpenCode Session
- 支持多轮对话
- 支持项目目录绑定
- 支持高风险操作确认流程
- 支持本地文件方式保存运行状态
- 支持本地部署和自定义路径配置

## 典型使用场景

- 通勤、外出、开会时通过手机给 OpenCode 发指令
- 不打开终端也能查看项目状态
- 在微信里继续一个已有的编码任务
- 让小团队快速验证“微信作为 AI Coding 入口”的可行性

## 当前状态

这个项目目前处于早期实现阶段。

当前桥接链路已经在本地联调环境中完成验证：

- 微信可以向 Bridge 发送消息
- Bridge 可以调用 OpenCode
- OpenCode 的结果可以回传到微信

在正式作为独立开源项目发布前，仍然还有一些工作需要继续补齐，主要包括：

- 自动化测试
- 独立二进制打包
- 配置健壮性增强
- 文档整理和示例完善
- 协议稳定性和运维说明

## 架构概览

从高层看，这个桥接流程是这样的：

1. 微信消息进入 Bridge。
2. Bridge 解析消息并确定目标项目。
3. Bridge 创建或复用一个 OpenCode Session。
4. Bridge 将消息作为 Prompt 发送给 OpenCode。
5. 执行结果回传到微信。

## 快速开始

独立仓库拆出后，目标中的最小启动流程会是下面这样：

```bash
git clone <your-repo-url>
cd opencode-wechat
bun install
cp wechat-channel.example.json wechat-channel.json
bun run doctor
bun run start
```

如果你想验证“构建产物启动”而不是源码启动，也可以使用下面这组命令：

```bash
bun run build
./dist/opencode-wechat status
./dist/opencode-wechat start
```

然后：

1. 用手机扫描登录二维码
2. 在微信中发送消息
3. 在同一个聊天窗口中接收 OpenCode 返回结果

## 配置示例

下面是一个预期支持的配置结构示例：

```json
{
  "opencode": {
    "command": "opencode"
  },
  "wechat_channel": {
    "listen_mode": "polling",
    "state_dir": ".runtime"
  },
  "projects": [
    {
      "id": "demo",
      "name": "Demo Project",
      "dir": "/path/to/project"
    }
  ]
}
```

## CLI 命令

计划支持或已经实现的命令包括：

- `start`
- `login`
- `logout`
- `status`
- `doctor`
- `smoke`
- `build`

## 项目边界

这个项目的定位是：

- 一个面向 OpenCode 的专用微信桥接器
- 一个容易理解、容易本地运行的开发者工具
- 一个适合个人工作流和小团队实验的轻量入口

这个项目在首批公开版本中，不打算定位为：

- 完整的企业协同平台
- 通用聊天机器人框架
- OpenCode 本体替代品
- 面向大规模生产环境的多租户控制平面

## 安全与风险说明

任何微信桥接类软件都天然带有运行稳定性、账号安全和运维风险。

在使用这个项目之前，你需要充分理解：

- 你当前采用的微信接入方式
- 消息桥接方案的稳定性边界
- 通过消息通道暴露项目控制能力的风险
- 在聊天通道中执行高权限操作的安全边界

在项目早期公开版本中，更适合将它视为“受控环境下的开发者工具”，而不是默认用于高敏感生产环境的标准方案。

## Roadmap

- 完善独立开源仓库结构
- 增加 `doctor` 启动检查与诊断能力
- 增加单元测试和集成测试
- 完善配置文档和排障文档
- 将 Bridge 打包为独立的 `opencode-wechat` 二进制
- 为未来多通道扩展整理更清晰的 adapter/plugin 边界

## 贡献

欢迎提交 Issue、PR、使用反馈和部署经验，尤其欢迎以下方面的帮助：

- 安装体验优化
- 二维码登录稳定性
- 消息路由边界场景
- OpenCode Session 行为验证
- 安全使用建议和最佳实践

在提交 PR 或报告敏感问题前，建议先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)、[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) 和 [SECURITY.md](./SECURITY.md)。

## License

本项目采用 MIT 许可证，详见 [LICENSE](./LICENSE)。
