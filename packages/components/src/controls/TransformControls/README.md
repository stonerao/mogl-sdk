# TransformControls

变换控制组件，提供对3D物体的交互式变换控制（平移、旋转、缩放）。

## 功能特性

- ✅ 支持三种变换模式：平移（translate）、旋转（rotate）、缩放（scale）
- ✅ 支持世界坐标系和本地坐标系切换
- ✅ 支持吸附功能（平移、旋转、缩放）
- ✅ 支持单独控制 X、Y、Z 轴的显示
- ✅ 可调节控制器大小
- ✅ 完整的事件系统
- ✅ 自动禁用轨道控制器（拖拽时）
- ✅ 支持动态附加/分离物体

## 基础用法

```javascript
import { Scene } from '@w3d/core';
import { TransformControls } from '@w3d/components';
import * as THREE from 'three';

// 创建场景
const scene = new Scene(container);
scene.init();

// 注册 TransformControls 组件
scene.registerComponent('TransformControls', TransformControls);

// 创建一个立方体
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshStandardMaterial({ color: '#00ff88' });
const cube = new THREE.Mesh(geometry, material);
scene.scene.add(cube);

// 创建变换控制器
const transformControls = await scene.add('TransformControls', {
    name: 'transform',
    mode: 'translate',
    size: 1,
    space: 'world'
});

// 附加到立方体
transformControls.attach(cube);

// 启动场景
scene.start();
```

## 配置选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mode` | `string` | `'translate'` | 变换模式：`'translate'`、`'rotate'`、`'scale'` |
| `size` | `number` | `1` | 控制器大小 |
| `space` | `string` | `'world'` | 坐标空间：`'world'`（世界）、`'local'`（本地） |
| `enabled` | `boolean` | `true` | 是否启用控制器 |
| `showX` | `boolean` | `true` | 是否显示 X 轴 |
| `showY` | `boolean` | `true` | 是否显示 Y 轴 |
| `showZ` | `boolean` | `true` | 是否显示 Z 轴 |
| `translationSnap` | `number\|null` | `null` | 平移吸附值（单位：场景单位） |
| `rotationSnap` | `number\|null` | `null` | 旋转吸附值（单位：弧度） |
| `scaleSnap` | `number\|null` | `null` | 缩放吸附值 |
| `disableOrbitOnDrag` | `boolean` | `true` | 拖拽时是否禁用轨道控制器 |

## API 方法

### attach(object)

附加到3D物体，使其可以被变换控制器控制。

**参数：**
- `object` (THREE.Object3D) - 要控制的3D物体

**示例：**
```javascript
const cube = new THREE.Mesh(geometry, material);
transformControls.attach(cube);
```

### detach()

分离当前控制的物体。

**示例：**
```javascript
transformControls.detach();
```

### setMode(mode)

设置变换模式。

**参数：**
- `mode` (string) - 变换模式：`'translate'`、`'rotate'`、`'scale'`

**示例：**
```javascript
// 切换到平移模式
transformControls.setMode('translate');

// 切换到旋转模式
transformControls.setMode('rotate');

// 切换到缩放模式
transformControls.setMode('scale');
```

### setEnabled(enabled)

启用或禁用控制器。

**参数：**
- `enabled` (boolean) - 是否启用

**示例：**
```javascript
// 启用控制器
transformControls.setEnabled(true);

// 禁用控制器
transformControls.setEnabled(false);
```

### setSpace(space)

设置坐标空间。

**参数：**
- `space` (string) - 坐标空间：`'world'`（世界坐标系）、`'local'`（本地坐标系）

**示例：**
```javascript
// 使用世界坐标系
transformControls.setSpace('world');

// 使用本地坐标系
transformControls.setSpace('local');
```

### setSize(size)

设置控制器大小。

**参数：**
- `size` (number) - 大小值

**示例：**
```javascript
transformControls.setSize(1.5);
```

### setTranslationSnap(snap)

设置平移吸附。

**参数：**
- `snap` (number|null) - 吸附值，`null` 表示禁用吸附

**示例：**
```javascript
// 启用平移吸附，每次移动 1 个单位
transformControls.setTranslationSnap(1);

// 禁用平移吸附
transformControls.setTranslationSnap(null);
```

### setRotationSnap(snap)

设置旋转吸附。

**参数：**
- `snap` (number|null) - 吸附值（弧度），`null` 表示禁用吸附

**示例：**
```javascript
import * as THREE from 'three';

// 启用旋转吸附，每次旋转 15 度
transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));

// 禁用旋转吸附
transformControls.setRotationSnap(null);
```

### setScaleSnap(snap)

设置缩放吸附。

**参数：**
- `snap` (number|null) - 吸附值，`null` 表示禁用吸附

**示例：**
```javascript
// 启用缩放吸附，每次缩放 0.25 倍
transformControls.setScaleSnap(0.25);

// 禁用缩放吸附
transformControls.setScaleSnap(null);
```

### setAxisVisible(axis, show)

设置指定轴的可见性。

**参数：**
- `axis` (string) - 轴名称：`'x'`、`'y'`、`'z'`
- `show` (boolean) - 是否显示

**示例：**
```javascript
// 隐藏 X 轴
transformControls.setAxisVisible('x', false);

// 显示 Y 轴
transformControls.setAxisVisible('y', true);
```

### reset()

重置变换控制器。

**示例：**
```javascript
transformControls.reset();
```

### getMode()

获取当前变换模式。

**返回值：** `string` - 当前模式

**示例：**
```javascript
const mode = transformControls.getMode();
console.log('Current mode:', mode); // 'translate', 'rotate', or 'scale'
```

### getSpace()

获取当前坐标空间。

**返回值：** `string` - 当前空间

**示例：**
```javascript
const space = transformControls.getSpace();
console.log('Current space:', space); // 'world' or 'local'
```

### getAttachedObject()

获取当前附加的物体。

**返回值：** `THREE.Object3D|null` - 附加的物体

**示例：**
```javascript
const object = transformControls.getAttachedObject();
if (object) {
    console.log('Attached object:', object);
}
```

### getControl()

获取底层的 Three.js TransformControls 实例。

**返回值：** `TransformControls` - Three.js TransformControls 实例

**示例：**
```javascript
const control = transformControls.getControl();
// 可以访问 Three.js TransformControls 的所有属性和方法
```

## 事件系统

TransformControls 组件提供了丰富的事件系统，可以监听各种变换操作。

### 事件列表

| 事件名 | 触发时机 | 事件数据 |
|--------|----------|----------|
| `mounted` | 组件挂载完成 | `{ control }` |
| `attached` | 附加到物体 | `{ object }` |
| `detached` | 从物体分离 | `{ object }` |
| `change` | 变换发生改变 | `{ object, control }` |
| `dragging-changed` | 拖拽状态改变 | `{ dragging, object }` |
| `object-change` | 物体变换改变 | `{ object, position, rotation, scale }` |
| `mouse-down` | 鼠标按下 | `{ object }` |
| `mouse-up` | 鼠标抬起 | `{ object }` |
| `mode-changed` | 模式改变 | `{ mode }` |
| `enabled-changed` | 启用状态改变 | `{ enabled }` |
| `space-changed` | 坐标空间改变 | `{ space }` |
| `size-changed` | 大小改变 | `{ size }` |
| `translation-snap-changed` | 平移吸附改变 | `{ snap }` |
| `rotation-snap-changed` | 旋转吸附改变 | `{ snap }` |
| `scale-snap-changed` | 缩放吸附改变 | `{ snap }` |
| `axis-visibility-changed` | 轴可见性改变 | `{ axis, show }` |
| `reset` | 重置 | - |

### 事件监听示例

```javascript
// 监听变换改变
transformControls.on('change', (data) => {
    console.log('Transform changed:', data);
});

// 监听拖拽状态改变
transformControls.on('dragging-changed', (data) => {
    if (data.dragging) {
        console.log('Started dragging');
    } else {
        console.log('Stopped dragging');
    }
});

// 监听物体变换
transformControls.on('object-change', (data) => {
    console.log('Position:', data.position);
    console.log('Rotation:', data.rotation);
    console.log('Scale:', data.scale);
});

// 监听模式改变
transformControls.on('mode-changed', (data) => {
    console.log('Mode changed to:', data.mode);
});
```

## 完整示例

### 示例 1：基础变换控制

```javascript
import { Scene } from '@w3d/core';
import { TransformControls, GridHelper } from '@w3d/components';
import * as THREE from 'three';

// 创建场景
const scene = new Scene(container);
scene.init();

// 添加网格辅助
scene.registerComponent('GridHelper', GridHelper);
await scene.add('GridHelper', {
    name: 'grid',
    size: 20,
    divisions: 20
});

// 创建立方体
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshStandardMaterial({ color: '#00ff88' });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1, 0);
scene.scene.add(cube);

// 创建变换控制器
scene.registerComponent('TransformControls', TransformControls);
const transformControls = await scene.add('TransformControls', {
    name: 'transform',
    mode: 'translate'
});

// 附加到立方体
transformControls.attach(cube);

// 启动场景
scene.start();
```

### 示例 2：键盘快捷键控制

```javascript
// 监听键盘事件
window.addEventListener('keydown', (event) => {
    switch (event.key.toLowerCase()) {
        case 'w':
            // W 键 - 平移模式
            transformControls.setMode('translate');
            break;
        case 'e':
            // E 键 - 旋转模式
            transformControls.setMode('rotate');
            break;
        case 'r':
            // R 键 - 缩放模式
            transformControls.setMode('scale');
            break;
        case 'q':
            // Q 键 - 切换坐标空间
            const currentSpace = transformControls.getSpace();
            transformControls.setSpace(currentSpace === 'world' ? 'local' : 'world');
            break;
        case ' ':
            // 空格键 - 切换启用状态
            const control = transformControls.getControl();
            transformControls.setEnabled(!control.enabled);
            break;
        case 'escape':
            // ESC 键 - 重置
            transformControls.reset();
            break;
    }
});

// Shift 键 - 启用吸附
window.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
        transformControls.setTranslationSnap(1);
        transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
        transformControls.setScaleSnap(0.25);
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
        transformControls.setTranslationSnap(null);
        transformControls.setRotationSnap(null);
        transformControls.setScaleSnap(null);
    }
});
```

### 示例 3：多物体切换

```javascript
// 创建多个物体
const objects = [];

// 立方体
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({ color: '#00ff88' })
);
cube.position.set(-3, 1, 0);
scene.scene.add(cube);
objects.push(cube);

// 球体
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ color: '#ff0088' })
);
sphere.position.set(0, 1, 0);
scene.scene.add(sphere);
objects.push(sphere);

// 圆柱体
const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 2, 32),
    new THREE.MeshStandardMaterial({ color: '#0088ff' })
);
cylinder.position.set(3, 1, 0);
scene.scene.add(cylinder);
objects.push(cylinder);

// 创建变换控制器
const transformControls = await scene.add('TransformControls', {
    name: 'transform'
});

// 默认附加到第一个物体
let currentIndex = 0;
transformControls.attach(objects[currentIndex]);

// 切换物体
function switchObject(index) {
    if (index >= 0 && index < objects.length) {
        currentIndex = index;
        transformControls.attach(objects[currentIndex]);
    }
}

// 数字键 1-3 切换物体
window.addEventListener('keydown', (event) => {
    const num = parseInt(event.key);
    if (num >= 1 && num <= objects.length) {
        switchObject(num - 1);
    }
});
```

## 注意事项

1. **轨道控制器冲突**：默认情况下，拖拽变换控制器时会自动禁用轨道控制器，避免冲突。可以通过 `disableOrbitOnDrag: false` 禁用此行为。

2. **坐标空间**：
   - `world` 模式：变换轴始终对齐世界坐标系
   - `local` 模式：变换轴对齐物体的本地坐标系

3. **吸附功能**：
   - 平移吸附：单位为场景单位
   - 旋转吸附：单位为弧度，使用 `THREE.MathUtils.degToRad()` 转换角度
   - 缩放吸附：缩放倍数

4. **性能优化**：变换控制器会在每次变换时触发渲染，对于复杂场景可能影响性能。

5. **事件清理**：组件销毁时会自动清理所有事件监听器和资源。

## 相关资源

- [Three.js TransformControls 文档](https://threejs.org/docs/#examples/en/controls/TransformControls)
- [Three.js TransformControls 示例](https://threejs.org/examples/#misc_controls_transform)
