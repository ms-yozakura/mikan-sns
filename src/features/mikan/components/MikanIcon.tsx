type Props = {
  color?: string
  shape?: "normal" | "round" | "flat" | "egg" | "deko" | "unknown"
  size?: number
}

export function MikanIcon({
  color = "#ff9800",
  shape = "normal",
  size = 32,
}: Props) {
  const fruit = (() => {
    switch (shape) {
      case "round":
        return <ellipse cx="30" cy="35" rx="19" ry="19" fill={color} />

      case "flat":
        return <ellipse cx="30" cy="35" rx="20" ry="15" fill={color} />

      case "egg":
        return <ellipse cx="30" cy="35" rx="17" ry="20" fill={color} />

      case "deko":
        return (
          <>
            <ellipse cx="30" cy="18" rx="7" ry="7" fill={color} />
            <ellipse cx="30" cy="33" rx="20" ry="18" fill={color} />
          </>
        )

      default:
        return <ellipse cx="30" cy="35" rx="20" ry="17" fill={color} />
    }
  })()

  return (
    <svg
      width={size}
      height={size}
      viewBox="3 5 57 59"
      xmlns="http://www.w3.org/2000/svg"
    >
      {fruit}

      <path
        d="M30 21 Q35 13 45 18 Q38 23 30 21"
        fill="green"
      />

      <path
        d="M30 23 L30 17"
        stroke="green"
        strokeWidth="1"
      />

      {shape === "unknown" && (
        <text
          x="30"
          y="45"
          textAnchor="middle"
          fontSize="22"
          fontWeight="bold"
          fill="white"
        >
          ?
        </text>
      )}
    </svg>
  )
}
