<template>
  <div class="youhuashuo-page">
    <div class="yhs-card">
      <div class="yhs-header">
        <span class="yhs-icon">💬</span>
        <h2 class="yhs-title">有话说</h2>
      </div>

      <div class="yhs-body">
        <p class="yhs-line">最近一次更新时间为：<span class="yhs-time">{{ buildTimeText }}</span></p>
        <p class="yhs-line">如果你能耐心看完大部分的内容，说明你已经出了新手村，是一个合格的小半了。</p>
        <p class="yhs-line">当然更多的内容是整理不完的，如果感兴趣的话请多多自行补档，好好爱这两个真诚的小女孩吧。</p>
      </div>

      <div class="yhs-footer">
        <span class="yhs-heart">💜柏里挑怡</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// 构建时注入的时间戳（vite.config.js define）
const buildTimeText = computed(() => {
  try {
    const ts = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : ''
    if (!ts) return '未知'
    const d = new Date(ts)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day} ${hh}:${mm}`
  } catch {
    return '未知'
  }
})
</script>

<style scoped>
.youhuashuo-page {
  animation: fadeIn 0.4s ease;
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.yhs-card {
  max-width: 640px;
  width: 100%;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.04), rgba(255, 184, 0, 0.02));
  border: 1px solid rgba(255, 184, 0, 0.15);
  border-radius: 20px;
  padding: 40px 36px;
  position: relative;
  overflow: hidden;
}

.yhs-card::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(255, 184, 0, 0.12), transparent 70%);
  pointer-events: none;
}

.yhs-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px dashed rgba(255, 184, 0, 0.2);
}

.yhs-icon {
  font-size: 32px;
}

.yhs-title {
  font-size: 26px;
  font-weight: 800;
  color: #ffb800;
  letter-spacing: 2px;
  margin: 0;
}

.yhs-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.yhs-line {
  font-size: 15px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.yhs-time {
  color: #ffb800;
  font-weight: 700;
  padding: 2px 10px;
  background: rgba(255, 184, 0, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 184, 0, 0.25);
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.yhs-footer {
  text-align: center;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px dashed rgba(255, 184, 0, 0.15);
}

.yhs-heart {
  font-size: 24px;
  display: inline-block;
  animation: beat 1.6s ease-in-out infinite;
}

@keyframes beat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.18); }
}

/* 响应式 */
@media (max-width: 768px) {
  .youhuashuo-page {
    padding: 20px 0;
  }
  .yhs-card {
    padding: 28px 22px;
    border-radius: 16px;
  }
  .yhs-icon {
    font-size: 26px;
  }
  .yhs-title {
    font-size: 22px;
  }
  .yhs-line {
    font-size: 14px;
    line-height: 1.85;
  }
}
</style>
