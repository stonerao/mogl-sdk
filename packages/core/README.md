# @w3d/core

> W3D WebGL 3D 渲染引擎核心包

## 📦 安装

```bash
# 使用 npm
npm install @w3d/core three

# 使用 pnpm
pnpm add @w3d/core three

# 使用 yarn
yarn add @w3d/core three
```

## 🚀 快速开始

```javascript
import { Scene } from '@w3d/core';

// 创建场景
const scene = new Scene('#app')
    .camera({ position: [0, 100, 200] })
    .light('ambient', { color: '#fff', intensity: 0.8 })
    .light('directional', {
        color: '#fff',
        intensity: 1.0,
        position: [100, 100, 100]
    })
    .enableShadow()
    .enableResize()
    .init();

// 加载模型
const model = await scene.add('ModelLoader', {
    name: 'robot',
    url: '/models/robot.glb',
    scale: 2
});

// 监听事件
model.on('click', (event) => {
    console.log('点击了模型', event.object);
});
```

## 📚 核心模块

### Scene - 场景管理
场景的创建、初始化和管理

### Renderer - 渲染器
WebGL 渲染器的封装和管理

### Camera - 相机管理
相机的创建和控制

### Controls - 控制器
轨道控制器等交互控制

### Light - 灯光管理
各种灯光的创建和管理

### Component - 组件系统
组件基类和生命周期管理

### EventSystem - 事件系统
事件分发和射线拾取

### ResourceManager - 资源管理
资源加载、缓存和管理

### AnimationManager - 动画系统
动画的创建和管理

## 📖 文档

详细文档请查看 [API 文档](../../docs/api-design.md)

## 📄 许可证

MIT License

