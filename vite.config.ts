import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 判断是否为嵌入式构建模式
  const isEmbedBuild = mode === 'embed'

  return {
    plugins: [
      vue(),
      (monacoEditorPlugin as any).default({
        languageWorkers: ['json']
      })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          ws: true, // 启用 WebSocket 代理
        },
      },
    },
    // 嵌入式构建配置：静态资源在根路径
    base: '/',
    define: {
      __EMBED_MODE__: JSON.stringify(isEmbedBuild)
    }
  }
})
