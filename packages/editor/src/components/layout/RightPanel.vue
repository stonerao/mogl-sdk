<template>
    <div class="right-panel panel border-l" :style="{ width: 'var(--panel-width)' }">
        <!-- 标签页切换 -->
        <Tabs v-model="activeTab" :tabs="tabs" />

        <!-- 面板内容 -->
        <div class="panel-content flex-1">
            <!-- 属性编辑器 -->
            <div v-show="activeTab === 'properties'" class="h-full">
                <PropertyEditor />
            </div>

            <!-- 事件管理 -->
            <div v-show="activeTab === 'events'" class="h-full">
                <EventEditor />
            </div>

            <!-- 场景设置 -->
            <div v-show="activeTab === 'scene'" class="h-full">
                <SceneSettings />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Tabs from '@/components/ui/Tabs.vue';
import PropertyEditor from '@/components/panels/PropertyEditor.vue';
import EventEditor from '@/components/panels/EventEditor.vue';
import SceneSettings from '@/components/panels/SceneSettings.vue';

const activeTab = ref('properties');

const tabs = [
    { key: 'properties', label: '属性编辑' },
    { key: 'events', label: '事件管理' },
    { key: 'scene', label: '场景设置' }
];
</script>

<style scoped>
.right-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
}
</style>

