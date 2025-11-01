<template>
  <div class="toggle-switch" :class="{ disabled, checked: modelValue }">
    <input
      ref="switchRef"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="switch-field"
      @change="handleChange"
    />
    <span class="switch-track">
      <span class="switch-thumb" />
    </span>
  </div>
</template>

<script setup>
import { ref } from 'vue';

/**
 * ToggleSwitch 开关切换组件
 * 
 * @description iOS 风格的开关切换组件
 * @features
 * - 清晰的视觉反馈
 * - 开启/关闭状态
 * - 禁用状态
 * - 平滑的动画过渡
 * - v-model 支持
 */

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// 引用
const switchRef = ref(null);

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
.toggle-switch {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.toggle-switch.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-field {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-track {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  cursor: pointer;
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 选中状态 */
.toggle-switch.checked .switch-track {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.toggle-switch.checked .switch-thumb {
  left: 24px;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

/* 悬停状态 */
.toggle-switch:not(.disabled):hover .switch-track {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

/* 焦点状态 */
.switch-field:focus + .switch-track {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 禁用状态 */
.toggle-switch.disabled .switch-track {
  cursor: not-allowed;
  opacity: 0.6;
}

.toggle-switch.disabled .switch-thumb {
  cursor: not-allowed;
}
</style>

