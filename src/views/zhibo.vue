<template>
  <div class="zhibo-page">
    <div class="page-header">
      <h2 class="page-title">双人直播补档</h2>
      <span class="page-subtitle">@柏欣妤 & @朱怡欣 直播回放合集</span>
    </div>
    <div class="live-grid">
      <div
        v-for="(item, idx) in liveList"
        :key="idx"
        class="live-card"
        @click="onLiveClick(item)"
      >
        <div class="live-thumb">
          <img :src="item.cover" :alt="item.title" loading="lazy" @error="onImgError($event)" />
          <span class="live-badge">回放</span>
          <span class="live-duration">{{ item.duration }}</span>
          <div class="play-overlay"></div>
        </div>
        <div class="live-info">
          <h3 class="live-title">{{ item.title }}</h3>
          <p class="live-date">{{ item.date }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['live-click'])

const liveList = ref([
  {
    title: '你怎么会是坏孩子呢 2022.03.12',
    date: '2022-03-12',
    duration: '01:51:51',
    cover: 'assets/pictures/53.jpg',
    bilibili: 'https://b23.tv/TSGCtZ8'
  },
  {
    title: '一周年连麦 2023.02.27',
    date: '2023-02-27',
    duration: '01:51:51',
    cover: 'assets/pictures/54.jpg',
    bilibili: 'https://b23.tv/Ru335Oj'
  },
  {
    title: '拼乐高 2023.03.15',
    date: '2023-03-15',
    duration: '01:51:51',
    cover: 'assets/pictures/55.jpg',
    bilibili: 'https://b23.tv/YKZ2Fcw'
  },
  {
    title: '妆容互换互相化妆 2023.04.20',
    date: '2023-04-20',
    duration: '01:51:51',
    cover: 'assets/pictures/56.jpg',   
    bilibili: 'https://b23.tv/z3tS57M'
  },
  {
    title: '现在雪地可以踩吗？ 2023.05.30',
    date: '2023-05-30',
    duration: '01:51:51',
    cover: 'assets/pictures/57.jpg',
    bilibili: 'https://b23.tv/f6Y34ar'
  },
  {
    title: '流在你身上的眼泪太多了 2024.01.13',
    date: '2024-01-13',
    duration: '01:51:51',
    cover: 'assets/pictures/58.jpg',
    bilibili: ' https://b23.tv/X1YRciE'
  },
  {
    title: '二周年双播 2024.02.27',
    date: '2024-02-27',
    duration: '01:51:51',
    cover: 'assets/pictures/59.jpg',
    bilibili: 'https://b23.tv/CYNNb3G'
  },
  {
    title: '小学生吵架她不懂 很好品的一次直播 2024.06.17',
    date: '2024-06-17',
    duration: '01:42:19',
    cover: 'assets/pictures/60.jpg',
    bilibili: 'https://b23.tv/lLuSnTI'
  },
  {
    title: '我们都在一起这么久了 2025.02.21',
    date: '2024-02-21',
    duration: '01:42:19',
    cover: 'assets/pictures/61.jpg',
    bilibili: 'https://b23.tv/33Hc8dv'
  },
  {
    title: '三周年双播 2025.02.26',
    date: '2025-02-26',
    duration: '01:42:19',
    cover: 'assets/pictures/62.jpg',
    bilibili: 'https://b23.tv/B88SeAD'
  },
  {
    title: '希望bxy每年都陪我过生日 love you 2025.04.22',
    date: '2025-04-22',
    duration: '01:42:19',
    cover: 'assets/pictures/63.jpg',
    bilibili: 'https://b23.tv/VWaS1Jj'
  },
  {
    title: '我是你的星星是么 2026.01.25',
    date: '2026-01-25',
    duration: '01:42:19',
    cover: 'assets/pictures/64.jpg',
    bilibili: 'https://b23.tv/zE6R5mJ'
  },
  {
    title: '四周年双播 2026.02.27',
    date: '2026-02-27',
    duration: '01:42:19',
    cover: 'assets/pictures/65.jpg',
    bilibili: 'https://b23.tv/20aDWaZ'
  },
  {
    title: '因为世界就在这儿啊 2026.04.22',
    date: '2026-04-22',
    duration: '01:42:19',
    cover: 'assets/pictures/66.jpg',
    bilibili: 'https://b23.tv/GR92PTA'
  }
])

function onImgError(e) {
  e.target.src = 'assets/pictures/main.jpg'
}

function onLiveClick(item) {
  if (item.bilibili) {
    window.open(item.bilibili, '_blank', 'noopener,noreferrer')
  }
  emit('live-click', item)
}
</script>

<style scoped>
.zhibo-page {
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
  margin-bottom: 28px;
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

.live-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px 24px;
  margin-bottom: 40px;
}

.live-card {
  cursor: pointer;
  transition: all 0.3s;
}

.live-card:hover {
  transform: translateY(-6px);
}

.live-thumb {
  position: relative;
  width: 100%;
  padding-top: 62%;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
  background: #1a1a1a;
}

.live-thumb img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.live-card:hover .live-thumb img {
  transform: scale(1.06);
}

.live-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  background: rgba(0, 231, 0, 0.85);
  padding: 3px 10px;
  border-radius: 6px;
}

.live-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 2;
  font-size: 12px;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 8px;
  border-radius: 4px;
}

.live-thumb::after {
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

.live-card:hover .live-thumb::after {
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

.live-card:hover .play-overlay {
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

.live-info {
  padding: 0 4px;
}

.live-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.4;
  color: #ffffff;
  transition: color 0.2s;
}

.live-card:hover .live-title {
  color: #00e700;
}

.live-date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 992px) {
  .live-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .live-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 12px;
  }
  .page-title {
    font-size: 22px;
  }
}

@media (max-width: 400px) {
  .live-grid {
    grid-template-columns: 1fr;
  }
}
</style>
