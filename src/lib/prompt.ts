import { createInterface } from "node:readline/promises"

const NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/i

export async function resolveProjectName(argv: string[]): Promise<string> {
  let name: string | undefined = argv[0]
  if (!name) {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    name = (await rl.question("プロジェクト名: ")).trim()
    rl.close()
  }
  if (!name) throw new Error("プロジェクト名が指定されていません")
  if (!NAME_PATTERN.test(name)) {
    throw new Error(
      `プロジェクト名は英数字とハイフンのみ使用可能です(指定: "${name}")`,
    )
  }
  return name
}
