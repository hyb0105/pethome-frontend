import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // 导入 path 模块

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 【新增】resolve配置，用来定义路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // 设置@为src目录的别名
    }
  }
})
