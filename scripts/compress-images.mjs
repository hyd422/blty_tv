/**
 * 图片压缩脚本
 * 将 public/assets/pictures/ 下的 JPG 图片压缩为两种尺寸：
 *   - thumb/   480px 宽，质量 78（网格缩略图、封面）
 *   - medium/  800px 宽，质量 82（轮播大图）
 * 用法: node scripts/compress-images.mjs
 */
import sharp from 'sharp'
import { readdir, stat, mkdir, writeFile, readFile } from 'fs/promises'
import { join } from 'path'

const SRC_DIR = join(process.cwd(), 'public', 'assets', 'pictures')
const THUMB_DIR = join(SRC_DIR, 'thumb')
const MEDIUM_DIR = join(SRC_DIR, 'medium')

const SIZES = [
  { dir: THUMB_DIR,  width: 480, quality: 78 },
  { dir: MEDIUM_DIR, width: 800, quality: 82 },
]

async function compressImages() {
  for (const s of SIZES) {
    await mkdir(s.dir, { recursive: true })
  }

  const files = await readdir(SRC_DIR)
  const jpgs = files.filter(f => f.toLowerCase().endsWith('.jpg'))

  let totalOriginal = 0
  let totalThumb = 0
  let totalMedium = 0

  for (const file of jpgs) {
    const srcPath = join(SRC_DIR, file)
    const buf = await readFile(srcPath)
    const originalKB = buf.length / 1024
    totalOriginal += originalKB

    const parts = []
    for (const s of SIZES) {
      const compressed = await sharp(buf)
        .resize({ width: s.width, withoutEnlargement: true })
        .jpeg({ quality: s.quality, progressive: true, mozjpeg: true })
        .toBuffer()

      await writeFile(join(s.dir, file), compressed)
      const kb = compressed.length / 1024

      if (s.dir === THUMB_DIR) totalThumb += kb
      else totalMedium += kb

      parts.push(`${kb.toFixed(1)}KB`)
    }

    console.log(
      `${file.padEnd(12)} ${originalKB.toFixed(1)}KB -> thumb:${parts[0]}  medium:${parts[1]}`
    )
  }

  console.log('─'.repeat(55))
  console.log(
    `原始: ${(totalOriginal / 1024).toFixed(1)}MB | ` +
    `thumb: ${(totalThumb / 1024).toFixed(1)}MB | ` +
    `medium: ${(totalMedium / 1024).toFixed(1)}MB`
  )
}

compressImages().catch(err => {
  console.error('压缩失败:', err)
  process.exit(1)
})
