<template>
  <!-- 视频播放区域 -->
  <section class="recommend-section">
    <div class="section-header">
      <h2 class="section-title">视频播放</h2>
      <span class="section-count">共 {{ videoDataAll.length }} 首歌</span>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { cdnImg } from '../utils/img.js'

const emit = defineEmits(['video-click'])

// ====== 33张图片数据 (1.jpg ~ 33.jpg)，名称与图片一一对应 ======
// 每个条目附带 bilibili 跳转链接，未指定具体 BV 号时默认使用 B 站搜索对应标题
const TOTAL = 34
const PAGE_SIZE = 9 // 每次加载9张

// 默认跳转：B 站搜索对应标题；如需指定具体 BV 号，改为 'https://www.bilibili.com/video/BVxxxxxx' 即可
const bv = (keyword) => `https://search.bilibili.com/all?keyword=${encodeURIComponent('柏里挑怡 ' + keyword)}`

const videoDataAll = [
  { title: '不安星',       img: 'assets/pictures/thumb/1.jpg',  bilibili: bv('不安星') },
  { title: '夏之回忆',     img: 'assets/pictures/thumb/2.jpg',  bilibili: bv('夏之回忆') },
  { title: '牛奶香槟',     img: 'assets/pictures/thumb/3.jpg',  bilibili: bv('牛奶香槟') },
  { title: '单向镜面',     img: 'assets/pictures/thumb/4.jpg',  bilibili: bv('单向镜面') },
  { title: '升温',         img: 'assets/pictures/thumb/5.jpg',  bilibili: bv('升温') },
  { title: 'First Love',   img: 'assets/pictures/thumb/6.jpg',  bilibili: bv('First Love') },
  { title: '变量',         img: 'assets/pictures/thumb/7.jpg',  bilibili: bv('变量') },
  { title: '月光下',       img: 'assets/pictures/thumb/8.jpg',  bilibili: bv('月光下') },
  { title: '暖暖',         img: 'assets/pictures/thumb/9.jpg',  bilibili: bv('暖暖') },
  { title: 'Whistle',      img: 'assets/pictures/thumb/10.jpg', bilibili: bv('Whistle') },
  { title: '恋爱告急',     img: 'assets/pictures/thumb/11.jpg', bilibili: bv('恋爱告急') },
  { title: '完美犯罪',     img: 'assets/pictures/thumb/12.jpg', bilibili: bv('完美犯罪') },
  { title: '爱未央',       img: 'assets/pictures/thumb/13.jpg', bilibili: bv('爱未央') },
  { title: '噗通噗通',     img: 'assets/pictures/thumb/14.jpg', bilibili: bv('噗通噗通') },
  { title: '完美超载',     img: 'assets/pictures/thumb/15.jpg', bilibili: bv('完美超载') },
  { title: '粉红狙击手',   img: 'assets/pictures/thumb/16.jpg', bilibili: bv('粉红狙击手') },
  { title: '蠢蠢',         img: 'assets/pictures/thumb/17.jpg', bilibili: bv('蠢蠢') },
  { title: '专属座位',     img: 'assets/pictures/thumb/18.jpg', bilibili: bv('专属座位') },
  { title: '圈圈点点',     img: 'assets/pictures/thumb/19.jpg', bilibili: bv('圈圈点点') },
  { title: 'Spy',          img: 'assets/pictures/thumb/20.jpg', bilibili: bv('Spy') },
  { title: 'Look Out',      img: 'assets/pictures/thumb/21.jpg', bilibili: bv('Lookout') },
  { title: 'White light',  img: 'assets/pictures/thumb/22.jpg', bilibili: bv('White') },
  { title: '降落伞',       img: 'assets/pictures/thumb/23.jpg', bilibili: bv('降落伞') },
  { title: '听到请回答',   img: 'assets/pictures/thumb/24.jpg', bilibili: bv('听到请回答') },
  { title: '双人舞',       img: 'assets/pictures/thumb/25.jpg', bilibili: bv('双人舞') },
  { title: '四季的爱恋',   img: 'assets/pictures/thumb/26.jpg', bilibili: bv('四季的爱恋') },
  { title: 'High light',  img: 'assets/pictures/thumb/27.jpg', bilibili: bv('High') },
  { title: '调和色',       img: 'assets/pictures/thumb/28.jpg', bilibili: bv('调和色') },
  { title: '忧闭',         img: 'assets/pictures/thumb/29.jpg', bilibili: bv('忧闭') },
  { title: 'My Boy',       img: 'assets/pictures/thumb/30.jpg', bilibili: bv('My Boy') },
  { title: 'City light',  img: 'assets/pictures/thumb/31.jpg', bilibili: bv('City') },
  { title: '水蒸气',       img: 'assets/pictures/thumb/32.jpg', bilibili: bv('水蒸气') },
  { title: '暗示',         img: 'assets/pictures/thumb/33.jpg', bilibili: bv('暗示') },
].map(v => ({ ...v, img: cdnImg(v.img) }))

// ====== 懒加载状态 ======
const visibleCount = ref(PAGE_SIZE)
const loading = ref(false)

const visibleVideos = computed(() => videoDataAll.slice(0, visibleCount.value))
const noMore = computed(() => visibleCount.value >= TOTAL)

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
  margin-bottom: 24px;
  gap: 16px;
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
