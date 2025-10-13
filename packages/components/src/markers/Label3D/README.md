# Label3D

三维标签组件，使用 Canvas 动态生成文字纹理，通过 Sprite 渲染到三维场景中。

## 功能特性

- ✅ Canvas 文字纹理动态生成
- ✅ Sprite 渲染，自动面向相机（Billboard 效果）
- ✅ 自适应尺寸，根据文字内容自动调整
- ✅ 支持背景图片
- ✅ 支持圆角、边框、阴影等样式
- ✅ 完整的事件系统（点击、鼠标移入、鼠标移出）
- ✅ 批量创建和管理标签
- ✅ 动态更新标签内容和样式
- ✅ 性能优化，图片缓存

## 基础用法

```javascript
import { Scene } from '@w3d/core';
import { Label3D } from '@w3d/components';

// 创建场景
const scene = new Scene(container);
scene.init();

// 注册 Label3D 组件
scene.registerComponent('Label3D', Label3D);

// 添加标签
const labels = await scene.add('Label3D', {
    name: 'my-labels',
    labels: [
        {
            id: 'label1',
            label: '标签 1',
            position: { x: 0, y: 5, z: 0 },
            userData: { type: 'building', name: '大楼A' }
        },
        {
            id: 'label2',
            label: '标签 2',
            position: { x: 10, y: 5, z: 0 },
            userData: { type: 'building', name: '大楼B' }
        }
    ]
});

// 监听点击事件
labels.on('click', (event) => {
    const labelId = event.object.userData.labelId;
    const customData = event.object.userData.customData;
    console.log('点击了标签:', labelId, customData);
});

// 监听鼠标移入事件
labels.on('mouseenter', (event) => {
    console.log('鼠标移入标签:', event.object.userData.labelId);
});

// 监听鼠标移出事件
labels.on('mouseleave', (event) => {
    console.log('鼠标移出标签:', event.object.userData.labelId);
});
```

## 配置选项

### 全局配置 (globalConfig)

```javascript
const labels = await scene.add('Label3D', {
    name: 'my-labels',
    globalConfig: {
        fontSize: 32,                      // 字体大小
        fontFamily: 'Arial, sans-serif',   // 字体
        fontWeight: 'normal',              // 字体粗细 (normal, bold, etc.)
        textColor: '#ffffff',              // 文字颜色
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // 背景颜色
        borderColor: '#ffffff',            // 边框颜色
        borderWidth: 2,                    // 边框宽度
        padding: 10,                       // 内边距
        borderRadius: 5,                   // 圆角半径
        backgroundImage: null,             // 背景图片 URL
        billboard: true,                   // 是否始终面向相机
        scale: 1,                          // 整体缩放
        depthTest: true,                   // 是否进行深度测试
        sizeAttenuation: true              // 是否随距离缩放
    },
    labels: [...]
});
```

### 单个标签配置

每个标签可以有自己的配置，会覆盖全局配置：

```javascript
{
    id: 'label1',
    label: '自定义样式标签',
    position: { x: 0, y: 5, z: 0 },
    userData: { custom: 'data' },
    config: {
        fontSize: 48,
        textColor: '#ff0000',
        backgroundColor: 'rgba(255, 255, 0, 0.8)',
        borderColor: '#ff0000',
        borderWidth: 3,
        scale: 1.5
    }
}
```

## API 方法

### createLabel(labelData)

创建单个标签

```javascript
await labels.createLabel({
    id: 'new-label',
    label: '新标签',
    position: { x: 5, y: 5, z: 5 },
    userData: { type: 'marker' }
});
```

### updateLabel(id, updates)

更新标签

```javascript
// 更新文字
await labels.updateLabel('label1', {
    label: '更新后的文字'
});

// 更新位置
await labels.updateLabel('label1', {
    position: { x: 10, y: 10, z: 10 }
});

// 更新配置
await labels.updateLabel('label1', {
    config: {
        fontSize: 48,
        textColor: '#ff0000'
    }
});

// 更新 userData
await labels.updateLabel('label1', {
    userData: { newData: 'value' }
});
```

### removeLabel(id)

移除标签

```javascript
labels.removeLabel('label1');
```

### getLabel(id)

获取标签数据

```javascript
const labelData = labels.getLabel('label1');
console.log(labelData);
```

### getAllLabels()

获取所有标签数据

```javascript
const allLabels = labels.getAllLabels();
console.log(allLabels);
```

### clearLabels()

清除所有标签

```javascript
labels.clearLabels();
```

### showLabel(id) / hideLabel(id)

显示/隐藏标签

```javascript
labels.hideLabel('label1');
labels.showLabel('label1');
```

## 高级用法

### 使用背景图片

```javascript
const labels = await scene.add('Label3D', {
    name: 'image-labels',
    globalConfig: {
        backgroundImage: '/images/label-bg.png',
        borderWidth: 0,
        padding: 15
    },
    labels: [
        {
            id: 'label1',
            label: '带背景图的标签',
            position: { x: 0, y: 5, z: 0 }
        }
    ]
});
```

### 动态交互效果

```javascript
// 鼠标移入时放大
labels.on('mouseenter', (event) => {
    const sprite = event.object;
    sprite.scale.multiplyScalar(1.2);
});

// 鼠标移出时恢复
labels.on('mouseleave', (event) => {
    const sprite = event.object;
    sprite.scale.divideScalar(1.2);
});

// 点击时切换显示/隐藏
labels.on('click', (event) => {
    const labelId = event.object.userData.labelId;
    const sprite = event.object;
    sprite.visible = !sprite.visible;
});
```

### 批量更新

```javascript
// 批量创建标签
const labelData = [
    { id: '1', label: 'A', position: { x: 0, y: 0, z: 0 } },
    { id: '2', label: 'B', position: { x: 5, y: 0, z: 0 } },
    { id: '3', label: 'C', position: { x: 10, y: 0, z: 0 } }
];

await labels.createLabels(labelData);

// 批量更新样式
const allLabels = labels.getAllLabels();
for (const label of allLabels) {
    await labels.updateLabel(label.id, {
        config: { textColor: '#ff0000' }
    });
}
```

## 性能优化

1. **图片缓存**：相同的背景图片只会加载一次
2. **Canvas 缓存**：可以复用相同样式的 Canvas
3. **按需更新**：只在需要时重新生成纹理
4. **深度测试**：可以关闭 `depthTest` 提高性能
5. **尺寸衰减**：可以关闭 `sizeAttenuation` 减少计算

## 注意事项

1. 标签的 `id` 必须唯一
2. 背景图片需要支持 CORS
3. Canvas 尺寸会根据文字内容自动计算
4. Sprite 默认就是 Billboard 效果，始终面向相机
5. 使用 `depthTest: false` 可以让标签始终显示在最前面

## 示例

查看完整示例：`packages/examples/src/views/examples/Label3DDemo.vue`

