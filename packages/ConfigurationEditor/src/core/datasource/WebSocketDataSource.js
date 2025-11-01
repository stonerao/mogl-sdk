/**
 * WebSocket 数据源
 * 用于实时数据流
 */

import { BaseDataSource, DataSourceStatus, DataSourceType } from './BaseDataSource.js';

/**
 * WebSocket 数据源类
 */
export class WebSocketDataSource extends BaseDataSource {
  /**
   * 构造函数
   * @param {Object} config - 数据源配置
   * @param {string} config.url - WebSocket URL
   * @param {Array<string>} config.protocols - WebSocket 协议
   * @param {number} config.reconnectInterval - 重连间隔（毫秒）
   * @param {number} config.maxReconnectAttempts - 最大重连次数
   */
  constructor(config) {
    super({
      ...config,
      type: DataSourceType.WEBSOCKET
    });
    
    this.url = config.url;
    this.protocols = config.protocols || [];
    this.reconnectInterval = config.reconnectInterval || 3000;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
    
    // WebSocket 实例
    this.ws = null;
    
    // 重连计数
    this.reconnectAttempts = 0;
    
    // 重连定时器
    this.reconnectTimer = null;
  }

  /**
   * 初始化数据源
   */
  async initialize() {
    this.setStatus(DataSourceStatus.CONNECTING);
    
    try {
      await this.connect();
      console.log(`WebSocket 数据源已初始化: ${this.name}`);
    } catch (error) {
      this.setError(error);
      throw error;
    }
  }

  /**
   * 连接数据源
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // 创建 WebSocket 连接
        this.ws = new WebSocket(this.url, this.protocols);
        
        // 连接打开
        this.ws.onopen = () => {
          this.setStatus(DataSourceStatus.CONNECTED);
          this.reconnectAttempts = 0;
          this.clearError();
          console.log(`WebSocket 已连接: ${this.name}`);
          resolve();
        };
        
        // 接收消息
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.setData(data);
          } catch (error) {
            console.error('解析 WebSocket 消息失败:', error);
          }
        };
        
        // 连接关闭
        this.ws.onclose = () => {
          this.setStatus(DataSourceStatus.DISCONNECTED);
          console.log(`WebSocket 已断开: ${this.name}`);
          
          // 尝试重连
          this.attemptReconnect();
        };
        
        // 连接错误
        this.ws.onerror = (error) => {
          console.error(`WebSocket 错误: ${this.name}`, error);
          this.setError('WebSocket 连接错误');
          reject(error);
        };
      } catch (error) {
        this.setError(error);
        reject(error);
      }
    });
  }

  /**
   * 断开数据源
   */
  async disconnect() {
    // 停止重连
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // 关闭 WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.setStatus(DataSourceStatus.DISCONNECTED);
  }

  /**
   * 销毁数据源
   */
  async destroy() {
    await this.disconnect();
    await super.destroy();
  }

  /**
   * 获取数据
   */
  async getData() {
    return this.data;
  }

  /**
   * 刷新数据
   */
  async refresh() {
    // WebSocket 是实时数据流，不需要手动刷新
    console.log('WebSocket 数据源不支持手动刷新');
  }

  /**
   * 发送消息
   * @param {any} message - 消息内容
   */
  send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket 未连接');
    }
    
    const data = typeof message === 'string' ? message : JSON.stringify(message);
    this.ws.send(data);
  }

  /**
   * 尝试重连
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`WebSocket 重连失败，已达到最大重连次数: ${this.name}`);
      this.setError('WebSocket 重连失败');
      return;
    }
    
    this.reconnectAttempts++;
    
    console.log(`WebSocket 将在 ${this.reconnectInterval}ms 后重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts}): ${this.name}`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('WebSocket 重连失败:', error);
      });
    }, this.reconnectInterval);
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
      errors.push('WebSocket URL 不能为空');
    }
    
    // 验证 URL 格式
    if (this.url && !this.url.startsWith('ws://') && !this.url.startsWith('wss://')) {
      errors.push('WebSocket URL 必须以 ws:// 或 wss:// 开头');
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
      protocols: this.protocols,
      reconnectInterval: this.reconnectInterval,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  /**
   * 从序列化数据恢复数据源
   */
  static deserialize(data) {
    return new WebSocketDataSource(data);
  }
}

