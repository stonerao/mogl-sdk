<template>
  <PropertyGroup title="图片属性" :collapsed="false">
    <PropertyItem label="图片URL">
      <TextInput
        :model-value="properties.imageUrl"
        placeholder="输入图片URL"
        @change="updateProperty('imageUrl', $event)"
      />
    </PropertyItem>
    
    <PropertyItem label="宽度">
      <NumberInput
        :model-value="properties.width"
        :min="1"
        :step="1"
        @change="updateProperty('width', $event)"
      />
    </PropertyItem>
    
    <PropertyItem label="高度">
      <NumberInput
        :model-value="properties.height"
        :min="1"
        :step="1"
        @change="updateProperty('height', $event)"
      />
    </PropertyItem>
    
    <PropertyItem label="适应模式">
      <SelectInput
        :model-value="properties.fitMode"
        :options="fitModeOptions"
        @change="updateProperty('fitMode', $event)"
      />
    </PropertyItem>
  </PropertyGroup>
</template>

<script setup>
import { ref, watch } from 'vue';
import PropertyGroup from '../PropertyGroup.vue';
import PropertyItem from '../PropertyItem.vue';
import { NumberInput, TextInput, SelectInput } from '../inputs';

/**
 * ImageProperties 图片属性组件
 * 
 * @description 图片节点的特定属性编辑器
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

// 适应模式选项
const fitModeOptions = [
  { value: 'fill', label: '填充' },
  { value: 'contain', label: '包含' },
  { value: 'cover', label: '覆盖' },
  { value: 'stretch', label: '拉伸' }
];

// 属性值
const properties = ref({
  imageUrl: '',
  width: 200,
  height: 200,
  fitMode: 'contain'
});

/**
 * 监听节点变化，更新属性值
 */
watch(() => props.nodes, (nodes) => {
  if (nodes.length === 0) return;
  
  const firstNode = nodes[0];
  properties.value = {
    imageUrl: firstNode.properties?.imageUrl || '',
    width: firstNode.properties?.width || 200,
    height: firstNode.properties?.height || 200,
    fitMode: firstNode.properties?.fitMode || 'contain'
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

