# ModelLoader

GLTF/GLB/FBX 模型加载器组件

支持自动格式检测，可加载 GLTF、GLB、FBX 格式的 3D 模型。

## 使用示例

```javascript
import { Scene } from '@w3d/core';
import { ModelLoader } from '@w3d/components';

const scene = new Scene('#app').init();
scene.registerComponent('ModelLoader', ModelLoader);

// 加载 GLTF/GLB 模型
const model = await scene.add('ModelLoader', {
    name: 'robot',
    url: '/models/robot.glb',
    scale: 2,
    position: [0, 0, 0],
    castShadow: true,
    receiveShadow: true
});

// 加载 FBX 模型（自动检测格式）
const fbxModel = await scene.add('ModelLoader', {
    name: 'character',
    url: '/models/character.fbx',
    scale: 0.01, // FBX 模型通常需要缩小
    position: [5, 0, 0]
});

// 监听加载进度
model.on('loadProgress', (data) => {
    console.log('Loading:', data.progress * 100 + '%');
});

// 监听加载完成
model.on('loadComplete', (data) => {
    console.log('Model loaded:', data.modelData);
    console.log('Model type:', data.type); // 'gltf' 或 'fbx'
});

// 播放动画
model.playAnimation(0);
```

## 支持的格式

| 格式 | 扩展名 | 说明               | 推荐场景            |
| ---- | ------ | ------------------ | ------------------- |
| GLTF | .gltf  | 文本格式，易于调试 | Web 3D 应用         |
| GLB  | .glb   | 二进制格式，体积小 | Web 3D 应用（推荐） |
| FBX  | .fbx   | Autodesk 格式      | 从建模软件导出      |

**自动格式检测：** 组件会根据文件扩展名自动选择合适的加载器，无需手动指定。

## 配置选项

| 选项              | 类型                   | 默认值    | 说明                               |
| ----------------- | ---------------------- | --------- | ---------------------------------- |
| url               | string                 | ''        | 模型 URL（支持 .gltf, .glb, .fbx） |
| scale             | number                 | 1         | 缩放比例                           |
| position          | array                  | [0,0,0]   | 位置                               |
| rotation          | array                  | [0,0,0]   | 旋转                               |
| castShadow        | boolean                | false     | 投射阴影                           |
| receiveShadow     | boolean                | false     | 接收阴影                           |
| animations        | boolean                | true      | 启用动画                           |
| interactiveMeshes | boolean\|string\|Array | false     | 交互事件配置                       |
| dracoDecoderPath  | string                 | '/draco/' | Draco 解码器路径                   |

## 事件

- `loadStart` - 加载开始
- `loadProgress` - 加载进度
- `loadComplete` - 加载完成
- `loadError` - 加载错误

## 方法

### 动画控制

- `playAnimation(index)` - 播放动画
- `stopAnimation()` - 停止动画
- `getModel()` - 获取模型对象

### Mesh 查询和操作 (新增)

- `getMeshByName(name)` - 通过名称查找 Mesh
- `findMesh(criteria)` - 条件查找 Mesh
- `getAllMeshes()` - 获取所有 Mesh 对象
- `getMeshNames()` - 获取所有 Mesh 名称

## Mesh 操作示例

### 按名称查找 Mesh

```javascript
// 获取所有 Mesh 名称
const meshNames = model.getMeshNames();
console.log('Available meshes:', meshNames);

// 查找特定 Mesh
const buildingMesh = model.getMeshByName('行政大楼');
if (buildingMesh) {
    // 设置位置
    buildingMesh.position.set(10, 0, 5);
    // 设置旋转
    buildingMesh.rotation.set(0, Math.PI / 4, 0);
    // 设置缩放
    buildingMesh.scale.set(1.5, 1.5, 1.5);
}
```

### 条件查找 Mesh

```javascript
// 按名称和类型查找
const mesh = model.findMesh({
    name: '建筑物A',
    type: 'Mesh'
});

// 使用自定义过滤函数
const largeMesh = model.findMesh({
    filter: (mesh) => {
        return mesh.geometry.attributes.position.count > 1000;
    }
});
```

### 批量操作 Mesh

```javascript
// 获取所有 Mesh
const allMeshes = model.getAllMeshes();

// 批量设置阴影
allMeshes.forEach((mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
});
```

## 交互事件配置 (新增)

`interactiveMeshes` 配置项允许您精确控制哪些 Mesh 对象可以响应鼠标事件（点击、移入、移出等），以优化性能并避免对大量 Mesh 进行不必要的射线拾取检测。

### 配置选项

| 值                   | 类型    | 说明                             | 性能影响     |
| -------------------- | ------- | -------------------------------- | ------------ |
| `false`              | boolean | 禁用所有 Mesh 的事件监听（默认） | 最佳性能     |
| `'*'`                | string  | 启用所有 Mesh 的事件监听         | 性能影响较大 |
| `['mesh1', 'mesh2']` | Array   | 仅对指定名称的 Mesh 启用事件监听 | 推荐方式     |

### 使用示例

#### 1. 禁用所有事件（默认，最佳性能）

```javascript
const model = await scene.add('ModelLoader', {
    url: '/models/building.glb',
    interactiveMeshes: false // 或者省略此配置项
});
```

#### 2. 仅对指定 Mesh 启用事件（推荐）

```javascript
const model = await scene.add('ModelLoader', {
    url: '/models/building.glb',
    interactiveMeshes: ['行政大楼', '办公楼A', '停车场']
});

// 监听事件
model.on('click', (event) => {
    console.log('点击了:', event.object.name);
});
```

#### 3. 对所有 Mesh 启用事件（谨慎使用）

```javascript
const model = await scene.add('ModelLoader', {
    url: '/models/small-object.glb',
    interactiveMeshes: '*' // 当 Mesh 数量 > 50 时会显示性能警告
});
```

### 动态修改交互配置

```javascript
// 运行时修改交互配置
model.setInteractiveMeshes(['新建筑A', '新建筑B']); // 指定 Mesh
model.setInteractiveMeshes('*'); // 启用全部
model.setInteractiveMeshes(false); // 禁用全部

// 检查 Mesh 是否可交互
const isInteractive = model.isMeshInteractive(someMesh);

// 获取当前可交互的对象列表
const interactiveObjects = model.getInteractiveObjects();
```

### 性能最佳实践

1. **默认禁用事件**：对于纯展示的模型，使用默认的 `interactiveMeshes: false`
2. **精确指定**：只对需要交互的关键 Mesh 启用事件，使用 `interactiveMeshes: ['mesh1', 'mesh2']`
3. **避免全量启用**：当模型包含大量 Mesh（> 50 个）时，避免使用 `interactiveMeshes: '*'`
4. **性能监控**：当启用全部 Mesh 事件且数量超过 50 个时，控制台会显示性能警告

### 交互对象管理方法

- `setInteractiveMeshes(config)` - 动态设置可交互的 Mesh
- `getInteractiveObjects()` - 获取可交互的对象列表
- `isMeshInteractive(mesh)` - 检查指定 Mesh 是否可交互
