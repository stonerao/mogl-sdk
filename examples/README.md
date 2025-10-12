# W3D SDK 示例

本目录包含 W3D SDK 的各种使用示例。

## 📋 示例列表

### FBX 模型加载示例

**文件：** `fbx-loading-example.html`

**功能：**
- 演示如何加载 GLTF/GLB 格式模型
- 演示如何加载 FBX 格式模型
- 展示自动格式检测功能
- 显示加载进度
- 播放模型动画
- 模型交互（点击事件）

**运行方法：**

1. 准备模型文件
   ```bash
   # 在项目根目录创建 models 文件夹
   mkdir public/models
   
   # 将你的模型文件放入该文件夹
   # 例如：
   # - public/models/example.glb
   # - public/models/example.fbx
   ```

2. 启动开发服务器
   ```bash
   # 使用 pnpm
   pnpm dev
   
   # 或使用 npm
   npm run dev
   
   # 或使用简单的 HTTP 服务器
   npx http-server -p 8080
   ```

3. 在浏览器中打开
   ```
   http://localhost:8080/examples/fbx-loading-example.html
   ```

**注意事项：**
- 需要替换示例中的模型 URL 为实际的模型路径
- FBX 模型通常需要调整缩放比例（通常是 0.01）
- 确保模型文件可以通过 HTTP 访问（避免 CORS 问题）

## 🎯 示例说明

### 支持的模型格式

| 格式 | 扩展名 | 推荐使用场景 | 特点 |
|------|--------|--------------|------|
| GLTF | .gltf | Web 3D 应用 | 文本格式，易于调试 |
| GLB | .glb | Web 3D 应用 | 二进制格式，体积小 |
| FBX | .fbx | 从建模软件导出 | 支持复杂动画和骨骼 |

### 基础用法

#### 加载 GLTF/GLB 模型

```javascript
import { Scene, ModelLoader } from '@w3d/core';

const scene = new Scene('#app');
scene.registerComponent('ModelLoader', ModelLoader);
scene.init();

// 加载模型
const model = await scene.add('ModelLoader', {
    name: 'robot',
    url: '/models/robot.glb',
    scale: 2,
    position: [0, 0, 0]
});
```

#### 加载 FBX 模型

```javascript
// FBX 模型加载方式完全相同
const fbxModel = await scene.add('ModelLoader', {
    name: 'character',
    url: '/models/character.fbx',
    scale: 0.01,  // FBX 通常需要缩小
    position: [0, 0, 0]
});
```

#### 自动格式检测

```javascript
// ModelLoader 会根据文件扩展名自动选择加载器
const model1 = await scene.add('ModelLoader', { url: '/models/model.glb' });  // 使用 GLTFLoader
const model2 = await scene.add('ModelLoader', { url: '/models/model.fbx' });  // 使用 FBXLoader
```

### 高级功能

#### 监听加载进度

```javascript
scene.resourceManager.on('resource:load:progress', (event) => {
    console.log(`加载进度: ${(event.progress * 100).toFixed(2)}%`);
});

scene.resourceManager.on('resource:load:complete', (event) => {
    console.log('加载完成:', event.url);
});
```

#### 播放动画

```javascript
const model = await scene.add('ModelLoader', {
    url: '/models/animated.glb'
});

// 检查并播放动画
if (model.animations && model.animations.length > 0) {
    scene.animationManager.play(
        model.scene,
        model.animations[0],
        { loop: THREE.LoopRepeat }
    );
}
```

#### 添加交互

```javascript
// 添加点击事件
model.on('click', (event) => {
    console.log('模型被点击:', event.object);
});

// 添加鼠标悬停事件
model.on('mouseenter', () => {
    console.log('鼠标进入模型');
});

model.on('mouseleave', () => {
    console.log('鼠标离开模型');
});
```

## 🛠️ 开发技巧

### 1. 获取免费 3D 模型

推荐的免费 3D 模型资源：

- **Sketchfab** - https://sketchfab.com/
  - 大量免费模型
  - 支持 GLTF/FBX 下载
  - 质量高

- **Poly Haven** - https://polyhaven.com/
  - 完全免费
  - CC0 许可
  - 高质量模型

- **Three.js Examples** - https://github.com/mrdoob/three.js/tree/dev/examples/models
  - Three.js 官方示例模型
  - 各种格式
  - 适合测试

### 2. 模型格式转换

如果你有其他格式的模型，可以使用以下工具转换：

- **Blender** - 免费开源 3D 软件
  - 支持导入/导出多种格式
  - 可以优化模型
  - 可以添加/编辑动画

- **在线转换工具**
  - https://products.aspose.app/3d/conversion
  - https://www.greentoken.de/onlineconv/

### 3. 优化模型性能

```javascript
// 加载后优化模型
const model = await scene.add('ModelLoader', {
    url: '/models/model.glb'
});

model.scene.traverse((child) => {
    if (child.isMesh) {
        // 启用阴影
        child.castShadow = true;
        child.receiveShadow = true;
        
        // 优化几何体
        if (child.geometry) {
            child.geometry.computeBoundingBox();
            child.geometry.computeBoundingSphere();
        }
        
        // 优化材质
        if (child.material) {
            child.material.needsUpdate = true;
        }
    }
});
```

### 4. 错误处理

```javascript
try {
    const model = await scene.add('ModelLoader', {
        url: '/models/model.glb'
    });
    console.log('加载成功');
} catch (error) {
    console.error('加载失败:', error.message);
    
    // 显示用户友好的错误提示
    if (error.message.includes('404')) {
        alert('模型文件未找到，请检查路径');
    } else if (error.message.includes('CORS')) {
        alert('跨域错误，请配置服务器允许 CORS');
    } else {
        alert('模型加载失败，请稍后重试');
    }
}
```

## 📚 相关文档

- [SDK 使用指南](../document/zh/sdk-guide.md)
- [模型加载指南](../document/zh/model-loading-guide.md)
- [API 参考文档](../document/zh/api-reference.md)
- [常见问题](../document/zh/faq.md)

## 🤝 贡献示例

欢迎贡献新的示例！

### 示例要求

1. **代码质量**
   - 代码清晰易读
   - 添加必要的注释
   - 遵循项目代码规范

2. **文档完整**
   - 说明示例的功能
   - 提供运行方法
   - 列出注意事项

3. **实用性**
   - 展示实际使用场景
   - 解决常见问题
   - 提供最佳实践

### 提交流程

1. Fork 项目
2. 创建示例文件
3. 更新本 README
4. 提交 Pull Request

## 📮 反馈

如有问题或建议：
- 提交 [Issue](https://github.com/yourusername/w3d-sdk/issues)
- 发送邮件：674656681@qq.com

---

<div align="center">

**感谢使用 W3D SDK！**

[返回主页](../README.md) | [查看文档](../document/zh/README.md)

</div>

