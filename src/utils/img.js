/**
 * 图片 CDN 加速
 * GitHub Pages 在国内访问慢，通过 jsDelivr CDN 加速图片加载
 * jsDelivr 会缓存 GitHub 仓库文件，国内访问速度更快
 */

// jsDelivr CDN 基础路径（指向 GitHub 仓库 main 分支的 public 目录）
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/hyd422/blty_tv@main/public'

/**
 * 将本地图片路径转换为 CDN 路径
 * @param {string} path - 本地路径，如 'assets/pictures/thumb/34.jpg'
 * @returns {string} CDN 完整路径
 */
export function cdnImg(path) {
  // 去掉开头的斜杠
  const clean = path.replace(/^\//, '')
  return `${CDN_BASE}/${clean}`
}
