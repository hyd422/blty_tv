<template>
  <div class="baiweibo-page">
    <div class="page-header">
      <h2 class="page-title">🐶 柏欣妤微博</h2>
      <span class="page-subtitle">{{ loaded ? `共 ${total} 条微博` : '加载中…' }}</span>
    </div>

    <!-- ===== 搜索 / 筛选区 ===== -->
    <div class="filter-panel">
      <!-- 账号筛选：大号 / 小号 -->
      <div class="account-row">
        <span
          v-for="a in accountFilterList"
          :key="a.key"
          class="account-chip"
          :class="{ active: activeAccount === a.key }"
          @click="activeAccount = a.key; applyFilters()"
        >{{ a.label }}<span class="chip-count">{{ accountCount(a.key) }}</span></span>
      </div>

      <!-- 关键词搜索 -->
      <div class="search-row">
        <div class="search-input-bar">
          <span class="s-icon">🔍</span>
          <input
            v-model="localKeyword"
            type="text"
            placeholder="搜索微博内容（关键词 / 话题 / 表情）"
            @keypress.enter="applyFilters"
            @input="onKwInput"
          />
          <button v-if="localKeyword" class="s-clear" @click="clearKw" title="清空">✕</button>
        </div>
        <button class="s-btn" @click="applyFilters">搜索</button>
      </div>

      <!-- 时间检索 -->
      <div class="time-row">
        <label class="time-label">📅 时间范围</label>
        <input
          v-model="timeStart"
          type="date"
          class="time-input"
          @change="applyFilters"
        />
        <span class="time-sep">至</span>
        <input
          v-model="timeEnd"
          type="date"
          class="time-input"
          @change="applyFilters"
        />
        <button class="time-quick" @click="setQuickTime(0)">最近7天</button>
        <button class="time-quick" @click="setQuickTime(1)">最近30天</button>
        <button class="time-quick" @click="setQuickTime(2)">今年</button>
        <button class="time-quick time-clear" @click="clearTime">清除</button>
      </div>

      <!-- 排序方式 + 已选条件标签 -->
      <div class="sort-row">
        <div class="sort-chips">
          <span
            v-for="s in sortList"
            :key="s.key"
            class="sort-chip"
            :class="{ active: activeSort === s.key }"
            @click="activeSort = s.key; applySort()"
          >{{ s.label }}</span>
        </div>
        <div class="active-filters" v-if="activeFilterCount > 0">
          <span class="filter-label">已选：</span>
          <span v-if="activeAccount !== 'all'" class="filter-tag" @click="clearAccount">
            👤 {{ accountLabel(activeAccount) }} <em>✕</em>
          </span>
          <span v-if="localKeyword" class="filter-tag" @click="clearKw">🔎 {{ localKeyword }} <em>✕</em></span>
          <span v-if="timeStart || timeEnd" class="filter-tag" @click="clearTime">
            📅 {{ timeStart || '不限' }} ~ {{ timeEnd || '不限' }} <em>✕</em>
          </span>
          <span class="filter-result-count">共 {{ totalFiltered }} 条匹配</span>
        </div>
      </div>
    </div>

    <!-- ===== 微博卡片列表 ===== -->
    <div class="weibo-list" v-if="loaded && visibleList.length > 0">
      <a
        v-for="(item, idx) in visibleList"
        :key="item.note_id"
        class="weibo-card"
        :href="item.note_url"
        target="_blank"
        rel="noopener noreferrer"
        @click="onCardClick(item)"
      >
        <div class="weibo-left">
          <span class="weibo-num">{{ String(idx + 1).padStart(3, '0') }}</span>
        </div>
        <div class="weibo-right">
          <div class="weibo-header">
            <span class="weibo-nick">{{ item.nickname || '柏欣妤' }}</span>
            <span class="weibo-account-tag" :class="accountClass(item.nickname)">{{ accountLabel(accountKey(item.nickname)) }}</span>
            <span class="weibo-time">{{ formatDateTime(item.create_time) }}</span>
          </div>
          <p class="weibo-content" v-html="formatContent(item.content)"></p>
          <div class="weibo-footer">
            <span class="foot-item">❤️ {{ formatCount(item.liked_count) }}</span>
            <span class="foot-item">💬 {{ formatCount(item.comments_count) }}</span>
            <span class="foot-item">↗ {{ formatCount(item.shared_count) }}</span>
            <span class="foot-link" @click.stop="openNote(item.note_url)">📷 查看原微博</span>
          </div>
        </div>
      </a>
    </div>

    <!-- ===== 状态提示 ===== -->
    <div v-if="loading" class="loading-tip">加载中…</div>
    <div v-else-if="loadError" class="loading-tip error">{{ loadError }}</div>
    <div v-else-if="loaded && totalFiltered === 0 && activeFilterCount > 0" class="empty-tip">
      <p class="empty-icon">🔍</p>
      <p>未找到匹配的微博</p>
      <p class="empty-hint">试试调整关键词或时间范围</p>
    </div>
    <div v-else-if="loaded && visibleList.length >= totalFiltered && totalFiltered > 0" class="loading-tip">
      没有更多了 · 共 {{ totalFiltered }} 条
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const emit = defineEmits(['baiweibo-click'])

const DATA_FILE = '/weibo/baiweibo20260817.jsonl'

const rawList = ref([])
const loaded = ref(false)
const loading = ref(false)
const loadError = ref('')

// 搜索 / 筛选
const localKeyword = ref('')
const activeKeyword = ref('')
const timeStart = ref('')
const timeEnd = ref('')

// 防抖：关键词输入后 300ms 自动筛选
let kwTimer = null
function onKwInput() {
  clearTimeout(kwTimer)
  kwTimer = setTimeout(() => applyFilters(), 300)
}

function clearKw() {
  localKeyword.value = ''
  applyFilters()
}

function clearTime() {
  timeStart.value = ''
  timeEnd.value = ''
  applyFilters()
}

function setQuickTime(type) {
  const today = new Date()
  const end = formatDateInput(today)
  let startD = new Date()
  if (type === 0) startD.setDate(today.getDate() - 6)
  else if (type === 1) startD.setDate(today.getDate() - 29)
  else if (type === 2) startD = new Date(today.getFullYear(), 0, 1)
  timeStart.value = formatDateInput(startD)
  timeEnd.value = end
  applyFilters()
}

function formatDateInput(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 排序
const sortList = [
  { label: '最新发布', key: 'newest' },
  { label: '最多点赞', key: 'liked' },
  { label: '最多评论', key: 'comment' },
  { label: '最多转发', key: 'shared' }
]
const activeSort = ref('newest')

// 账号筛选：S***妤 = 大号，就***波 = 小号
const accountFilterList = [
  { label: '全部', key: 'all' },
  { label: '👑 大号', key: 'big' },
  { label: '🐣 小号', key: 'small' }
]
const activeAccount = ref('all')

// nickname → 账号 key
function accountKey(nickname) {
  const n = nickname || ''
  if (n.startsWith('S')) return 'big'
  if (n.startsWith('就')) return 'small'
  return 'other'
}

function accountLabel(key) {
  if (key === 'big') return '大号'
  if (key === 'small') return '小号'
  if (key === 'other') return '其他'
  return '全部'
}

function accountClass(nickname) {
  const k = accountKey(nickname)
  return {
    'tag-big': k === 'big',
    'tag-small': k === 'small',
    'tag-other': k === 'other'
  }
}

function accountCount(key) {
  if (key === 'all') return rawList.value.length
  return rawList.value.filter(i => accountKey(i.nickname) === key).length
}

function clearAccount() {
  activeAccount.value = 'all'
  applyFilters()
}

const total = computed(() => rawList.value.length)

const activeFilterCount = computed(() => {
  let c = 0
  if (activeAccount.value !== 'all') c++
  if (activeKeyword.value) c++
  if (timeStart.value || timeEnd.value) c++
  return c
})

// 应用筛选后得到的列表
const filteredList = computed(() => {
  let list = rawList.value

  // 账号筛选
  if (activeAccount.value !== 'all') {
    list = list.filter(item => accountKey(item.nickname) === activeAccount.value)
  }

  // 关键词筛选
  if (activeKeyword.value) {
    const kw = activeKeyword.value.toLowerCase().trim()
    if (kw) {
      list = list.filter(item => {
        const content = (item.content || '').toLowerCase()
        return content.includes(kw)
      })
    }
  }

  // 时间筛选
  if (timeStart.value || timeEnd.value) {
    const startTs = timeStart.value ? (new Date(timeStart.value + 'T00:00:00').getTime() / 1000) : -Infinity
    const endTs = timeEnd.value ? (new Date(timeEnd.value + 'T23:59:59').getTime() / 1000) : Infinity
    list = list.filter(item => {
      const t = Number(item.create_time)
      return t >= startTs && t <= endTs
    })
  }

  return list
})

// 在筛选基础上排序后的列表
const sortedList = computed(() => {
  const arr = [...filteredList.value]
  switch (activeSort.value) {
    case 'liked':
      return arr.sort((a, b) => num(b.liked_count) - num(a.liked_count))
    case 'comment':
      return arr.sort((a, b) => num(b.comments_count) - num(a.comments_count))
    case 'shared':
      return arr.sort((a, b) => num(b.shared_count) - num(a.shared_count))
    case 'newest':
    default:
      return arr.sort((a, b) => b.create_time - a.create_time)
  }
})

const totalFiltered = computed(() => sortedList.value.length)

// 无限滚动
const PAGE_SIZE = 15
const visibleCount = ref(PAGE_SIZE)
const visibleList = computed(() => sortedList.value.slice(0, visibleCount.value))

// 筛选 / 排序变化时重置分页
function applyFilters() {
  activeKeyword.value = localKeyword.value.trim()
  visibleCount.value = PAGE_SIZE
}

function applySort() {
  visibleCount.value = PAGE_SIZE
  nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
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

onMounted(async () => {
  window.addEventListener('scroll', onScroll, { passive: true })
  loading.value = true
  try {
    const res = await fetch(DATA_FILE)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    const parsed = text.split('\n').map(l => l.trim()).filter(Boolean)
      .map(line => { try { return JSON.parse(line) } catch { return null } })
      .filter(Boolean)

    // 按 note_id 去重：保留 last_modify_ts 最大（最新抓取）的记录
    const idMap = new Map()
    for (const item of parsed) {
      const existing = idMap.get(item.note_id)
      if (!existing || (Number(item.last_modify_ts) || 0) > (Number(existing.last_modify_ts) || 0)) {
        idMap.set(item.note_id, item)
      }
    }
    rawList.value = Array.from(idMap.values())

    loaded.value = true
  } catch (e) {
    loadError.value = `数据加载失败：${e.message}`
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  clearTimeout(kwTimer)
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

function formatDateTime(ts) {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

// 微博内容：关键词高亮 + 换行处理
function formatContent(content) {
  if (!content) return ''
  let html = escapeHtml(content)

  // 关键词高亮
  if (activeKeyword.value) {
    const kw = activeKeyword.value.trim()
    if (kw) {
      const escKw = escapeRegExp(kw)
      html = html.replace(new RegExp(escKw, 'gi'), (m) => `<mark>${m}</mark>`)
    }
  }

  // 换行 -> <br>
  html = html.replace(/\n/g, '<br>')
  return html
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function onCardClick(item) {
  emit('baiweibo-click', item)
}

function openNote(url) {
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.baiweibo-page {
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

/* ===== 筛选面板 ===== */
.filter-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 账号筛选行 */
.account-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.account-chip {
  padding: 7px 18px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s;
  user-select: none;
  display: inline-flex;
  align-items: center;
}

.account-chip:hover {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.1);
}

.account-chip.active {
  color: #56b4ff;
  background: rgba(86, 180, 255, 0.12);
  border-color: rgba(86, 180, 255, 0.5);
  box-shadow: 0 2px 8px rgba(86, 180, 255, 0.15);
}

.chip-count {
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

.account-chip.active .chip-count {
  background: rgba(86, 180, 255, 0.25);
  color: #56b4ff;
}

/* 关键词搜索行 */
.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input-bar {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 4px 6px 4px 18px;
  transition: all 0.25s;
}

.search-input-bar:focus-within {
  border-color: rgba(86, 180, 255, 0.4);
  background: rgba(255, 255, 255, 0.08);
}

.s-icon {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-right: 8px;
}

.search-input-bar input {
  flex: 1;
  height: 36px;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
}

.search-input-bar input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.s-clear {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.s-clear:hover {
  background: rgba(255, 100, 100, 0.2);
  color: #ff6b6b;
}

.s-btn {
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #56b4ff, #2691e8);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.s-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 180, 255, 0.35);
}

/* 时间检索行 */
.time-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.time-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
}

.time-input {
  height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 13px;
  outline: none;
  color-scheme: dark;
  transition: all 0.2s;
}

.time-input:focus {
  border-color: rgba(86, 180, 255, 0.4);
  background: rgba(255, 255, 255, 0.08);
}

.time-sep {
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

.time-quick {
  height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.time-quick:hover {
  background: rgba(86, 180, 255, 0.1);
  border-color: rgba(86, 180, 255, 0.2);
  color: #56b4ff;
}

.time-clear {
  margin-left: auto;
  color: rgba(255, 255, 255, 0.4);
}

.time-clear:hover {
  background: rgba(255, 100, 100, 0.15);
  border-color: rgba(255, 100, 100, 0.3);
  color: #ff6b6b;
}

/* 排序 / 已选条件行 */
.sort-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.sort-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sort-chip {
  padding: 5px 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.sort-chip:hover {
  color: rgba(255, 255, 255, 0.85);
}

.sort-chip.active {
  color: #56b4ff;
  background: rgba(86, 180, 255, 0.1);
  border-color: rgba(86, 180, 255, 0.3);
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(86, 180, 255, 0.1);
  color: #56b4ff;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid rgba(86, 180, 255, 0.2);
  transition: all 0.2s;
}

.filter-tag:hover {
  background: rgba(255, 100, 100, 0.15);
  border-color: rgba(255, 100, 100, 0.3);
  color: #ff6b6b;
}

.filter-tag em {
  font-style: normal;
  font-size: 10px;
  opacity: 0.7;
}

.filter-result-count {
  font-size: 12px;
  color: #56b4ff;
  font-weight: 600;
}

/* ===== 微博卡片 ===== */
.weibo-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.weibo-card {
  display: flex;
  gap: 18px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.weibo-card:hover {
  background: rgba(86, 180, 255, 0.04);
  border-color: rgba(86, 180, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.weibo-left {
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.weibo-num {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  background: rgba(86, 180, 255, 0.12);
  color: #56b4ff;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weibo-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.weibo-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.weibo-nick {
  font-size: 14px;
  font-weight: 700;
  color: #56b4ff;
}

/* 卡片账号徽标 */
.weibo-account-tag {
  padding: 2px 9px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
}

.tag-big {
  background: rgba(86, 180, 255, 0.18);
  color: #56b4ff;
  border: 1px solid rgba(86, 180, 255, 0.3);
}

.tag-small {
  background: rgba(255, 138, 200, 0.18);
  color: #ff8ac8;
  border: 1px solid rgba(255, 138, 200, 0.3);
}

.tag-other {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.weibo-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

.weibo-content {
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  white-space: normal;
  word-break: break-word;
  margin: 0;
}

/* 关键词高亮 */
.weibo-content :deep(mark) {
  background: rgba(86, 180, 255, 0.35);
  color: #c8e4ff;
  padding: 0 3px;
  border-radius: 3px;
}

.weibo-footer {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px dashed rgba(255, 255, 255, 0.05);
}

.foot-item {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.foot-link {
  font-size: 12px;
  color: #56b4ff;
  font-weight: 600;
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(86, 180, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.foot-link:hover {
  background: rgba(86, 180, 255, 0.2);
  transform: translateY(-1px);
}

.loading-tip {
  text-align: center;
  padding: 40px 0;
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
@media (max-width: 768px) {
  .page-title {
    font-size: 22px;
  }
  .filter-panel {
    padding: 14px;
    gap: 12px;
  }
  .search-row {
    flex-direction: column;
    align-items: stretch;
  }
  .s-btn {
    width: 100%;
  }
  .weibo-card {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
  .weibo-left {
    display: none;
  }
  .weibo-content {
    font-size: 14px;
    line-height: 1.7;
  }
  .sort-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .time-clear {
    margin-left: 0;
  }
}
</style>
