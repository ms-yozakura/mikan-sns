
# Mikan SNS（仮）

東大みかん愛好会向けのSNS

## 概要・目的

MikanSNSは、東大みかん愛好会員同士の交流を目的としたSNSです

主な目的

- 愛好会員どうしのつながりの起点になる
- SNS形式により、気軽に記録が続けられる
- みかんの消費量を増やすことにも繋がる

---

## 技術スタック

### フロントエンド+α

- Next.js
- React
- TypeScript
- CSS Modules

### バックエンド

- [Supabase](https://supabase.com)
  - Authentication
  - PostgreSQL
  - Storage

---

## 開発用ドキュメント

開発前に以下のドキュメントを適宜確認してね
（❌️未作成🚧作成中）

- [✅️環境構築と設定](docs/setup.md)
- [✅️全体設計・ファイル構成](docs/architecture.md)
- [✅️データベースの設計と関係性](docs/database.md)
- [✅️開発ルール](docs/development.md)
- [❌️Git運用](docs/git.md)
- [❌️実装の進捗と予定](docs/roadmap.md)

初心者用
- [❌️Next.jsについて](docs/next.md)
- [❌️Supabaseについて](docs/supabase.md)
- [✅️開発のチュートリアル](/docs/dev_test.md)

---

## Quick Start

### 環境変数

`/.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 実行

```bash
npm install
npm run dev
```
