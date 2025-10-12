# TextureLoader

纹理加载器组件

## 使用示例

```javascript
const texture = await scene.add('TextureLoader', {
    name: 'myTexture',
    url: '/textures/wood.jpg',
    repeat: [2, 2]
});

// 获取纹理对象
const tex = texture.getTexture();
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| url | string | '' | 纹理 URL |
| repeat | array | [1,1] | 重复次数 |
| offset | array | [0,0] | 偏移 |
| rotation | number | 0 | 旋转角度 |

