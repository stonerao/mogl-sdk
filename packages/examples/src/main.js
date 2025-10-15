/**
 * Mogl SDK Examples - Vue 3 版本
 * 主入口文件
 */

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import i18n from './locales';
import './styles/main.css';

console.log('🚀 Mogl SDK Examples - Vue 3');
console.log('欢迎使用 Mogl SDK 示例展示系统！');

const app = createApp(App);

app.use(router);
app.use(i18n);

app.mount('#app');

// 导出实例供调试使用
if (import.meta.env.DEV) {
    window.__app = app;
    window.__router = router;
}
