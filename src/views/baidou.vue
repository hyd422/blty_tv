<template>
  <div class="baidou-page">
    <div class="page-header">
      <h2 class="page-title">柏欣妤抖音</h2>
      <span class="page-subtitle">{{ loaded ? `共 ${total} 条内容` : '加载中…' }}</span>
    </div>

    <!-- 排序方式 -->
    <div class="filter-bar" v-if="loaded">
      <span
        v-for="s in sortList"
        :key="s.key"
        class="filter-chip"
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
          <span v-if="getTypeLabel(item.aweme_type)" class="baidou-type-tag">{{ getTypeLabel(item.aweme_type) }}</span>
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
    <div v-else-if="loaded && visibleList.length >= total" class="loading-tip">没有更多了 · 共 {{ total }} 条</div>
    <div v-else-if="loadError" class="loading-tip error">{{ loadError }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['baidou-click'])

// 数据源：public/douyin/creator_contents_2026-08-16_0125yep.jsonl
const DATA_FILE = '/douyin/creator_contents_2026-08-16_0125yep.jsonl'

const rawList = ref([])
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

const total = computed(() => rawList.value.length)

// 排序后的完整列表
const sortedList = computed(() => {
  const arr = [...rawList.value]
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

function loadMore() {
  if (loading.value || !loaded.value) return
  if (visibleCount.value >= total.value) return
  visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, total.value)
}

function onScroll() {
  if (visibleCount.value >= total.value) return
  const scrollTop = window.scrollY
  const winH = window.innerHeight
  const docH = document.documentElement.scrollHeight
  if (docH - scrollTop - winH < 400) loadMore()
}

onMounted(async () => {
  window.addEventListener('scroll', onScroll, { passive: true })
  loading.value = true
  try {
    const res = await fetch(DATA_FILE)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    rawList.value = lines.map(line => {
      try { return JSON.parse(line) } catch { return null }
    }).filter(Boolean)
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
