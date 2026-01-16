import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'

// 导入全局样式
import './styles/index.css'
import './styles/main.scss'

const app = createApp(App)

app.use(router)
app.use(pinia)

app.mount('#app')
