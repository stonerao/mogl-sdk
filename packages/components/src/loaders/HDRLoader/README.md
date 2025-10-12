# HDRLoader

HDR 环境贴图加载器组件

## 使用示例

```javascript
const hdr = await scene.add('HDRLoader', {
    name: 'environment',
    url: '/textures/studio.hdr',
    asEnvironment: true,
    asBackground: true
});
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| url | string | '' | HDR 文件 URL |
| asEnvironment | boolean | true | 作为环境贴图 |
| asBackground | boolean | false | 作为背景 |

