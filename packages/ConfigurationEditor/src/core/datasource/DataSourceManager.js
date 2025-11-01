/**
 * 数据源管理器
 * 负责管理所有数据源的注册、查询、生命周期等
 */

import { DataSourceStatus } from './BaseDataSource.js';

/**
 * 数据源管理器类
 */
export class DataSourceManager {
  constructor() {
    // 数据源注册表 Map<id, dataSource>
    this.dataSources = new Map();
    
    // 数据源类型注册表 Map<type, DataSourceClass>
    this.dataSourceTypes = new Map();
    
    // 全局监听器
    this.globalListeners = new Set();
  }

  /**
   * 注册数据源类型
   * @param {string} type - 数据源类型
   * @param {Class} DataSourceClass - 数据源类
   */
  registerType(type, DataSourceClass) {
    if (this.dataSourceTypes.has(type)) {
      console.warn(`数据源类型 "${type}" 已存在，将被覆盖`);
    }
    this.dataSourceTypes.set(type, DataSourceClass);
    console.log(`已注册数据源类型: ${type}`);
  }

  /**
   * 注销数据源类型
   * @param {string} type - 数据源类型
   */
  unregisterType(type) {
    this.dataSourceTypes.delete(type);
    console.log(`已注销数据源类型: ${type}`);
  }

  /**
   * 创建数据源
   * @param {Object} config - 数据源配置
   * @returns {BaseDataSource} 数据源实例
   */
  createDataSource(config) {
    const { type } = config;
    
    if (!type) {
      throw new Error('数据源类型不能为空');
    }
    
    const DataSourceClass = this.dataSourceTypes.get(type);
    
    if (!DataSourceClass) {
      throw new Error(`未注册的数据源类型: ${type}`);
    }
    
    // 生成唯一 ID（如果没有提供）
    if (!config.id) {
      config.id = this.generateId(type);
    }
    
    // 检查 ID 是否已存在
    if (this.dataSources.has(config.id)) {
      throw new Error(`数据源 ID "${config.id}" 已存在`);
    }
    
    // 创建数据源实例
    const dataSource = new DataSourceClass(config);
    
    // 验证配置
    const validation = dataSource.validate();
    if (!validation.valid) {
      throw new Error(`数据源配置无效: ${validation.errors.join(', ')}`);
    }
    
    return dataSource;
  }

  /**
   * 添加数据源
   * @param {BaseDataSource} dataSource - 数据源实例
   */
  async addDataSource(dataSource) {
    if (this.dataSources.has(dataSource.id)) {
      throw new Error(`数据源 ID "${dataSource.id}" 已存在`);
    }
    
    // 添加到注册表
    this.dataSources.set(dataSource.id, dataSource);
    
    // 监听数据源状态变化
    dataSource.onStatusChange((status) => {
      this.notifyGlobalListeners('statusChange', {
        dataSourceId: dataSource.id,
        status
      });
    });
    
    // 监听数据源数据变化
    dataSource.onDataChange((data) => {
      this.notifyGlobalListeners('dataChange', {
        dataSourceId: dataSource.id,
        data
      });
    });
    
    // 通知添加事件
    this.notifyGlobalListeners('add', { dataSource });
    
    console.log(`已添加数据源: ${dataSource.name} (${dataSource.id})`);
    
    // 初始化数据源
    try {
      await dataSource.initialize();
    } catch (error) {
      console.error(`数据源初始化失败: ${dataSource.name}`, error);
      dataSource.setError(error);
    }
  }

  /**
   * 移除数据源
   * @param {string} id - 数据源 ID
   */
  async removeDataSource(id) {
    const dataSource = this.dataSources.get(id);
    
    if (!dataSource) {
      throw new Error(`数据源 "${id}" 不存在`);
    }
    
    // 销毁数据源
    await dataSource.destroy();
    
    // 从注册表中移除
    this.dataSources.delete(id);
    
    // 通知移除事件
    this.notifyGlobalListeners('remove', { dataSourceId: id });
    
    console.log(`已移除数据源: ${dataSource.name} (${id})`);
  }

  /**
   * 获取数据源
   * @param {string} id - 数据源 ID
   * @returns {BaseDataSource} 数据源实例
   */
  getDataSource(id) {
    return this.dataSources.get(id);
  }

  /**
   * 获取所有数据源
   * @returns {Array<BaseDataSource>} 数据源列表
   */
  getAllDataSources() {
    return Array.from(this.dataSources.values());
  }

  /**
   * 根据类型获取数据源
   * @param {string} type - 数据源类型
   * @returns {Array<BaseDataSource>} 数据源列表
   */
  getDataSourcesByType(type) {
    return this.getAllDataSources().filter(ds => ds.type === type);
  }

  /**
   * 检查数据源是否存在
   * @param {string} id - 数据源 ID
   * @returns {boolean} 是否存在
   */
  hasDataSource(id) {
    return this.dataSources.has(id);
  }

  /**
   * 刷新数据源
   * @param {string} id - 数据源 ID
   */
  async refreshDataSource(id) {
    const dataSource = this.getDataSource(id);
    
    if (!dataSource) {
      throw new Error(`数据源 "${id}" 不存在`);
    }
    
    try {
      await dataSource.refresh();
      console.log(`已刷新数据源: ${dataSource.name}`);
    } catch (error) {
      console.error(`刷新数据源失败: ${dataSource.name}`, error);
      dataSource.setError(error);
      throw error;
    }
  }

  /**
   * 刷新所有数据源
   */
  async refreshAll() {
    const promises = this.getAllDataSources().map(ds => 
      this.refreshDataSource(ds.id).catch(error => {
        console.error(`刷新数据源失败: ${ds.name}`, error);
      })
    );
    
    await Promise.all(promises);
  }

  /**
   * 连接数据源
   * @param {string} id - 数据源 ID
   */
  async connectDataSource(id) {
    const dataSource = this.getDataSource(id);
    
    if (!dataSource) {
      throw new Error(`数据源 "${id}" 不存在`);
    }
    
    try {
      await dataSource.connect();
      console.log(`已连接数据源: ${dataSource.name}`);
    } catch (error) {
      console.error(`连接数据源失败: ${dataSource.name}`, error);
      dataSource.setError(error);
      throw error;
    }
  }

  /**
   * 断开数据源
   * @param {string} id - 数据源 ID
   */
  async disconnectDataSource(id) {
    const dataSource = this.getDataSource(id);
    
    if (!dataSource) {
      throw new Error(`数据源 "${id}" 不存在`);
    }
    
    try {
      await dataSource.disconnect();
      console.log(`已断开数据源: ${dataSource.name}`);
    } catch (error) {
      console.error(`断开数据源失败: ${dataSource.name}`, error);
      throw error;
    }
  }

  /**
   * 添加全局监听器
   * @param {Function} listener - 监听器函数
   * @returns {Function} 取消监听函数
   */
  onGlobalChange(listener) {
    this.globalListeners.add(listener);
    return () => this.globalListeners.delete(listener);
  }

  /**
   * 通知全局监听器
   * @param {string} event - 事件类型
   * @param {any} data - 事件数据
   */
  notifyGlobalListeners(event, data) {
    this.globalListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('全局监听器执行错误:', error);
      }
    });
  }

  /**
   * 生成唯一 ID
   * @param {string} type - 数据源类型
   * @returns {string} 唯一 ID
   */
  generateId(type) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${type}_${timestamp}_${random}`;
  }

  /**
   * 清空所有数据源
   */
  async clear() {
    const ids = Array.from(this.dataSources.keys());
    
    for (const id of ids) {
      await this.removeDataSource(id);
    }
    
    console.log('已清空所有数据源');
  }

  /**
   * 获取数据源统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    const dataSources = this.getAllDataSources();
    
    return {
      total: dataSources.length,
      connected: dataSources.filter(ds => ds.status === DataSourceStatus.CONNECTED).length,
      disconnected: dataSources.filter(ds => ds.status === DataSourceStatus.DISCONNECTED).length,
      error: dataSources.filter(ds => ds.status === DataSourceStatus.ERROR).length,
      byType: this.getStatsByType()
    };
  }

  /**
   * 按类型获取统计信息
   * @returns {Object} 类型统计
   */
  getStatsByType() {
    const stats = {};
    
    this.getAllDataSources().forEach(ds => {
      if (!stats[ds.type]) {
        stats[ds.type] = 0;
      }
      stats[ds.type]++;
    });
    
    return stats;
  }
}

// 创建单例
export const dataSourceManager = new DataSourceManager();

