<template>
  <div class="data-binding-editor">
    <div class="editor-header">
      <h4>数据绑定</h4>
      <button class="btn-close" @click="$emit('close')">✕</button>
    </div>

    <div class="editor-body">
      <!-- 数据源选择 -->
      <div class="form-group">
        <label>数据源</label>
        <select v-model="binding.dataSourceId">
          <option value="">-- 选择数据源 --</option>
          <option v-for="ds in dataSources" :key="ds.id" :value="ds.id">
            {{ ds.name }} ({{ ds.type }})
          </option>
        </select>
      </div>

      <!-- 数据路径 -->
      <div class="form-group">
        <label>数据路径</label>
        <input
          v-model="binding.dataPath"
          type="text"
          placeholder="例如: user.name"
        />
        <span class="hint">使用点号分隔嵌套属性</span>
      </div>

      <!-- 绑定模式 -->
      <div class="form-group">
        <label>绑定模式</label>
        <select v-model="binding.mode">
          <option value="oneWay">单向绑定（数据源 → 节点）</option>
          <option value="twoWay">双向绑定（数据源 ↔ 节点）</option>
        </select>
      </div>

      <!-- 预览 -->
      <div v-if="binding.dataSourceId" class="preview">
        <label>当前值预览</label>
        <div class="preview-value">
          {{ previewValue }}
        </div>
      </div>
    </div>

    <div class="editor-footer">
      <button class="btn-secondary" @click="$emit('close')">取消</button>
      <button class="btn-danger" @click="removeBinding">解除绑定</button>
      <button class="btn-primary" @click="saveBinding">保存绑定</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useDatasourceStore } from '../../store/modules/datasource.js';
import { dataSourceManager } from '../../core/datasource/DataSourceManager.js';

// ========== Props & Emits ==========

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  },
  propertyKey: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close', 'save', 'remove']);

// ========== Store ==========

const datasourceStore = useDatasourceStore();

// ========== 状态 ==========

const binding = ref({
  dataSourceId: '',
  dataPath: '',
  mode: 'oneWay'
});

// ========== 计算属性 ==========

const dataSources = computed(() => datasourceStore.dataSources);

const previewValue = computed(() => {
  if (!binding.value.dataSourceId) return '未选择数据源';
  
  const dataSource = dataSourceManager.getDataSource(binding.value.dataSourceId);
  if (!dataSource || !dataSource.data) return '无数据';
  
  try {
    const value = extractValue(dataSource.data, binding.value.dataPath);
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return '提取数据失败';
  }
});

// ========== 方法 ==========

/**
 * 从数据中提取值
 */
const extractValue = (data, path) => {
  if (!path) return data;
  
  const keys = path.split('.');
  let value = data;
  
  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined;
    }
    value = value[key];
  }
  
  return value;
};

/**
 * 保存绑定
 */
const saveBinding = () => {
  if (!binding.value.dataSourceId) {
    alert('请选择数据源');
    return;
  }
  
  emit('save', {
    nodeId: props.nodeId,
    propertyKey: props.propertyKey,
    ...binding.value
  });
};

/**
 * 解除绑定
 */
const removeBinding = () => {
  emit('remove', {
    nodeId: props.nodeId,
    propertyKey: props.propertyKey
  });
};

/**
 * 初始化
 */
const initialize = () => {
  // 加载现有绑定
  const existingBinding = datasourceStore.getBinding(props.nodeId, props.propertyKey);
  if (existingBinding) {
    binding.value = { ...existingBinding };
  }
};

initialize();
</script>

<style scoped>
.data-binding-editor {
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-radius: 6px;
  overflow: hidden;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.editor-header h4 {
  margin: 0;
  font-size: 14px;
  color: var(--text-primary);
}

.btn-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.editor-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.hint {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.preview {
  margin-top: 16px;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.preview label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.preview-value {
  padding: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-all;
}

.editor-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #dc2626;
}
</style>

