# W3D SDK 组件开发指南

## 组件系统概述

W3D SDK 采用组件化架构，所有 3D 对象都是组件。组件系统提供了：

- 统一的生命周期管理
- 完善的事件系统
- 灵活的配置机制
- 自动的资源管理

## 组件基础

### 组件结构

所有组件都继承自 `Component` 基类，该基类继承自 `THREE.Group`，因此组件本身就是一个 Three.js 对象。

```javascript
import { Component } from '@w3d/core';
import * as THREE from 'three';

class MyComponent extends Component {
    // 默认配置
    static defaultConfig = {
        color: '#00ff00',
        size: 1,
        position: [0, 0, 0]
    };

    // 生命周期钩子
    onCreate() {
        // 组件创建时调用
    }

    onMounted() {
        // 组件挂载完成时调用
    }

    onUpdate(delta) {
        // 每帧更新时调用
    }

    onDispose() {
        // 组件销毁时调用
    }
}
```

### 组件生命周期

组件的生命周期包括以下阶段：

1. **创建阶段** - `onCreate()`
   - 组件实例创建后立即调用
   - 适合初始化几何体、材质等

2. **挂载前** - `onBeforeMount()`
   - 组件添加到场景前调用
   - 适合进行最后的准备工作

3. **挂载完成** - `onMounted()`
   - 组件已添加到场景后调用
   - 适合启动动画、监听事件等

4. **更新阶段** - `onUpdate(delta)`
   - 每帧渲染时调用
   - 适合更新动画、物理模拟等

5. **销毁前** - `onBeforeDispose()`
   - 组件销毁前调用
   - 适合保存状态、清理引用等

6. **销毁阶段** - `onDispose()`
   - 组件销毁时调用
   - 适合释放资源、移除监听器等

### 生命周期示例

```javascript
class AnimatedBox extends Component {
    static defaultConfig = {
        size: 1,
        color: '#00ff00',
        rotationSpeed: 1
    };

    onCreate() {
        console.log('组件创建');
        
        // 创建几何体和材质
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

    onBeforeMount() {
        console.log('准备挂载');
        // 设置位置
        if (this.config.position) {
            const [x, y, z] = this.config.position;
            this.position.set(x, y, z);
        }
    }

    onMounted() {
        console.log('挂载完成');
        // 启用阴影
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }

    onUpdate(delta) {
        // 每帧旋转
        this.mesh.rotation.y += this.config.rotationSpeed * delta;
    }

    onBeforeDispose() {
        console.log('准备销毁');
    }

    onDispose() {
        console.log('组件销毁');
        // 清理资源
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}
```

## 组件配置

### 默认配置

使用静态属性 `defaultConfig` 定义组件的默认配置：

```javascript
class MyComponent extends Component {
    static defaultConfig = {
        // 基础配置
        name: 'my-component',
        visible: true,
        
        // 自定义配置
        color: '#00ff00',
        size: 1,
        opacity: 1,
        
        // 位置配置
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
    };
}
```

### 配置合并

组件实例化时，会自动合并默认配置和用户配置：

```javascript
// 使用默认配置
const component1 = await scene.add('MyComponent', {
    name: 'box1'
});

// 覆盖部分配置
const component2 = await scene.add('MyComponent', {
    name: 'box2',
    color: '#ff0000',
    size: 2
});
```

### 动态更新配置

使用 `updateConfig()` 方法动态更新配置：

```javascript
component.updateConfig({
    color: '#0000ff',
    size: 3
});

// 监听配置更新
class MyComponent extends Component {
    onConfigUpdate(newConfig) {
        // 配置更新时调用
        if (newConfig.color) {
            this.mesh.material.color.set(newConfig.color);
        }
    }
}
```

## 事件处理

### 监听事件

组件内置了事件系统，可以方便地监听和触发事件：

```javascript
class InteractiveBox extends Component {
    onMounted() {
        // 监听点击事件
        this.on('click', this.handleClick.bind(this));
        
        // 监听鼠标进入
        this.on('mouseenter', this.handleMouseEnter.bind(this));
        
        // 监听鼠标离开
        this.on('mouseleave', this.handleMouseLeave.bind(this));
    }

    handleClick(event) {
        console.log('组件被点击', event);
        this.emit('custom-event', { data: 'some data' });
    }

    handleMouseEnter(event) {
        // 改变颜色
        this.mesh.material.color.set('#ff0000');
    }

    handleMouseLeave(event) {
        // 恢复颜色
        this.mesh.material.color.set(this.config.color);
    }
}
```

### 自定义事件

```javascript
class CustomComponent extends Component {
    onCreate() {
        // 创建对象...
    }

    doSomething() {
        // 触发自定义事件
        this.emit('something-happened', {
            timestamp: Date.now(),
            data: 'event data'
        });
    }
}

// 使用组件
const component = await scene.add('CustomComponent', {
    name: 'custom1'
});

// 监听自定义事件
component.on('something-happened', (data) => {
    console.log('事件触发:', data);
});
```

### 可交互对象

要使组件可以接收鼠标事件，需要实现 `getInteractiveObjects()` 方法：

```javascript
class InteractiveComponent extends Component {
    onCreate() {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial()
        );
        this.add(this.mesh);
    }

    // 返回可交互的对象列表
    getInteractiveObjects() {
        return [this.mesh];
    }
}
```

## 资源加载

### 加载模型

```javascript
import { Component } from '@w3d/core';
import { ModelLoader } from '@w3d/core';

class ModelComponent extends Component {
    static defaultConfig = {
        url: '',
        scale: 1
    };

    async onCreate() {
        // 创建加载器
        const loader = new ModelLoader();
        
        try {
            // 加载模型
            const gltf = await loader.load(this.config.url, (progress) => {
                console.log('加载进度:', progress);
            });
            
            // 添加模型到组件
            this.model = gltf.scene;
            this.model.scale.setScalar(this.config.scale);
            this.add(this.model);
            
            // 保存动画
            this.animations = gltf.animations;
            
        } catch (error) {
            console.error('模型加载失败:', error);
        }
    }

    getInteractiveObjects() {
        return this.model ? [this.model] : [];
    }

    onDispose() {
        // 清理模型资源
        if (this.model) {
            this.model.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
    }
}
```

### 加载纹理

```javascript
import { TextureLoader } from '@w3d/core';

class TexturedBox extends Component {
    static defaultConfig = {
        textureUrl: '',
        size: 1
    };

    async onCreate() {
        // 创建几何体
        const geometry = new THREE.BoxGeometry(
            this.config.size,
            this.config.size,
            this.config.size
        );
        
        // 加载纹理
        const textureLoader = new TextureLoader();
        const texture = await textureLoader.load(this.config.textureUrl);
        
        // 创建材质
        const material = new THREE.MeshStandardMaterial({
            map: texture
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.add(this.mesh);
    }
}
```

## 动画

### 使用补间动画

```javascript
import { Component, Tween } from '@w3d/core';

class AnimatedComponent extends Component {
    onCreate() {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({ color: '#00ff00' })
        );
        this.add(this.mesh);
    }

    onMounted() {
        // 创建补间动画
        this.animateUp();
    }

    animateUp() {
        Tween.to(
            this.position,
            { y: 5 },
            2000,
            {
                easing: 'easeInOutQuad',
                onComplete: () => {
                    this.animateDown();
                }
            }
        );
    }

    animateDown() {
        Tween.to(
            this.position,
            { y: 0 },
            2000,
            {
                easing: 'easeInOutQuad',
                onComplete: () => {
                    this.animateUp();
                }
            }
        );
    }
}
```

### 使用模型动画

```javascript
class AnimatedModel extends Component {
    async onCreate() {
        const loader = new ModelLoader();
        const gltf = await loader.load(this.config.url);
        
        this.model = gltf.scene;
        this.add(this.model);
        
        // 播放动画
        if (gltf.animations.length > 0) {
            const action = this.scene.animationManager.play(
                this.model,
                gltf.animations[0],
                {
                    loop: THREE.LoopRepeat
                }
            );
        }
    }
}
```

## 最佳实践

### 1. 资源管理

始终在 `onDispose()` 中清理资源：

```javascript
onDispose() {
    // 清理几何体
    if (this.mesh && this.mesh.geometry) {
        this.mesh.geometry.dispose();
    }
    
    // 清理材质
    if (this.mesh && this.mesh.material) {
        this.mesh.material.dispose();
    }
    
    // 清理纹理
    if (this.texture) {
        this.texture.dispose();
    }
}
```

### 2. 性能优化

- 避免在 `onUpdate()` 中进行复杂计算
- 使用对象池复用对象
- 合理使用 LOD（细节层次）

```javascript
onUpdate(delta) {
    // ❌ 不好的做法
    const distance = this.position.distanceTo(this.scene.camera.instance.position);
    
    // ✅ 好的做法 - 缓存计算结果
    if (!this.lastUpdateTime || Date.now() - this.lastUpdateTime > 100) {
        this.cachedDistance = this.position.distanceTo(
            this.scene.camera.instance.position
        );
        this.lastUpdateTime = Date.now();
    }
}
```

### 3. 错误处理

```javascript
async onCreate() {
    try {
        const model = await this.loadModel(this.config.url);
        this.add(model);
    } catch (error) {
        console.error('组件初始化失败:', error);
        this.emit('error', { error });
    }
}
```

### 4. 组件通信

```javascript
// 通过事件系统通信
class ComponentA extends Component {
    onMounted() {
        this.scene.eventSystem.on('custom-event', (data) => {
            console.log('收到事件:', data);
        });
    }
}

class ComponentB extends Component {
    doSomething() {
        this.scene.eventSystem.emit('custom-event', {
            message: 'Hello from ComponentB'
        });
    }
}
```

## 完整示例

```javascript
import { Component } from '@w3d/core';
import { ModelLoader, Tween } from '@w3d/core';
import * as THREE from 'three';

/**
 * 可交互的 3D 模型组件
 */
class InteractiveModel extends Component {
    static defaultConfig = {
        url: '',
        scale: 1,
        position: [0, 0, 0],
        autoRotate: false,
        rotationSpeed: 1,
        highlightColor: '#ffff00'
    };

    async onCreate() {
        // 加载模型
        const loader = new ModelLoader();
        
        try {
            const gltf = await loader.load(this.config.url, (progress) => {
                this.emit('load-progress', { progress });
            });
            
            this.model = gltf.scene;
            this.model.scale.setScalar(this.config.scale);
            this.add(this.model);
            
            // 保存原始材质
            this.originalMaterials = new Map();
            this.model.traverse((child) => {
                if (child.isMesh) {
                    this.originalMaterials.set(child, child.material.clone());
                }
            });
            
            this.emit('load-complete');
            
        } catch (error) {
            this.emit('load-error', { error });
            throw error;
        }
    }

    onMounted() {
        // 设置位置
        const [x, y, z] = this.config.position;
        this.position.set(x, y, z);
        
        // 监听交互事件
        this.on('click', this.handleClick.bind(this));
        this.on('mouseenter', this.handleMouseEnter.bind(this));
        this.on('mouseleave', this.handleMouseLeave.bind(this));
    }

    onUpdate(delta) {
        // 自动旋转
        if (this.config.autoRotate && this.model) {
            this.model.rotation.y += this.config.rotationSpeed * delta;
        }
    }

    handleClick(event) {
        console.log('模型被点击');
        this.emit('model-clicked', { event });
        
        // 播放点击动画
        this.playClickAnimation();
    }

    handleMouseEnter(event) {
        // 高亮显示
        this.model.traverse((child) => {
            if (child.isMesh) {
                child.material.emissive.set(this.config.highlightColor);
                child.material.emissiveIntensity = 0.3;
            }
        });
    }

    handleMouseLeave(event) {
        // 取消高亮
        this.model.traverse((child) => {
            if (child.isMesh) {
                child.material.emissive.set(0x000000);
                child.material.emissiveIntensity = 0;
            }
        });
    }

    playClickAnimation() {
        const originalY = this.position.y;
        
        Tween.to(this.position, { y: originalY + 1 }, 300, {
            easing: 'easeOutQuad',
            onComplete: () => {
                Tween.to(this.position, { y: originalY }, 300, {
                    easing: 'easeInQuad'
                });
            }
        });
    }

    getInteractiveObjects() {
        return this.model ? [this.model] : [];
    }

    onDispose() {
        // 清理资源
        if (this.model) {
            this.model.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
        
        // 清理原始材质
        this.originalMaterials.forEach(material => material.dispose());
        this.originalMaterials.clear();
    }
}

export default InteractiveModel;
```

## 注册和使用组件

```javascript
import { Scene } from '@w3d/core';
import InteractiveModel from './components/InteractiveModel';

// 创建场景
const scene = new Scene('#app');

// 注册组件
scene.registerComponent('InteractiveModel', InteractiveModel);

// 初始化场景
scene.init();

// 使用组件
const model = await scene.add('InteractiveModel', {
    name: 'robot',
    url: '/models/robot.glb',
    scale: 2,
    position: [0, 0, 0],
    autoRotate: true
});

// 监听组件事件
model.on('model-clicked', (data) => {
    console.log('模型被点击了');
});

model.on('load-complete', () => {
    console.log('模型加载完成');
});
```

