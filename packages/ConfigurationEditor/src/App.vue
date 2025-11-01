<template>
  <div id="app">
    <!-- 顶部工具栏 -->
    <Header
      @new-project="handleNewProject"
      @import-project="handleImportProject"
      @export-project="handleExportProject"
      @toggle-json-viewer="toggleJsonViewer"
    />

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 左侧组件库面板 -->
      <LeftPanel />

      <!-- 中间画布区域 -->
      <Canvas ref="canvasRef" />

      <!-- 右侧属性配置面板 -->
      <RightPanel />
    </main>

    <!-- JSON 查看器（弹窗） -->
    <div v-if="showJsonViewer" class="json-viewer-modal">
      <div class="modal-backdrop" @click="closeJsonViewer" />
      <div class="modal-content">
        <JsonViewerPanel @close="closeJsonViewer" />
      </div>
    </div>

    <!-- 确认对话框 -->
    <div v-if="showConfirmDialog" class="confirm-dialog-modal">
      <div class="modal-backdrop" @click="cancelConfirm" />
      <div class="confirm-dialog">
        <div class="dialog-header">
          <span class="dialog-icon">⚠️</span>
          <h3 class="dialog-title">{{ confirmDialog.title }}</h3>
        </div>
        <div class="dialog-body">
          <p class="dialog-message">{{ confirmDialog.message }}</p>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn cancel-btn" @click="cancelConfirm">
            取消
          </button>
          <button class="dialog-btn confirm-btn" @click="confirmAction">
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Header from '@/components/layout/Header.vue';
import LeftPanel from '@/components/layout/LeftPanel.vue';
import Canvas from '@/components/layout/Canvas.vue';
import RightPanel from '@/components/layout/RightPanel.vue';
import JsonViewerPanel from '@/components/editor/JsonViewerPanel.vue';
import { useProjectStore } from '@/store/modules/project.js';

// Store
const projectStore = useProjectStore();

// 引用
const canvasRef = ref(null);

// 状态
const showJsonViewer = ref(false);
const showConfirmDialog = ref(false);
const confirmDialog = ref({
  title: '',
  message: '',
  onConfirm: null
});

/**
 * 切换 JSON 查看器
 */
function toggleJsonViewer() {
  showJsonViewer.value = !showJsonViewer.value;
}

/**
 * 关闭 JSON 查看器
 */
function closeJsonViewer() {
  showJsonViewer.value = false;
}

/**
 * 新建工程
 */
function handleNewProject() {
  // 检查是否有未保存的更改
  if (projectStore.hasUnsavedChanges) {
    showConfirmDialog.value = true;
    confirmDialog.value = {
      title: '新建工程',
      message: '当前工程有未保存的更改，是否继续？',
      onConfirm: () => {
        window.dispatchEvent(new CustomEvent('project:new'));
        showConfirmDialog.value = false;
      }
    };
  } else {
    window.dispatchEvent(new CustomEvent('project:new'));
  }
}

/**
 * 导入工程
 */
function handleImportProject() {
  // 检查是否有未保存的更改
  if (projectStore.hasUnsavedChanges) {
    showConfirmDialog.value = true;
    confirmDialog.value = {
      title: '导入工程',
      message: '当前工程有未保存的更改，是否继续？',
      onConfirm: () => {
        window.dispatchEvent(new CustomEvent('project:import'));
        showConfirmDialog.value = false;
      }
    };
  } else {
    window.dispatchEvent(new CustomEvent('project:import'));
  }
}

/**
 * 导出工程
 */
function handleExportProject() {
  window.dispatchEvent(new CustomEvent('project:export'));
}

/**
 * 确认操作
 */
function confirmAction() {
  if (confirmDialog.value.onConfirm) {
    confirmDialog.value.onConfirm();
  }
}

/**
 * 取消确认
 */
function cancelConfirm() {
  showConfirmDialog.value = false;
}
</script>

<style>
/* 导入全局样式 */
@import '@/assets/styles/variables.css';
@import '@/assets/styles/reset.css';
@import '@/assets/styles/global.css';

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* JSON 查看器模态框 */
.json-viewer-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
}

.modal-content {
  position: relative;
  width: 80%;
  height: 80%;
  max-width: 1200px;
  max-height: 800px;
  z-index: 1001;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

/* 确认对话框 */
.confirm-dialog-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-dialog {
  position: relative;
  width: 400px;
  background: #2d2d30;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 2001;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #252526;
  border-bottom: 1px solid #3e3e42;
}

.dialog-icon {
  font-size: 24px;
}

.dialog-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #cccccc;
}

.dialog-body {
  padding: 20px;
}

.dialog-message {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #cccccc;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  background: #252526;
  border-top: 1px solid #3e3e42;
}

.dialog-btn {
  padding: 8px 20px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #3e3e42;
  color: #cccccc;
}

.cancel-btn:hover {
  background: #505050;
}

.confirm-btn {
  background: #0e639c;
  color: #ffffff;
}

.confirm-btn:hover {
  background: #1177bb;
}
</style>

