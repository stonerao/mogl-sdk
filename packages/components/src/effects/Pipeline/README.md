# Pipeline 管道效果组件

## 📋 组件概述

Pipeline 是一个基于 THREE.js 的 3D 管道效果组件，根据提供的路径点数据生成平滑的管道模型，支持进度控制和流光效果。

## ✨ 核心功能

- ✅ **路径管道生成** - 根据路径点自动生成平滑的 3D 管道
- ✅ **进度控制** - 通过百分比控制管道的显示长度
- ✅ **流光效果** - 支持在管道表面显示流动的光效
- ✅ **批量管理** - 支持创建和管理多条管道
- ✅ **动态更新** - 支持实时更新管道参数、进度和流光效果
- ✅ **事件系统** - 提供完整的事件通知机制

## 📦 安装使用

```javascript
import { Scene } from '@w3d/core';
import { Pipeline } from '@w3d/components';

// 创建场景
const scene = new Scene(container);
scene.init();

// 注册组件
scene.registerComponent('Pipeline', Pipeline);

// 添加管道组件
const pipeline = await scene.add('Pipeline', {
    name: 'my-pipelines',
    globalConfig: {
        radius: 0.5,
        color: '#00ff00',
        opacity: 0.8,
        segments: 64
    },
    pipelines: [
        {
            id: 'pipeline1',
            points: [
                { x: 0, y: 0, z: 0 },
                { x: 10, y: 5, z: 0 },
                { x: 20, y: 0, z: 0 }
            ],
            progress: 100,
            flow: {
                enabled: true,
                speed: 1.0,
                color: '#ffffff',
                width: 0.2,
                intensity: 1.5
            }
        }
    ]
});
```

## ⚙️ 配置参数

### globalConfig（全局配置）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `radius` | number | 0.5 | 管道半径 |
| `color` | string | '#00ff00' | 管道颜色（十六进制） |
| `opacity` | number | 0.8 | 透明度（0-1） |
| `segments` | number | 64 | 管道分段数（影响平滑度） |
| `radialSegments` | number | 8 | 径向分段数 |
| `materialType` | string | 'standard' | 材质类型：'basic', 'standard', 'phong' |
| `progress` | number | 100 | 显示进度（0-100） |
| `flow` | Object | - | 流光效果配置 |

### flow（流光效果配置）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | false | 是否启用流光效果 |
| `speed` | number | 1.0 | 流光速度 |
| `color` | string | '#ffffff' | 流光颜色 |
| `width` | number | 0.2 | 流光宽度（0-1） |
| `intensity` | number | 1.5 | 流光强度 |

### pipelines（管道数据）

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 管道唯一标识 |
| `points` | Array | ✅ | 路径点数组 [{x, y, z}, ...] |
| `radius` | number | ❌ | 管道半径（覆盖全局配置） |
| `color` | string | ❌ | 管道颜色（覆盖全局配置） |
| `opacity` | number | ❌ | 透明度（覆盖全局配置） |
| `segments` | number | ❌ | 分段数（覆盖全局配置） |
| `progress` | number | ❌ | 显示进度（覆盖全局配置） |
| `flow` | Object | ❌ | 流光配置（覆盖全局配置） |

## 🔧 API 方法

### addPipeline(pipelineData)

添加新管道

```javascript
await pipeline.addPipeline({
    id: 'pipeline2',
    points: [
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 3, z: 5 },
        { x: 10, y: 0, z: 10 }
    ],
    radius: 0.8,
    color: '#ff0000',
    progress: 50
});
```

### removePipeline(id)

移除管道

```javascript
pipeline.removePipeline('pipeline1');
```

### updateProgress(id, progress)

更新管道进度

```javascript
// 显示管道的前 75%
pipeline.updateProgress('pipeline1', 75);
```

### updateFlow(id, flowConfig)

更新流光效果

```javascript
pipeline.updateFlow('pipeline1', {
    speed: 2.0,
    color: '#00ffff',
    intensity: 2.0
});
```

### updatePipeline(id, updates)

更新管道配置

```javascript
pipeline.updatePipeline('pipeline1', {
    color: '#0000ff',
    radius: 1.0,
    opacity: 0.9
});
```

### getPipeline(id)

获取管道数据

```javascript
const pipelineData = pipeline.getPipeline('pipeline1');
console.log(pipelineData);
```

### getAllPipelines()

获取所有管道数据

```javascript
const allPipelines = pipeline.getAllPipelines();
console.log('管道数量:', allPipelines.length);
```

### clearPipelines()

清除所有管道

```javascript
pipeline.clearPipelines();
```

## 📡 事件系统

### pipelineAdded

管道添加完成时触发

```javascript
pipeline.on('pipelineAdded', (data) => {
    console.log('管道已添加:', data.pipelineId);
});
```

### pipelineRemoved

管道移除时触发

```javascript
pipeline.on('pipelineRemoved', (data) => {
    console.log('管道已移除:', data.pipelineId);
});
```

### progressUpdated

进度更新时触发

```javascript
pipeline.on('progressUpdated', (data) => {
    console.log('进度已更新:', data.pipelineId, data.progress);
});
```

### flowUpdated

流光效果更新时触发

```javascript
pipeline.on('flowUpdated', (data) => {
    console.log('流光已更新:', data.pipelineId, data.flowConfig);
});
```

### pipelinesCleared

所有管道清除时触发

```javascript
pipeline.on('pipelinesCleared', () => {
    console.log('所有管道已清除');
});
```

## 💡 使用示例

### 基础管道

```javascript
await pipeline.addPipeline({
    id: 'basic-pipeline',
    points: [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 5, z: 0 },
        { x: 20, y: 0, z: 0 }
    ],
    radius: 0.5,
    color: '#00ff00',
    opacity: 0.8
});
```

### 带流光效果的管道

```javascript
await pipeline.addPipeline({
    id: 'flow-pipeline',
    points: [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 5, z: 0 },
        { x: 20, y: 0, z: 0 }
    ],
    radius: 0.8,
    color: '#0066ff',
    flow: {
        enabled: true,
        speed: 1.5,
        color: '#ffffff',
        width: 0.3,
        intensity: 2.0
    }
});
```

### 进度动画

```javascript
// 创建管道（初始进度为 0）
await pipeline.addPipeline({
    id: 'animated-pipeline',
    points: [...],
    progress: 0
});

// 动画更新进度
let progress = 0;
const interval = setInterval(() => {
    progress += 1;
    pipeline.updateProgress('animated-pipeline', progress);
    
    if (progress >= 100) {
        clearInterval(interval);
    }
}, 50);
```

## 🎨 技术实现

### 管道生成

- 使用 `THREE.CatmullRomCurve3` 创建平滑曲线
- 使用 `THREE.TubeGeometry` 生成管道几何体
- 支持自定义分段数控制平滑度

### 进度控制

- 通过 `geometry.setDrawRange()` 控制渲染范围
- 实时计算可见顶点数量
- 支持 0-100% 的精确控制

### 流光效果

- 使用 `ShaderMaterial` 实现自定义着色器
- 在 Fragment Shader 中计算流光位置和强度
- 添加 Fresnel 边缘光效增强视觉效果
- 通过 `onUpdate` 生命周期方法更新时间 uniform

## 📊 性能优化

- ✅ 几何体和材质的正确释放
- ✅ 使用 Map 数据结构快速查找
- ✅ 只更新启用流光效果的管道
- ✅ 支持批量操作减少性能开销

## 🔍 注意事项

1. **路径点数量** - 至少需要 2 个路径点才能生成管道
2. **分段数** - 分段数越大，管道越平滑，但性能开销越大
3. **流光效果** - 启用流光效果会使用 ShaderMaterial，不支持标准光照
4. **进度控制** - 进度值会被限制在 0-100 范围内
5. **资源管理** - 移除管道时会自动释放几何体和材质资源

---

**相关组件：**
- MigrationLine - 迁移线动画组件
- Label3D - 三维标签组件
- AreaBlock - 区域块组件

