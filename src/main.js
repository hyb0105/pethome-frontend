import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 导入 Element Plus 的库和样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 【【【 修改这里 】】】
// 导入 Quill 编辑器需要的核心样式和 "Snow" 主题样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
// (不再需要 'vue-quill-editor/dist/vue-quill-editor.css')

import './style.css' // 您原有的全局样式可以保留

const app = createApp(App)

app.use(router)
app.use(ElementPlus) // 让Vue应用使用 Element Plus

app.mount('#app')