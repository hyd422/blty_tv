<template>
  <!-- 左侧侧边栏 -->
  <aside class="sidebar">
    <nav class="side-menu">
      <ul>
        <li
          v-for="(item, idx) in menuList"
          :key="idx"
          class="menu-item"
          :class="{ active: activeIndex === idx }"
          @click="onMenuClick(idx)"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span class="menu-text">{{ item.name }}</span>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
const props = defineProps({
  // 当前高亮的菜单项 index（由父组件根据 activePage 传入，避免切页后高亮错乱）
  activeIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['menu-click', 'update:activeIndex'])

const menuList = [
  { icon: '★', name: '舞台合集' },
  { icon: '◎', name: '直播补档' },
  { icon: 'V', name: '豆瓣分析楼' },
  { icon: '🎬', name: 're视频' },
  { icon: '🎞', name: '那些很锤的糖' },
  { icon: '🎤', name: 'PV' }
]

function onMenuClick(idx) {
  emit('update:activeIndex', idx)
  emit('menu-click', { index: idx, menu: menuList[idx] })
}
</script>

<style scoped>
.sidebar {
  width: 180px;
  background: #111111;
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  padding-top: 20px;
  position: fixed;
  top: 56px;
  left: 0;
  bottom: 0;
  overflow-y: auto;
}

.side-menu ul {
  list-style: none;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 24px;
  cursor: pointer;
  transition: all 0.25s;
  color: rgba(255, 255, 255, 0.65);
  font-size: 14px;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.9);
}

.menu-item.active {
  background: rgba(0, 231, 0, 0.08);
  color: #00e700;
  border-left-color: #00e700;
  font-weight: 600;
}

.menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.menu-item.active .menu-icon {
  color: #00e700;
}

@media (max-width: 992px) {
  .sidebar {
    width: 64px;
  }
  .menu-text {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: 48px;
    padding-top: 0;
    top: 56px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .side-menu ul {
    display: flex;
    gap: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .side-menu ul::-webkit-scrollbar {
    display: none;
  }
  .menu-item {
    flex-shrink: 0;
    padding: 8px 14px;
    border-left: none;
    border-bottom: 2px solid transparent;
    font-size: 13px;
    gap: 6px;
    white-space: nowrap;
  }
  .menu-text {
    display: inline;
  }
  .menu-item.active {
    border-left: none;
    border-bottom-color: #00e700;
  }
}
</style>
