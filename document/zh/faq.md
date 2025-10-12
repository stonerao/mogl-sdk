# W3D SDK 常见问题

## 安装和配置

### Q: 如何安装 W3D SDK？

**A:** 使用 npm、pnpm 或 yarn 安装：

```bash
# 使用 pnpm（推荐）
pnpm add @w3d/core three

# 使用 npm
npm install @w3d/core three

# 使用 yarn
yarn add @w3d/core three
```

注意：Three.js 是必需的 peer dependency。

---

### Q: 为什么需要同时安装 Three.js？

**A:** W3D SDK 是基于 Three.js 构建的，Three.js 作为 peer dependency 可以：

- 避免版本冲突
- 减小打包体积
- 让您可以直接使用 Three.js 的所有功能

---

### Q: 支持哪些浏览器？

**A:** W3D SDK 支持所有现代浏览器：

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- 移动端浏览器（iOS Safari, Chrome Mobile）

需要 WebGL 支持。

---

## 场景和渲染

### Q: 如何创建一个基础场景？

**A:** 最简单的方式：

```javascript
import { Scene } from '@w3d/core';

const scene = new Scene('#app');
scene.init();
```

这将创建一个带有默认配置的场景。

---

### Q: 如何设置场景背景色？

**A:** 使用渲染器的 `setBackground` 方法：

```javascript
const scene = new Scene('#app');
scene.init();

// 设置背景色
scene.renderer.setBackground('#000000');
```

---

### Q: 如何调整相机位置？

**A:** 在创建场景时配置，或使用相机方法：

```javascript
// 方式 1: 创建时配置
const scene = new Scene('#app', {
    camera: {
        position: [0, 100, 200],
        lookAt: [0, 0, 0]
    }
});

// 方式 2: 动态设置
scene.camera.setPosition(0, 100, 200);
scene.camera.lookAt(0, 0, 0);
```

---

### Q: 如何启用阴影？

**A:** 需要同时配置渲染器和灯光：

```javascript
const scene = new Scene('#app');
scene.init();

// 启用渲染器阴影
scene.renderer.enableShadow(true);

// 添加投射阴影的灯光
scene.light.addDirectional({
    color: '#ffffff',
    intensity: 1.0,
    position: [100, 100, 100],
    castShadow: true
});

// 在组件中启用阴影
component.mesh.castShadow = true; // 投射阴影
component.mesh.receiveShadow = true; // 接收阴影
```

---

### Q: 场景渲染很卡顿，如何优化？

**A:** 几个优化建议：

1. **减少多边形数量**

```javascript
// 使用 LOD（细节层次）
const lod = new THREE.LOD();
lod.addLevel(highDetailMesh, 0);
lod.addLevel(mediumDetailMesh, 50);
lod.addLevel(lowDetailMesh, 100);
```

2. **优化材质**

```javascript
// 使用简单材质
const material = new THREE.MeshBasicMaterial(); // 而不是 MeshStandardMaterial
```

3. **合理设置相机裁剪面**

```javascript
const scene = new Scene('#app', {
    camera: {
        near: 1, // 不要太小
        far: 1000 // 不要太大
    }
});
```

4. **及时销毁不需要的组件**

```javascript
scene.remove('componentName');
```

---

## 模型加载

### Q: 支持哪些 3D 模型格式？

**A:** 支持以下格式，会自动检测并使用对应的加载器：

```javascript
// GLTF/GLB 格式（推荐）
const gltfModel = await scene.add('ModelLoader', {
    url: '/models/model.glb' // 或 .gltf
});

// FBX 格式
const fbxModel = await scene.add('ModelLoader', {
    url: '/models/model.fbx'
});
```

**格式对比：**

- **GLTF/GLB**（推荐）
    - 文件体积小
    - 加载速度快
    - 支持 PBR 材质
    - 支持动画、骨骼、变形
    - Web 3D 的标准格式
    - 支持 Draco 压缩

- **FBX**
    - 广泛用于 3D 建模软件
    - 支持复杂的动画和骨骼
    - 文件体积较大
    - 适合从 Maya、3ds Max 等软件导出

---

### Q: 如何监听模型加载进度？

**A:** 使用资源管理器的事件：

```javascript
scene.resourceManager.on('resource:load:progress', (event) => {
    console.log('加载进度:', event.progress * 100 + '%');
});

scene.resourceManager.on('resource:load:complete', (event) => {
    console.log('加载完成:', event.url);
});

const model = await scene.add('ModelLoader', {
    url: '/models/model.glb'
});
```

---

### Q: 模型加载失败怎么办？

**A:** 使用 try-catch 处理错误：

```javascript
try {
    const model = await scene.add('ModelLoader', {
        url: '/models/model.glb'
    });
} catch (error) {
    console.error('模型加载失败:', error);
    // 显示错误提示或加载备用模型
}
```

常见原因：

- 文件路径错误
- 文件格式不支持
- 网络问题
- CORS 跨域问题

---

### Q: 如何解决模型加载的 CORS 问题？

**A:** 几种解决方案：

1. **配置服务器允许 CORS**

```javascript
// Express 示例
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
```

2. **使用代理**

```javascript
// Vite 配置
export default {
    server: {
        proxy: {
            '/models': 'http://your-model-server.com'
        }
    }
};
```

3. **将模型文件放在同域下**

---

### Q: 如何调整加载的模型大小？

**A:** 使用 scale 配置：

```javascript
const model = await scene.add('ModelLoader', {
    url: '/models/model.glb',
    scale: 2 // 放大 2 倍
});

// 或动态调整
model.scale.setScalar(2);
```

---

## 交互和事件

### Q: 如何让模型可以点击？

**A:** 组件需要实现 `getInteractiveObjects()` 方法：

```javascript
class MyComponent extends Component {
    onCreate() {
        this.mesh = new THREE.Mesh(geometry, material);
        this.add(this.mesh);
    }

    // 返回可交互的对象
    getInteractiveObjects() {
        return [this.mesh];
    }
}

// 监听点击事件
component.on('click', (event) => {
    console.log('被点击了');
});
```

---

### Q: 如何实现鼠标悬停高亮效果？

**A:** 监听 mouseenter 和 mouseleave 事件：

```javascript
component.on('mouseenter', (event) => {
    // 高亮显示
    event.object.material.emissive.set('#ffff00');
    event.object.material.emissiveIntensity = 0.3;
});

component.on('mouseleave', (event) => {
    // 取消高亮
    event.object.material.emissive.set('#000000');
    event.object.material.emissiveIntensity = 0;
});
```

---

### Q: 如何禁用某个组件的交互？

**A:** 不在 `getInteractiveObjects()` 中返回对象：

```javascript
class MyComponent extends Component {
    getInteractiveObjects() {
        // 返回空数组表示不可交互
        return this.config.interactive ? [this.mesh] : [];
    }
}
```

---

## 动画

### Q: 如何播放模型自带的动画？

**A:** 使用动画管理器：

```javascript
const loader = new ModelLoader();
const gltf = await loader.load('/models/animated.glb');

// 添加模型到场景
const model = gltf.scene;
scene.scene.add(model);

// 播放第一个动画
if (gltf.animations.length > 0) {
    const action = scene.animationManager.play(model, gltf.animations[0], {
        loop: THREE.LoopRepeat
    });
}
```

---

### Q: 如何创建简单的移动动画？

**A:** 使用 Tween 补间动画：

```javascript
import { Tween } from '@w3d/core';

// 移动到新位置
Tween.to(
    object.position,
    { x: 10, y: 5, z: 0 },
    2000, // 持续 2 秒
    {
        easing: 'easeInOutQuad',
        onComplete: () => {
            console.log('动画完成');
        }
    }
);
```

---

### Q: 支持哪些缓动函数？

**A:** 内置的缓动函数：

- `linear` - 线性
- `easeInQuad` - 二次缓入
- `easeOutQuad` - 二次缓出
- `easeInOutQuad` - 二次缓入缓出
- `easeInCubic` - 三次缓入
- `easeOutCubic` - 三次缓出
- `easeInOutCubic` - 三次缓入缓出

---

## 组件开发

### Q: 如何创建自定义组件？

**A:** 继承 Component 基类：

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
}

// 注册组件
scene.registerComponent('MyComponent', MyComponent);

// 使用组件
const obj = await scene.add('MyComponent', {
    name: 'box1',
    color: '#ff0000'
});
```

---

### Q: 组件之间如何通信？

**A:** 使用事件系统：

```javascript
// 组件 A 发送事件
class ComponentA extends Component {
    doSomething() {
        this.emit('custom-event', { data: 'hello' });
    }
}

// 组件 B 监听事件
class ComponentB extends Component {
    onMounted() {
        const componentA = this.scene.get('componentA');
        componentA.on('custom-event', (data) => {
            console.log('收到消息:', data);
        });
    }
}
```

---

### Q: 如何在组件中访问场景对象？

**A:** 通过 `this.scene` 访问：

```javascript
class MyComponent extends Component {
    onCreate() {
        // 访问场景
        console.log(this.scene);

        // 访问相机
        console.log(this.scene.camera);

        // 访问其他组件
        const otherComponent = this.scene.get('otherComponentName');
    }
}
```

---

## 性能和优化

### Q: 如何检测性能问题？

**A:** 使用浏览器开发工具：

1. **Chrome DevTools Performance**
    - 录制性能分析
    - 查看帧率和渲染时间

2. **Three.js Stats**

```javascript
import Stats from 'three/examples/jsm/libs/stats.module.js';

const stats = new Stats();
document.body.appendChild(stats.dom);

// 在渲染循环中更新
scene.animate = function () {
    stats.begin();
    // ... 渲染代码
    stats.end();
};
```

---

### Q: 如何减少内存占用？

**A:** 及时清理资源：

```javascript
// 1. 销毁不需要的组件
scene.remove('componentName');

// 2. 清理资源缓存
scene.resourceManager.clear();

// 3. 手动释放资源
geometry.dispose();
material.dispose();
texture.dispose();

// 4. 销毁整个场景
scene.dispose();
```

---

## 调试

### Q: 如何调试场景中的对象？

**A:** 几种方法：

1. **使用浏览器控制台**

```javascript
// 将场景对象暴露到全局
window.myScene = scene;

// 在控制台中访问
myScene.scene.children; // 查看所有对象
```

2. **添加辅助对象**

```javascript
import * as THREE from 'three';

// 添加坐标轴辅助
const axesHelper = new THREE.AxesHelper(100);
scene.scene.add(axesHelper);

// 添加网格辅助
const gridHelper = new THREE.GridHelper(100, 10);
scene.scene.add(gridHelper);
```

3. **使用 Three.js Inspector**
    - Chrome 扩展：Three.js Inspector

---

### Q: 如何查看组件列表？

**A:** 使用组件管理器：

```javascript
// 获取所有组件
const components = scene.componentManager.getAll();
console.log('组件列表:', components);

// 获取特定组件
const component = scene.get('componentName');
console.log('组件:', component);
```

---

## 部署

### Q: 如何打包生产环境代码？

**A:** 使用构建工具：

```bash
# 使用 Vite
pnpm build

# 或使用 webpack
npm run build
```

确保在生产环境中：

- 启用代码压缩
- 移除 console.log
- 优化资源加载

---

### Q: 如何优化加载速度？

**A:** 几个建议：

1. **压缩模型文件**
    - 使用 Draco 压缩
    - 优化纹理大小

2. **使用 CDN**

```javascript
// 从 CDN 加载模型
const model = await scene.add('ModelLoader', {
    url: 'https://cdn.example.com/models/model.glb'
});
```

3. **懒加载**

```javascript
// 只在需要时加载
button.addEventListener('click', async () => {
    const model = await scene.add('ModelLoader', {
        url: '/models/model.glb'
    });
});
```

4. **预加载关键资源**

```javascript
// 在场景初始化时预加载
const preloadUrls = ['/models/model1.glb', '/models/model2.glb'];

for (const url of preloadUrls) {
    scene.resourceManager.load(url, 'model', loader);
}
```

---

## 其他问题

### Q: 如何获取帮助？

**A:** 几种方式：

1. 查看文档：
    - [SDK 使用指南](./sdk-guide.md)
    - [API 参考文档](./api-reference.md)
    - [组件开发指南](./component-guide.md)

2. 查看示例代码：
    - `packages/examples` 目录

3. 提交 Issue：
    - GitHub Issues

4. 联系我们：
    - Email: 674656681@qq.com

---

### Q: 如何贡献代码？

**A:** 欢迎贡献！步骤：

1. Fork 项目
2. 创建特性分支
3. 提交代码
4. 创建 Pull Request

详见 [贡献指南](../../README.md#贡献指南)
