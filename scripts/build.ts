/*
 * Copyright (c) 2026 opencode-wechat contributors
 */

import { chmod, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const root = process.cwd()
const distDir = path.join(root, "dist")
const entry = path.join(root, "src", "index.ts")
const bundle = path.join(distDir, "index.js")
const launcher = path.join(distDir, "opencode-wechat")

await mkdir(distDir, { recursive: true })

const result = await Bun.build({
  entrypoints: [entry],
  outdir: distDir,
  target: "bun",
  format: "esm",
  minify: false,
  sourcemap: "linked",
  naming: "index.js",
  banner: "#!/usr/bin/env bun",
})

if (!result.success) {
  for (const log of result.logs) {
    console.error(log)
  }
  process.exit(1)
}

await chmod(bundle, 0o755)
await writeFile(
  launcher,
  `#!/usr/bin/env sh
set -e
exec bun "${bundle}" "$@"
`,
)
await chmod(launcher, 0o755)

console.log("[opencode-wechat] build completed")
console.log(`[opencode-wechat] bundle: ${bundle}`)
console.log(`[opencode-wechat] launcher: ${launcher}`)
