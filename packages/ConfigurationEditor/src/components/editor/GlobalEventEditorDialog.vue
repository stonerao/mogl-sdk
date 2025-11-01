<template>
  <div class="global-event-editor-dialog">
    <div class="dialog-backdrop" @click="handleClose" />
    <div class="dialog-content">
      <!-- 对话框头部 -->
      <div class="dialog-header">
        <h3 class="dialog-title">
          {{ eventId ? '编辑全局事件' : '新建全局事件' }}
        </h3>
        <button class="close-btn" @click="handleClose">✕</button>
      </div>

      <!-- 对话框主体 -->
      <div class="dialog-body custom-scrollbar">
        <!-- 基本信息 -->
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>

          <div class="form-group">
            <label class="form-label">事件名称</label>
            <input
              v-model="formData.name"
              type="text"
              class="form-input"
              placeholder="请输入事件名称"
            >
          </div>

          <div class="form-group">
            <label class="form-label">事件描述</label>
            <textarea
              v-model="formData.description"
              class="form-textarea"
              placeholder="请输入事件描述（可选）"
              rows="3"
            />
          </div>

          <div class="form-group">
            <label class="form-label">事件类型</label>
            <select v-model="formData.eventType" class="form-select">
              <option value="click">点击事件</option>
              <option value="state-changed">状态变化</option>
              <option value="data-updated">数据更新</option>
              <option value="loaded">加载完成</option>
              <option value="destroyed">销毁</option>
              <option value="hidden">隐藏</option>
              <option value="shown">显示</option>
              <option value="custom">自定义事件</option>
            </select>
          </div>
        </div>

        <!-- 触发条件 -->
        <div class="form-section">
          <div class="section-header">
            <h4 class="section-title">触发条件</h4>
            <button class="btn-add" @click="handleAddCondition">
              ➕ 添加条件
            </button>
          </div>

          <div v-if="formData.conditions.length === 0" class="empty-hint">
            无条件（总是触发）
          </div>

          <div v-else class="condition-list">
            <div
              v-for="(condition, index) in formData.conditions"
              :key="index"
              class="condition-item"
            >
              <div class="condition-fields">
                <input
                  v-model="condition.field"
                  type="text"
                  class="form-input small"
                  placeholder="字段"
                >
                <select v-model="condition.operator" class="form-select small">
                  <option value="==">等于</option>
                  <option value="!=">不等于</option>
                  <option value=">">大于</option>
                  <option value="<">小于</option>
                  <option value=">=">大于等于</option>
                  <option value="<=">小于等于</option>
                </select>
                <input
                  v-model="condition.value"
                  type="text"
                  class="form-input small"
                  placeholder="值"
                >
              </div>
              <button class="btn-remove" @click="handleRemoveCondition(index)">
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- 执行动作 -->
        <div class="form-section">
          <div class="section-header">
            <h4 class="section-title">执行动作</h4>
            <button class="btn-add" @click="handleAddAction">
              ➕ 添加动作
            </button>
          </div>

          <div v-if="formData.actions.length === 0" class="empty-hint">
            无动作
          </div>

          <div v-else class="action-list">
            <div
              v-for="(action, index) in formData.actions"
              :key="index"
              class="action-item"
            >
              <div class="action-fields">
                <select v-model="action.type" class="form-select small">
                  <option value="setProperty">设置属性</option>
                  <option value="setState">设置状态</option>
                  <option value="showNode">显示节点</option>
                  <option value="hideNode">隐藏节点</option>
                  <option value="navigate">导航</option>
                  <option value="script">执行脚本</option>
                </select>
                <input
                  v-model="action.target"
                  type="text"
                  class="form-input small"
                  placeholder="目标"
                >
                <input
                  v-model="action.value"
                  type="text"
                  class="form-input small"
                  placeholder="值"
                >
              </div>
              <button class="btn-remove" @click="handleRemoveAction(index)">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 对话框底部 -->
      <div class="dialog-footer">
        <button class="btn-cancel" @click="handleClose">
          取消
        </button>
        <button class="btn-save" @click="handleSave">
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGlobalEventsStore } from '@/store/modules/globalEvents.js';

// ========== Props & Emits ==========

const props = defineProps({
  eventId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

// ========== Store ==========

const globalEventsStore = useGlobalEventsStore();

// ========== 状态 ==========

const formData = ref({
  name: '',
  description: '',
  eventType: 'click',
  conditions: [],
  actions: []
});

// ========== 生命周期 ==========

onMounted(() => {
  if (props.eventId) {
    // 编辑模式：加载现有事件数据
    const event = globalEventsStore.events.get(props.eventId);
    if (event) {
      formData.value = {
        name: event.name,
        description: event.description || '',
        eventType: event.eventType,
        conditions: event.conditions ? [...event.conditions] : [],
        actions: event.actions ? [...event.actions] : []
      };
    }
  }
});

// ========== 方法 ==========

/**
 * 添加条件
 */
function handleAddCondition() {
  formData.value.conditions.push({
    field: '',
    operator: '==',
    value: ''
  });
}

/**
 * 移除条件
 */
function handleRemoveCondition(index) {
  formData.value.conditions.splice(index, 1);
}

/**
 * 添加动作
 */
function handleAddAction() {
  formData.value.actions.push({
    type: 'setProperty',
    target: '',
    value: ''
  });
}

/**
 * 移除动作
 */
function handleRemoveAction(index) {
  formData.value.actions.splice(index, 1);
}

/**
 * 关闭对话框
 */
function handleClose() {
  emit('close');
}

/**
 * 保存事件
 */
function handleSave() {
  // 验证
  if (!formData.value.name.trim()) {
    alert('请输入事件名称');
    return;
  }

  // 触发保存事件
  emit('save', {
    ...formData.value,
    name: formData.value.name.trim(),
    description: formData.value.description.trim()
  });
}
</script>

<style scoped>
.global-event-editor-dialog {
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
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
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

/* 对话框主体 */
.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 表单部分 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
}

.btn-add {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-add:hover {
  background: var(--primary-dark);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.form-input,
.form-textarea,
.form-select {
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-fast);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: var(--primary-color);
}

.form-input.small,
.form-select.small {
  padding: var(--spacing-xs);
  font-size: var(--font-size-xs);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.empty-hint {
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--text-disabled);
  text-align: center;
  font-style: italic;
}

/* 条件列表 */
.condition-list,
.action-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.condition-item,
.action-item {
  display: flex;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.condition-fields,
.action-fields {
  flex: 1;
  display: flex;
  gap: var(--spacing-xs);
}

.btn-remove {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 14px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-remove:hover {
  background: var(--accent-danger);
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
.btn-save {
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

.btn-save {
  background: var(--primary-color);
  color: white;
}

.btn-save:hover {
  background: var(--primary-dark);
}
</style>

