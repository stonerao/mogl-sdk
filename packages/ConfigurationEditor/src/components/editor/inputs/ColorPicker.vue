<template>
  <div class="color-picker">
    <div class="color-preview" :style="{ backgroundColor: modelValue }" @click="togglePicker">
      <div class="color-preview-inner"></div>
    </div>
    <input
      ref="inputRef"
      type="text"
      :value="modelValue"
      class="color-input"
      :placeholder="placeholder"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <input
      ref="colorInputRef"
      type="color"
      :value="modelValue"
      class="color-input-native"
      @input="handleColorInput"
    />
    
    <!-- 颜色选择器弹窗 -->
    <div v-if="showPicker" class="color-picker-popup" @click.stop>
      <div class="picker-header">
        <span class="picker-title">选择颜色</span>
        <button class="picker-close" @click="closePicker">✕</button>
      </div>
      
      <div class="picker-body">
        <!-- 预设颜色 -->
        <div class="preset-colors">
          <div
            v-for="color in presetColors"
            :key="color"
            class="preset-color"
            :class="{ active: modelValue === color }"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
          ></div>
        </div>
        
        <!-- 颜色输入 -->
        <div class="color-inputs">
          <div class="input-group">
            <label>HEX</label>
            <input
              type="text"
              :value="modelValue"
              @input="handleInput"
              class="hex-input"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

/**
 * ColorPicker 颜色选择器组件
 * 
 * @description 支持 HEX、RGB、HSL 格式的颜色选择器
 * @features
 * - 颜色预览
 * - 预设颜色
 * - HEX 输入
 * - 原生颜色选择器
 */

const props = defineProps({
  modelValue: {
    type: String,
    default: '#409EFF'
  },
  placeholder: {
    type: String,
    default: '#RRGGBB'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// 引用
const inputRef = ref(null);
const colorInputRef = ref(null);

// 状态
const showPicker = ref(false);
const isFocused = ref(false);

// 预设颜色
const presetColors = [
  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#8B00FF',
  '#FF69B4', '#FFB6C1', '#FFA07A', '#FFD700', '#90EE90', '#87CEEB', '#9370DB',
  '#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF', '#409EFF', '#67C23A',
  '#E6A23C', '#F56C6C', '#909399'
];

/**
 * 验证颜色格式
 */
const isValidColor = (color) => {
  // 支持 HEX 格式 (#RGB 或 #RRGGBB)
  const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  return hexRegex.test(color);
};

/**
 * 格式化颜色值
 */
const formatColor = (color) => {
  if (!color) return '#000000';
  
  // 移除空格
  color = color.trim();
  
  // 如果没有 #，添加 #
  if (!color.startsWith('#')) {
    color = '#' + color;
  }
  
  // 转换为大写
  color = color.toUpperCase();
  
  // 如果是 #RGB 格式，转换为 #RRGGBB
  if (color.length === 4) {
    color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }
  
  return color;
};

/**
 * 处理输入
 */
const handleInput = (event) => {
  let color = event.target.value;
  color = formatColor(color);
  
  if (isValidColor(color)) {
    emit('update:modelValue', color);
    emit('change', color);
  }
};

/**
 * 处理原生颜色选择器输入
 */
const handleColorInput = (event) => {
  const color = event.target.value.toUpperCase();
  emit('update:modelValue', color);
  emit('change', color);
};

/**
 * 处理聚焦
 */
const handleFocus = () => {
  isFocused.value = true;
  inputRef.value?.select();
};

/**
 * 处理失焦
 */
const handleBlur = () => {
  isFocused.value = false;
};

/**
 * 切换颜色选择器
 */
const togglePicker = () => {
  if (props.disabled) return;
  showPicker.value = !showPicker.value;
};

/**
 * 关闭颜色选择器
 */
const closePicker = () => {
  showPicker.value = false;
};

/**
 * 选择颜色
 */
const selectColor = (color) => {
  emit('update:modelValue', color);
  emit('change', color);
  closePicker();
};
</script>

<style scoped>
.color-picker {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-preview {
  width: 32px;
  height: 28px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  transition: border-color 0.2s;
}

.color-preview:hover {
  border-color: var(--primary-color);
}

.color-preview-inner {
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
  opacity: 0.3;
}

.color-input {
  flex: 1;
  height: 28px;
  padding: 0 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: 'Consolas', 'Monaco', monospace;
  transition: border-color 0.2s;
}

.color-input:hover {
  border-color: var(--primary-color);
}

.color-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.color-input-native {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* 颜色选择器弹窗 */
.color-picker-popup {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  width: 240px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
}

.picker-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.picker-close {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 14px;
  transition: background 0.2s;
}

.picker-close:hover {
  background: var(--bg-hover);
}

.picker-body {
  padding: 12px;
}

.preset-colors {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 12px;
}

.preset-color {
  width: 100%;
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-color:hover {
  transform: scale(1.1);
  border-color: var(--primary-color);
}

.preset-color.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.color-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group label {
  width: 40px;
  font-size: 12px;
  color: var(--text-secondary);
}

.hex-input {
  flex: 1;
  height: 24px;
  padding: 0 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.hex-input:focus {
  outline: none;
  border-color: var(--primary-color);
}
</style>

