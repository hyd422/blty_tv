// 从 fetched_weibo_3209726480.json 生成星图数据 public/weibo/starmap_events.json
// 每条: { d: 'YYYYMMDD', t: 事件摘要, u: 微博链接, l: 点赞数 }
import fs from 'node:fs'

const SRC = 'public/weibo/fetched_weibo_3209726480.json'
const OUT = 'public/weibo/starmap_events.json'

const j = JSON.parse(fs.readFileSync(SRC, 'utf8'))

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
}

// 清洗微博 HTML：保留链接可见文本，输出纯文本
function cleanText(html) {
  if (!html) return ''
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<span class="surl-text">([\s\S]*?)<\/span>/gi, '$1')
      .replace(/<span class='url-icon'>[\s\S]*?<\/span>/gi, '')
      .replace(/<img[^>]*>/gi, '')
      .replace(/<a[^>]*>/gi, '')
      .replace(/<\/a>/gi, '')
      .replace(/<[^>]+>/g, '')
  )
}

// 取事件摘要见下方 pickTitle（基于词频过滤样板行）

const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }

// "Sat Mar 14 22:37:15 +0800 2026" -> { y, m, d }
function parseDate(s) {
  const m = /^(\w{3})\s+(\w{3})\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})\s+\+0800\s+(\d{4})$/.exec(s || '')
  if (!m) return null
  return { y: +m[7], mo: MONTHS[m[2]] || 1, d: +m[3], hh: +m[4], mm: +m[5] }
}

// 预收集所有行，统计词频以识别样板行（如超话名"柏里挑怡"）
const allPosts = []
for (const card of j.cards) {
  if (card.card_type !== 9 || !card.mblog) continue
  allPosts.push(card.mblog)
}
const lineFreq = new Map()
for (const mb of allPosts) {
  const lines = new Set(cleanText(mb.text).split('\n').map(l => l.trim()).filter(Boolean))
  for (const l of lines) lineFreq.set(l, (lineFreq.get(l) || 0) + 1)
}
const totalPosts = allPosts.length
// 出现在 >10% 微博中的行视为样板
const boilerplate = new Set([...lineFreq.entries()].filter(([, n]) => n > totalPosts * 0.1).map(([l]) => l))

function pickTitle(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  let fallback = ''
  for (let l of lines) {
    if (/^20\d{2}[.\-/年]\s*\d{1,2}[.\-/月]\s*\d{1,2}日?$/.test(l)) continue
    l = l.replace(/^20\d{2}[.\-/年]\s*\d{1,2}[.\-/月]\s*\d{1,2}日?\s*[:：]?\s*/, '')
    if (!l) continue
    l = l.replace(/\s+/g, ' ').trim()
    if (!l) continue
    if (boilerplate.has(l)) continue
    // 带 # 的话题词条不展示
    if (l.includes('#')) continue
    // 纯表情/符号标题不展示（至少含一个中文、字母或数字）
    if (!/[\u4e00-\u9fa5a-zA-Z0-9]/.test(l)) continue
    // 优先返回信息行；同时记录第一条非样板行作为兜底
    if (!fallback) fallback = l
    if (l.length >= 4) return l.length > 18 ? l.slice(0, 17) + '…' : l
  }
  if (fallback) return fallback.length > 18 ? fallback.slice(0, 17) + '…' : fallback
  return ''
}

const events = []
const seen = new Set()
// 含这些关键词的内容（周边/追加/🍊相关）整条不展示
const BLOCKED = /🍊|周边|追加/
for (const mb of allPosts) {
  const text = cleanText(mb.text)
  if (BLOCKED.test(text)) continue
  const dt = parseDate(mb.created_at)
  if (!dt) continue
  const title = pickTitle(cleanText(mb.text))
  if (!title) continue
  const url = mb.bid ? `https://m.weibo.cn/status/${mb.bid}` : ''
  if (!url) continue
  const d = `${dt.y}${String(dt.mo).padStart(2, '0')}${String(dt.d).padStart(2, '0')}`
  const key = d + title
  if (seen.has(key)) continue
  seen.add(key)
  events.push({ d, t: title, u: url, l: Number(mb.attitudes_count) || 0 })
}

events.sort((a, b) => a.d.localeCompare(b.d))

fs.writeFileSync(OUT, JSON.stringify(events))
console.log(`OK: ${events.length} events -> ${OUT}`)
const years = {}
for (const e of events) years[e.d.slice(0, 4)] = (years[e.d.slice(0, 4)] || 0) + 1
console.log('by year:', JSON.stringify(years))
console.log('sample:', JSON.stringify(events.slice(0, 3), null, 1))
