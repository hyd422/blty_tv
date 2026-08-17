<template>
  <div class="baidou-page">
    <div class="page-header">
      <h2 class="page-title">柏欣妤抖音</h2>
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

    <!-- 排序方式 -->
    <div class="filter-bar" v-if="loaded">
      <span
        v-for="s in sortList"
        :key="s.key"
        class="filter-chip sort-chip"
        :class="{ active: activeSort === s.key }"
        @click="activeSort = s.key"
      >{{ s.label }}</span>
    </div>

    <div class="baidou-grid" v-if="loaded">
      <a
        v-for="(item, idx) in visibleList"
        :key="item.aweme_id"
        class="baidou-card"
        :href="item.aweme_url"
        target="_blank"
        rel="noopener noreferrer"
        @click="onCardClick(item)"
      >
        <div class="baidou-thumb">
          <img
            :src="item.cover_url"
            :alt="item.title"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            @error="onImgError"
          />
          <span class="baidou-num">{{ String(idx + 1).padStart(2, '0') }}</span>
          <span v-if="isCoCreate(item.aweme_id)" class="baidou-type-tag co-create-tag">共创</span>
          <span v-else-if="getTypeLabel(item.aweme_type)" class="baidou-type-tag">{{ getTypeLabel(item.aweme_type) }}</span>
        </div>
        <div class="baidou-info">
          <h3 class="baidou-title">{{ cleanTitle(item.title) }}</h3>
          <div class="baidou-meta">
            <span class="meta-item">❤️ {{ formatCount(item.liked_count) }}</span>
            <span class="meta-item">💬 {{ formatCount(item.comment_count) }}</span>
            <span class="meta-item">↗ {{ formatCount(item.share_count) }}</span>
          </div>
          <p class="baidou-date">{{ formatDate(item.create_time) }}</p>
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

const emit = defineEmits(['baidou-click'])

// 数据源：public/douyin/creator_contents_2026-08-17_0125yep.jsonl
const DATA_FILE = '/douyin/creator_contents_2026-08-17_0125yep.jsonl'
// 对方（朱怡欣）数据，用于计算共创交集
const DATA_FILE_OPPONENT = '/douyin/creator_contents_2026-08-16.jsonl'

const rawList = ref([])
const coCreateIds = ref(new Set()) // 两人共有的 aweme_id 集合
const loaded = ref(false)
const loading = ref(false)
const loadError = ref('')

// 排序方式
const sortList = [
  { label: '最新发布', key: 'newest' },
  { label: '最多点赞', key: 'liked' },
  { label: '最多收藏', key: 'collected' },
  { label: '最多评论', key: 'comment' }
]
const activeSort = ref('newest')

// 内容类型筛选（aweme_type: 0=视频，51=合拍，68=图文；cocreate=共创）
const typeFilterList = [
  { label: '全部', key: 'all' },
  { label: '共创', key: 'cocreate' },
  { label: '视频', key: '0' },
  { label: '合拍', key: '51' },
  { label: '图文', key: '68' }
]
const activeType = ref('all')

const total = computed(() => rawList.value.length)

// 是否为共创视频
function isCoCreate(id) {
  return coCreateIds.value.has(id)
}

// 按类型筛选后的列表
const filteredList = computed(() => {
  if (activeType.value === 'all') return rawList.value
  if (activeType.value === 'cocreate') {
    return rawList.value.filter(item => coCreateIds.value.has(item.aweme_id))
  }
  return rawList.value.filter(item => String(item.aweme_type) === activeType.value)
})

const totalFiltered = computed(() => filteredList.value.length)

// 按类型统计数量
function typeCount(key) {
  if (key === 'all') return total.value
  if (key === 'cocreate') return rawList.value.filter(item => coCreateIds.value.has(item.aweme_id)).length
  return rawList.value.filter(item => String(item.aweme_type) === key).length
}

// 排序后的完整列表（在筛选基础上排序）
const sortedList = computed(() => {
  const arr = [...filteredList.value]
  switch (activeSort.value) {
    case 'liked':
      return arr.sort((a, b) => num(b.liked_count) - num(a.liked_count))
    case 'collected':
      return arr.sort((a, b) => num(b.collected_count) - num(a.collected_count))
    case 'comment':
      return arr.sort((a, b) => num(b.comment_count) - num(a.comment_count))
    case 'newest':
    default:
      return arr.sort((a, b) => b.create_time - a.create_time)
  }
})

// 无限滚动：初始 9 条，每次追加 9 条
const PAGE_SIZE = 9
const visibleCount = ref(PAGE_SIZE)
const visibleList = computed(() => sortedList.value.slice(0, visibleCount.value))

// 切换筛选/排序时重置分页
watch([activeType, activeSort], () => {
  visibleCount.value = PAGE_SIZE
  // 回到顶部，避免停留在已滚动位置导致显示空白
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

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

onMounted(async () => {
  window.addEventListener('scroll', onScroll, { passive: true })
  loading.value = true
  try {
    // 并行加载自己与对方的数据
    const [resSelf, resOpp] = await Promise.all([
      fetch(DATA_FILE),
      fetch(DATA_FILE_OPPONENT)
    ])
    if (!resSelf.ok) throw new Error(`HTTP ${resSelf.status}`)

    const parseLines = (text) => text.split('\n').map(l => l.trim()).filter(Boolean)
      .map(line => { try { return JSON.parse(line) } catch { return null } })
      .filter(Boolean)

    const [selfList, oppList] = await Promise.all([
      resSelf.text().then(parseLines),
      resOpp.ok ? resOpp.text().then(parseLines) : Promise.resolve([])
    ])

    // 按 aweme_id 去重：保留 create_time 最大（最新发布）的记录
    const idMap = new Map()
    for (const item of selfList) {
      const existing = idMap.get(item.aweme_id)
      if (!existing || (Number(item.create_time) || 0) > (Number(existing.create_time) || 0)) {
        idMap.set(item.aweme_id, item)
      }
    }
    rawList.value = Array.from(idMap.values())

    // 计算共创交集：两人 aweme_id 都存在的视频
    const oppIds = new Set(oppList.map(i => i.aweme_id))
    coCreateIds.value = new Set(rawList.value.map(i => i.aweme_id).filter(id => oppIds.has(id)))

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
  emit('baidou-click', item)
}

function onImgError(e) {
  // 图片加载失败时显示占位状态，不替换为默认图（遵循项目约定）
  e.target.style.background = '#1a1a1a'
  e.target.style.opacity = '0.3'
}
</script>

<style scoped>
.baidou-page {
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

/* 类型筛选栏：与排序栏区分，使用更明显的样式 */
.type-filter {
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.type-filter .filter-chip {
  padding: 7px 18px;
  font-size: 13px;
}

/* 排序栏更紧凑 */
.filter-bar:not(.type-filter) {
  margin-top: -14px;
}

.sort-chip {
  padding: 5px 12px !important;
  font-size: 12px !important;
  background: transparent !important;
  border-color: transparent !important;
  color: rgba(255, 255, 255, 0.4) !important;
}

.sort-chip:hover {
  color: rgba(255, 255, 255, 0.85) !important;
  background: rgba(255, 255, 255, 0.04) !important;
}

.sort-chip.active {
  color: #00e700 !important;
  background: rgba(0, 231, 0, 0.08) !important;
  border-color: rgba(0, 231, 0, 0.25) !important;
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
  background: rgba(0, 231, 0, 0.2);
  color: #00e700;
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
  background: rgba(255, 255, 255, 0.08);
}

.filter-chip.active {
  color: #00e700;
  background: rgba(0, 231, 0, 0.1);
  border-color: rgba(0, 231, 0, 0.4);
}

.baidou-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.baidou-card {
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

.baidou-card:hover {
  background: rgba(0, 231, 0, 0.05);
  border-color: rgba(0, 231, 0, 0.25);
  transform: translateY(-4px);
}

.baidou-thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  background: #1a1a1a;
  overflow: hidden;
}

.baidou-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.baidou-card:hover .baidou-thumb img {
  transform: scale(1.05);
}

.baidou-num {
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

.baidou-type-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 10px;
  border-radius: 10px;
  background: rgba(0, 231, 0, 0.85);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

/* 共创标签：金色，区别于普通类型 */
.co-create-tag {
  background: linear-gradient(135deg, #ffb800, #ff8a00) !important;
  color: #1a1a1a !important;
  box-shadow: 0 2px 8px rgba(255, 138, 0, 0.4);
}

.baidou-info {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.baidou-title {
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

.baidou-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.baidou-date {
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
  .baidou-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 22px;
  }
  .baidou-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .baidou-info {
    padding: 10px 12px 12px;
  }
  .baidou-title {
    font-size: 13px;
    min-height: 38px;
  }
}

@media (max-width: 480px) {
  .baidou-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .baidou-num {
    min-width: 22px;
    height: 22px;
    font-size: 11px;
    padding: 0 6px;
  }
  .baidou-type-tag {
    font-size: 10px;
    padding: 2px 8px;
  }
}
</style>
