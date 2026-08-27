#!/usr/bin/env node
/**
 * BiTalep logo asset pipeline
 * - Source: BiTalep-logo.jpeg (near-white → transparent)
 * - Auto-crop bounding box
 * - Split icon vs wordmark via column-gap detection (no hardcoded coords)
 * - Outputs: logo-full, logo-icon, favicon-32, apple-touch-icon-180, logo-512
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SOURCE = path.resolve(ROOT, '..', 'BiTalep-logo.jpeg')
const OUT_DIR = path.join(ROOT, 'public')

const NEAR_WHITE = 242 // luminance threshold for transparency
const MIN_COL_OPAQUE = 8 // ignore JPEG noise columns/rows
const MIN_ROW_OPAQUE = 8

function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/**
 * Make near-white pixels transparent; return { data, width, height, channels: 4 }
 */
async function toTransparentRgba(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  const out = Buffer.alloc(width * height * 4)

  for (let i = 0; i < width * height; i++) {
    const src = i * channels
    const dst = i * 4
    const r = data[src]
    const g = data[src + 1]
    const b = data[src + 2]
    const a = channels === 4 ? data[src + 3] : 255

    if (luminance(r, g, b) >= NEAR_WHITE) {
      out[dst] = 0
      out[dst + 1] = 0
      out[dst + 2] = 0
      out[dst + 3] = 0
    } else {
      out[dst] = r
      out[dst + 1] = g
      out[dst + 2] = b
      out[dst + 3] = a
    }
  }

  return { data: out, width, height }
}

/**
 * Find bounding box of non-transparent pixels, ignoring sparse JPEG noise
 */
function findBoundingBox(data, width, height) {
  const colCounts = new Array(width).fill(0)
  const rowCounts = new Array(height).fill(0)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3]
      if (a > 10) {
        colCounts[x]++
        rowCounts[y]++
      }
    }
  }

  let minX = 0
  while (minX < width && colCounts[minX] < MIN_COL_OPAQUE) minX++
  let maxX = width - 1
  while (maxX > minX && colCounts[maxX] < MIN_COL_OPAQUE) maxX--
  let minY = 0
  while (minY < height && rowCounts[minY] < MIN_ROW_OPAQUE) minY++
  let maxY = height - 1
  while (maxY > minY && rowCounts[maxY] < MIN_ROW_OPAQUE) maxY--

  if (minX >= width || maxX < minX) {
    throw new Error('No non-transparent pixels found in logo')
  }

  // Clear residual noise outside content box
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x < minX || x > maxX || y < minY || y > maxY) {
        const i = (y * width + x) * 4
        data[i] = 0
        data[i + 1] = 0
        data[i + 2] = 0
        data[i + 3] = 0
      }
    }
  }

  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

/**
 * Column occupancy: count opaque pixels per column in cropped region
 */
function columnOccupancy(data, fullWidth, box) {
  const cols = new Array(box.width).fill(0)
  for (let y = box.top; y < box.top + box.height; y++) {
    for (let x = box.left; x < box.left + box.width; x++) {
      const a = data[(y * fullWidth + x) * 4 + 3]
      if (a > 10) cols[x - box.left]++
    }
  }
  return cols
}

/**
 * Find widest gap of near-empty columns in the middle 40–70% — split icon | wordmark
 */
function findSplitColumn(cols) {
  const n = cols.length
  const start = Math.floor(n * 0.25)
  const end = Math.floor(n * 0.75)
  const emptyThreshold = Math.max(2, Math.floor(Math.max(...cols) * 0.02))

  let bestGapStart = -1
  let bestGapLen = 0
  let i = start
  while (i < end) {
    if (cols[i] <= emptyThreshold) {
      const gapStart = i
      while (i < end && cols[i] <= emptyThreshold) i++
      const gapLen = i - gapStart
      if (gapLen > bestGapLen) {
        bestGapLen = gapLen
        bestGapStart = gapStart
      }
    } else {
      i++
    }
  }

  if (bestGapStart < 0 || bestGapLen < 4) {
    // Fallback: midpoint
    console.warn('[logo] Column gap weak; falling back to 40% split')
    return Math.floor(n * 0.4)
  }

  return bestGapStart + Math.floor(bestGapLen / 2)
}

async function cropRegion(rgba, fullWidth, fullHeight, region) {
  return sharp(rgba, {
    raw: { width: fullWidth, height: fullHeight, channels: 4 },
  })
    .extract(region)
    .png()
    .toBuffer()
}

async function writeResized(buffer, size, outPath, { fit = 'contain', background } = {}) {
  const opts = {
    fit,
    background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
  }
  await sharp(buffer).resize(size, size, opts).png().toFile(outPath)
  console.log('  wrote', path.relative(ROOT, outPath))
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error('Source logo not found:', SOURCE)
    process.exit(1)
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  console.log('[logo] Processing', SOURCE)

  const { data, width, height } = await toTransparentRgba(SOURCE)
  const box = findBoundingBox(data, width, height)
  console.log('[logo] Bounding box', box)

  const cols = columnOccupancy(data, width, box)
  const splitLocal = findSplitColumn(cols)
  const splitX = box.left + splitLocal
  console.log('[logo] Split at x=', splitX, '(local', splitLocal, ')')

  const fullPng = await cropRegion(data, width, height, box)
  const iconRegion = {
    left: box.left,
    top: box.top,
    width: Math.max(1, splitX - box.left),
    height: box.height,
  }
  // Tighten icon bbox (drop empty columns on right of icon)
  let iconRight = iconRegion.left + iconRegion.width - 1
  while (iconRight > iconRegion.left) {
    let has = false
    for (let y = iconRegion.top; y < iconRegion.top + iconRegion.height; y++) {
      if (data[(y * width + iconRight) * 4 + 3] > 10) {
        has = true
        break
      }
    }
    if (has) break
    iconRight--
  }
  iconRegion.width = iconRight - iconRegion.left + 1

  const iconPng = await cropRegion(data, width, height, iconRegion)

  const fullPath = path.join(OUT_DIR, 'logo-full.png')
  const iconPath = path.join(OUT_DIR, 'logo-icon.png')
  await sharp(fullPng).png().toFile(fullPath)
  await sharp(iconPng).png().toFile(iconPath)
  console.log('  wrote', path.relative(ROOT, fullPath))
  console.log('  wrote', path.relative(ROOT, iconPath))

  await writeResized(iconPng, 32, path.join(OUT_DIR, 'favicon-32.png'))
  await writeResized(iconPng, 180, path.join(OUT_DIR, 'apple-touch-icon-180.png'))
  await writeResized(iconPng, 512, path.join(OUT_DIR, 'logo-512.png'))

  console.log('[logo] Done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
