<template>
  <div class="json-viewer-panel">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <span class="title">📄 JSON 数据</span>
        <span class="stats">{{ stats }}</span>
      </div>
      <div class="toolbar-right">
        <button
          class="toolbar-btn"
          :class="{ active: prettify }"
          @click="togglePrettify"
          title="格式化/压缩"
        >
          {{ prettify ? '📋 格式化' : '📦 压缩' }}
        </button>
        <button
          class="toolbar-btn"
          @click="copyToClipboard"
          title="复制到剪贴板"
        >
          📋 复制
        </button>
        <button
          class="toolbar-btn"
          @click="downloadJson"
          title="下载 JSON 文件"
        >
          💾 下载
        </button>
        <button
          class="toolbar-btn close-btn"
          @click="$emit('close')"
          title="关闭"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索 JSON 内容..."
        @input="handleSearch"
      />
      <span v-if="searchResults.length > 0" class="search-results">
        {{ searchResults.length }} 个结果
      </span>
    </div>

    <!-- JSON 内容 -->
    <div class="json-content custom-scrollbar">
      <pre v-if="!searchQuery" class="json-text">{{ jsonString }}</pre>
      <pre v-else class="json-text" v-html="highlightedJson"></pre>
    </div>

    <!-- 复制成功提示 -->
    <div v-if="showCopySuccess" class="copy-success">
      ✅ 已复制到剪贴板
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useEditorStore } from '../../store/modules/editor.js';
import { useCanvasStore } from '../../store/modules/canvas.js';
import { useProjectStore } from '../../store/modules/project.js';
import { ProjectExporter } from '../../core/io/ProjectExporter.js';

// Props
const props = defineProps({
  autoUpdate: {
    type: Boolean,
    default: true
  }
});

// Emits
const emit = defineEmits(['close']);

// Stores
const editorStore = useEditorStore();
const canvasStore = useCanvasStore();
const projectStore = useProjectStore();

// 状态
const prettify = ref(true);
const searchQuery = ref('');
const searchResults = ref([]);
const showCopySuccess = ref(false);

// 计算 JSON 字符串
const jsonString = computed(() => {
  return ProjectExporter.exportToString({
    projectName: projectStore.metadata.name,
    nodes: editorStore.allNodes,
    canvasConfig: {
      width: canvasStore.canvasSize.width,
      height: canvasStore.canvasSize.height,
      zoom: canvasStore.zoom,
      panOffset: canvasStore.panOffset,
      grid: {
        enabled: canvasStore.gridEnabled,
        size: canvasStore.gridSize,
        snap: canvasStore.snapToGrid
      }
    },
    metadata: projectStore.metadata,
    prettify: prettify.value
  });
});

// 统计信息
const stats = computed(() => {
  const stats = ProjectExporter.getExportStats({
    projectName: projectStore.metadata.name,
    nodes: editorStore.allNodes,
    canvasConfig: {
      width: canvasStore.canvasSize.width,
      height: canvasStore.canvasSize.height,
      zoom: canvasStore.zoom,
      panOffset: canvasStore.panOffset
    },
    metadata: projectStore.metadata
  });

  return `${stats.totalNodes} 个节点 | ${stats.fileSizeKB} KB`;
});

// 高亮搜索结果
const highlightedJson = computed(() => {
  if (!searchQuery.value) return jsonString.value;

  const query = searchQuery.value.toLowerCase();
  const lines = jsonString.value.split('\n');
  const highlighted = [];

  lines.forEach(line => {
    if (line.toLowerCase().includes(query)) {
      // 高亮匹配的行
      const regex = new RegExp(`(${escapeRegex(searchQuery.value)})`, 'gi');
      const highlightedLine = line.replace(regex, '<mark>$1</mark>');
      highlighted.push(highlightedLine);
    } else {
      highlighted.push(line);
    }
  });

  return highlighted.join('\n');
});

/**
 * 转义正则表达式特殊字符
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 切换格式化/压缩
 */
function togglePrettify() {
  prettify.value = !prettify.value;
}

/**
 * 复制到剪贴板
 */
async function copyToClipboard() {
  const success = await ProjectExporter.copyToClipboard({
    projectName: projectStore.metadata.name,
    nodes: editorStore.allNodes,
    canvasConfig: {
      width: canvasStore.canvasSize.width,
      height: canvasStore.canvasSize.height,
      zoom: canvasStore.zoom,
      panOffset: canvasStore.panOffset,
      grid: {
        enabled: canvasStore.gridEnabled,
        size: canvasStore.gridSize,
        snap: canvasStore.snapToGrid
      }
    },
    metadata: projectStore.metadata,
    prettify: prettify.value
  });

  if (success) {
    showCopySuccess.value = true;
    setTimeout(() => {
      showCopySuccess.value = false;
    }, 2000);
  }
}

/**
 * 下载 JSON 文件
 */
function downloadJson() {
  ProjectExporter.export({
    projectName: projectStore.metadata.name,
    nodes: editorStore.allNodes,
    canvasConfig: {
      width: canvasStore.canvasSize.width,
      height: canvasStore.canvasSize.height,
      zoom: canvasStore.zoom,
      panOffset: canvasStore.panOffset,
      grid: {
        enabled: canvasStore.gridEnabled,
        size: canvasStore.gridSize,
        snap: canvasStore.snapToGrid
      }
    },
    metadata: projectStore.metadata,
    prettify: prettify.value
  });
}

/**
 * 处理搜索
 */
function handleSearch() {
  if (!searchQuery.value) {
    searchResults.value = [];
    return;
  }

  const query = searchQuery.value.toLowerCase();
  const lines = jsonString.value.split('\n');
  const results = [];

  lines.forEach((line, index) => {
    if (line.toLowerCase().includes(query)) {
      results.push({ line: index + 1, content: line.trim() });
    }
  });

  searchResults.value = results;
}
</script>

<style scoped>
.json-viewer-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 8px;
  overflow: hidden;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #252526;
  border-bottom: 1px solid #3e3e42;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: #cccccc;
}

.stats {
  font-size: 12px;
  color: #858585;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  padding: 6px 12px;
  font-size: 12px;
  background: #3e3e42;
  color: #cccccc;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #505050;
}

.toolbar-btn.active {
  background: #0e639c;
  color: #ffffff;
}

.close-btn:hover {
  background: #f48771;
  color: #ffffff;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #252526;
  border-bottom: 1px solid #3e3e42;
}

.search-input {
  flex: 1;
  padding: 6px 12px;
  font-size: 13px;
  background: #3c3c3c;
  color: #cccccc;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  outline: none;
}

.search-input:focus {
  border-color: #0e639c;
}

.search-results {
  font-size: 12px;
  color: #858585;
}

/* JSON 内容 */
.json-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.json-text {
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #d4d4d4;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 搜索高亮 */
.json-text :deep(mark) {
  background: #f9a825;
  color: #000000;
  padding: 2px 4px;
  border-radius: 2px;
}

/* 复制成功提示 */
.copy-success {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 24px;
  background: #4caf50;
  color: #ffffff;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  10%, 90% { opacity: 1; }
}

/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 5px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #4e4e4e;
}
</style>

