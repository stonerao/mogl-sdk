<template>
    <div class="editor-layout flex flex-col w-full h-full">
        <!-- 顶部工具栏 -->
        <ErrorBoundary>
            <TopToolbar />
        </ErrorBoundary>

        <!-- 主内容区域：左-中-右三栏布局 -->
        <div class="editor-main flex flex-1 overflow-hidden">
            <!-- 左侧面板 -->
            <ErrorBoundary v-if="editorStore.showLeftPanel">
                <LeftPanel />
            </ErrorBoundary>

            <!-- 中间画布区域 -->
            <ErrorBoundary>
                <CenterCanvas class="flex-1" />
            </ErrorBoundary>

            <!-- 右侧面板 -->
            <ErrorBoundary v-if="editorStore.showRightPanel">
                <RightPanel />
            </ErrorBoundary>
        </div>
    </div>
</template>

<script setup>
import { useEditorStore } from '@/stores/useEditorStore';
import ErrorBoundary from '@/components/ui/ErrorBoundary.vue';
import TopToolbar from './TopToolbar.vue';
import LeftPanel from './LeftPanel.vue';
import CenterCanvas from './CenterCanvas.vue';
import RightPanel from './RightPanel.vue';

const editorStore = useEditorStore();
</script>

<style scoped>
.editor-layout {
    background-color: var(--color-bg-secondary);
}

.editor-main {
    height: calc(100vh - var(--toolbar-height));
}
</style>

