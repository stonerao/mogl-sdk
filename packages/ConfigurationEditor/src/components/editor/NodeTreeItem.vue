<template>
  <div class="node-tree-item">
    <!-- 节点项 -->
    <div
      class="node-item"
      :class="{
        selected: isSelected,
        hidden: !isVisible,
        locked: isLocked,
        'is-group': isGroup
      }"
      :style="{ paddingLeft: `${depth * 20 + 8}px` }"
      @click="handleClick"
      @dblclick="handleDoubleClick"
      @contextmenu.prevent="handleContextMenu"
      @dragstart="handleDragStart"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      :draggable="!isLocked"
    >
      <!-- 展开/折叠按钮（仅分组节点） -->
      <button
        v-if="isGroup"
        class="expand-btn"
        @click.stop="toggleExpand"
      >
        {{ isExpanded ? '▼' : '▶' }}
      </button>
      <span v-else class="expand-placeholder"></span>

      <!-- 节点图标 -->
      <span class="node-icon">{{ nodeIcon }}</span>

      <!-- 节点名称 -->
      <div class="node-name-wrapper">
        <input
          v-if="isEditing"
          ref="nameInput"
          v-model="editingName"
          type="text"
          class="node-name-input"
          @blur="handleNameBlur"
          @keydown.enter="handleNameSubmit"
          @keydown.esc="handleNameCancel"
          @click.stop
        >
        <span
          v-else
          class="node-name"
          :title="node.nodeName"
        >
          {{ node.nodeName }}
        </span>
        <span class="node-type">{{ typeLabel }}</span>
        <span v-if="isGroup" class="child-count">({{ childCount }})</span>
      </div>

      <!-- 操作按钮 -->
      <div class="node-actions" @click.stop>
        <!-- 可见性切换 -->
        <button
          class="action-btn"
          :class="{ active: isVisible }"
          :title="isVisible ? '隐藏' : '显示'"
          @click="toggleVisibility"
        >
          {{ isVisible ? '👁' : '👁‍🗨' }}
        </button>

        <!-- 锁定切换 -->
        <button
          class="action-btn"
          :class="{ active: isLocked }"
          :title="isLocked ? '解锁' : '锁定'"
          @click="toggleLocked"
        >
          {{ isLocked ? '🔒' : '🔓' }}
        </button>
      </div>
    </div>

    <!-- 子节点（递归渲染） -->
    <div v-if="isGroup && isExpanded && children.length > 0" class="node-children">
      <NodeTreeItem
        v-for="child in children"
        :key="child.uuid"
        :node="child"
        :depth="depth + 1"
        :selected-nodes="selectedNodes"
        :editing-node-id="editingNodeId"
        @node-click="$emit('node-click', $event)"
        @node-dblclick="$emit('node-dblclick', $event)"
        @node-contextmenu="$emit('node-contextmenu', $event)"
        @toggle-visibility="$emit('toggle-visibility', $event)"
        @toggle-locked="$emit('toggle-locked', $event)"
        @start-rename="$emit('start-rename', $event)"
        @submit-rename="$emit('submit-rename', $event)"
        @cancel-rename="$emit('cancel-rename')"
        @toggle-expand="$emit('toggle-expand', $event)"
        @drag-node="$emit('drag-node', $event)"
        @drop-node="$emit('drop-node', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useEditorStore } from '@/store/modules/editor.js';

// Props
const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  depth: {
    type: Number,
    default: 0
  },
  selectedNodes: {
    type: Array,
    default: () => []
  },
  editingNodeId: {
    type: String,
    default: null
  }
});

// Emits
const emit = defineEmits([
  'node-click',
  'node-dblclick',
  'node-contextmenu',
  'toggle-visibility',
  'toggle-locked',
  'start-rename',
  'submit-rename',
  'cancel-rename',
  'toggle-expand',
  'drag-node',
  'drop-node'
]);

// Store
const editorStore = useEditorStore();

// Refs
const nameInput = ref(null);
const editingName = ref('');

// Computed
const isGroup = computed(() => props.node.nodeType === 'group');
const isExpanded = computed(() => props.node.properties?.expanded !== false);
const children = computed(() => props.node.childNodes || []);
const childCount = computed(() => children.value.length);

const isSelected = computed(() => {
  return props.selectedNodes.some(n => n.uuid === props.node.uuid);
});

const isVisible = computed(() => {
  return editorStore.isNodeVisible(props.node.uuid);
});

const isLocked = computed(() => {
  return editorStore.isNodeLocked(props.node.uuid);
});

const isEditing = computed(() => {
  return props.editingNodeId === props.node.uuid;
});

const nodeIcon = computed(() => {
  const icons = {
    'rect': '▭',
    'circle': '○',
    'text': 'T',
    'image': '🖼',
    'group': '📁'
  };
  return icons[props.node.nodeType] || '●';
});

const typeLabel = computed(() => {
  const labels = {
    'rect': '矩形',
    'circle': '圆形',
    'text': '文本',
    'image': '图片',
    'group': '分组'
  };
  return labels[props.node.nodeType] || props.node.nodeType;
});

// Methods
function handleClick(event) {
  emit('node-click', { node: props.node, event });
}

function handleDoubleClick() {
  if (!isLocked.value) {
    emit('node-dblclick', { node: props.node });
  }
}

function handleContextMenu(event) {
  emit('node-contextmenu', { node: props.node, event });
}

function toggleExpand() {
  emit('toggle-expand', { node: props.node });
}

function toggleVisibility() {
  emit('toggle-visibility', { node: props.node });
}

function toggleLocked() {
  emit('toggle-locked', { node: props.node });
}

function handleNameBlur() {
  if (editingName.value.trim()) {
    handleNameSubmit();
  } else {
    handleNameCancel();
  }
}

function handleNameSubmit() {
  emit('submit-rename', {
    node: props.node,
    newName: editingName.value.trim()
  });
}

function handleNameCancel() {
  emit('cancel-rename');
}

function handleDragStart(event) {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('nodeId', props.node.uuid);
  emit('drag-node', { node: props.node, event });
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove('drag-over');
}

function handleDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  
  const draggedNodeId = event.dataTransfer.getData('nodeId');
  emit('drop-node', {
    draggedNodeId,
    targetNode: props.node,
    event
  });
}

// Watch for editing state
watch(() => props.editingNodeId, (newId) => {
  if (newId === props.node.uuid) {
    editingName.value = props.node.nodeName;
    nextTick(() => {
      if (nameInput.value) {
        nameInput.value.focus();
        nameInput.value.select();
      }
    });
  }
});
</script>

<style scoped>
.node-tree-item {
  width: 100%;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.node-item:hover {
  background: var(--hover-bg);
}

.node-item.selected {
  background: var(--primary-color-light);
  border-left: 3px solid var(--primary-color);
}

.node-item.hidden {
  opacity: 0.5;
}

.node-item.locked {
  cursor: not-allowed;
}

.node-item.is-group {
  font-weight: 500;
}

.node-item.drag-over {
  background: var(--primary-color-light);
  border: 2px dashed var(--primary-color);
}

.expand-btn {
  width: 20px;
  height: 20px;
  padding: 0;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.expand-btn:hover {
  color: var(--text-primary);
}

.expand-placeholder {
  width: 20px;
  flex-shrink: 0;
}

.node-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.node-name-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-name {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-name-input {
  width: 100%;
  padding: 2px 4px;
  background: var(--input-bg);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  outline: none;
}

.node-type {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.child-count {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-left: 4px;
}

.node-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.6;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  opacity: 1;
}

.action-btn.active {
  opacity: 1;
}

.node-children {
  width: 100%;
}
</style>

