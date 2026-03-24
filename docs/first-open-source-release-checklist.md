# First Open Source Release Checklist

[English](./first-open-source-release-checklist.md) | [简体中文](./first-open-source-release-checklist.zh-CN.md)

Use this checklist before publishing `opencode-wechat` as a standalone GitHub open-source project.

## 1. Repository Basics

- [ ] Create the standalone GitHub repository
- [ ] Confirm the final repository name
- [ ] Add project description and topics on GitHub
- [ ] Add a public license file
- [ ] Add a `.gitignore`
- [ ] Confirm the default branch strategy

## 2. Documentation

- [ ] Finalize `README.md`
- [ ] Finalize `README.zh-CN.md`
- [ ] Add language switch links between README files
- [ ] Add `docs/quick-start.md`
- [ ] Add configuration documentation
- [ ] Add troubleshooting documentation
- [ ] Add security and risk notes
- [ ] Add architecture overview documentation
- [ ] Add roadmap documentation

## 3. Configuration and Examples

- [ ] Provide `wechat-channel.example.json`
- [ ] Remove any machine-specific absolute paths from examples
- [ ] Add a minimal demo project under `examples/`
- [ ] Confirm example configuration can be copied and edited directly

## 4. Code Readiness

- [ ] Remove project-internal hard-coded paths
- [ ] Remove company- or environment-specific assumptions
- [ ] Confirm local runtime directories are configurable
- [ ] Confirm startup errors are readable and actionable
- [ ] Confirm bridge restart behavior is acceptable
- [ ] Confirm login state persistence behavior is documented

## 5. Testing

- [ ] Add at least basic unit tests
- [ ] Add at least one integration or smoke test
- [ ] Verify a fresh clone can start successfully
- [ ] Verify the documented quick-start flow matches reality
- [ ] Verify the example config works after path replacement

## 6. Packaging and Developer Experience

- [ ] Confirm `package.json` metadata is correct
- [ ] Confirm `tsconfig.json` is standalone-repo ready
- [ ] Add a `doctor` command
- [ ] Add a build script for future standalone packaging
- [ ] Decide whether the first release is source-only or binary-assisted
- [ ] Confirm the supported Bun and Node expectations

## 7. Security and Compliance

- [ ] Review account safety messaging for WeChat login
- [ ] Review high-risk action confirmation defaults
- [ ] Document intended usage boundaries
- [ ] Clearly state non-production or controlled-environment guidance if needed
- [ ] Remove sensitive logs, tokens, or private hostnames from the repository

## 8. Release Management

- [ ] Choose the first release version, such as `v0.1.0`
- [ ] Write release notes
- [ ] Prepare screenshots or GIF demos
- [ ] Add an initial issue template set if desired
- [ ] Add a contribution guide if community contributions are expected
- [ ] Tag the first public release

## 9. Post-Release Plan

- [ ] Prepare a short roadmap for the next 2 to 3 milestones
- [ ] Decide how issues and support requests will be handled
- [ ] Collect first-user installation feedback
- [ ] Prioritize testing, binary packaging, and documentation based on feedback
