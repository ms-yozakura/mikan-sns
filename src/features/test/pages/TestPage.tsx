'use client'
import styles from "./TestPage.module.css"
import { Cite } from "../components/Cite"
import { DecoratedText } from "../components/DecoratedText"

export function TestPage() {

  return (
    <>
      <h2>tsxについて</h2>
      <section>
        <div>
          {"<div>"}や{"<p>"}、{"<h1>"}などの標準HTMLタグはtsx(jsx)でも同様に使えます。
        </div>
        <p>
          HTMLは楽しいよ
        </p>
      </section>

      <h2>テスト用コンポネントたち</h2>
      <p>
        標準のHTML要素で作れるデザインには限りがあります。そこでタグを自作しようというのがコンポネントの思想です。<br />
        以下にこのTestPage用につくったコンポネント例を載せています。
      </p>
      <h3>1. 引用コンポネント</h3>
      <div>
        test/components/Cite.tsx内に記述されているコンポネント。<br />
        <br />
        tsxファイル自体は単純だが、重要なのは<br />
        <Cite>import styles from "./Cite.module.css"</Cite>
        の部分。このスタイルシートで背景のグレーや先頭の縦線などのスタイルを記述していることを確認しましょう
      </div>
      <Cite>
        これは引用コンポネント<br />
        一度コンポネントを記述すれば何度も同じようなUI部品を使えて便利
      </Cite>
      <br />
      <h3>2. 文字スタイリングコンポネント</h3>
      <DecoratedText text="これは_斜体_や*太字*や%ハイライト%を使えるコンポネント" />
      こちらはtest / components / DecoratedText.tsx内で定義されています。<br />
      TypeScriptで文字列をこう...こねくり回してreturn()で出力してます。<br />
      中身はどうでもいいですが、ともかくtsx内で処理と描画（部品の作成）を両方行っている構造が伝わればと思います。
      <br />
      <br />
      <div>以上だよ</div>
      <br />
    </>
  )
}
