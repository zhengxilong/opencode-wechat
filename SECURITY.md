# Security Policy

[English](./SECURITY.md) | [简体中文](./SECURITY.zh-CN.md)

For usage guidance and operational safety notes, see [docs/security.md](./docs/security.md).

## Reporting a Vulnerability

Before the public launch, please do not disclose suspected vulnerabilities publicly in issues.

When the repository is published, replace this section with a monitored security contact, for example:

- a dedicated email address
- a private security advisory workflow
- a maintainer contact process

## Scope

Security-sensitive areas for this project include:

- WeChat login and session persistence
- message routing and authorization checks
- project directory binding
- risky action approval flow
- any bridge logic that can trigger local OpenCode activity
