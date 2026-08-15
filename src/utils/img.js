/**
 * 图片路径处理
 * 现在使用 Cloudflare Pages 托管，自带全球 CDN，无需 jsDelivr
 * 直接返回相对路径，由 Cloudflare Pages 边缘节点提供图片
 */

/**
 * 返回图片的相对路径
 * @param {string} path - 本地路径，如 'assets/pictures/thumb/34.jpg'
 * @returns {string} 加 / 前缀的相对路径
 */
export function cdnImg(path) {
  const clean = path.replace(/^\//, '')
  return `/${clean}`
}
