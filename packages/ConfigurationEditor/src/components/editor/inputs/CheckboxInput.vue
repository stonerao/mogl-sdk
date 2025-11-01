<template>
  <div class="checkbox-input" :class="{ disabled }">
    <label class="checkbox-label">
      <input
        ref="checkboxRef"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        class="checkbox-field"
        @change="handleChange"
      />
      <span class="checkbox-box">
        <span v-if="modelValue" class="checkbox-check">✓</span>
      </span>
      <span v-if="label" class="checkbox-text">{{ label }}</span>
    </label>
  </div>
</template>

<script setup>
import { ref } from 'vue';

/**
 * CheckboxInput 复选框组件
 * 
 * @description 复选框输入
 * @features
 * - 自定义样式
 * - 标签文本
 * - 禁用状态
 */

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// 引用
const checkboxRef = ref(null);

/**
 * 处理变化
 */
const handleChange = (event) => {
  const checked = event.target.checked;
  emit('update:modelValue', checked);
  emit('change', checked);
};
</script>

<style scoped>
.checkbox-input {
  display: inline-flex;
  align-items: center;
}

.checkbox-input.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkbox-input.disabled .checkbox-label {
  cursor: not-allowed;
}

.checkbox-field {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-box {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  transition: all 0.2s;
}

.checkbox-label:hover .checkbox-box {
  border-color: var(--primary-color);
}

.checkbox-field:checked + .checkbox-box {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-field:focus + .checkbox-box {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.checkbox-check {
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-text {
  font-size: 13px;
  color: var(--text-primary);
}
</style>

