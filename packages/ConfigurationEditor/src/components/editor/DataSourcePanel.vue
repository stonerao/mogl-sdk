<template>
  <div class="datasource-panel">
    <!-- 工具栏 -->
    <div class="toolbar">
      <button class="btn-primary" @click="showAddDialog = true">
      添加
      </button>
      <button class="btn-secondary" @click="refreshAll">
         刷新
      </button>
    </div>

    <!-- 数据源列表 -->
    <div class="datasource-list">
      <div
        v-for="ds in dataSources"
        :key="ds.id"
        class="datasource-item"
        :class="{ selected: selectedDataSourceId === ds.id }"
        @click="selectDataSource(ds.id)"
      >
        <!-- 数据源信息 -->
        <div class="datasource-info">
          <div class="datasource-header">
            <span class="datasource-icon">{{ getTypeIcon(ds.type) }}</span>
            <span class="datasource-name">{{ ds.name }}</span>
            <span class="datasource-status" :class="`status-${ds.status}`">
              {{ getStatusText(ds.status) }}
            </span>
          </div>
          <div class="datasource-description">{{ ds.description || '无描述' }}</div>
          <div class="datasource-meta">
            <span>类型: {{ ds.type }}</span>
            <span v-if="ds.lastUpdate">
              更新: {{ formatTime(ds.lastUpdate) }}
            </span>
          </div>
          <div v-if="ds.error" class="datasource-error">
            ⚠️ {{ ds.error }}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="datasource-actions">
          <button
            v-if="ds.status === 'disconnected'"
            class="btn-icon"
            title="连接"
            @click.stop="connect(ds.id)"
          >
            🔌
          </button>
          <button
            v-if="ds.status === 'connected'"
            class="btn-icon"
            title="断开"
            @click.stop="disconnect(ds.id)"
          >
            🔌
          </button>
          <button
            class="btn-icon"
            title="刷新"
            @click.stop="refresh(ds.id)"
          >
            🔄
          </button>
          <button
            class="btn-icon"
            title="编辑"
            @click.stop="editDataSource(ds)"
          >
            ✏️
          </button>
          <button
            class="btn-icon btn-danger"
            title="删除"
            @click.stop="deleteDataSource(ds.id)"
          >
            🗑️
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="dataSources.length === 0" class="empty-state">
        <p>暂无数据源</p>
        <p>点击"添加数据源"按钮创建第一个数据源</p>
      </div>
    </div>

    <!-- 添加/编辑数据源对话框 -->
    <div v-if="showAddDialog || showEditDialog" class="modal-overlay" @click="closeDialogs">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditDialog ? '编辑数据源' : '添加数据源' }}</h3>
          <button class="btn-close" @click="closeDialogs">✕</button>
        </div>

        <div class="modal-body">
          <!-- 数据源类型 -->
          <div class="form-group">
            <label>数据源类型</label>
            <select v-model="formData.type" :disabled="showEditDialog">
              <option value="static">静态数据</option>
              <option value="api">REST API</option>
              <option value="websocket">WebSocket</option>
              <option value="localStorage">本地存储</option>
            </select>
          </div>

          <!-- 基础信息 -->
          <div class="form-group">
            <label>名称 *</label>
            <input v-model="formData.name" type="text" placeholder="输入数据源名称" />
          </div>

          <div class="form-group">
            <label>描述</label>
            <textarea v-model="formData.description" placeholder="输入数据源描述"></textarea>
          </div>

          <!-- 静态数据配置 -->
          <template v-if="formData.type === 'static'">
            <div class="form-group">
              <label>数据 (JSON)</label>
              <textarea
                v-model="formData.data"
                placeholder='{"key": "value"}'
                rows="6"
              ></textarea>
            </div>
          </template>

          <!-- API 配置 -->
          <template v-if="formData.type === 'api'">
            <div class="form-group">
              <label>URL *</label>
              <input v-model="formData.url" type="text" placeholder="https://api.example.com/data" />
            </div>

            <div class="form-group">
              <label>HTTP 方法</label>
              <select v-model="formData.method">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div class="form-group">
              <label>自动刷新间隔 (毫秒, 0=不刷新)</label>
              <input v-model.number="formData.interval" type="number" min="0" />
            </div>
          </template>

          <!-- WebSocket 配置 -->
          <template v-if="formData.type === 'websocket'">
            <div class="form-group">
              <label>URL *</label>
              <input v-model="formData.url" type="text" placeholder="ws://localhost:8080" />
            </div>

            <div class="form-group">
              <label>重连间隔 (毫秒)</label>
              <input v-model.number="formData.reconnectInterval" type="number" min="0" />
            </div>

            <div class="form-group">
              <label>最大重连次数</label>
              <input v-model.number="formData.maxReconnectAttempts" type="number" min="0" />
            </div>
          </template>

          <!-- LocalStorage 配置 -->
          <template v-if="formData.type === 'localStorage'">
            <div class="form-group">
              <label>键名 *</label>
              <input v-model="formData.key" type="text" placeholder="myDataKey" />
            </div>

            <div class="form-group">
              <label>默认值 (JSON)</label>
              <textarea
                v-model="formData.defaultValue"
                placeholder='{"key": "value"}'
                rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label>
                <input v-model="formData.autoSave" type="checkbox" />
                自动保存
              </label>
            </div>
          </template>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDialogs">取消</button>
          <button class="btn-primary" @click="saveDataSource">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDatasourceStore } from '../../store/modules/datasource.js';
import { dataSourceManager } from '../../core/datasource/DataSourceManager.js';
import {
  StaticDataSource,
  ApiDataSource,
  WebSocketDataSource,
  LocalStorageDataSource
} from '../../core/datasource/index.js';

// ========== Store ==========

const datasourceStore = useDatasourceStore();

// ========== 状态 ==========

const showAddDialog = ref(false);
const showEditDialog = ref(false);
const editingDataSourceId = ref(null);

const formData = ref({
  type: 'static',
  name: '',
  description: '',
  // Static
  data: '{}',
  // API
  url: '',
  method: 'GET',
  interval: 0,
  // WebSocket
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  // LocalStorage
  key: '',
  defaultValue: '{}',
  autoSave: true
});

// ========== 计算属性 ==========

const dataSources = computed(() => datasourceStore.dataSources);
const selectedDataSourceId = computed(() => datasourceStore.selectedDataSourceId);

// ========== 方法 ==========

/**
 * 初始化
 */
onMounted(() => {
  // 注册数据源类型
  dataSourceManager.registerType('static', StaticDataSource);
  dataSourceManager.registerType('api', ApiDataSource);
  dataSourceManager.registerType('websocket', WebSocketDataSource);
  dataSourceManager.registerType('localStorage', LocalStorageDataSource);

  // 初始化 store
  datasourceStore.initialize();
});

/**
 * 选中数据源
 */
const selectDataSource = (id) => {
  datasourceStore.selectDataSource(id);
};

/**
 * 刷新全部
 */
const refreshAll = async () => {
  try {
    await dataSourceManager.refreshAll();
    datasourceStore.refreshDataSources();
  } catch (error) {
    console.error('刷新全部失败:', error);
  }
};

/**
 * 连接数据源
 */
const connect = async (id) => {
  try {
    await datasourceStore.connectDataSource(id);
  } catch (error) {
    alert(`连接失败: ${error.message}`);
  }
};

/**
 * 断开数据源
 */
const disconnect = async (id) => {
  try {
    await datasourceStore.disconnectDataSource(id);
  } catch (error) {
    alert(`断开失败: ${error.message}`);
  }
};

/**
 * 刷新数据源
 */
const refresh = async (id) => {
  try {
    await datasourceStore.refreshDataSource(id);
  } catch (error) {
    alert(`刷新失败: ${error.message}`);
  }
};

/**
 * 编辑数据源
 */
const editDataSource = (ds) => {
  editingDataSourceId.value = ds.id;

  // 填充表单数据
  const dataSource = dataSourceManager.getDataSource(ds.id);
  if (dataSource) {
    formData.value = {
      type: dataSource.type,
      name: dataSource.name,
      description: dataSource.description,
      ...dataSource.config
    };

    // 转换 JSON 数据为字符串
    if (formData.value.data && typeof formData.value.data === 'object') {
      formData.value.data = JSON.stringify(formData.value.data, null, 2);
    }
    if (formData.value.defaultValue && typeof formData.value.defaultValue === 'object') {
      formData.value.defaultValue = JSON.stringify(formData.value.defaultValue, null, 2);
    }
  }

  showEditDialog.value = true;
};

/**
 * 删除数据源
 */
const deleteDataSource = async (id) => {
  if (!confirm('确定要删除此数据源吗？')) {
    return;
  }

  try {
    await datasourceStore.removeDataSource(id);
  } catch (error) {
    alert(`删除失败: ${error.message}`);
  }
};

/**
 * 保存数据源
 */
const saveDataSource = async () => {
  try {
    // 验证必填字段
    if (!formData.value.name) {
      alert('请输入数据源名称');
      return;
    }

    // 构建配置对象
    const config = {
      name: formData.value.name,
      description: formData.value.description,
      type: formData.value.type
    };

    // 根据类型添加特定配置
    if (formData.value.type === 'static') {
      try {
        config.data = JSON.parse(formData.value.data || '{}');
      } catch (error) {
        alert('数据格式错误，请输入有效的 JSON');
        return;
      }
    } else if (formData.value.type === 'api') {
      if (!formData.value.url) {
        alert('请输入 API URL');
        return;
      }
      config.url = formData.value.url;
      config.method = formData.value.method;
      config.interval = formData.value.interval;
    } else if (formData.value.type === 'websocket') {
      if (!formData.value.url) {
        alert('请输入 WebSocket URL');
        return;
      }
      config.url = formData.value.url;
      config.reconnectInterval = formData.value.reconnectInterval;
      config.maxReconnectAttempts = formData.value.maxReconnectAttempts;
    } else if (formData.value.type === 'localStorage') {
      if (!formData.value.key) {
        alert('请输入键名');
        return;
      }
      config.key = formData.value.key;
      try {
        config.defaultValue = JSON.parse(formData.value.defaultValue || '{}');
      } catch (error) {
        alert('默认值格式错误，请输入有效的 JSON');
        return;
      }
      config.autoSave = formData.value.autoSave;
    }

    // 添加或更新数据源
    if (showEditDialog.value) {
      await datasourceStore.updateDataSource(editingDataSourceId.value, config);
    } else {
      await datasourceStore.addDataSource(config);
    }

    closeDialogs();
  } catch (error) {
    alert(`保存失败: ${error.message}`);
  }
};

/**
 * 关闭对话框
 */
const closeDialogs = () => {
  showAddDialog.value = false;
  showEditDialog.value = false;
  editingDataSourceId.value = null;

  // 重置表单
  formData.value = {
    type: 'static',
    name: '',
    description: '',
    data: '{}',
    url: '',
    method: 'GET',
    interval: 0,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    key: '',
    defaultValue: '{}',
    autoSave: true
  };
};

/**
 * 获取类型图标
 */
const getTypeIcon = (type) => {
  const icons = {
    static: '📄',
    api: '🌐',
    websocket: '⚡',
    localStorage: '💾'
  };
  return icons[type] || '❓';
};

/**
 * 获取状态文本
 */
const getStatusText = (status) => {
  const texts = {
    idle: '空闲',
    connecting: '连接中',
    connected: '已连接',
    disconnected: '已断开',
    error: '错误'
  };
  return texts[status] || status;
};

/**
 * 格式化时间
 */
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};
</script>

<style scoped>
.datasource-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

/* 工具栏 */
.toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.btn-primary,
.btn-secondary {
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
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

/* 数据源列表 */
.datasource-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.datasource-item {
  padding: 12px;
  margin-bottom: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.datasource-item:hover {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}

.datasource-item.selected {
  background: var(--bg-hover);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.datasource-info {
  margin-bottom: 8px;
}

.datasource-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.datasource-icon {
  font-size: 18px;
}

.datasource-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.datasource-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-idle {
  background: #4a5568;
  color: white;
}

.status-connecting {
  background: #f59e0b;
  color: white;
}

.status-connected {
  background: #10b981;
  color: white;
}

.status-disconnected {
  background: #6b7280;
  color: white;
}

.status-error {
  background: #ef4444;
  color: white;
}

.datasource-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.datasource-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.datasource-error {
  margin-top: 6px;
  padding: 6px;
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
  font-size: 12px;
  color: #ef4444;
}

.datasource-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}

.btn-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}

.btn-icon.btn-danger:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

/* 空状态 */
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state p {
  margin: 8px 0;
}

/* 模态框 */
.modal-overlay {
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

.modal-content {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
}

.btn-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
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

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.form-group input[type="checkbox"] {
  margin-right: 6px;
}

.modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}
</style>

