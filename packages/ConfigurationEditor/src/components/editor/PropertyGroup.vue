<template>
  <div class="property-group" :class="{ collapsed: isCollapsed }">
    <div class="group-header" @click="toggleCollapse">
      <span class="collapse-icon">{{ isCollapsed ? '▶' : '▼' }}</span>
      <span class="group-title">{{ title }}</span>
    </div>
    <div v-show="!isCollapsed" class="group-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

/**
 * PropertyGroup 属性分组组件
 * 
 * @description 属性面板中的可折叠分组
 */

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  collapsed: {
    type: Boolean,
    default: false
  }
});

const isCollapsed = ref(props.collapsed);

watch(() => props.collapsed, (value) => {
  isCollapsed.value = value;
});

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.property-group {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.group-header:hover {
  background: var(--bg-hover);
}

.collapse-icon {
  font-size: 10px;
  color: var(--text-secondary);
  transition: transform 0.2s;
}

.property-group.collapsed .collapse-icon {
  transform: rotate(0deg);
}

.group-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.group-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>

