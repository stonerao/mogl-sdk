/**
 * 数据绑定系统
 * 实现节点属性与数据源的绑定机制
 */

import { dataSourceManager } from './DataSourceManager.js';

/**
 * 绑定模式枚举
 */
export const BindingMode = {
  ONE_WAY: 'oneWay',       // 单向绑定（数据源 -> 节点）
  TWO_WAY: 'twoWay'        // 双向绑定（数据源 <-> 节点）
};

/**
 * 数据绑定类
 */
export class DataBinding {
  /**
   * 构造函数
   * @param {Object} config - 绑定配置
   * @param {string} config.nodeId - 节点 ID
   * @param {string} config.propertyKey - 属性键
   * @param {string} config.dataSourceId - 数据源 ID
   * @param {string} config.dataPath - 数据路径（如 'user.name'）
   * @param {string} config.mode - 绑定模式
   * @param {Function} config.transform - 数据转换函数
   * @param {Function} config.reverseTransform - 反向转换函数（双向绑定时使用）
   */
  constructor(config) {
    this.nodeId = config.nodeId;
    this.propertyKey = config.propertyKey;
    this.dataSourceId = config.dataSourceId;
    this.dataPath = config.dataPath || '';
    this.mode = config.mode || BindingMode.ONE_WAY;
    this.transform = config.transform || (value => value);
    this.reverseTransform = config.reverseTransform || (value => value);
    
    // 绑定状态
    this.active = false;
    
    // 数据源监听器取消函数
    this.unsubscribeDataSource = null;
    
    // 节点监听器取消函数
    this.unsubscribeNode = null;
    
    // 最后的值（用于检测循环更新）
    this.lastValue = null;
    
    // 更新中标志（防止循环更新）
    this.updating = false;
  }

  /**
   * 激活绑定
   * @param {Object} node - 节点实例
   */
  activate(node) {
    if (this.active) {
      console.warn('绑定已激活');
      return;
    }
    
    const dataSource = dataSourceManager.getDataSource(this.dataSourceId);
    
    if (!dataSource) {
      console.error(`数据源 "${this.dataSourceId}" 不存在`);
      return;
    }
    
    // 监听数据源变化
    this.unsubscribeDataSource = dataSource.onDataChange((data) => {
      this.updateNodeFromDataSource(node, data);
    });
    
    // 如果是双向绑定，监听节点属性变化
    if (this.mode === BindingMode.TWO_WAY) {
      // 这里需要节点支持属性变化监听
      // 暂时使用简单的实现
      this.unsubscribeNode = this.watchNodeProperty(node, this.propertyKey, (value) => {
        this.updateDataSourceFromNode(dataSource, value);
      });
    }
    
    // 初始同步：从数据源更新节点
    const initialData = dataSource.data;
    if (initialData !== null) {
      this.updateNodeFromDataSource(node, initialData);
    }
    
    this.active = true;
    console.log(`已激活数据绑定: ${this.nodeId}.${this.propertyKey} -> ${this.dataSourceId}`);
  }

  /**
   * 停用绑定
   */
  deactivate() {
    if (!this.active) {
      return;
    }
    
    // 取消数据源监听
    if (this.unsubscribeDataSource) {
      this.unsubscribeDataSource();
      this.unsubscribeDataSource = null;
    }
    
    // 取消节点监听
    if (this.unsubscribeNode) {
      this.unsubscribeNode();
      this.unsubscribeNode = null;
    }
    
    this.active = false;
    console.log(`已停用数据绑定: ${this.nodeId}.${this.propertyKey}`);
  }

  /**
   * 从数据源更新节点
   * @param {Object} node - 节点实例
   * @param {any} data - 数据源数据
   */
  updateNodeFromDataSource(node, data) {
    if (this.updating) return;
    
    try {
      this.updating = true;
      
      // 从数据中提取值
      const value = this.extractValue(data, this.dataPath);
      
      // 应用转换
      const transformedValue = this.transform(value);
      
      // 检查值是否变化
      if (transformedValue === this.lastValue) {
        return;
      }
      
      this.lastValue = transformedValue;
      
      // 更新节点属性
      if (node && node.setProperty) {
        node.setProperty(this.propertyKey, transformedValue);
      } else if (node && node.properties) {
        node.properties[this.propertyKey] = transformedValue;
      }
      
      console.log(`已更新节点属性: ${this.nodeId}.${this.propertyKey} = ${transformedValue}`);
    } catch (error) {
      console.error('从数据源更新节点失败:', error);
    } finally {
      this.updating = false;
    }
  }

  /**
   * 从节点更新数据源（双向绑定）
   * @param {Object} dataSource - 数据源实例
   * @param {any} value - 节点属性值
   */
  updateDataSourceFromNode(dataSource, value) {
    if (this.updating) return;
    
    try {
      this.updating = true;
      
      // 应用反向转换
      const transformedValue = this.reverseTransform(value);
      
      // 检查值是否变化
      if (transformedValue === this.lastValue) {
        return;
      }
      
      this.lastValue = transformedValue;
      
      // 更新数据源
      // 注意：这里需要数据源支持部分更新
      // 简单实现：直接设置整个数据
      if (this.dataPath) {
        const newData = this.setValueByPath(dataSource.data, this.dataPath, transformedValue);
        dataSource.setData(newData);
      } else {
        dataSource.setData(transformedValue);
      }
      
      console.log(`已更新数据源: ${this.dataSourceId} = ${transformedValue}`);
    } catch (error) {
      console.error('从节点更新数据源失败:', error);
    } finally {
      this.updating = false;
    }
  }

  /**
   * 从数据中提取值
   * @param {any} data - 数据
   * @param {string} path - 路径（如 'user.name'）
   * @returns {any} 提取的值
   */
  extractValue(data, path) {
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
  }

  /**
   * 按路径设置值
   * @param {any} data - 数据
   * @param {string} path - 路径
   * @param {any} value - 值
   * @returns {any} 新数据
   */
  setValueByPath(data, path, value) {
    if (!path) return value;
    
    // 深拷贝数据
    const newData = JSON.parse(JSON.stringify(data || {}));
    
    const keys = path.split('.');
    let current = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    
    return newData;
  }

  /**
   * 监听节点属性变化
   * @param {Object} node - 节点实例
   * @param {string} propertyKey - 属性键
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消监听函数
   */
  watchNodeProperty(node, propertyKey, callback) {
    // 简单实现：使用 Proxy 或定时检查
    // 这里使用定时检查（不推荐，仅作演示）
    let lastValue = node.properties?.[propertyKey];
    
    const interval = setInterval(() => {
      const currentValue = node.properties?.[propertyKey];
      if (currentValue !== lastValue) {
        lastValue = currentValue;
        callback(currentValue);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }

  /**
   * 序列化绑定配置
   * @returns {Object} 序列化后的配置
   */
  serialize() {
    return {
      nodeId: this.nodeId,
      propertyKey: this.propertyKey,
      dataSourceId: this.dataSourceId,
      dataPath: this.dataPath,
      mode: this.mode,
      // 注意：函数无法序列化，需要特殊处理
      transform: this.transform.toString(),
      reverseTransform: this.reverseTransform.toString()
    };
  }

  /**
   * 从序列化数据恢复绑定
   * @param {Object} data - 序列化数据
   * @returns {DataBinding} 绑定实例
   */
  static deserialize(data) {
    // 恢复函数（简单实现，实际应该更安全）
    const config = { ...data };
    
    if (typeof data.transform === 'string') {
      try {
        // eslint-disable-next-line no-eval
        config.transform = eval(`(${data.transform})`);
      } catch (error) {
        console.error('恢复转换函数失败:', error);
        config.transform = value => value;
      }
    }
    
    if (typeof data.reverseTransform === 'string') {
      try {
        // eslint-disable-next-line no-eval
        config.reverseTransform = eval(`(${data.reverseTransform})`);
      } catch (error) {
        console.error('恢复反向转换函数失败:', error);
        config.reverseTransform = value => value;
      }
    }
    
    return new DataBinding(config);
  }
}

