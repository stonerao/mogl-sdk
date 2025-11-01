<template>
  <div class="select-input">
    <select
      ref="selectRef"
      :value="modelValue"
      :disabled="disabled"
      class="select-input-field"
      @change="handleChange"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="getOptionValue(option)"
        :value="getOptionValue(option)"
      >
        {{ getOptionLabel(option) }}
      </option>
    </select>
    <span class="select-arrow">▼</span>
  </div>
</template>

<script setup>
import { ref } from 'vue';

/**
 * SelectInput 下拉选择组件
 * 
 * @description 下拉选择框
 * @features
 * - 支持对象和字符串选项
 * - 占位符
 * - 禁用状态
 */

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// 引用
const selectRef = ref(null);

/**
 * 获取选项值
 */
const getOptionValue = (option) => {
  if (typeof option === 'object') {
    return option[props.valueKey];
  }
  return option;
};

/**
 * 获取选项标签
 */
const getOptionLabel = (option) => {
  if (typeof option === 'object') {
    return option[props.labelKey];
  }
  return option;
};

/**
 * 处理变化
 */
const handleChange = (event) => {
  const value = event.target.value;
  emit('update:modelValue', value);
  emit('change', value);
};
</script>

<style scoped>
.select-input {
  position: relative;
  width: 100%;
}

.select-input-field {
  width: 100%;
  height: 28px;
  padding: 0 28px 0 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  appearance: none;
  transition: border-color 0.2s;
}

.select-input-field:hover {
  border-color: var(--primary-color);
}

.select-input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.select-input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-arrow {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--text-secondary);
  pointer-events: none;
  user-select: none;
}
</style>

