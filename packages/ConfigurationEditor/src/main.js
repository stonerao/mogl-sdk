/**
 * 应用入口文件
 * 
 * @description 初始化 Vue 应用，注册插件和全局组件
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// 创建 Vue 应用实例
const app = createApp(App);

// 创建 Pinia 实例
const pinia = createPinia();

// 注册 Pinia
app.use(pinia);

// 挂载应用
app.mount('#app');

console.log('🚀 工业组态编辑器启动成功！');

