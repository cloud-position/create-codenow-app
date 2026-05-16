import { existsSync } from "node:fs"
import { rm } from "node:fs/promises"
import path from "node:path"
import pc from "picocolors"

import { fetchTemplate } from "./lib/fetch.js"
import { postInit } from "./lib/postinit.js"
import { resolveProjectName } from "./lib/prompt.js"

const REQUIRED_NODE: readonly [number, number, number] = [24, 15, 0]

function meetsRequiredNode(): boolean {
  const [major, minor, patch] = process.versions.node
    .split(".")
    .map((n) => Number(n)) as [number, number, number]
  if (major !== REQUIRED_NODE[0]) return major > REQUIRED_NODE[0]
  if (minor !== REQUIRED_NODE[1]) return minor > REQUIRED_NODE[1]
  return patch >= REQUIRED_NODE[2]
}

async function main(): Promise<void> {
  if (!meetsRequiredNode()) {
    console.error(
      pc.red(
        `Node.js v${REQUIRED_NODE.join(".")} 以上が必要です(現在: ${process.versions.node})`,
      ),
    )
    process.exit(1)
  }

  let targetDir: string | undefined
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
    const message = err instanceof Error ? err.message : String(err)
    console.error()
    console.error(pc.red("エラー: ") + message)
    if (targetDir && existsSync(targetDir)) {
      console.error(pc.yellow("作成途中のディレクトリを削除します..."))
      await rm(targetDir, { recursive: true, force: true })
    }
    process.exit(1)
  }
}

main()
