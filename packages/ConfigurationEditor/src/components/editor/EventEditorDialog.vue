<template>
  <div class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog">
      <div class="dialog-header">
        <h3>{{ eventId ? '编辑事件' : '新建事件' }}</h3>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>
      
      <div class="dialog-body">
        <p class="placeholder-text">
          事件编辑器 UI 开发中...
        </p>
        <p class="placeholder-desc">
          此对话框将包含完整的事件配置界面，包括：
        </p>
        <ul class="feature-list">
          <li>事件基本信息（名称、类型、目标节点）</li>
          <li>触发条件编辑器（可视化条件构建）</li>
          <li>动作列表编辑器（添加、编辑、排序动作）</li>
          <li>高级选项（优先级、传播、防抖、节流等）</li>
        </ul>
      </div>
      
      <div class="dialog-footer">
        <button class="btn" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" @click="handleSave">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  eventId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

const handleSave = () => {
  // TODO: 实现事件保存逻辑
  emit('save', {
    name: '新事件',
    eventType: 'click',
    actions: []
  });
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  width: 600px;
  max-height: 80vh;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.dialog-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.dialog-body {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.placeholder-text {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.placeholder-desc {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  background: var(--bg-tertiary);
  border-left: 3px solid var(--primary-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-md);
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
</style>

