/**
 * API 数据源
 * 用于从 REST API 获取数据
 */

import { BaseDataSource, DataSourceStatus, DataSourceType } from './BaseDataSource.js';

/**
 * API 数据源类
 */
export class ApiDataSource extends BaseDataSource {
  /**
   * 构造函数
   * @param {Object} config - 数据源配置
   * @param {string} config.url - API URL
   * @param {string} config.method - HTTP 方法（GET/POST）
   * @param {Object} config.headers - 请求头
   * @param {Object} config.body - 请求体（POST 时使用）
   * @param {number} config.interval - 自动刷新间隔（毫秒，0 表示不自动刷新）
   */
  constructor(config) {
    super({
      ...config,
      type: DataSourceType.API
    });
    
    this.url = config.url;
    this.method = config.method || 'GET';
    this.headers = config.headers || {};
    this.body = config.body || null;
    this.interval = config.interval || 0;
    
    // 自动刷新定时器
    this.refreshTimer = null;
  }

  /**
   * 初始化数据源
   */
  async initialize() {
    this.setStatus(DataSourceStatus.CONNECTING);
    
    try {
      // 首次获取数据
      await this.fetchData();
      
      this.setStatus(DataSourceStatus.CONNECTED);
      
      // 启动自动刷新
      if (this.interval > 0) {
        this.startAutoRefresh();
      }
      
      console.log(`API 数据源已初始化: ${this.name}`);
    } catch (error) {
      this.setError(error);
      throw error;
    }
  }

  /**
   * 连接数据源
   */
  async connect() {
    await this.initialize();
  }

  /**
   * 断开数据源
   */
  async disconnect() {
    this.stopAutoRefresh();
    this.setStatus(DataSourceStatus.DISCONNECTED);
  }

  /**
   * 销毁数据源
   */
  async destroy() {
    this.stopAutoRefresh();
    await super.destroy();
  }

  /**
   * 获取数据
   */
  async getData() {
    if (!this.data) {
      await this.fetchData();
    }
    return this.data;
  }

  /**
   * 刷新数据
   */
  async refresh() {
    await this.fetchData();
  }

  /**
   * 从 API 获取数据
   */
  async fetchData() {
    try {
      const options = {
        method: this.method,
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        }
      };
      
      if (this.method === 'POST' && this.body) {
        options.body = JSON.stringify(this.body);
      }
      
      const response = await fetch(this.url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.setData(data);
      
      console.log(`已从 API 获取数据: ${this.name}`);
    } catch (error) {
      console.error(`从 API 获取数据失败: ${this.name}`, error);
      this.setError(error);
      throw error;
    }
  }

  /**
   * 启动自动刷新
   */
  startAutoRefresh() {
    if (this.refreshTimer) {
      return;
    }
    
    this.refreshTimer = setInterval(() => {
      this.fetchData().catch(error => {
        console.error('自动刷新失败:', error);
      });
    }, this.interval);
    
    console.log(`已启动自动刷新: ${this.name}, 间隔 ${this.interval}ms`);
  }

  /**
   * 停止自动刷新
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log(`已停止自动刷新: ${this.name}`);
    }
  }

  /**
   * 验证配置
   */
  validate() {
    const baseValidation = super.validate();
    
    if (!baseValidation.valid) {
      return baseValidation;
    }
    
    const errors = [];
    
    if (!this.url) {
      errors.push('API URL 不能为空');
    }
    
    // 验证 URL 格式
    try {
      new URL(this.url);
    } catch (error) {
      errors.push('API URL 格式无效');
    }
    
    // 验证 HTTP 方法
    if (!['GET', 'POST'].includes(this.method)) {
      errors.push('HTTP 方法必须是 GET 或 POST');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 序列化数据源配置
   */
  serialize() {
    return {
      ...super.serialize(),
      url: this.url,
      method: this.method,
      headers: this.headers,
      body: this.body,
      interval: this.interval
    };
  }

  /**
   * 从序列化数据恢复数据源
   */
  static deserialize(data) {
    return new ApiDataSource(data);
  }
}

