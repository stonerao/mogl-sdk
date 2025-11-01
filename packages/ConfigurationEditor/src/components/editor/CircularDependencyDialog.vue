<template>
  <div class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog">
      <div class="dialog-header">
        <h3>循环依赖检测</h3>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>
      
      <div class="dialog-body">
        <div v-if="dependencies.length === 0" class="empty-state">
          <span class="icon">✓</span>
          <p>未检测到循环依赖</p>
        </div>
        
        <div v-else class="dependency-list">
          <div class="warning-banner">
            <span class="icon">⚠️</span>
            <span>检测到 {{ dependencies.length }} 个循环依赖链</span>
          </div>
          
          <div
            v-for="(cycle, index) in dependencies"
            :key="index"
            class="cycle-item"
          >
            <div class="cycle-header">
              <span class="cycle-index">循环 {{ index + 1 }}</span>
              <span class="cycle-length">{{ cycle.length }} 个事件</span>
            </div>
            
            <div class="cycle-chain">
              <div
                v-for="(eventId, i) in cycle"
                :key="i"
                class="chain-item"
              >
                <span class="event-id">{{ eventId }}</span>
                <span v-if="i < cycle.length - 1" class="arrow">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button class="btn btn-primary" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  dependencies: {
    type: Array,
    default: () => []
  }
});

defineEmits(['close']);
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--accent-success);
}

.empty-state .icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.empty-state p {
  font-size: var(--font-size-lg);
  margin: 0;
}

.dependency-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.warning-banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: rgba(230, 162, 60, 0.1);
  border: 1px solid var(--accent-warning);
  border-radius: var(--radius-sm);
  color: var(--accent-warning);
  font-size: var(--font-size-sm);
}

.cycle-item {
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.cycle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.cycle-index {
  font-weight: 500;
  color: var(--text-primary);
}

.cycle-length {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.cycle-chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
}

.chain-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.event-id {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: monospace;
  font-size: var(--font-size-sm);
}

.arrow {
  color: var(--accent-danger);
  font-weight: bold;
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

