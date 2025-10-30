# FirstPersonControls

第一人称控制组件 - 支持WASD移动、鼠标视角、碰撞检测、重力和跳跃功能

## 功能特性

### 核心功能（第一阶段）✅
- ✅ **WASD键控制移动** - 支持前后左右移动
- ✅ **鼠标控制视角** - 第一人称视角旋转
- ✅ **碰撞检测** - 防止穿墙，支持自定义检测目标
- ✅ **重力系统** - 真实的重力模拟和地面检测
- ✅ **跳跃功能** - 按空格键跳跃
- ✅ **跑步模式** - 按住Shift加速移动
- ✅ **指针锁定** - 自动锁定鼠标指针
- ✅ **事件系统** - 支持碰撞、跳跃、地面等事件监听

### 增强功能（第二阶段）✅
- ✅ **8方向碰撞检测** - 前、后、左、右、左前、右前、左后、右后
- ✅ **圆柱形碰撞体** - 更精确的玩家碰撞体积检测
- ✅ **自动高度调整** - 初始化时自动调整到地面，防止掉落
- ✅ **智能地面检测** - 支持大范围初始地面搜索

### 性能优化（第三阶段）✅
- ✅ **BVH加速** - 使用BVH（Bounding Volume Hierarchy）加速射线检测，性能提升10-100倍
- ✅ **碰撞检测频率控制** - 可配置碰撞检测更新频率（Hz），降低CPU占用
- ✅ **性能监控** - 实时统计碰撞检测耗时、检测次数等性能指标
- ✅ **自动性能警告** - 检测耗时超过阈值时自动输出警告
- ✅ **性能统计API** - 提供 `getPerformanceStats()` 方法获取性能数据

## 安装使用

### 基础用法

```javascript
import { Scene } from '@w3d/core';
import { FirstPersonControls } from '@w3d/components';

// 创建场景
const scene = new Scene('#app', {
    camera: {
        position: [0, 2, 5],
        fov: 75
    }
});

scene.init();

// 注册第一人称控制器组件
scene.registerComponent('FirstPersonControls', FirstPersonControls);

// 添加第一人称控制器
const fpControls = await scene.add('FirstPersonControls', {
    moveSpeed: 5,
    lookSpeed: 0.002
});

// 点击画布锁定鼠标，开始控制
```

### 完整配置示例

```javascript
const fpControls = await scene.add('FirstPersonControls', {
    // 移动速度（米/秒）
    moveSpeed: 5.0,

    // 视角旋转速度
    lookSpeed: 0.002,

    // 跑步速度倍数
    runSpeedMultiplier: 2.0,

    // 碰撞检测配置
    collision: {
        enabled: true,              // 是否启用碰撞检测
        rayDistance: 1.0,           // 碰撞检测距离（米）
        groundDistance: 2.0,        // 地面检测距离（米）
        targets: [modelComponent.componentScene],  // 检测目标（null=所有物体）
        debug: false,               // 是否显示调试射线
        // 🔧 第三阶段：性能优化
        useBVH: false,              // 是否使用BVH加速（大型场景建议启用）
        updateRate: 60              // 碰撞检测更新频率（Hz）
    },

    // 重力配置
    gravity: {
        enabled: true,              // 是否启用重力
        strength: 9.8,              // 重力加速度（米/秒²）
        maxFallSpeed: 20            // 最大下落速度（米/秒）
    },

    // 跳跃配置
    jump: {
        enabled: true,              // 是否启用跳跃
        height: 2.0,                // 跳跃高度（米）
        cooldown: 500               // 跳跃冷却时间（毫秒）
    },

    // 玩家碰撞体配置
    playerBody: {
        height: 1.8,                // 玩家高度（米）
        eyeHeight: 1.6              // 眼睛高度（米）
    },

    // 键盘控制配置
    keys: {
        forward: ['KeyW', 'ArrowUp'],
        backward: ['KeyS', 'ArrowDown'],
        left: ['KeyA', 'ArrowLeft'],
        right: ['KeyD', 'ArrowRight'],
        jump: ['Space'],
        run: ['ShiftLeft', 'ShiftRight']
    },

    // 是否自动锁定鼠标指针
    autoPointerLock: true,

    // 是否自动调整初始高度到地面（防止掉落）
    autoAdjustHeight: true,

    // 初始化时的最大地面检测距离
    maxInitGroundDistance: 100
});
```

## API 文档

### 配置选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `moveSpeed` | Number | `5.0` | 移动速度（米/秒） |
| `lookSpeed` | Number | `0.002` | 视角旋转速度 |
| `runSpeedMultiplier` | Number | `2.0` | 跑步速度倍数 |
| `collision.enabled` | Boolean | `true` | 是否启用碰撞检测 |
| `collision.rayDistance` | Number | `1.0` | 碰撞检测距离（米） |
| `collision.groundDistance` | Number | `2.0` | 地面检测距离（米） |
| `collision.targets` | Array/Object | `null` | 检测目标对象 |
| `collision.debug` | Boolean | `false` | 是否显示调试射线 |
| `gravity.enabled` | Boolean | `true` | 是否启用重力 |
| `gravity.strength` | Number | `9.8` | 重力加速度（米/秒²） |
| `gravity.maxFallSpeed` | Number | `20` | 最大下落速度（米/秒） |
| `jump.enabled` | Boolean | `true` | 是否启用跳跃 |
| `jump.height` | Number | `2.0` | 跳跃高度（米） |
| `jump.cooldown` | Number | `500` | 跳跃冷却时间（毫秒） |
| `playerBody.height` | Number | `1.8` | 玩家高度（米） |
| `playerBody.eyeHeight` | Number | `1.6` | 眼睛高度（米） |
| `autoPointerLock` | Boolean | `true` | 是否自动锁定鼠标指针 |
| `autoAdjustHeight` | Boolean | `true` | 是否自动调整初始高度到地面 |
| `maxInitGroundDistance` | Number | `100` | 初始化时的最大地面检测距离（米） |

### 方法

#### `lockPointer()`
锁定鼠标指针，进入第一人称控制模式。

```javascript
fpControls.lockPointer();
```

#### `unlockPointer()`
解锁鼠标指针，退出第一人称控制模式。

```javascript
fpControls.unlockPointer();
```

### 事件

#### `pointerlock`
指针锁定状态变化时触发。

```javascript
fpControls.on('pointerlock', (isLocked) => {
    console.log('指针锁定状态:', isLocked);
});
```

#### `collision`
发生碰撞时触发。

```javascript
fpControls.on('collision', (data) => {
    console.log('碰撞:', data.direction, data.object, data.distance);
});
```

#### `jump`
跳跃时触发。

```javascript
fpControls.on('jump', (data) => {
    console.log('跳跃高度:', data.height);
});
```

#### `ground`
地面状态变化时触发。

```javascript
fpControls.on('ground', (isOnGround) => {
    console.log('是否在地面:', isOnGround);
});
```

## 控制说明

### 键盘控制

- **W / ↑** - 向前移动
- **S / ↓** - 向后移动
- **A / ←** - 向左移动
- **D / →** - 向右移动
- **Space** - 跳跃（需在地面上）
- **Shift** - 按住加速跑步

### 鼠标控制

- **移动鼠标** - 旋转视角
- **点击画布** - 锁定鼠标指针
- **ESC** - 解锁鼠标指针

## 使用示例

### 示例1：基础第一人称控制

```javascript
const scene = new Scene('#app');
scene.init();

scene.registerComponent('FirstPersonControls', FirstPersonControls);

const fpControls = await scene.add('FirstPersonControls', {
    moveSpeed: 5,
    lookSpeed: 0.002
});
```

### 示例2：与模型碰撞检测

```javascript
// 加载模型
const model = await scene.add('ModelLoader', {
    url: '/models/building.glb'
});

// 添加第一人称控制器，指定碰撞检测目标
const fpControls = await scene.add('FirstPersonControls', {
    moveSpeed: 5,
    collision: {
        enabled: true,
        targets: [model.componentScene],  // 只与模型碰撞
        rayDistance: 1.0
    }
});
```

### 示例3：监听事件

```javascript
const fpControls = await scene.add('FirstPersonControls');

// 监听碰撞事件
fpControls.on('collision', (data) => {
    console.log('撞到了:', data.object.name);
});

// 监听跳跃事件
fpControls.on('jump', () => {
    console.log('玩家跳跃了！');
});

// 监听地面状态
fpControls.on('ground', (isOnGround) => {
    if (isOnGround) {
        console.log('着陆了');
    } else {
        console.log('在空中');
    }
});
```

### 示例4：调试模式

```javascript
const fpControls = await scene.add('FirstPersonControls', {
    collision: {
        enabled: true,
        debug: true  // 显示碰撞检测射线
    }
});
```

## 注意事项

1. **相机位置** - 确保相机初始位置在地面以上，避免陷入地面
2. **碰撞目标** - 如果场景中有大量物体，建议指定 `collision.targets` 以提高性能
3. **指针锁定** - 用户需要点击画布才能锁定鼠标，这是浏览器安全限制
4. **重力系统** - 如果禁用重力，玩家将可以自由飞行
5. **跳跃冷却** - 防止连续跳跃，可通过 `jump.cooldown` 调整

## 性能优化（第三阶段）

### BVH加速

对于大型场景（Mesh数量 > 1000），强烈建议启用BVH加速以提升碰撞检测性能：

```javascript
const fpControls = await scene.add('FirstPersonControls', {
    collision: {
        enabled: true,
        useBVH: true,  // 启用BVH加速
        targets: [modelComponent.componentScene]
    }
});
```

**性能提升**:
- 小型场景 (< 100 Mesh): 性能提升不明显
- 中型场景 (100-1000 Mesh): 性能提升 5-20倍
- 大型场景 (> 1000 Mesh): 性能提升 10-100倍

### 碰撞检测频率控制

通过调整 `updateRate` 参数可以降低碰撞检测频率，减少CPU占用：

```javascript
const fpControls = await scene.add('FirstPersonControls', {
    collision: {
        enabled: true,
        updateRate: 30  // 30Hz更新（默认60Hz）
    }
});
```

**频率设置建议**:
- **高端设备**: 60Hz（每帧检测，最精确）
- **中端设备**: 30Hz（每2帧检测，性能与精度平衡）
- **低端设备**: 20Hz（每3帧检测，优先保证流畅度）

**性能影响**:
- 60Hz → 30Hz: 碰撞检测CPU占用减少约 50%
- 60Hz → 20Hz: 碰撞检测CPU占用减少约 67%

### 性能监控

使用 `getPerformanceStats()` 方法获取性能统计数据：

```javascript
// 获取性能统计
const stats = fpControls.getPerformanceStats();
console.log('平均耗时:', stats.collision.averageTime.toFixed(2), 'ms');
console.log('总检测次数:', stats.collision.totalChecks);
console.log('使用BVH:', stats.collision.useBVH);

// 重置统计
fpControls.resetPerformanceStats();
```

**性能统计数据结构**:
```javascript
{
    collision: {
        totalChecks: 1234,      // 总检测次数
        totalTime: 3456.78,     // 总耗时（毫秒）
        averageTime: 2.8,       // 平均耗时（毫秒）
        lastCheckTime: 2.5,     // 最后一次检测耗时
        maxTime: 8.7,           // 最大耗时
        minTime: 1.2,           // 最小耗时
        useBVH: false,          // 是否使用BVH
        bvhCount: 0,            // BVH实例数量
        rayCount: 9             // 射线数量（8方向+地面）
    },
    updateRate: 60,             // 更新频率（Hz）
    actualUpdateInterval: 16.67,// 实际更新间隔（毫秒）
    frameCount: 5678            // 总帧数
}
```

### 性能警告

当碰撞检测耗时超过阈值（默认5ms）时，控制台会自动输出警告：

```
[CollisionDetector] 性能警告: 碰撞检测耗时 8.23ms (阈值: 5ms)
  - 建议启用 BVH 加速以提升性能
```

### 性能优化配置示例

#### 高性能配置（高端设备）
```javascript
const fpControls = await scene.add('FirstPersonControls', {
    collision: {
        enabled: true,
        useBVH: true,       // 启用BVH加速
        updateRate: 60,     // 60Hz更新
        rayDistance: 1.5,
        targets: [model]
    }
});
```

#### 平衡配置（中端设备）
```javascript
const fpControls = await scene.add('FirstPersonControls', {
    collision: {
        enabled: true,
        useBVH: false,      // 中型场景可不启用
        updateRate: 30,     // 30Hz更新
        rayDistance: 1.5,
        targets: [model]
    }
});
```

#### 低性能配置（低端设备）
```javascript
const fpControls = await scene.add('FirstPersonControls', {
    collision: {
        enabled: true,
        useBVH: true,       // 低端设备更需要BVH加速
        updateRate: 20,     // 20Hz更新
        rayDistance: 1.0,   // 减小检测距离
        targets: [model]
    }
});
```

### 性能调优流程

1. **启用性能监控**
   ```javascript
   setInterval(() => {
       const stats = fpControls.getPerformanceStats();
       console.log('平均耗时:', stats.collision.averageTime.toFixed(2), 'ms');
   }, 5000);
   ```

2. **观察性能数据**
   - 如果平均耗时 > 5ms，考虑启用BVH或降低频率
   - 如果FPS < 30，优先降低频率

3. **逐步优化**
   - 先尝试降低频率（60Hz → 30Hz）
   - 如果仍不够，启用BVH加速
   - 最后考虑减小检测距离

## 性能优化建议

1. **使用BVH加速** - 对于大型场景（Mesh > 1000），启用 `useBVH: true`
2. **调整更新频率** - 根据设备性能调整 `updateRate`（20-60Hz）
3. **限制检测目标** - 通过 `collision.targets` 指定需要检测的物体
4. **调整检测距离** - 根据场景大小调整 `rayDistance` 和 `groundDistance`
5. **禁用调试模式** - 生产环境中关闭 `collision.debug`
6. **监控性能** - 使用 `getPerformanceStats()` 定期检查性能

## 许可证

MIT
