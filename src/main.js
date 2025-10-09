import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// 【第1处修改】从我们创建的 router.js 文件中导入路由实例
import router from './router'

createApp(App).mount('#app')
const app = createApp(App);
// 【第2处修改】在挂载应用之前，告诉Vue实例去使用我们导入的路由
app.use(router)

app.mount('#app')
