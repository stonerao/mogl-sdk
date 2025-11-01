<template>
  <div class="global-event-panel">
    <!-- 工具栏 -->
    <div class="toolbar">
      <!-- 搜索框 -->
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索全局事件..."
          class="search-input"
        >
      </div>

      <!-- 操作按钮 -->
      <div class="toolbar-actions">
        <button class="btn-primary" @click="handleCreateEvent">
          <!-- <span class="icon">➕</span> -->
          <span class="label">新建</span>
        </button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <select v-model="filterType" class="filter-select">
        <option :value="null">全部类型</option>
        <option value="click">点击事件</option>
        <option value="state-changed">状态变化</option>
        <option value="data-updated">数据更新</option>
        <option value="loaded">加载完成</option>
        <option value="custom">自定义事件</option>
      </select>
    </div>

    <!-- 事件列表 -->
    <div class="event-list custom-scrollbar">
      <!-- 空状态 -->
      <div v-if="filteredEvents.length === 0" class="empty-state">
        <span class="empty-icon">⚡</span>
        <p class="empty-message">{{ searchQuery ? '未找到匹配的事件' : '暂无全局事件' }}</p>
        <button v-if="!searchQuery" class="btn-secondary" @click="handleCreateEvent">
          创建第一个全局事件
        </button>
      </div>

      <!-- 事件卡片 -->
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="event-card"
        :class="{ selected: selectedEventId === event.id }"
        @click="handleSelectEvent(event.id)"
      >
        <!-- 事件头部 -->
        <div class="event-header">
          <div class="event-info">
            <span class="event-icon">⚡</span>
            <div class="event-title-group">
              <h4 class="event-name">{{ event.name }}</h4>
              <span class="event-type">{{ getEventTypeLabel(event.eventType) }}</span>
            </div>
          </div>
          <div class="event-actions">
            <button
              class="action-btn"
              title="编辑"
              @click.stop="handleEditEvent(event.id)"
            >
              ✏️
            </button>
            <button
              class="action-btn"
              title="复制"
              @click.stop="handleDuplicateEvent(event.id)"
            >
              📋
            </button>
            <button
              class="action-btn danger"
              title="删除"
              @click.stop="handleDeleteEvent(event.id)"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- 事件描述 -->
        <p v-if="event.description" class="event-description">
          {{ event.description }}
        </p>

        <!-- 事件统计 -->
        <div class="event-stats">
          <div class="stat-item">
            <span class="stat-label">引用数:</span>
            <span class="stat-value">{{ getEventReferenceCount(event.id) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">条件:</span>
            <span class="stat-value">{{ event.conditions?.length || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">动作:</span>
            <span class="stat-value">{{ event.actions?.length || 0 }}</span>
          </div>
        </div>

        <!-- 展开详情 -->
        <div v-if="selectedEventId === event.id" class="event-details">
          <div class="detail-section">
            <h5 class="section-title">触发条件</h5>
            <div v-if="event.conditions && event.conditions.length > 0" class="condition-list">
              <div
                v-for="(condition, index) in event.conditions"
                :key="index"
                class="condition-item"
              >
                {{ formatCondition(condition) }}
              </div>
            </div>
            <p v-else class="no-data">无条件（总是触发）</p>
          </div>

          <div class="detail-section">
            <h5 class="section-title">执行动作</h5>
            <div v-if="event.actions && event.actions.length > 0" class="action-list">
              <div
                v-for="(action, index) in event.actions"
                :key="index"
                class="action-item"
              >
                {{ formatAction(action) }}
              </div>
            </div>
            <p v-else class="no-data">无动作</p>
          </div>

          <div class="detail-section">
            <h5 class="section-title">引用节点</h5>
            <div v-if="getEventReferences(event.id).length > 0" class="reference-list">
              <div
                v-for="nodeId in getEventReferences(event.id)"
                :key="nodeId"
                class="reference-item"
              >
                {{ getNodeName(nodeId) }}
              </div>
            </div>
            <p v-else class="no-data">未被任何节点引用</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 事件编辑对话框 -->
    <GlobalEventEditorDialog
      v-if="showEditorDialog"
      :event-id="editingEventId"
      @close="handleCloseEditor"
      @save="handleSaveEvent"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useGlobalEventsStore } from '@/store/modules/globalEvents.js';
import { useEditorStore } from '@/store';
import GlobalEventEditorDialog from './GlobalEventEditorDialog.vue';

// ========== Store ==========

const globalEventsStore = useGlobalEventsStore();
const editorStore = useEditorStore();

const { filteredEvents, selectedEventId } = storeToRefs(globalEventsStore);

// ========== 状态 ==========

const searchQuery = ref('');
const filterType = ref(null);
const showEditorDialog = ref(false);
const editingEventId = ref(null);

// ========== 计算属性 ==========

// 监听搜索关键词变化
watch(searchQuery, (newValue) => {
  globalEventsStore.setSearchQuery(newValue);
});

// 监听筛选类型变化
watch(filterType, (newValue) => {
  globalEventsStore.setFilterType(newValue);
});

// ========== 方法 ==========

/**
 * 创建新事件
 */
function handleCreateEvent() {
  editingEventId.value = null;
  showEditorDialog.value = true;
}

/**
 * 编辑事件
 */
function handleEditEvent(eventId) {
  editingEventId.value = eventId;
  showEditorDialog.value = true;
}

/**
 * 复制事件
 */
function handleDuplicateEvent(eventId) {
  const newEventId = globalEventsStore.duplicateEvent(eventId);
  if (newEventId) {
    globalEventsStore.selectEvent(newEventId);
  }
}

/**
 * 删除事件
 */
function handleDeleteEvent(eventId) {
  const event = globalEventsStore.events.get(eventId);
  if (!event) return;

  // 检查是否被引用
  const refCount = globalEventsStore.getEventReferenceCount(eventId);
  if (refCount > 0) {
    alert(`无法删除事件"${event.name}"，因为它被 ${refCount} 个节点引用。\n请先解除所有引用。`);
    return;
  }

  if (confirm(`确定要删除事件"${event.name}"吗？`)) {
    globalEventsStore.deleteEvent(eventId);
  }
}

/**
 * 选中事件
 */
function handleSelectEvent(eventId) {
  if (selectedEventId.value === eventId) {
    globalEventsStore.clearSelection();
  } else {
    globalEventsStore.selectEvent(eventId);
  }
}

/**
 * 关闭编辑器
 */
function handleCloseEditor() {
  showEditorDialog.value = false;
  editingEventId.value = null;
}

/**
 * 保存事件
 */
function handleSaveEvent(eventData) {
  if (editingEventId.value) {
    // 更新现有事件
    globalEventsStore.updateEvent(editingEventId.value, eventData);
  } else {
    // 创建新事件
    globalEventsStore.addEvent(eventData);
  }
  handleCloseEditor();
}

/**
 * 获取事件类型标签
 */
function getEventTypeLabel(type) {
  const labels = {
    'click': '点击',
    'state-changed': '状态变化',
    'data-updated': '数据更新',
    'loaded': '加载完成',
    'destroyed': '销毁',
    'hidden': '隐藏',
    'shown': '显示',
    'custom': '自定义'
  };
  return labels[type] || type;
}

/**
 * 获取事件引用数量
 */
function getEventReferenceCount(eventId) {
  return globalEventsStore.getEventReferenceCount(eventId);
}

/**
 * 获取事件引用节点列表
 */
function getEventReferences(eventId) {
  return globalEventsStore.getEventReferences(eventId);
}

/**
 * 获取节点名称
 */
function getNodeName(nodeId) {
  const node = editorStore.getNodeById(nodeId);
  return node ? node.nodeName : `节点 ${nodeId}`;
}

/**
 * 格式化条件
 */
function formatCondition(condition) {
  if (!condition) return '';
  return `${condition.field} ${condition.operator} ${condition.value}`;
}

/**
 * 格式化动作
 */
function formatAction(action) {
  if (!action) return '';
  return `${action.type}: ${action.target || ''}`;
}
</script>

<style scoped>
.global-event-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-secondary);
}

/* 工具栏 */
.toolbar {
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
  height: 32px;
  padding: 0 var(--spacing-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-fast);
}

.search-input:focus {
  border-color: var(--primary-color);
}

.toolbar-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

/* 筛选器 */
.filters {
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.filter-select {
  width: 100%;
  height: 32px;
  padding: 0 var(--spacing-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

/* 事件列表 */
.event-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
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
  opacity: 0.3;
}

.empty-message {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

/* 事件卡片 */
.event-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.event-card:hover {
  border-color: var(--border-light);
  background: var(--bg-hover);
}

.event-card.selected {
  border-color: var(--primary-color);
  background: var(--bg-active);
}

.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.event-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.event-icon {
  font-size: 20px;
}

.event-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-name {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
}

.event-type {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.event-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.action-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 14px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.action-btn:hover {
  background: var(--bg-hover);
}

.action-btn.danger:hover {
  background: var(--accent-danger);
}

.event-description {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

.event-stats {
  display: flex;
  gap: var(--spacing-md);
  padding-top: var(--spacing-xs);
  border-top: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
}

.stat-label {
  color: var(--text-secondary);
}

.stat-value {
  color: var(--primary-color);
  font-weight: 500;
}

/* 事件详情 */
.event-details {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.section-title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.condition-list,
.action-list,
.reference-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.condition-item,
.action-item,
.reference-item {
  padding: var(--spacing-xs);
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.no-data {
  margin: 0;
  padding: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-disabled);
  font-style: italic;
}
</style>

