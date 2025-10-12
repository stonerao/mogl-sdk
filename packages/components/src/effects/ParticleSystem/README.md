# ParticleSystem

高级粒子系统组件，支持动态发射、物理效果、多种发射器形状和预设效果。

## 功能特性

- ✅ 动态粒子发射和生命周期管理
- ✅ 物理效果（重力、阻力、速度）
- ✅ 多种发射器形状（点、球体、盒子、圆锥）
- ✅ 实时参数更新
- ✅ 预设粒子效果（火焰、烟雾、雨、雪、星星、爆炸）
- ✅ 混合模式支持
- ✅ 性能统计

## 基础用法

```javascript
import { Scene } from '@w3d/core';
import { ParticleSystem } from '@w3d/components';

// 创建场景
const scene = new Scene(container);
scene.init();

// 注册粒子系统组件
scene.registerComponent('ParticleSystem', ParticleSystem);

// 添加基础粒子系统
const particles = await scene.add('ParticleSystem', {
    name: 'basic-particles',
    count: 1000,
    size: 1.0,
    color: '#00ff88'
});
```

## 高级配置

```javascript
// 火焰效果
const fireParticles = await scene.add('ParticleSystem', {
    name: 'fire',
    count: 2000,
    size: 1.5,
    color: '#ff4500',
    lifetime: 3.0,
    emitter: {
        shape: 'point',
        position: [0, 0, 0],
        rate: 200,
        autoStart: true
    },
    physics: {
        gravity: -2,
        damping: 0.95,
        velocity: { min: 3, max: 8 }
    },
    blending: 'additive'
});

// 雨效果
const rainParticles = await scene.add('ParticleSystem', {
    name: 'rain',
    count: 5000,
    size: 0.5,
    color: '#4169e1',
    lifetime: 4.0,
    emitter: {
        shape: 'box',
        position: [0, 10, 0],
        range: 10,
        rate: 500
    },
    physics: {
        gravity: -20,
        velocity: { min: 8, max: 12 }
    }
});
```

## 配置参数

### 基础设置

- `count` - 粒子总数量 (默认: 1000)
- `size` - 粒子大小 (默认: 1.0)
- `color` - 粒子颜色 (默认: '#ffffff')
- `opacity` - 透明度 (默认: 0.8)
- `lifetime` - 粒子生命周期/秒 (默认: 5.0)

### 发射器设置 (emitter)

- `shape` - 发射器形状: 'point', 'sphere', 'box', 'cone' (默认: 'point')
- `position` - 发射器位置 [x, y, z] (默认: [0, 0, 0])
- `range` - 发射范围 (默认: 1.0)
- `rate` - 发射速率 粒子/秒 (默认: 100)
- `autoStart` - 自动开始发射 (默认: true)

### 物理设置 (physics)

- `gravity` - 重力加速度 (默认: -9.8)
- `damping` - 阻力系数 (默认: 0.98)
- `velocity` - 初始速度范围 { min, max } (默认: { min: 2, max: 8 })

### 渲染设置

- `blending` - 混合模式: 'normal', 'additive', 'multiply', 'screen' (默认: 'additive')
- `transparent` - 透明渲染 (默认: true)
- `sizeAttenuation` - 大小衰减 (默认: true)

## 控制方法

```javascript
// 控制发射
particles.startEmission(); // 开始发射
particles.stopEmission(); // 停止发射
particles.toggleEmission(); // 切换发射状态

// 管理粒子
particles.clearParticles(); // 清除所有粒子
particles.reset(); // 重置粒子系统

// 更新配置
particles.updateConfig({
    color: '#ff0000',
    size: 2.0,
    emitter: { rate: 300 }
});

// 获取统计信息
const stats = particles.getStats();
console.log(stats.activeParticles); // 活跃粒子数
console.log(stats.isEmitting); // 发射状态
```

## 预设效果

```javascript
// 使用预设效果
particles.setPreset('fire'); // 火焰效果
particles.setPreset('smoke'); // 烟雾效果
particles.setPreset('rain'); // 雨效果
particles.setPreset('snow'); // 雪效果
particles.setPreset('stars'); // 星星效果
particles.setPreset('explosion'); // 爆炸效果
```

## 事件监听

```javascript
// 监听粒子系统事件
particles.on('emissionStart', () => {
    console.log('开始发射粒子');
});

particles.on('emissionStop', () => {
    console.log('停止发射粒子');
});
```
