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

## ✨ 新功能：IndexedDB 缓存

W3D SDK 现在支持 IndexedDB 持久化缓存，可以显著减少模型和纹理的重复加载时间！

```javascript
const scene = new Scene('#app', {
    indexedDB: {
        enabled: true,           // 启用 IndexedDB 缓存
        dbName: 'W3DCache',      // 数据库名称
        storeName: 'resources',  // 对象存储名称
        debug: true,             // 启用调试日志
        version: 1               // 缓存版本号
    }
});

await scene.init();

// 首次加载：从网络加载并缓存
const model1 = await scene.add('ModelLoader', {
    url: '/models/robot.glb'
});

// 再次加载：从 IndexedDB 缓存读取，速度更快！
const model2 = await scene.add('ModelLoader', {
    url: '/models/robot.glb'
});
```

**特性：**
- ✅ 自动缓存模型和纹理
- ✅ 版本管理：版本号变化时自动清空缓存
- ✅ 调试模式：详细的日志输出
- ✅ 透明集成：无需修改现有代码

详细文档：[IndexedDB 缓存指南](./docs/IndexedDB-Cache.md)

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

### IndexedDBCache - IndexedDB 缓存
持久化缓存模型和纹理资源

### AnimationManager - 动画系统
动画的创建和管理

## 📖 文档

- [API 文档](../../docs/api-design.md)
- [IndexedDB 缓存指南](./docs/IndexedDB-Cache.md)

## 📄 许可证

MIT License

