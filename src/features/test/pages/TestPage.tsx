'use client'
import styles from "./TestPage.module.css"
import { Cite } from "../components/Cite"
import { DecoratedText } from "../components/DecoratedText"

import BarChart, { BarChartItem } from "@/shared/ui/BarChart"

// 棒グラフ用サンプルデータ
const bcSampleData: BarChartItem[] = [
  { key: "cpp", label: "C++", value: 8.62, icon: "mdi:language-cpp" },
  { key: "cs", label: "C#", value: 4.09, icon: "mdi:language-csharp" },
  { key: "f90", label: "Fortran", value: 0.99, icon: "mdi:language-fortran" },
  { key: "go", label: "Go", value: 1.07, icon: "mdi:language-go" },
  { key: "hs", label: "Haskell", value: 0.28, icon: "mdi:language-haskell" },
  { key: "java", label: "Java", value: 8.25, icon: "mdi:language-java" },
  { key: "js", label: "JavaScript", value: 2.63, icon: "mdi:language-javascript" },
  { key: "kt", label: "Kotlin", value: 0.64, icon: "mdi:language-kotlin" },
  { key: "lua", label: "Lua", value: 0.50, icon: "mdi:language-lua" },
  { key: "php", label: "PHP", value: 1.11, icon: "mdi:language-php" },
  { key: "py", label: "Python", value: 18.53, icon: "mdi:language-python" },
  { key: "r", label: "R", value: 1.56, icon: "mdi:language-r" },
  { key: "rb", label: "Ruby", value: 0.98, icon: "mdi:language-ruby" },
  { key: "rs", label: "Rust", value: 1.45, icon: "mdi:language-rust" },
  { key: "swift", label: "Swift", value: 0.96, icon: "mdi:language-swift" },
  { key: "ts", label: "TypeScript", value: 0.37, icon: "mdi:language-typescript" },
];

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
      <h3>4. 棒グラフコンポーネント</h3>
      <p>`shared/ui`に作りました。縦横ふたつあります。</p>
      <BarChart
        data={bcSampleData}
        title="プログラミング言語シェア"
        maxValue={undefined} // 指定しなければ自動計算
        defaultOrientation="vertical" // 初期表示状態 (default: `vertical`)
        defaultSortOrder="default" // 初期順 (default: `default)
        defaultVisibleCount={6} // 初期表示件数（「自動」は描画領域から算出した推奨表示件数）
        showIcons={true} // アバター画像とか表示したいときはtrue
      />
      <br />
    </>
  )
}
