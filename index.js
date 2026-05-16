#!/usr/bin/env node
import { existsSync } from "node:fs"
import { rm } from "node:fs/promises"
import path from "node:path"
import pc from "picocolors"

import { fetchTemplate } from "./lib/fetch.js"
import { postInit } from "./lib/postinit.js"
import { resolveProjectName } from "./lib/prompt.js"

async function main() {
  const major = Number(process.versions.node.split(".")[0])
  if (major < 22) {
    console.error(pc.red(`Node.js 22 以上が必要です(現在: ${process.versions.node})`))
    process.exit(1)
  }

  let targetDir
  try {
    const name = await resolveProjectName(process.argv.slice(2))
    targetDir = path.resolve(process.cwd(), name)

    if (existsSync(targetDir)) {
      throw new Error(`ディレクトリが既に存在します: ${name}`)
    }

    console.log(pc.cyan(`CodeNow スターターを ${pc.bold(name)} に作成中...`))
    console.log()

    await fetchTemplate("nextjs", targetDir)
    await postInit(targetDir, name)
  } catch (err) {
    console.error()
    console.error(pc.red("エラー: ") + err.message)
    if (targetDir && existsSync(targetDir)) {
      console.error(pc.yellow("作成途中のディレクトリを削除します..."))
      await rm(targetDir, { recursive: true, force: true })
    }
    process.exit(1)
  }
}

main()
