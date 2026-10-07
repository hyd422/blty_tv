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
  { icon: '🎤', name: 'PV' },
  { icon: '♡', name: '口袋爱/时间线' },
  { icon: '🎵', name: '抖音' },
  { icon: '🐽', name: '朱怡欣微博' },
  { icon: '🐶', name: '柏欣妤微博' },
  { icon: '💬', name: '有话说' }
]

function onMenuClick(idx) {
  emit('update:activeIndex', idx)
  emit('menu-click', { index: idx, menu: menuList[idx] })
}
</script>

<style scoped>
.sidebar {
  width: 180px;
  background: rgba(13, 22, 34, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-right: 1px solid rgba(160, 190, 215, 0.1);
  padding-top: 20px;
  position: fixed;
  top: 56px;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  /* 位于 content 之上、navbar 之下（navbar z-index:1000 在外层） */
  z-index: 10;
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
  color: rgba(208, 224, 238, 0.6);
  font-size: 14px;
  border-left: 2px solid transparent;
}

.menu-item:hover {
  background: rgba(160, 190, 215, 0.07);
  color: rgba(228, 240, 250, 0.95);
}

.menu-item.active {
  background: rgba(188, 211, 232, 0.08);
  color: #bcd3e8;
  border-left-color: #bcd3e8;
  font-weight: 600;
}

.menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.menu-item.active .menu-icon {
  color: #bcd3e8;
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
    border-bottom-color: #bcd3e8;
  }
}
</style>
