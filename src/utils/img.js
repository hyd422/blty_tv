/**
 * 图片路径处理
 * 现在使用 Cloudflare Pages 托管，自带全球 CDN，无需 jsDelivr
 * 直接返回相对路径，由 Cloudflare Pages 边缘节点提供图片
 */

// 每次构建都会变化的版本号，自动附加到图片 URL 后，避免部署后浏览器/CDN 仍用旧缓存
const buildVersion =
  typeof __BUILD_TIME__ !== 'undefined'
    ? __BUILD_TIME__
    : String(Date.now())

/**
 * 返回图片的相对路径（带构建版本参数，用于缓存刷新）
 * @param {string} path - 本地路径，如 'assets/pictures/thumb/34.jpg'
 * @returns {string} 加 / 前缀的相对路径，如 /assets/pictures/thumb/34.jpg?v=...
 */
export function cdnImg(path) {
  const clean = path.replace(/^\//, '')
  return `/${clean}?v=${buildVersion}`
}
