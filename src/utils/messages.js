// ====== 私密留言发送 ======
// 使用 Web3Forms 将访客留言直接发送到站长邮箱：
//  - 其他访客不可见，不在任何地方存储展示
//  - 纯前端调用，不改动仓库内容，不会触发站点重新部署
// Access Key 获取：https://web3forms.com 输入你的邮箱，收到邮件里的 Key 即可（免费）

const W3F_URL = 'https://api.web3forms.com/submit'

export const hasAccessKey = () => Boolean(import.meta.env.VITE_W3F_ACCESS_KEY)

// opts: { name, text, contact }
export async function sendPrivateMessage({ name, text, contact = '' }) {
  if (!hasAccessKey()) {
    throw new Error('尚未配置 VITE_W3F_ACCESS_KEY，无法发送留言')
  }

  const res = await fetch(W3F_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: import.meta.env.VITE_W3F_ACCESS_KEY,
      subject: `【站点留言】来自 ${name}`,
      from_name: '站点留言板',
      name,
      contact,
      message: text,
      botcheck: false // 蜜罐字段：真人不填写
    })
  })

  const data = await res.json().catch(() => ({}))
  if (res.ok && data.success) return true
  throw new Error(data.message || `留言发送失败 (${res.status})`)
}
