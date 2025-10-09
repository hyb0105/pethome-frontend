import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // 导入路由

// 只创建一次App实例
const app = createApp(App)

// 在挂载之前，先使用路由
app.use(router)

// 最后，将配置好的App挂载到页面上
app.mount('#app')