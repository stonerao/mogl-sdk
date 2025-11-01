<template>
  <div class="property-item" :class="{ 'no-label': !label }">
    <label v-if="label" class="property-label">{{ label }}</label>
    <div class="property-value">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
/**
 * PropertyItem 属性项组件
 * 
 * @description 属性面板中的单个属性项
 */

defineProps({
  label: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.property-item {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 12px;
  align-items: start;
}

.property-item.no-label {
  grid-template-columns: 1fr;
}

.property-label {
  font-size: 13px;
  color: var(--text-secondary);
  padding-top: 4px;
  user-select: none;
}

.property-value {
  width: 100%;
}
</style>

