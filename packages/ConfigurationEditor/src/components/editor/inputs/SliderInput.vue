<template>
  <div class="slider-input">
    <input
      ref="sliderRef"
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      class="slider-field"
      @input="handleInput"
      @change="handleChange"
    />
    <div class="slider-value">{{ displayValue }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

/**
 * SliderInput 滑块组件
 * 
 * @description 滑块输入
 * @features
 * - 范围限制
 * - 步进值
 * - 值显示
 * - 禁用状态
 */

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  },
  precision: {
    type: Number,
    default: 0
  },
  suffix: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// 引用
const sliderRef = ref(null);

// 显示值
const displayValue = computed(() => {
  const value = props.modelValue.toFixed(props.precision);
  return props.suffix ? `${value}${props.suffix}` : value;
});

/**
 * 处理输入
 */
const handleInput = (event) => {
  const value = parseFloat(event.target.value);
  emit('update:modelValue', value);
};

/**
 * 处理变化（拖动结束）
 */
const handleChange = (event) => {
  const value = parseFloat(event.target.value);
  emit('change', value);
};
</script>

<style scoped>
.slider-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-field {
  flex: 1;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.slider-field::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.slider-field::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2);
}

.slider-field::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: var(--primary-color);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.slider-field::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2);
}

.slider-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider-field:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}

.slider-field:disabled::-moz-range-thumb {
  cursor: not-allowed;
}

.slider-value {
  min-width: 50px;
  text-align: right;
  font-size: 13px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: var(--text-secondary);
}
</style>

