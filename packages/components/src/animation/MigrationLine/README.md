# MigrationLine

迁移线动画组件，用于在三维空间中展示从一个点到另一个点（或多个点）的动态迁移效果。

## 功能特性

- ✅ 支持单段和多段路径
- ✅ 三种渲染方式：Shader、Particle、Line2
- ✅ 完整的动画控制（播放、暂停、停止）
- ✅ 支持循环播放和延迟启动
- ✅ 丰富的配置选项
- ✅ 完整的事件系统
- ✅ 性能优化

## 渲染方式

### 1. Shader 效果（推荐）
- 使用自定义 Shader 材质实现流动效果
- 支持渐变色、发光效果
- 性能最优，适合大量迁移线
- 流畅的动画效果

### 2. Particle 效果
- 使用粒子系统沿路径移动
- 支持粒子拖尾效果
- 可配置粒子数量、大小、透明度
- 视觉效果丰富

### 3. Line2 效果
- 使用 Three.js 的 Line2（粗线条）
- 支持动态生长动画
- 支持虚线、渐变等效果
- 线条更粗，更清晰

## 基础用法

```javascript
import { Scene } from '@w3d/core';
import { MigrationLine } from '@w3d/components';

// 创建场景
const scene = new Scene(container);
scene.init();

// 注册 MigrationLine 组件
scene.registerComponent('MigrationLine', MigrationLine);

// 添加迁移线
const migrationLines = await scene.add('MigrationLine', {
    name: 'migration-lines',
    lines: [
        {
            id: 'line1',
            points: [
                { x: 0, y: 0, z: 0 },    // 起点
                { x: 10, y: 5, z: 10 },  // 中间点
                { x: 20, y: 0, z: 20 }   // 终点
            ],
            type: 'shader',  // 'shader' | 'particle' | 'line2'
            color: '#00ff00',
            size: 2,
            speed: 1,
            duration: 3000,  // 毫秒
            loop: true,
            userData: { custom: 'data' }
        }
    ]
});

// 监听事件
migrationLines.on('start', (data) => {
    console.log('动画开始', data.lineId);
});

migrationLines.on('complete', (data) => {
    console.log('动画完成', data.lineId);
});

migrationLines.on('update', (data) => {
    console.log('进度:', data.progress);
});
```

## 配置选项

### 全局配置 (globalConfig)

```javascript
const migrationLines = await scene.add('MigrationLine', {
    name: 'migration-lines',
    globalConfig: {
        type: 'shader',           // 渲染类型
        color: '#00ff00',         // 颜色
        size: 2,                  // 大小
        speed: 1,                 // 速度
        duration: 3000,           // 持续时间（毫秒）
        loop: true,               // 是否循环
        delay: 0,                 // 延迟时间（毫秒）
        autoStart: true,          // 自动开始
        
        // Shader 特定配置
        glowIntensity: 1.5,       // 发光强度
        flowSpeed: 1.0,           // 流动速度
        
        // Particle 特定配置
        particleCount: 20,        // 粒子数量
        particleSize: 0.2,        // 粒子大小
        trailLength: 0.3,         // 拖尾长度
        
        // Line2 特定配置
        lineWidth: 3,             // 线宽
        dashed: false,            // 是否虚线
        dashScale: 1,             // 虚线缩放
        dashSize: 3,              // 虚线长度
        gapSize: 1                // 虚线间隙
    },
    lines: [...]
});
```

### 单条迁移线配置

每条迁移线可以有自己的配置，会覆盖全局配置：

```javascript
{
    id: 'line1',
    points: [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 5, z: 10 }
    ],
    type: 'particle',
    color: '#ff0000',
    duration: 5000,
    loop: false,
    delay: 1000,
    userData: { custom: 'data' }
}
```

## API 方法

### addLine(lineData)

添加新的迁移线

```javascript
await migrationLines.addLine({
    id: 'new-line',
    points: [
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 5, z: 5 }
    ],
    type: 'shader',
    color: '#0000ff'
});
```

### removeLine(id)

移除指定迁移线

```javascript
migrationLines.removeLine('line1');
```

### startLine(id)

开始播放指定迁移线动画

```javascript
migrationLines.startLine('line1');
```

### pauseLine(id)

暂停指定迁移线动画

```javascript
migrationLines.pauseLine('line1');
```

### stopLine(id)

停止指定迁移线动画

```javascript
migrationLines.stopLine('line1');
```

### updateLine(id, updates)

更新迁移线配置

```javascript
await migrationLines.updateLine('line1', {
    color: '#ff0000',
    duration: 5000
});
```

### startAll()

开始所有迁移线动画

```javascript
migrationLines.startAll();
```

### stopAll()

停止所有迁移线动画

```javascript
migrationLines.stopAll();
```

### pauseAll()

暂停所有迁移线动画

```javascript
migrationLines.pauseAll();
```

### getLine(id)

获取迁移线数据

```javascript
const lineData = migrationLines.getLine('line1');
```

### getAllLines()

获取所有迁移线数据

```javascript
const allLines = migrationLines.getAllLines();
```

### getLineState(id)

获取迁移线状态

```javascript
const state = migrationLines.getLineState('line1');
console.log('是否播放:', state.isPlaying);
console.log('进度:', state.progress);
```

### clearLines()

清除所有迁移线

```javascript
migrationLines.clearLines();
```

## 事件系统

### start

动画开始时触发

```javascript
migrationLines.on('start', (data) => {
    console.log('线条 ID:', data.lineId);
    console.log('自定义数据:', data.userData);
});
```

### update

动画更新时触发

```javascript
migrationLines.on('update', (data) => {
    console.log('线条 ID:', data.lineId);
    console.log('进度:', data.progress);
    console.log('自定义数据:', data.userData);
});
```

### complete

单次动画完成时触发

```javascript
migrationLines.on('complete', (data) => {
    console.log('线条 ID:', data.lineId);
    console.log('自定义数据:', data.userData);
});
```

### loop

循环动画每次循环时触发

```javascript
migrationLines.on('loop', (data) => {
    console.log('线条 ID:', data.lineId);
    console.log('自定义数据:', data.userData);
});
```

## 高级用法

### 多段路径

```javascript
{
    id: 'multi-segment',
    points: [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 5, z: 0 },
        { x: 20, y: 5, z: 10 },
        { x: 30, y: 0, z: 10 }
    ],
    type: 'shader',
    color: '#00ff00',
    duration: 5000
}
```

### 延迟启动

```javascript
{
    id: 'delayed-line',
    points: [...],
    delay: 2000,  // 延迟 2 秒启动
    autoStart: true
}
```

### 不同渲染效果对比

```javascript
// Shader 效果 - 流动光线
{
    id: 'shader-line',
    points: [...],
    type: 'shader',
    color: '#00ff00',
    glowIntensity: 2.0,
    flowSpeed: 1.5
}

// Particle 效果 - 粒子拖尾
{
    id: 'particle-line',
    points: [...],
    type: 'particle',
    color: '#ff0000',
    particleCount: 30,
    trailLength: 0.5
}

// Line2 效果 - 粗线条
{
    id: 'line2-line',
    points: [...],
    type: 'line2',
    color: '#0000ff',
    lineWidth: 5,
    dashed: true
}
```

## 性能优化

1. **Shader 效果**：性能最优，推荐用于大量迁移线
2. **Particle 效果**：中等性能，适合少量迁移线
3. **Line2 效果**：性能较好，适合需要粗线条的场景
4. 合理设置 `particleCount` 和路径点数量
5. 使用 `loop: false` 可以在动画完成后自动停止

## 注意事项

1. 迁移线的 `id` 必须唯一
2. 至少需要 2 个路径点
3. Line2 效果需要窗口大小变化时自动调整分辨率
4. Shader 效果使用加法混合，多条线叠加会更亮
5. 粒子效果的性能与 `particleCount` 成正比

## 示例

查看完整示例：`packages/examples/src/views/examples/MigrationLineDemo.vue`

