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

  // 智能压缩换行符：
  // 1. 普通段落（p标签）后面允许最多2个换行
  // 2. 其他标签（标题、列表、代码块等）后面最多1个换行

  let normalizedMarkdown = markdown

  // 先将所有3个及以上的连续换行压缩为2个
  normalizedMarkdown = normalizedMarkdown.replace(/\n{3,}/g, '\n\n')

  // 识别特殊标签（标题、列表、代码块、引用等）后的换行，压缩为1个
  // 标题：# 开头的行
  normalizedMarkdown = normalizedMarkdown.replace(/(^#{1,6}\s+.+)\n{2,}/gm, '$1\n')

  // 列表：- 或 * 或数字. 开头的行
  normalizedMarkdown = normalizedMarkdown.replace(/(^[\s]*[-*]\s+.+)\n{2,}/gm, '$1\n')
  normalizedMarkdown = normalizedMarkdown.replace(/(^[\s]*\d+\.\s+.+)\n{2,}/gm, '$1\n')

  // 代码块：``` 包裹的内容
  normalizedMarkdown = normalizedMarkdown.replace(/(```[\s\S]*?```)\n{2,}/g, '$1\n')

  // 引用：> 开头的行
  normalizedMarkdown = normalizedMarkdown.replace(/(^>\s+.+)\n{2,}/gm, '$1\n')

  // 水平线：--- 或 *** 或 ___
  normalizedMarkdown = normalizedMarkdown.replace(/(^[-*_]{3,})\n{2,}/gm, '$1\n')

  try {
    return marked.parse(normalizedMarkdown) as string
  } catch (error) {
    console.error('Markdown 渲染失败:', error)
    return markdown
  }
}
