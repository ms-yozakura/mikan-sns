# 環境構築

## 必要なもの

開発を始める前に以下をインストール

- Git
- Node.js（Next.jsを使うのに必要。LTS版推奨）
- npm（Node.jsに付属）
- お好みのコードエディタ(VSCodeなど)

また、管理者に言ってGitHub共同編集者に招待してもらってください。
怪しい人は通さないよ。

---

## リポジトリを取得

GitHubからリポジトリをCloneする
以下のコマンドを順に実行するとではホームディレクトリ以下の
    ~/Developer/mikan-sns
内にコード群がダウンロードされます

```bash
mkdir ~/Developer && cd Developer 
git clone https://github.com/ms-yozakura/mikan-sns.git
cd mikan-sns
```

---

## パッケージをインストール
nodeパッケージをダウンロードする。
これによって今回のアプリを作るのに必要な外部ライブラリ等のコード群を取得します。

```bash
npm install
```

---

## Supabaseの設定

以下のコマンドで、プロジェクトルート(~/Developer/mikan-sns 内)に `.env.local` を作成

```bash
cd ~/Developer/mikan-sns
touch .env.local
```

このファイル内に環境変数を書き込む。
これはSupabaseへの接続に必要な ①Supabaseの住所 と ②秘密の暗号 になります。

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

値は管理者から共有されたものを使用すること
怪しい人には渡さないよ。

---

## 開発サーバーを起動

以下のコマンドを実行すると、開発用のPC上サーバーが起動します。

```bash
npm run dev
```

その後ブラウザで

[http://localhost:3000](http://localhost:3000)

へアクセスすると起動できます。
（3001番とかになってる時もあるのでターミナルの出力ををよく見ましょう）

---

## よく使うコマンド

### 開発サーバー起動

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

---

## トラブルシューティング

### node_modulesがおかしい

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

---

### .env.local を変更した

開発サーバーを再起動する

---

### Supabaseに接続できない

以下を確認

- `.env.local` が存在するか
- URL・Publishable Keyが正しいか
- 管理者がなにか間違いをしていないか？（糾弾しましょう）


