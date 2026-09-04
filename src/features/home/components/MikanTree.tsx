'use client'

import { useEffect, useMemo, useRef } from "react"

type Branch = {
  x: number
  y: number
  nextX: number
  nextY: number
  width: number
  length: number
  baseAngle: number
  relativeAngle: number
  parentIndex: number | null
  depth: number
  windPhase: number
}

type Leaf = {
  x: number
  y: number
  angle: number
  size: number
  tone: number
  parentBranchIndex: number
  windPhase: number
}

type Fruit = {
  x: number
  y: number
  parentBranchIndex: number
}

type TreeBounds = {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

type TreeModel = {
  branches: Branch[]
  leaves: Leaf[]
  fruit: Fruit[]
  bounds: TreeBounds
  windPhase: number
}

type BranchPose = {
  x: number
  y: number
  nextX: number
  nextY: number
  angle: number
}

type WindState = {
  envelope: number
  sway: number
  strength: number
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
const TARGET_FRAME_INTERVAL = 1000 / 30
const GUST_CYCLE_SECONDS = 8.5
const GUST_CENTER_SECONDS = 2.8
const GUST_WIDTH_SECONDS = 0.95

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

function phaseFromString(value: string) {
  return (hashString(value) / 4294967296) * Math.PI * 2
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

function relativeAngle(angle: number, parentAngle: number) {
  const difference = angle - parentAngle
  return Math.atan2(Math.sin(difference), Math.cos(difference))
}

function createTree(seed: string, preset: MikanTreePreset): TreeModel {
  const config = PRESETS[preset]
  const random = createRandom(hashString(`mikan-tree:v${TREE_VERSION}:${preset}:${seed}`))
  const between = (min: number, max: number) => min + random() * (max - min)

  const branches: Branch[] = []
  const leaves: Leaf[] = []
  const fruit: Fruit[] = []

  function addBranch({
    x,
    y,
    nextX,
    nextY,
    width,
    angle,
    parentIndex,
  }: {
    x: number
    y: number
    nextX: number
    nextY: number
    width: number
    angle: number
    parentIndex: number | null
  }) {
    const branchIndex = branches.length
    const parent = parentIndex === null ? null : branches[parentIndex]

    branches.push({
      x,
      y,
      nextX,
      nextY,
      width,
      length: Math.hypot(nextX - x, nextY - y),
      baseAngle: angle,
      relativeAngle: parent ? relativeAngle(angle, parent.baseAngle) : angle,
      parentIndex,
      depth: parent ? parent.depth + 1 : 0,
      windPhase: phaseFromString(`mikan-tree-wind:${seed}:branch:${branchIndex}`),
    })

    return branchIndex
  }

  // 元 tree.html の branch() をほぼそのまま移植。
  // parentIndex を追加し、描画時に根元から枝先へ変形を伝播できるようにしている。
  function branch(
    x: number,
    y: number,
    len: number,
    angle: number,
    thick: number,
    parentIndex: number,
  ) {
    if (len < 8) {
      if (random() < 0.6) {
        const leafIndex = leaves.length
        leaves.push({
          x,
          y,
          angle: random() * Math.PI * 2,
          size: between(5, 10),
          tone: Math.floor(between(0, LEAF_COLORS.length)),
          parentBranchIndex: parentIndex,
          windPhase: phaseFromString(`mikan-tree-wind:${seed}:leaf:${leafIndex}`),
        })
      }

      // 元コードの mode > 0.6 時の実付き。ホームでは常に成熟木として扱う。
      if (random() < 0.08) {
        fruit.push({ x, y, parentBranchIndex: parentIndex })
      }
      return
    }

    const nextX = x + Math.cos(angle) * len
    const nextY = y + Math.sin(angle) * len
    const branchIndex = addBranch({
      x,
      y,
      nextX,
      nextY,
      width: thick,
      angle,
      parentIndex,
    })

    // メイン枝
    branch(
      nextX,
      nextY,
      len * between(0.7, 0.85) * config.lengthScale,
      angle + between(-0.4, 0.4),
      thick * 0.85,
      branchIndex,
    )

    // 左右の横枝。元コード同様、それぞれ独立に70%で生成。
    if (random() < config.sideBranchChance) {
      branch(
        nextX,
        nextY,
        len * between(0.4, 0.6) * config.lengthScale,
        angle + between(-0.8, -0.3) * config.leftAngleScale,
        thick * 0.6,
        branchIndex,
      )
    }

    if (random() < config.sideBranchChance) {
      branch(
        nextX,
        nextY,
        len * between(0.4, 0.6) * config.lengthScale,
        angle + between(0.3, 0.8) * config.rightAngleScale,
        thick * 0.6,
        branchIndex,
      )
    }
  }

  // 元 tree.html の draw() と同じ6節の幹。
  let x = 0
  let y = 0
  let trunkParentIndex: number | null = null
  const angle = -Math.PI / 2 + between(-0.05, 0.05) * config.trunkLean

  for (let index = 0; index < 6; index += 1) {
    const nextX = x + Math.cos(angle) * 15
    const nextY = y + Math.sin(angle) * 15

    // 元は 12 - i。前回の要望を反映して根元側のみ少し太くする。
    const originalWidth = 12 - index
    const widthScale = index < 2 ? 1.18 : 1
    const trunkIndex = addBranch({
      x,
      y,
      nextX,
      nextY,
      width: originalWidth * widthScale,
      angle,
      parentIndex: trunkParentIndex,
    })

    if (index > 2) {
      branch(
        nextX,
        nextY,
        between(60, 70),
        angle + between(-0.4, -0.1),
        5,
        trunkIndex,
      )
      branch(
        nextX,
        nextY,
        between(60, 70),
        angle + between(0.1, 0.4),
        5,
        trunkIndex,
      )
    }

    x = nextX
    y = nextY
    trunkParentIndex = trunkIndex
  }

  const points = branches.flatMap((item) => [
    { x: item.x, y: item.y },
    { x: item.nextX, y: item.nextY },
  ])

  for (const leaf of leaves) points.push({ x: leaf.x, y: leaf.y })
  for (const item of fruit) points.push({ x: item.x, y: item.y })

  const bounds = {
    minX: Math.min(...points.map((point) => point.x)),
    maxX: Math.max(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
    maxY: Math.max(...points.map((point) => point.y)),
  }

  return {
    branches,
    leaves,
    fruit,
    bounds,
    windPhase: phaseFromString(`mikan-tree-wind:${seed}:tree`),
  }
}

function getWindState(timeMs: number, treePhase: number): WindState {
  const time = timeMs / 1000
  const rampProgress = Math.min(1, Math.max(0, timeMs / 700))
  const ramp = rampProgress * rampProgress * (3 - 2 * rampProgress)

  // 起動後およそ3秒で一度目の「わさっ」が来て、その後は約8.5秒周期。
  // 待機モーションとして気づけることを優先し、木ごとのphaseは揺れ方にだけ使う。
  const cycleTime = time % GUST_CYCLE_SECONDS
  const gustDistance = (cycleTime - GUST_CENTER_SECONDS) / GUST_WIDTH_SECONDS
  const gust = Math.exp(-gustDistance * gustDistance * 2.15) * ramp
  const sway =
    Math.sin(time * 0.78 + treePhase) * 0.7
    + Math.sin(time * 1.31 + treePhase * 0.61) * 0.3

  return {
    envelope: gust,
    sway,
    strength: gust * sway,
  }
}

function getBranchFlexibility(branch: Branch) {
  // 木そのものは主役のアイドルポーズを保つ。枝先だけごく微小に呼吸する程度。
  const widthFlex = Math.min(1, Math.max(0, (6 - branch.width) / 6))
  const depthFlex = Math.min(1, Math.max(0, (branch.depth - 3) / 10))
  const tipFlex = widthFlex * 0.68 + depthFlex * 0.32

  return 0.00003 + tipFlex * 0.00055
}

function createBranchPoses(tree: TreeModel, timeMs: number, wind: WindState) {
  const time = timeMs / 1000
  const poses = new Array<BranchPose>(tree.branches.length)

  for (let index = 0; index < tree.branches.length; index += 1) {
    const branch = tree.branches[index]
    const parentPose = branch.parentIndex === null ? null : poses[branch.parentIndex]
    const startX = parentPose ? parentPose.nextX : branch.x
    const startY = parentPose ? parentPose.nextY : branch.y
    const baseWorldAngle = parentPose
      ? parentPose.angle + branch.relativeAngle
      : branch.baseAngle

    const delayedSway =
      Math.sin(time * 0.78 + tree.windPhase - branch.depth * 0.055) * 0.78
      + Math.sin(time * 1.31 + tree.windPhase * 0.63 - branch.depth * 0.025) * 0.22
    const localFlutter = Math.sin(time * 1.7 + branch.windPhase) * 0.12
    const windOffset =
      (delayedSway + localFlutter)
      * (0.22 + wind.envelope * 0.78)
      * getBranchFlexibility(branch)
      * Math.min(1, Math.max(0, timeMs / 700))

    const angle = baseWorldAngle + windOffset
    const nextX = startX + Math.cos(angle) * branch.length
    const nextY = startY + Math.sin(angle) * branch.length

    poses[index] = {
      x: startX,
      y: startY,
      nextX,
      nextY,
      angle,
    }
  }

  return poses
}

function drawTree(canvas: HTMLCanvasElement, tree: TreeModel, timeMs: number) {
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  if (width === 0 || height === 0) return

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  const nextCanvasWidth = Math.round(width * pixelRatio)
  const nextCanvasHeight = Math.round(height * pixelRatio)

  if (canvas.width !== nextCanvasWidth || canvas.height !== nextCanvasHeight) {
    canvas.width = nextCanvasWidth
    canvas.height = nextCanvasHeight
  }

  const context = canvas.getContext("2d")
  if (!context) return

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  context.clearRect(0, 0, width, height)
  context.lineCap = "round"
  context.lineJoin = "round"

  // スケールは静止時の樹形で固定し、揺れに合わせて木全体が拡縮しないようにする。
  const maxHorizontalReach = Math.max(
    1,
    Math.abs(tree.bounds.minX),
    Math.abs(tree.bounds.maxX),
  )
  const treeHeight = Math.max(1, tree.bounds.maxY - tree.bounds.minY)
  const drawingScale = Math.min(
    (width * 0.47) / maxHorizontalReach,
    (height * 0.88) / treeHeight,
  )

  const bottomY = tree.bounds.maxY
  const screenX = (value: number) => width / 2 + value * drawingScale
  const screenY = (value: number) => height * 0.94 + (value - bottomY) * drawingScale
  const wind = getWindState(timeMs, tree.windPhase)
  const poses = createBranchPoses(tree, timeMs, wind)

  // 横方向に滑って見えないよう、影も根元中央に固定する。
  const shadowShift = 0
  const shadowStretch = 1 + Math.min(0.012, Math.abs(wind.strength) * 0.01)
  context.save()
  context.filter = "blur(7px)"
  context.fillStyle = "rgb(91 58 31 / 14%)"
  context.beginPath()
  context.ellipse(
    width / 2 + shadowShift,
    height * 0.943,
    width * 0.145 * shadowStretch,
    Math.max(4, height * 0.011),
    0,
    0,
    Math.PI * 2,
  )
  context.fill()
  context.restore()

  for (let index = 0; index < tree.branches.length; index += 1) {
    const item = tree.branches[index]
    const pose = poses[index]

    context.strokeStyle = item.width >= 7 ? "#765033" : "#85603d"
    context.lineWidth = Math.max(1.2, item.width * drawingScale)
    context.beginPath()
    context.moveTo(screenX(pose.x), screenY(pose.y))
    context.lineTo(screenX(pose.nextX), screenY(pose.nextY))
    context.stroke()
  }

  // 葉は枝先を支点に回転だけでアイドルモーションする。
  // 普段は少し大きめにふわふわ、約8.5秒ごとのラッスル中だけ高周波で「ﾜｻﾜｻｯ」と震える。
  const time = timeMs / 1000
  const motionRamp = Math.min(1, Math.max(0, timeMs / 700))

  for (const leaf of tree.leaves) {
    const parentPose = poses[leaf.parentBranchIndex]
    const parentBranch = tree.branches[leaf.parentBranchIndex]
    const branchRotation = parentPose.angle - parentBranch.baseAngle

    const idleFlutter =
      Math.sin(time * 1.95 + leaf.windPhase) * 0.09
      + Math.sin(time * 3.15 + leaf.windPhase * 0.72) * 0.035

    const rustleFlutter =
      (
        Math.sin(time * 13.5 + leaf.windPhase * 1.17) * 0.17
        + Math.sin(time * 19 + leaf.windPhase * 0.53) * 0.075
      )
      * wind.envelope

    const leafFlutter = (idleFlutter + rustleFlutter) * motionRamp

    context.save()
    context.translate(screenX(parentPose.nextX), screenY(parentPose.nextY))
    context.rotate(leaf.angle + branchRotation + leafFlutter)
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
    const parentPose = poses[item.parentBranchIndex]
    context.fillStyle = "#f59a23"
    context.beginPath()
    context.arc(
      screenX(parentPose.nextX),
      screenY(parentPose.nextY),
      5 * drawingScale,
      0,
      Math.PI * 2,
    )
    context.fill()
  }
}

export function MikanTree({ seed, className, preset = "classic" }: MikanTreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tree = useMemo(() => createTree(seed, preset), [seed, preset])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let prefersReducedMotion = reducedMotionQuery.matches
    let isVisible = true
    let animationFrame: number | null = null
    let animationStart = performance.now()
    let lastDraw = 0

    const renderCurrentFrame = () => {
      const elapsed = prefersReducedMotion ? 0 : Math.max(0, performance.now() - animationStart)
      drawTree(canvas, tree, elapsed)
    }

    const stopAnimation = () => {
      if (animationFrame === null) return
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }

    const tick = (now: number) => {
      animationFrame = null
      if (prefersReducedMotion || !isVisible) return

      if (now - lastDraw >= TARGET_FRAME_INTERVAL) {
        drawTree(canvas, tree, Math.max(0, now - animationStart))
        lastDraw = now
      }

      animationFrame = requestAnimationFrame(tick)
    }

    const startAnimation = () => {
      if (animationFrame !== null || prefersReducedMotion || !isVisible) return
      animationFrame = requestAnimationFrame(tick)
    }

    const resizeObserver = new ResizeObserver(() => {
      renderCurrentFrame()
    })

    const intersectionObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0]?.isIntersecting ?? true

      if (isVisible) {
        renderCurrentFrame()
        startAnimation()
      } else {
        stopAnimation()
      }
    })

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches

      if (prefersReducedMotion) {
        stopAnimation()
        drawTree(canvas, tree, 0)
        return
      }

      animationStart = performance.now()
      lastDraw = 0
      startAnimation()
    }

    resizeObserver.observe(canvas)
    intersectionObserver.observe(canvas)
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange)

    drawTree(canvas, tree, 0)
    startAnimation()

    return () => {
      stopAnimation()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange)
    }
  }, [tree])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="あなた固有のみかんの木"
      data-tree-version={TREE_VERSION}
      data-tree-preset={preset}
      data-tree-wind="idle-rustle-rotation"
    />
  )
}
