# opencode-wechat

[English](./README.en.md) | [简体中文](./README.md)

`opencode-wechat` is a bridge that connects WeChat messages to OpenCode, so you can talk to OpenCode directly from your phone through WeChat.

It is designed for individual developers and small teams who want a lightweight mobile entry point for OpenCode without adding a web console or a full enterprise messaging integration.

## Why This Project Exists

OpenCode is powerful on desktop and in the terminal, but there are many moments when you are away from your computer and still want to:

- ask OpenCode to inspect a project
- continue a multi-turn coding conversation
- trigger a small task
- confirm a risky action
- check the latest result from your phone

`opencode-wechat` turns WeChat into a practical control channel for OpenCode.

## Core Features

- WeChat QR code login
- WeChat text message receive and send
- WeChat conversation to OpenCode session mapping
- Multi-turn conversation support
- Project directory binding
- High-risk action confirmation flow
- Local file-based runtime state
- Local deployment with configurable paths

## Typical Use Cases

- Send instructions to OpenCode while commuting or traveling
- Check project status without opening a terminal
- Continue an existing coding task through WeChat
- Let a small team validate WeChat as a lightweight AI coding entry point

## Project Status

This project is currently in an early implementation stage.

The bridge flow has already been validated in a local integration environment:

- WeChat can send messages to the bridge
- the bridge can call OpenCode
- OpenCode results can be returned to WeChat

There is still work to do before a polished public release, especially around:

- automated tests
- packaging as a standalone binary
- configuration hardening
- documentation cleanup
- protocol stability and operational guidance

## Architecture Overview

At a high level, the bridge works like this:

1. A message arrives from WeChat.
2. The bridge parses the message and resolves the target project.
3. The bridge creates or reuses an OpenCode session.
4. The bridge sends the prompt to OpenCode.
5. The result is sent back to WeChat.

## Quick Start

The exact public setup steps will be refined as the repository is split out, but the intended quick-start flow is:

```bash
git clone <your-repo-url>
cd opencode-wechat
bun install
cp wechat-channel.example.json wechat-channel.json
bun run doctor
bun run start
```

If you want to verify the packaged CLI flow instead of running from source:

```bash
bun run build
./dist/opencode-wechat status
./dist/opencode-wechat start
```

Then:

1. scan the login QR code with your phone
2. send a message from WeChat
3. receive the OpenCode response in the same chat

## Example Configuration

This is an example of the configuration shape the project is expected to support:

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

## CLI Commands

Planned or implemented commands include:

- `start`
- `login`
- `logout`
- `status`
- `doctor`
- `smoke`
- `build`

## Scope

This project is intended to be:

- a focused WeChat bridge for OpenCode
- easy to understand and run locally
- useful for personal workflows and small-team experiments

This project is not intended, at least in its first public versions, to be:

- a full enterprise collaboration platform
- a general chatbot framework
- a replacement for OpenCode itself
- a production-grade multi-tenant control plane

## Security and Risk Notes

WeChat bridge software comes with operational and account-safety considerations.

Before using this project, you should clearly understand:

- the WeChat integration approach you are using
- the operational stability limits of message bridges
- the sensitivity of the projects you expose to remote chat control
- the risk of running high-privilege actions through a messaging channel

Early public versions should be treated as developer tooling for controlled environments, not as a default production solution for sensitive systems.

## Roadmap

- improve repository structure for standalone open-source release
- add `doctor` checks and more robust startup validation
- add unit tests and integration tests
- improve configuration docs and troubleshooting docs
- package the bridge as a standalone `opencode-wechat` binary
- define a cleaner plugin or channel adapter boundary for future expansion

## Contributing

Contributions, issue reports, setup notes, and field feedback will be very helpful, especially around:

- installation experience
- QR login stability
- message routing edge cases
- OpenCode session behavior
- safe-operation guidelines

See [CONTRIBUTING.md](./CONTRIBUTING.md), [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md), and [SECURITY.md](./SECURITY.md) before opening a pull request or reporting a sensitive issue.

## License

This project is released under the MIT license. See [LICENSE](./LICENSE).
