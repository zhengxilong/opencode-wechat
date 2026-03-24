# Security

[English](./security.md) | [简体中文](./security.zh-CN.md)

This document explains the main security considerations for `opencode-wechat`.

## 1. Core Principle

`opencode-wechat` gives a messaging channel the ability to trigger actions in OpenCode. That means the bridge should be treated as a sensitive control surface, not just as a chat integration.

## 2. Main Risks

Key risks include:

- unauthorized message access
- unsafe project exposure
- risky command execution
- login-state leakage
- weak runtime file permissions
- insufficient operator visibility

## 3. Recommended Defaults

For early deployments, the recommended baseline is:

- use only in controlled personal or small-team environments
- keep project directories scoped and explicit
- enable approval for risky actions
- avoid exposing highly sensitive repositories at first
- protect runtime state directories with appropriate file permissions
- avoid storing secrets in tracked config files

## 4. WeChat-Specific Considerations

Before adopting a WeChat bridge in a longer-term environment, you should clearly understand:

- how login state is created and stored
- what could invalidate or expire that login state
- what operational signals indicate login drift or bridge instability
- what account-safety implications apply to the chosen integration path

## 5. OpenCode Execution Considerations

Because the bridge can forward prompts into OpenCode, you should think about:

- which directories OpenCode can access
- whether file-writing actions should be restricted
- which actions require an explicit approval flow
- whether different projects should have different safety policies

## 6. Logging and Observability

Good operational visibility matters.

Recommended practices:

- log startup, login, message routing, and failure events
- avoid logging secrets or sensitive raw payloads
- keep enough context to troubleshoot routing and approval behavior
- review logs regularly during early rollout

## 7. Usage Boundary

Unless additional controls are added, early versions of this project should be treated as:

- developer tooling
- controlled-environment infrastructure
- an experimental or limited-scope productivity channel

They should not be treated as a default remote control plane for high-sensitivity production systems.

## 8. Future Security Work

Areas worth strengthening in future releases include:

- stronger access control
- clearer approval policy modeling
- better audit logging
- safer secret handling
- formal deployment guidance

