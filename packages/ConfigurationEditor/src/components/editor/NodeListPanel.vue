<template>
  <div class="node-list-panel">
    <!-- 搜索和过滤栏 -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchKeyword"
          type="text"
          class="search-input"
          placeholder="搜索节点（名称/类型/ID）"
          @input="handleSearch"
        >
        <button
          v-if="searchKeyword"
          class="clear-btn"
          @click="clearSearch"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- 过滤器和工具栏 -->
    <div class="filters">
      <select
        v-model="typeFilter"
        class="filter-select"
        @change="handleTypeFilter"
      >
        <option value="all">所有类型</option>
        <option
          v-for="type in nodeTypes"
          :key="type"
          :value="type"
        >
          {{ getTypeLabel(type) }}
        </option>
      </select>

      <select
        v-model="statusFilter"
        class="filter-select"
        @change="handleStatusFilter"
      >
        <option value="all">所有状态</option>
        <option value="visible">可见</option>
        <option value="hidden">隐藏</option>
        <option value="locked">锁定</option>
        <option value="unlocked">未锁定</option>
      </select>

      <button
        class="create-group-btn"
        title="创建分组"
        @click="handleCreateGroup"
      >
        📁+
      </button>
    </div>

    <!-- 节点列表（树形结构） -->
    <div class="node-list custom-scrollbar">
      <div v-if="rootNodes.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p class="empty-text">{{ emptyMessage }}</p>
      </div>

      <NodeTreeItem
        v-for="node in rootNodes"
        :key="node.uuid"
        :node="node"
        :depth="0"
        :selected-nodes="editorStore.selectedNodes"
        :editing-node-id="editingNodeId"
        @node-click="handleNodeClick"
        @node-dblclick="handleNodeDoubleClick"
        @node-contextmenu="handleNodeContextMenu"
        @toggle-visibility="handleToggleVisibility"
        @toggle-locked="handleToggleLocked"
        @start-rename="handleStartRename"
        @submit-rename="handleSubmitRename"
        @cancel-rename="handleCancelRename"
        @toggle-expand="handleToggleExpand"
        @drag-node="handleDragNode"
        @drop-node="handleDropNode"
      />
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{
        left: contextMenu.x + 'px',
        top: contextMenu.y + 'px'
      }"
      @click="closeContextMenu"
    >
      <div class="menu-item" @click="handleRename">
        <span class="menu-icon">✏️</span>
        <span class="menu-label">重命名</span>
      </div>
      <div class="menu-item" @click="handleDuplicate">
        <span class="menu-icon">📋</span>
        <span class="menu-label">复制</span>
      </div>
      <div class="menu-divider"></div>

      <!-- 分组相关菜单 -->
      <div v-if="hasMultipleSelected" class="menu-item" @click="handleGroupNodes">
        <span class="menu-icon">📁</span>
        <span class="menu-label">创建分组</span>
      </div>
      <div v-if="isGroupNode" class="menu-item" @click="handleUngroupNodes">
        <span class="menu-icon">📂</span>
        <span class="menu-label">解散分组</span>
      </div>
      <div v-if="hasMultipleSelected || isGroupNode" class="menu-divider"></div>

      <div class="menu-item" @click="handleDelete">
        <span class="menu-icon">🗑️</span>
        <span class="menu-label">删除</span>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-item" @click="handleFocusNode">
        <span class="menu-icon">🎯</span>
        <span class="menu-label">聚焦到节点</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '../../store/modules/editor.js';
import { RenameNodeCommand } from '../../core/history/RenameNodeCommand.js';
import NodeTreeItem from './NodeTreeItem.vue';

// ========== Store ==========
const editorStore = useEditorStore();

// ========== 响应式数据 ==========
const searchKeyword = ref('');
const typeFilter = ref('all');
const statusFilter = ref('all');
const editingNodeId = ref(null);
const editingName = ref('');
const nameInput = ref(null);

// 右键菜单
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  node: null
});

// ========== 计算属性 ==========
const filteredNodes = computed(() => editorStore.filteredNodes);
const nodeTypes = computed(() => editorStore.nodeTypes);

// 根节点（没有父节点或父节点是场景的节点）
const rootNodes = computed(() => {
  return filteredNodes.value.filter(node => {
    // 如果节点有 parent 属性且 parent 不是场景，则不是根节点
    if (node.parent && node.parent.nodeType) {
      return false;
    }
    return true;
  });
});

const emptyMessage = computed(() => {
  if (searchKeyword.value) {
    return '未找到匹配的节点';
  }
  if (typeFilter.value !== 'all' || statusFilter.value !== 'all') {
    return '没有符合条件的节点';
  }
  return '画布上还没有节点';
});

// 是否有多个选中的节点
const hasMultipleSelected = computed(() => {
  return editorStore.selectedNodes.length > 1;
});

// 当前右键菜单的节点是否是分组
const isGroupNode = computed(() => {
  return contextMenu.value.node?.nodeType === 'group';
});

// ========== 方法 ==========

/**
 * 获取节点类型标签
 */
function getTypeLabel(type) {
  const labels = {
    rect: '矩形',
    circle: '圆形',
    text: '文本',
    image: '图片',
    group: '组'
  };
  return labels[type] || type;
}

/**
 * 获取节点图标
 */
function getNodeIcon(type) {
  const icons = {
    rect: '▭',
    circle: '○',
    text: 'T',
    image: '🖼',
    group: '📁'
  };
  return icons[type] || '●';
}

/**
 * 检查节点是否选中
 */
function isNodeSelected(node) {
  return editorStore.selectedNodes.some(n => n.uuid === node.uuid);
}

/**
 * 检查节点是否可见
 */
function isNodeVisible(nodeId) {
  return editorStore.isNodeVisible(nodeId);
}

/**
 * 检查节点是否锁定
 */
function isNodeLocked(nodeId) {
  return editorStore.isNodeLocked(nodeId);
}

/**
 * 处理搜索
 */
function handleSearch() {
  editorStore.setNodeSearchKeyword(searchKeyword.value);
}

/**
 * 清空搜索
 */
function clearSearch() {
  searchKeyword.value = '';
  editorStore.setNodeSearchKeyword('');
}

/**
 * 处理类型过滤
 */
function handleTypeFilter() {
  editorStore.setNodeTypeFilter(typeFilter.value);
}

/**
 * 处理状态过滤
 */
function handleStatusFilter() {
  editorStore.setNodeStatusFilter(statusFilter.value);
}

/**
 * 处理范围选择
 */
function handleRangeSelection(node) {
  const selectedNodes = editorStore.selectedNodes;
  if (selectedNodes.length === 0) {
    editorStore.selectNode(node);
    return;
  }

  const lastSelected = selectedNodes[selectedNodes.length - 1];
  const startIndex = filteredNodes.value.findIndex(n => n.uuid === lastSelected.uuid);
  const endIndex = filteredNodes.value.findIndex(n => n.uuid === node.uuid);

  if (startIndex === -1 || endIndex === -1) {
    return;
  }

  const start = Math.min(startIndex, endIndex);
  const end = Math.max(startIndex, endIndex);
  const rangeNodes = filteredNodes.value.slice(start, end + 1);

  editorStore.selectNode(rangeNodes);
}

/**
 * 开始重命名
 */
function startRenaming(node) {
  editingNodeId.value = node.uuid;
  editingName.value = node.nodeName;

  nextTick(() => {
    if (nameInput.value && nameInput.value[0]) {
      nameInput.value[0].focus();
      nameInput.value[0].select();
    }
  });
}

/**
 * 处理名称提交
 */
function handleNameSubmit() {
  if (!editingNodeId.value) return;

  const node = filteredNodes.value.find(n => n.uuid === editingNodeId.value);
  if (!node) return;

  const newName = editingName.value.trim();
  const oldName = node.nodeName;

  // 验证名称
  if (!newName) {
    alert('节点名称不能为空');
    return;
  }

  // 检查名称是否重复
  const isDuplicate = editorStore.allNodes.some(
    n => n.uuid !== node.uuid && n.nodeName === newName
  );
  if (isDuplicate) {
    alert('节点名称已存在');
    return;
  }

  // 如果名称没有变化，直接取消编辑
  if (newName === oldName) {
    cancelRenaming();
    return;
  }

  // 创建重命名命令
  const command = new RenameNodeCommand(node, newName, oldName);

  // 触发自定义事件，由 Canvas 组件执行命令
  window.dispatchEvent(new CustomEvent('nodelist:rename', {
    detail: { command }
  }));

  cancelRenaming();
}

/**
 * 处理名称失焦
 */
function handleNameBlur() {
  // 延迟执行，避免与 Enter 键冲突
  setTimeout(() => {
    if (editingNodeId.value) {
      handleNameSubmit();
    }
  }, 100);
}

/**
 * 处理名称取消
 */
function handleNameCancel() {
  cancelRenaming();
}

/**
 * 取消重命名
 */
function cancelRenaming() {
  editingNodeId.value = null;
  editingName.value = '';
}

/**
 * 切换可见性
 */
function toggleVisibility(node) {
  editorStore.toggleNodeVisibility(node.uuid);

  // 触发自定义事件，通知 Canvas 组件
  window.dispatchEvent(new CustomEvent('nodelist:visibility', {
    detail: { nodeId: node.uuid, visible: isNodeVisible(node.uuid) }
  }));
}

/**
 * 切换锁定
 */
function toggleLocked(node) {
  editorStore.toggleNodeLocked(node.uuid);

  // 触发自定义事件，通知 Canvas 组件
  window.dispatchEvent(new CustomEvent('nodelist:locked', {
    detail: { nodeId: node.uuid, locked: isNodeLocked(node.uuid) }
  }));
}



/**
 * 关闭右键菜单
 */
function closeContextMenu() {
  contextMenu.value.visible = false;
}

/**
 * 处理重命名
 */
function handleRename() {
  if (contextMenu.value.node) {
    startRenaming(contextMenu.value.node);
  }
}

/**
 * 处理复制
 */
function handleDuplicate() {
  window.dispatchEvent(new CustomEvent('nodelist:duplicate'));
}

/**
 * 处理删除
 */
function handleDelete() {
  window.dispatchEvent(new CustomEvent('nodelist:delete'));
}

/**
 * 处理聚焦到节点
 */
function handleFocusNode() {
  if (contextMenu.value.node) {
    window.dispatchEvent(new CustomEvent('nodelist:focus', {
      detail: { node: contextMenu.value.node }
    }));
  }
}

/**
 * 创建分组
 */
function handleCreateGroup() {
  window.dispatchEvent(new CustomEvent('nodelist:create-group'));
}

/**
 * 将选中的节点添加到分组
 */
function handleGroupNodes() {
  window.dispatchEvent(new CustomEvent('nodelist:group-nodes'));
}

/**
 * 解散分组
 */
function handleUngroupNodes() {
  if (contextMenu.value.node) {
    window.dispatchEvent(new CustomEvent('nodelist:ungroup-nodes', {
      detail: { group: contextMenu.value.node }
    }));
  }
}

/**
 * 切换展开/折叠
 */
function handleToggleExpand({ node }) {
  if (node && node.setProperty) {
    const expanded = node.properties?.expanded !== false;
    node.setProperty('expanded', !expanded);
  }
}

/**
 * 处理拖拽节点
 */
function handleDragNode({ node, event }) {
  // 拖拽开始
  console.log('开始拖拽节点:', node.nodeName);
}

/**
 * 处理放置节点
 */
function handleDropNode({ draggedNodeId, targetNode, event }) {
  window.dispatchEvent(new CustomEvent('nodelist:drop-node', {
    detail: { draggedNodeId, targetNode }
  }));
}

/**
 * 处理节点点击（从树形组件）
 */
function handleNodeClick({ node, event }) {
  // 检查节点是否锁定
  if (isNodeLocked(node.uuid)) {
    return;
  }

  const isMac = navigator.userAgent.indexOf('Mac') !== -1;
  const ctrlKey = isMac ? event.metaKey : event.ctrlKey;
  const shiftKey = event.shiftKey;

  if (ctrlKey) {
    // Ctrl/Cmd + 点击：多选
    editorStore.toggleNodeSelection(node);
  } else if (shiftKey) {
    // Shift + 点击：范围选择
    handleRangeSelection(node);
  } else {
    // 单击：单选
    editorStore.selectNode(node);
  }

  // 触发自定义事件，通知 Canvas 组件
  window.dispatchEvent(new CustomEvent('nodelist:select', {
    detail: { node, append: ctrlKey || shiftKey }
  }));
}

/**
 * 处理节点双击（从树形组件）
 */
function handleNodeDoubleClick({ node }) {
  startRenaming(node);
}

/**
 * 处理节点右键菜单（从树形组件）
 */
function handleNodeContextMenu({ node, event }) {
  // 如果右键的节点未选中，先选中它
  if (!isNodeSelected(node)) {
    editorStore.selectNode(node);
  }

  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    node
  };
}

/**
 * 处理可见性切换（从树形组件）
 */
function handleToggleVisibility({ node }) {
  toggleVisibility(node);
}

/**
 * 处理锁定切换（从树形组件）
 */
function handleToggleLocked({ node }) {
  toggleLocked(node);
}

/**
 * 开始重命名（从树形组件）
 */
function handleStartRename({ node }) {
  startRenaming(node);
}

/**
 * 提交重命名（从树形组件）
 */
function handleSubmitRename({ node, newName }) {
  const oldName = node.nodeName;

  // 验证名称
  if (!newName || newName === oldName) {
    editingNodeId.value = null;
    return;
  }

  // 检查名称是否重复
  const isDuplicate = filteredNodes.value.some(
    n => n.uuid !== node.uuid && n.nodeName === newName
  );

  if (isDuplicate) {
    alert('节点名称已存在，请使用其他名称');
    return;
  }

  // 创建重命名命令
  const command = new RenameNodeCommand(node, newName, oldName);

  // 触发自定义事件，由 Canvas 组件执行命令
  window.dispatchEvent(new CustomEvent('nodelist:rename', {
    detail: { command }
  }));

  editingNodeId.value = null;
}

/**
 * 取消重命名（从树形组件）
 */
function handleCancelRename() {
  editingNodeId.value = null;
}

/**
 * 处理全局点击（关闭右键菜单）
 */
function handleGlobalClick() {
  if (contextMenu.value.visible) {
    closeContextMenu();
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  document.addEventListener('click', handleGlobalClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick);
});
</script>

<style scoped>
.node-list-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-secondary);
}

/* 搜索栏 */
.search-bar {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  font-size: 14px;
  color: var(--text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 32px 8px 32px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--primary-color);
}

.search-input::placeholder {
  color: var(--text-disabled);
}

.clear-btn {
  position: absolute;
  right: 8px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: var(--text-primary);
}

/* 过滤器 */
.filters {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
}

.filter-select {
  flex: 1;
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 12px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:hover {
  border-color: var(--border-hover);
}

.filter-select:focus {
  border-color: var(--primary-color);
}

.create-group-btn {
  padding: 6px 12px;
  background: var(--primary-color);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.create-group-btn:hover {
  background: var(--primary-color-hover);
}

/* 节点列表 */
.node-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

/* 节点项 */
.node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  margin-bottom: 4px;
  background: var(--bg-tertiary);
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.node-item:hover {
  background: var(--bg-primary);
  border-color: var(--border-hover);
}

.node-item.selected {
  background: var(--primary-dark);
  border-color: var(--primary-color);
}

.node-item.hidden {
  opacity: 0.5;
}

.node-item.locked {
  cursor: not-allowed;
}

.node-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--text-secondary);
}

.node-name-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-name {
  color: var(--text-primary);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-type {
  color: var(--text-secondary);
  font-size: 11px;
}

.node-name-input {
  width: 100%;
  padding: 4px 6px;
  background: var(--bg-primary);
  border: 1px solid var(--primary-color);
  border-radius: 3px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.node-item:hover .node-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 6px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 3px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.action-btn.active {
  color: var(--primary-color);
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  min-width: 160px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 4px;
  z-index: 10000;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:hover {
  background: var(--bg-tertiary);
}

.menu-icon {
  font-size: 14px;
}

.menu-label {
  color: var(--text-primary);
  font-size: 13px;
}

.menu-divider {
  height: 1px;
  background: var(--border-color);
  margin: 4px 0;
}

/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}
</style>

