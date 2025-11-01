<template>
  <div class="state-config-panel">
    <!-- 无状态提示 -->
    <div v-if="!hasStates" class="no-states">
      <span class="icon">🔄</span>
      <p class="message">该节点不支持状态配置</p>
    </div>

    <!-- 状态列表 -->
    <div v-else class="states-container">
      <!-- 当前状态显示 -->
      <div class="current-state-info">
        <label class="label">当前状态</label>
        <div class="current-state-badge" :class="`state-${currentStateId}`">
          <span class="state-icon" v-if="currentState && currentState.icon">
            {{ getStateIcon(currentState) }}
          </span>
          <span class="state-name">
            {{ currentState ? currentState.stateName : '未知' }}
          </span>
          <span class="state-id">(ID: {{ currentStateId }})</span>
        </div>
      </div>

      <!-- 状态列表 -->
      <div class="states-list">
        <label class="label">可用状态</label>
        <div class="states-grid">
          <div
            v-for="state in states"
            :key="state.stateId"
            class="state-item"
            :class="{ 
              active: state.stateId === currentStateId,
              'has-icon': state.icon
            }"
            @click="handleStateChange(state.stateId)"
          >
            <!-- 状态图标 -->
            <div class="state-icon-preview" v-if="state.icon">
              <img :src="state.icon" :alt="state.stateName" />
            </div>
            <div class="state-icon-preview placeholder" v-else>
              <span>{{ getStateIcon(state) }}</span>
            </div>

            <!-- 状态信息 -->
            <div class="state-info">
              <div class="state-name">{{ state.stateName }}</div>
              <div class="state-id">ID: {{ state.stateId }}</div>
            </div>

            <!-- 激活标记 -->
            <div class="active-indicator" v-if="state.stateId === currentStateId">
              <span>✓</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 状态样式预览 -->
      <div class="state-style-preview" v-if="currentState && currentState.style">
        <label class="label">状态样式</label>
        <div class="style-properties">
          <div 
            v-for="(value, key) in currentState.style" 
            :key="key"
            class="style-property"
          >
            <span class="property-key">{{ formatStyleKey(key) }}</span>
            <span class="property-value">{{ formatStyleValue(value) }}</span>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="state-actions">
        <button 
          class="action-btn"
          :disabled="!canGoPrevious"
          @click="handlePreviousState"
          title="上一个状态"
        >
          <span class="icon">◀</span>
          <span>上一个</span>
        </button>
        <button 
          class="action-btn"
          :disabled="!canGoNext"
          @click="handleNextState"
          title="下一个状态"
        >
          <span>下一个</span>
          <span class="icon">▶</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useEditorStore } from '@/store';
import { SetNodeStateCommand } from '@/core/commands/SetNodeStateCommand.js';

// Props
const props = defineProps({
  node: {
    type: Object,
    required: true
  }
});

// Store
const editorStore = useEditorStore();

// 状态数据
const states = ref([]);
const currentStateId = ref(0);

// 计算属性
const hasStates = computed(() => {
  return states.value && states.value.length > 0;
});

const currentState = computed(() => {
  if (!hasStates.value) return null;
  return states.value.find(state => state.stateId === currentStateId.value) || states.value[0];
});

const canGoPrevious = computed(() => {
  return hasStates.value && states.value.length > 1;
});

const canGoNext = computed(() => {
  return hasStates.value && states.value.length > 1;
});

// 监听节点变化
watch(() => props.node, (newNode) => {
  if (newNode) {
    loadNodeStates();
  }
}, { immediate: true });

// 监听节点状态变化事件
watch(() => props.node, (newNode, oldNode) => {
  if (oldNode) {
    oldNode.off('state-changed', handleNodeStateChanged);
  }
  if (newNode) {
    newNode.on('state-changed', handleNodeStateChanged);
  }
}, { immediate: true });

/**
 * 加载节点状态
 */
function loadNodeStates() {
  if (!props.node || !props.node.getStates) {
    states.value = [];
    currentStateId.value = 0;
    return;
  }

  states.value = props.node.getStates();
  currentStateId.value = props.node.getCurrentStateId();
}

/**
 * 处理状态变化
 */
function handleStateChange(stateId) {
  if (stateId === currentStateId.value) return;

  // 使用命令系统执行状态切换
  const command = new SetNodeStateCommand({
    node: props.node,
    newStateId: stateId
  });

  const commandManager = editorStore.getCommandManager();
  if (commandManager) {
    commandManager.execute(command);
  } else {
    // 如果没有命令管理器，直接执行
    props.node.setState(stateId);
    currentStateId.value = stateId;
  }
}

/**
 * 处理节点状态变化事件
 */
function handleNodeStateChanged(event) {
  currentStateId.value = event.newStateId;
}

/**
 * 上一个状态
 */
function handlePreviousState() {
  if (!canGoPrevious.value) return;
  props.node.previousState();
}

/**
 * 下一个状态
 */
function handleNextState() {
  if (!canGoNext.value) return;
  props.node.nextState();
}

/**
 * 获取状态图标
 */
function getStateIcon(state) {
  if (state.icon) {
    return '🖼️';
  }
  return '⚪';
}

/**
 * 格式化样式键名
 */
function formatStyleKey(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

/**
 * 格式化样式值
 */
function formatStyleValue(value) {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  return String(value);
}
</script>

<style scoped>
.state-config-panel {
  padding: var(--spacing-md);
}

/* 无状态提示 */
.no-states {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.no-states .icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.no-states .message {
  font-size: var(--font-size-md);
}

/* 状态容器 */
.states-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

/* 当前状态信息 */
.current-state-info {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.current-state-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.current-state-badge .state-icon {
  font-size: 18px;
}

.current-state-badge .state-id {
  margin-left: auto;
  opacity: 0.8;
  font-size: var(--font-size-xs);
}

/* 状态列表 */
.states-list {
  /* 样式已定义 */
}

.states-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-sm);
}

.state-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.state-item:hover {
  border-color: var(--primary-color);
  background: var(--bg-hover);
}

.state-item.active {
  border-color: var(--primary-color);
  background: rgba(64, 158, 255, 0.1);
}

.state-icon-preview {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-sm);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.state-icon-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.state-icon-preview.placeholder {
  background: var(--bg-tertiary);
  font-size: 24px;
}

.state-info {
  text-align: center;
  width: 100%;
}

.state-info .state-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.state-info .state-id {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.active-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* 状态样式预览 */
.state-style-preview {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.style-properties {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.style-property {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.property-key {
  color: var(--text-secondary);
}

.property-value {
  color: var(--text-primary);
  font-weight: 500;
}

/* 快捷操作 */
.state-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn .icon {
  font-size: 12px;
}
</style>

