/**
 * 数据源状态管理 Store
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { dataSourceManager } from '../../core/datasource/DataSourceManager.js';

export const useDatasourceStore = defineStore('datasource', () => {
  // ========== 状态 ==========
  
  /**
   * 数据源列表
   */
  const dataSources = ref([]);
  
  /**
   * 选中的数据源 ID
   */
  const selectedDataSourceId = ref(null);
  
  /**
   * 数据绑定映射 Map<nodeId, Map<propertyKey, binding>>
   */
  const bindings = ref(new Map());
  
  // ========== 计算属性 ==========
  
  /**
   * 选中的数据源
   */
  const selectedDataSource = computed(() => {
    if (!selectedDataSourceId.value) return null;
    return dataSources.value.find(ds => ds.id === selectedDataSourceId.value);
  });
  
  /**
   * 数据源统计
   */
  const stats = computed(() => {
    return dataSourceManager.getStats();
  });
  
  // ========== 方法 ==========
  
  /**
   * 初始化
   */
  const initialize = () => {
    // 监听数据源管理器的全局事件
    dataSourceManager.onGlobalChange((event, data) => {
      if (event === 'add' || event === 'remove' || event === 'statusChange') {
        refreshDataSources();
      }
    });
    
    // 初始加载数据源列表
    refreshDataSources();
  };
  
  /**
   * 刷新数据源列表
   */
  const refreshDataSources = () => {
    dataSources.value = dataSourceManager.getAllDataSources().map(ds => ds.getInfo());
  };
  
  /**
   * 添加数据源
   * @param {Object} config - 数据源配置
   */
  const addDataSource = async (config) => {
    try {
      const dataSource = dataSourceManager.createDataSource(config);
      await dataSourceManager.addDataSource(dataSource);
      refreshDataSources();
      return dataSource;
    } catch (error) {
      console.error('添加数据源失败:', error);
      throw error;
    }
  };
  
  /**
   * 移除数据源
   * @param {string} id - 数据源 ID
   */
  const removeDataSource = async (id) => {
    try {
      // 移除所有使用此数据源的绑定
      removeBindingsByDataSource(id);
      
      await dataSourceManager.removeDataSource(id);
      
      if (selectedDataSourceId.value === id) {
        selectedDataSourceId.value = null;
      }
      
      refreshDataSources();
    } catch (error) {
      console.error('移除数据源失败:', error);
      throw error;
    }
  };
  
  /**
   * 更新数据源配置
   * @param {string} id - 数据源 ID
   * @param {Object} config - 新配置
   */
  const updateDataSource = async (id, config) => {
    try {
      // 先移除旧的数据源
      await removeDataSource(id);
      
      // 添加新的数据源（保持相同的 ID）
      config.id = id;
      await addDataSource(config);
      
      refreshDataSources();
    } catch (error) {
      console.error('更新数据源失败:', error);
      throw error;
    }
  };
  
  /**
   * 刷新数据源
   * @param {string} id - 数据源 ID
   */
  const refreshDataSource = async (id) => {
    try {
      await dataSourceManager.refreshDataSource(id);
      refreshDataSources();
    } catch (error) {
      console.error('刷新数据源失败:', error);
      throw error;
    }
  };
  
  /**
   * 连接数据源
   * @param {string} id - 数据源 ID
   */
  const connectDataSource = async (id) => {
    try {
      await dataSourceManager.connectDataSource(id);
      refreshDataSources();
    } catch (error) {
      console.error('连接数据源失败:', error);
      throw error;
    }
  };
  
  /**
   * 断开数据源
   * @param {string} id - 数据源 ID
   */
  const disconnectDataSource = async (id) => {
    try {
      await dataSourceManager.disconnectDataSource(id);
      refreshDataSources();
    } catch (error) {
      console.error('断开数据源失败:', error);
      throw error;
    }
  };
  
  /**
   * 选中数据源
   * @param {string} id - 数据源 ID
   */
  const selectDataSource = (id) => {
    selectedDataSourceId.value = id;
  };
  
  /**
   * 添加数据绑定
   * @param {string} nodeId - 节点 ID
   * @param {string} propertyKey - 属性键
   * @param {Object} binding - 绑定配置
   */
  const addBinding = (nodeId, propertyKey, binding) => {
    if (!bindings.value.has(nodeId)) {
      bindings.value.set(nodeId, new Map());
    }
    
    bindings.value.get(nodeId).set(propertyKey, binding);
    
    console.log(`已添加数据绑定: ${nodeId}.${propertyKey} -> ${binding.dataSourceId}`);
  };
  
  /**
   * 移除数据绑定
   * @param {string} nodeId - 节点 ID
   * @param {string} propertyKey - 属性键
   */
  const removeBinding = (nodeId, propertyKey) => {
    if (!bindings.value.has(nodeId)) return;
    
    bindings.value.get(nodeId).delete(propertyKey);
    
    if (bindings.value.get(nodeId).size === 0) {
      bindings.value.delete(nodeId);
    }
    
    console.log(`已移除数据绑定: ${nodeId}.${propertyKey}`);
  };
  
  /**
   * 获取节点的数据绑定
   * @param {string} nodeId - 节点 ID
   * @param {string} propertyKey - 属性键
   * @returns {Object|null} 绑定配置
   */
  const getBinding = (nodeId, propertyKey) => {
    if (!bindings.value.has(nodeId)) return null;
    return bindings.value.get(nodeId).get(propertyKey) || null;
  };
  
  /**
   * 获取节点的所有数据绑定
   * @param {string} nodeId - 节点 ID
   * @returns {Map<string, Object>} 绑定映射
   */
  const getNodeBindings = (nodeId) => {
    return bindings.value.get(nodeId) || new Map();
  };
  
  /**
   * 移除节点的所有数据绑定
   * @param {string} nodeId - 节点 ID
   */
  const removeNodeBindings = (nodeId) => {
    bindings.value.delete(nodeId);
    console.log(`已移除节点的所有数据绑定: ${nodeId}`);
  };
  
  /**
   * 移除使用指定数据源的所有绑定
   * @param {string} dataSourceId - 数据源 ID
   */
  const removeBindingsByDataSource = (dataSourceId) => {
    let count = 0;
    
    bindings.value.forEach((nodeBindings, nodeId) => {
      const keysToRemove = [];
      
      nodeBindings.forEach((binding, propertyKey) => {
        if (binding.dataSourceId === dataSourceId) {
          keysToRemove.push(propertyKey);
          count++;
        }
      });
      
      keysToRemove.forEach(key => nodeBindings.delete(key));
      
      if (nodeBindings.size === 0) {
        bindings.value.delete(nodeId);
      }
    });
    
    if (count > 0) {
      console.log(`已移除 ${count} 个使用数据源 ${dataSourceId} 的绑定`);
    }
  };
  
  /**
   * 清空所有数据源
   */
  const clearAll = async () => {
    await dataSourceManager.clear();
    bindings.value.clear();
    selectedDataSourceId.value = null;
    refreshDataSources();
  };
  
  // ========== 返回 ==========
  
  return {
    // 状态
    dataSources,
    selectedDataSourceId,
    bindings,
    
    // 计算属性
    selectedDataSource,
    stats,
    
    // 方法
    initialize,
    refreshDataSources,
    addDataSource,
    removeDataSource,
    updateDataSource,
    refreshDataSource,
    connectDataSource,
    disconnectDataSource,
    selectDataSource,
    addBinding,
    removeBinding,
    getBinding,
    getNodeBindings,
    removeNodeBindings,
    removeBindingsByDataSource,
    clearAll
  };
});

