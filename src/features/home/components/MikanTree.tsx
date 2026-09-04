'use client'

import { useEffect, useMemo, useRef } from "react"

type Branch = {
  x: number
  y: number
  nextX: number
  nextY: number
  width: number
  depth: number
}

type Leaf = {
  x: number
  y: number
  angle: number
  scale: number
  tone: number
}

type Fruit = {
  x: number
  y: number
  scale: number
}

type TreeModel = {
  branches: Branch[]
  leaves: Leaf[]
  fruit: Fruit[]
}

type MikanTreeProps = {
  seed: string
  className?: string
}

const TREE_VERSION = 1
const LEAF_COLORS = ["#5e9e4d", "#72ad58", "#88b96c"]

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

function createTree(seed: string): TreeModel {
  const random = createRandom(hashString(`mikan-tree:v${TREE_VERSION}:${seed}`))
  const between = (min: number, max: number) => min + random() * (max - min)
  const branches: Branch[] = []
  const leaves: Leaf[] = []
  const fruit: Fruit[] = []

  function grow(
    x: number,
    y: number,
    length: number,
    angle: number,
    width: number,
    depth: number,
  ) {
    const bentAngle = angle + between(-0.12, 0.12)
    const nextX = x + Math.cos(bentAngle) * length
    const nextY = y + Math.sin(bentAngle) * length

    branches.push({ x, y, nextX, nextY, width, depth })

    if (depth >= 5 || length < 0.055) {
      const leafCount = 4 + Math.floor(between(0, 3))

      for (let index = 0; index < leafCount; index += 1) {
        leaves.push({
          x: nextX + between(-0.032, 0.032),
          y: nextY + between(-0.022, 0.022),
          angle: between(-1.25, 1.25),
          scale: between(0.78, 1.12),
          tone: Math.floor(between(0, LEAF_COLORS.length)),
        })
      }

      if (random() < 0.22) {
        fruit.push({
          x: nextX + between(-0.018, 0.018),
          y: nextY + between(0.008, 0.032),
          scale: between(0.84, 1.16),
        })
      }

      return
    }

    const nextLength = length * between(0.69, 0.78)
    grow(
      nextX,
      nextY,
      nextLength,
      angle + between(-0.1, 0.1),
      width * 0.76,
      depth + 1,
    )

    if (depth > 0 && random() < 0.82) {
      const side = random() < 0.5 ? -1 : 1
      grow(
        nextX,
        nextY,
        length * between(0.49, 0.61),
        angle + side * between(0.44, 0.68),
        width * 0.58,
        depth + 1,
      )
    }
  }

  const lean = between(-0.05, 0.05)
  grow(0.5, 0.94, 0.18, -Math.PI / 2 + lean, 0.035, 0)

  const crownY = 0.75 + between(-0.018, 0.018)
  grow(0.5, crownY, 0.2, -Math.PI / 2 - between(0.25, 0.4), 0.027, 1)
  grow(0.5, crownY, 0.2, -Math.PI / 2 + between(0.25, 0.4), 0.027, 1)

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

  const scale = Math.min(width, height)
  const x = (value: number) => value * width
  const y = (value: number) => value * height

  context.lineCap = "round"
  context.lineJoin = "round"

  for (const branch of [...tree.branches].sort((left, right) => left.depth - right.depth)) {
    context.strokeStyle = branch.depth < 2 ? "#765033" : "#85603d"
    context.lineWidth = Math.max(1.5, branch.width * scale)
    context.beginPath()
    context.moveTo(x(branch.x), y(branch.y))
    context.quadraticCurveTo(
      x((branch.x + branch.nextX) / 2 + 0.008 * Math.sin(branch.depth)),
      y((branch.y + branch.nextY) / 2),
      x(branch.nextX),
      y(branch.nextY),
    )
    context.stroke()
  }

  for (const leaf of tree.leaves) {
    context.save()
    context.translate(x(leaf.x), y(leaf.y))
    context.rotate(leaf.angle)
    context.scale(leaf.scale, leaf.scale)
    context.fillStyle = LEAF_COLORS[leaf.tone]
    context.beginPath()
       context.ellipse(0, 0, scale * 0.019, scale * 0.009, 0, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }

  for (const item of tree.fruit) {
    const radius = scale * 0.014 * item.scale
    const fruitX = x(item.x)
    const fruitY = y(item.y)

    context.fillStyle = "#f59a23"
    context.beginPath()
    context.arc(fruitX, fruitY, radius, 0, Math.PI * 2)
    context.fill()

    context.save()
    context.translate(fruitX + radius * 0.35, fruitY - radius * 0.95)
    context.rotate(-0.45)
    context.fillStyle = "#3f873c"
    context.beginPath()
    context.ellipse(0, 0, radius * 0.55, radius * 0.24, 0, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }

  context.fillStyle = "#8f623e"
  context.beginPath()
  context.ellipse(width * 0.5, height * 0.945, width * 0.2, height * 0.018, 0, 0, Math.PI * 2)
  context.fill()
}

export function MikanTree({ seed, className }: MikanTreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tree = useMemo(() => createTree(seed), [seed])

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
    />
  )
}
