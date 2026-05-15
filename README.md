# create-codenow-app

CodeNow ブートキャンプ向け Next.js + Supabase + Drizzle スターターを 1 コマンドで作成する CLI。

## 使い方

```bash
npx create-codenow-app my-app
```

対話形式でプロジェクト名を入力させたい場合は引数なしで実行:

```bash
npx create-codenow-app
```

実行すると以下を自動でセットアップ:

- スターターテンプレートの取得([cloud-position/codenow-starters](https://github.com/cloud-position/codenow-starters) の `templates/nextjs/`)
- `.env.local` を作成(値は空のまま。あとで Supabase の URL/Key を設定)
- `git init` + 初期コミット(git 未検出時はスキップ)

## 要件

- Node.js 22 以上(LTS)
- pnpm
- Git(任意。未インストール時は初期コミットをスキップ)

## ライセンス

MIT(リポジトリルートの [LICENSE](./LICENSE) 参照)
