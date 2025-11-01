<template>
  <div class="number-input" :class="{ dragging: isDragging }">
    <input
      ref="inputRef"
      type="number"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      class="number-input-field"
      @input="handleInput"
      @keydown="handleKeyDown"
      @focus="handleFocus"
      @blur="handleBlur"
      @mousedown="handleMouseDown"
    />
    <div v-if="showLabel" class="number-input-label">{{ label }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

/**
 * NumberInput 数字输入组件
 * 
 * @description 支持拖拽调整、步进、范围限制的数字输入框
 * @features
 * - 拖拽调整数值（按住鼠标左键拖动）
 * - 键盘快捷键（↑↓ 调整，Shift 加速）
 * - 范围限制（min/max）
 * - 步进值（step）
 * - 精度控制（precision）
 */

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  min: {
    type: Number,
    default: -Infinity
  },
  max: {
    type: Number,
    default: Infinity
  },
  step: {
    type: Number,
    default: 1
  },
  precision: {
    type: Number,
    default: 2
  },
  label: {
    type: String,
    default: ''
  },
  showLabel: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  dragSpeed: {
    type: Number,
    default: 0.1
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'dragStart', 'dragEnd']);

// 引用
const inputRef = ref(null);

// 状态
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartValue = ref(0);
const isFocused = ref(false);

/**
 * 限制数值范围
 */
const clamp = (value) => {
  return Math.max(props.min, Math.min(props.max, value));
};

/**
 * 格式化数值（保留精度）
 */
const formatValue = (value) => {
  return Number(value.toFixed(props.precision));
};

/**
 * 处理输入
 */
const handleInput = (event) => {
  let value = parseFloat(event.target.value);
  
  if (isNaN(value)) {
    value = 0;
  }
  
  value = clamp(value);
  value = formatValue(value);
  
  emit('update:modelValue', value);
  emit('change', value);
};

/**
 * 处理键盘事件
 */
const handleKeyDown = (event) => {
  const multiplier = event.shiftKey ? 10 : 1;
  
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    const newValue = clamp(props.modelValue + props.step * multiplier);
    emit('update:modelValue', formatValue(newValue));
    emit('change', formatValue(newValue));
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    const newValue = clamp(props.modelValue - props.step * multiplier);
    emit('update:modelValue', formatValue(newValue));
    emit('change', formatValue(newValue));
  } else if (event.key === 'Enter') {
    event.target.blur();
  }
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
 * 处理鼠标按下（开始拖拽）
 */
const handleMouseDown = (event) => {
  if (props.disabled || event.button !== 0) return;
  
  // 如果点击的是输入框内部，不启动拖拽
  if (event.target === inputRef.value) {
    return;
  }
  
  event.preventDefault();
  
  isDragging.value = true;
  dragStartX.value = event.clientX;
  dragStartValue.value = props.modelValue;
  
  emit('dragStart', props.modelValue);
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  // 禁用文本选择
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'ew-resize';
};

/**
 * 处理鼠标移动（拖拽中）
 */
const handleMouseMove = (event) => {
  if (!isDragging.value) return;
  
  const deltaX = event.clientX - dragStartX.value;
  const deltaValue = deltaX * props.dragSpeed * props.step;
  const newValue = clamp(dragStartValue.value + deltaValue);
  
  emit('update:modelValue', formatValue(newValue));
  emit('change', formatValue(newValue));
};

/**
 * 处理鼠标释放（结束拖拽）
 */
const handleMouseUp = () => {
  if (!isDragging.value) return;
  
  isDragging.value = false;
  
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  
  // 恢复文本选择
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
  
  emit('dragEnd', props.modelValue);
};
</script>

<style scoped>
.number-input {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.number-input-field {
  width: 100%;
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

.number-input-field:hover {
  border-color: var(--primary-color);
}

.number-input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.number-input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.number-input.dragging .number-input-field {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.number-input-label {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: var(--text-secondary);
  pointer-events: none;
  user-select: none;
}

/* 移除默认的数字输入框箭头 */
.number-input-field::-webkit-inner-spin-button,
.number-input-field::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.number-input-field[type=number] {
  -moz-appearance: textfield;
}
</style>

