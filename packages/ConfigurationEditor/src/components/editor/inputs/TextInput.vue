<template>
  <div class="text-input">
    <input
      v-if="!multiline"
      ref="inputRef"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxLength"
      class="text-input-field"
      @input="handleInput"
      @keydown="handleKeyDown"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <textarea
      v-else
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxLength"
      :rows="rows"
      class="text-input-textarea"
      @input="handleInput"
      @keydown="handleKeyDown"
      @focus="handleFocus"
      @blur="handleBlur"
    ></textarea>
    <div v-if="showCount && maxLength" class="text-input-count">
      {{ modelValue?.length || 0 }} / {{ maxLength }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

/**
 * TextInput 文本输入组件
 * 
 * @description 支持单行和多行文本输入
 * @features
 * - 单行/多行模式
 * - 字符计数
 * - 最大长度限制
 * - 占位符
 */

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  multiline: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 3
  },
  maxLength: {
    type: Number,
    default: null
  },
  showCount: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'enter']);

// 引用
const inputRef = ref(null);
const textareaRef = ref(null);

// 状态
const isFocused = ref(false);

/**
 * 处理输入
 */
const handleInput = (event) => {
  const value = event.target.value;
  emit('update:modelValue', value);
  emit('change', value);
};

/**
 * 处理键盘事件
 */
const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !props.multiline) {
    event.preventDefault();
    emit('enter', props.modelValue);
    event.target.blur();
  }
};

/**
 * 处理聚焦
 */
const handleFocus = () => {
  isFocused.value = true;
};

/**
 * 处理失焦
 */
const handleBlur = () => {
  isFocused.value = false;
};

/**
 * 聚焦输入框
 */
const focus = () => {
  if (props.multiline) {
    textareaRef.value?.focus();
  } else {
    inputRef.value?.focus();
  }
};

/**
 * 选中所有文本
 */
const selectAll = () => {
  if (props.multiline) {
    textareaRef.value?.select();
  } else {
    inputRef.value?.select();
  }
};

// 暴露方法
defineExpose({
  focus,
  selectAll
});
</script>

<style scoped>
.text-input {
  position: relative;
  width: 100%;
}

.text-input-field,
.text-input-textarea {
  width: 100%;
  padding: 0 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.text-input-field {
  height: 28px;
}

.text-input-textarea {
  padding: 8px;
  resize: vertical;
  min-height: 60px;
}

.text-input-field:hover,
.text-input-textarea:hover {
  border-color: var(--primary-color);
}

.text-input-field:focus,
.text-input-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.text-input-field:disabled,
.text-input-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.text-input-count {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 11px;
  color: var(--text-secondary);
  pointer-events: none;
  user-select: none;
}
</style>

