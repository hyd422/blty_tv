<template>
  <!-- 顶部导航栏：放在 .app-root 外部，
       避免 .app-root 的 overflow-x:hidden 导致 iOS Safari 下 fixed 失效 -->
  <Navbar
    @logo-click="onLogoClick"
    @search="onSearch"
    @icon-click="onNavIconClick"
    @avatar-click="onAvatarClick"
  />

  <div class="app-root">
    <div class="main-container">
      <!-- 左侧侧边栏 -->
      <Sidebar
        :active-index="activeSidebarIndex()"
        @menu-click="onMenuClick"
      />

      <!-- 主内容区域 -->
      <main class="content">
        <!-- 舞台合集（首页） -->
        <template v-if="activePage === 'home'">
          <Carousel
            @slide-change="onSlideChange"
            @thumb-click="onThumbClick"
          />
          <VideoGrid
            @video-click="onVideoClick"
          />
          <PageFooter />
        </template>

        <!-- 双人直播补档 -->
        <Zhibo
          v-else-if="activePage === 'zhibo'"
          @live-click="onLiveClick"
        />

        <!-- 豆瓣分析楼 -->
        <Douban
          v-else-if="activePage === 'douban'"
          @item-click="onHotItemClick"
        />

        <!-- Re 视频 -->
        <ReVideos
          v-else-if="activePage === 're'"
          @re-click="onReClick"
        />

        <!-- 那些很锤的糖 -->
        <Tang
          v-else-if="activePage === 'tang'"
          @item-click="onTangItemClick"
        />

        <!-- PV 页 -->
        <Pv
          v-else-if="activePage === 'pv'"
          @pv-click="onPvClick"
        />

        <!-- 口袋爱/时间线整理 -->
        <Koudai
          v-else-if="activePage === 'koudai'"
          @koudai-click="onKoudaiClick"
        />

        <!-- 朱怡欣抖音 -->
        <Zhudou
          v-else-if="activePage === 'zhudou'"
          @zhudou-click="onZhudouClick"
        />

        <!-- 柏欣妤抖音 -->
        <Baidou
          v-else-if="activePage === 'baidou'"
          @baidou-click="onBaidouClick"
        />
      </main>
    </div>
  </div>

  <!-- 一键回顶按钮：同样放在外部，确保 fixed 正常工作 -->
  <transition name="fade-slide">
    <button
      v-show="showBackTop"
      class="back-to-top"
      @click="scrollToTop"
      title="回到顶部"
      aria-label="回到顶部"
    >
      <svg viewBox="0 0 24 24" class="btt-icon" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  </transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import Carousel from './components/Carousel.vue'
import VideoGrid from './components/VideoGrid.vue'
import PageFooter from './components/PageFooter.vue'
import Zhibo from './views/zhibo.vue'
import Douban from './views/douban.vue'
import ReVideos from './views/re.vue'
import Tang from './views/tang.vue'
import Pv from './views/pv.vue'
import Koudai from './views/koudai.vue'
import Zhudou from './views/zhudou.vue'
import Baidou from './views/baidou.vue'

// ===== 当前页面 =====
const activePage = ref('home')

// ===== 事件处理（可在此接入路由/全局状态） =====
function onLogoClick() {
  activePage.value = 'home'
}

function onSearch(keyword) {
  console.log('[App] 搜索关键词：', keyword)
  alert(`搜索：${keyword}`)
}

function onNavIconClick(idx) {
  const labels = ['下载内容', '消息中心', 'VIP会员中心']
  console.log('[App] 导航图标点击：', labels[idx] || idx)
}

function onAvatarClick() {
  console.log('[App] 用户头像点击 - 打开个人中心')
}

// 侧边栏菜单 -> 页面映射
const menuPageMap = {
  '舞台合集': 'home',
  '直播补档': 'zhibo',
  '双人直播补档': 'zhibo', // 兼容旧名称
  '豆瓣分析楼': 'douban',
  're视频': 're',
  'Re视频': 're',
  '那些很锤的糖': 'tang',
  'PV': 'pv',
  'pv': 'pv',
  '口袋爱/时间线': 'koudai',
  '口袋爱/时间线整理': 'koudai',
  '朱怡欣抖音': 'zhudou',
  '柏欣妤抖音': 'baidou'
}

// activePage -> 侧边栏 index（与 Sidebar.vue menuList 顺序对应）
const pageIndexMap = {
  home: 0,
  zhibo: 1,
  douban: 2,
  re: 3,
  tang: 4,
  pv: 5,
  koudai: 6,
  zhudou: 7,
  baidou: 8
}

const activeSidebarIndex = () => pageIndexMap[activePage.value] ?? 0

function onMenuClick({ index, menu }) {
  console.log(`[App] 菜单切换：第${index}项 - ${menu.name}`)
  const page = menuPageMap[menu.name]
  if (page) {
    activePage.value = page
  } else {
    console.warn(`[App] 页面 "${menu.name}" 尚未创建，请在 menuPageMap 中添加映射`)
  }
}

function onSlideChange(index) {
  console.log('[App] 轮播图切换到：', index)
}

function onThumbClick(index) {
  console.log('[App] 点击缩略图：', index)
}

function onVideoClick(video) {
  console.log('[App] 播放视频（已在新标签打开B站）：', video.title)
}

function onLiveClick(item) {
  if (item.bilibili) {
    console.log('[App] 已在新标签打开B站直播回放：', item.title)
  } else {
    console.log('[App] 播放直播回放：', item.title)
    alert(`即将播放：${item.title}`)
  }
}

function onHotItemClick(item) {
  if (item.link) {
    console.log('[App] 已在新标签打开豆瓣链接：', item.title)
  } else {
    console.log('[App] 点击热搜：', item.title)
    alert(`查看热搜：${item.title}`)
  }
}

function onReClick(item) {
  if (item.bilibili) {
    console.log('[App] 已在新标签打开B站Re视频：', item.title)
  } else {
    console.log('[App] 播放Re视频：', item.title)
    alert(`即将播放：${item.title}`)
  }
}

function onTangItemClick(item) {
  if (item.link) {
    console.log('[App] 已在新标签打开豆瓣糖点链接：', item.title)
  } else {
    console.log('[App] 查看糖点：', item.title)
    alert(`查看糖点：${item.title}`)
  }
}

function onPvClick(item) {
  if (item.bilibili) {
    console.log('[App] 已在新标签打开B站PV：', item.title)
  } else {
    console.log('[App] 播放PV：', item.title)
    alert(`即将播放：${item.title}`)
  }
}

function onKoudaiClick(item) {
  if (item.link) {
    console.log('[App] 已在新标签打开微博链接：', item.title)
  } else {
    console.log('[App] 点击口袋爱：', item.title)
  }
}

function onZhudouClick(item) {
  if (item.aweme_url) {
    console.log('[App] 已在新标签打开抖音：', item.title)
  } else {
    console.log('[App] 点击抖音内容：', item.title)
  }
}

function onBaidouClick(item) {
  if (item.aweme_url) {
    console.log('[App] 已在新标签打开抖音：', item.title)
  } else {
    console.log('[App] 点击抖音内容：', item.title)
  }
}

// ===== 一键回顶 =====
const showBackTop = ref(false)
const SCROLL_THRESHOLD = 400 // 滚动超过 400px 显示按钮

function onScroll() {
  showBackTop.value = window.scrollY > SCROLL_THRESHOLD
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style>
/* 全局样式重置（App.vue内全局样式，不使用scoped） */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
  background-color: #0a0a0a;
  color: #ffffff;
  min-height: 100vh;
  width: 100%;
  /* 注意：不要在 html/body 上设置 overflow-x: hidden，
     否则 iOS Safari 下 position:fixed 会失效（navbar 不再吸顶）。
     横向溢出改由 .app-root 接管。 */
  -webkit-overflow-scrolling: touch;
}

#app {
  min-height: 100vh;
}

/* app-root 接管 overflow-x，避免 body 上设置导致 iOS fixed 失效 */
.app-root {
  overflow-x: hidden;
  min-height: 100vh;
  width: 100%;
}

/* ===== 主容器布局 ===== */
.main-container {
  display: flex;
  padding-top: 56px;
  min-height: 100vh;
  /* 创建独立层叠上下文，确保内部所有内容（含 transform 子元素）
     都位于 navbar(z-index:1000) 之下，避免滚动时遮挡顶栏 */
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
    /* 手机端：navbar(56px) + sidebar(48px) 都固定吸顶，需留出对应高度 */
    padding-top: 104px;
  }
}

/* ===== 主内容区 ===== */
.content {
  flex: 1;
  margin-left: 180px;
  padding: 24px 32px 40px;
}

@media (max-width: 992px) {
  .content {
    margin-left: 64px;
  }
}

@media (max-width: 768px) {
  .content {
    margin-left: 0;
    padding: 16px 12px 32px;
  }
}

@media (max-width: 640px) {
  .content {
    padding: 12px 10px 28px;
  }
}

/* ===== 滚动条样式 ===== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #0a0a0a;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 231, 0, 0.4);
}

/* ===== 一键回顶按钮 ===== */
.back-to-top {
  position: fixed;
  right: 28px;
  bottom: 36px;
  z-index: 999;
  width: 46px;
  height: 46px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(0, 231, 0, 0.95), rgba(0, 190, 0, 0.95));
  color: #ffffff;
  box-shadow:
    0 4px 18px rgba(0, 231, 0, 0.35),
    0 0 0 4px rgba(0, 231, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-to-top:hover {
  transform: translateY(-3px);
  box-shadow:
    0 8px 24px rgba(0, 231, 0, 0.45),
    0 0 0 4px rgba(0, 231, 0, 0.14);
}

.back-to-top:active {
  transform: translateY(-1px) scale(0.96);
}

.btt-icon {
  width: 22px;
  height: 22px;
}

/* 出现 / 消失 过渡 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.9);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.9);
}

@media (max-width: 640px) {
  .back-to-top {
    right: 16px;
    bottom: 24px;
    width: 40px;
    height: 40px;
  }
  .btt-icon {
    width: 18px;
    height: 18px;
  }
}
</style>
