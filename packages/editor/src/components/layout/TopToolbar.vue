<template>
    <div class="top-toolbar toolbar" :style="{ height: 'var(--toolbar-height)' }">
        <!-- Logo 区域 -->
        <div class="flex items-center gap-2">
            <div class="text-lg font-bold text-primary-600">W3D Editor</div>
            <div v-if="projectStore.hasUnsavedChanges" class="text-xs text-orange-500">●</div>
        </div>

        <div class="toolbar-divider"></div>

        <!-- 操作按钮区域 -->
        <div class="flex items-center gap-2">
            <!-- 撤回/重做 -->
            <button
                class="toolbar-btn"
                :class="{ 'text-gray-900': historyStore.canUndo, 'text-gray-400': !historyStore.canUndo }"
                :disabled="!historyStore.canUndo"
                title="撤回 (Ctrl+Z)"
                @click="handleUndo"
            >
                <span>↶</span>
            </button>
            <button
                class="toolbar-btn"
                :class="{ 'text-gray-900': historyStore.canRedo, 'text-gray-400': !historyStore.canRedo }"
                :disabled="!historyStore.canRedo"
                title="重做 (Ctrl+Y)"
                @click="handleRedo"
            >
                <span>↷</span>
            </button>

            <div class="toolbar-divider"></div>

            <!-- 保存/加载 -->
            <button class="toolbar-btn" title="保存项目 (Ctrl+S)" @click="handleSave">
                <span>💾</span>
            </button>

            <button class="toolbar-btn" title="加载项目" @click="handleLoad">
                <span>📂</span>
            </button>

            <div class="toolbar-divider"></div>

            <!-- 导入/导出 -->
            <button class="toolbar-btn" title="导入 JSON" @click="handleImport">
                <span>📤</span>
            </button>

            <button class="toolbar-btn" title="导出 JSON" @click="handleExport">
                <span>📥</span>
            </button>
        </div>

        <!-- 中间区域 - 项目名称 -->
        <div class="flex-1 flex items-center justify-center">
            <div class="text-sm text-gray-600">
                {{ projectStore.projectName }}
                <span v-if="projectStore.lastSavedAt" class="text-xs text-gray-400 ml-2">
                    最后保存: {{ formatTime(projectStore.lastSavedAt) }}
                </span>
            </div>
        </div>

        <!-- 右侧区域 - 面板切换 -->
        <div class="flex items-center gap-2">
            <button
                class="toolbar-btn"
                :class="{ 'bg-primary-50': editorStore.showLeftPanel }"
                title="切换左侧面板"
                @click="editorStore.toggleLeftPanel"
            >
                <span>◧</span>
            </button>
            <button
                class="toolbar-btn"
                :class="{ 'bg-primary-50': editorStore.showRightPanel }"
                title="切换右侧面板"
                @click="editorStore.toggleRightPanel"
            >
                <span>◨</span>
            </button>
        </div>

        <!-- 隐藏的文件输入 -->
        <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleFileSelect"
        />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useEditorStore } from '@/stores/useEditorStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { useProjectStore } from '@/stores/useProjectStore';

const editorStore = useEditorStore();
const historyStore = useHistoryStore();
const projectStore = useProjectStore();

const fileInputRef = ref(null);

// 撤回
const handleUndo = async () => {
    try {
        await historyStore.undo();
    } catch (error) {
        console.error('撤回失败:', error);
        alert('撤回失败，请查看控制台');
    }
};

// 重做
const handleRedo = async () => {
    try {
        await historyStore.redo();
    } catch (error) {
        console.error('重做失败:', error);
        alert('重做失败，请查看控制台');
    }
};

// 保存项目
const handleSave = () => {
    const success = projectStore.saveToLocalStorage();
    if (success) {
        alert('项目已保存到本地存储');
    } else {
        alert('保存失败，请查看控制台');
    }
};

// 加载项目
const handleLoad = async () => {
    if (projectStore.hasUnsavedChanges) {
        const confirmed = confirm('当前有未保存的更改，确定要加载项目吗？');
        if (!confirmed) return;
    }

    const success = await projectStore.loadFromLocalStorage();
    if (success) {
        alert('项目已从本地存储加载\n注意：组件实例需要手动重新创建');
    } else {
        alert('没有找到保存的项目');
    }
};

// 导入 JSON
const handleImport = () => {
    if (projectStore.hasUnsavedChanges) {
        const confirmed = confirm('当前有未保存的更改，确定要导入项目吗？');
        if (!confirmed) return;
    }

    fileInputRef.value?.click();
};

// 文件选择处理
const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        await projectStore.importFromJSON(file);
        alert('项目已导入\n注意：组件实例需要手动重新创建');
    } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败，请检查 JSON 文件格式');
    }

    // 清空文件输入
    event.target.value = '';
};

// 导出 JSON
const handleExport = () => {
    const success = projectStore.exportToJSON();
    if (success) {
        console.log('项目已导出为 JSON 文件');
    } else {
        alert('导出失败，请查看控制台');
    }
};

// 格式化时间
const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    // 小于1分钟
    if (diff < 60000) {
        return '刚刚';
    }
    // 小于1小时
    if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
    }
    // 小于1天
    if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
    }
    // 显示日期
    return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};
</script>

<style scoped>
.top-toolbar {
    box-shadow: var(--shadow-sm);
}

.toolbar-btn {
    @apply px-3 py-1.5 rounded text-sm font-medium transition-colors;
    @apply hover:bg-gray-100 active:bg-gray-200;
    @apply disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent;
}

.toolbar-btn:not(:disabled):hover {
    background-color: var(--color-bg-tertiary);
}
</style>

