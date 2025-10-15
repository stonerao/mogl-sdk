# BVHQuery 组件

BVHQuery 是一个基于 BVH（Bounding Volume Hierarchy）的高性能空间查询组件，用于加速射线投射、碰撞检测、最近点查询等空间查询操作。

## 功能特性

- ✅ **射线投射加速** - 比原生 Three.js 快 10-100 倍
- ✅ **最近点查询** - 查找网格上最接近给定点的点
- ✅ **碰撞检测** - 球体、包围盒、几何体碰撞检测
- ✅ **距离查询** - 计算点到网格、几何体间的距离
- ✅ **形状投射** - 自定义空间查询逻辑
- ✅ **动态更新** - 支持顶点位置更新后重新调整 BVH
- ✅ **可视化调试** - BVH 层级结构可视化
- ✅ **性能统计** - 查询时间、节点数量等统计信息

## 基本用法

### 1. 创建 BVHQuery 组件

```javascript
import { Scene } from '@w3d/core';

const scene = new Scene({
    container: document.getElementById('container')
});

// 注册组件
scene.registerComponent('BVHQuery', BVHQuery);

// 创建 BVHQuery 组件
const bvhQuery = await scene.add('BVHQuery', {
    mesh: mesh,                 // 目标网格
    bvhOptions: {
        strategy: 'SAH',        // BVH 构建策略
        maxDepth: 40,           // 最大深度
        maxLeafTris: 10         // 叶节点最大三角形数
    },
    showHelper: true,           // 显示 BVH 可视化
    helperOptions: {
        depth: 10,              // 显示深度
        color: 0x00ff88,        // 颜色
        opacity: 0.3            // 透明度
    }
});
```

### 2. 射线投射

```javascript
// 创建射线
const raycaster = new THREE.Raycaster();
raycaster.setFromCamera(mouse, camera);

// 执行射线投射
const hits = bvhQuery.raycast(raycaster.ray, {
    firstHitOnly: true,         // 只返回最近的交点
    side: THREE.FrontSide,      // 检测面
    near: 0,                    // 最近距离
    far: Infinity               // 最远距离
});

if (hits) {
    console.log('交点:', hits.point);
    console.log('距离:', hits.distance);
    console.log('面索引:', hits.faceIndex);
}
```

### 3. 最近点查询

```javascript
// 查找最近点
const point = new THREE.Vector3(10, 5, 0);
const result = bvhQuery.closestPointToPoint(point, {
    minThreshold: 0,            // 最小阈值
    maxThreshold: Infinity      // 最大阈值
});

if (result) {
    console.log('最近点:', result.point);
    console.log('距离:', result.distance);
    console.log('面索引:', result.faceIndex);
}
```

### 4. 碰撞检测

```javascript
// 球体碰撞检测
const sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 5);
const intersects = bvhQuery.intersectsSphere(sphere);
console.log('是否相交:', intersects);

// 包围盒碰撞检测
const box = new THREE.Box3(
    new THREE.Vector3(-5, -5, -5),
    new THREE.Vector3(5, 5, 5)
);
const intersects = bvhQuery.intersectsBox(box);
console.log('是否相交:', intersects);

// 几何体碰撞检测
const otherGeometry = new THREE.BoxGeometry(10, 10, 10);
const transform = new THREE.Matrix4();
const intersects = bvhQuery.intersectsGeometry(otherGeometry, transform);
console.log('是否相交:', intersects);
```

### 5. 距离查询

```javascript
// 计算点到网格的距离
const point = new THREE.Vector3(10, 5, 0);
const distance = bvhQuery.distanceToPoint(point);
console.log('距离:', distance);

// 计算几何体间的距离
const otherGeometry = new THREE.BoxGeometry(10, 10, 10);
const transform = new THREE.Matrix4();
const distance = bvhQuery.distanceToGeometry(otherGeometry, transform);
console.log('距离:', distance);
```

### 6. 动态更新

```javascript
// 修改顶点位置
const positions = mesh.geometry.attributes.position.array;
positions[0] += 1;
positions[1] += 1;
positions[2] += 1;
mesh.geometry.attributes.position.needsUpdate = true;

// 重新调整 BVH
bvhQuery.refit();

// 或者重新生成 BVH
await bvhQuery.rebuild({
    strategy: 'CENTER'
});
```

### 7. 可视化调试

```javascript
// 创建可视化辅助器
const helper = bvhQuery.createHelper();

// 更新辅助器
bvhQuery.updateHelper({
    depth: 15,
    color: 0xff0000,
    opacity: 0.5
});

// 显示/隐藏辅助器
bvhQuery.toggleHelper(true);
```

### 8. 获取统计信息

```javascript
// 获取 BVH 统计信息
const stats = bvhQuery.getStats();
console.log('节点数量:', stats.nodeCount);
console.log('叶节点数量:', stats.leafNodeCount);
console.log('三角形数量:', stats.triangleCount);
console.log('最后查询时间:', stats.lastQueryTime);
console.log('总查询次数:', stats.totalQueries);
console.log('平均查询时间:', stats.averageQueryTime);
```

## 配置选项

### BVH 构建选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `strategy` | String | `'SAH'` | BVH 构建策略：`'CENTER'`、`'AVERAGE'`、`'SAH'` |
| `maxDepth` | Number | `40` | 最大深度 |
| `maxLeafTris` | Number | `10` | 叶节点最大三角形数 |
| `verbose` | Boolean | `true` | 打印警告 |
| `setBoundingBox` | Boolean | `true` | 设置包围盒 |

### 辅助器选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `depth` | Number | `10` | 显示深度 |
| `color` | Number | `0x00ff88` | 颜色 |
| `opacity` | Number | `0.3` | 透明度 |
| `displayEdges` | Boolean | `true` | 显示边缘 |

## 事件

### bvhGenerated

BVH 生成完成时触发。

```javascript
bvhQuery.on('bvhGenerated', (data) => {
    console.log('BVH 生成时间:', data.buildTime);
    console.log('统计信息:', data.stats);
});
```

### bvhRefitted

BVH 重新调整完成时触发。

```javascript
bvhQuery.on('bvhRefitted', (data) => {
    console.log('BVH 重新调整时间:', data.refitTime);
});
```

### queryComplete

查询完成时触发。

```javascript
bvhQuery.on('queryComplete', (data) => {
    console.log('查询类型:', data.type);
    console.log('查询结果:', data.result);
    console.log('查询时间:', data.queryTime);
});
```

### error

发生错误时触发。

```javascript
bvhQuery.on('error', (data) => {
    console.error('错误类型:', data.type);
    console.error('错误信息:', data.error);
});
```

## API 参考

### 方法

#### generateBVH()

生成 BVH。

```javascript
await bvhQuery.generateBVH();
```

#### refit(nodeIndices)

重新调整 BVH（顶点更新后）。

- `nodeIndices` (Array|Set) - 需要重新调整的节点索引集合

```javascript
bvhQuery.refit();
```

#### rebuild(options)

重新生成 BVH。

- `options` (Object) - BVH 构建选项

```javascript
await bvhQuery.rebuild({ strategy: 'CENTER' });
```

#### raycast(ray, options)

射线投射。

- `ray` (THREE.Ray) - 射线
- `options` (Object) - 选项
  - `side` (Number) - 检测面（默认：`THREE.FrontSide`）
  - `firstHitOnly` (Boolean) - 只返回最近的交点（默认：`false`）
  - `near` (Number) - 最近距离（默认：`0`）
  - `far` (Number) - 最远距离（默认：`Infinity`）

```javascript
const hits = bvhQuery.raycast(ray, { firstHitOnly: true });
```

#### closestPointToPoint(point, options)

查找最近点。

- `point` (THREE.Vector3) - 查询点
- `options` (Object) - 选项
  - `minThreshold` (Number) - 最小阈值（默认：`0`）
  - `maxThreshold` (Number) - 最大阈值（默认：`Infinity`）

```javascript
const result = bvhQuery.closestPointToPoint(point);
```

#### closestPointToGeometry(geometry, geometryToBvh, options)

查找几何体间最近点。

- `geometry` (THREE.BufferGeometry) - 目标几何体
- `geometryToBvh` (THREE.Matrix4) - 几何体到 BVH 的变换矩阵
- `options` (Object) - 选项

```javascript
const result = bvhQuery.closestPointToGeometry(geometry, transform);
```

#### intersectsSphere(sphere)

球体碰撞检测。

- `sphere` (THREE.Sphere) - 球体

```javascript
const intersects = bvhQuery.intersectsSphere(sphere);
```

#### intersectsBox(box, boxToBvh)

包围盒碰撞检测。

- `box` (THREE.Box3) - 包围盒
- `boxToBvh` (THREE.Matrix4) - 包围盒到 BVH 的变换矩阵

```javascript
const intersects = bvhQuery.intersectsBox(box);
```

#### intersectsGeometry(geometry, geometryToBvh)

几何体碰撞检测。

- `geometry` (THREE.BufferGeometry) - 几何体
- `geometryToBvh` (THREE.Matrix4) - 几何体到 BVH 的变换矩阵

```javascript
const intersects = bvhQuery.intersectsGeometry(geometry, transform);
```

#### shapecast(callbacks)

形状投射（高级查询）。

- `callbacks` (Object) - 回调函数

```javascript
const result = bvhQuery.shapecast({
    intersectsBounds: (box, isLeaf, score, depth) => { ... },
    intersectsTriangle: (triangle, index, contained, depth) => { ... }
});
```

#### distanceToPoint(point)

计算点到网格的距离。

- `point` (THREE.Vector3) - 查询点

```javascript
const distance = bvhQuery.distanceToPoint(point);
```

#### distanceToGeometry(geometry, geometryToBvh)

计算几何体间的距离。

- `geometry` (THREE.BufferGeometry) - 几何体
- `geometryToBvh` (THREE.Matrix4) - 几何体到 BVH 的变换矩阵

```javascript
const distance = bvhQuery.distanceToGeometry(geometry, transform);
```

#### createHelper()

创建可视化辅助器。

```javascript
const helper = bvhQuery.createHelper();
```

#### updateHelper(options)

更新辅助器。

- `options` (Object) - 辅助器选项

```javascript
bvhQuery.updateHelper({ depth: 15, color: 0xff0000 });
```

#### toggleHelper(visible)

显示/隐藏辅助器。

- `visible` (Boolean) - 是否显示

```javascript
bvhQuery.toggleHelper(true);
```

#### getStats()

获取 BVH 统计信息。

```javascript
const stats = bvhQuery.getStats();
```

## 性能优化建议

1. **选择合适的 BVH 构建策略**
   - `CENTER` - 最快，适合快速原型
   - `AVERAGE` - 中等，适合一般场景
   - `SAH` - 最慢但最优，适合复杂场景

2. **调整叶节点三角形数量**
   - 较小的值（如 5-10）适合复杂查询
   - 较大的值（如 15-20）适合简单查询

3. **使用 `firstHitOnly` 选项**
   - 射线投射时只需要最近交点时使用
   - 可以提升 2-5 倍性能

4. **缓存查询结果**
   - 对于静态场景，缓存查询结果可以避免重复计算

5. **使用 `refit()` 而不是 `rebuild()`**
   - 顶点位置更新后使用 `refit()` 更快
   - 只有几何体结构改变时才使用 `rebuild()`

## 注意事项

1. **几何体索引修改**
   - BVH 生成会修改几何体的 index buffer
   - 如果需要保留原始索引，使用 `indirect: true` 选项

2. **动态几何体**
   - 不支持 morph targets 和 skinning
   - 需要使用 `StaticGeometryGenerator` 先烘焙几何体

3. **内存占用**
   - BVH 会占用额外内存（约 10-20%）
   - 大型场景需要注意内存管理

4. **浮点精度**
   - 建议使用 `geometry.center()` 居中几何体
   - 避免几何体过大或偏离原点过远

## 参考资料

- [three-mesh-bvh GitHub](https://github.com/gkjohnson/three-mesh-bvh)
- [three-mesh-bvh 示例](https://gkjohnson.github.io/three-mesh-bvh/example/bundle/)
- [BVH 维基百科](https://en.wikipedia.org/wiki/Bounding_volume_hierarchy)

