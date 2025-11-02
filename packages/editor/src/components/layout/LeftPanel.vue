<template>
    <div class="left-panel panel" :style="{ width: 'var(--panel-width)' }">
        <!-- 标签页切换 -->
        <Tabs v-model="activeTab" :tabs="tabs" />

        <!-- 面板内容 -->
        <div class="panel-content flex-1 overflow-hidden">
            <!-- 组件库 -->
            <div v-show="activeTab === 'components'" class="h-full">
                <ComponentLibrary @component-added="handleComponentAdded" />
            </div>

            <!-- 结构树 -->
            <div v-show="activeTab === 'tree'" class="h-full">
                <SceneTree
                    @component-selected="handleComponentSelected"
                    @component-deleted="handleComponentDeleted"
                />
            </div>

            <!-- 资源库 -->
            <div v-show="activeTab === 'assets'" class="h-full">
                <AssetLibrary @asset-selected="handleAssetSelected" @asset-used="handleAssetUsed" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Tabs from '@/components/ui/Tabs.vue';
import ComponentLibrary from '@/components/panels/ComponentLibrary.vue';
import SceneTree from '@/components/panels/SceneTree.vue';
import AssetLibrary from '@/components/panels/AssetLibrary.vue';

const activeTab = ref('components');

const tabs = [
    { key: 'components', label: '组件库' },
    { key: 'tree', label: '结构树' },
    { key: 'assets', label: '资源库' }
];

/**
 * 组件添加后切换到结构树
 */
const handleComponentAdded = (component) => {
    console.log('Component added:', component);
    activeTab.value = 'tree';
};

/**
 * 组件选中
 */
const handleComponentSelected = (componentId) => {
    console.log('Component selected:', componentId);
};

/**
 * 组件删除
 */
const handleComponentDeleted = (componentId) => {
    console.log('Component deleted:', componentId);
};

/**
 * 资源选中
 */
const handleAssetSelected = (asset) => {
    console.log('Asset selected:', asset);
};

/**
 * 资源使用
 */
const handleAssetUsed = (asset) => {
    console.log('Asset used:', asset);
    // 如果是模型资源，切换到结构树
    if (asset.category === 'model') {
        activeTab.value = 'tree';
    }
};
</script>

<style scoped>
.left-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
}
</style>

