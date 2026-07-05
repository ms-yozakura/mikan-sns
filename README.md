
# Mikan SNS（仮）

東京大学みかん愛好会向けのSNS

## 概要・目的

・愛好会員どうしのつながりの起点になる
・SNS形式により、気軽に記録が続けられる
・みかんの消費量を増やすことにも繋がる

---

## 技術スタック

### Frontend+

- Next.js
- React
- TypeScript
- CSS Modules

### Backend

- Supabase
  - Authentication
  - PostgreSQL
  - Storage

### その他

- Git / GitHub

---

## 現在実装済み

### 認証
Auth: Supabase Authentication
DB: public.users

- ユーザー登録
- ログイン
- ログアウト

### ユーザー
DB: public.users, public.profiles

- ユーザーID（users.username）重複チェック
- バリデーション
- ユーザー情報・プロフィール取得
- プロフィール変更

### 投稿

- 投稿作成
- 投稿取得
- 投稿カード表示

### フィード

- 投稿一覧取得
- 無限フィード実装

### 検索

- 投稿検索
- ユーザーネーム・ユーザーID検索

### 統計

- 統計カード/カラム表示（/home）

### UI

- ローディング表示
- 投稿フォーム
- コンポーネント分割
- Featureベースのディレクトリ構成

---

## 今後実装予定

### 投稿

- 削除
- 画像投稿

### リアクション

- いいね
- コメント
- リポスト

### ユーザー

- プロフィール編集
- アイコン画像
- フォロー機能

### 検索

- ユーザー検索
- 投稿検索
- タグ検索

### 通知

- いいね通知
- コメント通知
- フォロー通知

### その他

- Infinite Scroll
- ダークモード
- モバイル対応
- PWA対応

---

## ディレクトリ構成

```
src/
├── app/
├── features/
│   ├── auth/
│   ├── home/
│   ├── post/
│   └── user/
├── infrastructure/
│   └── supabase/
├── shared/
│   ├── ui/
│   ├── lib/
│   └── types/
└── middleware.ts
```

---

## 開発


### 環境変数

`.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 実行

```bash
npm run dev
```

