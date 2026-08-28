<template>
  <div class="youhuashuo-page">
    <div class="yhs-card">
      <div class="yhs-header">
        <span class="yhs-icon">💬</span>
        <h2 class="yhs-title">有话说</h2>
      </div>

      <div class="yhs-body">
        <p class="yhs-line">最近一次更新时间为：<span class="yhs-time">{{ buildTimeText }}</span></p>
        <p class="yhs-line">如果你能耐心看完大部分的内容，说明你已经出了新手村，是一个合格的小半了。</p>
        <p class="yhs-line">当然更多的内容是整理不完的，如果感兴趣的话请多多自行补档，好好爱这两个真诚的小女孩吧。</p>
      </div>

      <div class="yhs-footer">
        <span class="yhs-heart">💜柏里挑怡</span>
      </div>
    </div>

    <!-- ====== 私密留言（只发送给站长，其他访客不可见） ====== -->
    <div class="board-card">
      <div class="board-header">
        <h3 class="board-title">留言/疑问/意见</h3>
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
  sending.value = true
  boardError.value = ''
  const name = nickname.value.trim() || '匿名小半'
  try {
    await sendPrivateMessage({ name, text: draft.value.trim(), contact: contact.value.trim() })
    draft.value = ''
    contact.value = ''
    nickname.value = ''
    sent.value = true
    clearTimeout(sentTimer)
    sentTimer = setTimeout(() => (sent.value = false), 6000)
  } catch (e) {
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
  animation: fadeIn 0.4s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.yhs-card {
  max-width: 640px;
  width: 100%;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.04), rgba(255, 184, 0, 0.02));
  border: 1px solid rgba(255, 184, 0, 0.15);
  border-radius: 20px;
  padding: 40px 36px;
  position: relative;
  overflow: hidden;
}

.yhs-card::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(255, 184, 0, 0.12), transparent 70%);
  pointer-events: none;
}

.yhs-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px dashed rgba(255, 184, 0, 0.2);
}

.yhs-icon {
  font-size: 32px;
}

.yhs-title {
  font-size: 26px;
  font-weight: 800;
  color: #ffb800;
  letter-spacing: 2px;
  margin: 0;
}

.yhs-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.yhs-line {
  font-size: 15px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.yhs-time {
  color: #ffb800;
  font-weight: 700;
  padding: 2px 10px;
  background: rgba(255, 184, 0, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 184, 0, 0.25);
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.yhs-footer {
  text-align: center;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px dashed rgba(255, 184, 0, 0.15);
}

.yhs-heart {
  font-size: 24px;
  display: inline-block;
  animation: beat 1.6s ease-in-out infinite;
}

@keyframes beat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.18); }
}

/* ====== 留言表单 ====== */
.board-card {
  max-width: 640px;
  width: 100%;
  margin-top: 32px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.04), rgba(255, 184, 0, 0.02));
  border: 1px solid rgba(255, 184, 0, 0.15);
  border-radius: 20px;
  padding: 32px 36px;
}

.board-header {
  margin-bottom: 14px;
}

.board-title {
  font-size: 20px;
  font-weight: 800;
  color: #ffb800;
  letter-spacing: 1px;
  margin: 0;
}

.board-notice {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  margin: 0 0 20px;
  line-height: 1.8;
}

.composer {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 184, 0, 0.18);
  border-radius: 14px;
  padding: 14px;
  transition: border-color 0.2s;
}

.composer:focus-within {
  border-color: rgba(255, 184, 0, 0.45);
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
  color: #ffffff;
  font-size: 14px;
  padding: 0 2px 10px;
  border-bottom: 1px dashed rgba(255, 184, 0, 0.18);
  margin-bottom: 10px;
}

.composer-input::placeholder,
.composer-text::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.composer-text {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  resize: vertical;
  min-height: 80px;
  color: #ffffff;
  font-size: 14px;
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
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-family: 'Courier New', monospace;
}

.send-btn {
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: #0a0a0a;
  background: linear-gradient(135deg, #ffcd4d, #ffb800);
  padding: 7px 18px;
  border-radius: 18px;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 184, 0, 0.35);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.board-success {
  font-size: 13px;
  color: #00e700;
  background: rgba(0, 231, 0, 0.08);
  border: 1px solid rgba(0, 231, 0, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 12px 0 0;
  line-height: 1.6;
}

.board-error {
  font-size: 13px;
  color: #ff9f43;
  background: rgba(255, 159, 67, 0.1);
  border: 1px solid rgba(255, 159, 67, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 12px 0 0;
  line-height: 1.6;
}

/* 响应式 */
@media (max-width: 768px) {
  .youhuashuo-page {
    padding: 20px 0;
  }
  .yhs-card,
  .board-card {
    padding: 28px 22px;
    border-radius: 16px;
  }
  .yhs-icon {
    font-size: 26px;
  }
  .yhs-title {
    font-size: 22px;
  }
  .yhs-line {
    font-size: 14px;
    line-height: 1.85;
  }
  .composer-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
