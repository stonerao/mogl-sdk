<template>
  <header class="editor-header">
    <!-- Logo 和标题 -->
    <div class="header-left">
      <div class="logo">
        <!-- <span class="logo-icon">⚙️</span> -->
        <span class="logo-text">工业组态编辑器</span>
      </div>
      <span class="project-name">{{ projectStore.displayName }}</span>
    </div>

    <!-- 工具栏 -->
    <div class="header-center">
      <!-- 文件操作 -->
      <div class="toolbar-group">
        <button class="toolbar-btn" title="新建工程 (Ctrl+N)" @click="handleNew">
          <span class="icon">📄</span>
        </button>
        <button class="toolbar-btn" title="导入工程 (Ctrl+O)" @click="handleImport">
          <span class="icon">📂</span>
        </button>
        <button class="toolbar-btn" title="导出工程 (Ctrl+S)" @click="handleExport">
          <span class="icon">💾</span>
        </button>
        <button class="toolbar-btn" title="查看 JSON" @click="toggleJsonViewer">
          <span class="icon">📋</span>
        </button>
      </div>

      <div class="divider-vertical" />

      <!-- 编辑操作 -->
      <div class="toolbar-group">
        <button
          class="toolbar-btn"
          :disabled="!canUndo"
          title="撤销 (Ctrl+Z)"
          @click="handleUndo"
        >
          <span class="icon">↶</span>
        </button>
        <button
          class="toolbar-btn"
          :disabled="!canRedo"
          title="重做 (Ctrl+Y)"
          @click="handleRedo"
        >
          <span class="icon">↷</span>
        </button>
      </div>

      <div class="divider-vertical" />

      <!-- 视图控制 -->
      <div class="toolbar-group">
        <button
          class="toolbar-btn"
          :class="{ active: showGrid }"
          title="显示网格"
          @click="toggleGrid"
        >
          <span class="icon">⊞</span>
        </button>
        <button
          class="toolbar-btn"
          :class="{ active: snapToGrid }"
          title="网格吸附"
          @click="toggleSnapToGrid"
        >
          <span class="icon">🧲</span>
        </button>
      </div>

      <div class="divider-vertical" />

      <!-- 缩放控制 -->
      <div class="toolbar-group zoom-controls">
        <button class="toolbar-btn" :disabled="!canZoomOut" title="缩小" @click="zoomOut">
          <span class="icon">-</span>
        </button>
        <span class="zoom-value">{{ zoomPercent }}%</span>
        <button class="toolbar-btn" :disabled="!canZoomIn" title="放大" @click="zoomIn">
          <span class="icon">+</span>
        </button>
        <button class="toolbar-btn" title="适应画布" @click="fitToView">
          <span class="icon">⛶</span>
        </button>
      </div>
    </div>

    <!-- 右侧操作 -->
    <div class="header-right">
      <button
        class="toolbar-btn debug-btn"
        :class="{ loading: isCreatingNodes }"
        :disabled="isCreatingNodes"
        title="批量创建 5000 个节点（性能测试）"
        @click="handleDebugMode"
      >
        <span class="icon">🐛</span>
      </button>

      <div class="divider-vertical" />

      <button class="toolbar-btn" title="预览" @click="handlePreview">
        <span class="icon">👁️</span>
      </button>
      <button class="toolbar-btn" title="设置" @click="handleSettings">
        <span class="icon">⚙️</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useEditorStore } from '../../store/modules/editor.js';
import { useCanvasStore } from '../../store/modules/canvas.js';
import { useProjectStore } from '../../store/modules/project.js';

// Emits
const emit = defineEmits(['new-project', 'import-project', 'export-project', 'toggle-json-viewer']);

// Store
const editorStore = useEditorStore();
const canvasStore = useCanvasStore();
const projectStore = useProjectStore();

// 状态
const { canUndo, canRedo, showGrid, snapToGrid } = storeToRefs(editorStore);
const { zoomPercent, canZoomIn, canZoomOut } = storeToRefs(canvasStore);

// 方法
const { toggleGrid, toggleSnapToGrid } = editorStore;
const { zoomIn, zoomOut, fitToView } = canvasStore;

// 事件处理
const handleNew = () => {
  emit('new-project');
};

const handleImport = () => {
  emit('import-project');
};

const handleExport = () => {
  emit('export-project');
};

const toggleJsonViewer = () => {
  emit('toggle-json-viewer');
};

const handleUndo = () => {
  editorStore.undo();
};

const handleRedo = () => {
  editorStore.redo();
};

const handlePreview = () => {
  console.log('预览');
  // TODO: 实现预览逻辑
};

const handleSettings = () => {
  console.log('设置');
  // TODO: 实现设置逻辑
};

// 调试模式状态
const isCreatingNodes = ref(false);

/**
 * 生成随机颜色
 */
const randomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    '#E63946', '#F77F00', '#06FFA5', '#118AB2', '#073B4C'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * 生成随机数（指定范围）
 */
const randomRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 批量创建节点（性能测试）
 */
const handleDebugMode = async () => {
  // 确认对话框
  const confirmed = confirm(
    '⚠️ 性能测试模式\n\n' +
    '即将创建 5000 个随机矩形节点用于性能测试。\n' +
    '这可能会占用较多内存和 CPU 资源。\n\n' +
    '是否继续？'
  );

  if (!confirmed) {
    return;
  }

  isCreatingNodes.value = true;
  const startTime = performance.now();

  try {
    console.log('[Debug Mode] Starting batch node creation...');

    // 创建节点配置数组
    const nodeConfigs = [];
    const totalNodes = 5000;
    const batchSize = 100; // 每批创建 100 个
    const batches = Math.ceil(totalNodes / batchSize);

    // 分批生成节点配置
    for (let batch = 0; batch < batches; batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, totalNodes);
      const currentBatchSize = batchEnd - batchStart;

      // 生成当前批次的节点配置
      for (let i = 0; i < currentBatchSize; i++) {
        const nodeIndex = batchStart + i;

        // 随机属性
        const x = randomRange(-2000, 2000);
        const y = randomRange(-2000, 2000);
        const width = randomRange(50, 200);
        const height = randomRange(50, 200);
        const color = randomColor();

        nodeConfigs.push({
          type: 'rect',
          name: `DebugNode_${nodeIndex + 1}`,
          position: { x, y, z: 0 },
          properties: {
            width,
            height,
            color,
            opacity: 0.8
          }
        });
      }

      // 每批创建后短暂延迟，避免 UI 卡顿
      if (batch < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // 更新进度
      const progress = Math.round((batchEnd / totalNodes) * 100);
      console.log(`[Debug Mode] Progress: ${progress}% (${batchEnd}/${totalNodes})`);
    }

    console.log(`[Debug Mode] Generated ${nodeConfigs.length} node configs`);

    // 触发自定义事件，通知 Canvas 组件批量创建节点
    window.dispatchEvent(new CustomEvent('batch-create-nodes', {
      detail: { nodeConfigs }
    }));

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // 成功提示
    setTimeout(() => {
      alert(
        `✅ 批量创建完成！\n\n` +
        `创建节点数: ${nodeConfigs.length}\n` +
        `耗时: ${duration} 秒\n` +
        `平均速度: ${(nodeConfigs.length / duration).toFixed(0)} 节点/秒\n\n` +
        `提示: 可以使用 Ctrl+Z 撤销此操作`
      );
    }, 500);

    console.log(`[Debug Mode] Batch creation completed in ${duration}s`);
  } catch (error) {
    console.error('[Debug Mode] Error:', error);
    alert(`❌ 创建失败：${error.message}`);
  } finally {
    isCreatingNodes.value = false;
  }
};
</script>

<style scoped>
.editor-header {
  height: var(--header-height);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-md);
  user-select: none;
}

.header-left,
.header-center,
.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-center {
  flex: 1;
  justify-content: center;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: 500;
}

.logo-icon {
  font-size: 24px;
}

.project-name {
  margin-left: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 400;
}

/* 工具栏 */
.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--border-light);
}

.toolbar-btn:active:not(:disabled) {
  background: var(--bg-active);
}

.toolbar-btn.active {
  background: var(--primary-color);
  color: white;
}

.toolbar-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.toolbar-btn .icon {
  font-size: 16px;
}

/* 调试按钮 */
.debug-btn {
  position: relative;
}

.debug-btn.loading {
  opacity: 0.6;
  cursor: wait;
}

.debug-btn.loading .icon {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.9);
  }
}

/* 缩放控制 */
.zoom-controls {
  gap: var(--spacing-xs);
}

.zoom-value {
  min-width: 50px;
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* 分割线 */
.divider-vertical {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 var(--spacing-sm);
}
</style>

