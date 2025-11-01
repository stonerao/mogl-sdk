<template>
  <div class="event-panel">
    <!-- 工具栏 -->
    <div class="toolbar">
      <button class="btn btn-primary" @click="handleCreateEvent">
        <!-- <span class="icon"> </span> -->
        <span>新建 </span>
      </button>

      <button class="btn btn-secondary" @click="handleReferenceGlobalEvent">
        <span class="icon">🔗</span>
        <span>引用全局事件</span>
      </button>

      <button class="btn" @click="handleRefresh">
        <span class="icon">🔄</span>
      </button>

      <button
        class="btn"
        :class="{ active: debugMode }"
        @click="toggleDebugMode"
      >
        <span class="icon">🐛</span>
        <span>调试</span>
      </button>

      <div class="spacer"></div>

      <div class="stats">
        <span class="stat-item">
          <span class="stat-label">总计:</span>
          <span class="stat-value">{{ statistics.totalEvents }}</span>
        </span>
        <span class="stat-item">
          <span class="stat-label">启用:</span>
          <span class="stat-value success">{{ statistics.enabledEvents }}</span>
        </span>
        <span class="stat-item">
          <span class="stat-label">禁用:</span>
          <span class="stat-value disabled">{{ statistics.disabledEvents }}</span>
        </span>
      </div>
    </div>

    <!-- 循环依赖警告 -->
    <div v-if="circularDependencies.length > 0" class="warning-banner">
      <span class="icon">⚠️</span>
      <span>检测到 {{ circularDependencies.length }} 个循环依赖</span>
      <button class="btn-link" @click="showCircularDependencies">查看详情</button>
    </div>

    <!-- 主内容区 -->
    <div class="content">
      <!-- 空状态 -->
      <div v-if="allEvents.length === 0" class="empty-state">
        <span class="empty-icon">⚡</span>
        <p class="empty-text">暂无事件配置</p>
        <p class="empty-desc">点击"新建事件"按钮创建第一个事件</p>
      </div>

      <!-- 事件列表 -->
      <div v-else class="event-list custom-scrollbar">
        <div
          v-for="event in allEvents"
          :key="event.id"
          class="event-item"
          :class="{
            selected: selectedEventId === event.id,
            disabled: event.status === 'disabled'
          }"
          @click="selectEvent(event.id)"
        >
          <!-- 事件头部 -->
          <div class="event-header">
            <div class="event-info">
              <span class="event-icon">{{ getEventIcon(event.eventType) }}</span>
              <div class="event-details">
                <div class="event-name">{{ event.name }}</div>
                <div class="event-meta">
                  <span class="event-type">{{ getEventTypeLabel(event.eventType) }}</span>
                  <span v-if="event.nodeId" class="event-node">节点: {{ getNodeName(event.nodeId) }}</span>
                </div>
              </div>
            </div>

            <div class="event-actions">
              <button
                class="btn-icon"
                :class="{ active: event.status === 'enabled' }"
                @click.stop="toggleEventStatus(event.id)"
                :title="event.status === 'enabled' ? '禁用' : '启用'"
              >
                {{ event.status === 'enabled' ? '✓' : '✗' }}
              </button>

              <button
                class="btn-icon"
                @click.stop="handleTestEvent(event.id)"
                title="测试事件"
              >
                ▶
              </button>

              <button
                class="btn-icon"
                @click.stop="handleEditEvent(event.id)"
                title="编辑"
              >
                ✏️
              </button>

              <button
                class="btn-icon danger"
                @click.stop="handleDeleteEvent(event.id)"
                title="删除"
              >
                🗑️
              </button>
            </div>
          </div>

          <!-- 事件详情（展开时显示） -->
          <div v-if="selectedEventId === event.id" class="event-details-panel">
            <!-- 条件 -->
            <div v-if="event.condition" class="detail-section">
              <div class="section-title">触发条件</div>
              <div class="condition-display">
                {{ formatCondition(event.condition) }}
              </div>
            </div>

            <!-- 动作列表 -->
            <div v-if="event.actions && event.actions.length > 0" class="detail-section">
              <div class="section-title">动作列表 ({{ event.actions.length }})</div>
              <div class="action-list">
                <div
                  v-for="(action, index) in event.actions"
                  :key="index"
                  class="action-item"
                >
                  <span class="action-index">{{ index + 1 }}</span>
                  <span class="action-type">{{ getActionTypeLabel(action.type) }}</span>
                  <span class="action-params">{{ formatActionParams(action.params) }}</span>
                </div>
              </div>
            </div>

            <!-- 统计信息 -->
            <div class="detail-section">
              <div class="section-title">统计信息</div>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">触发次数:</span>
                  <span class="stat-value">{{ event._triggerCount || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">优先级:</span>
                  <span class="stat-value">{{ event.priority }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">延迟:</span>
                  <span class="stat-value">{{ event.delay }}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 调试面板 -->
    <div v-if="debugMode" class="debug-panel">
      <div class="debug-header">
        <span class="debug-title">执行日志</span>
        <button class="btn-link" @click="clearExecutionLog">清空</button>
      </div>
      <div class="debug-log custom-scrollbar">
        <div
          v-for="(log, index) in executionLog"
          :key="index"
          class="log-entry"
          :class="log.level"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-level">{{ log.level.toUpperCase() }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>

        <div v-if="executionLog.length === 0" class="empty-log">
          暂无日志
        </div>
      </div>
    </div>

    <!-- 事件编辑对话框 -->
    <EventEditorDialog
      v-if="showEventEditor"
      :event-id="editingEventId"
      @close="closeEventEditor"
      @save="handleSaveEvent"
    />

    <!-- 循环依赖详情对话框 -->
    <CircularDependencyDialog
      v-if="showCircularDialog"
      :dependencies="circularDependencies"
      @close="showCircularDialog = false"
    />

    <!-- 全局事件选择器对话框 -->
    <GlobalEventSelectorDialog
      v-if="showGlobalEventSelector"
      @close="closeGlobalEventSelector"
      @select="handleSelectGlobalEvent"
      @create="handleCreateGlobalEventFromSelector"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useEventsStore } from '@/store/modules/events.js';
import { useEditorStore } from '@/store';
import { getEventTypeLabel, getActionTypeLabel } from '@/core/events/EventTypes.js';
import { useGlobalEventsStore } from '@/store/modules/globalEvents.js';
import EventEditorDialog from './EventEditorDialog.vue';
import CircularDependencyDialog from './CircularDependencyDialog.vue';
import GlobalEventSelectorDialog from './GlobalEventSelectorDialog.vue';

/**
 * EventPanel - 事件配置面板
 *
 * @description 管理和配置事件系统
 */

// Store
const eventsStore = useEventsStore();
const editorStore = useEditorStore();
const globalEventsStore = useGlobalEventsStore();

const {
  allEvents,
  selectedEventId,
  debugMode,
  executionLog,
  circularDependencies,
  statistics
} = storeToRefs(eventsStore);

// 状态
const showEventEditor = ref(false);
const editingEventId = ref(null);
const showCircularDialog = ref(false);
const showGlobalEventSelector = ref(false);

// 方法
const handleCreateEvent = () => {
  editingEventId.value = null;
  showEventEditor.value = true;
};

const handleEditEvent = (eventId) => {
  editingEventId.value = eventId;
  showEventEditor.value = true;
};

const closeEventEditor = () => {
  showEventEditor.value = false;
  editingEventId.value = null;
};

const handleSaveEvent = (eventData) => {
  if (editingEventId.value) {
    eventsStore.updateEvent(editingEventId.value, eventData);
  } else {
    eventsStore.createEvent(eventData);
  }
  closeEventEditor();
};

const handleDeleteEvent = (eventId) => {
  if (confirm('确定要删除这个事件吗？')) {
    eventsStore.deleteEvent(eventId);
  }
};

/**
 * 引用全局事件
 */
const handleReferenceGlobalEvent = () => {
  showGlobalEventSelector.value = true;
};

/**
 * 选择全局事件
 */
const handleSelectGlobalEvent = (globalEvent) => {
  // 创建一个引用全局事件的本地事件
  const eventData = {
    name: `[全局] ${globalEvent.name}`,
    eventType: globalEvent.eventType,
    eventSource: 'global',
    globalEventId: globalEvent.id,
    nodeId: editorStore.selectedNodeId,
    status: 'enabled'
  };

  eventsStore.createEvent(eventData);

  // 添加引用关系
  if (editorStore.selectedNodeId) {
    globalEventsStore.addReference(globalEvent.id, editorStore.selectedNodeId);
  }

  showGlobalEventSelector.value = false;
};

/**
 * 关闭全局事件选择器
 */
const closeGlobalEventSelector = () => {
  showGlobalEventSelector.value = false;
};

/**
 * 创建全局事件（从选择器跳转）
 */
const handleCreateGlobalEventFromSelector = () => {
  showGlobalEventSelector.value = false;
  // 触发全局事件，打开左侧面板的全局事件标签
  window.dispatchEvent(new CustomEvent('open-global-events-panel'));
};

const handleTestEvent = async (eventId) => {
  try {
    await eventsStore.triggerEvent(eventId, {
      test: true,
      timestamp: Date.now()
    });
    alert('事件触发成功！请查看调试日志。');
  } catch (error) {
    alert(`事件触发失败：${error.message}`);
  }
};

const selectEvent = (eventId) => {
  if (selectedEventId.value === eventId) {
    eventsStore.deselectEvent();
  } else {
    eventsStore.selectEvent(eventId);
  }
};

const toggleEventStatus = (eventId) => {
  const event = eventsStore.getEvent(eventId);
  if (event.status === 'enabled') {
    eventsStore.disableEvent(eventId);
  } else {
    eventsStore.enableEvent(eventId);
  }
};

const toggleDebugMode = () => {
  eventsStore.setDebugMode(!debugMode.value);
};

const handleRefresh = () => {
  eventsStore.checkCircularDependencies();
  eventsStore.updateExecutionLog();
};

const clearExecutionLog = () => {
  eventsStore.clearExecutionLog();
};

const showCircularDependencies = () => {
  showCircularDialog.value = true;
};

const getEventIcon = (eventType) => {
  const icons = {
    click: '👆',
    doubleClick: '👆👆',
    mouseEnter: '🖱️',
    mouseLeave: '🖱️',
    dataChange: '📊',
    propertyChange: '⚙️',
    timer: '⏰',
    interval: '🔄',
    custom: '⚡'
  };
  return icons[eventType] || '⚡';
};

const getNodeName = (nodeId) => {
  const node = editorStore.getNodeById(nodeId);
  return node ? node.name : nodeId;
};

const formatCondition = (condition) => {
  if (typeof condition === 'string') {
    return condition;
  }
  return JSON.stringify(condition);
};

const formatActionParams = (params) => {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }
  const entries = Object.entries(params).slice(0, 2);
  return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

// 生命周期
onMounted(() => {
  // 初始化事件系统
  // eventsStore.initialize(nodeManager, dataSourceManager);
});
</script>

<style scoped>
.event-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
}

.btn-primary {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
}

.btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.btn-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn-icon.active {
  background: var(--accent-success);
  color: white;
}

.btn-icon.danger:hover {
  background: var(--accent-danger);
  color: white;
}

.btn-link {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  cursor: pointer;
  text-decoration: underline;
}

.btn-link:hover {
  color: var(--primary-light);
}

.spacer {
  flex: 1;
}

.stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
}

.stat-label {
  color: var(--text-secondary);
}

.stat-value {
  color: var(--text-primary);
  font-weight: 500;
}

.stat-value.success {
  color: var(--accent-success);
}

.stat-value.disabled {
  color: var(--text-disabled);
}

/* 警告横幅 */
.warning-banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: rgba(230, 162, 60, 0.1);
  border-bottom: 1px solid var(--accent-warning);
  color: var(--accent-warning);
  font-size: var(--font-size-sm);
}

/* 主内容区 */
.content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.empty-text {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
}

.empty-desc {
  font-size: var(--font-size-sm);
  color: var(--text-disabled);
}

/* 事件列表 */
.event-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.event-item {
  margin-bottom: var(--spacing-sm);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.event-item:hover {
  border-color: var(--border-hover);
}

.event-item.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.event-item.disabled {
  opacity: 0.5;
}

.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
}

.event-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.event-icon {
  font-size: 24px;
}

.event-details {
  flex: 1;
}

.event-name {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.event-meta {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.event-type {
  padding: 2px 6px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.event-node {
  padding: 2px 6px;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
}

.event-actions {
  display: flex;
  gap: var(--spacing-xs);
}

/* 事件详情面板 */
.event-details-panel {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background: var(--bg-tertiary);
}

.detail-section {
  margin-bottom: var(--spacing-md);
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.condition-display {
  padding: var(--spacing-sm);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: monospace;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.action-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.action-index {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.action-type {
  font-weight: 500;
  color: var(--text-primary);
}

.action-params {
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
}

/* 调试面板 */
.debug-panel {
  height: 200px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

.debug-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.debug-title {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.debug-log {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
  font-family: monospace;
  font-size: var(--font-size-xs);
}

.log-entry {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs);
  margin-bottom: 2px;
  border-radius: var(--radius-sm);
}

.log-entry.error {
  background: rgba(245, 108, 108, 0.1);
  color: var(--accent-danger);
}

.log-entry.warn {
  background: rgba(230, 162, 60, 0.1);
  color: var(--accent-warning);
}

.log-entry.success {
  background: rgba(103, 194, 58, 0.1);
  color: var(--accent-success);
}

.log-time {
  color: var(--text-disabled);
}

.log-level {
  font-weight: 500;
  min-width: 50px;
}

.log-message {
  flex: 1;
  color: var(--text-primary);
}

.empty-log {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-disabled);
}
</style>


