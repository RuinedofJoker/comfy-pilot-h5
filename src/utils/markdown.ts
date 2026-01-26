/**
 * Markdown 渲染工具
 * 使用 marked 和 highlight.js 实现 Markdown 渲染和代码高亮
 */

import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'

/**
 * 配置 marked 使用 highlight.js 扩展
 */
marked.use(
  markedHighlight({
    highlight(code, lang) {
      // 如果指定了语言且 highlight.js 支持，则高亮
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value
        } catch (err) {
          console.error('代码高亮失败:', err)
        }
      }
      // 否则使用自动检测
      try {
        return hljs.highlightAuto(code).value
      } catch (err) {
        console.error('代码高亮失败:', err)
        return code
      }
    }
  })
)

/**
 * 配置 marked 其他选项
 */
marked.setOptions({
  breaks: true, // 支持 GFM 换行
  gfm: true, // 启用 GitHub Flavored Markdown
})

/**
 * 将 Markdown 文本渲染为 HTML
 * @param markdown Markdown 文本
 * @returns 渲染后的 HTML 字符串
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown || !markdown.trim()) {
    return ''
  }

  try {
    return marked.parse(markdown) as string
  } catch (error) {
    console.error('Markdown 渲染失败:', error)
    return markdown
  }
}
