<template>
  <!-- 轮播图区域 -->
  <section class="carousel-section">
    <div class="carousel">
      <div class="carousel-bg">
        <img
          :key="currentSlide.mainImg"
          :src="currentSlide.mainImg"
          alt="轮播背景"
          class="fade-in"
        />
        <div class="carousel-overlay"></div>
      </div>
      <div class="carousel-content">
        <div class="carousel-info">
          <h1 class="carousel-title">{{ currentSlide.title }}</h1>
          <p class="carousel-subtitle">{{ currentSlide.subtitle }}</p>
          <p class="carousel-author">{{ currentSlide.author }}</p>
        </div>
        <div class="carousel-thumbs">
          <button class="carousel-arrow prev" @click="prevSlide">‹</button>
          <div class="thumb-list">
            <div
              v-for="(item, idx) in carouselData"
              :key="idx"
              class="thumb-item"
              :class="{ active: currentIndex === idx }"
              @click="goToSlide(idx)"
            >
              <img :src="item.thumbImg" :alt="`缩略图${idx + 1}`" />
              <span class="thumb-label">{{ item.label }}</span>
            </div>
          </div>
          <button class="carousel-arrow next" @click="nextSlide">›</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['slide-change', 'thumb-click'])

const CACHE_VER = 'v2'
const cacheBust = (src) => `${src}?${CACHE_VER}`

const carouselData = [
  {
    mainImg: cacheBust('assets/pictures/38.jpg'),
    thumbImg: cacheBust('assets/pictures/35.jpg'),
    label: '心跳花火武汉站',
    title: '柏里挑怡',
    subtitle: '#金曲唯一双冠王',
    author: '@柏欣妤&@朱怡欣'
  },
  {
    mainImg: cacheBust('assets/pictures/39.jpg'),
    thumbImg: cacheBust('assets/pictures/34.jpg'),
    label: '心跳花火厦门站',
    title: '柏里挑怡',
    subtitle: '#金曲大赏双连冠',
    author: '@柏欣妤&@朱怡欣'
  },
  {
    mainImg: cacheBust('assets/pictures/37.jpg'),
    thumbImg: cacheBust('assets/pictures/36.jpg'),
    label: '私人信号',
    title: '柏里挑怡',
    subtitle: '#双人巡演敬请期待',
    author: '@柏欣妤&@朱怡欣'
  }
]

const currentIndex = ref(0)
let autoPlayTimer = null

const currentSlide = computed(() => carouselData[currentIndex.value])

function prevSlide() {
  currentIndex.value = (currentIndex.value - 1 + carouselData.length) % carouselData.length
  resetAutoPlay()
  emit('slide-change', currentIndex.value)
}

function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % carouselData.length
  resetAutoPlay()
  emit('slide-change', currentIndex.value)
}

function goToSlide(idx) {
  currentIndex.value = idx
  resetAutoPlay()
  emit('thumb-click', idx)
}

function startAutoPlay() {
  autoPlayTimer = setInterval(() => {
    nextSlide()
  }, 5000)
}

function resetAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
  }
  startAutoPlay()
}

onMounted(() => {
  startAutoPlay()
})

onBeforeUnmount(() => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
  }
})
</script>

<style scoped>
.carousel-section {
  margin-bottom: 36px;
}

.carousel {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  height: 420px;
}

.carousel-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000 center/cover no-repeat;
}

.carousel-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  display: block;
  filter: brightness(0.78) saturate(1.05);
}

.fade-in {
  animation: fadeIn 0.35s ease;
}

@keyframes fadeIn {
  from { opacity: 0.6; transform: scale(1.02); }
  to { opacity: 1; transform: scale(1); }
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.55) 0%,
    rgba(0, 0, 0, 0.25) 40%,
    rgba(0, 0, 0, 0.1) 70%,
    rgba(0, 0, 0, 0.35) 100%
  );
}

.carousel-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100%;
  padding: 36px 40px;
}

.carousel-info {
  max-width: 45%;
}

.carousel-title {
  font-size: 52px;
  font-weight: 800;
  letter-spacing: 4px;
  margin-bottom: 10px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.carousel-subtitle {
  font-size: 18px;
  color: #ffd700;
  margin-bottom: 10px;
  font-weight: 500;
}

.carousel-author {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
}

.carousel-thumbs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.carousel-arrow {
  width: 32px;
  height: 60px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.carousel-arrow:hover {
  background: rgba(0, 231, 0, 0.25);
  border-color: rgba(0, 231, 0, 0.5);
}

.thumb-list {
  display: flex;
  gap: 10px;
}

.thumb-item {
  position: relative;
  width: 120px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
  flex-shrink: 0;
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-item:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.4);
}

.thumb-item.active {
  border-color: #00e700;
  box-shadow: 0 0 16px rgba(0, 231, 0, 0.4);
}

.thumb-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 8px;
  font-size: 12px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: #ffffff;
  text-align: center;
}

@media (max-width: 1200px) {
  .carousel-title {
    font-size: 42px;
  }
  .thumb-item {
    width: 100px;
    height: 130px;
  }
}

@media (max-width: 992px) {
  .carousel-content {
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    padding: 24px;
  }
  .carousel-info {
    max-width: 100%;
  }
  .carousel-title {
    font-size: 36px;
  }
}

@media (max-width: 640px) {
  .carousel {
    height: 280px;
  }
  .thumb-item {
    width: 80px;
    height: 100px;
  }
  .carousel-title {
    font-size: 28px;
  }
}
</style>
