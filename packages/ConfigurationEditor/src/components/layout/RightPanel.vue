<template>
  <aside class="right-panel" :class="{ collapsed: isCollapsed }">
    <!-- 面板头部 -->
    <div class="panel-header">
      <button class="collapse-btn" @click="toggleCollapse">
        <span class="icon">{{ isCollapsed ? '◀' : '▶' }}</span>
      </button>
      <span v-if="!isCollapsed" class="panel-title">属性配置</span>
    </div>

    <!-- 面板内容 -->
    <div v-if="!isCollapsed" class="panel-content custom-scrollbar">
      <!-- 选项卡 -->
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <!-- <span class="tab-icon">{{ tab.icon }}</span> -->
          <span class="tab-label">{{ tab.label }}</span>
        </div>
      </div>

      <!-- 选项卡内容 -->
      <div class="tab-content">
        <!-- 属性面板 -->
        <PropertyPanel v-if="activeTab === 'properties'" />

        <!-- 数据源面板 -->
        <DataSourcePanel v-if="activeTab === 'datasource'" />

        <!-- 事件面板 -->
        <EventPanel v-if="activeTab === 'events'" />
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useEditorStore } from '@/store';
import PropertyPanel from '../editor/PropertyPanel.vue';
import DataSourcePanel from '../editor/DataSourcePanel.vue';
import EventPanel from '../editor/EventPanel.vue';

// Store
const editorStore = useEditorStore();
const { hasSelection } = storeToRefs(editorStore);

// 状态
const isCollapsed = ref(false);
const activeTab = ref('properties');

// 选项卡配置
const tabs = [
  { key: 'properties', label: '属性', icon: '⚙️' },
  { key: 'datasource', label: '数据源', icon: '🗄️' },
  { key: 'events', label: '事件', icon: '⚡' }
];

// 监听选择变化，自动切换到属性标签页
watch(hasSelection, (newValue) => {
  if (newValue && activeTab.value !== 'properties') {
    activeTab.value = 'properties';
  }
});

// 方法
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.right-panel {
  width: var(--right-panel-width);
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
}

.right-panel.collapsed {
  width: var(--panel-collapsed-width);
}

/* 面板头部 */
.panel-header {
  height: 40px;
  padding: 0 var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.panel-title {
  flex: 1;
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
}

.collapse-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.collapse-btn:hover {
  background: var(--bg-hover);
}

.collapse-btn .icon {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 面板内容 */
.panel-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 选项卡 */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.tab-item:hover {
  background: var(--bg-hover);
}

.tab-item.active {
  border-bottom-color: var(--primary-color);
  color: var(--primary-color);
}

.tab-icon {
  font-size: 16px;
}

.tab-label {
  font-size: var(--font-size-sm);
}

/* 选项卡内容 */
.tab-content {
  flex: 1;
  padding: var(--spacing-md);
}

/* 属性组 */
.property-groups {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.property-group {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.group-header {
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.property-item {
  padding: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
}

.property-item:first-child {
  border-top: none;
}

.property-row {
  display: flex;
  gap: var(--spacing-sm);
}

.property-row .property-item {
  flex: 1;
  border: none;
  padding: var(--spacing-sm) 0;
}

.property-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.property-input {
  width: 100%;
  height: 28px;
  padding: 0 var(--spacing-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.property-input:focus {
  border-color: var(--primary-color);
}

.property-color {
  width: 100%;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.property-slider {
  width: 100%;
  margin-right: var(--spacing-sm);
}

.property-value {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
}

.property-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.property-select {
  width: 100%;
  height: 28px;
  padding: 0 var(--spacing-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.property-select:focus {
  border-color: var(--primary-color);
}

.property-textarea {
  width: 100%;
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  resize: vertical;
  font-family: inherit;
}

.property-textarea:focus {
  border-color: var(--primary-color);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.slider-container .property-slider {
  flex: 1;
  margin: 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.empty-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
</style>

