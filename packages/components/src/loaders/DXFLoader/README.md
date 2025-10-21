# DXFLoader

DXF 文件加载器组件，用于加载和显示 AutoCAD DXF 格式的 2D CAD 图纸。

基于 [dxf-parser](https://github.com/gdsestimating/dxf-parser) 库实现，提供轻量级的 DXF 文件解析和渲染。

## 功能特性

- ✅ **DXF 文件加载** - 支持加载标准 DXF 格式文件
- ✅ **轻量级实现** - 无额外 Three.js 依赖，避免版本冲突
- ✅ **图层管理** - 支持显示/隐藏特定图层
- ✅ **自动渲染** - 自动将 DXF 内容转换为 Three.js 对象
- ✅ **变换控制** - 支持位置、旋转、缩放变换
- ✅ **事件系统** - 完整的加载进度和错误事件
- ✅ **交互支持** - 支持鼠标交互事件
- ✅ **多种实体类型** - 支持线、多段线、圆、圆弧、样条曲线等

## 基本用法

### 1. 加载 DXF 文件

```javascript
import { Scene } from '@w3d/core';
import { DXFLoader } from '@w3d/components';

const scene = new Scene({
    container: document.getElementById('container')
});

// 注册组件
scene.registerComponent('DXFLoader', DXFLoader);

// 初始化场景
scene.init();

// 加载 DXF 文件
const dxfViewer = await scene.add('DXFLoader', {
    name: 'cad-drawing',
    url: '/models/demo.dxf',
    position: [0, 0, 0],
    scale: 1
});
```

### 2. 监听加载事件

```javascript
// 监听加载开始
dxfViewer.on('loadStart', (event) => {
    console.log('开始加载:', event.url);
});

// 监听加载进度
dxfViewer.on('loadProgress', (event) => {
    console.log('加载进度:', event.progress * 100 + '%');
});

// 监听加载完成
dxfViewer.on('loadComplete', (event) => {
    console.log('加载完成:', event.dxfData);
});

// 监听加载错误
dxfViewer.on('error', (event) => {
    console.error('加载失败:', event.error);
});
```

### 3. 图层管理

```javascript
// 获取所有图层
const layers = dxfViewer.getLayers();
console.log('可用图层:', layers);

// 显示/隐藏特定图层
dxfViewer.setLayerVisible('Layer1', false); // 隐藏 Layer1
dxfViewer.setLayerVisible('Layer2', true);  // 显示 Layer2

// 设置可见图层（只显示指定的图层）
dxfViewer.setVisibleLayers(['Layer1', 'Layer3']);
```

## 配置选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `string` | `''` | DXF 文件 URL（必填） |
| `position` | `Array<number>` | `[0, 0, 0]` | 位置坐标 [x, y, z] |
| `rotation` | `Array<number>` | `[0, 0, 0]` | 旋转角度 [x, y, z]（弧度） |
| `scale` | `number \| Array<number>` | `1` | 缩放比例 |
| `fonts` | `Array<string>` | `null` | 字体文件 URL 数组（用于文本渲染） |
| `clearColor` | `THREE.Color` | `new THREE.Color('#000000')` | 背景颜色 |
| `clearAlpha` | `number` | `0` | 背景透明度 (0-1) |
| `autoResize` | `boolean` | `false` | 是否自动调整大小 |
| `colorCorrection` | `boolean` | `true` | 是否进行颜色校正 |
| `showLayers` | `boolean` | `true` | 是否显示图层 |
| `visibleLayers` | `Array<string> \| null` | `null` | 可见图层列表（null 表示全部显示） |
| `enableInteraction` | `boolean` | `true` | 是否启用交互 |
| `canvasAlpha` | `boolean` | `true` | Canvas 是否支持透明 |
| `canvasPremultipliedAlpha` | `boolean` | `false` | Canvas 是否使用预乘 Alpha |
| `antialias` | `boolean` | `true` | 是否启用抗锯齿 |
| `preserveDrawingBuffer` | `boolean` | `false` | 是否保留绘图缓冲区 |

## 完整示例

```javascript
import { Scene } from '@w3d/core';
import { DXFLoader } from '@w3d/components';

// 创建场景
const scene = new Scene('#app')
    .camera({ position: [0, 100, 200] })
    .light('ambient', { color: '#fff', intensity: 0.8 })
    .light('directional', {
        color: '#fff',
        intensity: 1.0,
        position: [100, 100, 100]
    })
    .enableResize()
    .init();

// 注册组件
scene.registerComponent('DXFLoader', DXFLoader);

// 加载 DXF 文件
const dxfViewer = await scene.add('DXFLoader', {
    name: 'floor-plan',
    url: '/models/floor-plan.dxf',
    position: [0, 0, 0],
    scale: 0.1,
    visibleLayers: ['Walls', 'Doors', 'Windows']
});

// 监听事件
dxfViewer.on('loadComplete', (event) => {
    console.log('DXF 加载完成');
    console.log('图层列表:', dxfViewer.getLayers());
});

// 交互事件
dxfViewer.on('click', (event) => {
    console.log('点击了 DXF 对象:', event.object);
});
```

## 支持的 DXF 特性

基于 [dxf-parser](https://github.com/gdsestimating/dxf-parser) 库，支持以下 DXF 特性：

**支持的实体类型：**

- ✅ 线（LINE）
- ✅ 多段线（LWPOLYLINE, POLYLINE）
- ✅ 圆（CIRCLE）
- ✅ 圆弧（ARC）
- ✅ 样条曲线（SPLINE）

**支持的特性：**

- ✅ 图层管理
- ✅ 颜色支持（AutoCAD 标准颜色索引）
- ✅ 2D 几何渲染

**当前限制：**

- ⚠️ 文本渲染（暂未实现）
- ⚠️ 填充（HATCH）（暂未实现）
- ⚠️ 椭圆（ELLIPSE）（暂未实现）
- ⚠️ 块引用（INSERT）（暂未实现）
- ⚠️ 线型样式（所有线条渲染为连续线）
- ⚠️ 线宽（所有线条渲染为细线）

**不支持：**

- ❌ 3D 实体
- ❌ 图纸空间、布局、视口
- ❌ 引线（LEADER）
- ❌ 尺寸标注（DIMENSION）

## 方法

### `getLayers()`

获取所有图层名称。

**返回值:** `Array<string>` - 图层名称数组

### `getLayersInfo()`

获取图层详细信息。

**返回值:** `Array<{name: string, displayName: string, color: number}>` - 图层信息数组

### `setLayerVisible(layerName, visible)`
显示或隐藏指定图层。

**参数:**
- `layerName` (string) - 图层名称
- `visible` (boolean) - 是否可见

### `setVisibleLayers(layerNames)`
设置可见图层列表（只显示指定的图层）。

**参数:**
- `layerNames` (Array<string>) - 图层名称数组

### `getInteractiveObjects()`
获取所有可交互对象。

**返回值:** `Array` - 可交互对象数组

## 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `loadStart` | `{ url }` | 开始加载 DXF 文件 |
| `loadProgress` | `{ progress }` | 加载进度更新（0-1） |
| `loadComplete` | `{ dxfData, viewer }` | DXF 文件加载完成 |
| `error` | `{ error, url }` | 加载或解析错误 |
| `click` | `{ object, point }` | 点击 DXF 对象 |
| `hover` | `{ object, point }` | 鼠标悬停在 DXF 对象上 |

## 注意事项

1. **坐标系统**: DXF 使用的坐标系统可能需要调整位置和缩放，建议从较小的缩放值（如 0.1）开始调整
2. **性能**: 该组件使用轻量级实现，适合中小型 DXF 文件。对于大型文件，建议进行性能测试
3. **浏览器兼容性**: 需要支持 ES6+ 和 WebGL 的现代浏览器
4. **Three.js 版本**: 组件使用项目的 Three.js 版本（r180），无额外依赖冲突
5. **实体支持**: 当前版本支持基本的 2D 几何实体，更多实体类型将在后续版本中添加

## 依赖库

- **dxf-parser** (v1.1.2+) - DXF 文件解析器
  - GitHub: https://github.com/gdsestimating/dxf-parser
  - 特性: 轻量级、纯 JavaScript 实现、支持 DXF R12-R2018
- **three** - Three.js 3D 库（项目依赖）

## 性能优化建议

1. **缩放调整** - 根据 DXF 文件的实际尺寸调整缩放比例
2. **图层管理** - 隐藏不需要的图层以减少渲染负担
3. **文件大小** - 对于大型 DXF 文件，考虑在服务器端进行预处理或简化

## 相关链接

- [dxf-parser GitHub](https://github.com/gdsestimating/dxf-parser)
- [Three.js 官网](https://threejs.org/)
- [AutoCAD DXF 参考](https://help.autodesk.com/view/OARX/2023/ENU/?guid=GUID-235B22E0-A567-4CF6-92D3-38A2306D73F3)
