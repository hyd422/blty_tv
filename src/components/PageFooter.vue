<template>
  <!-- 底部提示 -->
  <footer class="page-footer">
    <div class="footer-bg-text">
      <span class="watermark watermark-left">{{ leftWatermark }}</span>
      <span class="watermark watermark-center">{{ centerWatermark }}</span>
      <span class="watermark watermark-right">{{ rightWatermark }}</span>
    </div>
    <p class="footer-text">{{ mainText }}</p>
    <p class="footer-source">{{ sourceText }}</p>
  </footer>
</template>

<script setup>
defineProps({
  leftWatermark: {
    type: String,
    default: 'ZYX'
  },
  centerWatermark: {
    type: String,
    default: 'B a i L i T i a o Y i'
  },
  rightWatermark: {
    type: String,
    default: 'BXY'
  },
  mainText: {
    type: String,
    default: '✳未完待续 敬请期待✳'
  },
  sourceText: {
    type: String,
    default: '@爱吃叶绿素出品'
  }
})
</script>

<style scoped>
.page-footer {
  position: relative;
  text-align: center;
  padding: 60px 20px 30px;
  margin-top: 20px;
}

.footer-bg-text {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  pointer-events: none;
  opacity: 0.08;
  z-index: 0;
}

.watermark {
  font-size: 72px;
  font-weight: 900;
  letter-spacing: 8px;
  color: #ffffff;
}

.watermark-center {
  font-size: 56px;
  letter-spacing: 12px;
}

.footer-text {
  position: relative;
  z-index: 1;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 4px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 20px;
}

.footer-source {
  position: relative;
  z-index: 1;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}
</style>
