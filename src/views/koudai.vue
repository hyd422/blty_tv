<template>
  <div class="koudai-page">
    <div class="page-header">
      <h2 class="page-title">口袋爱 / 时间线整理</h2>
      <span class="page-subtitle">@柏欣妤 & @朱怡欣 口袋48互动时间线</span>
    </div>

    <div class="koudai-list">
      <a
        v-for="(item, idx) in koudaiList"
        :key="idx"
        class="koudai-card"
        :href="item.link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="koudai-num">{{ String(idx + 1).padStart(2, '0') }}</div>
        <div class="koudai-content">
          <h3 class="koudai-title">{{ item.title }}</h3>
          <p class="koudai-date">{{ item.date }}</p>
          <p class="koudai-desc">{{ item.desc }}</p>
        </div>
        <div class="koudai-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['koudai-click'])

// 4 个口袋爱 / 时间线整理板块，点击跳转微博
const koudaiList = ref([
  {
    title: '口袋48 初次互动',
    date: '2021-05-12',
    desc: '两位在口袋房间第一次公开互动，缘分的起点。',
    link: 'https://weibo.com/'
  },
  {
    title: '深夜连麦合辑',
    date: '2022-08-26',
    desc: '凌晨两点的口袋房间，那些没人打扰的悄悄话。',
    link: 'https://weibo.com/'
  },
  {
    title: '生日祝福时间线',
    date: '2023-02-27',
    desc: '每一年为对方零点准时送上的生日祝福，从未缺席。',
    link: 'https://weibo.com/'
  },
  {
    title: '周年纪念日汇总',
    date: '2026-02-27',
    desc: '一周年、二周年、三周年、四周年，我们一起走过的路。',
    link: 'https://weibo.com/'
  }
])
</script>

<style scoped>
.koudai-page {
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

.koudai-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}

.koudai-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.koudai-card:hover {
  background: rgba(0, 231, 0, 0.06);
  border-color: rgba(0, 231, 0, 0.3);
  transform: translateX(4px);
}

.koudai-num {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 231, 0, 0.2), rgba(0, 190, 0, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: #00e700;
  letter-spacing: 1px;
}

.koudai-card:hover .koudai-num {
  background: linear-gradient(135deg, #00e700, #00be00);
  color: #ffffff;
}

.koudai-content {
  flex: 1;
  min-width: 0;
}

.koudai-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6px;
  transition: color 0.2s;
}

.koudai-card:hover .koudai-title {
  color: #00e700;
}

.koudai-date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 6px;
}

.koudai-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.6;
}

.koudai-arrow {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

.koudai-arrow svg {
  width: 18px;
  height: 18px;
}

.koudai-card:hover .koudai-arrow {
  background: rgba(0, 231, 0, 0.15);
  color: #00e700;
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 22px;
  }
  .koudai-card {
    padding: 16px 18px;
    gap: 14px;
  }
  .koudai-num {
    width: 40px;
    height: 40px;
    font-size: 15px;
  }
  .koudai-title {
    font-size: 16px;
  }
  .koudai-desc {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .koudai-card {
    padding: 14px 14px;
    gap: 12px;
  }
  .koudai-arrow {
    display: none;
  }
}
</style>
