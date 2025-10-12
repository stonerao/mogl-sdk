# W3D SDK 使用指南

## 简介

W3D SDK 是一个基于 Three.js 的新一代 WebGL 3D 渲染引擎，提供了简洁易用的 API 和强大的功能，帮助开发者快速构建高性能的 3D Web 应用。

### 主要特性

- 🚀 **简洁易用** - 链式调用 API，快速上手
- 🎨 **组件化架构** - 灵活的组件系统，易于扩展
- 🎯 **事件驱动** - 完善的事件系统，支持交互操作
- 📦 **资源管理** - 智能的资源加载和缓存机制
- 🎬 **动画系统** - 内置动画管理器和补间动画
- ⚡ **高性能** - 优化的渲染流程，流畅的 60fps
- 🔧 **TypeScript 友好** - 完整的类型定义（规划中）

### 核心模块

W3D SDK 由以下核心模块组成：

- **@w3d/core** - 核心渲染引擎
- **@w3d/utils** - 工具函数库
- **@w3d/components** - 组件库（规划中）

## 安装

### 使用 npm

```bash
npm install @w3d/core three
```

### 使用 pnpm

```bash
pnpm add @w3d/core three
```

### 使用 yarn

```bash
yarn add @w3d/core three
```

### 依赖要求

- **Node.js**: >= 16.0.0
- **Three.js**: ^0.180.0

## 快速开始

### 基础示例

创建一个简单的 3D 场景：

```javascript
import { Scene } from '@w3d/core';

// 创建场景
const scene = new Scene('#app', {
    renderer: {
        antialias: true,
        alpha: false
    },
    camera: {
        position: [0, 100, 200],
        fov: 45
    }
});

// 初始化场景
scene.init();
```

### 添加灯光

```javascript
// 添加环境光
scene.light.addAmbient({
    color: '#ffffff',
    intensity: 0.8
});

// 添加平行光
scene.light.addDirectional({
    color: '#ffffff',
    intensity: 1.0,
    position: [100, 100, 100],
    castShadow: true
});
```

### 加载 3D 模型

```javascript
// 注册模型加载器组件
import { ModelLoader } from '@w3d/core';

scene.registerComponent('ModelLoader', ModelLoader);

// 加载 GLTF/GLB 模型
const model = await scene.add('ModelLoader', {
    name: 'robot',
    url: '/models/robot.glb',
    scale: 2,
    position: [0, 0, 0]
});

// 加载 FBX 模型（自动检测格式）
const fbxModel = await scene.add('ModelLoader', {
    name: 'character',
    url: '/models/character.fbx',
    scale: 1
});

// 监听模型点击事件
model.on('click', (event) => {
    console.log('模型被点击了', event.object);
});
```

### 添加交互

```javascript
// 启用轨道控制器
scene.controls.enableAutoRotate(true, 2.0);

// 监听全局事件
scene.eventSystem.on('click', (event) => {
    console.log('点击位置:', event.point);
});
```

### 动画效果

```javascript
import { Tween } from '@w3d/core';

// 创建补间动画
Tween.to(model.position, { y: 10 }, 2000, {
    easing: 'easeInOutQuad',
    onUpdate: (target, progress) => {
        console.log('动画进度:', progress);
    },
    onComplete: () => {
        console.log('动画完成');
    }
});
```

## 核心概念

### Scene（场景）

Scene 是整个 SDK 的入口类，负责场景的创建、初始化和管理。

**主要功能：**

- 场景初始化和配置
- 组件管理
- 渲染循环控制
- 资源管理

**生命周期：**

1. 创建场景实例
2. 配置场景参数
3. 调用 `init()` 初始化
4. 自动启动渲染循环
5. 调用 `dispose()` 销毁场景

### Component（组件）

组件是 W3D SDK 的核心概念，所有 3D 对象都是组件。

**组件生命周期：**

- `onCreate()` - 组件创建后
- `onBeforeMount()` - 组件挂载前
- `onMounted()` - 组件挂载完成
- `onUpdate(delta)` - 每帧更新
- `onBeforeDispose()` - 组件销毁前
- `onDispose()` - 组件销毁

**自定义组件：**

```javascript
import { Component } from '@w3d/core';
import * as THREE from 'three';

class MyComponent extends Component {
    static defaultConfig = {
        color: '#00ff00',
        size: 1
    };

    onCreate() {
        // 创建几何体
        const geometry = new THREE.BoxGeometry(
            this.config.size,
            this.config.size,
            this.config.size
        );
        const material = new THREE.MeshStandardMaterial({
            color: this.config.color
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.add(this.mesh);
    }

    onUpdate(delta) {
        // 每帧旋转
        this.mesh.rotation.y += delta;
    }

    onDispose() {
        // 清理资源
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

// 注册组件
scene.registerComponent('MyComponent', MyComponent);

// 使用组件
const myObj = await scene.add('MyComponent', {
    name: 'box1',
    color: '#ff0000',
    size: 2
});
```

### EventSystem（事件系统）

事件系统提供了完善的交互能力。

**支持的事件类型：**

- `click` - 点击事件
- `dblclick` - 双击事件
- `mousedown` - 鼠标按下
- `mouseup` - 鼠标抬起
- `mousemove` - 鼠标移动
- `mouseenter` - 鼠标进入
- `mouseleave` - 鼠标离开

**事件监听：**

```javascript
// 组件级别事件
component.on('click', (event) => {
    console.log('对象:', event.object);
    console.log('点击位置:', event.point);
});

// 全局事件
scene.eventSystem.on('click', (event) => {
    console.log('全局点击事件');
});
```

### ResourceManager（资源管理）

资源管理器负责资源的加载、缓存和管理。

**资源加载：**

```javascript
// 监听加载进度
scene.resourceManager.on('resource:load:progress', (event) => {
    console.log('加载进度:', event.progress);
});

// 监听加载完成
scene.resourceManager.on('resource:load:complete', (event) => {
    console.log('资源加载完成:', event.url);
});

// 获取加载统计
const stats = scene.resourceManager.getStats();
console.log('加载进度:', stats.progress);
console.log('已加载:', stats.loaded);
console.log('总数:', stats.total);
```

### AnimationManager（动画管理）

动画管理器支持 GLTF 模型动画和自定义动画。

**播放模型动画：**

```javascript
// 加载带动画的模型
const gltf = await scene.resourceManager.load(
    '/models/animated.glb',
    'model',
    (url, onProgress) => {
        const loader = new ModelLoader();
        return loader.load(url, onProgress);
    }
);

// 播放动画
const action = scene.animationManager.play(gltf.scene, gltf.animations[0], {
    loop: THREE.LoopRepeat,
    timeScale: 1.0
});
```

## 配置选项

### 场景配置

```javascript
const scene = new Scene('#app', {
    // 渲染器配置
    renderer: {
        antialias: true, // 抗锯齿
        alpha: false, // 透明背景
        powerPreference: 'high-performance' // 性能模式
    },

    // 相机配置
    camera: {
        fov: 45, // 视野角度
        near: 0.1, // 近裁剪面
        far: 10000, // 远裁剪面
        position: [0, 100, 200], // 相机位置
        lookAt: [0, 0, 0] // 观察点
    },

    // 控制器配置
    controls: {
        enableDamping: true, // 启用阻尼
        dampingFactor: 0.05, // 阻尼系数
        enableZoom: true, // 启用缩放
        enableRotate: true, // 启用旋转
        enablePan: true, // 启用平移
        autoRotate: false, // 自动旋转
        autoRotateSpeed: 2.0, // 旋转速度
        minDistance: 1, // 最小距离
        maxDistance: 1000 // 最大距离
    }
});
```

## 最佳实践

### 性能优化

1. **合理使用组件**
    - 避免创建过多组件
    - 及时销毁不需要的组件

2. **资源管理**
    - 使用资源缓存
    - 及时释放不需要的资源

3. **渲染优化**
    - 使用 LOD（细节层次）
    - 合理设置相机裁剪面

### 内存管理

```javascript
// 销毁组件
scene.remove('componentName');

// 清理资源缓存
scene.resourceManager.clear();

// 销毁整个场景
scene.dispose();
```

### 错误处理

```javascript
try {
    const model = await scene.add('ModelLoader', {
        url: '/models/model.glb'
    });
} catch (error) {
    console.error('模型加载失败:', error);
}
```

## 下一步

- 查看 [API 参考文档](./api-reference.md) 了解详细的 API 说明
- 查看 [组件开发指南](./component-guide.md) 学习如何开发自定义组件
- 查看 [示例代码](../../packages/examples) 获取更多示例
