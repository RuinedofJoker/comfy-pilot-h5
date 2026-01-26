import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'

// 导入 Vant 组件库
import Vant from 'vant'
import 'vant/lib/index.css'

// 导入全局样式
import './styles/index.css'
import './styles/main.scss'

// 导入markdown样式
import './styles/jetbrains-dark.css'

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(Vant)

app.mount('#app')
