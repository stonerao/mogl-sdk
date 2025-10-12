# PathAnimation

路径动画组件 - 实现对象沿多点路径移动的动画系统

## 功能特性

- ✅ **多点路径动画**：支持沿多个路径点移动
- ✅ **速度控制**：可调节移动速度
- ✅ **播放控制**：播放、暂停、停止、重置
- ✅ **循环模式**：单次播放、循环播放、往返播放
- ✅ **朝向控制**：多种朝向模式选择
- ✅ **缓动函数**：线性、加速、减速、平滑等效果
- ✅ **路径可视化**：显示路径轨迹和路径点
- ✅ **动态编辑**：实时添加、删除、修改路径点

## 配置参数

```javascript
{
    path: [],                      // 路径点数组 [[x,y,z], ...] 或 [{x,y,z}, ...]
    speed: 1.0,                    // 移动速度 (单位/秒)
    loop: true,                    // 是否循环播放
    pingPong: false,               // 往返模式 (A→B→C→B→A)
    autoStart: false,              // 自动开始播放
    lookAtDirection: 'forward',    // 朝向模式
    customRotation: [0, 0, 0],     // 自定义旋转角度 (弧度)
    easing: 'linear',              // 缓动函数
    showPath: true,                // 显示路径轨迹
    pathColor: '#00ff88',          // 路径颜色
    pathWidth: 2                   // 路径线宽
}
```

## 朝向模式

- `'forward'` - 始终朝向运动方向
- `'backward'` - 始终朝向运动反方向
- `'up'` - 始终朝向上方 (+Y 轴)
- `'down'` - 始终朝向下方 (-Y 轴)
- `'fixed'` - 固定朝向，不随路径改变
- `'custom'` - 自定义朝向角度

## 缓动函数

- `'linear'` - 线性运动
- `'easeIn'` - 加速运动
- `'easeOut'` - 减速运动
- `'easeInOut'` - 平滑运动

## 基础使用示例

```javascript
// 创建路径动画
const pathAnim = await scene.add('PathAnimation', {
    name: 'objectPath',
    path: [
        [0, 0, 0], // 起始点
        [10, 5, 0], // 中间点
        [20, 0, 0], // 结束点
        [10, -5, 0] // 返回点
    ],
    speed: 2.0,
    loop: true,
    lookAtDirection: 'forward',
    easing: 'easeInOut'
});

// 监听事件
pathAnim.on('update', (data) => {
    console.log('进度:', data.progress);
    console.log('当前位置:', data.point);
});

pathAnim.on('complete', () => {
    console.log('动画完成');
});
```

## 控制方法

```javascript
// 播放控制
pathAnim.play(); // 播放/恢复
pathAnim.pause(); // 暂停
pathAnim.stop(); // 停止
pathAnim.reset(); // 重置到起始点

// 跳转控制
pathAnim.jumpToProgress(0.5); // 跳转到50%进度
pathAnim.jumpToPoint(2); // 跳转到第3个路径点

// 路径编辑
pathAnim.addPathPoint([15, 10, 0]); // 添加路径点
pathAnim.removePathPoint(1); // 删除第2个路径点
pathAnim.updatePath([
    // 更新整个路径
    [0, 0, 0],
    [30, 0, 0]
]);

// 配置更新
pathAnim.updateConfig({
    speed: 3.0,
    lookAtDirection: 'up',
    showPath: false
});

// 获取状态
const status = pathAnim.getStatus();
console.log('播放状态:', status.isPlaying);
console.log('当前进度:', status.progress);
```

## 高级示例

### 圆形路径

```javascript
// 创建圆形路径
const circlePoints = [];
const radius = 10;
const pointCount = 12;

for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;
    circlePoints.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
}

const circleAnim = await scene.add('PathAnimation', {
    name: 'circleMotion',
    path: circlePoints,
    speed: 1.5,
    loop: true,
    lookAtDirection: 'forward'
});
```

### 螺旋上升路径

```javascript
// 创建螺旋路径
const spiralPoints = [];
const turns = 3;
const height = 20;
const radius = 8;

for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const angle = t * turns * Math.PI * 2;
    spiralPoints.push([Math.cos(angle) * radius, t * height, Math.sin(angle) * radius]);
}

const spiralAnim = await scene.add('PathAnimation', {
    name: 'spiralMotion',
    path: spiralPoints,
    speed: 2.0,
    loop: false,
    lookAtDirection: 'forward',
    easing: 'easeInOut'
});
```

### 往返巡逻

```javascript
// 创建往返巡逻路径
const patrolAnim = await scene.add('PathAnimation', {
    name: 'patrol',
    path: [
        [-20, 0, 0],
        [0, 0, 0],
        [20, 0, 0]
    ],
    speed: 1.0,
    pingPong: true, // 往返模式
    lookAtDirection: 'forward'
});

// 监听到达端点事件
patrolAnim.on('reachEnd', () => {
    console.log('到达终点，开始返回');
});

patrolAnim.on('reachStart', () => {
    console.log('返回起点，重新出发');
});
```

## 事件列表

- `play` - 开始播放
- `pause` - 暂停播放
- `stop` - 停止播放
- `reset` - 重置动画
- `update` - 位置更新 (每帧触发)
- `complete` - 动画完成 (单次播放模式)
- `reachEnd` - 到达终点 (往返模式)
- `reachStart` - 返回起点 (往返模式)
- `jump` - 跳转到指定位置
- `pathUpdated` - 路径更新
- `configUpdated` - 配置更新
