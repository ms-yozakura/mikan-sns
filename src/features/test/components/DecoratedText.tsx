
import styles from"./DecoratedText.module.css"

type Props = {
  text: string
}

export function DecoratedText({ text }: Props) {

  const nodes: React.ReactNode[] = []

  const regex = /(\*[^*]+\*|_[^_]+_|%[^%]+%)/g // *xx*や_xx_や%xx%を探す正規表現
  let lastIndex = 0
  let key = 0

  for (const match of text.matchAll(regex)) {
    const index = match.index!

    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index))
    }

    const token = match[0]

    if (token.startsWith("*")) {
      nodes.push(
        <strong key={key++}>
          {token.slice(1, -1)}
        </strong>
      )
    } else if (token.startsWith("_")) {
      nodes.push(
        <em key={key++}>
          {token.slice(1, -1)}
        </em>
      )
    }else if(token.startsWith("%")){
      nodes.push(
        <span key={key++} className={styles.highlight}>
          {token.slice(1,-1)}
        </span>
      )
    }

    lastIndex = index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return <div className={styles.textWrapper}>{nodes}</div>
}
