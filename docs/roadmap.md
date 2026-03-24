# Roadmap

[English](./roadmap.md) | [简体中文](./roadmap.zh-CN.md)

This roadmap describes the likely delivery path for `opencode-wechat` as a standalone open-source project.

## Phase 0: Repository Foundation

Goal: make the repository understandable and publishable.

Focus areas:

- finalize README and bilingual docs
- clean up repository structure
- provide example config
- provide example project
- add release checklist and public-facing guidance

## Phase 1: Stable Local Source Usage

Goal: make the bridge easy to run from source for individual developers.

Focus areas:

- clean standalone configuration loading
- reliable startup flow
- improved local state persistence
- better runtime diagnostics
- clearer error messages

## Phase 2: Real-World Validation

Goal: make real WeChat-to-OpenCode workflows more reliable.

Focus areas:

- repeated login and restart validation
- better message routing behavior
- stronger session reuse behavior
- approval flow refinement
- better operational troubleshooting guidance

## Phase 3: Testing and Quality

Goal: reduce regressions and improve contributor confidence.

Focus areas:

- unit tests
- integration tests
- smoke tests
- documented test scenarios
- CI-friendly validation strategy

## Phase 4: Standalone Packaging

Goal: make installation easier and reduce setup friction.

Focus areas:

- standalone `opencode-wechat` packaging
- build script improvements
- release artifact strategy
- binary distribution evaluation

## Phase 5: Safety and Observability

Goal: improve operational trustworthiness.

Focus areas:

- safer action policies
- clearer approval boundaries
- stronger logs and diagnostics
- optional metrics and audit improvements

## Phase 6: Ecosystem Readiness

Goal: make the project easier for broader community adoption.

Focus areas:

- issue templates
- contribution guide
- better docs structure
- clearer compatibility statements
- examples for different deployment patterns

## Near-Term Priorities

The most valuable next steps are:

1. keep real WeChat and OpenCode integration testing active
2. add automated testing
3. refine the standalone binary packaging path
4. continue hardening safety, state, and diagnostics

