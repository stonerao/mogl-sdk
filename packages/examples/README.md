# W3D SDK Examples

W3D SDK 示例展示系统 - 使用 Vue 3 + Vite 构建的代码与效果分屏展示平台。

## 📋 功能特性

### ✨ 核心功能

- **代码与效果分屏展示**：左侧显示源代码，右侧实时渲染 3D 效果
- **可调整布局**：支持拖动分隔条调整左右区域大小（30%-70%）
- **响应式设计**：移动端自动切换为上下布局
- **代码高亮**：使用 Prism.js 提供语法高亮和行号显示
- **一键复制**：支持快速复制示例代码
- **Vue 3 架构**：使用 Composition API 和 Vue Router

### 🎯 示例列表

1. **01 - Hello World** - 基础场景创建和初始化
2. **02 - Camera Controls** - 相机控制和交互
3. **03 - Lighting** - 灯光系统和阴影
4. **04 - Model Loader** - GLTF/GLB 模型加载
5. **05 - Animations** - 路径动画和模型动画
6. **06 - Particle System** - 粒子系统和特效

## 🚀 快速开始

### 安装依赖

```bash
# 在 SDK 根目录
cd sdk
pnpm install
```

### 启动开发服务器

```bash
# 方式 1: 从 SDK 根目录启动
cd sdk
pnpm --filter @w3d/examples dev

# 方式 2: 直接在 examples 目录启动
cd sdk/packages/examples
pnpm dev
```

### 访问应用

开发服务器启动后，访问：http://localhost:8080/

## 📁 项目结构

```
packages/examples/
├── src/
│   ├── main.js                 # 主入口文件
│   ├── App.vue                 # 根组件
│   ├── router/
│   │   └── index.js            # 路由配置
│   ├── views/
│   │   ├── HomePage.vue        # 首页
│   │   ├── NotFound.vue        # 404 页面
│   │   └── examples/           # 示例页面
│   │       ├── HelloWorld.vue
│   │       ├── CameraControls.vue
│   │       ├── Lighting.vue
│   │       ├── ModelLoader.vue
│   │       ├── Animations.vue
│   │       └── ParticleSystem.vue
│   ├── components/
│   │   ├── SplitLayout.vue     # 分屏布局组件
│   │   ├── CodePanel.vue       # 代码面板组件
│   │   └── ScenePanel.vue      # 场景面板组件
│   └── styles/
│       └── main.css            # 全局样式
├── index.html                  # HTML 入口
├── vite.config.js              # Vite 配置
├── package.json                # 依赖配置
└── README.md                   # 本文件
```

## 🎨 组件说明

### SplitLayout 组件

分屏布局组件，负责管理代码面板和场景面板的布局。

**Props:**
- `code` (String, required): 要显示的源代码
- `language` (String, default: 'javascript'): 代码语言
- `title` (String, default: 'Example'): 示例标题

**特性:**
- 支持拖动调整左右区域大小
- 响应式布局（移动端自动切换为上下布局）
- 限制调整范围（30%-70%）

**使用示例:**

```vue
<template>
  <SplitLayout 
    :code="sourceCode" 
    language="javascript"
    title="My Example"
  >
    <!-- 3D 场景内容 -->
    <div ref="sceneContainer"></div>
  </SplitLayout>
</template>

<script setup>
import SplitLayout from '@/components/SplitLayout.vue';

const sourceCode = `// Your example code here`;
</script>
```

### CodePanel 组件

代码展示面板，提供代码高亮和复制功能。

**特性:**
- Prism.js 语法高亮
- 行号显示
- 一键复制代码
- 自定义滚动条样式

### ScenePanel 组件

3D 场景展示面板，包含返回首页按钮。

**特性:**
- 固定头部工具栏
- 返回首页快捷按钮
- 全屏场景渲染区域

## 🛠️ 开发指南

### 添加新示例

1. 在 `src/views/examples/` 创建新的 Vue 组件
2. 在 `src/router/index.js` 注册路由
3. 在 `src/views/HomePage.vue` 添加示例卡片

**示例模板:**

```vue
<template>
  <SplitLayout 
    :code="sourceCode" 
    language="javascript"
    title="Your Example Title"
  >
    <div ref="sceneContainer" class="scene-container"></div>
  </SplitLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import SplitLayout from '@/components/SplitLayout.vue';

const sceneContainer = ref(null);
const sourceCode = `// Your example code`;

let scene = null;

onMounted(() => {
  // 初始化场景
  scene = new Scene(sceneContainer.value, {
    // 配置...
  });
  scene.init();
  scene.start();
});

onUnmounted(() => {
  // 清理资源
  if (scene) {
    scene.dispose();
  }
});
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: 100%;
}
</style>
```

### 构建生产版本

```bash
# 构建
pnpm build

# 预览构建结果
pnpm preview
```

## 📊 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Prism.js** - 代码语法高亮
- **Three.js** - 3D 图形库
- **W3D SDK** - 自研 3D 渲染引擎

## 🎯 性能优化

- **懒加载**: 示例组件按需加载
- **代码分割**: 自动分割 Vue、Three.js 和 W3D 代码
- **资源清理**: 每个示例都实现了完整的资源清理
- **响应式**: 自适应不同屏幕尺寸

## 📝 注意事项

1. **资源清理**: 每个示例必须在 `onUnmounted` 中清理 3D 资源
2. **性能**: 保持 60 FPS 渲染性能
3. **代码同步**: 确保展示的代码与实际实现一致
4. **响应式**: 测试移动端布局

## 🔗 相关链接

- [W3D SDK 文档](../core/README.md)
- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Three.js 文档](https://threejs.org/)

## 📄 License

MIT

---

**版本**: 2.0.0  
**更新日期**: 2025-10-09  
**维护者**: W3D Team

