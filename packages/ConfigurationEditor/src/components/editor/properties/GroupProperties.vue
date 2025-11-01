<template>
  <PropertyGroup title="分组属性" :collapsed="false">
    <PropertyItem label="分组名称">
      <TextInput
        :model-value="properties.groupName"
        placeholder="分组名称"
        @change="updateProperty('groupName', $event)"
      />
    </PropertyItem>
    
    <PropertyItem label="子节点数">
      <div class="property-value-text">{{ properties.childCount }} 个</div>
    </PropertyItem>
    
    <PropertyItem label="展开状态">
      <CheckboxInput
        :model-value="properties.expanded"
        label="展开"
        @update:model-value="updateProperty('expanded', $event)"
      />
    </PropertyItem>
  </PropertyGroup>
</template>

<script setup>
import { ref, watch } from 'vue';
import PropertyGroup from '../PropertyGroup.vue';
import PropertyItem from '../PropertyItem.vue';
import { TextInput, CheckboxInput } from '../inputs';

/**
 * GroupProperties 分组属性组件
 * 
 * @description 分组节点的特定属性编辑器
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
  groupName: 'Group',
  childCount: 0,
  expanded: true
});

/**
 * 监听节点变化，更新属性值
 */
watch(() => props.nodes, (nodes) => {
  if (nodes.length === 0) return;
  
  const firstNode = nodes[0];
  properties.value = {
    groupName: firstNode.nodeName || 'Group',
    childCount: firstNode.children?.length || 0,
    expanded: firstNode.expanded !== false
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

<style scoped>
.property-value-text {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 4px 0;
}
</style>

