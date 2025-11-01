/**
 * 本地存储数据源
 * 用于从浏览器 localStorage 读取和写入数据
 */

import { BaseDataSource, DataSourceStatus, DataSourceType } from './BaseDataSource.js';

/**
 * 本地存储数据源类
 */
export class LocalStorageDataSource extends BaseDataSource {
  /**
   * 构造函数
   * @param {Object} config - 数据源配置
   * @param {string} config.key - localStorage 键名
   * @param {any} config.defaultValue - 默认值（当键不存在时使用）
   * @param {boolean} config.autoSave - 是否自动保存数据变化
   */
  constructor(config) {
    super({
      ...config,
      type: DataSourceType.LOCALSTORAGE
    });
    
    this.key = config.key;
    this.defaultValue = config.defaultValue || null;
    this.autoSave = config.autoSave !== false; // 默认为 true
  }

  /**
   * 初始化数据源
   */
  async initialize() {
    this.setStatus(DataSourceStatus.CONNECTING);
    
    try {
      // 从 localStorage 读取数据
      await this.loadData();
      
      this.setStatus(DataSourceStatus.CONNECTED);
      
      console.log(`本地存储数据源已初始化: ${this.name}`);
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
    // 如果启用了自动保存，断开前保存数据
    if (this.autoSave && this.data !== null) {
      await this.saveData();
    }
    
    this.setStatus(DataSourceStatus.DISCONNECTED);
  }

  /**
   * 获取数据
   */
  async getData() {
    if (this.data === null) {
      await this.loadData();
    }
    return this.data;
  }

  /**
   * 刷新数据
   */
  async refresh() {
    await this.loadData();
  }

  /**
   * 从 localStorage 加载数据
   */
  async loadData() {
    try {
      const value = localStorage.getItem(this.key);
      
      if (value === null) {
        // 键不存在，使用默认值
        this.setData(this.defaultValue);
      } else {
        // 解析 JSON 数据
        const data = JSON.parse(value);
        this.setData(data);
      }
      
      console.log(`已从 localStorage 加载数据: ${this.name}`);
    } catch (error) {
      console.error(`从 localStorage 加载数据失败: ${this.name}`, error);
      this.setError(error);
      throw error;
    }
  }

  /**
   * 保存数据到 localStorage
   */
  async saveData() {
    try {
      const value = JSON.stringify(this.data);
      localStorage.setItem(this.key, value);
      
      console.log(`已保存数据到 localStorage: ${this.name}`);
    } catch (error) {
      console.error(`保存数据到 localStorage 失败: ${this.name}`, error);
      this.setError(error);
      throw error;
    }
  }

  /**
   * 设置数据（重写父类方法）
   */
  setData(data) {
    super.setData(data);
    
    // 如果启用了自动保存，立即保存
    if (this.autoSave) {
      this.saveData().catch(error => {
        console.error('自动保存失败:', error);
      });
    }
  }

  /**
   * 清除数据
   */
  async clearData() {
    try {
      localStorage.removeItem(this.key);
      this.setData(this.defaultValue);
      
      console.log(`已清除 localStorage 数据: ${this.name}`);
    } catch (error) {
      console.error(`清除 localStorage 数据失败: ${this.name}`, error);
      this.setError(error);
      throw error;
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
    
    if (!this.key) {
      errors.push('localStorage 键名不能为空');
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
      key: this.key,
      defaultValue: this.defaultValue,
      autoSave: this.autoSave
    };
  }

  /**
   * 从序列化数据恢复数据源
   */
  static deserialize(data) {
    return new LocalStorageDataSource(data);
  }
}

