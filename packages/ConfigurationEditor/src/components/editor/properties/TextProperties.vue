<template>
  <PropertyGroup title="文本属性" :collapsed="false">
    <PropertyItem label="文本内容">
      <TextInput
        :model-value="properties.text"
        :multiline="true"
        :rows="3"
        placeholder="输入文本内容"
        @change="updateProperty('text', $event)"
      />
    </PropertyItem>
    
    <PropertyItem label="字体">
      <SelectInput
        :model-value="properties.fontFamily"
        :options="fontOptions"
        @change="updateProperty('fontFamily', $event)"
      />
    </PropertyItem>
    
    <PropertyItem label="字号">
      <NumberInput
        :model-value="properties.fontSize"
        :min="8"
        :max="200"
        :step="1"
        @change="updateProperty('fontSize', $event)"
      />
    </PropertyItem>
    
    <PropertyItem label="颜色">
      <ColorPicker
        :model-value="properties.color"
        @change="updateProperty('color', $event)"
      />
    </PropertyItem>
    
    <PropertyItem label="对齐">
      <SelectInput
        :model-value="properties.textAlign"
        :options="alignOptions"
        @change="updateProperty('textAlign', $event)"
      />
    </PropertyItem>
    
    <PropertyItem label="行高">
      <NumberInput
        :model-value="properties.lineHeight"
        :min="0.5"
        :max="3"
        :step="0.1"
        :precision="1"
        @change="updateProperty('lineHeight', $event)"
      />
    </PropertyItem>
  </PropertyGroup>
</template>

<script setup>
import { ref, watch } from 'vue';
import PropertyGroup from '../PropertyGroup.vue';
import PropertyItem from '../PropertyItem.vue';
import { NumberInput, ColorPicker, TextInput, SelectInput } from '../inputs';

/**
 * TextProperties 文本属性组件
 * 
 * @description 文本节点的特定属性编辑器
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

// 字体选项
const fontOptions = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Microsoft YaHei', label: '微软雅黑' },
  { value: 'SimSun', label: '宋体' },
  { value: 'SimHei', label: '黑体' }
];

// 对齐选项
const alignOptions = [
  { value: 'left', label: '左对齐' },
  { value: 'center', label: '居中' },
  { value: 'right', label: '右对齐' }
];

// 属性值
const properties = ref({
  text: 'Text',
  fontFamily: 'Arial',
  fontSize: 16,
  color: '#FFFFFF',
  textAlign: 'left',
  lineHeight: 1.2
});

/**
 * 监听节点变化，更新属性值
 */
watch(() => props.nodes, (nodes) => {
  if (nodes.length === 0) return;
  
  const firstNode = nodes[0];
  properties.value = {
    text: firstNode.properties?.text || 'Text',
    fontFamily: firstNode.properties?.fontFamily || 'Arial',
    fontSize: firstNode.properties?.fontSize || 16,
    color: firstNode.properties?.color || '#FFFFFF',
    textAlign: firstNode.properties?.textAlign || 'left',
    lineHeight: firstNode.properties?.lineHeight || 1.2
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

