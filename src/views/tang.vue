<template>
  <div class="tang-page">
    <div class="page-header">
      <h2 class="page-title">那些很锤的糖</h2>
      <span class="page-subtitle">糖点榜 · 今日份糖份摄入量已超标</span>
    </div>

    <div class="hot-list">
      <div
        v-for="(item, idx) in tangList"
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
          <div v-if="item.sub" class="hot-sub">
            <span>{{ item.sub }}</span>
          </div>
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

// 词条根据现有舞台标题 / 直播 / Re视频等默认填充
const tangList = ref([
  { title: '曝blty草莓图', count: '爆 486万', tag: '爆', dot: false, link: 'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F333112344%3F_spm_id%3DMjU1NTgyNzgz&_i=86721380ae92653&dt_dapp=1' },
  { title: '惊！某cp排练时连环三连啵', count: '327万', tag: '热', dot: false,link:'https://video.weibo.com/show?fid=1034:5329340489990158' },
  { title: 'bxy被曝身着新郎服哄嫂子', count: '261万', tag: '热', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F477228377%3F_spm_id%3DMjgzNjkyOTMz&_i=86722408ae92653&dt_dapp=1' },
  { title: '某四字cp泰国偶遇 两人举止亲密 疑似恋情曝光', count: '下午霸榜',sub: '路人爆料 柏欣妤×朱怡欣 私下同框', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F324320539%3F_spm_id%3DMjcxNjE1OTc3&_i=86722816ae92653&dt_dapp=1' },
  { title: '迪士尼小情侣同游被偷拍', count: '183万', tag: '', dot: true, link:' https://v.douyin.com/vC2FZ48MzPc/ :8pm M@J.Iv UYZ:/ 02/20 ' },
  { title: '某艺人节目中当众表白拍档！还是太爱！', count: '168万', tag: '新', dot: false, sub: '台上 朱怡欣突然告白 柏欣妤害羞回应',link:' https://b23.tv/5k8HpI8' },
  { title: 'bxy直播说漏嘴实锤恋情', count: '156万', tag: '', dot: false,link:'https://b23.tv/b06y9hD' },
  { title: 'blty私下叠叠坐', count: '142万', tag: '新', dot: false,link:'https://v.douyin.com/6uJVJmVKuLA/ z@t.Rx DHI:/ 05/19 :8pm ' },
  { title: '柏欣妤 朱怡欣 pv打啵', count: '138万', tag: '', dot: false,link:'https://weibo.com/1640743024/5324664823875772' },
  { title: 'blty厦门约会被曝光', count: '130万', tag: '', dot: false,link:'https://v.douyin.com/QxuzksOdNbs/ 06/10 Fho:/ D@h.ba :1pm ' },
  { title: '直播我爱你降噪版', count: '125万', tag: '', dot: false,link:'https://weibo.com/6256252477/5006795892068396' },
  { title: '叫粉丝宝宝们被瞪秒滑跪改口', count: '118万', tag: '', dot: false,link:'https://b23.tv/LQBW2WC' },
  { title: '排练秀恩爱把站姐吓手抖', count: '105万', tag: '', dot: false,link:' https://b23.tv/o70Ufft' },
  { title: '柏欣妤 朱怡欣 亲脸', count: '97万', tag: '', dot: false,link:'https://b23.tv/wb6A8wS' },
  { title: '那些充满欲望的瞬间', count: '89万', tag: '', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F357736206%3F_spm_id%3DMjg4ODY5Mjg2&_i=86724776ae92653&dt_dapp=1' },
  { title: 'pocky 拍照', count: '82万', tag: '', dot: true,link:'https://b23.tv/fgSqbdP' },
  { title: 'zyx霸气护妻', count: '76万', tag: '', dot: false,link:'https://weibo.com/3289408751/5304409656398699' },
  { title: '公主抱 吃pocky', count: '68万', tag: '', dot: false,link:'https://weibo.com/3289408751/5304395552000308' },
  { title: '后背吻', count: '63万', tag: '', dot: false,link:' https://b23.tv/FdIh5dz' },
  { title: '宝宝 你旁边那个人好像喜欢你', count: '57万', tag: '', dot: false,link:'https://b23.tv/zW8X9Xu' },
  { title: '合集', count: '52万', tag: '新', dot: false,link:'https://www.douban.com/doubanapp/dispatch?uri=%2Fgroup%2Ftopic%2F496696653%3F_spm_id%3DMjg3NTEyMzY3&_i=86726088ae92653&dt_dapp=1' }
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
.tang-page {
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
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
}

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

.tag-red { background: #ff3838; }
.tag-dark-red { background: #c91313; }
.tag-blue { background: #2f75ff; }
.tag-green { background: #1fb97c; }
.tag-orange { background: #ff8c1a; }

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
