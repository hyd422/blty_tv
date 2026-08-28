<template>
  <div class="douban-page">
    <div class="page-header">
      <h2 class="page-title">豆瓣分析楼</h2>
      <span class="page-subtitle">实时热搜榜</span>
    </div>

    <div class="hot-list">
      <div
        v-for="(item, idx) in hotList"
        :key="idx"
        class="hot-item"
        @click="onItemClick(item)"
      >
        <!-- 排名 -->
        <div class="rank" :class="getRankClass(idx)">
          {{ idx + 1 }}
        </div>

        <!-- 内容 -->
        <div class="hot-content">
          <div class="hot-title">
            <span v-if="item.dot" class="dot"></span>
            {{ item.title }}
            <span v-if="item.count" class="hot-count">{{ item.count }}</span>
          </div>
          <div v-if="item.sub" class="hot-sub">{{ item.sub }}</div>
        </div>

        <!-- 右侧标签 -->
        <div class="hot-right">
          <span v-if="item.tag" class="tag" :class="tagClass(item.tag)">{{ item.tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['item-click'])

// 模仿图片中的微博热搜榜单
const hotList = ref([
  { title: '我的心是一个下雨的小水滩', count: '472762', tag: '热', dot: false, link: 'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F326179768%3F_spm_id%3DMTk4NTI3MDg2&_i=87909994ae92653&dt_dapp=1' },
  { title: '傲娇猪到底有多爱', count: '下午爆词', tag: '热', dot: false, link: 'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F291617420%3F_spm_id%3DMjM5MDc3NzY0&_i=86716693ae92653&dt_dapp=1' },
  { title: '侄女狗的一步步沦陷', count: '135762', tag: '', dot: false, link: 'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F291614919%3F_spm_id%3DMTg4MDUxNTk4&_i=86716813ae92653&dt_dapp=1' },
  { title: '武汉mvp巡演糖点分析', count: '下午霸榜', tag: '', dot: true, link: 'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F306255759%3F_spm_id%3DMjMwMDMxNDIy&_i=86716904ae92653&dt_dapp=1', subTag: '官宣' },
  { title: '直播分析那些那些青涩与暗戳戳', count: '526335', tag: '新', dot: false, link: 'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F295834358%3F_spm_id%3DMjE3NjgwODk1&_i=86716956ae92653&dt_dapp=1' },
  { title: '白白的猪半决赛糖点', count: '801662', tag: '新', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F295654925%3F_spm_id%3DMjE3NjE5NjE1&_i=86716990ae92653&dt_dapp=1' },
  { title: '白白的猪16强公演糖点', count: '糖分超标', tag: '荐', dot: true, sub: '友们快来 有钕铜', subTag: '官宣',link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F295143156%3F_spm_id%3DMTU3NTMyNzA3&_i=86717026ae92653&dt_dapp=1' },
  { title: '欧洲双人蜜月分析', count: '66932', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F294669740%3F_spm_id%3DMjIyNTkyNzMz&_i=86717054ae92653&dt_dapp=1' },
  { title: '你把我当女朋友我也把你当女朋友', count: '57325', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F293046115%3F_spm_id%3DMjE1NjYxMjcx&_i=86717083ae92653&dt_dapp=1' },
  { title: '成渝巡演糖点', count: '68944', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F290882077%3F_spm_id%3DMjMwMDMxNDIy&_i=86717112ae92653&dt_dapp=1' },
  { title: '617读信分析', count: '350931', tag: '新', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F290355174%3F_spm_id%3DMjMwMDMxNDIy&_i=86717149ae92653&dt_dapp=1' },
  { title: '23年Q&A分析1', count: '60707', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F289365912%3F_spm_id%3DMjMwMDMxNDIy&_i=86717297ae92653&dt_dapp=1' },
  { title: '23年Q&A分析2', count: '71054', tag: '新', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F289307680%3F_spm_id%3DMjMwMDMxNDIy&_i=86717321ae92653&dt_dapp=1' },
  { title: '郑州巡演糖点1', count: '60707', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F288906729%3F_spm_id%3DMjMwMDMxNDIy&_i=86717373ae92653&dt_dapp=1' },
  { title: '郑州巡演糖点2', count: '50868', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F288691716%3F_spm_id%3DMjMwMDMxNDIy&_i=86717464ae92653&dt_dapp=1' },
  { title: '曝bxy恋爱脑', count: '50868', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F287851570%3F_spm_id%3DMTc4MDY5MTMw&_i=86717492ae92653&dt_dapp=1' },
  { title: '曝zyx恋爱脑', count: '60707', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F287853798%3F_spm_id%3DMTc4MDY5MTMw&_i=86717513ae92653&dt_dapp=1' },
  { title: '夏之回忆分析', count: '62874', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F287380548%3F_spm_id%3DMTc4MDY5MTMw&_i=86717533ae92653&dt_dapp=1' },
  { title: '315双播分析', count: '40707', tag: '热', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F285042571%3F_spm_id%3DMjMxNzkwNzEx&_i=86717576ae92653&dt_dapp=1' },
  { title: 'bxy zyx的那些特殊对应', count: '62457', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F285014770%3F_spm_id%3DMjMxNzkwNzEx&_i=86717600ae92653&dt_dapp=1' },
  { title: '机场爱', count: '92707', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F483934951%3F_spm_id%3DMjgyOTUxNDY3&_i=86726335ae92653&dt_dapp=1' },
  { title: '小白猪的宝宝宇宙建设', count: '43207', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F483017049%3F_spm_id%3DMjE1NDgwNDI1&_i=86799650a8e738d' },
  { title: '帅豹豹美猫猫最激情的时刻', count: '642107', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F481969183%3F_spm_id%3DMjE1NDgwNDI1&_i=86799668a8e738d' },
  { title: '星星项链分析贴', count: '64207', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F474119050%3F_spm_id%3DMjg2NzkzNzA0&_i=86799713a8e738d' },
  { title: '白猪人形磁铁测评中', count: '607214', tag: '新', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F344126808%3F_spm_id%3DMjMyOTIzNjA1&_i=86799735a8e738d' },
  { title:'爱对了人情人节每天都过', count: '424214', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F309888195%3F_spm_id%3DMjI3NTI3NTQx&_i=87910256ae92653&dt_dapp=1'},
  { title: '运动会143个fo品鉴', count: '38992', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F344433279%3F_spm_id%3DMjI4MTQ0NjAy&_i=86799724c62959a' },
  { title: '小白猪25年奔赴记录', count: '602412', tag: '热', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F343931257%3F_spm_id%3DMjkxODE3Njky&_i=86799717c62959a' },
  { title: '疑似第一次颠鸾倒凤', count: '24782', tag: '热', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F315558255%3F_spm_id%3DMjM0NDcxOTU4&_i=86799701c62959a' },
  { title: '最佳拍档拍立得', count: '607437', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F309724229%3F_spm_id%3DMjAyNzIzMjk2&_i=86799693c62959a' },
  { title: '牵手回顾贴', count: '24822', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F343368982%3F_spm_id%3DMjkwNjM0MzY2&_i=867999845c3131e' },
  { title: '一周年bz微博', count: '24242', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F284098836%3F_spm_id%3DMjE5MTgzNDIy&_i=867999367ee209a&dt_dapp=1' },
  { title: '白猪真假辩论楼', count: '12412', tag: '新', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F291170866%3F_spm_id%3DMTkwMDg3Mzgx&_i=86799650c62959a' },
  { title: '🐕422玫瑰分析楼', count: '42407', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F287251495%3F_spm_id%3DMjIzOTM2NTE2&_i=868001237ee209a&dt_dapp=1' },
  { title: 'bz最有情侣感的照片', count: '24426', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F337019249%3F_spm_id%3DMjAxNTU4NTIz&_i=868001465c3131e' },
  { title: '双人抖音贴', count: '54307', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F339479899%3F_spm_id%3DMTk4NTI3MDg2&_i=86800120c62959a' },
  { title: '三周年分析贴', count: '23896', tag: '新', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F324616688%3F_spm_id%3DMjMyOTIzNjA1&_i=86800163a7551c0' },
  { title: '23年白猪分析', count: '532307', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F284079018%3F_spm_id%3DMjQzMDAyNTg2&_i=86799865a8e738d' },
  { title: '24年白猪分析', count: '53237', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F315845028%3F_spm_id%3DMjI4NTMyMTgw&_i=86800528dbd8500' },
  { title: '25年白猪分析', count: '6357', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F343931257%3F_spm_id%3DMjkxODE3Njky&_i=86800540dbd8500' },
  { title: '2022年手环', count: '37823', tag: '热', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F274565065%3F_spm_id%3DMjI2OTQ2ODIw&_i=86799934a8e738d' },
  { title: '2023.4.21问答盘点', count: '23523', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F287136858%3F_spm_id%3DMTc4MDY5MTMw&_i=86801032a8e738d' },
  { title: '夏之回忆舞台分析', count: '63237', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F287380548%3F_spm_id%3DMTc4MDY5MTMw&_i=86801164a8e738d' },
  { title: '柏朱第一轮拍档周期糖点汇总分析发疯楼', count: '62874', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F287288455%3F_spm_id%3DMTc4MDY5MTMw&_i=86801219a8e738d' },
  { title: '两次中泰命运般的相遇1', count: '25532', tag: '新', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F483946494%3F_spm_id%3DMjY2OTM3MTk0&_i=86800848dbd8500' },
  { title: '两次中泰命运般的相遇2', count: '35221', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F489170596%3F_spm_id%3DMTk5NzU1OTYy&_i=86801768dbd8500' },
  { title: '329常州汽水音乐节整理', count: '64311', tag: '热', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F482761458%3F_spm_id%3DNTg0MzQ1OTc&_i=868034215c3131e' }
])

function getRankClass(idx) {
  if (idx === 0) return 'rank-1'
  if (idx === 1) return 'rank-2'
  if (idx === 2) return 'rank-3'
  return ''
}

function tagClass(tag) {
  const map = {
    '热': 'tag-red',
    '爆': 'tag-dark-red',
    '新': 'tag-blue',
    '荐': 'tag-green',
    '官宣': 'tag-blue',
    '辟谣': 'tag-orange',
    '沸': 'tag-orange'
  }
  return map[tag] || ''
}

function onItemClick(item) {
  if (item.link) {
    window.open(item.link, '_blank', 'noopener,noreferrer')
  }
  emit('item-click', item)
}
</script>

<style scoped>
.douban-page {
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
  margin-bottom: 24px;
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

.hot-list {
  background: #141414;
  border-radius: 14px;
  overflow: hidden;
  padding: 4px 0;
}

.hot-item {
  display: flex;
  align-items: flex-start;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  gap: 16px;
}

.hot-item:last-child {
  border-bottom: none;
}

.hot-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

/* 排名 */
.rank {
  width: 28px;
  flex-shrink: 0;
  font-size: 18px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.35);
  text-align: center;
  line-height: 1.4;
}

.rank-1 { color: #ff3838; }
.rank-2 { color: #ff7a3c; }
.rank-3 { color: #ffb43c; }

/* 内容 */
.hot-content {
  flex: 1;
  min-width: 0;
}

.hot-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.5;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff8c1a;
  flex-shrink: 0;
}

.hot-count {
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.45);
}

.hot-sub {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* 右侧标签区 */
.hot-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
}

.tag-red {
  background: #ff3838;
}

.tag-dark-red {
  background: #c91313;
}

.tag-blue {
  background: #2f75ff;
}

.tag-green {
  background: #1fb97c;
}

.tag-orange {
  background: #ff8c1a;
}

/* 子条目附加的 tag */
:deep(.sub-tag) {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  color: #ffffff;
  font-weight: 600;
}

.hot-sub :deep(.sub-tag-blue) { background: #2f75ff; }
.hot-sub :deep(.sub-tag-orange) { background: #ff8c1a; }

@media (max-width: 640px) {
  .hot-item {
    padding: 12px 16px;
    gap: 12px;
  }
  .hot-title {
    font-size: 15px;
  }
}
</style>
