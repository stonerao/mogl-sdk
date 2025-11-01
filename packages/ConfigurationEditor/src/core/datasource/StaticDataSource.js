/**
 * 静态数据源
 * 用于存储静态 JSON 数据
 */

import { BaseDataSource, DataSourceStatus, DataSourceType } from './BaseDataSource.js';

/**
 * 静态数据源类
 */
export class StaticDataSource extends BaseDataSource {
  /**
   * 构造函数
   * @param {Object} config - 数据源配置
   * @param {any} config.data - 静态数据
   */
  constructor(config) {
    super({
      ...config,
      type: DataSourceType.STATIC
    });
    
    // 设置初始数据
    if (config.data !== undefined) {
      this.data = config.data;
    }
  }

  /**
   * 初始化数据源
   */
  async initialize() {
    this.setStatus(DataSourceStatus.CONNECTING);
    
    try {
      // 静态数据源不需要连接，直接标记为已连接
      this.setStatus(DataSourceStatus.CONNECTED);
      this.lastUpdate = Date.now();
      
      console.log(`静态数据源已初始化: ${this.name}`);
    } catch (error) {
      this.setError(error);
      throw error;
    }
  }

  /**
   * 连接数据源
   */
  async connect() {
    this.setStatus(DataSourceStatus.CONNECTED);
  }

  /**
   * 断开数据源
   */
  async disconnect() {
    this.setStatus(DataSourceStatus.DISCONNECTED);
  }

  /**
   * 获取数据
   */
  async getData() {
    return this.data;
  }

  /**
   * 更新数据
   * @param {any} data - 新数据
   */
  updateData(data) {
    this.setData(data);
  }

  /**
   * 刷新数据
   */
  async refresh() {
    // 静态数据源不需要刷新
    this.lastUpdate = Date.now();
  }

  /**
   * 验证配置
   */
  validate() {
    const baseValidation = super.validate();
    
    if (!baseValidation.valid) {
      return baseValidation;
    }
    
    // 静态数据源没有额外的验证要求
    return { valid: true, errors: [] };
  }

  /**
   * 序列化数据源配置
   */
  serialize() {
    return {
      ...super.serialize(),
      data: this.data
    };
  }

  /**
   * 从序列化数据恢复数据源
   */
  static deserialize(data) {
    return new StaticDataSource(data);
  }
}

