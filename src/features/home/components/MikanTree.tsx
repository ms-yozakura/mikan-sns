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

type ShakeImpulse = {
  startedAt: number
  strength: number
}

type FallingFruit = {
  fruitIndex: number
  startedAt: number
  x: number
  y: number
  velocityX: number
  gravity: number
  bounceRatio: number
}

type MotionState = {
  impulses: ShakeImpulse[]
  fallingFruit: FallingFruit[]
}

type WindState = {
  envelope: number
  sway: number
  strength: number
  interaction: number
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
const INTERACTION_DURATION_MS = 950
const FRUIT_DROP_COOLDOWN_MS = 4_000
const MAX_PIXEL_RATIO = 2.75
const MAX_CANVAS_PIXELS = 2_800_000

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
      if (random() < 0.08) {
        fruit.push({ x, y, parentBranchIndex: parentIndex })
      }
      return
    }

    const nextX = x + Math.cos(angle) * len
    const nextY = y + Math.sin(angle) * len
    const branchIndex = addBranch({ x, y, nextX, nextY, width: thick, angle, parentIndex })

    branch(
      nextX,
      nextY,
      len * between(0.7, 0.85) * config.lengthScale,
      angle + between(-0.4, 0.4),
      thick * 0.85,
      branchIndex,
    )

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

  let x = 0
  let y = 0
  let trunkParentIndex: number | null = null
  const angle = -Math.PI / 2 + between(-0.05, 0.05) * config.trunkLean

  for (let index = 0; index < 6; index += 1) {
    const nextX = x + Math.cos(angle) * 15
    const nextY = y + Math.sin(angle) * 15
    const trunkIndex = addBranch({
      x,
      y,
      nextX,
      nextY,
      width: (12 - index) * (index < 2 ? 1.18 : 1),
      angle,
      parentIndex: trunkParentIndex,
    })

    if (index > 2) {
      branch(nextX, nextY, between(60, 70), angle + between(-0.4, -0.1), 5, trunkIndex)
      branch(nextX, nextY, between(60, 70), angle + between(0.1, 0.4), 5, trunkIndex)
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

function getInteractionStrength(timeMs: number, impulses: ShakeImpulse[]) {
  let strength = 0
  for (const impulse of impulses) {
    const age = timeMs - impulse.startedAt
    if (age < 0 || age > INTERACTION_DURATION_MS) continue
    strength += Math.min(1, age / 85) * Math.exp(-age / 330) * impulse.strength
  }
  return Math.min(1.8, strength)
}

function getWindState(timeMs: number, treePhase: number, impulses: ShakeImpulse[] = []): WindState {
  const time = timeMs / 1000
  const rampProgress = Math.min(1, Math.max(0, timeMs / 700))
  const ramp = rampProgress * rampProgress * (3 - 2 * rampProgress)
  const cycleTime = time % GUST_CYCLE_SECONDS
  const gustDistance = (cycleTime - GUST_CENTER_SECONDS) / GUST_WIDTH_SECONDS
  const gust = Math.exp(-gustDistance * gustDistance * 2.15) * ramp
  const interaction = getInteractionStrength(timeMs, impulses)
  const sway =
    Math.sin(time * 0.78 + treePhase) * 0.7
    + Math.sin(time * 1.31 + treePhase * 0.61) * 0.3
  const interactionSway =
    Math.sin(time * 18.5 + treePhase * 0.82) * 0.68
    + Math.sin(time * 27.4 + treePhase * 1.31) * 0.32

  return {
    envelope: Math.min(1.8, gust + interaction),
    sway,
    strength: gust * sway + interaction * interactionSway,
    interaction,
  }
}

function getBranchFlexibility(branch: Branch) {
  if (branch.width >= 7) return 0.00002
  const widthFlex = Math.min(1, Math.max(0, (7 - branch.width) / 6))
  const depthFlex = Math.min(1, Math.max(0, (branch.depth - 4) / 9))
  return 0.0014 + widthFlex * 0.0042 + depthFlex * 0.0026
}

function createBranchPoses(tree: TreeModel, timeMs: number, wind: WindState) {
  const time = timeMs / 1000
  const motionRamp = Math.min(1, Math.max(0, timeMs / 700))
  const poses = new Array<BranchPose>(tree.branches.length)

  for (let index = 0; index < tree.branches.length; index += 1) {
    const branch = tree.branches[index]
    const parentPose = branch.parentIndex === null ? null : poses[branch.parentIndex]
    const startX = parentPose ? parentPose.nextX : branch.x
    const startY = parentPose ? parentPose.nextY : branch.y
    const baseWorldAngle = parentPose
      ? parentPose.angle + branch.relativeAngle
      : branch.baseAngle
    const idleSway =
      Math.sin(time * 0.95 + branch.windPhase * 0.45 - branch.depth * 0.07) * 0.68
      + Math.sin(time * 1.55 + branch.windPhase) * 0.32
    const rustle =
      (
        Math.sin(time * 8.8 + branch.windPhase) * 0.65
        + Math.sin(time * 13.6 + branch.windPhase * 0.57) * 0.35
      )
      * wind.envelope
    const interactionRustle =
      (
        Math.sin(time * 19.5 + branch.windPhase * 1.17) * 0.68
        + Math.sin(time * 28.5 + branch.windPhase * 0.71) * 0.32
      )
      * wind.interaction
    const windOffset =
      (idleSway * 0.85 + rustle * 0.72 + interactionRustle * 1.55)
      * getBranchFlexibility(branch)
      * motionRamp
    const angle = baseWorldAngle + windOffset
    const nextX = startX + Math.cos(angle) * branch.length
    const nextY = startY + Math.sin(angle) * branch.length
    poses[index] = { x: startX, y: startY, nextX, nextY, angle }
  }

  return poses
}

function getFallingFruitPosition(item: FallingFruit, elapsedMs: number, groundY: number) {
  const elapsed = Math.max(0, (elapsedMs - item.startedAt) / 1000)
  const distanceToGround = Math.max(0, groundY - item.y)
  const firstImpactTime = Math.sqrt((2 * distanceToGround) / item.gravity)
  const firstImpactVelocity = item.gravity * firstImpactTime
  const bounceVelocity = firstImpactVelocity * item.bounceRatio
  const secondImpactDuration = bounceVelocity > 0 ? (2 * bounceVelocity) / item.gravity : 0
  const motionDuration = firstImpactTime + secondImpactDuration
  const horizontalTime = Math.min(elapsed, motionDuration)
  const x = item.x + item.velocityX * horizontalTime

  if (elapsed <= firstImpactTime) {
    return {
      x,
      y: Math.min(groundY, item.y + 0.5 * item.gravity * elapsed * elapsed),
      settled: false,
    }
  }

  const bounceElapsed = elapsed - firstImpactTime
  if (bounceElapsed <= secondImpactDuration) {
    return {
      x,
      y: Math.min(
        groundY,
        groundY - bounceVelocity * bounceElapsed + 0.5 * item.gravity * bounceElapsed * bounceElapsed,
      ),
      settled: false,
    }
  }

  return { x, y: groundY, settled: true }
}

function getCanvasPixelRatio(width: number, height: number) {
  const deviceRatio = window.devicePixelRatio || 1
  const pixelBudgetRatio = Math.sqrt(MAX_CANVAS_PIXELS / Math.max(1, width * height))
  return Math.max(1, Math.min(deviceRatio, MAX_PIXEL_RATIO, pixelBudgetRatio))
}

function drawTree(canvas: HTMLCanvasElement, tree: TreeModel, timeMs: number, motion: MotionState) {
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  if (width === 0 || height === 0) return

  const pixelRatio = getCanvasPixelRatio(width, height)
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

  const maxHorizontalReach = Math.max(1, Math.abs(tree.bounds.minX), Math.abs(tree.bounds.maxX))
  const treeHeight = Math.max(1, tree.bounds.maxY - tree.bounds.minY)
  const drawingScale = Math.min((width * 0.47) / maxHorizontalReach, (height * 0.88) / treeHeight)
  const bottomY = tree.bounds.maxY
  const screenX = (value: number) => width / 2 + value * drawingScale
  const screenY = (value: number) => height * 0.94 + (value - bottomY) * drawingScale
  const wind = getWindState(timeMs, tree.windPhase, motion.impulses)
  const poses = createBranchPoses(tree, timeMs, wind)
  const shadowStretch = 1 + Math.min(0.018, Math.abs(wind.strength) * 0.012)

  context.save()
  context.filter = "blur(7px)"
  context.fillStyle = "rgb(91 58 31 / 14%)"
  context.beginPath()
  context.ellipse(
    width / 2,
    height * 0.956,
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

  const time = timeMs / 1000
  const motionRamp = Math.min(1, Math.max(0, timeMs / 700))

  for (const leaf of tree.leaves) {
    const parentPose = poses[leaf.parentBranchIndex]
    const parentBranch = tree.branches[leaf.parentBranchIndex]
    const branchRotation = parentPose.angle - parentBranch.baseAngle
    const idleFlutter =
      Math.sin(time * 1.95 + leaf.windPhase) * 0.105
      + Math.sin(time * 3.15 + leaf.windPhase * 0.72) * 0.042
    const rustleFlutter =
      (
        Math.sin(time * 13.5 + leaf.windPhase * 1.17) * 0.19
        + Math.sin(time * 19 + leaf.windPhase * 0.53) * 0.085
      )
      * wind.envelope
    const interactionFlutter =
      (
        Math.sin(time * 24 + leaf.windPhase * 0.91) * 0.26
        + Math.sin(time * 34 + leaf.windPhase * 1.43) * 0.12
      )
      * wind.interaction
    const leafFlutter = (idleFlutter + rustleFlutter + interactionFlutter) * motionRamp

    context.save()
    context.translate(screenX(parentPose.nextX), screenY(parentPose.nextY))
    context.rotate(leaf.angle + branchRotation + leafFlutter)
    context.fillStyle = LEAF_COLORS[leaf.tone]
    const size = leaf.size * drawingScale
    context.beginPath()
    context.arc(size * Math.cos(Math.PI / 4), -size * Math.sin(Math.PI / 4), size, Math.PI / 4, Math.PI / 2)
    context.arc(size * Math.cos(Math.PI / 4), size * Math.sin(Math.PI / 4), size, 5 * Math.PI / 4, 3 * Math.PI / 2)
    context.fill()
    context.restore()
  }

  const droppedFruitIndexes = new Set(motion.fallingFruit.map((item) => item.fruitIndex))
  tree.fruit.forEach((item, fruitIndex) => {
    if (droppedFruitIndexes.has(fruitIndex)) return
    const parentPose = poses[item.parentBranchIndex]
    context.fillStyle = "#f59a23"
    context.beginPath()
    context.arc(screenX(parentPose.nextX), screenY(parentPose.nextY), 5 * drawingScale, 0, Math.PI * 2)
    context.fill()
  })

  for (const item of motion.fallingFruit) {
    const position = getFallingFruitPosition(item, timeMs, bottomY)
    const radius = 5 * drawingScale

    if (!position.settled) {
      const distanceToGround = Math.max(0, bottomY - position.y)
      const shadowOpacity = Math.max(0.05, 0.13 - distanceToGround * 0.00045)
      context.save()
      context.fillStyle = `rgb(91 58 31 / ${shadowOpacity})`
      context.beginPath()
      context.ellipse(
        screenX(position.x),
        screenY(bottomY) + radius * 0.75,
        radius * 0.9,
        Math.max(1.4, radius * 0.24),
        0,
        0,
        Math.PI * 2,
      )
      context.fill()
      context.restore()
    }

    context.fillStyle = "#f59a23"
    context.beginPath()
    context.arc(screenX(position.x), screenY(position.y) - radius * 0.1, radius, 0, Math.PI * 2)
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
    let lastScrollY = window.scrollY
    let scrollAccumulator = 0
    let lastScrollShakeAt = 0
    let lastFruitDropAt = -FRUIT_DROP_COOLDOWN_MS
    const motion: MotionState = { impulses: [], fallingFruit: [] }

    const currentElapsed = () => Math.max(0, performance.now() - animationStart)
    const renderCurrentFrame = () => {
      drawTree(canvas, tree, prefersReducedMotion ? 0 : currentElapsed(), motion)
    }
    const stopAnimation = () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame)
        animationFrame = null
      }
    }
    const tick = (now: number) => {
      animationFrame = null
      if (prefersReducedMotion || !isVisible) return
      if (now - lastDraw >= TARGET_FRAME_INTERVAL) {
        const elapsed = Math.max(0, now - animationStart)
        motion.impulses = motion.impulses.filter(
          (item) => elapsed - item.startedAt <= INTERACTION_DURATION_MS,
        )
        drawTree(canvas, tree, elapsed, motion)
        lastDraw = now
      }
      animationFrame = requestAnimationFrame(tick)
    }
    const startAnimation = () => {
      if (animationFrame === null && !prefersReducedMotion && isVisible) {
        animationFrame = requestAnimationFrame(tick)
      }
    }
    const maybeDropFruit = (elapsed: number, chance: number) => {
      if (
        tree.fruit.length === 0
        || motion.fallingFruit.length >= tree.fruit.length
        || elapsed - lastFruitDropAt < FRUIT_DROP_COOLDOWN_MS
        || Math.random() >= chance
      ) {
        return
      }

      const dropped = new Set(motion.fallingFruit.map((item) => item.fruitIndex))
      const availableFruit = tree.fruit
        .map((_, index) => index)
        .filter((index) => !dropped.has(index))
      const fruitIndex = availableFruit[Math.floor(Math.random() * availableFruit.length)]
      if (fruitIndex === undefined) return

      const wind = getWindState(elapsed, tree.windPhase, motion.impulses)
      const poses = createBranchPoses(tree, elapsed, wind)
      const fruit = tree.fruit[fruitIndex]
      const parentPose = poses[fruit.parentBranchIndex]
      const direction = Math.random() < 0.5 ? -1 : 1

      motion.fallingFruit.push({
        fruitIndex,
        startedAt: elapsed,
        x: parentPose.nextX,
        y: parentPose.nextY,
        velocityX: direction * (2.5 + Math.random() * 5.5),
        gravity: 235 + Math.random() * 35,
        bounceRatio: 0.34 + Math.random() * 0.08,
      })
      lastFruitDropAt = elapsed
    }
    const triggerShake = (strength: number, fruitChance: number) => {
      if (prefersReducedMotion || !isVisible) return
      const elapsed = currentElapsed()
      motion.impulses.push({ startedAt: elapsed, strength })
      maybeDropFruit(elapsed, fruitChance)
      startAnimation()
    }
    const resizeObserver = new ResizeObserver(renderCurrentFrame)
    const intersectionObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0]?.isIntersecting ?? true
      if (isVisible) {
        lastScrollY = window.scrollY
        renderCurrentFrame()
        startAnimation()
      } else {
        stopAnimation()
      }
    })
    const handlePointerDown = (event: PointerEvent) => {
      if (!isVisible || prefersReducedMotion) return
      const target = event.target
      if (
        target instanceof Element
        && target.closest("a, button, input, textarea, select, [role='button']")
      ) {
        return
      }
      const rect = canvas.getBoundingClientRect()
      const inside =
        event.clientX >= rect.left
        && event.clientX <= rect.right
        && event.clientY >= rect.top
        && event.clientY <= rect.bottom
      if (inside) triggerShake(1.35, 0.07)
    }
    const handleScroll = () => {
      if (!isVisible || prefersReducedMotion) {
        lastScrollY = window.scrollY
        return
      }
      const next = window.scrollY
      const delta = Math.abs(next - lastScrollY)
      lastScrollY = next
      scrollAccumulator += delta
      const now = performance.now()
      if (scrollAccumulator < 18 || now - lastScrollShakeAt < 140) return
      const strength = Math.min(1.3, 0.68 + scrollAccumulator / 95)
      scrollAccumulator = 0
      lastScrollShakeAt = now
      triggerShake(strength, 0.018)
    }
    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches
      if (prefersReducedMotion) {
        stopAnimation()
        motion.impulses = []
        motion.fallingFruit = []
        drawTree(canvas, tree, 0, motion)
        return
      }
      animationStart = performance.now()
      lastDraw = 0
      lastFruitDropAt = -FRUIT_DROP_COOLDOWN_MS
      lastScrollY = window.scrollY
      startAnimation()
    }

    resizeObserver.observe(canvas)
    intersectionObserver.observe(canvas)
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange)
    window.addEventListener("pointerdown", handlePointerDown, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })
    drawTree(canvas, tree, 0, motion)
    startAnimation()

    return () => {
      stopAnimation()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange)
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [tree])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="あなた固有のみかんの木。木の周辺をタップすると葉が揺れます"
      data-tree-version={TREE_VERSION}
      data-tree-preset={preset}
      data-tree-wind="branch-idle-rustle-interactive"
    />
  )
}
