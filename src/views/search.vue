<template>
  <div class="search-page">
    <div class="page-header">
      <h2 class="page-title">搜索结果</h2>
      <span class="page-subtitle" v-if="keyword">
        “{{ keyword }}” · {{ loaded ? `共 ${totalFiltered} 条` : '加载中…' }}
      </span>
      <span class="page-subtitle" v-else>请输入搜索关键词</span>
    </div>

    <!-- 搜索框（页内二次搜索） -->
    <div class="search-input-bar" v-if="loaded || keyword">
      <span class="s-icon">🔍</span>
      <input
        v-model="localKeyword"
        type="text"
        placeholder="搜索抖音标题 / 文案 / 话题"
        @keypress.enter="doSearch"
      />
      <button class="s-btn" @click="doSearch">搜索</button>
    </div>

    <!-- 来源筛选 -->
    <div class="filter-bar type-filter" v-if="loaded">
      <span
        v-for="t in sourceFilterList"
        :key="t.key"
        class="filter-chip"
        :class="{ active: activeSource === t.key }"
        @click="activeSource = t.key"
      >{{ t.label }}<span class="chip-count">{{ sourceCount(t.key) }}</span></span>
    </div>

    <!-- 结果网格 -->
    <div class="search-grid" v-if="loaded && visibleList.length > 0">
      <a
        v-for="(item, idx) in visibleList"
        :key="item.aweme_id + '-' + item._source"
        class="search-card"
        :href="item.aweme_url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="search-thumb">
          <img
            :src="item.cover_url"
            :alt="item.title"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            @error="onImgError"
          />
          <span class="search-num">{{ String(idx + 1).padStart(2, '0') }}</span>
          <span class="search-source-tag" :class="sourceClass(item._source)">{{ sourceLabel(item._source) }}</span>
          <span v-if="item._cocreate" class="search-cocreate-tag">共创</span>
        </div>
        <div class="search-info">
          <h3 class="search-title" v-html="highlight(item.title)"></h3>
          <div class="search-meta">
            <span class="meta-item">❤️ {{ formatCount(item.liked_count) }}</span>
            <span class="meta-item">💬 {{ formatCount(item.comment_count) }}</span>
            <span class="meta-item">↗ {{ formatCount(item.share_count) }}</span>
          </div>
          <p class="search-date">{{ formatDate(item.create_time) }}</p>
        </div>
      </a>
    </div>

    <!-- 状态提示 -->
    <div v-if="loading" class="loading-tip">加载中…</div>
    <div v-else-if="loadError" class="loading-tip error">{{ loadError }}</div>
    <div v-else-if="loaded && keyword && visibleList.length === 0" class="empty-tip">
      <p class="empty-icon">🔍</p>
      <p>未找到与“{{ keyword }}”相关的内容</p>
      <p class="empty-hint">试试其他关键词，如：柏欣妤、朱怡欣、合拍、汽水音乐节</p>
    </div>
    <div v-else-if="loaded && visibleList.length >= totalFiltered && totalFiltered > 0" class="loading-tip">
      没有更多了 · 共 {{ totalFiltered }} 条
    </div>
    <div v-else-if="!keyword && !loading" class="empty-tip">
      <p class="empty-icon">🔍</p>
      <p>在上方输入关键词开始搜索</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  keyword: { type: String, default: '' }
})

// 两个抖音数据源
const DATA_FILES = [
  { file: '/douyin/creator_contents_2026-08-16.jsonl', source: 'zyx' },          // 朱怡欣
  { file: '/douyin/creator_contents_2026-08-16_0125yep.jsonl', source: 'bxy' }   // 柏欣妤
]

const rawList = ref([])         // 合并后的全部数据（带 _source 字段）
const coCreateIds = ref(new Set())
const loaded = ref(false)
const loading = ref(false)
const loadError = ref('')

const localKeyword = ref(props.keyword || '')

// 来源筛选
const sourceFilterList = [
  { label: '全部', key: 'all' },
  { label: '朱怡欣', key: 'zyx' },
  { label: '柏欣妤', key: 'bxy' },
  { label: '共创', key: 'cocreate' }
]
const activeSource = ref('all')

const keyword = computed(() => props.keyword)

// 按关键词 + 来源过滤
const filteredList = computed(() => {
  if (!keyword.value) return []
  const kw = keyword.value.toLowerCase().trim()
  let list = rawList.value

  // 来源筛选
  if (activeSource.value === 'cocreate') {
    list = list.filter(item => item._cocreate)
  } else if (activeSource.value !== 'all') {
    list = list.filter(item => item._source === activeSource.value)
  }

  // 关键词筛选：匹配 title / desc（抖音文案常带 # 话题）
  if (!kw) return list
  return list.filter(item => {
    const title = (item.title || '').toLowerCase()
    const desc = (item.desc || '').toLowerCase()
    return title.includes(kw) || desc.includes(kw)
  })
})

const totalFiltered = computed(() => filteredList.value.length)

function sourceCount(key) {
  if (!keyword.value) {
    if (key === 'all') return rawList.value.length
    if (key === 'cocreate') return rawList.value.filter(i => i._cocreate).length
    return rawList.value.filter(i => i._source === key).length
  }
  const kw = keyword.value.toLowerCase().trim()
  let list = rawList.value
  if (kw) {
    list = list.filter(item => {
      const title = (item.title || '').toLowerCase()
      const desc = (item.desc || '').toLowerCase()
      return title.includes(kw) || desc.includes(kw)
    })
  }
  if (key === 'all') return list.length
  if (key === 'cocreate') return list.filter(i => i._cocreate).length
  return list.filter(i => i._source === key).length
}

// 无限滚动
const PAGE_SIZE = 12
const visibleCount = ref(PAGE_SIZE)
const visibleList = computed(() => filteredList.value.slice(0, visibleCount.value))

// 关键词或来源变化时重置分页
watch([keyword, activeSource], () => {
  visibleCount.value = PAGE_SIZE
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

// 触发二次搜索：通过 URL hash 通知父组件更新 keyword
function doSearch() {
  const kw = localKeyword.value.trim()
  if (!kw) return
  // 通过自定义事件 + hash 双通道：hash 便于父组件监听
  window.location.hash = `search=${encodeURIComponent(kw)}`
}

onMounted(async () => {
  window.addEventListener('scroll', onScroll, { passive: true })
  loading.value = true
  try {
    const results = await Promise.all(
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
    rawList.value = results.flat()

    // 计算共创交集
    const zyxIds = new Set(results[0].map(i => i.aweme_id))
    const bxyIds = new Set(results[1].map(i => i.aweme_id))
    coCreateIds.value = new Set([...zyxIds].filter(id => bxyIds.has(id)))
    rawList.value.forEach(item => {
      item._cocreate = coCreateIds.value.has(item.aweme_id)
    })

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

// 同步父组件传入的关键词到本地输入框
watch(keyword, (v) => {
  localKeyword.value = v || ''
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

function sourceLabel(s) {
  return s === 'zyx' ? '朱怡欣' : '柏欣妤'
}

function sourceClass(s) {
  return s === 'zyx' ? 'src-zyx' : 'src-bxy'
}

// 关键词高亮
function highlight(text) {
  if (!text || !keyword.value) return escapeHtml(cleanTitle(text))
  const kw = keyword.value.trim()
  if (!kw) return escapeHtml(cleanTitle(text))
  const cleaned = cleanTitle(text)
  const escKw = escapeRegExp(kw)
  return escapeHtml(cleaned).replace(new RegExp(escKw, 'gi'), (m) => `<mark>${m}</mark>`)
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function cleanTitle(title) {
  if (!title) return ''
  return title.replace(/\s+/g, ' ').trim()
}

function onImgError(e) {
  e.target.style.background = '#1a1a1a'
  e.target.style.opacity = '0.3'
}
</script>

<style scoped>
.search-page {
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

/* 页内搜索框 */
.search-input-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 6px 6px 6px 18px;
  transition: all 0.25s;
}

.search-input-bar:focus-within {
  border-color: rgba(0, 231, 0, 0.4);
  background: rgba(255, 255, 255, 0.08);
}

.s-icon {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.search-input-bar input {
  flex: 1;
  height: 32px;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
}

.search-input-bar input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.s-btn {
  height: 36px;
  padding: 0 22px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #00e700, #00be00);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.s-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 231, 0, 0.35);
}

.s-btn:active {
  transform: translateY(0);
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.type-filter {
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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

.search-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.search-card {
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

.search-card:hover {
  background: rgba(0, 231, 0, 0.05);
  border-color: rgba(0, 231, 0, 0.25);
  transform: translateY(-4px);
}

.search-thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  background: #1a1a1a;
  overflow: hidden;
}

.search-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.search-card:hover .search-thumb img {
  transform: scale(1.05);
}

.search-num {
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

.search-source-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.src-zyx {
  background: rgba(0, 231, 0, 0.85);
}

.src-bxy {
  background: rgba(86, 156, 255, 0.9);
}

/* 共创标签：金色，叠加在来源标签下方 */
.search-cocreate-tag {
  position: absolute;
  top: 40px;
  right: 8px;
  padding: 2px 10px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ffb800, #ff8a00);
  color: #1a1a1a;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(255, 138, 0, 0.4);
}

.search-info {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.search-title {
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

/* 关键词高亮 */
.search-title :deep(mark) {
  background: rgba(255, 184, 0, 0.3);
  color: #ffb800;
  padding: 0 2px;
  border-radius: 3px;
}

.search-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.search-date {
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

.empty-tip {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-tip p {
  margin-bottom: 8px;
  font-size: 15px;
}

.empty-hint {
  font-size: 13px !important;
  color: rgba(255, 255, 255, 0.3);
}

/* 响应式 */
@media (max-width: 992px) {
  .search-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 22px;
  }
  .search-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .search-info {
    padding: 10px 12px 12px;
  }
  .search-title {
    font-size: 13px;
    min-height: 38px;
  }
}

@media (max-width: 480px) {
  .search-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .search-num {
    min-width: 22px;
    height: 22px;
    font-size: 11px;
    padding: 0 6px;
  }
  .search-source-tag {
    font-size: 10px;
    padding: 2px 8px;
  }
  .search-cocreate-tag {
    top: 36px;
    font-size: 10px;
    padding: 2px 8px;
  }
  .s-btn {
    padding: 0 16px;
    font-size: 12px;
  }
}
</style>
