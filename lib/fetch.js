import { spawn } from "node:child_process"

import { TEMPLATES } from "./templates.js"

export async function fetchTemplate(name, targetDir) {
  const tpl = TEMPLATES[name]
  if (!tpl) throw new Error(`未知のテンプレート: ${name}`)
  if (tpl.fetcher === "create-next-app") {
    return fetchViaCreateNextApp(tpl, targetDir)
  }
  throw new Error(`未対応の fetcher: ${tpl.fetcher}`)
}

function fetchViaCreateNextApp(tpl, targetDir) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "npx",
      [
        "create-next-app@latest",
        targetDir,
        "--example",
        tpl.repo,
        "--example-path",
        tpl.path,
        "--use-pnpm",
        "--skip-install",
      ],
      { stdio: "inherit" },
    )
    child.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`create-next-app が exit code ${code} で終了`)),
    )
    child.on("error", reject)
  })
}
