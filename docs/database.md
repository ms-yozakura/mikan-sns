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
