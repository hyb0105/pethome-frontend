import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 【新增】导入 Element Plus 的库和样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import './style.css' // 您原有的全局样式可以保留

const app = createApp(App)

app.use(router)
app.use(ElementPlus) // 【新增】让Vue应用使用 Element Plus

app.mount('#app')