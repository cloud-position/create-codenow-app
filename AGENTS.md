# create-codenow-app — AI 規約

CodeNow ブートキャンプ向けスターターを 1 コマンドで取得する CLI。
AI(Claude Code 等)がコードを書くときの**絶対ルール**。

**応答は常に日本語**で行うこと。

---

## 技術スタック(固定・勝手に変更しない)

- **TypeScript**(strict / ESM `"type": "module"`)
- **Node.js 24 LTS 最低**(`engines.node: ">=24.0.0"`)
- **ビルド**: `tsup`(esbuild ベース・shebang 保持)
- **配布**: `dist/index.js` のみ npm publish(TS ソースは含めない)
- **依存**: `picocolors` のみ — **増やさない**

**入れてはいけないもの:**
- 別のビルドツール(esbuild 直、webpack、rollup 等)
- 別のプロンプトライブラリ(`inquirer` / `prompts` 等)→ 標準 `readline/promises` を使う
- 別のカラーライブラリ(`chalk` / `kleur` 等)→ picocolors のみ
- 別のテストランナー(`jest` / `vitest` 等)→ 標準 `node:test` を使う

---

## 構造

```
create-codenow-app/
├── src/
│   ├── index.ts            # main(Node バージョン確認 → 入力 → fetch → postInit)
│   └── lib/
│       ├── templates.ts    # TEMPLATES 定数 + 型定義
│       ├── fetch.ts        # fetchTemplate(name, dir) 抽象レイヤー
│       ├── prompt.ts       # resolveProjectName(argv)
│       └── postinit.ts     # .env.local コピー + git 初期化判定 + 完了メッセージ
├── dist/                   # tsup 出力(gitignore)
├── .github/workflows/
│   ├── ci.yml              # PR/push: typecheck + build + pack
│   └── release.yml         # v* タグで OIDC + provenance publish
├── tsconfig.json
├── tsup.config.ts
├── package.json
└── renovate.json
```

---

## 設計方針

- **シンプル**: 受講生コマンドは `npx create-codenow-app my-app` だけ
- **取得は抽象化**: `fetchTemplate(name, dir)` の中で fetcher を分岐
  - 現状: `nextjs` → `create-next-app --example --example-path templates/nextjs`
  - 将来: degit 等に切替(v1.0 で TanStack / React Native 追加時)
- **副作用最小**: `create-next-app` が既に `git init` + 初期コミットを作るため、`postinit.ts` は **既にコミット済みなら skip**
- **エラーは整形して表示**: スタックトレースは出さず `pc.red("エラー: ") + err.message` のみ
- **ロールバック**: 失敗時に作成中ディレクトリを `rm -r`

---

## 新テンプレートを追加する手順

`cloud-position/codenow-starters/templates/<name>/` を準備した上で:

1. `src/lib/templates.ts` に追記
   ```ts
   export type TemplateName = "nextjs" | "<name>"
   export const TEMPLATES: Record<TemplateName, TemplateConfig> = {
     nextjs: { ..., fetcher: "create-next-app" },
     "<name>": { repo, path: "templates/<name>", fetcher: "degit" },
   }
   ```
2. fetcher が新規なら `src/lib/fetch.ts` に分岐を追加
3. 動作確認: tmp で `node dist/index.js test-app`(規約ファイル同梱・git 初期化を確認)
4. `npm version minor`(0.1.x → 0.2.0)→ `git push origin main --tags`

---

## リリース手順(自動化済み)

```bash
npm version patch   # 例: 0.1.0 → 0.1.1
git push origin main --tags
```

→ GitHub Actions `release.yml` 起動 → OIDC + `--provenance` で **自動 publish**(npm token 不要・SLSA 来歴付き)。

ローカルから手動 publish はしない(初回 publish 後は OIDC 一本化)。

---

## 触ってはいけないもの

- `.github/workflows/*.yml` の **SHA pinning**(`@<40桁SHA>` を `@v4` のようなタグに戻さない)
- `tsup.config.ts` の `banner: { js: "#!/usr/bin/env node" }`(shebang 保持に必須)
- `renovate.json` の `minimumReleaseAge: "2 days"`(0day 対策)
- `package.json` の `bin` パス: **`dist/index.js`**(`./` を付けない / npm に弾かれる)
- `package.json` の `files`: `dist` / `README.md` / `LICENSE` のみ

---

## エラーハンドリング規約

- `try/catch` で予期しないエラーをキャッチ
- `pc.red("エラー: ") + err.message` で日本語整形(スタックトレース非表示)
- 作成中ディレクトリは catch 内で `rm -r` ロールバック(`--keep-on-error` のような後段オプションは不要)
- ユーザー入力(プロジェクト名)の検証エラーも同じ整形を通す

---

## セキュリティ規約

- `spawn(cmd, args)` で外部コマンドを呼ぶ時:
  - ユーザー入力は **必ず引数配列**(`spawn("npx", [cmd, name])`)
  - **`shell: true` を使わない**(コマンドインジェクション防止)
- `publish` は OIDC のみ。npm token を GitHub Secrets に入れない
- `prepublishOnly` で必ず `tsup` ビルドが走る → 古い dist を publish しない

---

## GitHub 側のセキュリティ設定(維持)

- main 直 push は CI 通過必須(Branch protection)
- v\* タグは削除/上書き禁止(publish 後の改竄防止)
- Push Protection: 秘密情報を含む push を自動拒否
- CodeQL: コード脆弱性スキャン
- Renovate: 依存自動更新(2 日遅延 + security 即時)
