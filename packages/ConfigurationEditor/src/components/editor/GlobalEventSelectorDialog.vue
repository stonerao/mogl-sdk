<template>
  <div class="global-event-selector-dialog">
    <div class="dialog-backdrop" @click="handleClose" />
    <div class="dialog-content">
      <!-- 对话框头部 -->
      <div class="dialog-header">
        <h3 class="dialog-title">选择全局事件</h3>
        <button class="close-btn" @click="handleClose">✕</button>
      </div>

      <!-- 搜索框 -->
      <div class="dialog-search">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索全局事件..."
        >
      </div>

      <!-- 对话框主体 -->
      <div class="dialog-body custom-scrollbar">
        <!-- 空状态 -->
        <div v-if="filteredEvents.length === 0" class="empty-state">
          <span class="empty-icon">⚡</span>
          <p class="empty-message">
            {{ searchQuery ? '未找到匹配的事件' : '暂无全局事件' }}
          </p>
          <button v-if="!searchQuery" class="btn-create" @click="handleCreateGlobalEvent">
            创建全局事件
          </button>
        </div>

        <!-- 事件列表 -->
        <div v-else class="event-list">
          <div
            v-for="event in filteredEvents"
            :key="event.id"
            class="event-item"
            :class="{ selected: selectedEventId === event.id }"
            @click="handleSelectEvent(event.id)"
          >
            <div class="event-info">
              <span class="event-icon">⚡</span>
              <div class="event-details">
                <div class="event-name">{{ event.name }}</div>
                <div class="event-meta">
                  <span class="event-type">{{ getEventTypeLabel(event.eventType) }}</span>
                  <span class="event-stats">
                    {{ event.conditions?.length || 0 }} 条件 · 
                    {{ event.actions?.length || 0 }} 动作
                  </span>
                </div>
              </div>
            </div>
            <div class="event-reference-count">
              引用: {{ getEventReferenceCount(event.id) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 对话框底部 -->
      <div class="dialog-footer">
        <button class="btn-cancel" @click="handleClose">
          取消
        </button>
        <button
          class="btn-confirm"
          :disabled="!selectedEventId"
          @click="handleConfirm"
        >
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGlobalEventsStore } from '@/store/modules/globalEvents.js';

// ========== Props & Emits ==========

const emit = defineEmits(['close', 'select', 'create']);

// ========== Store ==========

const globalEventsStore = useGlobalEventsStore();

// ========== 状态 ==========

const searchQuery = ref('');
const selectedEventId = ref(null);

// ========== 计算属性 ==========

const filteredEvents = computed(() => {
  let events = globalEventsStore.allEvents;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    events = events.filter(event =>
      event.name.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query)
    );
  }

  return events;
});

// ========== 方法 ==========

/**
 * 选中事件
 */
function handleSelectEvent(eventId) {
  selectedEventId.value = eventId;
}

/**
 * 确认选择
 */
function handleConfirm() {
  if (selectedEventId.value) {
    const event = globalEventsStore.events.get(selectedEventId.value);
    emit('select', event);
  }
}

/**
 * 关闭对话框
 */
function handleClose() {
  emit('close');
}

/**
 * 创建全局事件
 */
function handleCreateGlobalEvent() {
  emit('create');
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
</script>

<style scoped>
.global-event-selector-dialog {
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

.dialog-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
}

.dialog-content {
  position: relative;
  width: 500px;
  max-width: 90vw;
  max-height: 70vh;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  z-index: 2001;
}

/* 对话框头部 */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.dialog-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 18px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* 搜索框 */
.dialog-search {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.search-input {
  width: 100%;
  height: 36px;
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

/* 对话框主体 */
.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
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

.btn-create {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-create:hover {
  background: var(--primary-dark);
}

/* 事件列表 */
.event-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.event-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.event-item:hover {
  border-color: var(--border-light);
  background: var(--bg-hover);
}

.event-item.selected {
  border-color: var(--primary-color);
  background: var(--bg-active);
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

.event-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.event-meta {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.event-type {
  color: var(--primary-color);
}

.event-stats {
  color: var(--text-disabled);
}

.event-reference-count {
  font-size: var(--font-size-xs);
  color: var(--text-disabled);
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.btn-cancel,
.btn-confirm {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-cancel {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-cancel:hover {
  background: var(--bg-hover);
}

.btn-confirm {
  background: var(--primary-color);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

