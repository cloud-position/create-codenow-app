import { spawn } from "node:child_process"
import { access, copyFile } from "node:fs/promises"
import path from "node:path"
import pc from "picocolors"

export async function postInit(targetDir, projectName) {
  await copyEnvLocal(targetDir)
  await initGit(targetDir)
  printDoneMessage(targetDir, projectName)
}

async function copyEnvLocal(targetDir) {
  const src = path.join(targetDir, ".env.local.example")
  const dst = path.join(targetDir, ".env.local")
  try {
    await access(src)
    await copyFile(src, dst)
    console.log(pc.green("✓") + " .env.local を作成(値は空。後で編集)")
  } catch {
    console.log(pc.yellow("⚠") + " .env.local.example が見つからずスキップ")
  }
}

async function hasGit() {
  return new Promise((resolve) => {
    const child = spawn("git", ["--version"], { stdio: "ignore" })
    child.on("close", (code) => resolve(code === 0))
    child.on("error", () => resolve(false))
  })
}

async function initGit(targetDir) {
  if (!(await hasGit())) {
    console.log(pc.yellow("⚠") + " git が見つからないため初期コミットをスキップ")
    return
  }
  if (await hasCommit(targetDir)) {
    console.log(pc.green("✓") + " git リポジトリは初期化済み")
    return
  }
  await runIn(targetDir, "git", ["init", "--quiet"])
  await runIn(targetDir, "git", ["add", "-A"])
  await runIn(targetDir, "git", [
    "commit",
    "-q",
    "-m",
    "Initial commit from create-codenow-app",
  ])
  console.log(pc.green("✓") + " git リポジトリを初期化")
}

function hasCommit(targetDir) {
  return new Promise((resolve) => {
    const child = spawn("git", ["rev-parse", "HEAD"], {
      cwd: targetDir,
      stdio: "ignore",
    })
    child.on("close", (code) => resolve(code === 0))
    child.on("error", () => resolve(false))
  })
}

function runIn(cwd, cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "ignore" })
    child.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${cmd} ${args.join(" ")} が失敗(exit ${code})`)),
    )
    child.on("error", reject)
  })
}

function printDoneMessage(targetDir, projectName) {
  const cd = path.relative(process.cwd(), targetDir) || projectName
  console.log()
  console.log(pc.bold(pc.cyan("✨ プロジェクトの作成が完了しました")))
  console.log()
  console.log("次のステップ:")
  console.log()
  console.log(pc.bold(`  cd ${cd}`))
  console.log()
  console.log("1. Supabase プロジェクトを準備")
  console.log("   https://supabase.com で新規プロジェクト作成")
  console.log("   Settings → API から URL と publishable key をコピー")
  console.log("   Settings → Database から connection string をコピー")
  console.log("   Authentication → Providers で Google を有効化")
  console.log()
  console.log("2. .env.local を編集して値を設定")
  console.log()
  console.log("3. 依存をインストール:  " + pc.bold("pnpm install"))
  console.log("4. DB をセットアップ:   " + pc.bold("pnpm db:migrate"))
  console.log("5. 開発サーバー起動:    " + pc.bold("pnpm dev"))
  console.log()
  console.log(pc.dim("AI に頼む例:"))
  console.log(pc.dim('  「Supabase のセットアップを手伝って」'))
  console.log(pc.dim('  「posts テーブルを追加して」'))
  console.log()
}
