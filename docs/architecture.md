# Architecture

[English](./architecture.md) | [简体中文](./architecture.zh-CN.md)

This document explains the intended high-level architecture of `opencode-wechat`.

## 1. Overview

`opencode-wechat` is designed as a lightweight bridge between WeChat and OpenCode.

Its job is not to replace OpenCode, but to provide a message-driven access channel so users can operate OpenCode through WeChat.

At a high level, the bridge has four responsibilities:

- receive messages from WeChat
- resolve user intent and project context
- invoke OpenCode sessions
- send results back to WeChat

## 2. High-Level Flow

The core runtime flow looks like this:

1. A message arrives from WeChat.
2. The bridge validates and parses the message.
3. The bridge resolves which project and session should handle it.
4. The bridge creates or reuses an OpenCode session.
5. The bridge sends the prompt to OpenCode.
6. The bridge processes the response.
7. The bridge sends the response back to WeChat.

## 3. Main Components

### 3.1 CLI Layer

The CLI layer provides operational entry points such as:

- `start`
- `login`
- `logout`
- `status`
- `doctor`

This layer is responsible for startup, diagnostics, and local operational workflows.

### 3.2 Config Layer

The config layer loads and validates bridge configuration, including:

- OpenCode invocation settings
- WeChat runtime settings
- project directory definitions
- access and safety settings
- optional metrics settings

### 3.3 WeChat Access Layer

This layer handles integration with the WeChat message channel.

Typical responsibilities include:

- QR login handling
- login-state reuse
- message polling or receiving
- outgoing message sending

### 3.4 Router and Parser Layer

This layer interprets incoming messages and decides:

- whether the message is a command or a prompt
- which project it should target
- whether it belongs to an existing conversation
- whether any approval flow is required

### 3.5 Session Layer

This layer manages the bridge to OpenCode sessions.

Its responsibilities include:

- creating sessions
- reusing sessions
- binding sessions to project directories
- sending prompts
- collecting OpenCode results

### 3.6 State Store

The state layer persists bridge runtime data locally.

Typical examples include:

- login state
- session mapping
- user-to-project context
- approval state
- runtime metadata

In early versions, file-based persistence is the simplest and most practical default.

### 3.7 Approval and Safety Layer

This layer determines when an action should require explicit user confirmation before execution.

This is important because a messaging channel can make risky actions feel deceptively lightweight.

### 3.8 Metrics and Observability Layer

This layer is optional but useful for:

- bridge health observation
- debugging and incident analysis
- future management-platform integration

## 4. Reference Data Flow

```text
WeChat Message
    ↓
WeChat Access Layer
    ↓
Parser / Router
    ↓
Project + Session Resolution
    ↓
Approval Check
    ↓
OpenCode Session Invocation
    ↓
Response Formatting
    ↓
WeChat Reply
```

## 5. Project Binding Model

The bridge is expected to support one or more configured project directories.

Each incoming message should be resolved against:

- an explicitly selected project
- a default project
- or a previously active project for the current conversation

This avoids ambiguous execution and makes the behavior easier to reason about.

## 6. Design Goals

The intended architecture is guided by these goals:

- keep the bridge independent from OpenCode core
- keep deployment simple for individual developers
- keep state local and understandable
- make risk boundaries explicit
- support future packaging as a standalone binary
- leave room for future channel adapter expansion

## 7. Non-Goals for Early Versions

Early public versions are not intended to solve everything.

Non-goals include:

- full enterprise IAM and policy systems
- large-scale multi-tenant orchestration
- a general-purpose chatbot platform
- deep management-console features inside the bridge itself

## 8. Evolution Path

The architecture can evolve over time in several directions:

- better testing and interface contracts
- stronger access control
- cleaner adapter boundaries for more channels
- a standalone packaged binary
- deeper metrics and audit support

