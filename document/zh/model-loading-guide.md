# 模型加载指南

本指南详细介绍如何在 W3D SDK 中加载和使用 3D 模型。

## 支持的格式

W3D SDK 的 ModelLoader 组件支持以下 3D 模型格式：

- **GLTF** (.gltf) - 文本格式的 GL Transmission Format
- **GLB** (.glb) - 二进制格式的 GLTF
- **FBX** (.fbx) - Autodesk FBX 格式

ModelLoader 会根据文件扩展名自动检测格式并使用相应的加载器。

## 基础用法

### 加载 GLTF/GLB 模型

GLTF/GLB 是 Web 3D 的标准格式，推荐优先使用。

```javascript
import { Scene, ModelLoader } from '@w3d/core';

const scene = new Scene('#app');
scene.registerComponent('ModelLoader', ModelLoader);
scene.init();

// 加载 GLB 模型
const model = await scene.add('ModelLoader', {
    name: 'robot',
    url: '/models/robot.glb',
    scale: 2,
    position: [0, 0, 0]
});

console.log('模型加载完成:', model);
```

### 加载 FBX 模型

FBX 格式广泛用于 3D 建模软件，如 Maya、3ds Max 等。

```javascript
// 加载 FBX 模型
const fbxModel = await scene.add('ModelLoader', {
    name: 'character',
    url: '/models/character.fbx',
    scale: 1,
    position: [5, 0, 0]
});

console.log('FBX 模型加载完成:', fbxModel);
```

## 加载进度

### 监听单个模型的加载进度

```javascript
scene.resourceManager.on('resource:load:progress', (event) => {
    console.log(`加载进度: ${(event.progress * 100).toFixed(2)}%`);
    console.log('URL:', event.url);
});

scene.resourceManager.on('resource:load:complete', (event) => {
    console.log('加载完成:', event.url);
});

const model = await scene.add('ModelLoader', {
    url: '/models/large-model.glb'
});
```

### 显示加载进度条

```javascript
// HTML
// <div id="progress-bar" style="width: 0%; height: 20px; background: #4CAF50;"></div>

const progressBar = document.getElementById('progress-bar');

scene.resourceManager.on('resource:load:progress', (event) => {
    const percent = (event.progress * 100).toFixed(0);
    progressBar.style.width = percent + '%';
    progressBar.textContent = percent + '%';
});

scene.resourceManager.on('resource:load:complete', () => {
    progressBar.style.width = '100%';
    progressBar.textContent = '加载完成';
});

const model = await scene.add('ModelLoader', {
    url: '/models/model.glb'
});
```

## 模型配置

### 基础配置选项

```javascript
const model = await scene.add('ModelLoader', {
    // 必需
    url: '/models/model.glb',          // 模型 URL
    
    // 可选
    name: 'myModel',                   // 组件名称
    scale: 2,                          // 缩放比例（统一缩放）
    position: [0, 0, 0],               // 位置 [x, y, z]
    rotation: [0, Math.PI / 2, 0],     // 旋转 [x, y, z]（弧度）
});
```

### 高级配置

```javascript
const model = await scene.add('ModelLoader', {
    url: '/models/model.glb',
    name: 'advancedModel',
    
    // 非统一缩放
    scaleX: 1,
    scaleY: 2,
    scaleZ: 1,
    
    // 启用阴影
    castShadow: true,
    receiveShadow: true,
    
    // 自定义材质属性
    materialOverride: {
        metalness: 0.5,
        roughness: 0.5
    }
});
```

## 处理模型数据

### 访问模型结构

加载完成后，模型数据包含以下属性：

```javascript
const model = await scene.add('ModelLoader', {
    url: '/models/model.glb'
});

// 统一的数据结构（GLTF 和 FBX 都返回相同格式）
console.log('场景对象:', model.scene);           // THREE.Object3D
console.log('动画列表:', model.animations);      // Array<THREE.AnimationClip>
console.log('相机列表:', model.cameras);         // Array<THREE.Camera>
console.log('模型类型:', model.type);            // 'gltf' 或 'fbx'
```

### 遍历模型对象

```javascript
const model = await scene.add('ModelLoader', {
    url: '/models/model.glb'
});

// 遍历所有子对象
model.scene.traverse((child) => {
    console.log('对象名称:', child.name);
    console.log('对象类型:', child.type);
    
    if (child.isMesh) {
        console.log('网格:', child);
        console.log('几何体:', child.geometry);
        console.log('材质:', child.material);
        
        // 启用阴影
        child.castShadow = true;
        child.receiveShadow = true;
    }
});
```

### 查找特定对象

```javascript
const model = await scene.add('ModelLoader', {
    url: '/models/model.glb'
});

// 通过名称查找
const head = model.scene.getObjectByName('Head');
if (head) {
    console.log('找到头部对象:', head);
}

// 查找所有网格
const meshes = [];
model.scene.traverse((child) => {
    if (child.isMesh) {
        meshes.push(child);
    }
});
console.log('所有网格:', meshes);
```

## 播放动画

### GLTF 模型动画

```javascript
const model = await scene.add('ModelLoader', {
    url: '/models/animated-character.glb'
});

// 检查是否有动画
if (model.animations && model.animations.length > 0) {
    console.log('动画列表:', model.animations.map(a => a.name));
    
    // 播放第一个动画
    const action = scene.animationManager.play(
        model.scene,
        model.animations[0],
        {
            loop: THREE.LoopRepeat,
            timeScale: 1.0
        }
    );
    
    console.log('动画播放中:', action);
}
```

### FBX 模型动画

```javascript
const fbxModel = await scene.add('ModelLoader', {
    url: '/models/animated-character.fbx'
});

// FBX 动画处理方式相同
if (fbxModel.animations && fbxModel.animations.length > 0) {
    // 播放动画
    scene.animationManager.play(
        fbxModel.scene,
        fbxModel.animations[0],
        {
            loop: THREE.LoopRepeat
        }
    );
}
```

### 控制动画播放

```javascript
const model = await scene.add('ModelLoader', {
    url: '/models/animated.glb'
});

// 播放动画
const action = scene.animationManager.play(
    model.scene,
    model.animations[0]
);

// 暂停动画
action.paused = true;

// 继续播放
action.paused = false;

// 停止动画
scene.animationManager.stop(model.scene);

// 设置播放速度
action.setEffectiveTimeScale(2.0);  // 2倍速

// 设置权重（用于混合）
action.setEffectiveWeight(0.5);
```

## 错误处理

### 基础错误处理

```javascript
try {
    const model = await scene.add('ModelLoader', {
        url: '/models/model.glb'
    });
    console.log('加载成功');
} catch (error) {
    console.error('加载失败:', error.message);
    // 显示错误提示或加载备用模型
}
```

### 监听加载错误

```javascript
scene.resourceManager.on('resource:load:error', (event) => {
    console.error('资源加载错误:');
    console.error('URL:', event.url);
    console.error('类型:', event.type);
    console.error('错误:', event.error);
    
    // 显示用户友好的错误提示
    alert(`模型加载失败: ${event.url}`);
});

const model = await scene.add('ModelLoader', {
    url: '/models/model.glb'
});
```

### 常见错误及解决方案

#### 1. 文件未找到 (404)

```javascript
// 错误: Failed to load resource: the server responded with a status of 404
// 解决: 检查文件路径是否正确
const model = await scene.add('ModelLoader', {
    url: '/models/correct-path/model.glb'  // 确保路径正确
});
```

#### 2. CORS 跨域问题

```javascript
// 错误: Access to fetch at '...' from origin '...' has been blocked by CORS policy
// 解决: 配置服务器允许 CORS 或使用代理
```

#### 3. 不支持的格式

```javascript
// 错误: 不支持的模型格式: obj
// 解决: 转换为支持的格式 (.gltf, .glb, .fbx)
```

## 性能优化

### 1. 使用 Draco 压缩

GLTF 模型可以使用 Draco 压缩来减小文件大小：

```javascript
// 设置 Draco 解码器路径
const loader = new ModelLoader();
loader.setDracoDecoderPath('/draco/');

// 加载 Draco 压缩的模型
const model = await scene.add('ModelLoader', {
    url: '/models/compressed-model.glb'
});
```

### 2. 简化模型

```javascript
// 加载后简化几何体
const model = await scene.add('ModelLoader', {
    url: '/models/model.glb'
});

model.scene.traverse((child) => {
    if (child.isMesh && child.geometry) {
        // 移除不必要的属性
        child.geometry.deleteAttribute('uv2');
        
        // 计算包围盒（优化拾取性能）
        child.geometry.computeBoundingBox();
        child.geometry.computeBoundingSphere();
    }
});
```

### 3. 使用 LOD（细节层次）

```javascript
import * as THREE from 'three';

const model = await scene.add('ModelLoader', {
    url: '/models/model.glb'
});

// 创建 LOD
const lod = new THREE.LOD();

// 添加不同细节级别
lod.addLevel(model.scene, 0);        // 高细节，距离 0
lod.addLevel(mediumDetail, 50);      // 中细节，距离 50
lod.addLevel(lowDetail, 100);        // 低细节，距离 100

scene.scene.add(lod);
```

## 批量加载

### 加载多个模型

```javascript
// 并行加载多个模型
const models = await Promise.all([
    scene.add('ModelLoader', { url: '/models/model1.glb' }),
    scene.add('ModelLoader', { url: '/models/model2.fbx' }),
    scene.add('ModelLoader', { url: '/models/model3.glb' })
]);

console.log('所有模型加载完成:', models);
```

### 顺序加载

```javascript
// 顺序加载（一个接一个）
const model1 = await scene.add('ModelLoader', { 
    url: '/models/model1.glb' 
});

const model2 = await scene.add('ModelLoader', { 
    url: '/models/model2.fbx' 
});

const model3 = await scene.add('ModelLoader', { 
    url: '/models/model3.glb' 
});
```

## 最佳实践

### 1. 选择合适的格式

- **优先使用 GLTF/GLB**：Web 标准格式，体积小，加载快
- **使用 FBX**：当需要从 Maya、3ds Max 等软件直接导出时

### 2. 优化模型文件

- 减少多边形数量
- 合并材质和纹理
- 使用 Draco 压缩（GLTF）
- 移除不必要的数据

### 3. 资源管理

```javascript
// 及时清理不需要的模型
scene.remove('modelName');

// 清理资源缓存
scene.resourceManager.clear();
```

### 4. 预加载

```javascript
// 在场景初始化时预加载关键模型
async function preloadModels() {
    const models = [
        '/models/model1.glb',
        '/models/model2.fbx'
    ];
    
    for (const url of models) {
        await scene.add('ModelLoader', { url });
    }
    
    console.log('预加载完成');
}

scene.init();
await preloadModels();
```

## 完整示例

```javascript
import { Scene, ModelLoader } from '@w3d/core';
import * as THREE from 'three';

// 创建场景
const scene = new Scene('#app');

// 添加灯光
scene.light.addAmbient({ intensity: 0.5 });
scene.light.addDirectional({
    position: [100, 100, 100],
    castShadow: true
});

// 注册组件
scene.registerComponent('ModelLoader', ModelLoader);

// 初始化
scene.init();

// 监听加载进度
scene.resourceManager.on('resource:load:progress', (event) => {
    console.log(`加载进度: ${(event.progress * 100).toFixed(0)}%`);
});

// 加载模型
try {
    // 加载 GLTF 模型
    const gltfModel = await scene.add('ModelLoader', {
        name: 'robot',
        url: '/models/robot.glb',
        scale: 2,
        position: [-5, 0, 0]
    });
    
    // 加载 FBX 模型
    const fbxModel = await scene.add('ModelLoader', {
        name: 'character',
        url: '/models/character.fbx',
        scale: 1,
        position: [5, 0, 0]
    });
    
    // 启用阴影
    [gltfModel, fbxModel].forEach(model => {
        model.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    });
    
    // 播放动画
    if (gltfModel.animations.length > 0) {
        scene.animationManager.play(
            gltfModel.scene,
            gltfModel.animations[0],
            { loop: THREE.LoopRepeat }
        );
    }
    
    // 添加交互
    gltfModel.on('click', () => {
        console.log('GLTF 模型被点击');
    });
    
    fbxModel.on('click', () => {
        console.log('FBX 模型被点击');
    });
    
    console.log('所有模型加载完成');
    
} catch (error) {
    console.error('模型加载失败:', error);
}
```

## 相关文档

- [SDK 使用指南](./sdk-guide.md)
- [API 参考文档](./api-reference.md)
- [组件开发指南](./component-guide.md)
- [常见问题](./faq.md)

