# データベース設計

> 🚧 このドキュメントは現在更新中です。
> データベース設計は開発と並行して改善しています。

## 現在存在するテーブル

- (auth.users)      ：authenticationに付属のユーザー情報テーブル

以下database上のテーブル(public.XXX)

- users              ：ユーザーの公開情報。public.authとつながる。
- profiles           ：ユーザーの非公開プロフ（公開/非公開の意味については後述）

- posts              ：投稿
- post_mikans        ：投稿に付属するみかん記録
- post_images        ：投稿に付属する画像

- comments           ：投稿へのコメント

- mikan_varieties    ：みかんの種類と情報

## 今後追加予定

- likes              ：投稿へのリアクション
- follows            ：フォロー関係
- notifications      ：通知
など

---

## 構造

### users

ユーザーの基本情報

| Column | Type | Description |
|---------|------|-------------|
| id | UUID | ユーザーID（Primary Key） |
| created_at | timestamptz | 作成日時 |
| username | text | ユーザー名（Unique） |
| display_name | text | 表示名 |
| avatar_url | text | アイコン画像URL |

#### Relations

- 1 : N → posts
- 1 : 1 → profiles

---

### profiles

ユーザープロフィール

| Column | Type | Description |
| --------- | ------ | ------------- |
| id | UUID | プロフィールID（Primary Key） |
| created_at | timestamptz | 作成日時 |
| user_id | UUID | users.id（Unique） |
| bio | text | 自己紹介 |
| region | text | 地域 |
| generation | smallint | 世代 |

#### Relations

- N : 1 → users

---

### posts

投稿

| Column | Type | Description |
| --------- | ------ | ------------- |
| id | UUID | 投稿ID（Primary Key） |
| created_at | timestamptz | 投稿日時 |
| body | text | 投稿本文 |
| user_id | UUID | 投稿者ID |
| visibility | text | 投稿の表示範囲(public/private) |

#### Relations

- N : 1 → users
- 1 : N → comments
- 1 : N → post_images
- 1 : N → post_mikans

---

### comments

コメント

| Column | Type | Description |
| --------- | ------ | ------------- |
| id | UUID | コメントID（Primary Key） |
| created_at | timestamptz | 作成日時 |
| user_id | uuid | 投稿者ID |
| body | text | コメント本文 |
| post_id | UUID | 投稿ID |

#### Relations

- N : 1 → posts
- N : 1 → users

---

### post_images

投稿画像

| Column | Type | Description |
| --------- | ------ | ------------- |
| id | UUID | 画像ID（Primary Key） |
| created_at | timestamptz | 作成日時 |
| post_id | UUID | 投稿ID |
| order_index | integer | 表示順 |
| url | text | 元画像URL |
| thumbnail_url | text | サムネイルURL |

#### Relations

- N : 1 → posts

---

### mikan_varieties

みかん品種マスタ

| Column | Type | Description |
| --------- | ------ | ------------- |
| id | UUID | 品種ID（Primary Key） |
| created_at | timestamptz | 作成日時 |
| name | text | 品種名 |
| color | text | 表示色 |
| shape | text | アイコン形状 |

#### Relations

- 1 : N → post_mikans

---

### post_mikans

投稿に含まれるみかん情報

| Column | Type | Description |
| --------- | ------ | ------------- |
| id | UUID | ID（Primary Key） |
| created_at | timestamptz | 作成日時 |
| post_id | UUID | 投稿ID |
| variety_id | UUID | 品種ID |
| quantity | smallint | 食べた個数 |
| satisfaction | smallint | 満足度（1〜5想定） |

#### Relations

- N : 1 → posts
- N : 1 → mikan_varieties

---

### follows

| Column | Type | Description |
| ----- | ---- | ------- |
| id | uuid | ID(Primary Key) |
| follower | uuid | フォローした人のID |
| followee | uuis | フォローされた人のID |
| created_at | timestamptz | 作成日時 |

#### Relations

- N : 1 → users (follower)
- N : 1 → users (followee)

---

### post_likes

| Column | Type | Description |
| ----- | ---- | ------- |
| id | uuid | ID(Primary Key) |
| user_id | uuid | いいねした人のID |
| post_id | uuid | いいねされた投稿のID |
| created_at | timestamptz | 作成日時 |

#### Relations

- N : 1 → users
- N : 1 → posts

---

### notifications

ユーザーへの通知

| Column | Type | Description |
| --------- | ------ | ------------- |
| id | UUID | 通知ID（Primary Key） |
| created_at | timestamptz | 作成日時 |
| user_id | UUID | 通知の受信者 |
| actor_id | UUID | 通知を発生させたユーザー |
| type | text | 通知種別（follow, like, comment, reply など） |
| post_id | UUID / null | 関連する投稿ID |
| comment_id | UUID / null | 関連するコメントID |
| is_read | boolean | 既読フラグ |

#### Relations

- N : 1 → users（user_id）
- N : 1 → users（actor_id）
- N : 1 → posts
- N : 1 → comments

--- 

## ERイメージ

```
users
 ├── profiles (1:1)
 └── posts (1:N)
         ├── comments (1:N)
         ├── post_images (1:N)
         └── post_mikans (1:N)
                    │
                    ▼
            mikan_varieties
```
