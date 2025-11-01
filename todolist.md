# 工业组态编辑器 (ConfigurationEditor) - 项目架构设计与开发任务清单

## 📋 项目概述

**项目名称**: ConfigurationEditor
**技术栈**: Vite + Vue 3 + Three.js (基于 @w3d/core SDK)
**目标用户**: 前端开发者、工业自动化工程师、物联网应用开发者、系统集成商
**应用目标**: 提供一个基于 Web 的可视化组态编辑器，用于快速构建工业监控界面、物联网数据可视化面板和交互式控制系统

---

## 🏗️ 项目架构设计

### 1. 整体架构

```
ConfigurationEditor/
├── src/
│   ├── main.js                    # 应用入口
│   ├── App.vue                    # 根组件
│   ├── assets/                    # 静态资源
│   │   ├── icons/                 # 图标资源
│   │   ├── images/                # 图片资源
│   │   └── styles/                # 全局样式
│   │       ├── variables.css      # CSS 变量（深色主题配色）
│   │       ├── reset.css          # 样式重置
│   │       └── global.css         # 全局样式
│   ├── components/                # 通用组件
│   │   ├── common/                # 基础组件
│   │   │   ├── Button.vue         # 按钮组件
│   │   │   ├── Input.vue          # 输入框组件
│   │   │   ├── Select.vue         # 下拉选择组件
│   │   │   ├── ColorPicker.vue    # 颜色选择器
│   │   │   ├── Slider.vue         # 滑块组件
│   │   │   └── Modal.vue          # 模态框组件
│   │   ├── layout/                # 布局组件
│   │   │   ├── Header.vue         # 顶部工具栏
│   │   │   ├── LeftPanel.vue      # 左侧组件库面板
│   │   │   ├── RightPanel.vue     # 右侧属性配置面板
│   │   │   └── Canvas.vue         # 中间画布区域
│   │   └── editor/                # 编辑器专用组件
│   │       ├── ComponentLibrary.vue    # 组件库列表
│   │       ├── PropertyPanel.vue       # 属性配置面板
│   │       ├── NodeListPanel.vue       # 节点列表面板（新增）
│   │       ├── JsonViewerPanel.vue     # JSON 查看器面板（新增）
│   │       ├── DataSourcePanel.vue     # 数据源配置面板
│   │       ├── EventPanel.vue          # 事件联动配置面板
│   │       └── TemplateManager.vue     # 模板管理器
│   ├── views/                     # 页面视图
│   │   ├── Editor.vue             # 主编辑器页面
│   │   └── Preview.vue            # 预览页面
│   ├── core/                      # 核心功能模块
│   │   ├── canvas/                # 画布管理
│   │   │   ├── CanvasManager.js   # 画布管理器（基于 @w3d/core Scene）
│   │   │   ├── OrthoCameraController.js  # 正交相机控制器
│   │   │   ├── GridHelper.js      # 网格辅助线
│   │   │   ├── SelectionManager.js       # 选择管理器
│   │   │   └── TransformController.js    # 变换控制器（移动/旋转/缩放）
│   │   ├── interaction/           # 交互系统（新增）
│   │   │   └── DragManager.js     # 拖拽管理器
│   │   ├── nodes/                 # 节点系统
│   │   │   ├── BaseNode.js        # 节点基类（继承 Component）
│   │   │   ├── NodeFactory.js     # 节点工厂
│   │   │   ├── NodeProperties.js  # 节点属性系统
│   │   │   └── types/             # 节点类型定义
│   │   │       ├── RectNode.js    # 矩形节点
│   │   │       ├── CircleNode.js  # 圆形节点
│   │   │       ├── TextNode.js    # 文本节点
│   │   │       ├── ImageNode.js   # 图片节点
│   │   │       ├── GroupNode.js   # 组节点（新增）
│   │   │       ├── GaugeNode.js   # 仪表盘节点
│   │   │       ├── ChartNode.js   # 图表节点
│   │   │       └── CustomNode.js  # 自定义节点
│   │   ├── history/               # 历史记录（撤销/重做）（新增）
│   │   │   ├── Command.js         # 命令基类
│   │   │   ├── CommandManager.js  # 命令管理器
│   │   │   ├── CreateNodeCommand.js      # 创建节点命令
│   │   │   ├── DeleteNodeCommand.js      # 删除节点命令
│   │   │   ├── MoveNodeCommand.js        # 移动节点命令
│   │   │   ├── TransformNodeCommand.js   # 变换节点命令
│   │   │   ├── UpdatePropertyCommand.js  # 更新属性命令
│   │   │   ├── GroupCommand.js           # 分组命令（新增）
│   │   │   └── index.js           # 导出入口
│   │   ├── serialization/         # 序列化系统（新增）
│   │   │   └── ProjectSerializer.js      # 工程序列化器
│   │   ├── datasource/            # 数据源管理
│   │   │   ├── DataSourceManager.js      # 数据源管理器
│   │   │   ├── adapters/          # 数据适配器
│   │   │   │   ├── HttpAdapter.js        # HTTP 数据源
│   │   │   │   ├── WebSocketAdapter.js   # WebSocket 数据源
│   │   │   │   └── MQTTAdapter.js        # MQTT 数据源
│   │   │   └── DataParser.js      # 数据解析器
│   │   ├── events/                # 事件系统
│   │   │   ├── EventManager.js    # 事件管理器
│   │   │   ├── EventTypes.js      # 事件类型定义
│   │   │   ├── ActionExecutor.js  # 动作执行器
│   │   │   └── ConditionEvaluator.js     # 条件判断器
│   │   ├── template/              # 模板系统
│   │   │   ├── TemplateManager.js        # 模板管理器
│   │   │   ├── TemplateSerializer.js     # 模板序列化
│   │   │   └── TemplateLoader.js         # 模板加载器
│   │   └── history/               # 历史记录（撤销/重做）
│   │       ├── HistoryManager.js  # 历史管理器
│   │       └── Command.js         # 命令模式基类
│   ├── store/                     # 状态管理（Pinia）
│   │   ├── index.js               # Store 入口
│   │   ├── modules/               # 模块化 Store
│   │   │   ├── editor.js          # 编辑器状态
│   │   │   ├── canvas.js          # 画布状态
│   │   │   ├── nodes.js           # 节点状态
│   │   │   ├── datasource.js      # 数据源状态
│   │   │   ├── events.js          # 事件状态
│   │   │   └── template.js        # 模板状态
│   ├── utils/                     # 工具函数
│   │   ├── geometry.js            # 几何计算工具
│   │   ├── color.js               # 颜色处理工具
│   │   ├── validator.js           # 数据验证工具
│   │   ├── serializer.js          # 序列化工具
│   │   └── i18n.js                # 国际化工具
│   ├── config/                    # 配置文件
│   │   ├── nodeTypes.js           # 节点类型配置
│   │   ├── theme.js               # 主题配置
│   │   └── constants.js           # 常量定义
│   └── locales/                   # 国际化语言包
│       ├── zh-CN.json             # 简体中文
│       └── en-US.json             # 英文
├── public/                        # 公共资源
│   ├── templates/                 # 预设模板
│   └── icons/                     # 图标库
├── index.html                     # HTML 入口
├── vite.config.js                 # Vite 配置
├── package.json                   # 项目配置
└── README.md                      # 项目说明
```

---

## 🎯 技术选型理由

### 1. **核心框架**
- **Vue 3**:
  - 组合式 API 提供更好的逻辑复用和代码组织
  - 响应式系统适合处理复杂的编辑器状态
  - 生态成熟，组件库丰富

- **Vite**:
  - 极速的开发服务器启动和热更新
  - 原生 ES 模块支持
  - 优秀的构建性能

### 2. **3D 渲染引擎**
- **@w3d/core SDK**:
  - 基于 Three.js 的高级封装
  - 提供完善的组件系统和生命周期管理
  - 内置事件系统和资源管理
  - 支持正交相机（OrthographicCamera）适配 2D 组态需求

### 3. **状态管理**
- **Pinia**:
  - Vue 3 官方推荐的状态管理方案
  - TypeScript 支持更好
  - 模块化设计，易于维护

### 4. **UI 组件库**
- **Element Plus** (可选):
  - 成熟的 Vue 3 组件库
  - 提供丰富的表单和交互组件
  - 支持主题定制

### 5. **数据通信**
- **Axios**: HTTP 请求
- **Socket.io-client**: WebSocket 实时通信
- **MQTT.js**: MQTT 协议支持

---

## 📐 核心模块设计

### 1. 画布管理模块 (CanvasManager)

**职责**: 管理 3D 场景、相机、渲染器和交互控制

**关键功能**:
- 初始化正交相机（OrthographicCamera）用于 2D 视图
- 画布缩放和平移控制
- 网格辅助线显示
- 节点选择和高亮
- 拖拽放置节点

**技术实现**:
```javascript
import { Scene, Camera } from '@w3d/core';
import * as THREE from 'three';

class CanvasManager {
  constructor(container) {
    // 创建场景（使用正交相机）
    this.scene = new Scene(container, {
      renderer: { antialias: true, alpha: true },
      camera: {
        type: 'orthographic',  // 正交相机
        position: [0, 0, 100],
        zoom: 1
      },
      controls: {
        enableRotate: false,  // 禁用旋转
        enablePan: true,      // 启用平移
        enableZoom: true      // 启用缩放
      }
    });

    // 初始化场景
    this.scene.init();

    // 添加网格辅助线
    this.addGrid();
  }

  // 添加节点到画布
  addNode(nodeType, position) {
    // 实现节点添加逻辑
  }

  // 选择节点
  selectNode(node) {
    // 实现节点选择逻辑
  }
}
```

### 2. 节点系统 (Node System)

**职责**: 定义和管理各种组态节点类型

**节点基类设计**:
```javascript
import { Component } from '@w3d/core';

class NodeBase extends Component {
  static defaultConfig = {
    position: [0, 0, 0],
    rotation: 0,
    scale: [1, 1, 1],
    color: '#ffffff',
    opacity: 1,
    visible: true,
    // 数据绑定
    dataBinding: null,
    // 事件配置
    events: []
  };

  constructor(scene, config) {
    super(scene, config);
    this.nodeType = 'base';
    this.properties = {};
  }

  // 更新数据绑定
  updateData(data) {
    // 实现数据更新逻辑
  }

  // 序列化节点配置
  serialize() {
    return {
      type: this.nodeType,
      config: this.config,
      properties: this.properties
    };
  }
}
```

### 3. 数据源管理模块 (DataSourceManager)

**职责**: 管理多种数据源的接入和数据流转

**支持的数据源类型**:
- HTTP/HTTPS (RESTful API)
- WebSocket (实时数据推送)
- MQTT (物联网设备数据)

**数据流程**:
```
数据源 → 数据适配器 → 数据解析器 → 节点数据绑定 → 视图更新
```

### 4. 事件联动系统 (EventManager)

**职责**: 管理节点间的事件触发和动作响应

**事件类型**:
- 用户交互事件（点击、双击、悬停）
- 数据变化事件（数据更新、阈值触发）
- 定时事件（定时器、周期性任务）
- 自定义事件

**动作类型**:
- 属性变更（颜色、大小、位置）
- 数据请求（触发数据源更新）
- 页面跳转（导航到其他视图）
- 脚本执行（自定义 JavaScript 代码）

### 5. 模板系统 (TemplateManager)

**职责**: 管理组态模板的创建、保存和加载

**模板数据结构**:
```json
{
  "id": "template_001",
  "name": "工业监控模板",
  "version": "1.0.0",
  "thumbnail": "/templates/preview.png",
  "canvas": {
    "width": 1920,
    "height": 1080,
    "background": "#1a1a1a"
  },
  "nodes": [
    {
      "id": "node_001",
      "type": "gauge",
      "config": { ... },
      "dataBinding": { ... },
      "events": [ ... ]
    }
  ],
  "dataSources": [ ... ],
  "eventLinks": [ ... ]
}
```

---

## 🎨 UI/UX 设计规范

### 1. 布局设计

**三栏式布局**:
```
┌─────────────────────────────────────────────────────────┐
│                    顶部工具栏 (Header)                    │
├──────────┬─────────────────────────────┬─────────────────┤
│          │                             │                 │
│  左侧    │      中间画布区域            │    右侧属性     │
│  组件库  │      (Canvas)               │    配置面板     │
│  导航栏  │                             │                 │
│          │                             │                 │
│ (200px)  │      (flex-grow: 1)         │    (300px)      │
│          │                             │                 │
└──────────┴─────────────────────────────┴─────────────────┘
```

### 2. 配色方案（深色主题）

```css
:root {
  /* 主色调 - 蓝色系 */
  --primary-color: #409EFF;
  --primary-light: #66B1FF;
  --primary-dark: #3A8EE6;

  /* 背景色 */
  --bg-primary: #1a1a1a;
  --bg-secondary: #252525;
  --bg-tertiary: #2f2f2f;

  /* 文字颜色 */
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --text-disabled: #606060;

  /* 边框颜色 */
  --border-color: #3a3a3a;
  --border-hover: #4a4a4a;

  /* 强调色 */
  --accent-success: #67C23A;
  --accent-warning: #E6A23C;
  --accent-danger: #F56C6C;
  --accent-info: #909399;
}
```

### 3. 交互设计

**拖拽操作**:
- 从左侧组件库拖拽节点到画布
- 拖拽过程中显示半透明预览
- 松开鼠标时在目标位置创建节点

**节点选择**:
- 单击选中节点，显示边框高亮
- 多选支持（Ctrl + 点击）
- 框选支持（拖拽矩形选择区域）

**属性编辑**:
- 双击节点快速编辑
- 右侧面板实时配置属性
- 支持撤销/重做操作

**画布控制**:
- 鼠标滚轮缩放画布
- 中键拖拽平移画布
- 快捷键支持（Ctrl+Z 撤销、Ctrl+Y 重做、Delete 删除）

---

## 📝 开发任务分解

### 阶段一：项目基础搭建 (优先级: P0)

- [ ] **任务 1.1**: 初始化 Vite + Vue 3 项目
  - 创建项目目录结构
  - 配置 Vite 构建工具
  - 安装核心依赖（@w3d/core, three, pinia, vue-router）

- [ ] **任务 1.2**: 配置开发环境
  - 配置 ESLint 和 Prettier
  - 配置路径别名（@/src）
  - 配置环境变量

- [ ] **任务 1.3**: 搭建基础布局
  - 实现三栏式布局组件
  - 实现顶部工具栏
  - 实现左侧面板和右侧面板的折叠功能

- [ ] **任务 1.4**: 配置状态管理
  - 初始化 Pinia Store
  - 创建编辑器状态模块
  - 创建画布状态模块

### 阶段二：画布系统开发 (优先级: P0)

- [ ] **任务 2.1**: 实现画布管理器
  - 基于 @w3d/core 初始化 3D 场景
  - 配置正交相机（OrthographicCamera）
  - 实现画布缩放和平移控制

- [ ] **任务 2.2**: 实现网格辅助线
  - 绘制网格背景
  - 实现网格吸附功能
  - 支持网格显示/隐藏切换

- [ ] **任务 2.3**: 实现变换控制器
  - 集成 Three.js TransformControls
  - 支持节点移动、旋转、缩放
  - 实现变换过程中的实时预览

- [ ] **任务 2.4**: 实现节点选择系统
  - 基于 @w3d/core EventSystem 实现点击选择
  - 实现多选和框选功能
  - 实现选中状态的视觉反馈

### 阶段三：节点系统开发 (优先级: P0)

- [ ] **任务 3.1**: 实现节点基类
  - 继承 @w3d/core Component
  - 定义节点生命周期
  - 实现节点序列化和反序列化

- [ ] **任务 3.2**: 实现基础节点类型
  - 形状节点（矩形、圆形、多边形）
  - 文本节点
  - 图片节点

- [ ] **任务 3.3**: 实现节点工厂和注册表
  - 节点类型注册机制
  - 节点实例化工厂
  - 节点配置验证

- [ ] **任务 3.4**: 实现节点拖拽创建
  - 从组件库拖拽到画布
  - 拖拽过程中的视觉反馈
  - 节点放置位置计算

### 阶段四：交互系统开发 (优先级: P1) ✅ 已完成

- [x] **任务 4.1**: 实现拖拽系统
  - 在 `packages/ConfigurationEditor/src/core/interaction/` 目录下创建 `DragManager.js`
  - 实现节点拖拽移动功能（基于鼠标事件）
  - 实现拖拽边界限制（防止节点拖出画布可视区域）
  - 实现拖拽吸附功能（与 GridHelper 集成，支持网格吸附）
  - 支持多选节点的批量拖拽
  - 拖拽过程中实时更新节点位置和属性面板
  - 与 canvas store 的 gridSnap 状态同步

- [x] **任务 4.2**: 实现缩放和旋转控制
  - 优化现有的 TransformController.js，增强缩放和旋转功能
  - 实现等比例缩放（按住 Shift 键）
  - 实现以中心点为基准的缩放
  - 实现旋转角度吸附（15度增量，按住 Shift 键）
  - 实现缩放和旋转的最小/最大值限制
  - 变换过程中实时更新属性面板显示

- [x] **任务 4.3**: 实现多选和框选功能
  - 优化现有的 SelectionManager.js，增强多选功能
  - 实现框选功能（拖拽矩形选择区域）
  - 实现 Ctrl/Cmd + 点击多选
  - 实现全选（Ctrl/Cmd + A）和反选功能
  - 实现选择状态的视觉反馈（高亮边框、选择框）
  - 多选节点的公共属性编辑

- [x] **任务 4.4**: 实现撤销/重做系统
  - 在 `packages/ConfigurationEditor/src/core/history/` 目录下创建命令系统
  - 实现 Command.js 基类（execute、undo、redo 方法）
  - 实现 CommandManager.js 管理命令栈
  - 实现具体命令类（CreateNodeCommand、DeleteNodeCommand、MoveNodeCommand、TransformNodeCommand、UpdatePropertyCommand）
  - 支持命令合并（连续的相同操作合并为一个命令）
  - 集成快捷键（Ctrl+Z 撤销、Ctrl+Y/Ctrl+Shift+Z 重做）
  - 与 Pinia store 同步历史记录状态

- [x] **任务 4.5**: 集成交互系统到画布
  - 更新 `Canvas.vue`，集成 DragManager 和 CommandManager
  - 更新 `Header.vue`，添加撤销/重做按钮和快捷键提示
  - 更新 `RightPanel.vue`，支持多选节点的公共属性编辑
  - 确保所有交互操作都通过命令系统执行（支持撤销/重做）
  - 添加交互状态的视觉反馈（拖拽中、框选中、变换中等）

### 阶段五：节点列表管理功能 (优先级: P1) 已完成

- [ ] **任务 5.1**: 实现节点列表组件
  - 在 `packages/ConfigurationEditor/src/components/editor/` 目录下创建 `NodeListPanel.vue`
  - 显示当前画布上所有已添加的节点列表
  - 列表项显示节点的名称、类型、ID、缩略图（可选）
  - 支持列表项的展开/折叠（用于显示节点详细信息）
  - 实现虚拟滚动优化（处理大量节点时的性能）
  - 集成到右侧面板或创建独立的可折叠面板

- [ ] **任务 5.2**: 实现节点列表交互功能
  - 支持在列表中点击选择节点（与画布选择同步）
  - 支持 Ctrl/Cmd + 点击多选节点
  - 支持 Shift + 点击范围选择
  - 双击列表项聚焦到画布中的节点（画布自动平移和缩放）
  - 右键菜单支持（复制、粘贴、删除、重命名等）
  - 拖拽列表项调整节点的渲染顺序（Z-index）

- [ ] **任务 5.3**: 实现节点显示/隐藏和锁定功能
  - 在列表项中添加"眼睛"图标按钮，控制节点的显示/隐藏
  - 在列表项中添加"锁"图标按钮，控制节点的锁定/解锁
  - 隐藏的节点在画布中不可见，但保留在场景中
  - 锁定的节点不可选择、不可移动、不可编辑
  - 显示/隐藏和锁定状态与 Pinia store 同步
  - 支持批量显示/隐藏和锁定/解锁（多选节点）

- [ ] **任务 5.4**: 实现节点重命名功能
  - 双击列表项的名称进入编辑模式
  - 支持内联编辑节点名称
  - 名称验证（不能为空、不能重复）
  - 重命名操作支持撤销/重做（通过命令系统）
  - 重命名后自动更新属性面板和画布显示

- [ ] **任务 5.5**: 实现节点搜索和过滤功能
  - 在节点列表顶部添加搜索框
  - 支持按节点名称、类型、ID 搜索
  - 支持按节点类型过滤（下拉选择）
  - 支持按显示/隐藏状态过滤
  - 支持按锁定/解锁状态过滤
  - 搜索结果高亮显示

### 阶段六：节点分组（Group）功能 (优先级: P1)

- [ ] **任务 6.1**: 实现 Group 节点类
  - 在 `packages/ConfigurationEditor/src/core/nodes/types/` 目录下创建 `GroupNode.js`
  - 继承 BaseNode，实现组节点的基本功能
  - 支持添加子节点到组中（children 数组）
  - 支持从组中移除子节点
  - 实现组的变换（位置、旋转、缩放）影响所有子节点
  - 实现组的序列化和反序列化（包含子节点）
  - 支持组的嵌套（组内可以包含子组）

- [ ] **任务 6.2**: 实现分组操作命令
  - 在 `packages/ConfigurationEditor/src/core/history/` 目录下创建 `GroupCommand.js`
  - 实现 CreateGroupCommand（创建组并添加选中的节点）
  - 实现 UngroupCommand（解散组，恢复子节点到画布）
  - 实现 AddToGroupCommand（将节点添加到现有组）
  - 实现 RemoveFromGroupCommand（从组中移除节点）
  - 所有分组操作支持撤销/重做

- [ ] **任务 6.3**: 实现分组 UI 交互
  - 在 Header.vue 添加"创建组"按钮（选中多个节点后可用）
  - 在 Header.vue 添加"解散组"按钮（选中组节点后可用）
  - 右键菜单支持分组操作（创建组、解散组、添加到组、从组中移除）
  - 快捷键支持（Ctrl+G 创建组、Ctrl+Shift+G 解散组）
  - 拖拽节点到组节点上自动添加到组中
  - 拖拽组节点时，所有子节点一起移动

- [ ] **任务 6.4**: 实现节点列表的树形结构显示
  - 更新 NodeListPanel.vue，支持树形结构显示
  - 组节点显示为可展开/折叠的树节点
  - 子节点缩进显示，表示层级关系
  - 支持拖拽节点到组中（改变父子关系）
  - 支持拖拽节点调整同级顺序
  - 树形结构与画布场景图同步

- [ ] **任务 6.5**: 实现组的高级功能
  - 组的边界框显示（包围所有子节点）
  - 组的自动布局功能（水平排列、垂直排列、网格排列）
  - 组的对齐功能（左对齐、右对齐、顶部对齐、底部对齐、居中对齐）
  - 组的分布功能（水平均匀分布、垂直均匀分布）
  - 组的复制和粘贴（包含所有子节点）
  - 组的导出和导入（作为独立的模板）

### 阶段七：工程 JSON 序列化与管理功能 (优先级: P0)

- [ ] **任务 7.1**: 设计工程 JSON 数据结构
  - 定义工程 JSON Schema（包含元数据、画布配置、节点数据、分组数据等）
  - 工程元数据：名称、版本、创建时间、修改时间、作者、描述
  - 画布配置：宽度、高度、背景色、网格设置、缩放范围
  - 节点数据：节点 ID、类型、属性、变换、数据绑定、事件配置
  - 分组数据：组 ID、组名称、子节点列表、嵌套关系
  - 连接关系：节点间的连接线、数据流向（为后续功能预留）
  - 版本控制：支持 JSON 格式的版本升级和兼容

- [ ] **任务 7.2**: 实现工程序列化功能
  - 在 `packages/ConfigurationEditor/src/core/serialization/` 目录下创建 `ProjectSerializer.js`
  - 实现 `serialize()` 方法，将当前工程转换为 JSON 对象
  - 遍历场景中的所有节点，调用节点的 `serialize()` 方法
  - 处理节点间的父子关系和分组关系
  - 处理节点的数据绑定和事件配置
  - 处理画布状态（缩放、平移、网格设置等）
  - 生成工程元数据（时间戳、版本号等）
  - 支持选择性序列化（仅序列化选中的节点）

- [ ] **任务 7.3**: 实现工程反序列化功能
  - 在 ProjectSerializer.js 中实现 `deserialize()` 方法
  - 解析 JSON 数据，验证数据格式和版本
  - 清空当前画布（可选，取决于是否是"新建工程"）
  - 根据节点数据创建节点实例（通过 NodeFactory）
  - 恢复节点的属性、变换、数据绑定、事件配置
  - 恢复节点的父子关系和分组关系
  - 恢复画布状态（缩放、平移、网格设置等）
  - 处理版本兼容性（旧版本 JSON 的升级）
  - 错误处理和异常恢复（数据损坏时的降级处理）

- [ ] **任务 7.4**: 实现"查看 JSON"功能
  - 在 `packages/ConfigurationEditor/src/components/editor/` 目录下创建 `JsonViewerPanel.vue`
  - 在 Header.vue 添加"查看 JSON"按钮
  - 点击按钮打开模态框或侧边面板，显示当前工程的 JSON 数据
  - 使用代码编辑器组件（如 Monaco Editor 或 CodeMirror）显示 JSON
  - 支持 JSON 语法高亮和格式化
  - 支持 JSON 折叠/展开（树形视图）
  - 支持复制 JSON 到剪贴板
  - 支持编辑 JSON 并应用到工程（高级功能，需要验证）

- [ ] **任务 7.5**: 实现"导出工程"功能
  - 在 Header.vue 添加"导出工程"按钮
  - 点击按钮触发工程序列化
  - 将 JSON 数据转换为 Blob 对象
  - 使用浏览器 API 下载 JSON 文件到本地
  - 文件名格式：`项目名称_YYYYMMDD_HHmmss.json`
  - 支持自定义文件名（弹出输入框）
  - 导出前显示确认对话框（包含工程信息预览）
  - 导出成功后显示提示消息

- [ ] **任务 7.6**: 实现"导入工程"功能
  - 在 Header.vue 添加"导入工程"按钮
  - 点击按钮打开文件选择对话框（仅接受 .json 文件）
  - 读取文件内容，解析 JSON 数据
  - 验证 JSON 格式和版本
  - 导入前显示确认对话框（包含工程信息预览）
  - 用户确认后执行反序列化，加载工程数据
  - 导入成功后显示提示消息
  - 错误处理（文件格式错误、数据损坏等）
  - 支持拖拽文件到画布导入（可选）

- [ ] **任务 7.7**: 实现"新建工程"功能
  - 在 Header.vue 添加"新建工程"按钮
  - 点击按钮前检查当前工程是否有未保存的更改
  - 如果有未保存更改，显示确认对话框（保存、不保存、取消）
  - 用户确认后清空画布（删除所有节点）
  - 重置画布状态（缩放、平移、网格设置等）
  - 重置编辑器状态（选择、历史记录等）
  - 创建新的工程元数据（新的 ID、时间戳等）
  - 显示"新建工程成功"提示消息

- [ ] **任务 7.8**: 实现工程自动保存功能（可选）
  - 在 Pinia store 中添加 `autoSave` 状态
  - 监听工程数据的变化（节点增删改、属性修改等）
  - 使用防抖机制，避免频繁保存
  - 将工程 JSON 保存到 localStorage 或 IndexedDB
  - 应用启动时检查是否有自动保存的数据
  - 如果有，显示恢复对话框（恢复、忽略）
  - 在设置面板中添加自动保存开关和间隔设置

### 阶段八：属性配置面板 (优先级: P1)

- [ ] **任务 8.1**: 实现属性面板框架
  - 动态属性表单生成
  - 属性分组和折叠
  - 属性值实时同步

- [ ] **任务 8.2**: 实现基础属性编辑器
  - 颜色选择器
  - 数值输入（支持滑块）
  - 文本输入
  - 下拉选择

- [ ] **任务 8.3**: 实现高级属性编辑器
  - 位置和尺寸编辑
  - 旋转角度编辑
  - 透明度编辑
  - 样式配置（边框、阴影）

### 阶段九：数据源管理 (优先级: P1)

- [ ] **任务 9.1**: 实现数据源管理器
  - 数据源注册和管理
  - 数据源连接状态监控
  - 数据源配置界面

- [ ] **任务 9.2**: 实现 HTTP 数据适配器
  - RESTful API 请求
  - 请求参数配置
  - 响应数据解析

- [ ] **任务 9.3**: 实现 WebSocket 数据适配器
  - WebSocket 连接管理
  - 实时数据推送
  - 断线重连机制

- [ ] **任务 9.4**: 实现 MQTT 数据适配器
  - MQTT 客户端集成
  - 主题订阅管理
  - 消息解析和分发

- [ ] **任务 9.5**: 实现数据绑定系统
  - 节点属性与数据源绑定
  - 数据更新自动刷新视图
  - 数据格式化和转换

### 阶段十：事件联动系统 (优先级: P1)

- [x] **任务 10.1**: 实现事件管理器
  - 事件注册和监听
  - 事件触发和分发
  - 事件配置界面

- [x] **任务 10.2**: 实现条件判断器
  - 条件表达式解析
  - 逻辑运算支持（AND、OR、NOT）
  - 比较运算支持（>、<、=、!=）

- [x] **任务 10.3**: 实现动作执行器
  - 属性变更动作
  - 数据请求动作
  - 脚本执行动作
  - 页面跳转动作

- [x] **任务 10.4**: 实现事件配置面板
  - 可视化事件流编辑
  - 事件和动作的连线配置
  - 事件调试和测试

### 阶段十一：模板系统 (优先级: P2)

- [ ] **任务 11.1**: 实现模板管理器
  - 模板创建和保存
  - 模板加载和应用
  - 模板列表管理

- [ ] **任务 11.2**: 实现模板序列化
  - 场景数据序列化为 JSON
  - 数据源配置序列化
  - 事件配置序列化

- [ ] **任务 11.3**: 实现模板加载器
  - JSON 数据反序列化
  - 场景重建
  - 数据源和事件恢复

- [ ] **任务 11.4**: 实现预设模板库
  - 创建常用模板（工业监控、数据大屏）
  - 模板缩略图生成
  - 模板分类和搜索

### 阶段十二：高级节点类型 (优先级: P2)

- [ ] **任务 12.1**: 实现仪表盘节点
  - 圆形仪表盘
  - 数据驱动指针旋转
  - 刻度和标签配置

- [ ] **任务 12.2**: 实现图表节点
  - 集成图表库（ECharts 或 Chart.js）
  - 支持折线图、柱状图、饼图
  - 数据绑定和实时更新

- [ ] **任务 12.3**: 实现自定义节点
  - 支持用户上传自定义组件
  - 组件配置接口定义
  - 组件热加载

### 阶段十三：优化和完善 (优先级: P3)

- [ ] **任务 13.1**: 性能优化
  - 大量节点渲染优化（虚拟化）
  - 事件系统性能优化
  - 内存泄漏检测和修复

- [ ] **任务 13.2**: 国际化支持
  - 实现 i18n 工具
  - 添加中英文语言包
  - 语言切换功能

- [ ] **任务 13.3**: 用户体验优化
  - 加载动画和进度提示
  - 错误提示和异常处理
  - 操作引导和帮助文档

- [ ] **任务 13.4**: 测试和文档
  - 单元测试（核心模块）
  - 集成测试（端到端）
  - 编写开发文档和用户手册

---

## 🔧 关键技术难点和解决方案

### 难点 1: 正交相机下的 2D 交互

**问题**: Three.js 默认使用透视相机，需要适配正交相机的 2D 交互逻辑

**解决方案**:
- 扩展 @w3d/core Camera 类，支持正交相机模式
- 自定义 OrthoCameraController 实现 2D 平移和缩放
- 使用 Raycaster 进行 2D 平面的射线检测

```javascript
// 正交相机配置
const camera = new THREE.OrthographicCamera(
  width / -2, width / 2,
  height / 2, height / -2,
  0.1, 1000
);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);
```

### 难点 2: 节点拖拽和变换控制

**问题**: 需要实现流畅的拖拽体验和精确的变换控制

**解决方案**:
- 使用 Three.js TransformControls 实现节点变换
- 实现网格吸附功能，提高对齐精度
- 使用 @w3d/core EventSystem 处理拖拽事件

### 难点 3: 实时数据绑定和更新

**问题**: 多数据源、高频率数据更新可能导致性能问题

**解决方案**:
- 实现数据节流和防抖机制
- 使用 Vue 3 的响应式系统优化数据更新
- 对于高频数据，使用 requestAnimationFrame 批量更新

### 难点 4: 复杂事件联动逻辑

**问题**: 事件链路复杂，容易出现循环依赖和死锁

**解决方案**:
- 实现事件依赖图分析，检测循环依赖
- 使用事件队列和异步执行避免阻塞
- 提供事件调试工具，可视化事件流

### 难点 5: 模板序列化和反序列化

**问题**: 需要完整保存场景状态，包括节点、数据源、事件配置

**解决方案**:
- 定义标准的 JSON Schema
- 实现递归序列化算法
- 使用版本控制，支持模板升级和兼容

---

## 📅 开发时间估算

| 阶段 | 任务数 | 预计工时 | 优先级 | 状态 |
|------|--------|----------|--------|------|
| 阶段一：项目基础搭建 | 4 | 2 天 | P0 | ✅ 已完成 |
| 阶段二：画布系统开发 | 4 | 3 天 | P0 | ✅ 已完成 |
| 阶段三：节点系统开发 | 4 | 4 天 | P0 | ✅ 已完成 |
| 阶段四：交互系统开发 | 5 | 4 天 | P1 | ✅ 已完成 |
| 阶段五：节点列表管理功能 | 5 | 3 天 | P1 | ✅ 已完成 |
| 阶段六：节点分组（Group）功能 | 5 | 4 天 | P1 | ✅ 已完成 |
| 阶段七：工程 JSON 序列化与管理 | 8 | 5 天 | P0 | ✅ 已完成|
| 阶段八：属性配置面板 | 3 | 3 天 | P1 | ✅ 已完成 |
| 阶段九：数据源管理 | 5 | 5 天 | P1 | ✅ 已完成 |
| 阶段十：事件联动系统 | 4 | 4 天 | P1 | ✅ 已完成 |
| 阶段十一：模板系统 | 4 | 3 天 | P2 | ⏳ 待开发 |
| 阶段十二：高级节点类型 | 3 | 4 天 | P2 | ⏳ 待开发 |
| 阶段十三：优化和完善 | 4 | 5 天 | P3 | ⏳ 待开发 |
| **总计** | **58** | **49 天** | - | **进度: 76%** |

**说明**:
- ✅ 已完成：阶段一至阶段十（共 44 个任务，约 38 天工时）
- ⏳ 待开发：阶段十一至阶段十三（共 14 个任务，约 11 天工时）
- 🎯 当前优先级：P0 > P1 > P2 > P3
- 📌 下一步开发：阶段十一（模板系统）→ 阶段十二（高级节点类型）→ 阶段十三（优化和完善）

---

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

### 3. 构建生产版本

```bash
pnpm build
```

---

## 📚 参考资料

- [@w3d/core SDK 文档](./packages/core/README.md)
- [Three.js 官方文档](https://threejs.org/docs/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)

---

**文档版本**: v1.0.0
**最后更新**: 2025-10-30
**维护者**: W3D Team

