# W3D Editor - 三维低码编辑器平台开发计划

## 📋 项目概述

基于 W3D SDK 的三维低码编辑器平台，采用 Vite + Vue 3 + TailwindCSS 技术栈，提供可视化的 3D 场景编辑能力。

---

## 🗂️ 完整目录结构

```
packages/editor/
├── public/                          # 静态资源目录
│   ├── models/                      # 默认模型资源
│   │   └── test.glb                 # 示例模型
│   ├── textures/                    # 默认纹理资源
│   │   └── example.jpg              # 示例纹理
│   └── favicon.ico                  # 网站图标
│
├── src/                             # 源代码目录
│   ├── main.js                      # 应用入口文件
│   ├── App.vue                      # 根组件
│   │
│   ├── assets/                      # 项目资源
│   │   └── config/
│   │       └── default-assets.json  # 默认资源配置
│   │
│   ├── components/                  # 通用组件
│   │   ├── layout/                  # 布局组件
│   │   │   ├── EditorLayout.vue     # 编辑器主布局（左-中-右三栏）
│   │   │   ├── LeftPanel.vue        # 左侧面板容器
│   │   │   ├── CenterCanvas.vue     # 中间画布容器
│   │   │   ├── RightPanel.vue       # 右侧面板容器
│   │   │   └── TopToolbar.vue       # 顶部工具栏
│   │   │
│   │   ├── panels/                  # 面板组件
│   │   │   ├── ComponentLibrary.vue # 组件库面板
│   │   │   ├── SceneTree.vue        # 场景结构树面板
│   │   │   ├── AssetLibrary.vue     # 资源库面板
│   │   │   ├── PropertyEditor.vue   # 属性编辑器面板
│   │   │   └── SceneSettings.vue    # 场景设置面板
│   │   │
│   │   ├── ui/                      # UI 基础组件
│   │   │   ├── Button.vue           # 按钮组件
│   │   │   ├── Input.vue            # 输入框组件
│   │   │   ├── Select.vue           # 下拉选择组件
│   │   │   ├── Slider.vue           # 滑块组件
│   │   │   ├── ColorPicker.vue      # 颜色选择器
│   │   │   ├── FileUpload.vue       # 文件上传组件
│   │   │   ├── TreeNode.vue         # 树节点组件
│   │   │   ├── Tabs.vue             # 标签页组件
│   │   │   ├── Accordion.vue        # 手风琴组件
│   │   │   └── Modal.vue            # 模态框组件
│   │   │
│   │   └── editors/                 # 编辑器组件
│   │       ├── PropertyField.vue    # 属性字段编辑器
│   │       ├── Vector3Editor.vue    # 三维向量编辑器
│   │       ├── TransformEditor.vue  # 变换编辑器（位置/旋转/缩放）
│   │       ├── EventEditor.vue      # 事件编辑器
│   │       └── CodeEditor.vue       # 代码编辑器（事件回调函数）
│   │
│   ├── stores/                      # Pinia 状态管理
│   │   ├── index.js                 # Store 入口
│   │   ├── useEditorStore.js        # 编辑器主状态
│   │   ├── useSceneStore.js         # 场景状态
│   │   ├── useComponentStore.js     # 组件状态
│   │   ├── useAssetStore.js         # 资源状态
│   │   ├── useHistoryStore.js       # 历史记录（撤回/重做）
│   │   └── useSelectionStore.js     # 选中状态
│   │
│   ├── composables/                 # 组合式函数
│   │   ├── useScene.js              # 场景管理
│   │   ├── useComponent.js          # 组件操作
│   │   ├── useAsset.js              # 资源管理
│   │   ├── useHistory.js            # 历史记录操作
│   │   ├── useSelection.js          # 选择管理
│   │   ├── useExport.js             # 导出功能
│   │   └── useEventSystem.js        # 事件系统管理
│   │
│   ├── utils/                       # 工具函数
│   │   ├── componentRegistry.js     # 组件注册表
│   │   ├── assetLoader.js           # 资源加载器
│   │   ├── serializer.js            # 序列化/反序列化
│   │   ├── validator.js             # 数据验证
│   │   └── fileHandler.js           # 文件处理
│   │
│   ├── config/                      # 配置文件
│   │   ├── components.js            # 可用组件配置
│   │   ├── eventTypes.js            # 事件类型定义
│   │   └── defaultScene.js          # 默认场景配置
│   │
│   └── styles/                      # 样式文件
│       ├── main.css                 # 主样式文件
│       ├── tailwind.css             # TailwindCSS 入口
│       ├── variables.css            # CSS 变量
│       └── editor.css               # 编辑器专用样式
│
├── index.html                       # HTML 入口
├── package.json                     # 项目配置
├── vite.config.js                   # Vite 配置
├── tailwind.config.js               # TailwindCSS 配置
├── postcss.config.js                # PostCSS 配置
└── README.md                        # 项目说明文档
```

---

## 🎯 开发阶段规划

### 第一阶段：项目基础搭建（优先级：P0）

#### 1.1 项目初始化
- [x] 创建项目目录结构
- [x] 配置 package.json
- [x] 配置 Vite
- [x] 配置 TailwindCSS
- [x] 配置路径别名
- [x] 创建基础文件

#### 1.2 基础布局实现
- [x] 实现 EditorLayout 主布局组件（左-中-右三栏）
- [x] 实现 TopToolbar 顶部工具栏
- [x] 实现 LeftPanel 左侧面板容器
- [x] 实现 CenterCanvas 中间画布容器
- [x] 实现 RightPanel 右侧面板容器
- [ ] 实现面板拖拽调整大小功能（可选，暂不实现）

#### 1.3 UI 基础组件库
- [x] Button 按钮组件
- [x] Input 输入框组件
- [x] Select 下拉选择组件
- [x] Slider 滑块组件
- [x] ColorPicker 颜色选择器
- [x] Tabs 标签页组件
- [x] Accordion 手风琴组件
- [x] TreeNode 树节点组件
- [x] Modal 模态框组件

---

### 第二阶段：核心功能实现（优先级：P0）

#### 2.1 场景管理系统
- [x] 创建 useSceneStore 场景状态管理
- [x] 实现 useScene 组合式函数
- [x] 集成 W3D Scene 初始化
- [x] 实现场景配置管理（Renderer/Camera/Light）
- [x] 实现场景背景设置
- [ ] 实现 HDR 环境贴图加载（后续优化）

#### 2.2 中间画布区域
- [x] 实现 3D 场景渲染容器
- [x] 集成 W3D Scene 实例
- [ ] 实现场景交互（选中/高亮）（后续优化）
- [x] 实现辅助网格显示
- [x] 实现相机控制器集成（OrbitControls 已内置在 Scene 中）

#### 2.3 组件系统
- [x] 创建 useComponentStore 组件状态管理
- [x] 实现组件注册表（componentRegistry.js）
- [x] 配置可用组件列表（config/components.js）
- [x] 实现组件添加/删除功能
- [x] 实现组件选中/取消选中

---

### 第三阶段：左侧面板功能（优先级：P0）

#### 3.1 组件库面板
- [x] 实现 ComponentLibrary 组件
- [x] 显示可用组件列表（初期仅 ModelLoader）
- [x] 实现组件拖拽添加到场景
- [x] 实现组件点击添加到场景
- [x] 显示组件图标和描述
- [x] 实现组件搜索/过滤
- [x] 实现组件分类过滤

#### 3.2 场景结构树面板
- [x] 实现 SceneTree 组件
- [x] 显示场景层级结构
- [x] 实现树节点展开/折叠
- [x] 实现节点选中/高亮
- [ ] 实现节点拖拽排序（后续优化）
- [x] 实现节点右键菜单（删除/重命名/复制）
- [x] 实现节点可见性切换
- [x] 实现节点锁定功能
- [x] 实现工具栏（展开全部/折叠全部/清空场景）

#### 3.3 资源库面板
- [x] 实现 AssetLibrary 组件
- [x] 实现资源分类（模型/纹理/HDR/图片）
- [x] 从配置初始化默认资源列表
- [x] 实现资源预览（缩略图/图标）
- [x] 实现资源上传功能
- [x] 实现资源删除功能
- [x] 实现资源搜索/过滤
- [x] 实现资源双击使用功能

---

### 第四阶段：右侧面板功能（优先级：P0）

#### 4.1 属性编辑器面板
- [x] 实现 PropertyEditor 组件
- [x] 实现动态属性表单生成（基于 configSchema）
- [x] 实现 TransformEditor（位置/旋转/缩放）
- [x] 实现 Vector3 编辑器
- [x] 实现基础属性编辑器
  - [x] 文本输入（text）
  - [x] 数字输入（number + Slider）
  - [x] 颜色选择（color + ColorPicker）
  - [x] 布尔值（boolean + checkbox）
  - [x] 下拉选择（select）
  - [x] Vector3 输入
- [x] 实现属性分组显示（使用 Accordion）
- [x] 实现属性实时更新到场景
- [x] 显示组件基本信息（名称/类型/ID）

#### 4.2 场景设置面板
- [x] 实现 SceneSettings 组件
- [x] 实现渲染器设置
  - [x] 抗锯齿开关
  - [x] 阴影开关
  - [x] 输出色彩空间选择
- [x] 实现相机设置
  - [x] 投影类型选择（透视/正交）
  - [x] FOV 调节
  - [x] 相机位置编辑
  - [x] 目标点编辑
- [x] 实现光照设置
  - [x] 环境光（颜色/强度/开关）
  - [x] 平行光（颜色/强度/阴影/开关）
- [x] 实现背景设置
  - [x] 背景类型选择（纯色/渐变/HDR）
  - [x] 纯色背景
  - [x] 渐变背景
  - [x] HDR 背景
- [x] 实现辅助显示设置
  - [x] 网格显示开关
  - [x] 网格大小调节
  - [x] 坐标轴显示开关
- [ ] 实现相机类型切换
  - [ ] 透视相机/正交相机切换
  - [ ] FOV 调节（透视相机）
  - [ ] Zoom 调节（正交相机）

---

### 第五阶段：事件管理系统（优先级：P1）✅

#### 5.1 事件系统基础 ✅
- [x] 定义事件类型配置（config/eventTypes.js）
  - [x] 生命周期事件（onLoaded/onMounted/onUnmount/onUpdate）
  - [x] 交互事件（onClick/onDoubleClick/onHover/onHoverOut）
  - [x] 数据事件（onDataUpdate/onConfigChange）
  - [x] 动画事件（onAnimationStart/onAnimationEnd/onAnimationLoop）
  - [x] 事件元数据（displayName/description/parameters/example）
- [x] 创建 useEventSystem 组合式函数
- [x] 实现事件绑定/解绑机制
- [x] 扩展 useComponentStore 添加事件管理
  - [x] 添加 events 字段
  - [x] 实现 addEvent/removeEvent/updateEvent 方法

#### 5.2 事件编辑器 ✅
- [x] 实现 EventEditor 组件
- [x] 显示组件支持的事件列表（按分类分组）
- [x] 实现事件启用/禁用开关
- [x] 实现事件处理器编辑（textarea 代码编辑器）
- [x] 实现事件参数说明显示
- [x] 实现示例代码加载功能
- [x] 集成到右侧面板（添加"事件管理"标签页）
- [ ] 实现代码语法高亮（待优化）
- [ ] 实现代码验证（待优化）

---

### 第六阶段：顶部工具栏功能（优先级：P1）✅

#### 6.1 历史记录系统 ✅
- [x] 创建 useHistoryStore 历史状态管理
- [x] 实现命令模式（Command Pattern）
- [x] 实现撤回（Undo）功能
- [x] 实现重做（Redo）功能
- [x] 实现历史记录栈管理
- [x] 实现快捷键支持（Ctrl+Z / Ctrl+Y）

#### 6.2 项目保存功能 ✅
- [x] 实现项目序列化（useProjectStore）
- [x] 实现场景数据序列化为 JSON
- [x] 实现组件配置序列化
- [x] 实现事件配置序列化
- [x] 实现本地存储保存（LocalStorage）
  - [ ] 自动保存功能（定时保存）（待优化）
  - [x] 手动保存功能
  - [ ] 保存历史记录管理（待优化）
- [x] 实现项目恢复功能（从本地存储加载）

**说明**：
- 保存功能用于编辑过程中的临时存储，数据保存在浏览器本地
- 导出功能用于生成最终的 JSON 配置文件，供生产环境使用

#### 6.3 项目导出功能 ✅
- [x] 实现导出为 JSON 配置文件（主要导出格式）
  - [x] 序列化场景配置（Renderer/Camera/Light/Background/HDR）
  - [x] 序列化组件配置（组件类型、属性、变换）
  - [x] 序列化事件配置（事件类型、回调函数代码）
  - [x] 资源路径处理（保存资源 URL/相对路径，不包含文件内容）
- [x] 实现 JSON 文件下载功能
- [ ] 实现导出预览功能（显示导出的 JSON 结构）（待优化）

**资源处理说明**：
- 所有资源文件（模型、纹理、HDR 等）存储在后端服务器
- 导出的 JSON 中仅保存资源路径，不包含实际文件内容
- 资源路径格式示例：
  - 相对路径：`"/models/test.glb"`
  - 绝对路径：`"https://cdn.example.com/models/test.glb"`
- 导入项目时，根据路径从服务器加载资源

#### 6.4 快捷键系统 ✅
- [x] 创建 useKeyboard 组合式函数
- [x] 实现快捷键注册机制
- [x] 实现 Ctrl+Z（撤回）、Ctrl+Y（重做）
- [x] 实现 Ctrl+S（保存）
- [x] 实现 Delete（删除选中组件）

#### 6.5 顶部工具栏 ✅
- [x] 扩展 TopToolbar 组件
- [x] 添加撤回/重做按钮（带快捷键提示）
- [x] 添加保存按钮（保存项目配置到 LocalStorage）
- [x] 添加加载按钮（从 LocalStorage 加载项目配置）
- [x] 添加导入按钮（从 JSON 文件导入）
- [x] 添加导出按钮（导出场景配置为 JSON）
- [x] 实现按钮的启用/禁用状态
- [x] 显示项目名称和最后保存时间
- [x] 显示未保存更改标记

---

### 第七阶段：ModelLoader 组件集成（优先级：P0）✅

#### 7.1 ModelLoader 基础集成 ✅
- [x] 注册 ModelLoader 组件到编辑器
- [x] 实现 ModelLoader 添加到场景
- [x] 实现 ModelLoader 属性编辑
- [x] 实现 ModelLoader 事件绑定
- [x] 实现模型加载进度显示

#### 7.2 ModelLoader 高级功能 ✅
- [x] 实现模型预览（通过 3D 场景）
- [x] 实现 Mesh 列表显示
- [x] 实现 InteractiveMeshes 配置
- [x] 实现动画列表显示
- [x] 实现动画播放控制
- [ ] 实现材质编辑（基础）（待优化）

---

### 第八阶段：优化与完善（优先级：P2）

#### 8.1 性能优化
- [ ] 实现场景渲染优化（待优化）
- [ ] 实现大量组件性能优化（待优化）
- [ ] 实现资源懒加载（待优化）
- [ ] 实现虚拟滚动（资源库/组件库）（待优化）

#### 8.2 用户体验优化 ✅
- [x] 实现加载状态提示（Loading 组件）
- [x] 实现错误提示（Toast 通知系统）
- [ ] 实现操作引导（待优化）
- [x] 实现快捷键系统（已在第六阶段完成）
- [x] 实现右键菜单（ContextMenu 组件 + SceneTree + ComponentLibrary）
- [ ] 实现拖拽优化（待优化）

#### 8.3 数据验证与错误处理 ✅
- [x] 实现配置数据验证（validator.js）
- [x] 实现错误边界处理（ErrorBoundary 组件）
- [x] 集成 ErrorBoundary 到布局（EditorLayout）
- [x] 应用 Validator 到组件配置验证（PropertyEditor + useComponent）
- [x] 实现异常捕获与提示（Toast 集成）
- [ ] 实现数据恢复机制（待优化）

---

## 📦 核心模块职责说明

### 1. 状态管理（Stores）

#### useEditorStore
- 管理编辑器全局状态
- 管理编辑模式（编辑/预览）
- 管理 UI 显示状态

#### useSceneStore
- 管理场景实例
- 管理场景配置（Renderer/Camera/Light）
- 管理场景背景和环境

#### useComponentStore
- 管理场景中的所有组件实例
- 管理组件添加/删除/更新
- 管理组件层级关系

#### useAssetStore
- 管理资源列表（模型/纹理）
- 管理资源上传/删除
- 管理资源分类和搜索

#### useHistoryStore
- 管理操作历史记录
- 实现撤回/重做功能
- 管理历史记录栈

#### useSelectionStore
- 管理当前选中的组件
- 管理选中状态变化
- 触发属性编辑器更新

### 2. 组合式函数（Composables）

#### useScene
- 封装场景初始化逻辑
- 封装场景配置更新逻辑
- 封装场景渲染控制

#### useComponent
- 封装组件添加逻辑
- 封装组件删除逻辑
- 封装组件属性更新逻辑

#### useAsset
- 封装资源加载逻辑
- 封装资源上传逻辑
- 封装资源管理逻辑

#### useHistory
- 封装历史记录操作
- 封装撤回/重做逻辑
- 封装命令模式实现

#### useExport
- 封装项目导出逻辑
- 封装序列化逻辑（场景/组件/事件配置）
- 封装资源路径处理逻辑
  - 提取组件中的资源 URL
  - 验证资源路径有效性
  - 保持资源路径格式一致性
- 封装 JSON 文件生成和下载逻辑

### 3. 工具函数（Utils）

#### componentRegistry.js
- 维护可用组件注册表
- 提供组件元数据（名称/图标/描述/属性定义）
- 提供组件实例化方法

#### assetLoader.js
- 封装资源加载逻辑
- 支持模型/纹理加载
- 提供加载进度回调

#### serializer.js
- 实现场景序列化为 JSON
  - 序列化场景配置（Renderer/Camera/Light/Background/HDR）
  - 序列化组件列表及其配置
  - 序列化事件配置
  - **资源路径处理**：仅保存资源 URL，不包含文件内容
- 实现 JSON 反序列化为场景
  - 解析场景配置并重建场景
  - 解析组件配置并重建组件
  - 根据资源路径从服务器加载资源
- 处理组件配置序列化
  - 提取组件属性
  - 提取变换信息（position/rotation/scale）
  - 提取事件绑定信息

#### validator.js
- 验证组件配置数据
- 验证场景配置数据
- 提供错误提示信息

#### fileHandler.js
- 处理文件上传
- 处理文件下载
- 处理文件格式转换

---

## 🔧 技术栈说明

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **状态管理**: Pinia
- **样式**: TailwindCSS
- **3D 引擎**: W3D SDK (@w3d/core + @w3d/components)
- **Three.js**: ^0.180.0

---

## 📝 开发约束

1. ❌ 不主动添加测试代码
2. ❌ 不主动添加非必要的图标资源
3. ❌ 不主动生成非必要的文档文件
4. ✅ 专注于核心功能开发
5. ✅ 代码模块化清晰，职责分明
6. ✅ 遵循 Vue 3 Composition API 最佳实践
7. ✅ 遵循 W3D SDK 组件开发规范

---

## 📤 导出功能详细说明

### 导出格式

项目最终以 **JSON 格式**导出，包含以下内容：

```json
{
  "version": "1.0.0",
  "scene": {
    "renderer": {
      "antialias": true,
      "shadowMap": true,
      "outputColorSpace": "srgb"
    },
    "camera": {
      "type": "perspective",
      "fov": 45,
      "position": [0, 100, 200],
      "lookAt": [0, 0, 0]
    },
    "lights": [...],
    "background": {
      "type": "color",
      "value": "#ffffff"
    },
    "environment": {
      "type": "hdr",
      "url": "/textures/environment.hdr",
      "intensity": 1.0
    }
  },
  "components": [
    {
      "id": "component_001",
      "type": "ModelLoader",
      "name": "building",
      "config": {
        "url": "/models/test.glb",
        "scale": 1,
        "position": [0, 0, 0],
        "rotation": [0, 0, 0],
        "castShadow": true,
        "receiveShadow": true
      },
      "events": {
        "onLoaded": "function(data) { console.log('Model loaded:', data); }",
        "onClick": "function(event) { console.log('Clicked:', event.object); }"
      }
    }
  ]
}
```

### 资源处理方式

#### 1. 资源存储
- 所有资源文件（模型、纹理、HDR 等）存储在**后端服务器**
- 编辑器中上传资源时，文件上传到服务器，返回资源 URL
- 资源 URL 保存在组件配置中

#### 2. 资源路径格式
- **相对路径**：`"/models/test.glb"`（推荐，便于迁移）
- **绝对路径**：`"https://cdn.example.com/models/test.glb"`（适用于 CDN）

#### 3. 导出时的资源处理
- 遍历所有组件配置，提取资源 URL
- 验证资源路径有效性
- 在导出的 JSON 中保存资源路径，**不包含文件内容**

#### 4. 导入时的资源处理
- 解析 JSON 配置
- 根据资源路径从服务器加载资源
- 显示加载进度
- 处理加载失败的情况

### 导出流程

1. **收集场景配置** → 序列化 Renderer/Camera/Light/Background/Environment
2. **收集组件配置** → 遍历所有组件，提取配置和事件
3. **提取资源路径** → 从组件配置中提取所有资源 URL
4. **验证数据** → 验证配置完整性和资源路径有效性
5. **生成 JSON** → 序列化为 JSON 字符串
6. **下载文件** → 触发浏览器下载 JSON 文件

### 导入流程

1. **上传 JSON 文件** → 用户选择本地 JSON 文件
2. **解析 JSON** → 解析场景配置和组件配置
3. **验证数据** → 验证配置格式和必填字段
4. **重建场景** → 根据配置重建 Scene 实例
5. **加载资源** → 根据资源路径从服务器加载资源
6. **重建组件** → 根据配置重建组件实例
7. **绑定事件** → 根据事件配置绑定事件处理函数

---

## 🎯 下一步行动

等待确认后，将按照以下顺序开始开发：

1. **第一阶段**：项目基础搭建
2. **第二阶段**：核心功能实现
3. **第三阶段**：左侧面板功能
4. **第七阶段**：ModelLoader 组件集成（优先完成第一个组件）
5. **第四阶段**：右侧面板功能
6. **第六阶段**：顶部工具栏功能
7. **第五阶段**：事件管理系统
8. **第八阶段**：优化与完善

