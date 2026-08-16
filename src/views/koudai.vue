<template>
  <div class="koudai-page">
    <div class="page-header">
      <h2 class="page-title">口袋爱 / 时间线整理</h2>
      <span class="page-subtitle">@柏欣妤 & @朱怡欣 口袋48and日常互动时间线</span>
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
    title: '22-24年6月的整理',
    link: 'https://www.douban.com/link2/?url=https%3A%2F%2Fweibo.com%2Fu%2F7929103261'
  },
  {
    title: '时间轴补档',
    link: 'https://www.douban.com/link2/?url=http%3A%2F%2Ft.cn%2FA6EJQ8ry&link2key=61804e853e'
  },
  {
    title: '口袋爱补档',
    link: 'https://www.douban.com/link2/?url=https%3A%2F%2Fweibo.com%2Fu%2F2015421120'
  },
  {
    title: '24年6月至今整理',
    link: 'https://m.weibo.cn/c/wbox?id=wqh75bb2ni&appName=%E6%96%87%E7%AB%A0%E4%B8%93%E6%A0%8F&appIcon=&topNavMode=0&cid=4652655454923523&click_from=share'
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
