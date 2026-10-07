<template>
  <span
    class="pixel-pet"
    :class="{ boop: jumping }"
    :style="{ width: size + 'px', height: size + 'px' }"
    :title="name"
    @click="onBoop"
  >
    <svg viewBox="0 0 24 24" shape-rendering="crispEdges">
      <rect v-for="(px, i) in rects" :key="i" :x="px.x" :y="px.y" :width="px.w" height="1" :fill="px.c" />
    </svg>
    <transition name="pet-bubble">
      <span v-if="bubble" class="pet-bubble">{{ bubble }}</span>
    </transition>
  </span>
</template>

<script setup>
import { ref, computed } from 'vue'


const ART = {
  pig: {
    name: '企鹅猪咪',
    quotes: ['我是企鹅猪咪呀', '哼哼~', '多爱小白猪猪吧', '今天也要开开心心', '补档中，稍等哦', '💜💜💜','智者不入爱河','不要松开我的手','每次许愿里都有你','一起去旅行吧'],
    colors: { B: '#256fa5', b: '#6fc5f2', W: '#d7dee5', w: '#ffffff', P: '#ef8ba6', p: '#f8b8c8', v: '#9b5de5', g: '#f4c542', k: '#1e2933' },
    rows: [
      '.........WWWWWW.........',
      '........WWWWWWWW........',
      '.......WwwwwwwwW........',
      '......WwwwwwwwwwW.......',
      '......WWWWWWWWWWWW......',
      '.......WWWWWWWWWW.......',
      '...BBB.bbbbbbbbbb.BBB...',
      '..BPBbbbbbbbbbbbbBPB....',
      '....bbbbbbbbbbbbbbbb....',
      '....bbbbbbbbbbbbbbbb....',
      '....bbbkkbbbbbbkkbbb....',
      '....bbbbbbbbbbbbbbbb....',
      '....bbbbbbPPPPbbbbbb....',
      '....bbpbbbbbbbbbbpbb....',
      '....bbbbbbbbbbbbbbbb....',
      '......bbbbbbbbbbbb......',
      '.....vvvvvvvvvvvvvv.....',
      '.....vvvvvvvggvvvvv.....',
      '......wwwwwwwwwwww......',
      '......wwwwwwwwwwww......',
      '......wWWWWWWWWWWw......',
      '......wWWWWWWWWWWw......',
      '......wwwwwwwwwwww......',
      '.....gg.....gg.....gg...'
    ]
  },
  dog: {
    name: '小啵狗',
    quotes: ['我是小啵狗！', '汪！', '等多久都愿意', '别皱眉嘛', '陪你看完这一场', '汪汪汪!','掉进你的可爱陷阱','被臭企鹅给骗了','我的血条也只供你消耗~','因为有你所以遍地生花'],
    colors: { W: '#cfd9e4', w: '#ffffff', p: '#f6b8c4', k: '#4a382c', n: '#2b2320', v: '#4a7fc4', g: '#f4c542' },
    rows: [
      '...........ww...........',
      '........wwwwwwww........',
      '.....ww.wwwwwwww.ww.....',
      '.....pw.wwwwwwww.wp.....',
      '....ww.wwwwwwwwww.ww....',
      '....pw.wwwwwwwwww.wp....',
      '....wwwwwwwwwwwwwwww....',
      '....wwwkwwwwwwwwkwww....',
      '....wwwkkwwwwwwkkwww....',
      '....wwwkkwwwwwwkkwww....',
      '....wppwwwwnnwwwwppw....',
      '....wwwwwwkwwkwwwwww....',
      '....wwwwwwwwwwwwwwww....',
      '...wwwwwwwwwwwwwwwwww...',
      '...vvvvvvvvvvvvvvvvvv...',
      '...vvvvvvvggggvvvvvvv...',
      '...vvvvvvvvggvvvvvvvv...',
      '....wwwwwwwwwwwwwwww....',
      '....wwwwwwwwwwwwwwww....',
      '....wwwwwwwwwwwwwwww.ww.',
      '....wwwwwwwwwwwwwwww....',
      '....wwww.wwwwww.wwww....',
      '....wwwwwwwwwwwwwwww....',
      '........................'
    ]
  }
}

const props = defineProps({
  pet: { type: String, default: 'pig' }, // 'pig' | 'dog'
  size: { type: Number, default: 64 },
  quotes: { type: Array, default: null } // 自定义语录
})

const emit = defineEmits(['boop'])

const art = computed(() => ART[props.pet] || ART.pig)
const name = computed(() => art.value.name)

// 字符网格 -> run-length 合并的 rect 列表
const rects = computed(() => {
  const out = []
  const { rows, colors } = art.value
  rows.forEach((row, y) => {
    let run = null
    for (let x = 0; x <= row.length; x++) {
      const ch = row[x]
      const c = colors[ch]
      if (run && run.c === c) { run.w++ } else {
        if (run && run.c) out.push({ x: run.x, y, w: run.w, c: run.c })
        run = { x, w: 1, c }
      }
    }
  })
  return out
})

const bubble = ref('')
const jumping = ref(false)
let bubbleTimer = null
let jumpTimer = null

function onBoop() {
  const list = props.quotes || art.value.quotes
  bubble.value = list[Math.floor(Math.random() * list.length)]
  clearTimeout(bubbleTimer)
  bubbleTimer = setTimeout(() => (bubble.value = ''), 2200)

  jumping.value = false
  // 强制重启动画
  requestAnimationFrame(() => {
    jumping.value = true
    clearTimeout(jumpTimer)
    jumpTimer = setTimeout(() => (jumping.value = false), 650)
  })
  emit('boop', props.pet)
}
</script>

<style scoped>
.pixel-pet {
  position: relative;
  display: inline-block;
  cursor: pointer;
  image-rendering: pixelated;
  animation: petIdle 3.2s ease-in-out infinite;
  transition: transform 0.2s;
  user-select: none;
  line-height: 0;
}

.pixel-pet:hover {
  transform: scale(1.12) rotate(-4deg);
  animation-play-state: paused;
}

.pixel-pet svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 3px 6px rgba(10, 18, 30, 0.45));
}

/* 待机轻摇摆 */
@keyframes petIdle {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-4px) rotate(2deg); }
}

/* 点击 squash & jump */
.pixel-pet.boop {
  animation: petBoop 0.65s cubic-bezier(0.28, 0.84, 0.42, 1);
}

@keyframes petBoop {
  0% { transform: scale(1.05, 0.9); }
  30% { transform: translateY(-14px) scale(0.95, 1.08); }
  55% { transform: translateY(0) scale(1.06, 0.92); }
  75% { transform: translateY(-5px) scale(1); }
  100% { transform: translateY(0) scale(1); }
}

/* 语录气泡 */
.pet-bubble {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  letter-spacing: 1px;
  color: #e8f1fa;
  background: rgba(16, 28, 44, 0.92);
  border: 1px solid rgba(188, 211, 232, 0.4);
  border-radius: 10px;
  padding: 4px 10px;
  line-height: 1.4;
  pointer-events: none;
  box-shadow: 0 4px 14px rgba(8, 16, 28, 0.4);
}

.pet-bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -5px;
  width: 8px;
  height: 8px;
  background: inherit;
  border-right: 1px solid rgba(188, 211, 232, 0.4);
  border-bottom: 1px solid rgba(188, 211, 232, 0.4);
  transform: translateX(-50%) rotate(45deg);
}

.pet-bubble-enter-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pet-bubble-leave-active { transition: all 0.2s ease; }
.pet-bubble-enter-from,
.pet-bubble-leave-to { opacity: 0; transform: translateX(-50%) translateY(6px) scale(0.85); }
</style>
