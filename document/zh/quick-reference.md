# W3D SDK 快速参考

## 安装

```bash
pnpm add @w3d/core three
```

## 基础使用

### 创建场景

```javascript
import { Scene } from '@w3d/core';

const scene = new Scene('#app');
scene.init();
```

### 完整配置

```javascript
const scene = new Scene('#app', {
    renderer: {
        antialias: true,
        alpha: false
    },
    camera: {
        fov: 45,
        near: 0.1,
        far: 10000,
        position: [0, 100, 200],
        lookAt: [0, 0, 0]
    },
    controls: {
        enableDamping: true,
        dampingFactor: 0.05,
        autoRotate: false
    }
});
```

## 灯光

### 环境光

```javascript
scene.light.addAmbient({
    color: '#ffffff',
    intensity: 0.8
});
```

### 平行光

```javascript
scene.light.addDirectional({
    color: '#ffffff',
    intensity: 1.0,
    position: [100, 100, 100],
    castShadow: true
});
```

### 点光源

```javascript
scene.light.addPoint({
    color: '#ffffff',
    intensity: 1.0,
    position: [0, 100, 0],
    distance: 100
});
```

### 聚光灯

```javascript
scene.light.addSpot({
    color: '#ffffff',
    intensity: 1.0,
    position: [0, 100, 0],
    target: [0, 0, 0],
    angle: Math.PI / 3
});
```

## 相机

### 设置位置

```javascript
scene.camera.setPosition(0, 100, 200);
```

### 设置朝向

```javascript
scene.camera.lookAt(0, 0, 0);
```

### 获取位置

```javascript
const position = scene.camera.getPosition();
```

### 获取方向

```javascript
const direction = scene.camera.getDirection();
```

## 控制器

### 启用自动旋转

```javascript
scene.controls.enableAutoRotate(true, 2.0);
```

### 设置目标点

```javascript
scene.controls.setTarget(0, 0, 0);
```

### 重置控制器

```javascript
scene.controls.reset();
```

## 渲染器

### 启用阴影

```javascript
scene.renderer.enableShadow(true);
```

### 设置背景色

```javascript
scene.renderer.setBackground('#000000');
```

### 启用自动调整大小

```javascript
scene.renderer.enableResize();
```

## 组件

### 注册组件

```javascript
scene.registerComponent('MyComponent', MyComponent);
```

### 添加组件

```javascript
const component = await scene.add('MyComponent', {
    name: 'component1',
    color: '#00ff00'
});
```

### 获取组件

```javascript
const component = scene.get('component1');
```

### 移除组件

```javascript
scene.remove('component1');
```

### 创建自定义组件

```javascript
import { Component } from '@w3d/core';
import * as THREE from 'three';

class MyComponent extends Component {
    static defaultConfig = {
        color: '#00ff00',
        size: 1
    };

    onCreate() {
        const geometry = new THREE.BoxGeometry(
            this.config.size,
            this.config.size,
            this.config.size
        );
        const material = new THREE.MeshStandardMaterial({
            color: this.config.color
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.add(this.mesh);
    }

    onUpdate(delta) {
        this.mesh.rotation.y += delta;
    }

    onDispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }

    getInteractiveObjects() {
        return [this.mesh];
    }
}
```

## 事件

### 监听组件事件

```javascript
component.on('click', (event) => {
    console.log('点击:', event.object);
});

component.on('mouseenter', (event) => {
    console.log('鼠标进入');
});

component.on('mouseleave', (event) => {
    console.log('鼠标离开');
});
```

### 监听全局事件

```javascript
scene.eventSystem.on('click', (event) => {
    console.log('全局点击');
});
```

### 触发自定义事件

```javascript
component.emit('custom-event', { data: 'value' });
```

### 移除事件监听

```javascript
component.off('click', handler);
```

## 资源加载

### 加载模型

```javascript
import { ModelLoader } from '@w3d/core';

scene.registerComponent('ModelLoader', ModelLoader);

// 加载 GLTF/GLB 模型
const model = await scene.add('ModelLoader', {
    name: 'robot',
    url: '/models/robot.glb',
    scale: 2
});

// 加载 FBX 模型（自动检测格式）
const fbxModel = await scene.add('ModelLoader', {
    name: 'character',
    url: '/models/character.fbx',
    scale: 1
});
```

### 监听加载进度

```javascript
scene.resourceManager.on('resource:load:progress', (event) => {
    console.log('进度:', event.progress);
});

scene.resourceManager.on('resource:load:complete', (event) => {
    console.log('完成:', event.url);
});
```

### 获取加载统计

```javascript
const stats = scene.resourceManager.getStats();
console.log('进度:', stats.progress);
console.log('已加载:', stats.loaded);
console.log('总数:', stats.total);
```

## 动画

### 补间动画

```javascript
import { Tween } from '@w3d/core';

Tween.to(object.position, { x: 10, y: 5, z: 0 }, 2000, {
    easing: 'easeInOutQuad',
    onUpdate: (target, progress) => {
        console.log('进度:', progress);
    },
    onComplete: () => {
        console.log('完成');
    }
});
```

### 播放模型动画

```javascript
const action = scene.animationManager.play(model, animation, {
    loop: THREE.LoopRepeat,
    timeScale: 1.0
});
```

### 停止动画

```javascript
scene.animationManager.stop(model);
```

## 缓动函数

- `linear` - 线性
- `easeInQuad` - 二次缓入
- `easeOutQuad` - 二次缓出
- `easeInOutQuad` - 二次缓入缓出
- `easeInCubic` - 三次缓入
- `easeOutCubic` - 三次缓出
- `easeInOutCubic` - 三次缓入缓出

## 事件类型

### 鼠标事件

```javascript
import { EventTypes } from '@w3d/core';

EventTypes.CLICK; // 'click'
EventTypes.DOUBLE_CLICK; // 'dblclick'
EventTypes.MOUSE_DOWN; // 'mousedown'
EventTypes.MOUSE_UP; // 'mouseup'
EventTypes.MOUSE_MOVE; // 'mousemove'
EventTypes.MOUSE_ENTER; // 'mouseenter'
EventTypes.MOUSE_LEAVE; // 'mouseleave'
```

### 资源事件

```javascript
EventTypes.RESOURCE_LOAD_START; // 'resource:load:start'
EventTypes.RESOURCE_LOAD_PROGRESS; // 'resource:load:progress'
EventTypes.RESOURCE_LOAD_COMPLETE; // 'resource:load:complete'
EventTypes.RESOURCE_LOAD_ERROR; // 'resource:load:error'
```

### 动画事件

```javascript
EventTypes.ANIMATION_START; // 'animation:start'
EventTypes.ANIMATION_UPDATE; // 'animation:update'
EventTypes.ANIMATION_COMPLETE; // 'animation:complete'
EventTypes.ANIMATION_STOP; // 'animation:stop'
```

## 场景控制

### 启动渲染

```javascript
scene.start();
```

### 停止渲染

```javascript
scene.stop();
```

### 销毁场景

```javascript
scene.dispose();
```

## 常用工具

### 射线拾取

```javascript
const intersects = scene.eventSystem.raycaster.raycast(event, objects);
```

### 坐标转换

```javascript
// 屏幕坐标转世界坐标
const worldPos = scene.eventSystem.raycaster.screenToWorld(x, y, z);

// 世界坐标转屏幕坐标
const screenPos = scene.eventSystem.raycaster.worldToScreen(worldPosition);
```

## 组件生命周期

```javascript
class MyComponent extends Component {
    onCreate() {
        // 组件创建
    }

    onBeforeMount() {
        // 挂载前
    }

    onMounted() {
        // 挂载完成
    }

    onUpdate(delta) {
        // 每帧更新
    }

    onBeforeDispose() {
        // 销毁前
    }

    onDispose() {
        // 销毁
    }
}
```

## 配置选项

### 渲染器配置

```javascript
{
    antialias: true,              // 抗锯齿
    alpha: false,                 // 透明背景
    powerPreference: 'high-performance'  // 性能模式
}
```

### 相机配置

```javascript
{
    fov: 45,                      // 视野角度
    near: 0.1,                    // 近裁剪面
    far: 10000,                   // 远裁剪面
    position: [0, 100, 200],      // 位置
    lookAt: [0, 0, 0]             // 朝向
}
```

### 控制器配置

```javascript
{
    enableDamping: true,          // 阻尼
    dampingFactor: 0.05,          // 阻尼系数
    enableZoom: true,             // 缩放
    enableRotate: true,           // 旋转
    enablePan: true,              // 平移
    autoRotate: false,            // 自动旋转
    autoRotateSpeed: 2.0,         // 旋转速度
    minDistance: 1,               // 最小距离
    maxDistance: 1000             // 最大距离
}
```

## 性能优化

### 及时清理资源

```javascript
// 销毁组件
scene.remove('componentName');

// 清理缓存
scene.resourceManager.clear();

// 释放几何体和材质
geometry.dispose();
material.dispose();
texture.dispose();
```

### 使用对象池

```javascript
class PooledComponent extends Component {
    static pool = [];

    static create(scene, config) {
        if (this.pool.length > 0) {
            const component = this.pool.pop();
            component.reset(config);
            return component;
        }
        return new this(scene, config);
    }

    dispose() {
        this.constructor.pool.push(this);
    }
}
```

## 调试

### 添加辅助对象

```javascript
import * as THREE from 'three';

// 坐标轴
const axesHelper = new THREE.AxesHelper(100);
scene.scene.add(axesHelper);

// 网格
const gridHelper = new THREE.GridHelper(100, 10);
scene.scene.add(gridHelper);
```

### 查看组件列表

```javascript
const components = scene.componentManager.getAll();
console.log('组件:', components);
```

## 常见模式

### 加载多个模型

```javascript
const models = await Promise.all([
    scene.add('ModelLoader', { url: '/models/model1.glb' }),
    scene.add('ModelLoader', { url: '/models/model2.glb' }),
    scene.add('ModelLoader', { url: '/models/model3.glb' })
]);
```

### 循环动画

```javascript
function animate() {
    Tween.to(object.position, { y: 5 }, 1000, {
        easing: 'easeInOutQuad',
        onComplete: () => {
            Tween.to(object.position, { y: 0 }, 1000, {
                easing: 'easeInOutQuad',
                onComplete: animate
            });
        }
    });
}
animate();
```

### 组件间通信

```javascript
// 发送方
componentA.emit('message', { data: 'hello' });

// 接收方
componentB.on('message', (data) => {
    console.log('收到:', data);
});
```
