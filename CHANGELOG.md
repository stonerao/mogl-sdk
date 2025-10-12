# 更新日志

本文档记录了 W3D SDK 的所有重要更改。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### ✨ 新增

- **ModelLoader 支持 FBX 格式**
    - 新增 FBX 模型加载支持
    - 自动检测模型格式（.gltf, .glb, .fbx）
    - 统一的加载接口和返回格式
    - 保持向后兼容性

### 📚 文档

- 新增《模型加载指南》文档
- 更新 SDK 使用指南中的模型加载示例
- 更新 FAQ 中关于支持格式的说明
- 更新快速参考中的模型加载代码

---

## [2.0.0] - 2025-10-12

### 🎉 重大更新

这是 W3D SDK 的全新 2.0 版本，采用全新的架构设计。

### ✨ 新增功能

#### 核心功能

- **Scene（场景管理）**
    - 全新的场景管理系统
    - 支持链式调用 API
    - 自动渲染循环管理
    - 完善的生命周期管理

- **Component（组件系统）**
    - 组件化架构设计
    - 统一的组件生命周期
    - 灵活的配置机制
    - 组件注册和管理系统

- **EventSystem（事件系统）**
    - 完善的鼠标事件支持（点击、移动、进入、离开等）
    - 射线拾取功能
    - 自定义事件支持
    - 全局和组件级别事件

- **ResourceManager（资源管理）**
    - 智能资源加载和缓存
    - 加载进度跟踪
    - 资源释放管理
    - 错误处理机制

- **AnimationManager（动画系统）**
    - GLTF 模型动画支持
    - 补间动画（Tween）
    - 动画混合器
    - 多种缓动函数

#### 渲染功能

- **Renderer（渲染器）**
    - WebGL 渲染器封装
    - 阴影支持
    - 自动调整大小
    - 性能优化

- **Camera（相机）**
    - 透视相机支持
    - 相机位置和朝向控制
    - 自动适配屏幕尺寸

- **Controls（控制器）**
    - 轨道控制器（OrbitControls）
    - 自动旋转功能
    - 阻尼效果
    - 缩放、旋转、平移控制

- **Light（灯光）**
    - 环境光（AmbientLight）
    - 平行光（DirectionalLight）
    - 点光源（PointLight）
    - 聚光灯（SpotLight）
    - 阴影配置

#### 资源加载

- **ModelLoader（模型加载器）**
    - GLTF/GLB 格式支持
    - Draco 压缩支持
    - 加载进度回调

- **TextureLoader（纹理加载器）**
    - 纹理加载
    - 批量加载支持
    - 进度跟踪

- **CacheManager（缓存管理器）**
    - LRU 缓存策略
    - 缓存大小限制
    - 缓存统计

#### 工具库（@w3d/utils）

- **事件工具**
    - EventEmitter - 事件发射器
    - EventBus - 事件总线

- **数学工具**
    - MathUtils - 数学工具函数
    - Vector - 向量运算
    - Transform - 变换工具

- **几何工具**
    - GeometryUtils - 几何工具
    - PathUtils - 路径工具

- **颜色工具**
    - ColorUtils - 颜色处理工具

- **性能工具**
    - Performance - 性能监控
    - Stats - 统计信息

- **日志工具**
    - Logger - 日志记录器
    - LogLevel - 日志级别

- **缓存工具**
    - MemoryCache - 内存缓存
    - IndexedDBCache - IndexedDB 缓存

### 📚 文档

- 完整的中文文档
    - SDK 使用指南
    - API 参考文档
    - 组件开发指南
    - 快速参考
    - 常见问题（FAQ）

- 项目文档
    - README.md
    - 更新日志
    - 贡献指南

### 🛠️ 开发工具

- **构建系统**
    - Vite 构建工具
    - ES Module 支持
    - 开发模式热更新

- **测试框架**
    - Vitest 单元测试
    - 测试覆盖率报告
    - 测试 UI

- **代码质量**
    - ESLint 代码检查
    - Prettier 代码格式化
    - 统一的代码规范

- **Monorepo 管理**
    - pnpm workspace
    - Lerna 包管理
    - Changesets 版本管理

### 🎨 示例项目

- 基础场景示例
- 模型加载示例
- 交互示例
- 动画示例
- 自定义组件示例

### ⚡ 性能优化

- 优化的渲染循环
- 资源缓存机制
- 组件生命周期优化
- 事件系统优化

### 📦 依赖更新

- Three.js: ^0.180.0
- Vite: ^5.1.4
- Vitest: ^1.3.1
- ESLint: ^8.57.0

### 🙏 致谢

感谢所有为 W3D SDK 2.0 做出贡献的开发者！

---

## [未来计划]

### 即将推出

- **组件库（@w3d/components）**
    - 常用 3D 组件
    - UI 组件
    - 特效组件

- **TypeScript 支持**
    - 完整的类型定义
    - 更好的开发体验

- **更多示例**
    - 高级示例
    - 实战案例
    - 最佳实践

### 长期规划

- **插件系统** - 插件架构和第三方插件支持
- **物理引擎集成** - 物理模拟和碰撞检测
- **VR/AR 支持** - WebXR 集成
- **多平台支持** - 小程序和移动端优化

---

## 版本说明

### 版本号规则

W3D SDK 遵循语义化版本规范：

- **主版本号（Major）**：不兼容的 API 修改
- **次版本号（Minor）**：向下兼容的功能性新增
- **修订号（Patch）**：向下兼容的问题修正

### 发布周期

- **主版本**：根据需要发布
- **次版本**：每 2-3 个月
- **修订版本**：根据需要发布

---

<div align="center">

**感谢使用 W3D SDK！**

[返回主页](./README.md) | [查看文档](./document/zh/README.md)

</div>
