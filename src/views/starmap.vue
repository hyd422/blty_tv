<template>
  <div class="starmap-root">
    <canvas ref="canvasRef" class="starmap-canvas"></canvas>

    <!-- 左上角图例 -->
    <div class="starmap-legend">
      <span class="legend-title">✦ 大欣小欣的星图 陪你走过的每一步都算数</span>
      <span class="legend-sub">{{ yearRange }} · {{ events.length }} 个坐标</span>
    </div>

    <!-- 进入网站 -->
    <button class="enter-site" @click="emit('enter')">
      进入白猪宇宙 <span class="enter-arrow">→</span>
      <span class="enter-line"></span>
    </button>

    <!-- 右下角操作 -->
    <div class="starmap-actions">
      <button class="action-link" @click="resetView">↺ RESET VIEW</button>
      <button class="action-link" @click="toggle2D">{{ is2D ? '3D MAP' : '2D MAP' }} <span v-if="!is2D">→</span></button>
    </div>

    <!-- 底部提示 -->
    <div class="starmap-hint">DRAG 旋转 · SCROLL 缩放 · CLICK 打开坐标</div>

    <!-- 左下角像素小宠物：陪你一起看星空 -->
    <div class="starmap-pets">
      <PixelPet pet="pig" :size="46" />
      <PixelPet pet="dog" :size="46" />
    </div>

    <!-- 坐标详情弹窗：紫色科幻风，点击按钮跳转微博 -->
    <transition name="modal">
      <div v-if="selected" class="coord-modal" @click.self="selected = null">
        <div class="coord-panel">
          <span class="corner tl"></span><span class="corner tr"></span>
          <span class="corner bl"></span><span class="corner br"></span>
          <div class="coord-scan"></div>
          <div class="coord-topbar">
            <span class="coord-status">◉ COORDINATE LOCKED · 坐标已锁定</span>
            <button class="coord-close" @click="selected = null">✕</button>
          </div>
          <div class="coord-date">{{ selected.d }}</div>
          <div class="coord-divider"></div>
          <p class="coord-title">{{ selected.t }}</p>
          <div class="coord-meta">♥ {{ selected.l }} <span class="coord-meta-sub">微博热度</span></div>
          <a class="coord-link" :href="selected.u" target="_blank" rel="noopener noreferrer">查看原微博 →</a>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import PixelPet from '../components/PixelPet.vue'

const emit = defineEmits(['enter'])

const canvasRef = ref(null)
const events = ref([])
const yearRange = ref('')
const selected = ref(null) // 弹窗中展示的事件

const is2D = ref(false)

// ===== 相机状态（当前值向目标值阻尼逼近，实现平滑过渡） =====
const cam = { rotY: 0.4, rotX: -0.1, zoom: 1 }
const target = { rotY: 0.4, rotX: -0.1, zoom: 1 }
const DEFAULT_VIEW = { rotY: 0.4, rotX: -0.1, zoom: 1 }
let dragging = false
let lastX = 0, lastY = 0, dragDist = 0
let autoRotateTimer = 0

let stars = []          // 事件星 {x,y,z,size,tw,gold,e,label}
let bgStars = []        // 远景装饰星
let projections = []    // 每帧缓存投影结果，用于点击命中
let labelQueue = []     // 每帧待绘制标签
let hovered = -1        // 悬停星索引
let rafId = 0
let running = true

const ctx = () => canvasRef.value.getContext('2d')

// 简单字符串哈希 -> [0,1)
function hash01(s, salt = 0) {
  let h = 2166136261 ^ salt
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

function buildStars(list) {
  const years = [...new Set(list.map(e => e.d.slice(0, 4)))].sort()
  yearRange.value = years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : (years[0] || '')
  const minYear = +years[0]

  // 点赞Top24金色高亮；标签每标题去重后取Top30，其余放大后按需显示
  const byLikes = [...list].sort((a, b) => b.l - a.l)
  const goldSet = new Set(byLikes.slice(0, 24))
  const labelSet = new Set()
  const seenTitle = new Set()
  for (const e of byLikes) {
    if (labelSet.size >= 30) break
    if (seenTitle.has(e.t)) continue
    seenTitle.add(e.t)
    labelSet.add(e)
  }

  stars = list.map(e => {
    const y = +e.d.slice(0, 4)
    const mo = +e.d.slice(4, 6)
    const d = +e.d.slice(6, 8)
    const dayOfYear = Math.floor((Date.UTC(y, mo - 1, d) - Date.UTC(y, 0, 1)) / 86400000)
    const daysInYear = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 366 : 365
    const theta = (dayOfYear / daysInYear) * Math.PI * 2 - Math.PI / 2
    const ring = 190 + (y - minYear) * 150          // 每年一个同心环
    const r = ring + (hash01(e.u, 1) - 0.5) * 60    // 径向抖动
    const py = (hash01(e.u, 2) - 0.5) * 170         // 纵向散布
    return {
      x: Math.cos(theta) * r,
      y: py,
      z: Math.sin(theta) * r,
      size: 0.85 + Math.log10(1 + e.l) * 0.6,
      tw: hash01(e.u, 3) * Math.PI * 2,
      gold: goldSet.has(e),
      label: labelSet.has(e),
      e
    }
  })

  // 远景装饰星
  bgStars = []
  for (let i = 0; i < 420; i++) {
    const th = Math.random() * Math.PI * 2
    const ph = Math.acos(2 * Math.random() - 1)
    const R = 2600
    bgStars.push({
      x: R * Math.sin(ph) * Math.cos(th),
      y: R * Math.cos(ph) * 0.6,
      z: R * Math.sin(ph) * Math.sin(th),
      s: 0.5 + Math.random() * 0.9
    })
  }
}

function project(x, y, z, w, h) {
  const cy = Math.cos(cam.rotY), sy = Math.sin(cam.rotY)
  let x1 = x * cy - z * sy
  let z1 = x * sy + z * cy
  const cx = Math.cos(cam.rotX), sx = Math.sin(cam.rotX)
  const y1 = y * cx - z1 * sx
  const z2 = y * sx + z1 * cx
  const f = 900 / (900 + z2)
  return { sx: w / 2 + x1 * f * cam.zoom, sy: h / 2 + y1 * f * cam.zoom, f, z: z2 }
}

function draw() {
  if (!running) return
  const cvs = canvasRef.value
  if (!cvs) return
  const w = cvs.clientWidth, h = cvs.clientHeight
  const g = ctx()
  const dpr = window.devicePixelRatio || 1
  if (cvs.width !== w * dpr || cvs.height !== h * dpr) {
    cvs.width = w * dpr
    cvs.height = h * dpr
  }
  g.setTransform(dpr, 0, 0, dpr, 0, 0)

  // 背景径向渐变
  const grad = g.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, Math.max(w, h) * 0.75)
  grad.addColorStop(0, '#101830')
  grad.addColorStop(1, '#060911')
  g.fillStyle = grad
  g.fillRect(0, 0, w, h)

  // 平滑逼近目标视角 + 空闲自动旋转
  cam.rotY += (target.rotY - cam.rotY) * 0.09
  cam.rotX += (target.rotX - cam.rotX) * 0.09
  cam.zoom += (target.zoom - cam.zoom) * 0.09
  autoRotateTimer++
  if (autoRotateTimer > 240 && !dragging) target.rotY += 0.00045

  projections = []
  labelQueue = []

  // 远景星（只旋转Y轴，弱视差）
  const bcy = Math.cos(cam.rotY), bsy = Math.sin(cam.rotY)
  g.fillStyle = 'rgba(255,255,255,0.28)'
  for (const b of bgStars) {
    const x1 = b.x * bcy - b.z * bsy
    const z1 = b.x * bsy + b.z * bcy
    const f = 900 / (900 + z1 * 0.35)
    const sx = w / 2 + x1 * f
    const sy = h / 2 + b.y * f
    if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue
    g.fillRect(sx, sy, b.s, b.s)
  }

  // 事件星：投影并按深度排序绘制
  const t = performance.now() / 1000
  const items = new Array(stars.length)
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i]
    const p = project(s.x, s.y, s.z, w, h)
    items[i] = { i, sx: p.sx, sy: p.sy, f: p.f, z: p.z, s }
  }
  items.sort((a, b) => b.z - a.z)

  for (const it of items) {
    const { s } = it
    if (it.sx < -40 || it.sx > w + 40 || it.sy < -40 || it.sy > h + 40) continue
    const size = Math.max(0.5, s.size * it.f * (0.75 + cam.zoom * 0.45))
    const twinkle = 0.72 + 0.28 * Math.sin(t * 1.7 + s.tw)
    projections.push({ sx: it.sx, sy: it.sy, idx: it.i })

    if (s.gold) {
      const glow = g.createRadialGradient(it.sx, it.sy, 0, it.sx, it.sy, size * 4)
      glow.addColorStop(0, `rgba(255,214,130,${0.45 * twinkle})`)
      glow.addColorStop(1, 'rgba(255,214,130,0)')
      g.fillStyle = glow
      g.beginPath()
      g.arc(it.sx, it.sy, size * 4, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = `rgba(255,232,180,${0.95 * twinkle})`
    } else {
      g.fillStyle = `rgba(120, 81, 169, ${(it.z < 0 ? 0.85 : 0.45) * twinkle})`
    }
    g.beginPath()
    g.arc(it.sx, it.sy, size, 0, Math.PI * 2)
    g.fill()

    // 十字光芒（仅大星）
    if (size > 2.6) {
      g.strokeStyle = s.gold ? `rgba(255,222,150,${0.45 * twinkle})` : `rgba(120, 81, 169, ${0.35 * twinkle})`
      g.lineWidth = 1
      const L = size * 2.8
      g.beginPath()
      g.moveTo(it.sx - L, it.sy); g.lineTo(it.sx + L, it.sy)
      g.moveTo(it.sx, it.sy - L); g.lineTo(it.sx, it.sy + L)
      g.stroke()
    }

    // 标签：金色Top30与悬停星显示"日期+事件"；其余标签星放大到1.5倍以上显示；
    // 缩放≥2.2 时所有可见星至少显示日期
    const zoomAll = cam.zoom >= 2.2
    if ((s.gold || (s.label && cam.zoom > 1.5) || it.i === hovered || zoomAll) && it.z < 600) {
      const near = it.i === hovered
      const full = s.gold || near || (s.label && cam.zoom > 1.5)
      labelQueue.push({
        sx: it.sx, sy: it.sy, size,
        text: full ? `${s.e.d} ${s.e.t}` : s.e.d,
        gold: s.gold || near, near, full,
        priority: near ? 0 : (s.gold ? 1 : 2),
        likes: s.e.l
      })
    }
  }

  // 统一绘制标签，避免被星星覆盖。
  // 悬停 > 金色 > 普通排序；普通标签做碰撞剔除（先试右侧再试左侧），重叠时只保留热度更高的一条
  labelQueue.sort((a, b) => a.priority - b.priority || b.likes - a.likes)
  const placed = []
  const overlaps = (r) => {
    for (const p of placed) {
      if (r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + p.h > p.y) return true
    }
    return false
  }
  g.textBaseline = 'middle'
  for (const l of labelQueue) {
    const dateOnly = !l.full
    g.font = dateOnly ? '10px "Courier New", monospace' : '12px "Courier New", monospace'
    const tw = g.measureText(l.text).width
    const th = dateOnly ? 12 : 14
    let x = l.sx + l.size * 3 + 6
    let rect = { x: x - 3, y: l.sy - th / 2 - 1, w: tw + 7, h: th + 3 }
    let onLeft = false

    // 碰撞处理：悬停与金色标签始终绘制；普通/日期标签右侧重叠时尝试左侧，两侧都占用则跳过
    if (l.priority >= 1 && overlaps(rect)) {
      const lx = l.sx - l.size * 3 - 6 - tw
      const lrect = { x: lx - 3, y: rect.y, w: rect.w, h: rect.h }
      if (!overlaps(lrect)) {
        x = lx
        rect = lrect
        onLeft = true
      } else {
        continue
      }
    }
    placed.push(rect)

    // 日期标签加半透明底衬，保证在密集星点上的可读性
    if (dateOnly) {
      g.fillStyle = 'rgba(10, 4, 26, 0.66)'
      g.beginPath()
      if (g.roundRect) g.roundRect(rect.x, rect.y, rect.w, rect.h, 3)
      else g.rect(rect.x, rect.y, rect.w, rect.h)
      g.fill()
    }

    g.fillStyle = l.gold
      ? 'rgba(255,217,138,0.9)'
      : (l.near ? 'rgba(255,255,255,0.95)' : (dateOnly ? 'rgba(216,196,255,0.78)' : 'rgba(255,255,255,0.42)'))
    g.fillText(l.text, x, l.sy)

    // 连接线仅用于右侧完整标签（左侧标签文字紧贴星星，无需连接线）
    if (!dateOnly && !onLeft) {
      g.strokeStyle = l.gold ? 'rgba(255,217,138,0.5)' : 'rgba(255,255,255,0.22)'
      g.beginPath()
      g.moveTo(l.sx + l.size * 1.4, l.sy)
      g.lineTo(x - 4, l.sy)
      g.stroke()
    }
  }

  rafId = requestAnimationFrame(draw)
}

// ===== 交互 =====
const pointers = new Map() // 活动触点：支持手机双指捏合缩放
let pinchDist = 0

function onPointerDown(e) {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  autoRotateTimer = 0
  try { canvasRef.value.setPointerCapture(e.pointerId) } catch { /* 模拟事件或 pointer 已释放 */ }
  if (pointers.size === 1) {
    dragging = true
    dragDist = 0
    lastX = e.clientX
    lastY = e.clientY
  } else if (pointers.size === 2) {
    // 进入双指模式：暂停旋转，记录初始指距
    dragging = false
    const pts = [...pointers.values()]
    pinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
  }
}

function onPointerMove(e) {
  if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

  if (pointers.size >= 2) {
    // 双指捏合：按指距比例缩放
    const pts = [...pointers.values()]
    const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
    if (pinchDist > 0 && d > 0) {
      target.zoom = Math.max(0.45, Math.min(3.2, target.zoom * (d / pinchDist)))
      autoRotateTimer = 0
    }
    pinchDist = d
  } else if (dragging) {
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    dragDist += Math.abs(dx) + Math.abs(dy)
    lastX = e.clientX
    lastY = e.clientY
    target.rotY += dx * 0.005
    if (!is2D.value) target.rotX = Math.max(-1.1, Math.min(1.1, target.rotX + dy * 0.004))
  } else {
    // 悬停检测
    const r = canvasRef.value.getBoundingClientRect()
    const mx = e.clientX - r.left, my = e.clientY - r.top
    let best = -1, bestD = 18
    for (const p of projections) {
      const d = Math.hypot(p.sx - mx, p.sy - my)
      if (d < bestD) { bestD = d; best = p.idx }
    }
    hovered = best
    canvasRef.value.style.cursor = best >= 0 ? 'pointer' : 'grab'
  }
}

function onPointerUp(e) {
  pointers.delete(e.pointerId)
  if (pointers.size < 2) pinchDist = 0
  if (pointers.size === 1) {
    // 双指变单指：回到拖拽，dragDist 置大防误点开弹窗
    const p = [...pointers.values()][0]
    lastX = p.x
    lastY = p.y
    dragging = true
    dragDist = 99
  }
  if (pointers.size === 0) {
    if (dragging && dragDist < 6 && hovered >= 0) {
      // 打开紫色科幻弹窗，由弹窗内按钮跳转微博
      selected.value = stars[hovered].e
    }
    dragging = false
  }
}

function onKeydown(e) {
  if (e.key === 'Escape') selected.value = null
}

function onWheel(e) {
  e.preventDefault()
  target.zoom = Math.max(0.45, Math.min(3.2, target.zoom * (e.deltaY > 0 ? 0.9 : 1.1)))
  autoRotateTimer = 0
}

function resetView() {
  target.rotY = DEFAULT_VIEW.rotY
  target.rotX = DEFAULT_VIEW.rotX
  target.zoom = DEFAULT_VIEW.zoom
}

function toggle2D() {
  is2D.value = !is2D.value
  // 2D：俯视星环平面；3D：回到默认斜视角
  target.rotX = is2D.value ? 1.35 : DEFAULT_VIEW.rotX
  target.zoom = is2D.value ? 0.8 : DEFAULT_VIEW.zoom
}

onMounted(async () => {
  const cvs = canvasRef.value
  cvs.addEventListener('pointerdown', onPointerDown)
  cvs.addEventListener('pointermove', onPointerMove)
  cvs.addEventListener('pointerup', onPointerUp)
  cvs.addEventListener('pointercancel', onPointerUp)
  cvs.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKeydown)

  const res = await fetch('/weibo/starmap_events.json')
  const list = await res.json()
  events.value = list
  buildStars(list)
  draw()
})

onBeforeUnmount(() => {
  running = false
  cancelAnimationFrame(rafId)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.starmap-root {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: #060911;
  overflow: hidden;
}

.starmap-canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
  cursor: grab;
}

.starmap-legend {
  position: absolute;
  top: 28px;
  left: 32px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  pointer-events: none;
}

.legend-title {
  color: rgba(255, 255, 255, 0.85);
  font-size: clamp(10px, 2.8vw, 15px);
  letter-spacing: clamp(1.5px, 0.5vw, 4px);
  font-weight: 600;
  white-space: nowrap;
}

.legend-sub {
  color: rgba(255, 255, 255, 0.35);
  font-size: clamp(9px, 2.2vw, 12px);
  letter-spacing: clamp(1px, 0.4vw, 2px);
  font-family: "Courier New", monospace;
  white-space: nowrap;
}

.enter-site {
  position: absolute;
  right: 8%;
  bottom: 18%;
  background: none;
  border: none;
  color: #fff;
  font-size: clamp(22px, 4.4vw, 46px);
  font-weight: 700;
  letter-spacing: clamp(2px, 1vw, 6px);
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 8px 4px;
  transition: transform 0.3s ease;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
}

.enter-site:hover {
  transform: translateX(8px);
}

.enter-arrow {
  font-weight: 400;
  letter-spacing: 0;
}

.enter-line {
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.9), rgba(255, 217, 138, 0.7));
}

.starmap-actions {
  position: absolute;
  right: 32px;
  bottom: 64px;
  display: flex;
  gap: clamp(12px, 3vw, 28px);
}

.action-link {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: clamp(10px, 2.8vw, 14px);
  letter-spacing: clamp(1px, 0.5vw, 3px);
  cursor: pointer;
  font-family: "Courier New", monospace;
  transition: color 0.25s;
  padding: 4px;
  white-space: nowrap;
}

.action-link:hover {
  color: rgba(255, 255, 255, 0.95);
}

.starmap-hint {
  position: absolute;
  left: 32px;
  bottom: 24px;
  color: rgba(255, 255, 255, 0.32);
  font-size: clamp(9px, 2.5vw, 12px);
  letter-spacing: clamp(1px, 0.5vw, 3px);
  font-family: "Courier New", monospace;
  white-space: nowrap;
  pointer-events: none;}

/* 左下角像素小宠物 */
.starmap-pets {
  position: absolute;
  left: 26px;
  bottom: 52px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  z-index: 5;
}

/* ===== 坐标详情弹窗（紫色科幻风） ===== */
.coord-modal {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 2, 24, 0.62);
  backdrop-filter: blur(6px);
}

.coord-panel {
  position: relative;
  width: min(480px, 88vw);
  padding: 26px 30px 30px;
  background: linear-gradient(165deg, #221046 0%, #150a30 55%, #0d0522 100%);
  border: 1px solid rgba(168, 85, 247, 0.55);
  box-shadow:
    0 0 60px rgba(147, 51, 234, 0.4),
    0 0 120px rgba(88, 28, 135, 0.35),
    inset 0 0 32px rgba(147, 51, 234, 0.12);
  overflow: hidden;
}

/* HUD 四角括号 */
.corner {
  position: absolute;
  width: 18px;
  height: 18px;
  pointer-events: none;
}
.corner.tl { top: 6px; left: 6px; border-top: 2px solid #c084fc; border-left: 2px solid #c084fc; }
.corner.tr { top: 6px; right: 6px; border-top: 2px solid #c084fc; border-right: 2px solid #c084fc; }
.corner.bl { bottom: 6px; left: 6px; border-bottom: 2px solid #c084fc; border-left: 2px solid #c084fc; }
.corner.br { bottom: 6px; right: 6px; border-bottom: 2px solid #c084fc; border-right: 2px solid #c084fc; }

/* 扫描线 */
.coord-scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(192, 132, 252, 0.04) 0px,
    rgba(192, 132, 252, 0.04) 1px,
    transparent 1px,
    transparent 4px
  );
  animation: scanDrift 8s linear infinite;
}

@keyframes scanDrift {
  from { background-position-y: 0; }
  to { background-position-y: 40px; }
}

.coord-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.coord-status {
  color: rgba(216, 180, 254, 0.85);
  font-size: 11px;
  letter-spacing: 3px;
  font-family: "Courier New", monospace;
  text-shadow: 0 0 10px rgba(192, 132, 252, 0.6);
  animation: statusBlink 2.2s ease-in-out infinite;
}

@keyframes statusBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

.coord-close {
  background: none;
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: rgba(216, 180, 254, 0.9);
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.25s;
}

.coord-close:hover {
  background: rgba(168, 85, 247, 0.2);
  box-shadow: 0 0 14px rgba(168, 85, 247, 0.5);
}

.coord-date {
  font-family: "Courier New", monospace;
  font-size: clamp(30px, 5vw, 42px);
  font-weight: 700;
  letter-spacing: 8px;
  color: #e9d5ff;
  text-shadow:
    0 0 18px rgba(192, 132, 252, 0.9),
    0 0 40px rgba(147, 51, 234, 0.5);
  text-align: center;
}

.coord-divider {
  height: 1px;
  margin: 20px 0;
  background: linear-gradient(90deg, transparent, rgba(192, 132, 252, 0.7), transparent);
}

.coord-title {
  margin: 0 0 16px;
  color: #ede9fe;
  font-size: 16px;
  line-height: 1.75;
  text-align: center;
  word-break: break-all;
}

.coord-meta {
  text-align: center;
  color: #f0abfc;
  font-size: 14px;
  letter-spacing: 2px;
  margin-bottom: 26px;
}

.coord-meta-sub {
  color: rgba(216, 180, 254, 0.5);
  font-size: 12px;
  margin-left: 6px;
}

.coord-link {
  display: block;
  text-align: center;
  padding: 13px 0;
  color: #fff;
  font-size: 15px;
  letter-spacing: 5px;
  text-decoration: none;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  box-shadow: 0 0 24px rgba(147, 51, 234, 0.55);
  transition: all 0.25s;
}

.coord-link:hover {
  box-shadow: 0 0 40px rgba(168, 85, 247, 0.85);
  filter: brightness(1.15);
}

/* 弹窗过渡 */
.modal-enter-active { transition: opacity 0.25s ease; }
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .coord-panel { animation: panelIn 0.3s cubic-bezier(0.34, 1.4, 0.64, 1); }

@keyframes panelIn {
  from { opacity: 0; transform: translateY(16px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 768px) {
  .starmap-legend {
    top: 18px;
    left: 18px;
  }
  .enter-site {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
    bottom: 14%;
  }
  .enter-site:hover {
    transform: translateX(-50%);
  }
  .starmap-actions {
    right: 18px;
    bottom: 56px;
    gap: 16px;
  }
  .starmap-hint {
    left: 18px;
    bottom: 20px;
    max-width: calc(100vw - 36px);
    overflow: hidden;
  }
}
</style>
