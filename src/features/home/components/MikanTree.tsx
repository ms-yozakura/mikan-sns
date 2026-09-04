'use client'

import { useEffect, useMemo, useRef } from "react"

type Branch = {
  x: number
  y: number
  nextX: number
  nextY: number
  width: number
}

type Leaf = {
  x: number
  y: number
  angle: number
  size: number
  tone: number
}

type Fruit = {
  x: number
  y: number
}

type TreeModel = {
  branches: Branch[]
  leaves: Leaf[]
  fruit: Fruit[]
}

export type MikanTreePreset = "classic" | "wide" | "upright" | "dense"

type MikanTreeProps = {
  seed: string
  className?: string
  preset?: MikanTreePreset
}

type PresetConfig = {
  trunkLean: number
  sideBranchChance: number
  leftAngleScale: number
  rightAngleScale: number
  lengthScale: number
}

const TREE_VERSION = 2
const LEAF_COLORS = ["#5e9e4d", "#72ad58", "#88b96c"]

// classic は添付された tree.html の値そのまま。
// 他 preset は乱数アルゴリズムを変えず、範囲だけ少し操作する。
const PRESETS: Record<MikanTreePreset, PresetConfig> = {
  classic: {
    trunkLean: 1,
    sideBranchChance: 0.7,
    leftAngleScale: 1,
    rightAngleScale: 1,
    lengthScale: 1,
  },
  wide: {
    trunkLean: 1,
    sideBranchChance: 0.72,
    leftAngleScale: 1.18,
    rightAngleScale: 1.18,
    lengthScale: 1.03,
  },
  upright: {
    trunkLean: 0.55,
    sideBranchChance: 0.68,
    leftAngleScale: 0.78,
    rightAngleScale: 0.78,
    lengthScale: 1,
  },
  dense: {
    trunkLean: 1,
    sideBranchChance: 0.82,
    leftAngleScale: 1,
    rightAngleScale: 1,
    lengthScale: 0.98,
  },
}

function hashString(value: string) {
  let hash = 2166136261 >>> 0

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function createRandom(seed: number) {
  let state = seed

  return () => {
    let value = state += 0x6D2B79F5
    value = Math.imul(value ^ value >>> 15, value | 1)
    value ^= value + Math.imul(value ^ value >>> 7, value | 61)
    return ((value ^ value >>> 14) >>> 0) / 4294967296
  }
}

function createTree(seed: string, preset: MikanTreePreset): TreeModel {
  const config = PRESETS[preset]
  const random = createRandom(hashString(`mikan-tree:v${TREE_VERSION}:${preset}:${seed}`))
  const between = (min: number, max: number) => min + random() * (max - min)

  const branches: Branch[] = []
  const leaves: Leaf[] = []
  const fruit: Fruit[] = []

  // 元 tree.html の branch() をほぼそのまま移植。
  function branch(x: number, y: number, len: number, angle: number, thick: number) {
    if (len < 8) {
      if (random() < 0.6) {
        leaves.push({
          x,
          y,
          angle: random() * Math.PI * 2,
          size: between(5, 10),
          tone: Math.floor(between(0, LEAF_COLORS.length)),
        })
      }

      // 元コードの mode > 0.6 時の実付き。ホームでは常に成熟木として扱う。
      if (random() < 0.08) {
        fruit.push({ x, y })
      }
      return
    }

    const nextX = x + Math.cos(angle) * len
    const nextY = y + Math.sin(angle) * len

    branches.push({ x, y, nextX, nextY, width: thick })

    // メイン枝
    branch(
      nextX,
      nextY,
      len * between(0.7, 0.85) * config.lengthScale,
      angle + between(-0.4, 0.4),
      thick * 0.85,
    )

    // 左右の横枝。元コード同様、それぞれ独立に70%で生成。
    if (random() < config.sideBranchChance) {
      branch(
        nextX,
        nextY,
        len * between(0.4, 0.6) * config.lengthScale,
        angle + between(-0.8, -0.3) * config.leftAngleScale,
        thick * 0.6,
      )
    }

    if (random() < config.sideBranchChance) {
      branch(
        nextX,
        nextY,
        len * between(0.4, 0.6) * config.lengthScale,
        angle + between(0.3, 0.8) * config.rightAngleScale,
        thick * 0.6,
      )
    }
  }

  // 元 tree.html の draw() と同じ6節の幹。
  let x = 0
  let y = 0
  const angle = -Math.PI / 2 + between(-0.05, 0.05) * config.trunkLean

  for (let index = 0; index < 6; index += 1) {
    const nextX = x + Math.cos(angle) * 15
    const nextY = y + Math.sin(angle) * 15

    // 元は 12 - i。前回の要望を反映して根元側のみ少し太くする。
    const originalWidth = 12 - index
    const widthScale = index < 2 ? 1.18 : 1
    branches.push({ x, y, nextX, nextY, width: originalWidth * widthScale })

    if (index > 2) {
      branch(nextX, nextY, between(60, 70), angle + between(-0.4, -0.1), 5)
      branch(nextX, nextY, between(60, 70), angle + between(0.1, 0.4), 5)
    }

    x = nextX
    y = nextY
  }

  return { branches, leaves, fruit }
}

function drawTree(canvas: HTMLCanvasElement, tree: TreeModel) {
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  if (width === 0 || height === 0) return

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(width * pixelRatio)
  canvas.height = Math.round(height * pixelRatio)

  const context = canvas.getContext("2d")
  if (!context) return

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  context.clearRect(0, 0, width, height)
  context.lineCap = "round"
  context.lineJoin = "round"

  const points = tree.branches.flatMap((item) => [
    { x: item.x, y: item.y },
    { x: item.nextX, y: item.nextY },
  ])

  for (const leaf of tree.leaves) points.push({ x: leaf.x, y: leaf.y })
  for (const item of tree.fruit) points.push({ x: item.x, y: item.y })

  const minX = Math.min(...points.map((point) => point.x))
  const maxX = Math.max(...points.map((point) => point.x))
  const minY = Math.min(...points.map((point) => point.y))
  const maxY = Math.max(...points.map((point) => point.y))

  const maxHorizontalReach = Math.max(1, Math.abs(minX), Math.abs(maxX))
  const treeHeight = Math.max(1, maxY - minY)
  const drawingScale = Math.min(
    (width * 0.47) / maxHorizontalReach,
    (height * 0.88) / treeHeight,
  )

  const bottomY = maxY
  // 根元 x=0 を必ず画面中央に固定する。
  const screenX = (value: number) => width / 2 + value * drawingScale
  const screenY = (value: number) => height * 0.94 + (value - bottomY) * drawingScale

  // 根元の影。木より先に描くことで必ず背面に置く。
  context.save()
  context.filter = "blur(7px)"
  context.fillStyle = "rgb(91 58 31 / 14%)"
  context.beginPath()
  context.ellipse(
    width / 2,
    height * 0.943,
    width * 0.145,
    Math.max(4, height * 0.011),
    0,
    0,
    Math.PI * 2,
  )
  context.fill()
  context.restore()

  for (const item of tree.branches) {
    context.strokeStyle = item.width >= 7 ? "#765033" : "#85603d"
    context.lineWidth = Math.max(1.2, item.width * drawingScale)
    context.beginPath()
    context.moveTo(screenX(item.x), screenY(item.y))
    context.lineTo(screenX(item.nextX), screenY(item.nextY))
    context.stroke()
  }

  // 元 tree.html の leaf() と同じ2円弧の葉。
  for (const leaf of tree.leaves) {
    context.save()
    context.translate(screenX(leaf.x), screenY(leaf.y))
    context.rotate(leaf.angle)
    context.fillStyle = LEAF_COLORS[leaf.tone]

    const size = leaf.size * drawingScale
    context.beginPath()
    context.arc(
      size * Math.cos(Math.PI / 4),
      -size * Math.sin(Math.PI / 4),
      size,
      Math.PI / 4,
      Math.PI / 2,
    )
    context.arc(
      size * Math.cos(Math.PI / 4),
      size * Math.sin(Math.PI / 4),
      size,
      5 * Math.PI / 4,
      3 * Math.PI / 2,
    )
    context.fill()
    context.restore()
  }

  for (const item of tree.fruit) {
    context.fillStyle = "#f59a23"
    context.beginPath()
    context.arc(screenX(item.x), screenY(item.y), 5 * drawingScale, 0, Math.PI * 2)
    context.fill()
  }
}

export function MikanTree({ seed, className, preset = "classic" }: MikanTreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tree = useMemo(() => createTree(seed, preset), [seed, preset])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const render = () => drawTree(canvas, tree)
    const observer = new ResizeObserver(render)

    observer.observe(canvas)
    render()

    return () => observer.disconnect()
  }, [tree])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="あなた固有のみかんの木"
      data-tree-version={TREE_VERSION}
      data-tree-preset={preset}
    />
  )
}
