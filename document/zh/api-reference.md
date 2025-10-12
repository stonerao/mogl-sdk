# W3D SDK API 参考文档

## 核心类

### Scene

场景类，是整个 SDK 的入口。

#### 构造函数

```javascript
new Scene(container, options);
```

**参数：**

- `container` (string | HTMLElement) - 容器选择器或 DOM 元素
- `options` (Object) - 配置选项
    - `renderer` (Object) - 渲染器配置
    - `camera` (Object) - 相机配置
    - `controls` (Object) - 控制器配置
    - `lights` (Object) - 灯光配置

**示例：**

```javascript
const scene = new Scene('#app', {
    renderer: { antialias: true },
    camera: { position: [0, 100, 200] }
});
```

#### 方法

##### init()

初始化场景。

```javascript
scene.init(): Scene
```

**返回值：** Scene 实例（支持链式调用）

---

##### start()

开始渲染循环。

```javascript
scene.start(): void
```

---

##### stop()

停止渲染循环。

```javascript
scene.stop(): void
```

---

##### add(componentName, config)

添加组件到场景。

```javascript
scene.add(componentName, config): Promise<Component>
```

**参数：**

- `componentName` (string) - 组件名称
- `config` (Object) - 组件配置

**返回值：** Promise<Component> - 组件实例

**示例：**

```javascript
const model = await scene.add('ModelLoader', {
    name: 'robot',
    url: '/models/robot.glb'
});
```

---

##### get(name)

获取组件实例。

```javascript
scene.get(name): Component | null
```

**参数：**

- `name` (string) - 组件名称

**返回值：** Component | null

---

##### remove(name)

移除组件。

```javascript
scene.remove(name): void
```

**参数：**

- `name` (string) - 组件名称

---

##### registerComponent(name, ComponentClass)

注册组件类。

```javascript
scene.registerComponent(name, ComponentClass): void
```

**参数：**

- `name` (string) - 组件名称
- `ComponentClass` (Class) - 组件类

**示例：**

```javascript
scene.registerComponent('MyComponent', MyComponent);
```

---

##### dispose()

销毁场景。

```javascript
scene.dispose(): void
```

#### 属性

- `scene` (THREE.Scene) - Three.js 场景对象
- `renderer` (Renderer) - 渲染器实例
- `camera` (Camera) - 相机实例
- `controls` (Controls) - 控制器实例
- `light` (Light) - 灯光管理器
- `componentManager` (ComponentManager) - 组件管理器
- `eventSystem` (EventSystem) - 事件系统
- `resourceManager` (ResourceManager) - 资源管理器
- `animationManager` (AnimationManager) - 动画管理器
- `isInitialized` (boolean) - 是否已初始化
- `isRunning` (boolean) - 是否正在运行

---

### Renderer

渲染器类，封装 WebGL 渲染器。

#### 方法

##### enableShadow(enabled, type)

启用阴影。

```javascript
renderer.enableShadow(enabled, type): void
```

**参数：**

- `enabled` (boolean) - 是否启用，默认 true
- `type` (number) - 阴影类型，默认 THREE.PCFSoftShadowMap

---

##### enableResize()

启用自动调整大小。

```javascript
renderer.enableResize(): void
```

---

##### disableResize()

禁用自动调整大小。

```javascript
renderer.disableResize(): void
```

---

##### setBackground(color)

设置背景色。

```javascript
renderer.setBackground(color): void
```

**参数：**

- `color` (string | number) - 颜色值

---

##### dispose()

销毁渲染器。

```javascript
renderer.dispose(): void
```

#### 属性

- `instance` (THREE.WebGLRenderer) - Three.js 渲染器实例

---

### Camera

相机类，管理场景相机。

#### 方法

##### setPosition(x, y, z)

设置相机位置。

```javascript
camera.setPosition(x, y, z): void
```

**参数：**

- `x` (number) - X 坐标
- `y` (number) - Y 坐标
- `z` (number) - Z 坐标

---

##### lookAt(x, y, z)

设置相机朝向。

```javascript
camera.lookAt(x, y, z): void
```

**参数：**

- `x` (number) - X 坐标
- `y` (number) - Y 坐标
- `z` (number) - Z 坐标

---

##### getPosition()

获取相机位置。

```javascript
camera.getPosition(): THREE.Vector3
```

**返回值：** THREE.Vector3 - 相机位置

---

##### getDirection()

获取相机方向。

```javascript
camera.getDirection(): THREE.Vector3
```

**返回值：** THREE.Vector3 - 相机方向

#### 属性

- `instance` (THREE.PerspectiveCamera) - Three.js 相机实例

---

### Controls

控制器类，管理轨道控制器。

#### 方法

##### enableAutoRotate(enabled, speed)

启用自动旋转。

```javascript
controls.enableAutoRotate(enabled, speed): void
```

**参数：**

- `enabled` (boolean) - 是否启用，默认 true
- `speed` (number) - 旋转速度，默认 2.0

---

##### setTarget(x, y, z)

设置目标点。

```javascript
controls.setTarget(x, y, z): void
```

**参数：**

- `x` (number) - X 坐标
- `y` (number) - Y 坐标
- `z` (number) - Z 坐标

---

##### reset()

重置控制器。

```javascript
controls.reset(): void
```

#### 属性

- `instance` (OrbitControls) - 轨道控制器实例

---

### Light

灯光类，管理场景灯光。

#### 方法

##### addAmbient(options)

添加环境光。

```javascript
light.addAmbient(options): THREE.AmbientLight
```

**参数：**

- `options` (Object) - 配置选项
    - `color` (string) - 颜色，默认 '#ffffff'
    - `intensity` (number) - 强度，默认 0.5

**返回值：** THREE.AmbientLight - 环境光实例

---

##### addDirectional(options)

添加平行光。

```javascript
light.addDirectional(options): THREE.DirectionalLight
```

**参数：**

- `options` (Object) - 配置选项
    - `color` (string) - 颜色，默认 '#ffffff'
    - `intensity` (number) - 强度，默认 1.0
    - `position` (Array) - 位置，默认 [100, 100, 100]
    - `castShadow` (boolean) - 是否投射阴影，默认 false
    - `shadowMapSize` (number) - 阴影贴图大小，默认 2048

**返回值：** THREE.DirectionalLight - 平行光实例

---

##### addPoint(options)

添加点光源。

```javascript
light.addPoint(options): THREE.PointLight
```

**参数：**

- `options` (Object) - 配置选项
    - `color` (string) - 颜色，默认 '#ffffff'
    - `intensity` (number) - 强度，默认 1.0
    - `distance` (number) - 距离，默认 0
    - `decay` (number) - 衰减，默认 2
    - `position` (Array) - 位置，默认 [0, 100, 0]

**返回值：** THREE.PointLight - 点光源实例

---

##### addSpot(options)

添加聚光灯。

```javascript
light.addSpot(options): THREE.SpotLight
```

**参数：**

- `options` (Object) - 配置选项
    - `color` (string) - 颜色
    - `intensity` (number) - 强度
    - `distance` (number) - 距离
    - `angle` (number) - 角度
    - `penumbra` (number) - 半影
    - `decay` (number) - 衰减
    - `position` (Array) - 位置
    - `target` (Array) - 目标位置

**返回值：** THREE.SpotLight - 聚光灯实例

---

##### get(name)

获取灯光实例。

```javascript
light.get(name): THREE.Light | null
```

---

##### remove(name)

移除灯光。

```javascript
light.remove(name): void
```

---

### Component

组件基类，所有组件的基类。

#### 静态属性

```javascript
static defaultConfig = {}
```

组件的默认配置，子类可以覆盖。

#### 构造函数

```javascript
new Component(scene, config);
```

**参数：**

- `scene` (Scene) - 场景实例
- `config` (Object) - 组件配置

#### 生命周期方法

##### onCreate()

组件创建后调用。

```javascript
onCreate(): void
```

---

##### onBeforeMount()

组件挂载前调用。

```javascript
onBeforeMount(): void
```

---

##### onMounted()

组件挂载完成后调用。

```javascript
onMounted(): void
```

---

##### onUpdate(delta)

每帧更新时调用。

```javascript
onUpdate(delta): void
```

**参数：**

- `delta` (number) - 时间增量（秒）

---

##### onBeforeDispose()

组件销毁前调用。

```javascript
onBeforeDispose(): void
```

---

##### onDispose()

组件销毁时调用。

```javascript
onDispose(): void
```

#### 方法

##### updateConfig(newConfig)

更新组件配置。

```javascript
updateConfig(newConfig): void
```

---

##### on(event, handler)

监听事件。

```javascript
on(event, handler): Component
```

**参数：**

- `event` (string) - 事件名称
- `handler` (Function) - 事件处理函数

**返回值：** Component - 支持链式调用

---

##### off(event, handler)

移除事件监听。

```javascript
off(event, handler): Component
```

---

##### emit(event, data)

触发事件。

```javascript
emit(event, data): Component
```

---

##### show()

显示组件。

```javascript
show(): void
```

---

##### hide()

隐藏组件。

```javascript
hide(): void
```

---

##### dispose()

销毁组件。

```javascript
dispose(): void
```

#### 属性

- `scene` (Scene) - 场景实例
- `config` (Object) - 组件配置
- `name` (string) - 组件名称
- `isMounted` (boolean) - 是否已挂载
- `isDisposed` (boolean) - 是否已销毁

---

### EventSystem

事件系统类，管理场景交互事件。

#### 方法

##### on(eventType, listener)

监听事件。

```javascript
eventSystem.on(eventType, listener): void
```

**参数：**

- `eventType` (string) - 事件类型
- `listener` (Function) - 事件监听器

**示例：**

```javascript
scene.eventSystem.on('click', (event) => {
    console.log('点击对象:', event.object);
    console.log('点击位置:', event.point);
});
```

---

##### off(eventType, listener)

移除事件监听。

```javascript
eventSystem.off(eventType, listener): void
```

---

##### dispose()

销毁事件系统。

```javascript
eventSystem.dispose(): void
```

---

### ResourceManager

资源管理器类，管理资源加载和缓存。

#### 方法

##### load(url, type, loader)

加载资源。

```javascript
resourceManager.load(url, type, loader): Promise
```

**参数：**

- `url` (string) - 资源 URL
- `type` (string) - 资源类型
- `loader` (Function) - 加载器函数

**返回值：** Promise - 加载结果

---

##### get(url)

获取缓存的资源。

```javascript
resourceManager.get(url): any
```

**参数：**

- `url` (string) - 资源 URL

**返回值：** 资源对象

---

##### remove(url)

移除缓存的资源。

```javascript
resourceManager.remove(url): void
```

---

##### clear()

清空缓存。

```javascript
resourceManager.clear(): void
```

---

##### getStats()

获取加载统计。

```javascript
resourceManager.getStats(): Object
```

**返回值：**

- `total` (number) - 总数
- `loaded` (number) - 已加载
- `failed` (number) - 失败数
- `progress` (number) - 进度（0-1）

---

##### on(event, handler)

监听资源加载事件。

```javascript
resourceManager.on(event, handler): void
```

**支持的事件：**

- `resource:load:start` - 加载开始
- `resource:load:progress` - 加载进度
- `resource:load:complete` - 加载完成
- `resource:load:error` - 加载错误

---

### AnimationManager

动画管理器类，管理场景动画。

#### 方法

##### createMixer(object)

创建动画混合器。

```javascript
animationManager.createMixer(object): THREE.AnimationMixer
```

**参数：**

- `object` (THREE.Object3D) - 3D 对象

**返回值：** THREE.AnimationMixer - 动画混合器

---

##### getMixer(object)

获取动画混合器。

```javascript
animationManager.getMixer(object): THREE.AnimationMixer | null
```

---

##### play(object, clip, options)

播放动画。

```javascript
animationManager.play(object, clip, options): THREE.AnimationAction
```

**参数：**

- `object` (THREE.Object3D) - 3D 对象
- `clip` (THREE.AnimationClip) - 动画剪辑
- `options` (Object) - 播放选项
    - `loop` (number) - 循环模式
    - `timeScale` (number) - 时间缩放
    - `weight` (number) - 权重

**返回值：** THREE.AnimationAction - 动画动作

---

##### stop(object)

停止动画。

```javascript
animationManager.stop(object): void
```

---

##### remove(object)

移除动画混合器。

```javascript
animationManager.remove(object): void
```

---

### Tween

补间动画类。

#### 构造函数

```javascript
new Tween(target, to, duration, options);
```

**参数：**

- `target` (Object) - 目标对象
- `to` (Object) - 目标属性
- `duration` (number) - 持续时间（毫秒）
- `options` (Object) - 选项
    - `easing` (string) - 缓动函数
    - `onUpdate` (Function) - 更新回调
    - `onComplete` (Function) - 完成回调

#### 静态方法

##### Tween.to(target, to, duration, options)

创建并启动补间动画。

```javascript
Tween.to(target, to, duration, options): Tween
```

**示例：**

```javascript
Tween.to(object.position, { x: 10, y: 20, z: 30 }, 2000, {
    easing: 'easeInOutQuad',
    onUpdate: (target, progress) => {
        console.log('进度:', progress);
    },
    onComplete: () => {
        console.log('完成');
    }
});
```

#### 缓动函数

支持的缓动函数：

- `linear` - 线性
- `easeInQuad` - 二次缓入
- `easeOutQuad` - 二次缓出
- `easeInOutQuad` - 二次缓入缓出
- `easeInCubic` - 三次缓入
- `easeOutCubic` - 三次缓出
- `easeInOutCubic` - 三次缓入缓出

#### 方法

##### start()

开始动画。

```javascript
tween.start(): void
```

---

##### stop()

停止动画。

```javascript
tween.stop(): void
```

---

### Raycaster

射线拾取器类。

#### 方法

##### raycast(event, objects)

执行射线拾取。

```javascript
raycaster.raycast(event, objects): Array
```

**参数：**

- `event` (MouseEvent) - 鼠标事件
- `objects` (Array) - 要检测的对象数组（可选）

**返回值：** Array - 相交对象数组

---

##### screenToWorld(x, y, z)

屏幕坐标转世界坐标。

```javascript
raycaster.screenToWorld(x, y, z): THREE.Vector3
```

**参数：**

- `x` (number) - 屏幕 X 坐标
- `y` (number) - 屏幕 Y 坐标
- `z` (number) - 深度值（0-1）

**返回值：** THREE.Vector3 - 世界坐标

---

##### worldToScreen(worldPosition)

世界坐标转屏幕坐标。

```javascript
raycaster.worldToScreen(worldPosition): THREE.Vector2
```

**参数：**

- `worldPosition` (THREE.Vector3) - 世界坐标

**返回值：** THREE.Vector2 - 屏幕坐标

---

## 事件类型

### EventTypes

事件类型常量。

```javascript
import { EventTypes } from '@w3d/core';
```

#### 鼠标事件

- `EventTypes.CLICK` - 'click' - 点击事件
- `EventTypes.DOUBLE_CLICK` - 'dblclick' - 双击事件
- `EventTypes.MOUSE_DOWN` - 'mousedown' - 鼠标按下
- `EventTypes.MOUSE_UP` - 'mouseup' - 鼠标抬起
- `EventTypes.MOUSE_MOVE` - 'mousemove' - 鼠标移动
- `EventTypes.MOUSE_ENTER` - 'mouseenter' - 鼠标进入
- `EventTypes.MOUSE_LEAVE` - 'mouseleave' - 鼠标离开

#### 触摸事件

- `EventTypes.TOUCH_START` - 'touchstart' - 触摸开始
- `EventTypes.TOUCH_END` - 'touchend' - 触摸结束
- `EventTypes.TOUCH_MOVE` - 'touchmove' - 触摸移动

#### 组件事件

- `EventTypes.COMPONENT_ADDED` - 'component:added' - 组件添加
- `EventTypes.COMPONENT_REMOVED` - 'component:removed' - 组件移除
- `EventTypes.COMPONENT_UPDATED` - 'component:updated' - 组件更新

#### 资源事件

- `EventTypes.RESOURCE_LOAD_START` - 'resource:load:start' - 资源加载开始
- `EventTypes.RESOURCE_LOAD_PROGRESS` - 'resource:load:progress' - 资源加载进度
- `EventTypes.RESOURCE_LOAD_COMPLETE` - 'resource:load:complete' - 资源加载完成
- `EventTypes.RESOURCE_LOAD_ERROR` - 'resource:load:error' - 资源加载错误

#### 动画事件

- `EventTypes.ANIMATION_START` - 'animation:start' - 动画开始
- `EventTypes.ANIMATION_UPDATE` - 'animation:update' - 动画更新
- `EventTypes.ANIMATION_COMPLETE` - 'animation:complete' - 动画完成
- `EventTypes.ANIMATION_STOP` - 'animation:stop' - 动画停止

#### 场景事件

- `EventTypes.SCENE_READY` - 'scene:ready' - 场景就绪
- `EventTypes.SCENE_RESIZE` - 'scene:resize' - 场景大小调整
- `EventTypes.SCENE_DISPOSE` - 'scene:dispose' - 场景销毁

---

## 配置常量

### defaultConfig

默认配置对象。

```javascript
import { defaultConfig } from '@w3d/core';
```

包含所有模块的默认配置选项。

### 其他常量

```javascript
import {
    VERSION, // SDK 版本
    RenderMode, // 渲染模式
    ShadowType, // 阴影类型
    TextureFilter, // 纹理过滤
    TextureWrap, // 纹理包裹
    BlendMode, // 混合模式
    ComponentState, // 组件状态
    ResourceType, // 资源类型
    LoopMode // 动画循环模式
} from '@w3d/core';
```
