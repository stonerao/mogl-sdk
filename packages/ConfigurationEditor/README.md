# 工业组态编辑器 (Configuration Editor)

> 基于 W3D SDK 的可视化工业组态编辑器

## 📋 项目简介

工业组态编辑器是一个基于 Web 的可视化编辑器，用于快速构建工业监控界面、物联网数据可视化面板和交互式控制系统。

### 核心特性

- 🎨 **可视化编辑**: 拖拽式节点放置，所见即所得
- 📊 **丰富组件**: 内置多种图表、仪表盘、控件组件
- 🔗 **数据绑定**: 支持 HTTP、WebSocket、MQTT 多种数据源
- ⚡ **事件联动**: 灵活的事件触发和动作响应机制
- 💾 **模板系统**: 支持保存和加载组态模板
- 🌙 **深色主题**: 专业的深色界面设计

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
pnpm build
```

## 🏗️ 项目结构

```
ConfigurationEditor/
├── src/
│   ├── assets/           # 静态资源
│   ├── components/       # 组件
│   │   ├── common/       # 通用组件
│   │   ├── layout/       # 布局组件
│   │   └── editor/       # 编辑器组件
│   ├── core/             # 核心功能
│   │   ├── canvas/       # 画布管理
│   │   ├── nodes/        # 节点系统
│   │   ├── datasource/   # 数据源管理
│   │   ├── events/       # 事件系统
│   │   └── template/     # 模板系统
│   ├── store/            # 状态管理
│   ├── utils/            # 工具函数
│   ├── config/           # 配置文件
│   └── locales/          # 国际化
├── public/               # 公共资源
├── index.html            # HTML 入口
├── vite.config.js        # Vite 配置
└── package.json          # 项目配置
```

## 🎯 技术栈

- **框架**: Vue 3 + Vite
- **3D 引擎**: @w3d/core (基于 Three.js)
- **状态管理**: Pinia
- **UI 组件**: Element Plus
- **数据通信**: Axios, Socket.io, MQTT.js

## 📖 开发文档

详细的开发任务和架构设计请参考 [todolist.md](../todolist.md)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**开发团队**: W3D Team  
**版本**: v1.0.0  
**最后更新**: 2025-10-30

