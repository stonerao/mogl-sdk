/**
 * 基础数据源类
 * 所有数据源类型都继承自此基类
 */

/**
 * 数据源状态枚举
 */
export const DataSourceStatus = {
  IDLE: 'idle',           // 空闲
  CONNECTING: 'connecting', // 连接中
  CONNECTED: 'connected',   // 已连接
  DISCONNECTED: 'disconnected', // 已断开
  ERROR: 'error'          // 错误
};

/**
 * 数据源类型枚举
 */
export const DataSourceType = {
  STATIC: 'static',       // 静态数据
  API: 'api',             // REST API
  WEBSOCKET: 'websocket', // WebSocket
  LOCALSTORAGE: 'localStorage' // 本地存储
};

/**
 * 基础数据源类
 */
export class BaseDataSource {
  /**
   * 构造函数
   * @param {Object} config - 数据源配置
   * @param {string} config.id - 数据源唯一标识
   * @param {string} config.name - 数据源名称
   * @param {string} config.type - 数据源类型
   * @param {string} config.description - 数据源描述
   */
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.description = config.description || '';
    this.config = config;
    
    // 数据源状态
    this.status = DataSourceStatus.IDLE;
    
    // 数据缓存
    this.data = null;
    
    // 错误信息
    this.error = null;
    
    // 最后更新时间
    this.lastUpdate = null;
    
    // 数据变化监听器
    this.listeners = new Set();
    
    // 状态变化监听器
    this.statusListeners = new Set();
  }

  /**
   * 初始化数据源
   * 子类应该重写此方法
   */
  async initialize() {
    this.setStatus(DataSourceStatus.CONNECTING);
    // 子类实现具体的初始化逻辑
  }

  /**
   * 连接数据源
   * 子类应该重写此方法
   */
  async connect() {
    // 子类实现具体的连接逻辑
  }

  /**
   * 断开数据源
   * 子类应该重写此方法
   */
  async disconnect() {
    this.setStatus(DataSourceStatus.DISCONNECTED);
    // 子类实现具体的断开逻辑
  }

  /**
   * 销毁数据源
   * 子类应该重写此方法
   */
  async destroy() {
    await this.disconnect();
    this.listeners.clear();
    this.statusListeners.clear();
    this.data = null;
    this.error = null;
  }

  /**
   * 获取数据
   * 子类应该重写此方法
   * @returns {Promise<any>} 数据
   */
  async getData() {
    return this.data;
  }

  /**
   * 设置数据
   * @param {any} data - 数据
   */
  setData(data) {
    this.data = data;
    this.lastUpdate = Date.now();
    this.notifyDataChange(data);
  }

  /**
   * 刷新数据
   * 子类应该重写此方法
   */
  async refresh() {
    // 子类实现具体的刷新逻辑
  }

  /**
   * 验证配置
   * 子类应该重写此方法
   * @returns {Object} 验证结果 { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];
    
    if (!this.id) {
      errors.push('数据源 ID 不能为空');
    }
    
    if (!this.name) {
      errors.push('数据源名称不能为空');
    }
    
    if (!this.type) {
      errors.push('数据源类型不能为空');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 设置状态
   * @param {string} status - 状态
   */
  setStatus(status) {
    if (this.status !== status) {
      this.status = status;
      this.notifyStatusChange(status);
    }
  }

  /**
   * 设置错误
   * @param {Error|string} error - 错误
   */
  setError(error) {
    this.error = error instanceof Error ? error.message : error;
    this.setStatus(DataSourceStatus.ERROR);
  }

  /**
   * 清除错误
   */
  clearError() {
    this.error = null;
    if (this.status === DataSourceStatus.ERROR) {
      this.setStatus(DataSourceStatus.IDLE);
    }
  }

  /**
   * 添加数据变化监听器
   * @param {Function} listener - 监听器函数
   */
  onDataChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 添加状态变化监听器
   * @param {Function} listener - 监听器函数
   */
  onStatusChange(listener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  /**
   * 通知数据变化
   * @param {any} data - 数据
   */
  notifyDataChange(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('数据变化监听器执行错误:', error);
      }
    });
  }

  /**
   * 通知状态变化
   * @param {string} status - 状态
   */
  notifyStatusChange(status) {
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('状态变化监听器执行错误:', error);
      }
    });
  }

  /**
   * 序列化数据源配置
   * @returns {Object} 序列化后的配置
   */
  serialize() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      config: this.config
    };
  }

  /**
   * 从序列化数据恢复数据源
   * @param {Object} data - 序列化数据
   * @returns {BaseDataSource} 数据源实例
   */
  static deserialize(data) {
    // 子类应该重写此方法
    return new BaseDataSource(data);
  }

  /**
   * 获取数据源信息
   * @returns {Object} 数据源信息
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      status: this.status,
      error: this.error,
      lastUpdate: this.lastUpdate,
      hasData: this.data !== null
    };
  }
}

