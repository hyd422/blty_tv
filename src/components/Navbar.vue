<template>
  <!-- 顶部导航栏 -->
  <header class="top-nav">
    <div class="nav-left">
      <div class="logo" @click="onLogoClick">
        <span class="logo-bly">BLTY</span>
        <span class="logo-tv">TV</span>
      </div>
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchText"
          type="text"
          placeholder="抖音词条搜索"
          @keypress.enter="onSearch"
        />
        <div class="search-tags">
          <span
            v-for="tag in searchTags"
            :key="tag"
            @click="onTagClick(tag)"
          >{{ tag }}</span>
        </div>
      </div>
    </div>
    <div class="nav-right">
      <div class="nav-icons">
        <span
          v-for="(icon, idx) in navIcons"
          :key="idx"
          class="icon-btn"
          :class="{ 'v-badge': icon.vBadge }"
          :title="icon.title"
          @click="onIconClick(idx)"
        >{{ icon.icon }}</span>
      </div>
      <div class="user-avatar" @click="onAvatarClick">
        <img :src="userAvatar" alt="用户头像" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { cdnImg } from '../utils/img.js'

const emit = defineEmits(['logo-click', 'search', 'icon-click', 'avatar-click'])

const searchText = ref('')
const searchTags = ['SNH48', 'GNZ48', '柏欣妤', '朱怡欣']
const navIcons = [
  { icon: '⬇', title: '下载' },
  { icon: '✉', title: '消息' },
  { icon: 'V', title: 'VIP', vBadge: true }
]
const userAvatar = cdnImg('assets/pictures/thumb/33.jpg')

function onLogoClick() {
  emit('logo-click')
}

function onSearch() {
  if (searchText.value.trim()) {
    emit('search', searchText.value.trim())
  }
}

function onTagClick(tag) {
  searchText.value = tag
  // 点击标签直接触发搜索
  emit('search', tag)
}

function onIconClick(idx) {
  emit('icon-click', idx)
}

function onAvatarClick() {
  emit('avatar-click')
}
</script>

<style scoped>
/* 顶部导航栏 */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(17, 17, 17, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 28px;
  flex: 1;
  max-width: 70%;
}

.logo {
  display: flex;
  align-items: baseline;
  font-weight: bold;
  cursor: pointer;
}

.logo-bly {
  font-size: 20px;
  color: #00e700;
  letter-spacing: 1px;
}

.logo-tv {
  font-size: 22px;
  color: #ffffff;
  margin-left: 2px;
  letter-spacing: 1px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 520px;
}

.search-box input {
  width: 100%;
  height: 36px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 0 40px 0 40px;
  color: #ffffff;
  font-size: 13px;
  outline: none;
  transition: all 0.3s;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-box input:focus {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(0, 231, 0, 0.4);
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.search-tags {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 6px;
}

.search-tags span {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.search-tags span:hover {
  background: rgba(0, 231, 0, 0.15);
  color: #00e700;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-icons {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.7);
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.icon-btn.v-badge {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #ffffff;
  font-weight: bold;
  font-size: 12px;
}

.user-avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(0, 231, 0, 0.5);
  cursor: pointer;
  object-fit: cover;
}

@media (max-width: 640px) {
  .nav-left {
    max-width: 55%;
    gap: 12px;
  }
  .search-tags {
    display: none;
  }
}

/* 手机端：强制固定吸顶，避免 iOS Safari 下随滚动脱落 */
@media (max-width: 768px) {
  .top-nav {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 1000;
  }
}

@media (max-width: 480px) {
  .top-nav {
    padding: 0 12px;
  }
  .nav-left {
    max-width: 60%;
    gap: 8px;
  }
  .logo-bly {
    font-size: 16px;
  }
  .logo-tv {
    font-size: 18px;
  }
  .search-box input {
    height: 32px;
    font-size: 12px;
    padding: 0 12px 0 32px;
  }
  .search-icon {
    font-size: 12px;
    left: 10px;
  }
  .nav-right {
    gap: 8px;
  }
  .nav-icons {
    gap: 4px;
  }
  .icon-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  .user-avatar img {
    width: 30px;
    height: 30px;
  }
}
</style>
