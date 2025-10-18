# W3D SDK v2.0

<div align="center">

**新一代 WebGL 3D 渲染引擎**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org)
[![Three.js](https://img.shields.io/badge/three.js-0.180.0-orange.svg)](https://threejs.org)

[English](./README.md) | 简体中文

</div>

## 📖 项目简介

W3D SDK 是一个基于 Three.js 的新一代 WebGL 3D 渲染引擎，提供了简洁易用的 API 和强大的功能，帮助开发者快速构建高性能的 3D Web 应用。

### ✨ 主要特性

- 🚀 **简洁易用** - 链式调用 API，快速上手，5 分钟即可创建第一个 3D 场景
- 🎨 **组件化架构** - 灵活的组件系统，易于扩展和复用
- 🎯 **事件驱动** - 完善的事件系统，支持丰富的交互操作
- 📦 **资源管理** - 智能的资源加载和缓存机制，优化性能
- 🎬 **动画系统** - 内置动画管理器和补间动画，轻松实现复杂动画效果
- 🔧 **开发友好** - 完整的中文文档，丰富的示例代码
- 📱 **响应式设计** - 自动适配不同屏幕尺寸

### 🎯 适用场景

- 产品展示和 3D 可视化
- 数字孪生和智慧城市
- 在线 3D 编辑器
- 游戏和互动体验
- 建筑和室内设计可视化
- 教育和培训应用

## 📦 项目结构

```
sdk/
├── packages/                 # 包目录
│   ├── core/                # 核心渲染引擎
│   │   ├── src/
│   │   │   ├── core/       # 核心模块（Scene, Renderer, Camera 等）
│   │   │   ├── component/  # 组件系统
│   │   │   ├── event/      # 事件系统
│   │   │   ├── resource/   # 资源管理
│   │   │   ├── animation/  # 动画系统
│   │   │   └── config/     # 配置文件
│   │   └── package.json
│   ├── utils/              # 工具函数库
│   │   ├── src/
│   │   │   ├── event/      # 事件工具
│   │   │   ├── math/       # 数学工具
│   │   │   ├── geometry/   # 几何工具
│   │   │   ├── color/      # 颜色工具
│   │   │   ├── loader/     # 加载工具
│   │   │   ├── cache/      # 缓存工具
│   │   │   └── performance/# 性能工具
│   │   └── package.json
│   ├── components/         # 组件库（规划中）
│   └── examples/           # 示例项目
├── document/               # 文档目录
│   └── zh/                # 中文文档
│       ├── sdk-guide.md   # SDK 使用指南
│       ├── api-reference.md # API 参考文档
│       └── component-guide.md # 组件开发指南
├── docs/                   # 开发文档
├── scripts/                # 构建脚本
├── package.json           # 根配置文件
├── pnpm-workspace.yaml    # pnpm 工作区配置
└── README.md              # 项目说明文件
```

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 16.0.0
- **pnpm**: >= 8.0.0（推荐）或 npm/yarn

### 安装

#### 1. 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

#### 2. 在项目中使用

```bash
# 安装 SDK
pnpm add @w3d/core three

# 或
npm install @w3d/core three
```

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

// 添加灯光
scene.light.addAmbient({
    color: '#ffffff',
    intensity: 0.8
});

scene.light.addDirectional({
    color: '#ffffff',
    intensity: 1.0,
    position: [100, 100, 100],
    castShadow: true
});

// 初始化场景
scene.init();
```

### 加载 3D 模型

```javascript
import { Scene, ModelLoader } from '@w3d/core';

const scene = new Scene('#app');

// 注册模型加载器组件
scene.registerComponent('ModelLoader', ModelLoader);

// 初始化场景
scene.init();

// 加载模型
const model = await scene.add('ModelLoader', {
    name: 'robot',
    url: '/models/robot.glb',
    scale: 2,
    position: [0, 0, 0]
});

// 监听模型点击事件
model.on('click', (event) => {
    console.log('模型被点击了', event.object);
});
```

### 添加动画

```javascript
import { Tween } from '@w3d/core';

// 创建补间动画
Tween.to(model.position, { y: 10 }, 2000, {
    easing: 'easeInOutQuad',
    onComplete: () => {
        console.log('动画完成');
    }
});
```

## 🛠️ 开发

### 开发模式

```bash
# 启动所有包的开发模式
pnpm dev

# 启动特定包的开发模式
pnpm dev:core        # 核心包
pnpm dev:utils       # 工具包
pnpm dev:examples    # 示例项目
```

### 构建

```bash
# 构建所有包
pnpm build

# 构建特定包
pnpm build:core      # 核心包
pnpm build:utils     # 工具包
```

### 测试

```bash
# 运行测试
pnpm test

# 监听模式
pnpm test:watch

# 测试覆盖率
pnpm test:coverage

# 测试 UI
pnpm test:ui
```

### 代码规范

```bash
# 代码检查
pnpm lint

# 自动修复
pnpm lint:fix

# 代码格式化
pnpm format

# 检查格式
pnpm format:check
```

## 📚 技术栈

### 核心依赖

- **Three.js** (^0.180.0) - 3D 图形库
- **Vite** (^5.1.4) - 构建工具
- **pnpm** (>=8.0.0) - 包管理器

### 开发工具

- **Vitest** - 单元测试框架
- **ESLint** - 代码检查工具
- **Prettier** - 代码格式化工具
- **Lerna** - Monorepo 管理工具
- **Changesets** - 版本管理和发布工具

### 架构特点

- **Monorepo 架构** - 使用 pnpm workspace 管理多包项目
- **ES Module** - 使用现代 JavaScript 模块系统
- **组件化设计** - 基于组件的可扩展架构
- **事件驱动** - 完善的事件系统支持

## 📖 文档

### 中文文档

- [SDK 使用指南](./document/zh/sdk-guide.md) - 详细的使用说明和示例
- [API 参考文档](./document/zh/api-reference.md) - 完整的 API 文档
- [组件开发指南](./document/zh/component-guide.md) - 如何开发自定义组件

### 开发文档

- [架构设计](./docs/architecture.md) - 系统架构说明
- [API 设计](./docs/api-design.md) - API 设计文档
- [组件系统](./docs/component-system.md) - 组件系统设计
- [事件系统](./docs/event-system.md) - 事件系统设计
- [构建配置](./docs/build-config.md) - 构建配置说明

## 🎯 核心功能

### Scene（场景管理）

- 场景创建和初始化
- 渲染循环控制
- 组件生命周期管理
- 资源管理

### Component（组件系统）

- 组件基类和生命周期
- 组件注册和管理
- 事件系统集成
- 配置管理

### EventSystem（事件系统）

- 鼠标事件（点击、移动、进入、离开等）
- 触摸事件支持
- 射线拾取
- 自定义事件

### ResourceManager（资源管理）

- 资源加载和缓存
- 加载进度跟踪
- 资源释放管理
- 错误处理

### AnimationManager（动画系统）

- GLTF 模型动画支持
- 补间动画
- 动画混合器
- 动画控制

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 开发规范

- 遵循项目的代码风格
- 编写清晰的提交信息
- 添加必要的测试
- 更新相关文档

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 👥 团队

W3D Team

## 🔗 相关链接

- [Three.js 官网](https://threejs.org/)
- [Three.js 文档](https://threejs.org/docs/)
- [WebGL 规范](https://www.khronos.org/webgl/)

## 📮 联系我们

如有问题或建议，请通过以下方式联系我们：

- 提交 [Issue](https://github.com/yourusername/w3d-sdk/issues)
- 发送邮件至：674656681@qq.com

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

---

<div align="center">

**[⬆ 回到顶部](#w3d-sdk-v20)**

Made with ❤️ by W3D Team

</div>
