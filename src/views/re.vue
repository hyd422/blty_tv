<template>
  <div class="re-page">
    <div class="page-header">
      <h2 class="page-title">Re 视频</h2>
      <span class="page-subtitle">同一up主未展示所有视频 请自行在合集中查看</span>
    </div>

    <!-- 视频类型筛选 -->
    <div class="filter-bar">
      <span
        v-for="t in typeList"
        :key="t.key"
        class="filter-chip"
        :class="{ active: activeType === t.key }"
        @click="activeType = t.key"
      >{{ t.label }}</span>
    </div>

    <div class="re-grid">
      <div
        v-for="(item, idx) in filteredList"
        :key="idx"
        class="re-card"
        @click="onReClick(item)"
      >
        <div class="re-thumb">
          <img
            :src="item.cover"
            :alt="item.title"
            loading="lazy"
            decoding="async"
          />
          <span class="re-duration">{{ item.duration }}</span>
          <div class="re-overlay">
            <span class="re-type-tag">{{ getTypeLabel(item.type) }}</span>
          </div>
          <div class="play-overlay"></div>
        </div>
        <div class="re-info">
          <h3 class="re-title">{{ item.title }}</h3>
          <div class="re-meta">
            <span class="up">📺 {{ item.up }}</span>
            <span class="views">▶ {{ item.views }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredList.length === 0" class="empty-tip">
      <p>暂无相关 Reaction 视频</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { cdnImg } from '../utils/img.js'

const emit = defineEmits(['re-click'])

// 分类
const typeList = [
  { label: '全部', key: 'all' },
  { label: '柏里挑怡re', key: 'blty' },
  { label: '柏欣妤re', key: 'bxy' },
  { label: '朱怡欣re', key: 'zyx' }
]

const activeType = ref('all')

// Re 视频列表
const reList = ref([
  { title: '【柏里挑怡1.0 reaction】投稿人用真情侣的名头吸引我 我上当了 就这么简单', type: 'blty', up: '关西以北', views: '12.3万', duration: '15:42', cover: 'assets/pictures/thumb/40.jpg', bilibili: 'https://b23.tv/Fc7hSVO' },
  { title: '【柏里挑怡2.0 充电reaction】零人告诉我会如此刺激 单身美丽女性我们走吧 别被“霸凌”', type: 'blty', up: '关西以北', views: '8.7万', duration: '22:10', cover: 'assets/pictures/thumb/41.jpg', bilibili: 'https://b23.tv/kruNDPC' },
  { title: '【柏里挑怡3.0 充电reaction】试图从一个个视频片段，寻找她们“距离”的变化', type: 'blty', up: '关西以北', views: '25.6万', duration: '18:55', cover: 'assets/pictures/thumb/42.jpg', bilibili: 'https://b23.tv/mXuspge' },
  { title: '【充电专场|柏里挑怡Reaction】全程高甜，给我们看这个是否太超过！原来你们平时吃这么好！好多视频的bgm好好听~', type: 'blty', up: '小同在蔗ing', views: '5.4万', duration: '45:30', cover: 'assets/pictures/thumb/43.jpg', bilibili: 'https://b23.tv/nc2M2jX' },
  { title: '【柏里挑怡reaction】我清楚得知道有多远的距离，也清楚得知道我有多想靠近', type: 'blty', up: '凌扶郁', views: '16.8万', duration: '12:08', cover: 'assets/pictures/thumb/44.jpg', bilibili: 'https://b23.tv/Grjh6rB' },
  { title: '【韩娱路人的reaction之塞纳河cp合集（上）】舞台惊人就算了，怎么感觉cp都好真，果然塞纳河只玩真实的是吧', type: 'blty', up: '唯爱美女的小酒鬼', views: '9.1万', duration: '28:47', cover: 'assets/pictures/thumb/45.jpg', bilibili: 'https://b23.tv/Uxq7KCF' },
  { title: '【(更新至26.8.14) 【柏里挑怡｜Reaction】路人和朋友一起初看『柏欣妤×朱怡欣』，尖叫连连，话唠预警，俩人早期的直播简直不要太好笑', type: 'blty', up: 'Promenad-南安', views: '3.8万', duration: '20:15', cover: 'assets/pictures/thumb/46.jpg', bilibili: 'https://b23.tv/9aTbobi' },
  { title: '【加急充电专场柏里挑怡2.0】路人第二次reaction柏里挑怡，念信好甜完全小说来的!私下完全小学生来的!但是是互相安慰互相陪伴互相鼓励的存在', type: 'blty', up: '小小龟', views: '14.2万', duration: '16:33', cover: 'assets/pictures/thumb/47.jpg', bilibili: 'https://b23.tv/UvX1nSH' },
  { title: '【充电场｜柏里挑怡reaction】就这样捂住耳朵抱紧彼此往前冲吧', type: 'blty', up: '奶芙泡奶', views: '7.6万', duration: '19:02', cover: 'assets/pictures/thumb/48.jpg', bilibili: 'https://b23.tv/0AzjfwN' },
  { title: '【粉丝安利｜柏里挑怡 reaction】从来没嗑过这么真的，诡秘你听我说，这次真的不一样！', type: 'blty', up: '找找早上好呀', views: '11.9万', duration: '14:28', cover: 'assets/pictures/thumb/49.jpg', bilibili: 'https://b23.tv/IcvxEn0' },
  { title: '【韩娱人reaction】这是舞台上！！不是房间里|柏里挑怡（柏欣妤&朱怡欣）cp向reaction', type: 'blty', up: 're完这个世界', views: '4.2万', duration: '32:18', cover: 'assets/pictures/thumb/50.jpg', bilibili: 'https://b23.tv/KmxPX5u' },
  { title: '【充电专场朱怡欣1.0】路人第一次看朱怡欣。美的太超过了!浓妆s感超重，21年简直白月光，我超级爱。光颜值我就看的受不了了!但舞蹈超级好。瓜猪花猪都很好!', type: 'zyx', up: '小小龟', views: '21.5万', duration: '17:44', cover: 'assets/pictures/thumb/51.jpg', bilibili: 'https://b23.tv/g4ddGdy' },
  { title: '【充电专场柏欣妤2.0mc版（含cp向）】看到了柏欣妤更活泼的一面，呆但是又某种程度蛮聪明的小狗。哈哈，但脑回路清奇到真是难以理解了。', type: 'bxy', up: '小小龟', views: '21.5万', duration: '17:44', cover: 'assets/pictures/thumb/52.jpg', bilibili: 'https://b23.tv/JFuOAqz' }
].map(v => ({ ...v, cover: cdnImg(v.cover) })))

const filteredList = computed(() => {
  if (activeType.value === 'all') return reList.value
  return reList.value.filter(v => v.type === activeType.value)
})

function getTypeLabel(key) {
  const t = typeList.find(x => x.key === key)
  return t ? t.label : ''
}

function onReClick(item) {
  if (item.bilibili) {
    window.open(item.bilibili, '_blank', 'noopener,noreferrer')
  }
  emit('re-click', item)
}
</script>

<style scoped>
.re-page {
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

.re-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px 24px;
  margin-bottom: 40px;
}

.re-card {
  cursor: pointer;
  transition: all 0.3s;
}

.re-card:hover {
  transform: translateY(-6px);
}

.re-thumb {
  position: relative;
  width: 100%;
  padding-top: 62%;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
  background: #1a1a1a;
}

.re-thumb img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.re-card:hover .re-thumb img {
  transform: scale(1.06);
}

.re-duration {
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

.re-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
}

.re-type-tag {
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  background: rgba(0, 231, 0, 0.82);
  padding: 3px 10px;
  border-radius: 6px;
}

.re-thumb::after {
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

.re-card:hover .re-thumb::after {
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

.re-card:hover .play-overlay {
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

.re-info {
  padding: 0 4px;
}

.re-title {
  font-size: 15px;
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

.re-card:hover .re-title {
  color: #00e700;
}

.re-meta {
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
  .re-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .re-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 12px;
  }
  .page-title {
    font-size: 22px;
  }
}

@media (max-width: 400px) {
  .re-grid {
    grid-template-columns: 1fr;
  }
}
</style>
