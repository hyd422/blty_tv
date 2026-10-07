<template>
  <div class="douyin-page">
    <div class="page-header">
      <h2 class="page-title">抖音</h2>
      <span class="page-subtitle">{{ loaded ? `共 ${total} 条内容` : '加载中…' }}</span>
    </div>

    <!-- 内容类型筛选 -->
    <div class="filter-bar type-filter" v-if="loaded">
      <span
        v-for="t in typeFilterList"
        :key="t.key"
        class="filter-chip"
        :class="{ active: activeType === t.key }"
        @click="activeType = t.key"
      >{{ t.label }}<span class="chip-count">{{ typeCount(t.key) }}</span></span>
    </div>

    <!-- 重新打乱 -->
    <div class="filter-bar" v-if="loaded">
      <span class="filter-chip shuffle-chip" @click="reshuffle">🔀 重新打乱</span>
    </div>

    <div class="douyin-grid" v-if="loaded">
      <a
        v-for="(item, idx) in visibleList"
        :key="item.aweme_id"
        class="douyin-card"
        :href="item.aweme_url"
        target="_blank"
        rel="noopener noreferrer"
        @click="onCardClick(item)"
      >
        <div class="douyin-thumb">
          <img
            :src="normalizeCoverUrl(item.cover_url)"
            :alt="item.title"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            @error="onImgError($event, item)"
          />
          <span class="douyin-num">{{ String(idx + 1).padStart(2, '0') }}</span>
          <span
            class="douyin-type-tag"
            :class="item._cocreate ? 'co-create-tag' : item._source === 'zyx' ? 'src-zyx' : 'src-bxy'"
          >{{ item._cocreate ? '共创' : item._source === 'zyx' ? '朱怡欣' : '柏欣妤' }}</span>
          <span v-if="getTypeLabel(item.aweme_type)" class="douyin-type-subtag">{{ getTypeLabel(item.aweme_type) }}</span>
        </div>
        <div class="douyin-info">
          <h3 class="douyin-title">{{ cleanTitle(item.title) }}</h3>
          <div class="douyin-meta">
            <span class="meta-item">❤️ {{ formatCount(item.liked_count) }}</span>
            <span class="meta-item">💬 {{ formatCount(item.comment_count) }}</span>
            <span class="meta-item">↗ {{ formatCount(item.share_count) }}</span>
          </div>
          <p class="douyin-date">{{ formatDate(item.create_time) }}</p>
        </div>
      </a>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-tip">加载中…</div>
    <div v-else-if="loadError" class="loading-tip error">{{ loadError }}</div>
    <div v-else-if="loaded && visibleList.length === 0" class="loading-tip">该筛选条件下暂无内容</div>
    <div v-else-if="loaded && visibleList.length >= totalFiltered" class="loading-tip">没有更多了 · 共 {{ totalFiltered }} 条</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const emit = defineEmits(['douyin-click'])

// 两人的抖音数据源
const DATA_FILES = [
  { file: '/douyin/creator_contents_2026-08-16.jsonl', source: 'zyx' },          // 朱怡欣
  { file: '/douyin/creator_contents_2026-08-17_0125yep.jsonl', source: 'bxy' }   // 柏欣妤
]

// 已随机打乱的完整列表
const shuffledList = ref([])
const loaded = ref(false)
const loading = ref(false)
const loadError = ref('')

// 内容类型筛选（aweme_type: 0=视频，51=合拍，68=图文；cocreate=共创）
const typeFilterList = [
  { label: '全部', key: 'all' },
  { label: '共创', key: 'cocreate' },
  { label: '视频', key: '0' },
  { label: '合拍', key: '51' },
  { label: '图文', key: '68' }
]
const activeType = ref('all')

const total = computed(() => shuffledList.value.length)

// 封面加载失败（受限 bucket / 签名失效）的 aweme_id 集合
const failedCoverIds = ref(new Set())

// 按类型筛选，保持打乱后的相对顺序
const filteredList = computed(() => {
  const all = shuffledList.value
  if (activeType.value === 'all') return all
  if (activeType.value === 'cocreate') {
    return all.filter(item => item._cocreate)
  }
  return all.filter(item => String(item.aweme_type) === activeType.value)
})

// 失败卡片沉底：有封面的保持打乱顺序排在前面，失效卡片集中到列表末尾
const displayList = computed(() => {
  const failed = failedCoverIds.value
  const ok = []
  const bad = []
  for (const item of filteredList.value) {
    if (failed.has(item.aweme_id)) bad.push(item)
    else ok.push(item)
  }
  return ok.concat(bad)
})

const totalFiltered = computed(() => filteredList.value.length)

// 按类型统计数量
function typeCount(key) {
  const all = shuffledList.value
  if (key === 'all') return total.value
  if (key === 'cocreate') return all.filter(item => item._cocreate).length
  return all.filter(item => String(item.aweme_type) === key).length
}

// 无限滚动：初始 12 条，每次追加 12 条
const PAGE_SIZE = 12
const visibleCount = ref(PAGE_SIZE)
const visibleList = computed(() => displayList.value.slice(0, visibleCount.value))

// 切换筛选时重置分页并回到顶部
watch(activeType, () => {
  visibleCount.value = PAGE_SIZE
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

function reshuffle() {
  shuffledList.value = shuffle(shuffledList.value)
  visibleCount.value = PAGE_SIZE
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function loadMore() {
  if (loading.value || !loaded.value) return
  if (visibleCount.value >= totalFiltered.value) return
  visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, totalFiltered.value)
}

function onScroll() {
  if (visibleCount.value >= totalFiltered.value) return
  const scrollTop = window.scrollY
  const winH = window.innerHeight
  const docH = document.documentElement.scrollHeight
  if (docH - scrollTop - winH < 400) loadMore()
}

// Fisher-Yates 随机打乱
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

onMounted(async () => {
  window.addEventListener('scroll', onScroll, { passive: true })
  loading.value = true
  try {
    // 并行加载两人的数据
    const parsed = await Promise.all(
      DATA_FILES.map(async ({ file, source }) => {
        const res = await fetch(file)
        if (!res.ok) return []
        const text = await res.text()
        return text.split('\n').map(l => l.trim()).filter(Boolean)
          .map(line => { try { return JSON.parse(line) } catch { return null } })
          .filter(Boolean)
          .map(item => ({ ...item, _source: source }))
      })
    )

    // 按 aweme_id 合并去重：两人都有的标记为共创，
    // 记录取 last_modify_ts 较大（数据较新）的一条
    const idMap = new Map()
    for (const item of parsed.flat()) {
      const existing = idMap.get(item.aweme_id)
      if (!existing) {
        idMap.set(item.aweme_id, { ...item, _sources: [item._source] })
      } else {
        const sources = new Set([...existing._sources, item._source])
        const keep = (Number(item.last_modify_ts) || 0) > (Number(existing.last_modify_ts) || 0) ? item : existing
        idMap.set(item.aweme_id, { ...keep, _sources: [...sources] })
      }
    }
    const merged = Array.from(idMap.values()).map(item => ({
      ...item,
      _cocreate: item._sources.length > 1
    }))

    // 随机打乱（不按时间排列）
    shuffledList.value = shuffle(merged)
    loaded.value = true
  } catch (e) {
    loadError.value = `数据加载失败：${e.message}`
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

// ===== 工具函数 =====
function num(v) {
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

function formatCount(v) {
  const n = num(v)
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 抖音封面 URL 带时效签名（x-expires/x-signature），过期后签名域名返回 403。
// 改用免签名分发域名并去掉查询参数即可长期访问（部分受限 bucket 除外）。
function normalizeCoverUrl(url) {
  if (!url) return ''
  try {
    const u = new URL(url)
    if (u.hostname.endsWith('douyinpic.com')) {
      u.hostname = 'p3.douyinpic.com'
      u.search = ''
    }
    return u.toString()
  } catch {
    return url
  }
}

// 抖音文案常带换行与话题标签，做简单清理用于卡片展示
function cleanTitle(title) {
  if (!title) return ''
  return title.replace(/\s+/g, ' ').trim()
}

// aweme_type 映射：0=视频，51=合拍，68=图文
function getTypeLabel(t) {
  const map = { '0': '视频', '51': '合拍', '68': '图文' }
  return map[String(t)] || ''
}

function onCardClick(item) {
  emit('douyin-click', item)
}

function onImgError(e, item) {
  // 图片加载失败时显示占位状态，不替换为默认图（遵循项目约定）
  e.target.style.background = '#1a1a1a'
  e.target.style.opacity = '0.3'
  // 标记失效并触发响应式更新，让该卡片沉底、由后面的有封面卡片补位
  if (item && !failedCoverIds.value.has(item.aweme_id)) {
    failedCoverIds.value = new Set([...failedCoverIds.value, item.aweme_id])
  }
}
</script>

<style scoped>
.douyin-page {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 1px;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

/* 类型筛选栏：与操作栏区分，使用更明显的样式 */
.type-filter {
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.type-filter .filter-chip {
  padding: 7px 18px;
  font-size: 13px;
}

/* 操作栏更紧凑 */
.filter-bar:not(.type-filter) {
  margin-top: -14px;
}

.shuffle-chip {
  padding: 5px 14px !important;
  font-size: 12px !important;
  background: transparent !important;
  border-color: transparent !important;
  color: rgba(255, 255, 255, 0.4) !important;
}

.shuffle-chip:hover {
  color: rgba(255, 255, 255, 0.85) !important;
  background: rgba(255, 255, 255, 0.04) !important;
}

.chip-count {
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

.filter-chip.active .chip-count {
  background: rgba(188, 211, 232, 0.2);
  color: #bcd3e8;
}

.filter-chip {
  padding: 6px 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s;
  user-select: none;
}

.filter-chip:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 255, 0.08);
}

.filter-chip.active {
  color: #bcd3e8;
  background: rgba(188, 211, 232, 0.1);
  border-color: rgba(188, 211, 232, 0.4);
}

.douyin-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.douyin-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.douyin-card:hover {
  background: rgba(188, 211, 232, 0.05);
  border-color: rgba(188, 211, 232, 0.25);
  transform: translateY(-4px);
}

.douyin-thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  background: #1a1a1a;
  overflow: hidden;
}

.douyin-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.douyin-card:hover .douyin-thumb img {
  transform: scale(1.05);
}

.douyin-num {
  position: absolute;
  top: 8px;
  left: 8px;
  min-width: 26px;
  height: 26px;
  padding: 0 8px;
  border-radius: 13px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.douyin-type-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 10px;
  border-radius: 10px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

/* 来源标签配色：朱怡欣=蓝色，柏欣妤=银色 */
.src-zyx {
  background: linear-gradient(135deg, #4a9dff, #2f7bff);
}

.src-bxy {
  background: linear-gradient(135deg, #f2f2f2, #bdbdbd);
  color: #1a1a1a;
}

/* 共创标签：金色 */
.co-create-tag {
  background: linear-gradient(135deg, #ffb800, #ff8a00) !important;
  color: #1a1a1a !important;
  box-shadow: 0 2px 8px rgba(255, 138, 0, 0.4);
}

/* 内容类型小标签：位于来源标签下方 */
.douyin-type-subtag {
  position: absolute;
  top: 40px;
  right: 8px;
  padding: 1px 8px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.55);
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px;
  backdrop-filter: blur(4px);
}

.douyin-info {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.douyin-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  color: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 42px;
}

.douyin-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.douyin-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: auto;
}

.loading-tip {
  text-align: center;
  padding: 32px 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

.loading-tip.error {
  color: #ff6b6b;
}

/* 响应式 */
@media (max-width: 992px) {
  .douyin-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 22px;
  }
  .douyin-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .douyin-info {
    padding: 10px 12px 12px;
  }
  .douyin-title {
    font-size: 13px;
    min-height: 38px;
  }
}

@media (max-width: 480px) {
  .douyin-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .douyin-num {
    min-width: 22px;
    height: 22px;
    font-size: 11px;
    padding: 0 6px;
  }
  .douyin-type-tag {
    font-size: 10px;
    padding: 2px 8px;
  }
  .douyin-type-subtag {
    top: 36px;
    font-size: 10px;
  }
}
</style>
