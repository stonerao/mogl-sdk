# GUI 组件库

这是一套用于 mogl.js 示例项目的可复用 GUI 控制面板组件库。

## 特性

- 🎨 统一的视觉风格
- 📦 模块化设计，易于复用
- 🔧 基于 Less 预处理器，支持主题定制
- 💪 TypeScript 友好
- ⚡ 支持 v-model 双向绑定

## 组件列表

### 容器组件

#### GuiPanel
控制面板容器组件

**Props:**
- `title` (String): 面板标题
- `width` (String): 面板宽度，可选值：`narrow`、`normal`、`wide`，默认 `normal`

**示例:**
```vue
<GuiPanel title="场景信息" width="narrow">
  <!-- 内容 -->
</GuiPanel>
```

#### GuiSection
控制区块组件，用于分组相关控件

**Props:**
- `title` (String): 区块标题

**示例:**
```vue
<GuiSection title="相机控制">
  <!-- 控件 -->
</GuiSection>
```

### 表单控件

#### GuiSlider
滑块组件，支持 v-model

**Props:**
- `label` (String, required): 标签文本
- `modelValue` (Number, required): 绑定值
- `min` (Number): 最小值，默认 0
- `max` (Number): 最大值，默认 100
- `step` (Number): 步长，默认 1
- `precision` (Number): 显示精度（小数位数），默认 0
- `suffix` (String): 值后缀，如 `°`、`px` 等

**Events:**
- `update:modelValue`: 值变化时触发
- `change`: 值变化时触发（携带新值）

**示例:**
```vue
<GuiSlider
  label="旋转角度"
  v-model="rotation"
  :min="0"
  :max="360"
  :step="1"
  suffix="°"
/>
```

#### GuiColorPicker
颜色选择器组件

**Props:**
- `label` (String, required): 标签文本
- `modelValue` (String, required): 颜色值（十六进制格式）

**Events:**
- `update:modelValue`: 颜色变化时触发
- `change`: 颜色变化时触发

**示例:**
```vue
<GuiColorPicker
  label="背景颜色"
  v-model="backgroundColor"
/>
```

#### GuiSelect
下拉选择框组件

**Props:**
- `label` (String): 标签文本
- `modelValue` (String | Number, required): 绑定值
- `options` (Array, required): 选项数组，可以是简单数组或对象数组
- `valueKey` (String): 对象数组时的值字段名，默认 `value`
- `labelKey` (String): 对象数组时的标签字段名，默认 `label`

**Events:**
- `update:modelValue`: 选择变化时触发
- `change`: 选择变化时触发

**示例:**
```vue
<!-- 简单数组 -->
<GuiSelect
  label="渲染模式"
  v-model="renderMode"
  :options="['normal', 'wireframe', 'points']"
/>

<!-- 对象数组 -->
<GuiSelect
  label="质量"
  v-model="quality"
  :options="[
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' }
  ]"
/>
```

#### GuiCheckbox
复选框组件

**Props:**
- `label` (String, required): 标签文本
- `modelValue` (Boolean, required): 绑定值
- `id` (String): 自定义 ID

**Events:**
- `update:modelValue`: 状态变化时触发
- `change`: 状态变化时触发

**示例:**
```vue
<GuiCheckbox
  label="启用阴影"
  v-model="enableShadow"
/>
```

### 按钮组件

#### GuiButton
按钮组件

**Props:**
- `label` (String): 按钮文本（也可以使用默认插槽）
- `variant` (String): 按钮样式，可选值：`primary`、`secondary`、`danger`、`warning`，默认 `primary`
- `size` (String): 按钮大小，可选值：`small`、`normal`、`large`，默认 `normal`
- `block` (Boolean): 是否块级按钮，默认 `false`
- `disabled` (Boolean): 是否禁用，默认 `false`

**Events:**
- `click`: 点击时触发

**示例:**
```vue
<GuiButton
  label="重置"
  variant="secondary"
  @click="handleReset"
/>

<GuiButton
  variant="danger"
  size="small"
  @click="handleDelete"
>
  删除
</GuiButton>
```

### 信息展示

#### GuiInfoItem
信息项组件，用于显示键值对信息

**Props:**
- `label` (String, required): 标签文本
- `value` (String | Number, required): 值
- `badge` (Boolean): 是否显示为徽章样式，默认 `false`
- `badgeType` (String): 徽章类型，可选值：`success`、`warning`、`error`，默认 `success`

**示例:**
```vue
<GuiInfoItem label="FPS:" :value="fps" />
<GuiInfoItem label="状态:" value="运行中" badge badgeType="success" />
```

### 加载状态

#### GuiLoading
加载遮罩组件

**Props:**
- `visible` (Boolean): 是否显示，默认 `false`
- `text` (String): 加载文本，默认 `加载中...`
- `showProgress` (Boolean): 是否显示进度条，默认 `false`
- `progress` (Number): 进度值（0-100），默认 0

**示例:**
```vue
<GuiLoading
  :visible="isLoading"
  text="正在加载模型..."
  :showProgress="true"
  :progress="loadProgress"
/>
```

## 完整示例

```vue
<template>
  <div class="scene-container">
    <div ref="sceneContainer"></div>
    
    <GuiPanel title="控制面板">
      <!-- 信息展示 -->
      <GuiSection title="场景信息">
        <GuiInfoItem label="FPS:" :value="fps" />
        <GuiInfoItem label="对象数量:" :value="objectCount" />
      </GuiSection>
      
      <!-- 控件 -->
      <GuiSection title="相机控制">
        <GuiSlider
          label="FOV"
          v-model="fov"
          :min="30"
          :max="120"
          suffix="°"
        />
        <GuiSlider
          label="距离"
          v-model="distance"
          :min="1"
          :max="50"
          :step="0.1"
          :precision="1"
        />
      </GuiSection>
      
      <!-- 选项 -->
      <GuiSection title="渲染设置">
        <GuiSelect
          label="渲染模式"
          v-model="renderMode"
          :options="['normal', 'wireframe', 'points']"
        />
        <GuiColorPicker
          label="背景颜色"
          v-model="backgroundColor"
        />
        <GuiCheckbox
          label="启用阴影"
          v-model="enableShadow"
        />
      </GuiSection>
      
      <!-- 操作按钮 -->
      <GuiSection>
        <div class="button-group">
          <GuiButton label="重置" variant="secondary" @click="reset" />
          <GuiButton label="导出" @click="exportScene" />
        </div>
      </GuiSection>
    </GuiPanel>
    
    <!-- 加载状态 -->
    <GuiLoading
      :visible="isLoading"
      text="加载中..."
      :showProgress="true"
      :progress="loadProgress"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  GuiPanel,
  GuiSection,
  GuiSlider,
  GuiColorPicker,
  GuiSelect,
  GuiCheckbox,
  GuiButton,
  GuiInfoItem,
  GuiLoading
} from '@/components/Gui';

const fps = ref(60);
const objectCount = ref(10);
const fov = ref(45);
const distance = ref(10);
const renderMode = ref('normal');
const backgroundColor = ref('#000000');
const enableShadow = ref(true);
const isLoading = ref(false);
const loadProgress = ref(0);

const reset = () => {
  // 重置逻辑
};

const exportScene = () => {
  // 导出逻辑
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';

.scene-container {
  width: 100%;
  height: 100%;
}
</style>
```

## 样式定制

所有组件都使用 `@/styles/gui.less` 中定义的变量和混合。你可以通过修改这些变量来定制主题：

```less
// 主色调
@primary-color: #00ff88;
@primary-color-dark: #00cc6a;

// 背景色
@background-dark: rgba(30, 30, 30, 0.95);

// 文本颜色
@text-color: #ffffff;

// 边框圆角
@border-radius: 12px;

// 间距
@spacing-lg: 20px;
```

## 注意事项

1. 所有组件都需要引入 `@/styles/gui.less` 样式文件
2. 使用 `lang="less"` 属性来启用 Less 预处理器
3. 组件支持 v-model 双向绑定，也可以使用 `:value` 和 `@change` 事件
4. 建议在 `GuiPanel` 内使用 `GuiSection` 来组织控件，保持结构清晰

