/**
 * 编辑器状态管理
 *
 * @description 管理编辑器的全局状态，包括选中节点、编辑模式、工具状态等
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useEditorStore = defineStore('editor', () => {
  // ========== 状态 ==========

  // 当前选中的节点（单选或多选）
  const selectedNodes = ref([]);

  // 编辑模式：'select' | 'pan' | 'draw'
  const editMode = ref('select');

  // 当前激活的工具：null | 'move' | 'rotate' | 'scale'
  const activeTool = ref(null);

  // 是否显示网格
  const showGrid = ref(true);

  // 是否启用网格吸附
  const snapToGrid = ref(true);

  // 网格大小（像素）
  const gridSize = ref(20);

  // 是否显示标尺
  const showRuler = ref(true);

  // 撤销/重做历史
  const canUndo = ref(false);
  const canRedo = ref(false);

  // 剪贴板
  const clipboard = ref(null);

  // 是否正在拖拽组件
  const isDraggingComponent = ref(false);

  // 拖拽的组件类型
  const draggingComponentType = ref(null);

  // 所有节点列表（用于节点列表面板）
  const allNodes = ref([]);

  // 节点可见性状态 Map<nodeId, boolean>
  const nodeVisibility = ref(new Map());

  // 节点锁定状态 Map<nodeId, boolean>
  const nodeLocked = ref(new Map());

  // 节点搜索关键词
  const nodeSearchKeyword = ref('');

  // 节点类型过滤
  const nodeTypeFilter = ref('all');

  // 节点状态过滤：'all' | 'visible' | 'hidden' | 'locked' | 'unlocked'
  const nodeStatusFilter = ref('all');

  // ========== 计算属性 ==========

  // 是否有选中的节点
  const hasSelection = computed(() => selectedNodes.value.length > 0);

  // 选中节点数量
  const selectionCount = computed(() => selectedNodes.value.length);

  // 是否为多选
  const isMultiSelection = computed(() => selectedNodes.value.length > 1);

  // 第一个选中的节点（用于属性面板显示）
  const firstSelectedNode = computed(() => selectedNodes.value[0] || null);

  // 过滤后的节点列表
  const filteredNodes = computed(() => {
    let nodes = allNodes.value;

    // 按搜索关键词过滤
    if (nodeSearchKeyword.value) {
      const keyword = nodeSearchKeyword.value.toLowerCase();
      nodes = nodes.filter(node =>
        node.nodeName.toLowerCase().includes(keyword) ||
        node.nodeType.toLowerCase().includes(keyword) ||
        node.uuid.toLowerCase().includes(keyword)
      );
    }

    // 按节点类型过滤
    if (nodeTypeFilter.value !== 'all') {
      nodes = nodes.filter(node => node.nodeType === nodeTypeFilter.value);
    }

    // 按节点状态过滤
    if (nodeStatusFilter.value !== 'all') {
      nodes = nodes.filter(node => {
        const isVisible = nodeVisibility.value.get(node.uuid) !== false;
        const isLocked = nodeLocked.value.get(node.uuid) === true;

        switch (nodeStatusFilter.value) {
          case 'visible':
            return isVisible;
          case 'hidden':
            return !isVisible;
          case 'locked':
            return isLocked;
          case 'unlocked':
            return !isLocked;
          default:
            return true;
        }
      });
    }

    return nodes;
  });

  // 所有节点类型列表（用于过滤下拉框）
  const nodeTypes = computed(() => {
    const types = new Set(allNodes.value.map(node => node.nodeType));
    return Array.from(types);
  });

  // ========== 方法 ==========

  /**
   * 选中节点
   * @param {Object|Array} nodes - 节点或节点数组
   * @param {Boolean} append - 是否追加到已选中的节点（多选）
   */
  function selectNode(nodes, append = false) {
    const nodeArray = Array.isArray(nodes) ? nodes : [nodes];

    if (append) {
      // 追加选择（多选）
      selectedNodes.value = [...selectedNodes.value, ...nodeArray];
    } else {
      // 替换选择（单选）
      selectedNodes.value = nodeArray;
    }
  }

  /**
   * 取消选中节点
   * @param {Object|Array} nodes - 要取消选中的节点
   */
  function deselectNode(nodes) {
    const nodeArray = Array.isArray(nodes) ? nodes : [nodes];
    const nodeIds = nodeArray.map(n => n.id);
    selectedNodes.value = selectedNodes.value.filter(n => !nodeIds.includes(n.id));
  }

  /**
   * 清空选择
   */
  function clearSelection() {
    selectedNodes.value = [];
  }

  /**
   * 切换节点选中状态
   * @param {Object} node - 节点
   */
  function toggleNodeSelection(node) {
    const index = selectedNodes.value.findIndex(n => n.id === node.id);
    if (index > -1) {
      selectedNodes.value.splice(index, 1);
    } else {
      selectedNodes.value.push(node);
    }
  }

  /**
   * 设置编辑模式
   * @param {String} mode - 编辑模式
   */
  function setEditMode(mode) {
    editMode.value = mode;
    // 切换模式时清空激活的工具
    if (mode !== 'select') {
      activeTool.value = null;
    }
  }

  /**
   * 设置激活的工具
   * @param {String} tool - 工具名称
   */
  function setActiveTool(tool) {
    activeTool.value = tool;
  }

  /**
   * 切换网格显示
   */
  function toggleGrid() {
    showGrid.value = !showGrid.value;
  }

  /**
   * 切换网格吸附
   */
  function toggleSnapToGrid() {
    snapToGrid.value = !snapToGrid.value;
  }

  /**
   * 设置网格大小
   * @param {Number} size - 网格大小
   */
  function setGridSize(size) {
    gridSize.value = size;
  }

  /**
   * 切换标尺显示
   */
  function toggleRuler() {
    showRuler.value = !showRuler.value;
  }

  /**
   * 复制选中的节点到剪贴板
   */
  function copySelection() {
    if (hasSelection.value) {
      clipboard.value = JSON.parse(JSON.stringify(selectedNodes.value));
    }
  }

  /**
   * 粘贴剪贴板中的节点
   */
  function paste() {
    if (clipboard.value) {
      // 这里返回剪贴板内容，实际粘贴逻辑由画布管理器处理
      return clipboard.value;
    }
    return null;
  }

  /**
   * 开始拖拽组件
   * @param {String} componentType - 组件类型
   */
  function startDraggingComponent(componentType) {
    isDraggingComponent.value = true;
    draggingComponentType.value = componentType;
  }

  /**
   * 结束拖拽组件
   */
  function endDraggingComponent() {
    isDraggingComponent.value = false;
    draggingComponentType.value = null;
  }

  /**
   * 更新撤销/重做状态
   * @param {Boolean} undo - 是否可以撤销
   * @param {Boolean} redo - 是否可以重做
   */
  function updateHistoryState(undo, redo) {
    canUndo.value = undo;
    canRedo.value = redo;
  }

  /**
   * 添加节点到列表
   * @param {Object} node - 节点对象
   */
  function addNode(node) {
    if (!allNodes.value.find(n => n.uuid === node.uuid)) {
      allNodes.value.push(node);
      // 初始化节点状态
      nodeVisibility.value.set(node.uuid, node.properties?.visible !== false);
      nodeLocked.value.set(node.uuid, node.properties?.locked === true);
    }
  }

  /**
   * 从列表中移除节点
   * @param {String} nodeId - 节点 UUID
   */
  function removeNode(nodeId) {
    const index = allNodes.value.findIndex(n => n.uuid === nodeId);
    if (index > -1) {
      allNodes.value.splice(index, 1);
      nodeVisibility.value.delete(nodeId);
      nodeLocked.value.delete(nodeId);
    }
  }

  /**
   * 更新节点列表
   * @param {Array} nodes - 节点数组
   */
  function updateNodeList(nodes) {
    allNodes.value = nodes;
    // 同步节点状态
    nodes.forEach(node => {
      if (!nodeVisibility.value.has(node.uuid)) {
        nodeVisibility.value.set(node.uuid, node.properties?.visible !== false);
      }
      if (!nodeLocked.value.has(node.uuid)) {
        nodeLocked.value.set(node.uuid, node.properties?.locked === true);
      }
    });
  }

  /**
   * 设置节点可见性
   * @param {String|Array} nodeIds - 节点 UUID 或 UUID 数组
   * @param {Boolean} visible - 是否可见
   */
  function setNodeVisibility(nodeIds, visible) {
    const ids = Array.isArray(nodeIds) ? nodeIds : [nodeIds];
    ids.forEach(id => {
      nodeVisibility.value.set(id, visible);
      // 更新节点属性
      const node = allNodes.value.find(n => n.uuid === id);
      if (node && node.properties) {
        node.properties.visible = visible;
      }
    });
  }

  /**
   * 切换节点可见性
   * @param {String|Array} nodeIds - 节点 UUID 或 UUID 数组
   */
  function toggleNodeVisibility(nodeIds) {
    const ids = Array.isArray(nodeIds) ? nodeIds : [nodeIds];
    ids.forEach(id => {
      const currentVisibility = nodeVisibility.value.get(id) !== false;
      setNodeVisibility(id, !currentVisibility);
    });
  }

  /**
   * 设置节点锁定状态
   * @param {String|Array} nodeIds - 节点 UUID 或 UUID 数组
   * @param {Boolean} locked - 是否锁定
   */
  function setNodeLocked(nodeIds, locked) {
    const ids = Array.isArray(nodeIds) ? nodeIds : [nodeIds];
    ids.forEach(id => {
      nodeLocked.value.set(id, locked);
      // 更新节点属性
      const node = allNodes.value.find(n => n.uuid === id);
      if (node && node.properties) {
        node.properties.locked = locked;
      }
    });
  }

  /**
   * 切换节点锁定状态
   * @param {String|Array} nodeIds - 节点 UUID 或 UUID 数组
   */
  function toggleNodeLocked(nodeIds) {
    const ids = Array.isArray(nodeIds) ? nodeIds : [nodeIds];
    ids.forEach(id => {
      const currentLocked = nodeLocked.value.get(id) === true;
      setNodeLocked(id, !currentLocked);
    });
  }

  /**
   * 检查节点是否可见
   * @param {String} nodeId - 节点 UUID
   * @returns {Boolean}
   */
  function isNodeVisible(nodeId) {
    return nodeVisibility.value.get(nodeId) !== false;
  }

  /**
   * 检查节点是否锁定
   * @param {String} nodeId - 节点 UUID
   * @returns {Boolean}
   */
  function isNodeLocked(nodeId) {
    return nodeLocked.value.get(nodeId) === true;
  }

  /**
   * 设置节点搜索关键词
   * @param {String} keyword - 搜索关键词
   */
  function setNodeSearchKeyword(keyword) {
    nodeSearchKeyword.value = keyword;
  }

  /**
   * 设置节点类型过滤
   * @param {String} type - 节点类型
   */
  function setNodeTypeFilter(type) {
    nodeTypeFilter.value = type;
  }

  /**
   * 设置节点状态过滤
   * @param {String} status - 节点状态
   */
  function setNodeStatusFilter(status) {
    nodeStatusFilter.value = status;
  }

  /**
   * 清空所有过滤条件
   */
  function clearFilters() {
    nodeSearchKeyword.value = '';
    nodeTypeFilter.value = 'all';
    nodeStatusFilter.value = 'all';
  }

  /**
   * 撤销操作
   */
  function undo() {
    // 触发自定义事件，由 Canvas 组件监听并执行
    window.dispatchEvent(new CustomEvent('editor:undo'));
  }

  /**
   * 重做操作
   */
  function redo() {
    // 触发自定义事件，由 Canvas 组件监听并执行
    window.dispatchEvent(new CustomEvent('editor:redo'));
  }

  // ========== 返回 ==========
  return {
    // 状态
    selectedNodes,
    editMode,
    activeTool,
    showGrid,
    snapToGrid,
    gridSize,
    showRuler,
    canUndo,
    canRedo,
    clipboard,
    isDraggingComponent,
    draggingComponentType,
    allNodes,
    nodeVisibility,
    nodeLocked,
    nodeSearchKeyword,
    nodeTypeFilter,
    nodeStatusFilter,

    // 计算属性
    hasSelection,
    selectionCount,
    isMultiSelection,
    firstSelectedNode,
    filteredNodes,
    nodeTypes,

    // 方法
    selectNode,
    deselectNode,
    clearSelection,
    toggleNodeSelection,
    setEditMode,
    setActiveTool,
    toggleGrid,
    toggleSnapToGrid,
    setGridSize,
    toggleRuler,
    copySelection,
    paste,
    startDraggingComponent,
    endDraggingComponent,
    updateHistoryState,
    undo,
    redo,
    addNode,
    removeNode,
    updateNodeList,
    setNodeVisibility,
    toggleNodeVisibility,
    setNodeLocked,
    toggleNodeLocked,
    isNodeVisible,
    isNodeLocked,
    setNodeSearchKeyword,
    setNodeTypeFilter,
    setNodeStatusFilter,
    clearFilters
  };
});

