<template>
  <PropertyGroup title="圆形属性" :collapsed="false">
    <PropertyItem label="半径">
      <NumberInput
        :model-value="properties.radius"
        :min="1"
        :step="1"
        @change="updateProperty('radius', $event)"
      />
    </PropertyItem>
    
    <PropertyItem label="填充颜色">
      <ColorPicker
        :model-value="properties.fillColor"
        @change="updateProperty('fillColor', $event)"
      />
    </PropertyItem>
    
    <PropertyItem label="边框颜色">
      <ColorPicker
        :model-value="properties.strokeColor"
        @change="updateProperty('strokeColor', $event)"
      />
    </PropertyItem>
    
    <PropertyItem label="边框宽度">
      <NumberInput
        :model-value="properties.strokeWidth"
        :min="0"
        :step="1"
        @change="updateProperty('strokeWidth', $event)"
      />
    </PropertyItem>
  </PropertyGroup>
</template>

<script setup>
import { ref, watch } from 'vue';
import PropertyGroup from '../PropertyGroup.vue';
import PropertyItem from '../PropertyItem.vue';
import { NumberInput, ColorPicker } from '../inputs';

/**
 * CircleProperties 圆形属性组件
 * 
 * @description 圆形节点的特定属性编辑器
 */

const props = defineProps({
  nodes: {
    type: Array,
    required: true
  },
  isMultiSelection: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['updateProperty']);

// 属性值
const properties = ref({
  radius: 50,
  fillColor: '#67C23A',
  strokeColor: '#FFFFFF',
  strokeWidth: 0
});

/**
 * 监听节点变化，更新属性值
 */
watch(() => props.nodes, (nodes) => {
  if (nodes.length === 0) return;
  
  const firstNode = nodes[0];
  properties.value = {
    radius: firstNode.properties?.radius || 50,
    fillColor: firstNode.properties?.fillColor || '#67C23A',
    strokeColor: firstNode.properties?.strokeColor || '#FFFFFF',
    strokeWidth: firstNode.properties?.strokeWidth || 0
  };
}, { immediate: true, deep: true });

/**
 * 更新属性
 */
const updateProperty = (key, value) => {
  properties.value[key] = value;
  emit('updateProperty', key, value);
};
</script>

