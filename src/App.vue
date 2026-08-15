<template>
  <div class="app-root">
    <!-- 顶部导航栏 -->
    <Navbar
      @logo-click="onLogoClick"
      @search="onSearch"
      @icon-click="onNavIconClick"
      @avatar-click="onAvatarClick"
    />

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
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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
  'pv': 'pv'
}

// activePage -> 侧边栏 index（与 Sidebar.vue menuList 顺序对应）
const pageIndexMap = {
  home: 0,
  zhibo: 1,
  douban: 2,
  re: 3,
  tang: 4,
  pv: 5
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
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
}

.app-root {
  min-height: 100vh;
}

/* ===== 主容器布局 ===== */
.main-container {
  display: flex;
  padding-top: 56px;
  min-height: 100vh;
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

@media (max-width: 640px) {
  .content {
    padding: 16px;
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
</style>
