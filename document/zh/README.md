# W3D SDK 中文文档

欢迎使用 W3D SDK！这里是完整的中文文档索引。

## 📚 文档导航

### 入门指南

- **[SDK 使用指南](./sdk-guide.md)**
    - SDK 简介和主要功能
    - 安装和初始化说明
    - 快速开始示例
    - 核心概念讲解
    - 配置选项说明
    - 最佳实践

### API 文档

- **[API 参考文档](./api-reference.md)**
    - 完整的 API 文档
    - 所有类、方法、参数说明
    - 详细的使用示例
    - 返回值说明

### 开发指南

- **[组件开发指南](./component-guide.md)**
    - 组件系统概述
    - 组件生命周期
    - 组件配置管理
    - 事件处理
    - 资源加载
    - 动画实现
    - 完整示例

- **[模型加载指南](./model-loading-guide.md)**
    - 支持的模型格式（GLTF/GLB/FBX）
    - 基础加载方法
    - 加载进度监听
    - 模型配置选项
    - 动画播放
    - 错误处理
    - 性能优化

### 实用工具

- **[快速参考](./quick-reference.md)**
    - 常用 API 速查
    - 代码片段
    - 快速查找

- **[常见问题](./faq.md)**
    - 安装和配置问题
    - 场景和渲染问题
    - 模型加载问题
    - 交互和事件问题
    - 动画问题
    - 性能优化
    - 调试技巧

## 🚀 快速开始

### 1. 安装

```bash
pnpm add @w3d/core three
```

### 2. 创建场景

```javascript
import { Scene } from '@w3d/core';

const scene = new Scene('#app');
scene.init();
```

### 3. 添加灯光

```javascript
scene.light.addAmbient({ color: '#ffffff', intensity: 0.8 });
scene.light.addDirectional({
    color: '#ffffff',
    intensity: 1.0,
    position: [100, 100, 100]
});
```

### 4. 加载模型

```javascript
const model = await scene.add('ModelLoader', {
    url: '/models/model.glb',
    scale: 2
});
```

## 📖 学习路径

### 初学者

1. 阅读 [SDK 使用指南](./sdk-guide.md) 了解基础概念
2. 跟随快速开始示例创建第一个场景
3. 查看 [快速参考](./quick-reference.md) 学习常用 API
4. 遇到问题查看 [常见问题](./faq.md)

### 进阶开发者

1. 深入学习 [组件开发指南](./component-guide.md)
2. 查阅 [API 参考文档](./api-reference.md) 了解详细 API
3. 研究示例代码（`packages/examples` 目录）
4. 参与贡献和社区讨论

## 🎯 核心功能

### Scene（场景管理）

场景是整个 SDK 的入口，负责：

- 场景创建和初始化
- 渲染循环控制
- 组件生命周期管理
- 资源管理

[查看详细文档 →](./sdk-guide.md#scene场景)

### Component（组件系统）

组件化架构，所有 3D 对象都是组件：

- 统一的生命周期
- 灵活的配置机制
- 完善的事件系统
- 易于扩展

[查看详细文档 →](./component-guide.md)

### EventSystem（事件系统）

完善的交互能力：

- 鼠标事件（点击、移动、进入、离开等）
- 触摸事件支持
- 射线拾取
- 自定义事件

[查看详细文档 →](./sdk-guide.md#eventsystem事件系统)

### ResourceManager（资源管理）

智能的资源管理：

- 资源加载和缓存
- 加载进度跟踪
- 资源释放管理
- 错误处理

[查看详细文档 →](./sdk-guide.md#resourcemanager资源管理)

### AnimationManager（动画系统）

强大的动画功能：

- GLTF 模型动画支持
- 补间动画
- 动画混合器
- 动画控制

[查看详细文档 →](./sdk-guide.md#animationmanager动画管理)

## 💡 示例代码

### 基础场景

```javascript
import { Scene } from '@w3d/core';

const scene = new Scene('#app', {
    camera: { position: [0, 100, 200] }
});

scene.light.addAmbient({ intensity: 0.8 });
scene.light.addDirectional({
    position: [100, 100, 100],
    castShadow: true
});

scene.init();
```

### 加载和交互

```javascript
const model = await scene.add('ModelLoader', {
    name: 'robot',
    url: '/models/robot.glb'
});

model.on('click', (event) => {
    console.log('模型被点击');
});

model.on('mouseenter', (event) => {
    event.object.material.emissive.set('#ffff00');
});
```

### 动画效果

```javascript
import { Tween } from '@w3d/core';

Tween.to(model.position, { y: 10 }, 2000, {
    easing: 'easeInOutQuad',
    onComplete: () => {
        console.log('动画完成');
    }
});
```

### 自定义组件

```javascript
import { Component } from '@w3d/core';
import * as THREE from 'three';

class MyBox extends Component {
    static defaultConfig = {
        color: '#00ff00',
        size: 1
    };

    onCreate() {
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
        this.mesh.rotation.y += delta;
    }

    getInteractiveObjects() {
        return [this.mesh];
    }
}

scene.registerComponent('MyBox', MyBox);
const box = await scene.add('MyBox', { color: '#ff0000' });
```

## 🔗 相关资源

### 官方资源

- [项目主页](../../README.md)
- [GitHub 仓库](https://github.com/yourusername/w3d-sdk)
- [示例代码](../../packages/examples)

### 外部资源

- [Three.js 官网](https://threejs.org/)
- [Three.js 文档](https://threejs.org/docs/)
- [WebGL 规范](https://www.khronos.org/webgl/)

## 📝 文档贡献

发现文档问题或有改进建议？欢迎：

1. 提交 [Issue](https://github.com/yourusername/w3d-sdk/issues)
2. 提交 Pull Request
3. 联系我们：674656681@qq.com

## 📄 许可证

本文档采用 [MIT](../../LICENSE) 许可证。

## 🙏 致谢

感谢所有为文档做出贡献的开发者！

---

<div align="center">

**开始使用 W3D SDK，创建令人惊叹的 3D Web 应用！**

[返回主页](../../README.md) | [查看示例](../../packages/examples)

</div>
