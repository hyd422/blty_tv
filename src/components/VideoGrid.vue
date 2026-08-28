<template>
  <!-- 视频播放区域 -->
  <section class="recommend-section">
    <div class="section-header">
      <h2 class="section-title">视频播放</h2>
      <span class="section-count">共 {{ videoDataAll.length }} 首歌</span>
      <select v-model="sortMode" class="sort-select" title="按时间或次数筛选">
        <option value="time-desc">时间倒序</option>
        <option value="time-asc">时间正序</option>
        <option value="count-desc">表演次数多到少</option>
        <option value="count-asc">表演次数少到多</option>
      </select>
    </div>
    <div class="video-grid">
      <div
        v-for="(video, idx) in visibleVideos"
        :key="idx"
        class="video-card"
        @click="onVideoClick(video)"
      >
        <div class="video-thumb">
          <img
            :src="video.img"
            :alt="video.title"
            loading="lazy"
            decoding="async"
            width="480"
            height="270"
            @load="$event.target.classList.add('loaded')"
          />
          <div class="play-overlay"></div>
          <span class="thumb-index">{{ String(idx + 1).padStart(2, '0') }}</span>
        </div>
        <div class="video-info">
          <h3 class="video-title">{{ video.title }}</h3>
          <p v-if="timesCount(video)" class="video-times">
            <span
              v-for="(t, i) in video.times"
              :key="i"
              class="time-chip"
              :class="{ first: i === 0 }"
            >{{ t }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- 懒加载哨兵：滚动到此元素时加载更多 -->
    <div ref="sentinel" class="lazy-sentinel">
      <span v-if="loading" class="loading-text">加载中...</span>
      <span v-else-if="noMore" class="loading-text">已经到底啦 ✳</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { cdnImg } from '../utils/img.js'

const emit = defineEmits(['video-click'])

// ====== 视频数据：times 为时间描述（格式 'YYYY-MM-DD'，如 '2024-05-20'），可填多个 ======
// 筛选/排序以 times 的第一个时间为基准；次数 = times 数组长度
// 每个条目附带 bilibili 跳转链接，未指定具体 BV 号时默认使用 B 站搜索对应标题
const PAGE_SIZE = 9 // 每次加载9张

// 默认跳转：B 站搜索对应标题；如需指定具体 BV 号，改为 'https://www.bilibili.com/video/BVxxxxxx' 即可
const bv = (keyword) => `https://search.bilibili.com/all?keyword=${encodeURIComponent('柏里挑怡 ' + keyword)}`

const videoDataAll = [
  { title: '夏之回忆',     img: 'assets/pictures/thumb/2.jpg',  times: ['2023-04-22', '2026-03-14', '2026-08-22'],  bilibili: bv('夏之回忆') },
  { title: '不安星',       img: 'assets/pictures/thumb/1.jpg',  times: ['2023-06-03'],  bilibili: bv('不安星') },
  { title: '牛奶香槟',     img: 'assets/pictures/thumb/3.jpg',  times: ['2022-08-10', '2023-06-30', '2023-07-02'],  bilibili: bv('牛奶香槟') },
  { title: '单向镜面',     img: 'assets/pictures/thumb/4.jpg',  times: ['2023-10-04'],  bilibili: bv('单向镜面') },
  { title: '升温',         img: 'assets/pictures/thumb/5.jpg',  times: ['2024-01-13'],  bilibili: bv('升温') },
  { title: 'First Love',   img: 'assets/pictures/thumb/6.jpg',  times: ['2025-03-01'],  bilibili: bv('First Love') },
  { title: '变量',         img: 'assets/pictures/thumb/7.jpg',  times: ['2025-05-24', '2025-11-15'],  bilibili: bv('变量') },
  { title: '月光下',       img: 'assets/pictures/thumb/8.jpg',  times: ['2025-05-24', '2025-11-15', '2026-03-29'],  bilibili: bv('月光下') },
  { title: '暖暖',         img: 'assets/pictures/thumb/9.jpg',  times: ['2025-11-15'],  bilibili: bv('暖暖') },
  { title: 'Whistle',      img: 'assets/pictures/thumb/10.jpg', times: ['2025-02-22'],  bilibili: bv('Whistle') },
  { title: '恋爱告急',     img: 'assets/pictures/thumb/11.jpg', times: ['2022-08-10', '2024-12-21'],  bilibili: bv('恋爱告急') },
  { title: '完美犯罪',     img: 'assets/pictures/thumb/12.jpg', times: ['2022-08-12'],  bilibili: bv('完美犯罪') },
  { title: '爱未央',       img: 'assets/pictures/thumb/13.jpg', times: ['2023-02-25'],  bilibili: bv('爱未央') },
  { title: '噗通噗通',     img: 'assets/pictures/thumb/14.jpg', times: ['2023-05-20'],  bilibili: bv('噗通噗通') },
  { title: '完美超载',     img: 'assets/pictures/thumb/15.jpg', times: ['2025-02-24'],  bilibili: bv('完美超载') },
  { title: '粉红狙击手',   img: 'assets/pictures/thumb/16.jpg', times: ['2025-07-05'],  bilibili: bv('粉红狙击手') },
  { title: '蠢蠢',         img: 'assets/pictures/thumb/17.jpg', times: ['2024-12-21'],  bilibili: bv('蠢蠢') },   
  { title: '专属座位',     img: 'assets/pictures/thumb/18.jpg', times: ['2023-09-24'], bilibili: bv('专属座位') },
  { title: '圈圈点点',     img: 'assets/pictures/thumb/19.jpg', times: ['2024-07-20'], bilibili: bv('圈圈点点') },
  { title: 'Spy',          img: 'assets/pictures/thumb/20.jpg', times: ['2023-07-02'], bilibili: bv('Spy') },
  { title: 'Look Out',      img: 'assets/pictures/thumb/21.jpg', times: ['2025-06-21'], bilibili: bv('Lookout') },
  { title: 'White light',  img: 'assets/pictures/thumb/22.jpg', times: ['2025-06-21'], bilibili: bv('White light') },
  { title: '降落伞',       img: 'assets/pictures/thumb/23.jpg', times: ['2023-10-21'], bilibili: bv('降落伞') },
  { title: '听到请回答',   img: 'assets/pictures/thumb/24.jpg', times: ['2025-05-24', '2026-03-29'], bilibili: bv('听到请回答') },
  { title: '双人舞',       img: 'assets/pictures/thumb/25.jpg', times: ['2024-06-27'], bilibili: bv('双人舞') },
  { title: '四季的爱恋',   img: 'assets/pictures/thumb/26.jpg', times: ['2024-12-21'], bilibili: bv('四季的爱恋') },
  { title: 'circle',       img: 'assets/pictures/thumb/90.jpg', times: ['2025-05-24'], bilibili: bv('circle') },
  { title: 'High light',  img: 'assets/pictures/thumb/27.jpg', times: ['2023-10-21'], bilibili: bv('High light') },
  { title: '呓语',      img: 'assets/pictures/thumb/89.jpg', times: ['2026-08-08'], bilibili: bv('呓语') },
  { title: '调和色',       img: 'assets/pictures/thumb/28.jpg', times: ['2024-01-27'], bilibili: bv('调和色') },
  { title: '忧闭',         img: 'assets/pictures/thumb/29.jpg', times: ['2026-07-11'], bilibili: bv('忧闭') },
  { title: 'My Boy',       img: 'assets/pictures/thumb/30.jpg', times: ['2025-12-14'], bilibili: bv('My Boy') },
  { title: 'City light',  img: 'assets/pictures/thumb/31.jpg', times: ['2023-06-30'], bilibili: bv('City light') },
  { title: '水蒸气',       img: 'assets/pictures/thumb/32.jpg', times: ['2023-07-30'], bilibili: bv('水蒸气') },
  { title: '暗示',         img: 'assets/pictures/thumb/33.jpg', times: ['2026-07-25'], bilibili: bv('暗示') },
  { title: '恋',     img: 'assets/pictures/thumb/83.jpg',  times: ['2026-08-22'], bilibili: bv('恋') },
  { title: '浪漫关系',     img: 'assets/pictures/thumb/84.jpg',  times: ['2026-08-22'], bilibili: bv('浪漫关系') },
  { title: '丘比特的失误',     img: 'assets/pictures/thumb/85.jpg',  times: ['2026-08-22'], bilibili: bv('丘比特的失误') },
  { title: '无神论',     img: 'assets/pictures/thumb/86.jpg',  times: ['2026-08-22'], bilibili: bv('无神论') },
  { title: '爱上你',     img: 'assets/pictures/thumb/87.jpg',  times: ['2026-08-22'], bilibili: bv('爱上你') },
  { title: '爱情讯息',     img: 'assets/pictures/thumb/88.jpg',  times: ['2026-08-22'], bilibili: bv('爱情讯息') },
].map(v => ({ ...v, img: cdnImg(v.img) }))

const TOTAL = videoDataAll.length

// ====== 筛选/排序（默认时间倒序，以 times 第一个时间为基准） ======
const sortMode = ref('time-desc')

const firstTime = (v) => (Array.isArray(v.times) && v.times[0]) || ''
const timesCount = (v) => (Array.isArray(v.times) ? v.times.length : 0)

// 没填时间的条目固定排在最后，其余按当前模式排序
const filteredVideos = computed(() => {
  const list = [...videoDataAll]
  const noTimeLast = (a, b) => {
    const ta = firstTime(a)
    const tb = firstTime(b)
    if (!ta && tb) return 1
    if (ta && !tb) return -1
    return 0
  }
  switch (sortMode.value) {
    case 'time-asc':
      list.sort((a, b) => noTimeLast(a, b) || (firstTime(a) < firstTime(b) ? -1 : firstTime(a) > firstTime(b) ? 1 : 0))
      break
    case 'count-desc':
      list.sort((a, b) => timesCount(b) - timesCount(a))
      break
    case 'count-asc':
      list.sort((a, b) => timesCount(a) - timesCount(b))
      break
    case 'time-desc':
    default:
      list.sort((a, b) => noTimeLast(a, b) || (firstTime(a) > firstTime(b) ? -1 : firstTime(a) < firstTime(b) ? 1 : 0))
      break
  }
  return list
})

// ====== 懒加载状态 ======
const visibleCount = ref(PAGE_SIZE)
const loading = ref(false)

const visibleVideos = computed(() => filteredVideos.value.slice(0, visibleCount.value))
const noMore = computed(() => visibleCount.value >= TOTAL)

// 切换筛选后从头展示
watch(sortMode, () => {
  visibleCount.value = PAGE_SIZE
})

// ====== IntersectionObserver 实现无限滚动 ======
const sentinel = ref(null)
let observer = null

function loadMore() {
  if (loading.value || noMore.value) return
  loading.value = true
  // 模拟网络延迟，让加载动画可见
  setTimeout(() => {
    visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, TOTAL)
    loading.value = false
  }, 400)
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    },
    { rootMargin: '100px' }
  )
  if (sentinel.value) {
    observer.observe(sentinel.value)
  }
})

onBeforeUnmount(() => {
  if (observer && sentinel.value) {
    observer.unobserve(sentinel.value)
    observer.disconnect()
  }
})

function onVideoClick(video) {
  if (video.bilibili) {
    window.open(video.bilibili, '_blank', 'noopener,noreferrer')
  }
  emit('video-click', video)
}
</script>

<style scoped>
.recommend-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
  gap: 16px;
}

/* 时间/次数筛选器 */
.sort-select {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-size: 13px;
  padding: 5px 10px;
  border-radius: 10px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.sort-select:hover {
  border-color: rgba(0, 231, 0, 0.4);
}

.sort-select option {
  background: #1a1a1a;
  color: #ffffff;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 1px;
}

.section-count {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.06);
  padding: 3px 12px;
  border-radius: 12px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px 24px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.video-card {
  cursor: pointer;
  transition: all 0.3s;
}

.video-card:hover {
  transform: translateY(-6px);
}

.video-thumb {
  position: relative;
  width: 100%;
  padding-top: 62%;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
  background: #1a1a1a;
}

.video-thumb img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s, opacity 0.4s;
  opacity: 0;
}

.video-thumb img.loaded {
  opacity: 1;
}

.video-card:hover .video-thumb img {
  transform: scale(1.06);
}

.video-thumb::after {
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

.video-card:hover .video-thumb::after {
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

.video-card:hover .play-overlay {
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

.thumb-index {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 8px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.video-info {
  padding: 0 4px;
}

.video-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.4;
  color: #ffffff;
  transition: color 0.2s;
}

.video-card:hover .video-title {
  color: #00e700;
}

/* 时间描述：完整展示所有时间，第一个（排序基准）绿色高亮 */
.video-times {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 6px;
  margin-bottom: 4px;
}

.time-chip {
  font-size: 11px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid transparent;
  padding: 0 8px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
}

.time-chip.first {
  color: #00e700;
  background: rgba(0, 231, 0, 0.1);
  border-color: rgba(0, 231, 0, 0.25);
}

.video-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.video-tag {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.06);
  padding: 3px 10px;
  border-radius: 10px;
  transition: all 0.2s;
}

.video-tag:hover {
  background: rgba(0, 231, 0, 0.12);
  color: #00e700;
}

/* 懒加载哨兵 */
.lazy-sentinel {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  margin-top: 28px;
}

.loading-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 1px;
}

@media (max-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 12px;
  }
  .section-title {
    font-size: 22px;
  }
}

@media (max-width: 400px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
}
</style>
