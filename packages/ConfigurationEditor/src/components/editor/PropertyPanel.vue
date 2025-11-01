<template>
  <div class="property-panel">
    <!-- 工具栏 -->
    <div v-if="hasSelection" class="property-toolbar">
      <button class="toolbar-btn" @click="copyProperties" title="复制属性">
        📋 复制
      </button>
      <button class="toolbar-btn" :disabled="!hasClipboard" @click="pasteProperties" title="粘贴属性">
        📄 粘贴
      </button>
      <button class="toolbar-btn" @click="toggleSearch" title="搜索属性">
        🔍 搜索
      </button>
    </div>

    <!-- 搜索框 -->
    <div v-if="showSearch && hasSelection" class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索属性..."
        @input="handleSearch"
      />
      <button v-if="searchQuery" class="clear-btn" @click="clearSearch">✕</button>
    </div>

    <!-- 未选中提示 -->
    <div v-if="!hasSelection" class="empty-state">
      <span class="empty-icon">📋</span>
      <p class="empty-text">请选择一个节点</p>
    </div>

    <!-- 多选提示 -->
    <div v-else-if="selectedNodes.length > 1" class="multi-selection-info">
      <div class="info-header">
        <span class="info-icon">📦</span>
        <span class="info-text">已选中 {{ selectedNodes.length }} 个节点</span>
      </div>
      <p class="info-desc">可以批量编辑共同属性</p>
    </div>

    <!-- 属性编辑区域 -->
    <div v-if="hasSelection" class="property-groups custom-scrollbar">
      <!-- 节点信息组 -->
      <PropertyGroup title="节点信息" :collapsed="false">
        <PropertyItem label="名称">
          <TextInput
            :model-value="nodeName"
            placeholder="节点名称"
            @update:model-value="handleNameChange"
          />
        </PropertyItem>
        <PropertyItem label="类型">
          <div class="property-value-text">{{ nodeType }}</div>
        </PropertyItem>
        <PropertyItem v-if="isMultiSelection" label="数量">
          <div class="property-value-text">{{ selectedNodes.length }} 个节点</div>
        </PropertyItem>
      </PropertyGroup>

      <!-- 变换属性组 -->
      <PropertyGroup title="变换" :collapsed="false">
        <!-- 位置 -->
        <PropertyItem label="位置">
          <div class="property-row">
            <NumberInput
              :model-value="transform.position.x"
              :step="1"
              label="X"
              show-label
              @change="handleTransformChange('position', 'x', $event)"
            />
            <NumberInput
              :model-value="transform.position.y"
              :step="1"
              label="Y"
              show-label
              @change="handleTransformChange('position', 'y', $event)"
            />
            <NumberInput
              :model-value="transform.position.z"
              :step="1"
              label="Z"
              show-label
              @change="handleTransformChange('position', 'z', $event)"
            />
          </div>
        </PropertyItem>

        <!-- 旋转 -->
        <PropertyItem label="旋转">
          <div class="property-row">
            <NumberInput
              :model-value="transform.rotation.x"
              :step="1"
              :min="-360"
              :max="360"
              label="X"
              show-label
              @change="handleTransformChange('rotation', 'x', $event)"
            />
            <NumberInput
              :model-value="transform.rotation.y"
              :step="1"
              :min="-360"
              :max="360"
              label="Y"
              show-label
              @change="handleTransformChange('rotation', 'y', $event)"
            />
            <NumberInput
              :model-value="transform.rotation.z"
              :step="1"
              :min="-360"
              :max="360"
              label="Z"
              show-label
              @change="handleTransformChange('rotation', 'z', $event)"
            />
          </div>
        </PropertyItem>

        <!-- 缩放 -->
        <PropertyItem label="缩放">
          <div class="property-row">
            <NumberInput
              :model-value="transform.scale.x"
              :step="0.1"
              :min="0.01"
              :precision="2"
              label="X"
              show-label
              @change="handleTransformChange('scale', 'x', $event)"
            />
            <NumberInput
              :model-value="transform.scale.y"
              :step="0.1"
              :min="0.01"
              :precision="2"
              label="Y"
              show-label
              @change="handleTransformChange('scale', 'y', $event)"
            />
            <NumberInput
              :model-value="transform.scale.z"
              :step="0.1"
              :min="0.01"
              :precision="2"
              label="Z"
              show-label
              @change="handleTransformChange('scale', 'z', $event)"
            />
          </div>
        </PropertyItem>

        <!-- 重置按钮 -->
        <PropertyItem>
          <button class="reset-button" @click="resetTransform">
            🔄 重置变换
          </button>
        </PropertyItem>
      </PropertyGroup>

      <!-- 节点特定属性组 -->
      <component
        :is="nodePropertyComponent"
        v-if="nodePropertyComponent"
        :nodes="selectedNodes"
        :is-multi-selection="isMultiSelection"
        @update-property="handlePropertyUpdate"
      />

      <!-- 显示属性组 -->
      <PropertyGroup title="显示" :collapsed="true">
        <PropertyItem label="可见">
          <CheckboxInput
            :model-value="displayProps.visible"
            @update:model-value="handleDisplayChange('visible', $event)"
          />
        </PropertyItem>
        <PropertyItem label="锁定">
          <CheckboxInput
            :model-value="displayProps.locked"
            @update:model-value="handleDisplayChange('locked', $event)"
          />
        </PropertyItem>
        <PropertyItem label="不透明度">
          <SliderInput
            :model-value="displayProps.opacity"
            :min="0"
            :max="1"
            :step="0.01"
            :precision="2"
            @change="handleDisplayChange('opacity', $event)"
          />
        </PropertyItem>
      </PropertyGroup>

      <!-- 状态配置组 -->
      <PropertyGroup
        v-if="nodeSupportsStates"
        title="状态配置"
        :collapsed="true"
      >
        <StateConfigPanel :node="firstSelectedNode" />
      </PropertyGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useEditorStore } from '@/store';
import { useProjectStore } from '@/store/modules/project.js';
import PropertyGroup from './PropertyGroup.vue';
import PropertyItem from './PropertyItem.vue';
import { NumberInput, ColorPicker, TextInput, SelectInput, CheckboxInput, SliderInput } from './inputs';

// 导入节点特定属性组件
import RectProperties from './properties/RectProperties.vue';
import CircleProperties from './properties/CircleProperties.vue';
import TextProperties from './properties/TextProperties.vue';
import ImageProperties from './properties/ImageProperties.vue';
import GroupProperties from './properties/GroupProperties.vue';
import LineEditPanel from './LineEditPanel.vue';
import StateConfigPanel from './StateConfigPanel.vue';
// import NetworkElementProperties from './NetworkElementProperties.vue';
// import DevicesProperties from './DevicesProperties.vue';

/**
 * PropertyPanel 属性面板组件
 *
 * @description 通用属性面板，支持单选和多选节点的属性编辑
 * @features
 * - 节点信息编辑
 * - 变换属性编辑（位置、旋转、缩放）
 * - 节点类型特定属性编辑
 * - 显示属性编辑
 * - 多选节点批量编辑
 * - 撤销/重做支持
 */

// Store
const editorStore = useEditorStore();
const projectStore = useProjectStore();
const { hasSelection, selectedNodes, firstSelectedNode } = storeToRefs(editorStore);

// 状态
const nodeName = ref('');
const nodeType = ref('');
const transform = ref({
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 }
});
const displayProps = ref({
  visible: true,
  locked: false,
  opacity: 1
});

// 高级功能状态
const showSearch = ref(false);
const searchQuery = ref('');
const clipboard = ref(null);
const hasClipboard = computed(() => clipboard.value !== null);

// 是否多选
const isMultiSelection = computed(() => selectedNodes.value.length > 1);

// 节点特定属性组件
const nodePropertyComponent = computed(() => {
  if (isMultiSelection.value) {
    // 多选时，检查是否所有节点类型相同
    const types = new Set(selectedNodes.value.map(n => n.nodeType));
    if (types.size > 1) {
      return null; // 类型不同，不显示特定属性
    }
  }

  const type = firstSelectedNode.value?.nodeType;
  const componentMap = {
    'rect': RectProperties,
    'circle': CircleProperties,
    'text': TextProperties,
    'image': ImageProperties,
    'group': GroupProperties,
    'editable-line': LineEditPanel,
    // 'network-element': NetworkElementProperties,
    // 'devices': DevicesProperties
  };

  return componentMap[type] || null;
});

// 节点是否支持状态
const nodeSupportsStates = computed(() => {
  if (!firstSelectedNode.value) return false;

  // 检查节点是否有 getStates 方法
  if (typeof firstSelectedNode.value.getStates !== 'function') {
    return false;
  }

  // 检查节点是否有状态配置
  const states = firstSelectedNode.value.getStates();
  return states && states.length > 0;
});

/**
 * 重置状态
 */
const resetState = () => {
  nodeName.value = '';
  nodeType.value = '';
  transform.value = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  };
  displayProps.value = {
    visible: true,
    locked: false,
    opacity: 1
  };
};


/**
 * 从节点更新变换属性
 */
const updateTransformFromNode = (node) => {
  if (!node) return;

  transform.value = {
    position: {
      x: Number(node.position.x.toFixed(2)),
      y: Number(node.position.y.toFixed(2)),
      z: Number(node.position.z.toFixed(2))
    },
    rotation: {
      x: Number((node.rotation.x * 180 / Math.PI).toFixed(2)),
      y: Number((node.rotation.y * 180 / Math.PI).toFixed(2)),
      z: Number((node.rotation.z * 180 / Math.PI).toFixed(2))
    },
    scale: {
      x: Number(node.scale.x.toFixed(2)),
      y: Number(node.scale.y.toFixed(2)),
      z: Number(node.scale.z.toFixed(2))
    }
  };
};


/**
 * 监听选中节点变化
 */
watch(selectedNodes, (nodes) => {
  if (nodes.length === 0) {
    resetState();
    return;
  }

  const firstNode = nodes[0];

  // 更新节点信息
  if (nodes.length === 1) {
    nodeName.value = firstNode.nodeName || '';
    nodeType.value = firstNode.nodeType || '';
  } else {
    nodeName.value = `${nodes.length} 个节点`;
    nodeType.value = '多选';
  }

  // 更新变换属性
  updateTransformFromNode(firstNode);

  // 更新显示属性
  updateDisplayPropsFromNode(firstNode);
}, { immediate: true, deep: true });



/**
 * 从节点更新显示属性
 */
const updateDisplayPropsFromNode = (node) => {
  if (!node) return;

  displayProps.value = {
    visible: node.visible !== false,
    locked: node.locked === true,
    opacity: node.properties?.opacity || 1
  };
};

/**
 * 处理名称变化
 */
const handleNameChange = (newName) => {
  // 发射事件到 Canvas 处理（通过命令系统）
  window.dispatchEvent(new CustomEvent('property:update-name', {
    detail: { nodes: selectedNodes.value, name: newName }
  }));

  projectStore.markAsDirty();
};

/**
 * 处理变换属性变化
 */
const handleTransformChange = (type, axis, value) => {
  // 发射事件到 Canvas 处理（通过命令系统）
  window.dispatchEvent(new CustomEvent('property:update-transform', {
    detail: {
      nodes: selectedNodes.value,
      type,
      axis,
      value
    }
  }));

  projectStore.markAsDirty();
};

/**
 * 重置变换
 */
const resetTransform = () => {
  window.dispatchEvent(new CustomEvent('property:reset-transform', {
    detail: { nodes: selectedNodes.value }
  }));

  projectStore.markAsDirty();
};

/**
 * 处理属性更新
 */
const handlePropertyUpdate = (propertyKey, value) => {
  window.dispatchEvent(new CustomEvent('property:update', {
    detail: {
      nodes: selectedNodes.value,
      propertyKey,
      value
    }
  }));

  projectStore.markAsDirty();
};

/**
 * 处理显示属性变化
 */
const handleDisplayChange = (key, value) => {
  window.dispatchEvent(new CustomEvent('property:update-display', {
    detail: {
      nodes: selectedNodes.value,
      key,
      value
    }
  }));

  projectStore.markAsDirty();
};

// ========== 高级功能 ==========

/**
 * 复制属性
 */
const copyProperties = () => {
  if (!firstSelectedNode.value) return;

  const node = firstSelectedNode.value;
  clipboard.value = {
    nodeType: node.nodeType,
    properties: { ...node.properties },
    transform: {
      position: { ...node.position },
      rotation: { ...node.rotation },
      scale: { ...node.scale }
    },
    displayProps: {
      visible: node.visible,
      locked: node.locked,
      opacity: node.properties?.opacity || 1
    }
  };

  console.log('已复制属性到剪贴板');
};

/**
 * 粘贴属性
 */
const pasteProperties = () => {
  if (!clipboard.value || selectedNodes.value.length === 0) return;

  const clipboardData = clipboard.value;

  selectedNodes.value.forEach(node => {
    // 粘贴属性（只粘贴相同类型节点的特定属性）
    if (node.nodeType === clipboardData.nodeType) {
      Object.keys(clipboardData.properties).forEach(key => {
        handlePropertyUpdate(key, clipboardData.properties[key]);
      });
    }

    // 粘贴变换属性
    ['x', 'y', 'z'].forEach(axis => {
      handleTransformChange('position', axis, clipboardData.transform.position[axis]);
      handleTransformChange('rotation', axis, clipboardData.transform.rotation[axis] * 180 / Math.PI);
      handleTransformChange('scale', axis, clipboardData.transform.scale[axis]);
    });

    // 粘贴显示属性
    Object.keys(clipboardData.displayProps).forEach(key => {
      handleDisplayChange(key, clipboardData.displayProps[key]);
    });
  });

  console.log('已粘贴属性');
};

/**
 * 切换搜索
 */
const toggleSearch = () => {
  showSearch.value = !showSearch.value;
  if (!showSearch.value) {
    searchQuery.value = '';
  }
};

/**
 * 处理搜索
 */
const handleSearch = () => {
  // 搜索功能可以在未来扩展，用于过滤显示的属性
  console.log('搜索:', searchQuery.value);
};

/**
 * 清除搜索
 */
const clearSearch = () => {
  searchQuery.value = '';
};
</script>

<style scoped>
.property-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 工具栏 */
.property-toolbar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.toolbar-btn {
  flex: 1;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 搜索框 */
.search-box {
  position: relative;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.search-input {
  width: 100%;
  height: 28px;
  padding: 0 32px 0 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.clear-btn {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.property-groups {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.property-value-text {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 4px 0;
}

.reset-button {
  width: 100%;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 多选信息 */
.multi-selection-info {
  padding: 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.info-icon {
  font-size: 18px;
}

.info-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.info-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}
</style>

