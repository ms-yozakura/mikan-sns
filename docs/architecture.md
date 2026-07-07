
# 全体設計とファイル構成

## アーキテクチャ

このドキュメントでは、MikanSNS内のNext.js部分について、の設計方針とディレクトリ構成を説明します。

---

## 設計方針

MikanSNSでは、Feature（機能）ごとにコードを分割する Feature-based Architecture を採用しています。  
具体的には、投稿関連/認証関連/ユーザー関連...など機能ごとに分割したフォルダの中に、データを扱う関数やそれらを表示するコンポーネント（部品）の設計図を置きます。  

`例`

```text
root/
├── features/
│   ├── auth/                    # 認証関連機能
│   ├── post/                    # 投稿関連機能
│   │    ...  
│   └── user/                    # ユーザー関連機能
│        ├── actions/            # ユーザー情報取得の関数など
│        ├── components/         # ユーザー情報表示用のコンポネント
│        └── types/              # ユーザー情報を扱うための型定義
...
```

メリット

- 関連するコードを1箇所にまとめられる
- ファイルの依存/参照関係がまとまるので保守性が高い
- 機能追加や機能ごとの役割分担を容易にする（チーム内での衝突を避けやすい）

---

## ディレクトリ構成

大まかなディレクトリ構成は以下の通り。  

```text
src/
├── app/                # App Router（ページ・レイアウト・ルーティング）
│
├── features/           # 機能単位（Feature）ごとの実装
│   ├── auth/           # 認証関連機能
│   ├── home/           # ホーム画面・フィード
│   ├── mikan/          # みかんの種類関連
│   ├── navigation/     # ナビゲーションバー/サイドバーについて
│   ├── post/           # 投稿関連機能
│   ├── search/         # 検索関連機能
│   ├── setting/        # 設定関連機能
│   └── user/           # ユーザー・プロフィール関連機能
│
├── img/                # 表示に必要な画像素材フォルダ
│
├── providers/          # 状態管理用のカスタムプロバイダー
│
├── infrastructure/     # 外部サービスとの通信・設定
│   └── supabase/       # Supabaseクライアント・認証・DBアクセス
│
├── shared/             # 複数Featureで共通利用するコード
│   ├── ui/             # 共通UIコンポーネント
│   ├── lib/            # 共通ユーティリティ・ヘルパー関数
│   └── types/          # 共通型定義
│ 
├── styles/             # 全体に対して適用するcss
│
└── middleware.ts       # 認証・リダイレクトなどのミドルウェア
```

なおApp Router等Nextについては[こちら](next.md)を参照  
Supabaseについては[こちら](supabase.md)を参照  

---

## 各ディレクトリの役割

### app/

Next.js [App Router](next.md)の部分  

- page.tsx
- layout.tsx
- route.ts

などルーティングを管理する。  
ここは基本ルーティングの管理設計+αにとどめ、画面固有の処理はfeaturesに移譲する。  

---

### features/

機能単位のコードを配置する。

例：features/post

- コンポーネント
- Server Actions（サーバー側の処理）
- Hooks（状態管理）
- 型定義
- Utility（各種関数）

など、ある機能に関連して必要なコードをまとめる。

---

### infrastructure/

外部サービスとの通信を担当する。

現状では
- Supabase Client
のみ。

---

### shared/

複数Featureから利用する基本コードを配置する。  
現状では/shared/uiの中に、基本部品（ボタンやローディングマーク、モーダルなど）が入れてある。  
本当はfeaturesの中にもsharedに入れるべきのが色々とあるかもだけど対応できていない()

---

## Feature構成

基本構成

features/(機能)/
- components/     画面構成部品
- actions/        サーバーアクション
- hooks/          状態管理
- papes/          コンポネントを組んだページ設計図
- utils/          関数

sharedに入れるかfeaturesに入れるべきか悩むものはfeaturesに入れておいてもいいと思っている。  
sharedがごちゃごちゃしてしまうとfeature-basedの旨味が減っていくので。


---

## コンポーネント設計

保守性と可読性、全体の統一性を守るために、基本方針としては、

- 小さく作る
- 再利用できる単位で分割する
- Propsでデータを受け渡す

というところ。  
ただこれは理想であって、実際は切り分けて再構成していくのはなかなか骨が折れる...  

ので、まあ一旦は大まかに作って、それからリファクタリングをしていく過程をたどるのでいいかなと思っている。ここは自分も積極的にやるので。

---

## 命名規則

- コンポーネント  : PascalCase  
  例: PostCard.tsx, FloatingActionButton.module.css  等


- Hook            : useXXXX  
  例：useFeed.ts, useInfiniteFeed.ts  等

- 関数や変数      : camelCase  
  例：createPost(), updateProfile(), formData  等

- 型定義          : PascalCase  
  例；State, FormData 等

- cssクラス名     : camelCase  
  例：inputTitle, previewContainer 等

- データベース上  : snake_case  
  例：created_at, user_id, mikan_varieties  等

...など  
まあほかも基本は既存のコード見て合わせてほしい...が、なるべくでいいです

---

## 今後の設計方針

今後追加予定

- Notification
- Follow
- Like
- Comment
- PWA

(あとImageUploaderとか独立の機能にしたほうが?とかそういうのも...)

追加時もFeature単位で実装しましょう


