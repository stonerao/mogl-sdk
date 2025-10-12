/**
 * W3D SDK Examples - Vue 3 版本
 * 主入口文件
 */

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/main.css';

console.log('🚀 W3D SDK Examples - Vue 3');
console.log('欢迎使用 W3D SDK 示例展示系统！');

const app = createApp(App);

app.use(router);

app.mount('#app');

// 导出实例供调试使用
if (import.meta.env.DEV) {
    window.__app = app;
    window.__router = router;
}
