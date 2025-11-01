<template>
  <div class="line-edit-panel">
    <!-- 线条样式 -->
    <PropertyGroup title="线条样式" :collapsed="false">
      <PropertyItem label="颜色">
        <ColorPicker
          :model-value="lineStyle.color"
          @update:model-value="handleStyleChange('color', $event)"
        />
      </PropertyItem>

      <PropertyItem label="线宽">
        <SliderInput
          :model-value="lineStyle.lineWidth"
          :min="1"
          :max="10"
          :step="0.5"
          @update:model-value="handleStyleChange('lineWidth', $event)"
        />
      </PropertyItem>

      <PropertyItem label="线条样式">
        <SelectInput
          :model-value="lineStyle.lineStyle"
          :options="lineStyleOptions"
          @update:model-value="handleStyleChange('lineStyle', $event)"
        />
      </PropertyItem>

      <template v-if="lineStyle.lineStyle === 'dashed'">
        <PropertyItem label="虚线长度">
          <NumberInput
            :model-value="lineStyle.dashSize"
            :min="1"
            :max="20"
            @update:model-value="handleStyleChange('dashSize', $event)"
          />
        </PropertyItem>

        <PropertyItem label="间隙长度">
          <NumberInput
            :model-value="lineStyle.gapSize"
            :min="1"
            :max="20"
            @update:model-value="handleStyleChange('gapSize', $event)"
          />
        </PropertyItem>
      </template>
    </PropertyGroup>

    <!-- 控制点列表 -->
    <PropertyGroup title="控制点" :collapsed="false">
      <div class="points-header">
        <span class="points-count">共 {{ points.length }} 个点</span>
        <button class="add-point-btn" @click="handleAddPoint" title="添加控制点">
          ➕ 添加点
        </button>
      </div>

      <div class="points-list custom-scrollbar">
        <div
          v-for="(point, index) in points"
          :key="index"
          class="point-item"
          :class="{ 'selected': selectedPointIndex === index }"
          @click="handleSelectPoint(index)"
        >
          <div class="point-header">
            <span class="point-index">点 {{ index + 1 }}</span>
            <button
              class="delete-point-btn"
              :disabled="points.length <= 2"
              @click.stop="handleDeletePoint(index)"
              title="删除控制点"
            >
              🗑️
            </button>
          </div>

          <div class="point-coords">
            <div class="coord-group">
              <label>X:</label>
              <NumberInput
                :model-value="point.x"
                :step="1"
                @update:model-value="handlePointChange(index, 'x', $event)"
              />
            </div>

            <div class="coord-group">
              <label>Y:</label>
              <NumberInput
                :model-value="point.y"
                :step="1"
                @update:model-value="handlePointChange(index, 'y', $event)"
              />
            </div>

            <div class="coord-group">
              <label>Z:</label>
              <NumberInput
                :model-value="point.z || 0"
                :step="1"
                @update:model-value="handlePointChange(index, 'z', $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </PropertyGroup>

    <!-- 编辑模式 -->
    <PropertyGroup title="编辑选项" :collapsed="false">
      <PropertyItem label="编辑模式">
        <ToggleSwitch
          :model-value="editMode"
          @update:model-value="handleEditModeChange"
        />
      </PropertyItem>

      <PropertyItem label="手柄大小">
        <SliderInput
          :model-value="handleSize"
          :min="5"
          :max="20"
          :step="1"
          @update:model-value="handleStyleChange('handleSize', $event)"
        />
      </PropertyItem>
    </PropertyGroup>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useEditorStore } from '@/store/modules/editor.js';
import PropertyGroup from './PropertyGroup.vue';
import PropertyItem from './PropertyItem.vue';
import ColorPicker from './inputs/ColorPicker.vue';
import SliderInput from './inputs/SliderInput.vue';
import SelectInput from './inputs/SelectInput.vue';
import NumberInput from './inputs/NumberInput.vue';
import ToggleSwitch from './inputs/ToggleSwitch.vue';

const editorStore = useEditorStore();

// 线条样式选项
const lineStyleOptions = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' }
];

// 线条样式
const lineStyle = ref({
  color: '#409EFF',
  lineWidth: 2,
  lineStyle: 'solid',
  dashSize: 5,
  gapSize: 3
});

// 控制点列表
const points = ref([]);

// 选中的控制点索引
const selectedPointIndex = ref(-1);

// 编辑模式
const editMode = ref(false);

// 手柄大小
const handleSize = ref(10);

// 当前选中的线条节点
const selectedLineNode = computed(() => {
  const selectedNodes = editorStore.selectedNodes;
  if (selectedNodes.length === 1 && selectedNodes[0].nodeType === 'editable-line') {
    return selectedNodes[0];
  }
  return null;
});

/**
 * 监听选中节点变化
 */
watch(selectedLineNode, (node) => {
  if (node) {
    // 更新线条样式
    lineStyle.value = {
      color: node.properties.color || '#409EFF',
      lineWidth: node.properties.lineWidth || 2,
      lineStyle: node.properties.lineStyle || 'solid',
      dashSize: node.properties.dashSize || 5,
      gapSize: node.properties.gapSize || 3
    };

    // 更新控制点列表
    points.value = [...(node.properties.points || [])];

    // 更新编辑模式
    editMode.value = node.properties.editMode || false;

    // 更新手柄大小
    handleSize.value = node.properties.handleSize || 10;

    // 获取选中的控制点索引
    selectedPointIndex.value = node.selectedPointIndex || -1;
  } else {
    // 重置
    points.value = [];
    selectedPointIndex.value = -1;
  }
}, { immediate: true });

/**
 * 处理样式变化
 */
const handleStyleChange = (key, value) => {
  if (!selectedLineNode.value) return;

  // 发射事件到 Canvas 处理（通过命令系统）
  window.dispatchEvent(new CustomEvent('line:update-style', {
    detail: {
      node: selectedLineNode.value,
      style: { [key]: value }
    }
  }));
};

/**
 * 处理控制点变化
 */
const handlePointChange = (index, axis, value) => {
  if (!selectedLineNode.value) return;

  const newPosition = { ...points.value[index], [axis]: value };

  // 发射事件到 Canvas 处理（通过命令系统）
  window.dispatchEvent(new CustomEvent('line:move-point', {
    detail: {
      node: selectedLineNode.value,
      index: index,
      position: newPosition
    }
  }));
};

/**
 * 处理添加控制点
 */
const handleAddPoint = () => {
  if (!selectedLineNode.value) return;

  // 在末尾添加新点（位置为最后一个点向右偏移）
  const lastPoint = points.value[points.value.length - 1];
  const newPosition = {
    x: lastPoint.x + 50,
    y: lastPoint.y,
    z: lastPoint.z || 0
  };

  // 发射事件到 Canvas 处理（通过命令系统）
  window.dispatchEvent(new CustomEvent('line:add-point', {
    detail: {
      node: selectedLineNode.value,
      position: newPosition,
      index: -1 // -1 表示添加到末尾
    }
  }));
};

/**
 * 处理删除控制点
 */
const handleDeletePoint = (index) => {
  if (!selectedLineNode.value) return;
  if (points.value.length <= 2) {
    alert('线条至少需要两个控制点');
    return;
  }

  // 发射事件到 Canvas 处理（通过命令系统）
  window.dispatchEvent(new CustomEvent('line:remove-point', {
    detail: {
      node: selectedLineNode.value,
      index: index
    }
  }));
};

/**
 * 处理选中控制点
 */
const handleSelectPoint = (index) => {
  if (!selectedLineNode.value) return;

  selectedPointIndex.value = index;
  selectedLineNode.value.selectPoint(index);
};

/**
 * 处理编辑模式变化
 */
const handleEditModeChange = (enabled) => {
  if (!selectedLineNode.value) return;

  selectedLineNode.value.setEditMode(enabled);
  editMode.value = enabled;
};
</script>

<style scoped>
.line-edit-panel {
  width: 100%;
}

.points-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.points-count {
  font-size: 12px;
  color: #aaa;
}

.add-point-btn {
  padding: 4px 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.add-point-btn:hover {
  background: var(--primary-hover-color);
}

.points-list {
  max-height: 300px;
  overflow-y: auto;
}

.point-item {
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.point-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.point-item.selected {
  background: rgba(64, 158, 255, 0.2);
  border-color: var(--primary-color);
}

.point-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.point-index {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
}

.delete-point-btn {
  padding: 2px 8px;
  background: rgba(255, 0, 0, 0.2);
  color: #ff4444;
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.delete-point-btn:hover:not(:disabled) {
  background: rgba(255, 0, 0, 0.3);
  border-color: rgba(255, 0, 0, 0.5);
}

.delete-point-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.point-coords {
  display: flex;
  gap: 8px;
}

.coord-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coord-group label {
  font-size: 11px;
  color: #aaa;
}
</style>

