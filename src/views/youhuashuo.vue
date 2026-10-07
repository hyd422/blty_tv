<template>
  <div class="youhuashuo-page">
    <!-- ====== 星球夜幕场景层（纯装饰） ====== -->
    <div class="scene" aria-hidden="true">
      <!-- 悬挂卫星的轨道弧线 -->
      <span class="arc arc-a"></span>
      <span class="arc arc-b"></span>
      <span class="moon moon-1"></span>
      <span class="moon moon-2 pale"></span>
      <span class="moon moon-3"></span>

      <!-- 巨大升起的星球与云带 -->
      <span class="big-planet"></span>
      <span class="cloud cloud-1"></span>
      <span class="cloud cloud-2"></span>
      <span class="cloud cloud-3"></span>

      <!-- 星座连线图（右上） -->
      <svg class="constellation" viewBox="0 0 200 130" fill="none">
        <polyline points="10,100 55,70 95,84 130,38 168,52 190,18" stroke="rgba(205,224,240,0.32)" stroke-width="1" />
        <circle cx="10" cy="100" r="2" fill="rgba(205,224,240,0.5)" />
        <circle cx="55" cy="70" r="2.5" fill="rgba(205,224,240,0.55)" />
        <circle cx="95" cy="84" r="2" fill="rgba(205,224,240,0.4)" />
        <circle cx="130" cy="38" r="2.5" fill="rgba(205,224,240,0.55)" />
        <rect x="185" y="13" width="10" height="10" transform="rotate(45 190 18)" fill="rgba(228,240,252,0.9)" />
        <circle cx="190" cy="18" r="7" stroke="rgba(205,224,240,0.3)" stroke-width="1" />
      </svg>

      <!-- 地景剪影：远景遗迹 / 中景拱桥 / 近景悬崖 / 森林 / 小人 -->
      <svg class="land" viewBox="0 0 1440 560" preserveAspectRatio="xMidYMax slice" fill="none">
        <g fill="rgba(148,170,192,0.35)">
          <path d="M0 300 L0 260 L40 260 L40 210 L60 210 L60 250 L110 250 L110 190 L126 190 L126 176 L142 190 L142 250 L200 250 L200 280 L260 280 L260 230 L300 230 L300 300 Z" />
          <path d="M560 300 L560 240 L580 240 L580 205 L600 205 L600 240 L640 240 L640 300 Z" />
          <path d="M1180 300 L1180 235 L1205 235 L1205 195 L1220 180 L1235 195 L1235 235 L1260 235 L1260 300 Z" />
          <rect x="1010" y="230" width="26" height="70" />
          <rect x="1060" y="250" width="20" height="50" />
        </g>
        <g fill="rgba(94,118,142,0.58)">
          <path d="M140 560 L140 400 L640 400 L640 560 L560 560 L560 470 A50 50 0 0 0 460 470 L460 560 L360 560 L360 470 A50 50 0 0 0 260 470 L260 560 Z" />
          <path d="M760 560 L760 420 L1000 420 L1000 560 L930 560 L930 480 A45 45 0 0 0 840 480 L840 560 Z" />
          <rect x="640" y="360" width="14" height="120" />
          <rect x="700" y="330" width="14" height="150" />
          <rect x="1020" y="350" width="14" height="130" />
        </g>
        <g fill="rgba(43,60,78,0.92)">
          <path d="M0 560 L0 300 L120 310 L200 340 L260 380 L300 420 L330 560 Z" />
          <path d="M1440 560 L1440 330 L1330 350 L1250 390 L1210 430 L1180 480 L1160 560 Z" />
        </g>
        <g fill="rgba(24,36,50,0.95)">
          <circle cx="150" cy="286" r="6" />
          <path d="M144 292 L156 292 L158 322 L142 322 Z" />
          <path d="M141 292 L159 292 L150 280 Z" />
        </g>
        <path
          d="M0 560 L0 500 Q40 470 80 496 Q120 452 170 488 Q210 452 260 490 Q320 448 380 486 Q440 452 500 488 Q560 456 620 490 Q690 450 760 492 Q830 456 900 490 Q970 454 1040 490 Q1110 458 1180 492 Q1250 460 1320 494 Q1380 468 1440 498 L1440 560 Z"
          fill="rgba(26,40,54,0.96)"
        />
      </svg>
    </div>

    <!-- ====== HUD 信息（左上） ====== -->
    <header class="hud">
      <div class="emblem"><span></span></div>
      <p class="hud-kicker">MIDNIGHT · WHISPERS</p>
      <h2 class="hud-title">有话说</h2>
      <p class="hud-sub">多爱小白猪猪吧</p>
      <div class="hud-status">
        <span class="status-pin">◎</span>
        <span class="status-text">最近一次更新 · {{ buildTimeText }}</span>
      </div>
      <p class="hud-heart">💜 柏里挑怡</p>
    </header>

    <!-- ====== 留言传送面板 ====== -->
    <div class="board-card">
      <div class="board-header">
        <h3 class="board-title">留言 / 疑问 / 意见</h3>
        <span class="board-en">TRANSMISSION</span>
      </div>

      <p class="board-notice">
        你的留言只会私下发送，用于改进 ✉️<br />
        如果想收到回复，记得留下联系方式（选填）
      </p>

      <div class="composer">
        <div class="composer-row">
          <input
            v-model="nickname"
            class="composer-input"
            type="text"
            placeholder="昵称（选填）"
            maxlength="20"
          />
          <input
            v-model="contact"
            class="composer-input"
            type="text"
            placeholder="联系方式（选填，如邮箱）"
            maxlength="50"
          />
        </div>
        <textarea
          v-model="draft"
          class="composer-text"
          rows="4"
          placeholder="想说的话...?补档过程中的疑问...?"
          maxlength="500"
        ></textarea>
        <div class="composer-foot">
          <span class="composer-count">{{ draft.length }}/500</span>
          <button class="send-btn" :disabled="!canSend || sending" @click="send">
            {{ sending ? '发送中...' : '发送留言' }}
          </button>
        </div>
      </div>

      <p v-if="sent" class="board-success">已送达，谢谢你的留言 💜</p>
      <p v-if="boardError" class="board-error">{{ boardError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { sendPrivateMessage, hasAccessKey } from '../utils/messages.js'

// ====== 构建时间 ======
const buildTimeText = computed(() => {
  try {
    const ts = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : ''
    if (!ts) return '未知'
    const d = new Date(ts)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day} ${hh}:${mm}`
  } catch {
    return '未知'
  }
})

// ====== 留言表单 ======
const nickname = ref('')
const contact = ref('')
const draft = ref('')
const sending = ref(false)
const sent = ref(false)
const boardError = ref('')

const canSend = computed(() => draft.value.trim().length > 0)

let sentTimer = null

async function send() {
  if (!canSend.value || sending.value) return
  const rawName = nickname.value.trim()
  const text = draft.value.trim()
  const contactVal = contact.value.trim()
  // 点击后立即清空页面上的表单，不等网络请求
  draft.value = ''
  contact.value = ''
  nickname.value = ''
  sending.value = true
  boardError.value = ''
  try {
    await sendPrivateMessage({ name: rawName || '匿名小半', text, contact: contactVal })
    sent.value = true
    clearTimeout(sentTimer)
    sentTimer = setTimeout(() => (sent.value = false), 6000)
  } catch (e) {
    // 发送失败时恢复内容，避免重新输入
    draft.value = text
    contact.value = contactVal
    nickname.value = rawName
    boardError.value = e.message || '留言发送失败，请稍后重试'
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  if (!hasAccessKey()) {
    boardError.value =
      '101'
  }
})
</script>

<style scoped>
.youhuashuo-page {
  position: relative;
  min-height: calc(100vh - 130px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 44px 24px 52px;
  background: linear-gradient(
    180deg,
    #223349 0%,
    #2c4160 32%,
    #52708e 56%,
    #93a9bd 72%,
    #6d8499 82%,
    #33475c 100%
  );
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ====== 场景层 ====== */
.scene {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

/* 轨道弧线与悬挂卫星 */
.arc {
  position: absolute;
  border: 1px solid rgba(208, 226, 242, 0.26);
  border-radius: 50%;
}

.arc-a {
  width: 150%;
  height: 420px;
  top: -320px;
  left: -25%;
}

.arc-b {
  width: 110%;
  height: 320px;
  top: -240px;
  left: -5%;
  border-color: rgba(208, 226, 242, 0.16);
}

.moon {
  position: absolute;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #1a2634;
  box-shadow:
    inset 5px 4px 0 rgba(190, 215, 235, 0.22),
    0 0 18px rgba(140, 170, 200, 0.25);
  animation: moonFloat 6s ease-in-out infinite alternate;
}

.moon.pale {
  background: #d8e4ee;
  box-shadow:
    inset -6px -4px 0 rgba(90, 116, 142, 0.35),
    0 0 22px rgba(216, 228, 238, 0.45);
}

.moon-1 { top: 34px; left: 17%; }
.moon-2 { top: 8px; left: calc(50% - 20px); animation-delay: 1.2s; }
.moon-3 { top: 30px; right: 16%; animation-delay: 2.1s; }

@keyframes moonFloat {
  from { transform: translateY(0); }
  to { transform: translateY(-8px); }
}

/* 巨大升起的星球 */
.big-planet {
  position: absolute;
  top: 6%;
  left: 50%;
  transform: translateX(-50%);
  width: min(44vw, 430px);
  height: min(44vw, 430px);
  border-radius: 50%;
  background: radial-gradient(
    circle at 38% 30%,
    #e6eef6 0%,
    #c3d2e0 36%,
    #93a9bd 62%,
    #5d7590 88%,
    #4a6076 100%
  );
  box-shadow:
    0 0 90px rgba(190, 210, 230, 0.35),
    inset -30px -24px 80px rgba(52, 74, 96, 0.55);
}

/* 拂过星球的云带 */
.cloud {
  position: absolute;
  height: 26px;
  border-radius: 50%;
  background: rgba(214, 228, 240, 0.5);
  filter: blur(16px);
}

.cloud-1 {
  top: calc(6% + min(44vw, 430px) * 0.42);
  left: calc(50% - min(44vw, 430px) * 0.72);
  width: min(38vw, 360px);
  animation: cloudDrift 46s linear infinite alternate;
}

.cloud-2 {
  top: calc(6% + min(44vw, 430px) * 0.62);
  left: calc(50% - min(44vw, 430px) * 0.1);
  width: min(30vw, 300px);
  height: 20px;
  background: rgba(226, 236, 246, 0.42);
  animation: cloudDrift 58s linear infinite alternate-reverse;
}

.cloud-3 {
  top: calc(6% + min(44vw, 430px) * 0.3);
  left: calc(50% + min(44vw, 430px) * 0.1);
  width: min(24vw, 240px);
  height: 16px;
  background: rgba(206, 222, 236, 0.34);
  animation: cloudDrift 70s linear infinite alternate;
}

@keyframes cloudDrift {
  from { transform: translateX(0); }
  to { transform: translateX(60px); }
}

/* 星座连线 */
.constellation {
  position: absolute;
  top: 26px;
  right: 3%;
  width: 180px;
  opacity: 0.85;
}

/* 地景剪影 */
.land {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 72%;
}

/* ====== HUD 信息（左上） ====== */
.hud {
  position: relative;
  z-index: 2;
  align-self: flex-start;
  margin: 12px 0 0 4%;
  max-width: 320px;
}

.emblem {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  border: 1.5px solid rgba(210, 228, 244, 0.5);
  padding: 5px;
  margin-bottom: 18px;
  box-shadow: 0 0 22px rgba(160, 190, 215, 0.25);
}

.emblem span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(180deg, #c7d8e8 0%, #a7bdd2 44%, #2a3c52 46%, #1d2e42 100%);
}

.hud-kicker {
  margin: 0 0 6px;
  font-size: 10px;
  letter-spacing: 5px;
  color: rgba(200, 220, 240, 0.55);
  font-family: 'Courier New', monospace;
}

.hud-title {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 600;
  letter-spacing: 10px;
  color: #e8f1fa;
  text-shadow: 0 2px 18px rgba(20, 34, 50, 0.6);
}

.hud-sub {
  margin: 0 0 20px;
  font-size: 13px;
  letter-spacing: 2px;
  color: #1d3153;
  display: inline-block;
  padding: 5px 14px;
  background: rgba(214, 226, 240, 0.88);
  border-radius: 999px;
  font-weight: 700;
}

.hud-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-left: 1px solid rgba(200, 220, 240, 0.4);
  background: linear-gradient(90deg, #1d3153, rgba(29, 49, 83, 0.35));
}

.status-pin {
  color: rgba(210, 228, 244, 0.8);
  font-size: 12px;
}

.status-text {
  font-size: 11px;
  letter-spacing: 1px;
  color: rgba(207, 224, 240, 0.75);
  font-family: 'Courier New', monospace;
}

.hud-heart {
  margin: 16px 0 0;
  font-size: 14px;
  letter-spacing: 3px;
  color: rgba(219, 199, 235, 0.75);
  filter: drop-shadow(0 0 8px rgba(180, 160, 220, 0.4));
}

/* ====== 留言传送面板 ====== */
.board-card {
  position: relative;
  z-index: 2;
  margin-top: auto;
  width: min(600px, 100%);
  background: rgba(16, 28, 42, 0.72);
  border: 1px solid rgba(180, 200, 220, 0.22);
  border-radius: 14px;
  padding: 26px 30px 28px;
  backdrop-filter: blur(6px);
  box-shadow: 0 18px 50px rgba(10, 20, 32, 0.45);
}

.board-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.board-title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 3px;
  color: #dbe9f6;
  margin: 0;
}

.board-en {
  font-size: 10px;
  letter-spacing: 4px;
  color: rgba(200, 220, 240, 0.4);
  font-family: 'Courier New', monospace;
}

.board-notice {
  font-size: 12px;
  color: rgba(196, 214, 230, 0.5);
  margin: 0 0 18px;
  line-height: 1.8;
}

.composer {
  background: rgba(180, 205, 228, 0.05);
  border: 1px solid rgba(180, 200, 220, 0.2);
  border-radius: 10px;
  padding: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.composer:focus-within {
  border-color: rgba(188, 211, 232, 0.55);
  box-shadow: 0 0 22px rgba(140, 175, 205, 0.18);
}

.composer-row {
  display: flex;
  gap: 12px;
}

.composer-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: #e6eff8;
  caret-color: #bcd3e8;
  font-size: 13px;
  padding: 0 2px 10px;
  border-bottom: 1px solid rgba(180, 200, 220, 0.26);
  margin-bottom: 10px;
}

.composer-input::placeholder,
.composer-text::placeholder {
  color: rgba(196, 214, 230, 0.35);
}

.composer-text {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  resize: vertical;
  min-height: 76px;
  color: #e6eff8;
  caret-color: #bcd3e8;
  font-size: 13px;
  line-height: 1.7;
  font-family: inherit;
}

.composer-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.composer-count {
  font-size: 11px;
  color: rgba(196, 214, 230, 0.4);
  font-family: 'Courier New', monospace;
}

.send-btn {
  background: transparent;
  border: 1px solid rgba(190, 210, 230, 0.55);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 4px;
  color: #dbe9f6;
  padding: 8px 22px;
  border-radius: 4px;
  transition: all 0.25s;
}

.send-btn:hover:not(:disabled) {
  background: rgba(188, 211, 232, 0.14);
  border-color: rgba(210, 228, 244, 0.8);
  box-shadow: 0 0 20px rgba(150, 185, 215, 0.25);
}

.send-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.board-success {
  font-size: 12px;
  color: #9fd4cd;
  background: rgba(126, 196, 190, 0.08);
  border: 1px solid rgba(126, 196, 190, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  margin: 12px 0 0;
  line-height: 1.6;
}

.board-error {
  font-size: 12px;
  color: #e8a9a9;
  background: rgba(214, 130, 130, 0.08);
  border: 1px solid rgba(214, 130, 130, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  margin: 12px 0 0;
  line-height: 1.6;
}

/* 响应式 */
@media (max-width: 768px) {
  .youhuashuo-page {
    padding: 32px 16px 40px;
    min-height: calc(100vh - 110px);
  }
  .big-planet {
    width: 72vw;
    height: 72vw;
  }
  .constellation {
    width: 120px;
    top: 14px;
  }
  .hud {
    margin-left: 6%;
  }
  .hud-title {
    font-size: 24px;
    letter-spacing: 7px;
  }
  .moon {
    width: 24px;
    height: 24px;
  }
  .board-card {
    padding: 22px 18px 24px;
  }
  .composer-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
