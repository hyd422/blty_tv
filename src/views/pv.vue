<template>
  <div class="pv-page">
    <div class="page-header">
      <h2 class="page-title">PV 合集</h2>
      <span class="page-subtitle">音乐作品 / 概念短片 / 花絮 一站式收藏</span>
    </div>

    <!-- 分类筛选 -->
    <div class="filter-bar">
      <span
        v-for="t in typeList"
        :key="t.key"
        class="filter-chip"
        :class="{ active: activeType === t.key }"
        @click="activeType = t.key"
      >{{ t.label }}</span>
    </div>

    <!-- PV 网格 -->
    <div class="pv-grid">
      <div
        v-for="(item, idx) in filteredList"
        :key="idx"
        class="pv-card"
        @click="onPvClick(item)"
      >
        <div class="pv-thumb">
          <img
            :src="item.cover"
            :alt="item.title"
            loading="lazy"
            @error="onImgError($event)"
          />
          <span class="pv-duration">{{ item.duration }}</span>
          <div class="pv-tag" :class="tagClass(item.type)">{{ getTypeLabel(item.type) }}</div>
          <div class="play-overlay"></div>
        </div>
        <div class="pv-info">
          <h3 class="pv-title">{{ item.title }}</h3>
          <div class="pv-meta">
            <span class="pv-date">📅 {{ item.date }}</span>
            <span class="pv-views">▶ {{ item.views }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredList.length === 0" class="empty-tip">
      <p>暂无相关 PV</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['pv-click'])

const typeList = [
  { label: '全部', key: 'all' },
  { label: '官方 MV', key: 'mv' },
  { label: '幕后花絮', key: 'bts' },
  { label: '粉丝二创', key: 'fanmade' }
]

const activeType = ref('all')

const pvList = ref([
  { title: '关于绿茶如何登堂入室', type: 'mv', views: '73.5万', duration: '03:22', cover: 'assets/pictures/71.jpg', bilibili: ' https://b23.tv/ETMiSUY' },
  { title: '夏之回忆 官方 Intro', type: 'mv', views: '128.6万', duration: '04:22', cover: 'assets/pictures/72.jpg', bilibili: ' https://b23.tv/Cd5sAuo' },
  { title: '行走的鱼 粉丝二创', type: 'fanmade', views: '49.6万', duration: '18:44', cover: 'assets/pictures/70.jpg', bilibili: '  https://b23.tv/RqN9Sai' },
  { title: 'First Love 幕后花絮', type: 'bts', views: '128.6万', duration: '04:22', cover: 'assets/pictures/74.jpg', bilibili: 'https://b23.tv/dpVpXNl' },
  { title: 'First Love 官方 intro', type: 'mv', views: '86.3万', duration: '03:48', cover: 'assets/pictures/6.jpg', bilibili: 'https://b23.tv/t6OKpfG' },
  { title: 'First Love 官方 MV', type: 'mv', views: '128.6万', duration: '04:22', cover: 'assets/pictures/6.jpg', bilibili: ' https://b23.tv/uPUEUAk' },
  { title: '绿茶登堂入室 幕后花絮', type: 'bts', views: '57.9万', duration: '12:30', cover: 'assets/pictures/67.jpg', bilibili: 'https://b23.tv/Op4xctC' },
  { title: 'you are my sunshine 粉丝二创', type: 'fanmade', views: '41.2万', duration: '05:16', cover: 'assets/pictures/69.jpg', bilibili: 'https://b23.tv/5w0RHnn' },
  { title: '出差和美女上司住一间房', type: 'mv', views: '203.1万', duration: '03:55', cover: 'assets/pictures/75.jpg', bilibili: ' https://b23.tv/stv9h8u' },
  { title: '居家厨房play', type: 'mv', views: '112.7万', duration: '02:40', cover: 'assets/pictures/77.jpg', bilibili: ' https://b23.tv/JB3VWx4' },
  { title: '私人信号 KV 拍摄花絮', type: 'bts', views: '68.4万', duration: '15:08', cover: 'assets/pictures/76.jpg', bilibili: ' https://b23.tv/RaW6rwo' },
  { title: '暧昧 粉丝二创', type: 'fanmade', views: '95.8万', duration: '04:47', cover: 'assets/pictures/68.jpg', bilibili: ' https://b23.tv/nzjO3oL' },
  { title: '日常向逛宜家', type: 'mv', views: '152.4万', duration: '05:12', cover: 'assets/pictures/78.jpg', bilibili: 'https://b23.tv/cWU7epL' },
  { title: '心跳花火 幕后花絮', type: 'bts', views: '73.5万', duration: '03:22', cover: 'assets/pictures/79.jpg', bilibili: ' https://b23.tv/lOFaO81' },
  { title: '夏之回忆 幕后花絮', type: 'bts', views: '49.6万', duration: '18:44', cover: 'assets/pictures/2.jpg', bilibili: '  https://b23.tv/umyTNwr' },
  { title: '太阳 粉丝二创', type: 'fanmade', views: '35.7万', duration: '03:36', cover: 'assets/pictures/73.jpg', bilibili: '  https://b23.tv/2HnRB2f' }
])

const filteredList = computed(() => {
  if (activeType.value === 'all') return pvList.value
  return pvList.value.filter(v => v.type === activeType.value)
})

function getTypeLabel(key) {
  const t = typeList.find(x => x.key === key)
  return t ? t.label : ''
}

function tagClass(key) {
  return 'tag-' + key
}

function onImgError(e) {
  e.target.src = 'assets/pictures/main.jpg'
}

function onPvClick(item) {
  if (item.bilibili) {
    window.open(item.bilibili, '_blank', 'noopener,noreferrer')
  }
  emit('pv-click', item)
}
</script>

<style scoped>
.pv-page {
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
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.filter-chip {
  font-size: 13px;
  padding: 6px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.filter-chip:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
}

.filter-chip.active {
  color: #00e700;
  background: rgba(0, 231, 0, 0.08);
  border-color: rgba(0, 231, 0, 0.35);
  font-weight: 600;
}

.pv-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px 24px;
  margin-bottom: 40px;
}

.pv-card {
  cursor: pointer;
  transition: all 0.3s;
}

.pv-card:hover {
  transform: translateY(-6px);
}

.pv-thumb {
  position: relative;
  width: 100%;
  padding-top: 62%;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
  background: #1a1a1a;
}

.pv-thumb img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.pv-card:hover .pv-thumb img {
  transform: scale(1.06);
}

.pv-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 2;
  font-size: 12px;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.65);
  padding: 2px 8px;
  border-radius: 4px;
}

.pv-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  padding: 3px 10px;
  border-radius: 6px;
}

.tag-mv      { background: rgba(0, 231, 0, 0.82); }
.tag-bts     { background: rgba(255, 140, 26, 0.9); }
.tag-fanmade { background: rgba(236, 64, 122, 0.9); }

.pv-thumb::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.6) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.pv-card:hover .pv-thumb::after {
  opacity: 1;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  width: 56px;
  height: 56px;
  background: rgba(0, 231, 0, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
  z-index: 2;
}

.pv-card:hover .play-overlay {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.play-overlay::before {
  content: '';
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 10px 0 10px 16px;
  border-color: transparent transparent transparent #ffffff;
  margin-left: 4px;
}

.pv-info {
  padding: 0 4px;
}

.pv-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.45;
  color: #ffffff;
  transition: color 0.2s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pv-card:hover .pv-title {
  color: #00e700;
}

.pv-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  gap: 10px;
  flex-wrap: wrap;
}

.empty-tip {
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
}

@media (max-width: 992px) {
  .pv-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .pv-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 12px;
  }
  .page-title {
    font-size: 22px;
  }
}

@media (max-width: 400px) {
  .pv-grid {
    grid-template-columns: 1fr;
  }
}
</style>
