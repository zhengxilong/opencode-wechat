# Troubleshooting

[English](./troubleshooting.md) | [简体中文](./troubleshooting.zh-CN.md)

This document covers common setup and runtime issues for `opencode-wechat`.

## 1. `opencode` Command Not Found

### Symptom

The bridge fails to start or cannot create an OpenCode session.

### What to Check

- Confirm `opencode --help` works in the same shell.
- Confirm the `PATH` used by the bridge includes the OpenCode binary.
- Confirm the configured `opencode.command` value is correct.

## 2. Configuration Validation Failure

### Symptom

Startup fails with a config parsing or validation error.

### What to Check

- Confirm the config file is named `wechat-channel.json`.
- Confirm the JSON syntax is valid.
- Confirm required fields are present.
- Confirm project directories actually exist.

## 3. WeChat Login Fails or Expires

### Symptom

QR login does not complete, or the login state is lost after restart.

### What to Check

- Confirm the runtime state directory is writable.
- Confirm login state is being persisted under the configured state directory.
- Confirm the current WeChat integration approach is still valid in your environment.

## 4. Messages Are Received but No Reply Is Returned

### Symptom

WeChat can send a message, but no result comes back.

### What to Check

- Confirm the target project mapping is correct.
- Confirm OpenCode can access the configured project directory.
- Confirm session creation is succeeding.
- Confirm the bridge logs show a completed OpenCode response path.

## 5. Replies Are Too Long or Truncated

### Symptom

The returned response is cut off or incomplete.

### What to Check

- Review the configured `max_reply_chars` value.
- Add or improve message splitting behavior if needed.
- Test with shorter prompts first.

## 6. Restart Behavior Is Inconsistent

### Symptom

After restarting the bridge, sessions or login behavior are not reused as expected.

### What to Check

- Review which runtime state is expected to persist.
- Confirm state files are written successfully.
- Confirm the configured state directory has not changed.

## 7. Unsafe or Unexpected Actions

### Symptom

The bridge appears to allow actions that should require an approval step.

### What to Check

- Confirm `require_approval_for_risky_actions` is enabled.
- Review the action classification rules for risky operations.
- Test approval flow explicitly before broader use.

## 8. What to Collect Before Filing an Issue

Before reporting a bug, try to collect:

- the command you ran
- the config shape you used, with secrets removed
- the exact error message
- the relevant log lines
- whether the issue is reproducible after restart

