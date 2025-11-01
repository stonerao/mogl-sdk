<template>
  <div class="canvas-container" ref="canvasContainer">
    <!-- 3D 渲染容器 -->
    <div
      ref="rendererContainer"
      class="renderer-container"
      :class="{
        'cursor-grab': isSpacePressed && !isPanningCanvas,
        'cursor-grabbing': isPanningCanvas
      }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    >
      <!-- 拖拽提示 -->
      <div v-if="isDraggingOver" class="drop-hint">
        <span class="hint-icon">📦</span>
        <p class="hint-text">释放以添加组件</p>
      </div>

      <!-- 加载提示 -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading" />
        <p class="loading-text">初始化画布...</p>
      </div>
    </div>

    <!-- 画布信息 -->
    <div class="canvas-info">
      <span class="info-item">画布: {{ canvasWidth }} × {{ canvasHeight }}</span>
      <span class="info-item">缩放: {{ zoomPercent }}%</span>
      <span class="info-item" v-if="mousePosition">
        鼠标: {{ mousePosition.x }}, {{ mousePosition.y }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useEditorStore, useCanvasStore } from '@/store';
import { useProjectStore } from '@/store/modules/project.js';
import { CanvasManager, GridHelper, TransformController, SelectionManager } from '@/core/canvas';
import { NodeFactory, RectNode, CircleNode, TextNode, ImageNode } from '@/core/nodes';
import { DragManager } from '@/core/interaction';
import {
  CommandManager,
  CreateNodeCommand,
  DeleteNodeCommand,
  MoveNodeCommand,
  TransformNodeCommand,
  UpdatePropertyCommand,
  BatchUpdatePropertyCommand,
  RenameNodeCommand,
  CreateGroupCommand,
  GroupNodesCommand,
  UngroupNodesCommand,
  AddToGroupCommand,
  RemoveFromGroupCommand
} from '@/core/history';

// Store
const editorStore = useEditorStore();
const canvasStore = useCanvasStore();
const projectStore = useProjectStore();

const { isDraggingComponent, showGrid, snapToGrid, activeTool } = storeToRefs(editorStore);
const { canvasWidth, canvasHeight, zoomPercent, zoom, panOffset } = storeToRefs(canvasStore);

// 引用
const canvasContainer = ref(null);
const rendererContainer = ref(null);

// 画布管理器实例
let canvasManager = null;
let gridHelper = null;
let transformController = null;
let selectionManager = null;
let dragManager = null;
let commandManager = null;

// 节点列表
const nodes = ref([]);

// 状态
const isLoading = ref(true);
const isDraggingOver = ref(false);
const mousePosition = ref(null);
const isPanning = ref(false);
const lastMousePos = ref({ x: 0, y: 0 });

// 空格键拖动画布状态
const isSpacePressed = ref(false);
const isPanningCanvas = ref(false);
const lastPanPosition = ref({ x: 0, y: 0 });

// 生命周期
onMounted(() => {
  initCanvas();

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);

  // 监听批量创建节点事件
  window.addEventListener('batch-create-nodes', handleBatchCreateNodes);

  // 监听键盘事件（空格键拖动画布）
  window.addEventListener('keydown', handleSpaceKeyDown);
  window.addEventListener('keyup', handleSpaceKeyUp);

  // 监听窗口失去焦点事件（重置空格键状态）
  window.addEventListener('blur', handleWindowBlur);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('batch-create-nodes', handleBatchCreateNodes);
  window.removeEventListener('keydown', handleSpaceKeyDown);
  window.removeEventListener('keyup', handleSpaceKeyUp);
  window.removeEventListener('blur', handleWindowBlur);
  disposeCanvas();
});

// 监听 Store 变化
watch(showGrid, (value) => {
  if (gridHelper) {
    value ? gridHelper.show() : gridHelper.hide();
  }
});

watch(snapToGrid, (value) => {
  if (dragManager) {
    dragManager.setGridSnap(value);
  }
});

watch(activeTool, (value) => {
  if (transformController) {
    transformController.setMode(value);
  }
});

watch(zoom, (value) => {
  if (canvasManager) {
    canvasManager.setZoom(value);
  }
});

watch(panOffset, (value) => {
  if (canvasManager) {
    canvasManager.setPan(value.x, value.y);
  }
});

// 方法
const initCanvas = async () => {
  try {
    console.log('初始化画布...');

    // 获取容器尺寸
    if (!rendererContainer.value) {
      throw new Error('渲染容器未找到');
    }

    const rect = rendererContainer.value.getBoundingClientRect();
    canvasStore.setContainerSize(rect.width, rect.height);

    // 1. 注册节点类型
    NodeFactory.registerNodeTypes({
      rect: RectNode,
      circle: CircleNode,
      text: TextNode,
      image: ImageNode
    });
    console.log('节点类型注册完成:', NodeFactory.getRegisteredTypes());

    // 2. 初始化画布管理器
    canvasManager = new CanvasManager(rendererContainer.value, {
      canvasStore,
      editorStore
    });
    await canvasManager.init();

    // 3. 初始化网格辅助线
    gridHelper = new GridHelper(canvasManager, {
      gridSize: canvasStore.gridSize,
      visible: editorStore.showGrid
    });

    // 4. 初始化变换控制器
    transformController = new TransformController(canvasManager, {
      mode: editorStore.activeTool
    });

    // 设置为 2D 模式（只允许 XY 平面变换）
    transformController.set2DMode();

    // 监听变换事件
    transformController.on('transform-end', handleTransformEnd);

    // 5. 初始化选择管理器
    selectionManager = new SelectionManager(canvasManager);

    // 监听选择变化
    rendererContainer.value.addEventListener('selection-changed', handleSelectionChanged);

    // 6. 初始化拖拽管理器
    dragManager = new DragManager(canvasManager, selectionManager, {
      gridSnap: editorStore.snapToGrid,
      gridSize: editorStore.gridSize
    });
    dragManager.enable();

    // 7. 初始化线条编辑手柄拖动管理器
    const { LineHandleDragManager } = await import('@/core/interaction/LineHandleDragManager.js');
    console.log(canvasManager)
    const lineHandleDragManager = new LineHandleDragManager({
      camera: canvasManager.scene.camera.instance,
      domElement: rendererContainer.value,
      commandManager: commandManager,
      editorStore: editorStore
    });
    lineHandleDragManager.enable();

    // 监听拖拽事件
    dragManager.onDragEnd(handleDragEnd);

    // 7. 初始化命令管理器
    commandManager = new CommandManager({
      maxHistorySize: 50
    });

    // 监听历史记录变化
    commandManager.onHistoryChange((state) => {
      editorStore.updateHistoryState(state.canUndo, state.canRedo);
    });

    // 8. 设置初始缩放和平移
    // 初始化时居中画布
    canvasStore.centerCanvas();
    canvasManager.setZoom(canvasStore.zoom);
    canvasManager.setPan(canvasStore.panOffset.x, canvasStore.panOffset.y);

    // 9. 监听键盘事件（删除节点、全选等）
    window.addEventListener('keydown', handleKeyDown);

    // 10. 监听撤销/重做事件
    window.addEventListener('editor:undo', handleUndoEvent);
    window.addEventListener('editor:redo', handleRedoEvent);

    // 11. 监听节点列表面板事件
    window.addEventListener('nodelist:select', handleNodeListSelect);
    window.addEventListener('nodelist:rename', handleNodeListRename);
    window.addEventListener('nodelist:visibility', handleNodeListVisibility);
    window.addEventListener('nodelist:locked', handleNodeListLocked);
    window.addEventListener('nodelist:duplicate', handleNodeListDuplicate);
    window.addEventListener('nodelist:delete', handleNodeListDelete);
    window.addEventListener('nodelist:focus', handleNodeListFocus);
    window.addEventListener('nodelist:create-group', handleCreateGroup);
    window.addEventListener('nodelist:group-nodes', handleGroupNodes);
    window.addEventListener('nodelist:ungroup-nodes', handleUngroupNodes);
    window.addEventListener('nodelist:drop-node', handleDropNode);

    // 12. 监听工程文件操作事件
    window.addEventListener('project:new', handleNewProject);
    window.addEventListener('project:import', handleImportProject);
    window.addEventListener('project:export', handleExportProject);

    // 13. 监听属性面板事件
    window.addEventListener('property:update-name', handlePropertyUpdateName);
    window.addEventListener('property:update-transform', handlePropertyUpdateTransform);
    window.addEventListener('property:reset-transform', handlePropertyResetTransform);
    window.addEventListener('property:update', handlePropertyUpdate);
    window.addEventListener('property:update-display', handlePropertyUpdateDisplay);

    // 14. 监听线条编辑事件
    window.addEventListener('line:update-style', handleLineUpdateStyle);
    window.addEventListener('line:add-point', handleLineAddPoint);
    window.addEventListener('line:remove-point', handleLineRemovePoint);
    window.addEventListener('line:move-point', handleLineMovePoint);

    isLoading.value = false;
    console.log('画布初始化完成');
  } catch (error) {
    console.error('画布初始化失败:', error);
    isLoading.value = false;
  }
};

const disposeCanvas = () => {
  console.log('销毁画布...');

  // 清理事件监听
  if (rendererContainer.value) {
    rendererContainer.value.removeEventListener('selection-changed', handleSelectionChanged);
  }
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('editor:undo', handleUndoEvent);
  window.removeEventListener('editor:redo', handleRedoEvent);
  window.removeEventListener('nodelist:select', handleNodeListSelect);
  window.removeEventListener('nodelist:rename', handleNodeListRename);
  window.removeEventListener('nodelist:visibility', handleNodeListVisibility);
  window.removeEventListener('nodelist:locked', handleNodeListLocked);
  window.removeEventListener('nodelist:duplicate', handleNodeListDuplicate);
  window.removeEventListener('nodelist:delete', handleNodeListDelete);
  window.removeEventListener('nodelist:focus', handleNodeListFocus);
  window.removeEventListener('nodelist:create-group', handleCreateGroup);
  window.removeEventListener('nodelist:group-nodes', handleGroupNodes);
  window.removeEventListener('nodelist:ungroup-nodes', handleUngroupNodes);
  window.removeEventListener('nodelist:drop-node', handleDropNode);
  window.removeEventListener('project:new', handleNewProject);
  window.removeEventListener('project:import', handleImportProject);
  window.removeEventListener('project:export', handleExportProject);

  // 销毁所有节点
  NodeFactory.destroyNodes(nodes.value);
  nodes.value = [];

  // 销毁各个管理器
  if (commandManager) {
    commandManager.dispose();
    commandManager = null;
  }

  if (dragManager) {
    dragManager.dispose();
    dragManager = null;
  }

  if (transformController) {
    transformController.off('transform-end', handleTransformEnd);
    transformController.dispose();
    transformController = null;
  }

  if (selectionManager) {
    selectionManager.dispose();
    selectionManager = null;
  }

  if (gridHelper) {
    gridHelper.dispose();
    gridHelper = null;
  }

  if (canvasManager) {
    canvasManager.dispose();
    canvasManager = null;
  }
};

const handleResize = () => {
  if (rendererContainer.value && canvasManager) {
    const rect = rendererContainer.value.getBoundingClientRect();
    canvasStore.setContainerSize(rect.width, rect.height);

    // 更新画布管理器尺寸
    canvasManager.resize(rect.width, rect.height);
    console.log('画布尺寸更新:', rect.width, rect.height);
  }
};

// 事件处理函数
const handleTransformEnd = (event) => {
  const { object, before, after } = event.detail;
  console.log('变换结束:', object, before, after);

  // 创建变换命令并添加到历史记录
  if (commandManager && object) {
    const transformType = transformController.getMode();

    const command = new TransformNodeCommand({
      node: object,
      transformType: transformType === 'scale' ? 'scale' : 'rotate',
      oldTransform: before,
      newTransform: after
    });

    commandManager.execute(command);
  }
};

// 拖拽结束事件
const handleDragEnd = (event) => {
  const { nodes: draggedNodes, oldPositions, newPositions } = event;
  console.log('拖拽结束:', draggedNodes, oldPositions, newPositions);

  // 创建移动命令并添加到历史记录
  if (commandManager && draggedNodes.length > 0) {
    const command = new MoveNodeCommand({
      nodes: draggedNodes,
      oldPositions,
      newPositions
    });

    commandManager.execute(command);
  }
};

const handleSelectionChanged = (event) => {
  const { selectedNodes } = event.detail;
  console.log('选择变化:', selectedNodes);

  // 同步到 Editor Store
  editorStore.clearSelection();
  selectedNodes.forEach(node => {
    editorStore.selectNode(node.uuid);
  });

  // 更新变换控制器
  if (transformController) {
    if (selectedNodes.length === 1) {
      transformController.attach(selectedNodes[0]);
    } else {
      transformController.detach();
    }
  }
};

// 拖拽事件
const handleDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';

  if (isDraggingComponent.value) {
    isDraggingOver.value = true;
  }
};

const handleDragLeave = () => {
  isDraggingOver.value = false;
};

const handleDrop = (event) => {
  event.preventDefault();
  isDraggingOver.value = false;

  const componentType = event.dataTransfer.getData('component-type');
  if (!componentType) return;
  const componentOption = JSON.parse(event.dataTransfer.getData('component-option'));
  console.log(componentOption)
  // 计算放置位置（画布坐标）
  const rect = rendererContainer.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // 使用 CanvasManager 的 screenToWorld 方法转换坐标
  const worldPos = canvasManager.screenToWorld(x, y);

  // 网格吸附
  let finalPos = worldPos;
  if (snapToGrid.value && gridHelper) {
    finalPos = gridHelper.snapToGrid(worldPos.x, worldPos.y);
  }

  console.log('放置组件:', componentType, '位置:', finalPos);

  // 创建节点
  createNode(componentType, finalPos, componentOption);
};

// 创建节点
const createNode = (type, position, option = {}) => {
  if (!canvasManager || !commandManager) {
    console.error('Canvas manager or command manager not initialized');
    return;
  }

  try {
    // 准备节点配置
    const nodeConfig = {
      ...option,
      properties: {
        x: position.x,
        y: position.y,
        z: 0
      }
    };

    // 为可编辑线条添加默认控制点
    if (type === 'editable-line') {
      nodeConfig.properties.points = [
        { x: 0, y: 0, z: 0 },           // 起点（相对位置）
        { x: 150, y: 0, z: 0 }          // 终点（相对位置，默认水平线条）
      ];
      nodeConfig.properties.color = '#409EFF';
      nodeConfig.properties.lineWidth = 2;
      nodeConfig.properties.lineStyle = 'solid';
      nodeConfig.properties.editMode = true;  // 默认开启编辑模式
    }

    // 使用命令系统创建节点
    const command = new CreateNodeCommand({
      nodeType: type,
      config: nodeConfig,
      scene: canvasManager.getScene(),
      onCreate: (nodeType, config) => {
        // 创建节点
        const node = NodeFactory.createNode(nodeType || type, canvasManager.getScene(), config);

        // 添加到节点列表
        nodes.value.push(node);

        // 注册为可选择对象
        if (selectionManager) {
          selectionManager.registerSelectable(node);
        }

        // 自动选中新创建的节点
        if (selectionManager) {
          selectionManager.clearSelection();
          selectionManager.addSelection(node);
        }

        // 如果是可编辑线条，启用编辑模式
        if (type === 'editable-line' && node.setEditMode) {
          node.setEditMode(true);
        }

        console.log('节点创建成功:', node);
        return node;
      },
      onDelete: (node) => {
        // 从节点列表中移除
        const index = nodes.value.findIndex(n => n.uuid === node.uuid);
        if (index !== -1) {
          nodes.value.splice(index, 1);
        }

        // 销毁节点
        NodeFactory.destroyNode(node);
      }
    });

    commandManager.execute(command);
  } catch (error) {
    console.error('创建节点失败:', error);
  }
};

// 鼠标事件
const handleWheel = (event) => {
  event.preventDefault();

  // 获取鼠标位置作为缩放中心
  const rect = rendererContainer.value.getBoundingClientRect();
  const centerX = event.clientX - rect.left;
  const centerY = event.clientY - rect.top;

  // 缩放
  const delta = event.deltaY > 0 ? -0.1 : 0.1;
  const newZoom = canvasStore.zoom + delta;
  canvasStore.setZoom(newZoom, { x: centerX, y: centerY });
};

const handleMouseDown = (event) => {
  // 空格键 + 左键：拖动画布
  if (isSpacePressed.value && event.button === 0) {
    event.preventDefault();
    isPanningCanvas.value = true;
    lastPanPosition.value = { x: event.clientX, y: event.clientY };
    canvasStore.startPanning();
    return;
  }

  // 中键或 Shift + 左键：平移画布
  if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
    event.preventDefault();
    isPanning.value = true;
    lastMousePos.value = { x: event.clientX, y: event.clientY };
    canvasStore.startPanning();
    return;
  }

  // 左键：选择节点（仅在未按空格键时）
  if (event.button === 0 && !event.shiftKey && !isSpacePressed.value && selectionManager) {
    const multiSelect = event.ctrlKey || event.metaKey;
    selectionManager.selectByClick(event, multiSelect);
  }
};

const handleMouseMove = (event) => {
  // 更新鼠标位置
  if (canvasManager) {
    const rect = rendererContainer.value.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const worldPos = canvasManager.screenToWorld(x, y);
    mousePosition.value = {
      x: Math.round(worldPos.x),
      y: Math.round(worldPos.y)
    };
  }

  // 空格键拖动画布
  if (isPanningCanvas.value) {
    const deltaX = event.clientX - lastPanPosition.value.x;
    const deltaY = event.clientY - lastPanPosition.value.y;

    canvasStore.pan(deltaX, deltaY);

    lastPanPosition.value = { x: event.clientX, y: event.clientY };
    return; // 拖动画布时不执行其他操作
  }

  // 平移画布（中键或 Shift+左键）
  if (isPanning.value) {
    const deltaX = event.clientX - lastMousePos.value.x;
    const deltaY = event.clientY - lastMousePos.value.y;

    canvasStore.pan(deltaX, deltaY);

    lastMousePos.value = { x: event.clientX, y: event.clientY };
    return; // 平移时不执行其他操作
  }

  // 更新高亮效果（仅在未拖动画布时）
  if (selectionManager && !isPanningCanvas.value && !isPanning.value) {
    selectionManager.updateHighlights();
  }
};

const handleMouseUp = () => {
  // 停止空格键拖动画布
  if (isPanningCanvas.value) {
    isPanningCanvas.value = false;
    canvasStore.endPanning();
  }

  // 停止中键/Shift+左键平移
  if (isPanning.value) {
    isPanning.value = false;
    canvasStore.endPanning();
  }
};

// 空格键按下事件（用于拖动画布）
const handleSpaceKeyDown = (event) => {
  // 忽略输入框中的按键
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return;
  }

  // 检测空格键
  if (event.code === 'Space' && !isSpacePressed.value) {
    isSpacePressed.value = true;
    event.preventDefault(); // 防止页面滚动
  }
};

// 空格键释放事件
const handleSpaceKeyUp = (event) => {
  // 检测空格键释放
  if (event.code === 'Space') {
    isSpacePressed.value = false;

    // 如果正在拖动画布，停止拖动
    if (isPanningCanvas.value) {
      isPanningCanvas.value = false;
      canvasStore.endPanning();
    }
  }
};

// 窗口失去焦点事件（重置状态）
const handleWindowBlur = () => {
  // 重置空格键状态
  if (isSpacePressed.value) {
    isSpacePressed.value = false;
  }

  // 停止画布拖动
  if (isPanningCanvas.value) {
    isPanningCanvas.value = false;
    canvasStore.endPanning();
  }

  // 停止中键/Shift+左键平移
  if (isPanning.value) {
    isPanning.value = false;
    canvasStore.endPanning();
  }
};

// 键盘事件
const handleKeyDown = (event) => {
  // 忽略输入框中的按键
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return;
  }

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

  // Delete 或 Backspace 键：删除选中的节点
  if (event.key === 'Delete' || event.key === 'Backspace') {
    deleteSelectedNodes();
    event.preventDefault();
  }
  // Ctrl/Cmd + A：全选
  else if (ctrlKey && event.key === 'a') {
    if (selectionManager) {
      selectionManager.selectAll();
      event.preventDefault();
    }
  }
};

// 删除选中的节点
const deleteSelectedNodes = () => {
  if (!selectionManager || !commandManager) return;

  const selectedNodes = selectionManager.getSelectedNodes();
  if (selectedNodes.length === 0) return;

  // 使用命令系统删除节点
  const command = new DeleteNodeCommand({
    nodes: selectedNodes,
    onDelete: (node) => {
      // 从节点列表中移除
      const index = nodes.value.findIndex(n => n.uuid === node.uuid);
      if (index !== -1) {
        nodes.value.splice(index, 1);
      }

      // 销毁节点
      NodeFactory.destroyNode(node);
    },
    onRestore: (node) => {
      // 恢复节点到场景
      if (node.parent) {
        node.parent.add(node);
      } else {
        canvasManager.getScene().add(node);
      }

      // 添加回节点列表
      nodes.value.push(node);

      // 重新注册为可选择对象
      if (selectionManager) {
        selectionManager.registerSelectable(node);
      }
    }
  });

  commandManager.execute(command);

  // 清除选择
  selectionManager.clearSelection();

  console.log('删除节点:', selectedNodes.length, '个');
};

// 撤销事件处理
const handleUndoEvent = () => {
  if (commandManager && commandManager.canUndo()) {
    commandManager.undo();
  }
};

// 重做事件处理
const handleRedoEvent = () => {
  if (commandManager && commandManager.canRedo()) {
    commandManager.redo();
  }
};

// ========== 节点列表面板事件处理 ==========

/**
 * 处理节点列表选择事件
 */
const handleNodeListSelect = (event) => {
  const { node, append } = event.detail;

  if (!selectionManager) return;

  if (append) {
    // 多选模式
    selectionManager.toggleSelection(node);
  } else {
    // 单选模式
    selectionManager.clearSelection();
    selectionManager.addSelection(node);
  }
};

/**
 * 处理节点重命名事件
 */
const handleNodeListRename = (event) => {
  const { command } = event.detail;

  if (commandManager) {
    commandManager.execute(command);
  }
};

/**
 * 处理节点可见性切换事件
 */
const handleNodeListVisibility = (event) => {
  const { nodeId, visible } = event.detail;

  const node = nodes.value.find(n => n.uuid === nodeId);
  if (node) {
    node.visible = visible;
    node.properties.visible = visible;
  }
};

/**
 * 处理节点锁定切换事件
 */
const handleNodeListLocked = (event) => {
  const { nodeId, locked } = event.detail;

  const node = nodes.value.find(n => n.uuid === nodeId);
  if (node) {
    node.properties.locked = locked;

    // 如果节点被锁定且当前被选中，则取消选中
    if (locked && selectionManager) {
      const selectedNodes = selectionManager.getSelectedNodes();
      if (selectedNodes.some(n => n.uuid === nodeId)) {
        selectionManager.removeSelection(node);
      }
    }
  }
};

/**
 * 处理节点复制事件
 */
const handleNodeListDuplicate = () => {
  if (!selectionManager || !commandManager) return;

  const selectedNodes = selectionManager.getSelectedNodes();
  if (selectedNodes.length === 0) return;

  // 复制选中的节点
  selectedNodes.forEach(node => {
    const offset = 20; // 偏移量
    const newPosition = {
      x: node.position.x + offset,
      y: node.position.y + offset,
      z: node.position.z
    };

    createNode(node.nodeType, newPosition);
  });
};

/**
 * 处理节点删除事件
 */
const handleNodeListDelete = () => {
  deleteSelectedNodes();
};

/**
 * 处理聚焦到节点事件
 */
const handleNodeListFocus = (event) => {
  const { node } = event.detail;

  if (!node || !canvasManager) return;

  // 计算节点在屏幕中心的位置
  const containerRect = rendererContainer.value.getBoundingClientRect();
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;

  // 计算需要的平移量
  const nodeScreenPos = canvasManager.worldToScreen(node.position.x, node.position.y);
  const deltaX = centerX - nodeScreenPos.x;
  const deltaY = centerY - nodeScreenPos.y;

  // 平移画布
  canvasStore.pan(deltaX, deltaY);

  // 选中节点
  if (selectionManager) {
    selectionManager.clearSelection();
    selectionManager.addSelection(node);
  }
};

// ========== 分组相关事件处理 ==========

/**
 * 创建空分组
 */
const handleCreateGroup = () => {
  if (!canvasManager) return;

  // 创建分组节点
  const group = NodeFactory.createNode('group', canvasManager.getScene(), {
    name: `分组${Date.now()}`,
    properties: {
      x: 0,
      y: 0,
      expanded: true
    }
  });

  // 创建命令
  const command = new CreateGroupCommand(group, canvasManager.getScene());
  commandManager.execute(command);

  // 添加到节点列表
  nodes.value.push(group);

  // 注册为可选择对象
  if (selectionManager) {
    selectionManager.registerSelectable(group);
  }

  console.log('创建分组:', group.nodeName);
};

/**
 * 将选中的节点添加到分组
 */
const handleGroupNodes = () => {
  if (!selectionManager || !canvasManager) return;

  const selectedNodes = selectionManager.getSelectedNodes();
  if (selectedNodes.length < 1) {
    console.warn('请至少选择一个节点');
    return;
  }

  // 创建分组节点
  const group = NodeFactory.createNode('group', canvasManager.getScene(), {
    name: `分组${Date.now()}`,
    properties: {
      x: 0,
      y: 0,
      expanded: true
    }
  });

  // 创建命令
  const command = new GroupNodesCommand(group, selectedNodes, canvasManager.getScene());
  commandManager.execute(command);

  // 添加到节点列表
  nodes.value.push(group);

  // 注册为可选择对象
  if (selectionManager) {
    selectionManager.registerSelectable(group);
    selectionManager.clearSelection();
    selectionManager.addSelection(group);
  }

  console.log('创建分组并添加', selectedNodes.length, '个节点');
};

/**
 * 解散分组
 */
const handleUngroupNodes = (event) => {
  const { group } = event.detail;

  if (!group || group.nodeType !== 'group') {
    console.warn('无效的分组节点');
    return;
  }

  if (!canvasManager) return;

  // 创建命令
  const command = new UngroupNodesCommand(group, canvasManager.getScene(), true);
  commandManager.execute(command);

  // 从节点列表移除分组
  const index = nodes.value.findIndex(n => n.uuid === group.uuid);
  if (index !== -1) {
    nodes.value.splice(index, 1);
  }

  console.log('解散分组:', group.nodeName);
};

/**
 * 处理节点拖放到分组
 */
const handleDropNode = (event) => {
  const { draggedNodeId, targetNode } = event.detail;

  if (!draggedNodeId || !targetNode) return;

  // 查找被拖拽的节点
  const draggedNode = nodes.value.find(n => n.uuid === draggedNodeId);
  if (!draggedNode) {
    console.warn('未找到被拖拽的节点');
    return;
  }

  // 如果目标是分组，添加到分组
  if (targetNode.nodeType === 'group') {
    const command = new AddToGroupCommand(draggedNode, targetNode);
    commandManager.execute(command);
    console.log('将节点', draggedNode.nodeName, '添加到分组', targetNode.nodeName);
  }
  // 如果目标不是分组，从当前分组移除
  else if (draggedNode.parent && draggedNode.parent.nodeType === 'group') {
    const command = new RemoveFromGroupCommand(draggedNode, canvasManager.getScene());
    commandManager.execute(command);
    console.log('将节点', draggedNode.nodeName, '从分组中移除');
  }
};

// ========== 批量创建节点（调试模式）==========

/**
 * 批量创建节点
 */
const handleBatchCreateNodes = (event) => {
  const { nodeConfigs } = event.detail;

  if (!nodeConfigs || !Array.isArray(nodeConfigs) || nodeConfigs.length === 0) {
    console.warn('无效的节点配置');
    return;
  }

  if (!canvasManager) {
    console.error('画布管理器未初始化');
    return;
  }

  console.log(`[Canvas] Batch creating ${nodeConfigs.length} nodes...`);
  const startTime = performance.now();

  try {
    // 创建节点数组
    const createdNodes = [];

    nodeConfigs.forEach((config, index) => {
      // 创建节点
      const node = NodeFactory.createNode(config.type, canvasManager.getScene(), {
        name: config.name,
        properties: config.properties
      });

      // 设置位置
      if (config.position) {
        node.position.set(config.position.x, config.position.y, config.position.z || 0);
      }

      createdNodes.push(node);

      // 每 100 个节点输出一次进度
      if ((index + 1) % 100 === 0) {
        console.log(`[Canvas] Created ${index + 1}/${nodeConfigs.length} nodes`);
      }
    });

    // 批量添加到画布
    createdNodes.forEach(node => {
      canvasManager.addNode(node);
      nodes.value.push(node);

      // 注册为可选择对象
      if (selectionManager) {
        selectionManager.registerSelectable(node);
      }
    });

    // 更新 store
    editorStore.setNodes(nodes.value);

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`[Canvas] Batch creation completed: ${createdNodes.length} nodes in ${duration}s`);
  } catch (error) {
    console.error('[Canvas] Batch creation error:', error);
  }
};

// ========== 工程文件操作 ==========

/**
 * 新建工程
 */
const handleNewProject = async () => {
  if (!canvasManager) return;

  console.log('新建工程');

  // 清空所有节点
  NodeFactory.destroyNodes(nodes.value);
  nodes.value = [];

  // 清空选择
  if (selectionManager) {
    selectionManager.clearSelection();
  }

  // 清空历史记录
  if (commandManager) {
    commandManager.clear();
  }

  // 重置画布视图
  canvasStore.centerCanvas();
  canvasManager.setZoom(1);
  canvasManager.setPan(0, 0);

  // 重置工程元数据
  projectStore.reset();

  // 清空图片资源
  const { useImageAssetsStore } = await import('@/store/modules/imageAssets.js');
  const imageAssetsStore = useImageAssetsStore();
  imageAssetsStore.clearAll();

  console.log('新建工程完成');
};

/**
 * 导入工程
 */
const handleImportProject = async () => {
  if (!canvasManager) return;

  console.log('导入工程');

  try {
    // 动态导入 ProjectImporter
    const { ProjectImporter } = await import('@/core/io/ProjectImporter.js');
    const { useProjectStore } = await import('@/store/modules/project.js');
    const projectStore = useProjectStore();

    // 选择并导入文件
    const result = await ProjectImporter.import(canvasManager.getScene());

    if (!result.success) {
      alert(`导入失败: ${result.error}`);
      return;
    }

    // 清空当前节点
    NodeFactory.destroyNodes(nodes.value);
    nodes.value = [];

    // 清空选择
    if (selectionManager) {
      selectionManager.clearSelection();
    }

    // 清空历史记录
    if (commandManager) {
      commandManager.clear();
    }

    // 加载新节点
    nodes.value = result.data.nodes;

    // 注册所有节点为可选择对象
    if (selectionManager) {
      result.data.nodes.forEach(node => {
        selectionManager.registerSelectable(node);
      });
    }

    // 恢复画布配置
    if (result.data.canvas) {
      const canvas = result.data.canvas;
      canvasStore.setContainerSize(canvas.width, canvas.height);
      canvasStore.setZoom(canvas.zoom);
      canvasStore.setPanOffset(canvas.panOffset.x, canvas.panOffset.y);

      if (canvas.grid) {
        editorStore.setGridEnabled(canvas.grid.enabled);
        editorStore.setGridSize(canvas.grid.size);
        editorStore.setSnapToGrid(canvas.grid.snap);
      }
    }

    // 加载工程元数据
    if (result.data.metadata) {
      projectStore.loadMetadata(result.data.metadata);
    }

    // 加载全局事件
    if (result.data.globalEvents) {
      const { useGlobalEventsStore } = await import('@/store/modules/globalEvents.js');
      const globalEventsStore = useGlobalEventsStore();
      globalEventsStore.deserialize(result.data.globalEvents);
    }

    // 加载图片资源
    if (result.data.imageAssets) {
      const { useImageAssetsStore } = await import('@/store/modules/imageAssets.js');
      const imageAssetsStore = useImageAssetsStore();
      imageAssetsStore.fromJSON(result.data.imageAssets);
    }

    console.log('导入工程完成:', result.fileName);
    alert(`导入成功: ${result.fileName}`);
  } catch (error) {
    console.error('导入工程失败:', error);
    alert(`导入失败: ${error.message}`);
  }
};

/**
 * 导出工程
 */
const handleExportProject = async () => {
  if (!canvasManager) return;

  console.log('导出工程');

  try {
    // 动态导入 ProjectExporter
    const { ProjectExporter } = await import('@/core/io/ProjectExporter.js');
    const { useProjectStore } = await import('@/store/modules/project.js');
    const { useGlobalEventsStore } = await import('@/store/modules/globalEvents.js');
    const { useImageAssetsStore } = await import('@/store/modules/imageAssets.js');
    const projectStore = useProjectStore();
    const globalEventsStore = useGlobalEventsStore();
    const imageAssetsStore = useImageAssetsStore();

    // 导出工程
    const result = ProjectExporter.export({
      projectName: projectStore.metadata.name,
      nodes: nodes.value,
      canvasConfig: {
        width: canvasStore.canvasSize.width,
        height: canvasStore.canvasSize.height,
        zoom: canvasStore.zoom,
        panOffset: canvasStore.panOffset,
        grid: {
          enabled: editorStore.showGrid,
          size: editorStore.gridSize,
          snap: editorStore.snapToGrid
        }
      },
      metadata: projectStore.metadata,
      globalEvents: globalEventsStore.serialize(),
      imageAssets: imageAssetsStore.toJSON()
    });

    if (result.success) {
      // 标记为已保存
      projectStore.markAsSaved();
      console.log('导出工程完成:', result.fileName);
    } else {
      alert(`导出失败: ${result.error}`);
    }
  } catch (error) {
    console.error('导出工程失败:', error);
    alert(`导出失败: ${error.message}`);
  }
};

// ========== 属性面板事件处理 ==========

/**
 * 处理名称更新
 */
const handlePropertyUpdateName = (event) => {
  const { nodes: targetNodes, name } = event.detail;

  if (!targetNodes || targetNodes.length === 0) return;

  // 对每个节点执行重命名命令
  targetNodes.forEach(node => {
    const command = new RenameNodeCommand({
      node,
      oldName: node.nodeName,
      newName: name
    });

    commandManager.execute(command);
  });
};

/**
 * 处理变换属性更新
 */
const handlePropertyUpdateTransform = (event) => {
  const { nodes: targetNodes, type, axis, value } = event.detail;

  if (!targetNodes || targetNodes.length === 0) return;

  targetNodes.forEach(node => {
    const oldTransform = {
      position: { ...node.position },
      rotation: { ...node.rotation },
      scale: { ...node.scale }
    };

    // 更新变换
    if (type === 'position') {
      node.position[axis] = value;
    } else if (type === 'rotation') {
      // 将角度转换为弧度
      node.rotation[axis] = value * Math.PI / 180;
    } else if (type === 'scale') {
      node.scale[axis] = value;
    }

    const newTransform = {
      position: { ...node.position },
      rotation: { ...node.rotation },
      scale: { ...node.scale }
    };

    const command = new TransformNodeCommand({
      node,
      oldTransform,
      newTransform
    });

    commandManager.execute(command);
  });
};

/**
 * 重置变换
 */
const handlePropertyResetTransform = (event) => {
  const { nodes: targetNodes } = event.detail;

  if (!targetNodes || targetNodes.length === 0) return;

  targetNodes.forEach(node => {
    const oldTransform = {
      position: { ...node.position },
      rotation: { ...node.rotation },
      scale: { ...node.scale }
    };

    const newTransform = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    };

    const command = new TransformNodeCommand({
      node,
      oldTransform,
      newTransform
    });

    commandManager.execute(command);
  });
};

/**
 * 处理属性更新
 */
const handlePropertyUpdate = (event) => {
  const { nodes: targetNodes, propertyKey, value } = event.detail;

  if (!targetNodes || targetNodes.length === 0) return;

  if (targetNodes.length === 1) {
    // 单个节点
    const node = targetNodes[0];
    const oldValue = node.properties?.[propertyKey];

    const command = new UpdatePropertyCommand({
      node,
      propertyKey,
      oldValue,
      newValue: value
    });

    commandManager.execute(command);
  } else {
    // 多个节点，使用批量更新命令
    const command = new BatchUpdatePropertyCommand({
      nodes: targetNodes,
      propertyKey,
      newValue: value
    });

    commandManager.execute(command);
  }
};

/**
 * 处理线条样式更新
 */
const handleLineUpdateStyle = async (event) => {
  const { node, style } = event.detail;
  if (!node) return;

  const { UpdateLineStyleCommand } = await import('@/core/commands/UpdateLineStyleCommand.js');

  const command = new UpdateLineStyleCommand(node, style);
  commandManager.execute(command);
};

/**
 * 处理添加线条控制点
 */
const handleLineAddPoint = async (event) => {
  const { node, position, index } = event.detail;
  if (!node) return;

  const { AddLinePointCommand } = await import('@/core/commands/AddLinePointCommand.js');

  const command = new AddLinePointCommand(node, position, index);
  commandManager.execute(command);
};

/**
 * 处理删除线条控制点
 */
const handleLineRemovePoint = async (event) => {
  const { node, index } = event.detail;
  if (!node) return;

  const { RemoveLinePointCommand } = await import('@/core/commands/RemoveLinePointCommand.js');

  const command = new RemoveLinePointCommand(node, index);
  commandManager.execute(command);
};

/**
 * 处理移动线条控制点
 */
const handleLineMovePoint = async (event) => {
  const { node, index, position } = event.detail;
  if (!node) return;

  const { MoveLinePointCommand } = await import('@/core/commands/MoveLinePointCommand.js');

  const command = new MoveLinePointCommand(node, index, position);
  commandManager.execute(command);
};

/**
 * 处理显示属性更新
 */
const handlePropertyUpdateDisplay = (event) => {
  const { nodes: targetNodes, key, value } = event.detail;

  if (!targetNodes || targetNodes.length === 0) return;

  targetNodes.forEach(node => {
    if (key === 'visible') {
      node.visible = value;
      editorStore.setNodeVisibility(node.uuid, value);
    } else if (key === 'locked') {
      node.locked = value;
      editorStore.setNodeLocked(node.uuid, value);
    } else if (key === 'opacity') {
      const oldValue = node.properties?.opacity || 1;
      const command = new UpdatePropertyCommand({
        node,
        propertyKey: 'opacity',
        oldValue,
        newValue: value
      });
      commandManager.execute(command);
    }
  });
};

// ========== 监听节点列表变化 ==========

/**
 * 同步节点列表到 Editor Store
 */
watch(nodes, (newNodes) => {
  editorStore.updateNodeList(newNodes);
}, { deep: true, immediate: true });
</script>

<style scoped>
.canvas-container {
  flex: 1;
  position: relative;
  background: var(--canvas-bg);
  overflow: hidden;
}

.renderer-container {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: default;
}

.renderer-container.panning {
  cursor: grabbing;
}

/* 空格键拖动画布光标样式 */
.renderer-container.cursor-grab {
  cursor: grab;
}

.renderer-container.cursor-grabbing {
  cursor: grabbing;
}

/* 拖拽提示 */
.drop-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: rgba(64, 158, 255, 0.1);
  border: 2px dashed var(--primary-color);
  border-radius: var(--radius-lg);
  pointer-events: none;
}

.hint-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.hint-text {
  font-size: var(--font-size-lg);
  color: var(--primary-color);
  font-weight: 500;
}

/* 加载提示 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--canvas-bg);
  z-index: 1000;
}

.loading-text {
  margin-top: var(--spacing-md);
  font-size: var(--font-size-md);
  color: var(--text-secondary);
}

/* 画布信息 */
.canvas-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24px;
  padding: 0 var(--spacing-md);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}
</style>

