/**
 * ActionExecutor.js - 动作执行器
 *
 * @description 执行各种类型的动作
 * @features
 * - 属性变更动作
 * - 显示/隐藏动作
 * - 数据请求动作
 * - 动画动作
 * - 脚本执行动作
 * - 页面跳转动作
 * - 串行和并行执行
 * - 延迟和重复执行
 *
 * @author W3D Team
 * @date 2025-10-30
 */

import { ActionType, ActionExecutionMode } from './EventTypes.js';
import { gsap } from 'gsap';

/**
 * 动作配置类
 */
export class ActionConfig {
  constructor(options = {}) {
    this.id = options.id || this.generateId();
    this.type = options.type || ActionType.SET_PROPERTY;
    this.targetNodeId = options.targetNodeId || null;
    this.params = options.params || {};
    this.delay = options.delay || 0;
    this.repeat = options.repeat || 0;
    this.repeatDelay = options.repeatDelay || 0;
    this.enabled = options.enabled !== false;
  }

  generateId() {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      targetNodeId: this.targetNodeId,
      params: this.params,
      delay: this.delay,
      repeat: this.repeat,
      repeatDelay: this.repeatDelay,
      enabled: this.enabled
    };
  }

  static deserialize(data) {
    return new ActionConfig(data);
  }
}

/**
 * 动作执行器
 */
export class ActionExecutor {
  constructor() {
    this.nodeManager = null;
    this.dataSourceManager = null;
    this.eventManager = null;
    this.executionLog = [];
    this.maxLogSize = 100;
  }

  /**
   * 设置节点管理器
   */
  setNodeManager(nodeManager) {
    this.nodeManager = nodeManager;
  }

  /**
   * 设置数据源管理器
   */
  setDataSourceManager(dataSourceManager) {
    this.dataSourceManager = dataSourceManager;
  }

  /**
   * 设置事件管理器
   */
  setEventManager(eventManager) {
    this.eventManager = eventManager;
  }

  /**
   * 执行动作列表
   */
  async executeActions(actions, mode = ActionExecutionMode.SERIAL, context = {}) {
    if (!Array.isArray(actions) || actions.length === 0) {
      return [];
    }

    // 过滤启用的动作
    const enabledActions = actions.filter(action => {
      if (action instanceof ActionConfig) {
        return action.enabled;
      }
      return action.enabled !== false;
    });

    if (enabledActions.length === 0) {
      return [];
    }

    // 根据执行模式执行动作
    if (mode === ActionExecutionMode.PARALLEL) {
      return await this.executeParallel(enabledActions, context);
    } else {
      return await this.executeSerial(enabledActions, context);
    }
  }

  /**
   * 串行执行动作
   */
  async executeSerial(actions, context) {
    const results = [];

    for (const action of actions) {
      try {
        const result = await this.executeAction(action, context);
        results.push(result);
      } catch (error) {
        this.log('error', `Action execution failed: ${action.type}`, error);
        results.push({ success: false, error });
      }
    }

    return results;
  }

  /**
   * 并行执行动作
   */
  async executeParallel(actions, context) {
    const promises = actions.map(action =>
      this.executeAction(action, context).catch(error => {
        this.log('error', `Action execution failed: ${action.type}`, error);
        return { success: false, error };
      })
    );

    return await Promise.all(promises);
  }

  /**
   * 执行单个动作
   */
  async executeAction(action, context = {}) {
    if (!(action instanceof ActionConfig)) {
      action = new ActionConfig(action);
    }

    this.log('info', `Executing action: ${action.type} (${action.id})`);

    // 延迟执行
    if (action.delay > 0) {
      await this.delay(action.delay);
    }

    // 执行动作
    let result;
    try {
      result = await this._executeActionByType(action, context);

      // 重复执行
      if (action.repeat > 0) {
        for (let i = 0; i < action.repeat; i++) {
          if (action.repeatDelay > 0) {
            await this.delay(action.repeatDelay);
          }
          await this._executeActionByType(action, context);
        }
      }

      this.log('success', `Action executed: ${action.type} (${action.id})`);
      return { success: true, result };
    } catch (error) {
      this.log('error', `Action execution failed: ${action.type} (${action.id})`, error);
      throw error;
    }
  }

  /**
   * 根据类型执行动作
   */
  async _executeActionByType(action, context) {
    switch (action.type) {
      // 属性变更动作
      case ActionType.SET_PROPERTY:
        return await this.setProperty(action, context);

      case ActionType.UPDATE_STYLE:
        return await this.updateStyle(action, context);

      case ActionType.SET_POSITION:
        return await this.setPosition(action, context);

      case ActionType.SET_ROTATION:
        return await this.setRotation(action, context);

      case ActionType.SET_SCALE:
        return await this.setScale(action, context);

      // 显示控制动作
      case ActionType.SHOW:
        return await this.show(action, context);

      case ActionType.HIDE:
        return await this.hide(action, context);

      case ActionType.TOGGLE_VISIBILITY:
        return await this.toggleVisibility(action, context);

      // 数据请求动作
      case ActionType.REFRESH_DATA:
        return await this.refreshData(action, context);

      case ActionType.SEND_REQUEST:
        return await this.sendRequest(action, context);

      case ActionType.UPDATE_DATA_SOURCE:
        return await this.updateDataSource(action, context);

      // 动画动作
      case ActionType.ANIMATE_MOVE:
        return await this.animateMove(action, context);

      case ActionType.ANIMATE_SCALE:
        return await this.animateScale(action, context);

      case ActionType.ANIMATE_ROTATE:
        return await this.animateRotate(action, context);

      case ActionType.ANIMATE_FADE:
        return await this.animateFade(action, context);

      // 脚本执行动作
      case ActionType.EXECUTE_SCRIPT:
        return await this.executeScript(action, context);

      // 页面跳转动作
      case ActionType.NAVIGATE:
        return await this.navigate(action, context);

      case ActionType.OPEN_URL:
        return await this.openUrl(action, context);

      // 事件触发动作
      case ActionType.TRIGGER_EVENT:
        return await this.triggerEvent(action, context);

      // 日志动作
      case ActionType.LOG:
        return await this.logMessage(action, context);

      case ActionType.ALERT:
        return await this.alert(action, context);

      // 自定义动作
      case ActionType.CUSTOM:
        return await this.executeCustom(action, context);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * 获取目标节点
   */
  getTargetNode(action) {
    if (!this.nodeManager) {
      throw new Error('NodeManager not set');
    }

    const node = this.nodeManager.getNodeById(action.targetNodeId);
    if (!node) {
      throw new Error(`Node not found: ${action.targetNodeId}`);
    }

    return node;
  }

  /**
   * 延迟执行
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== 属性变更动作 ====================

  /**
   * 设置属性
   */
  async setProperty(action, context) {
    const node = this.getTargetNode(action);
    const { propertyKey, value } = action.params;

    if (!propertyKey) {
      throw new Error('Property key is required');
    }

    node.setProperty(propertyKey, value);
    return { propertyKey, value };
  }

  /**
   * 更新样式
   */
  async updateStyle(action, context) {
    const node = this.getTargetNode(action);
    const { styles } = action.params;

    if (!styles || typeof styles !== 'object') {
      throw new Error('Styles object is required');
    }

    Object.entries(styles).forEach(([key, value]) => {
      node.setProperty(key, value);
    });

    return { styles };
  }

  /**
   * 设置位置
   */
  async setPosition(action, context) {
    const node = this.getTargetNode(action);
    const { x, y, z } = action.params;

    if (x !== undefined) node.position.x = x;
    if (y !== undefined) node.position.y = y;
    if (z !== undefined) node.position.z = z;

    return { x, y, z };
  }

  /**
   * 设置旋转
   */
  async setRotation(action, context) {
    const node = this.getTargetNode(action);
    const { x, y, z } = action.params;

    if (x !== undefined) node.rotation.x = x * Math.PI / 180;
    if (y !== undefined) node.rotation.y = y * Math.PI / 180;
    if (z !== undefined) node.rotation.z = z * Math.PI / 180;

    return { x, y, z };
  }

  /**
   * 设置缩放
   */
  async setScale(action, context) {
    const node = this.getTargetNode(action);
    const { x, y, z } = action.params;

    if (x !== undefined) node.scale.x = x;
    if (y !== undefined) node.scale.y = y;
    if (z !== undefined) node.scale.z = z;

    return { x, y, z };
  }

  // ==================== 显示控制动作 ====================

  /**
   * 显示节点
   */
  async show(action, context) {
    const node = this.getTargetNode(action);
    node.visible = true;
    return { visible: true };
  }

  /**
   * 隐藏节点
   */
  async hide(action, context) {
    const node = this.getTargetNode(action);
    node.visible = false;
    return { visible: false };
  }

  /**
   * 切换可见性
   */
  async toggleVisibility(action, context) {
    const node = this.getTargetNode(action);
    node.visible = !node.visible;
    return { visible: node.visible };
  }

  // ==================== 数据请求动作 ====================

  /**
   * 刷新数据
   */
  async refreshData(action, context) {
    if (!this.dataSourceManager) {
      throw new Error('DataSourceManager not set');
    }

    const { dataSourceId } = action.params;
    if (!dataSourceId) {
      throw new Error('Data source ID is required');
    }

    const dataSource = this.dataSourceManager.getDataSource(dataSourceId);
    if (!dataSource) {
      throw new Error(`Data source not found: ${dataSourceId}`);
    }

    await dataSource.refresh();
    return { dataSourceId, refreshed: true };
  }

  /**
   * 发送请求
   */
  async sendRequest(action, context) {
    const { url, method = 'GET', headers = {}, body } = action.params;

    if (!url) {
      throw new Error('URL is required');
    }

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    return { url, method, data };
  }

  /**
   * 更新数据源
   */
  async updateDataSource(action, context) {
    if (!this.dataSourceManager) {
      throw new Error('DataSourceManager not set');
    }

    const { dataSourceId, data } = action.params;
    if (!dataSourceId) {
      throw new Error('Data source ID is required');
    }

    const dataSource = this.dataSourceManager.getDataSource(dataSourceId);
    if (!dataSource) {
      throw new Error(`Data source not found: ${dataSourceId}`);
    }

    dataSource.setData(data);
    return { dataSourceId, updated: true };
  }

  // ==================== 动画动作 ====================

  /**
   * 移动动画
   */
  async animateMove(action, context) {
    const node = this.getTargetNode(action);
    const { x, y, z, duration = 1, ease = 'power2.out' } = action.params;

    const target = {};
    if (x !== undefined) target.x = x;
    if (y !== undefined) target.y = y;
    if (z !== undefined) target.z = z;

    return new Promise((resolve) => {
      gsap.to(node.position, {
        ...target,
        duration,
        ease,
        onComplete: () => resolve({ x, y, z })
      });
    });
  }

  /**
   * 缩放动画
   */
  async animateScale(action, context) {
    const node = this.getTargetNode(action);
    const { x, y, z, duration = 1, ease = 'power2.out' } = action.params;

    const target = {};
    if (x !== undefined) target.x = x;
    if (y !== undefined) target.y = y;
    if (z !== undefined) target.z = z;

    return new Promise((resolve) => {
      gsap.to(node.scale, {
        ...target,
        duration,
        ease,
        onComplete: () => resolve({ x, y, z })
      });
    });
  }

  /**
   * 旋转动画
   */
  async animateRotate(action, context) {
    const node = this.getTargetNode(action);
    const { x, y, z, duration = 1, ease = 'power2.out' } = action.params;

    const target = {};
    if (x !== undefined) target.x = x * Math.PI / 180;
    if (y !== undefined) target.y = y * Math.PI / 180;
    if (z !== undefined) target.z = z * Math.PI / 180;

    return new Promise((resolve) => {
      gsap.to(node.rotation, {
        ...target,
        duration,
        ease,
        onComplete: () => resolve({ x, y, z })
      });
    });
  }

  /**
   * 淡入淡出动画
   */
  async animateFade(action, context) {
    const node = this.getTargetNode(action);
    const { opacity, duration = 1, ease = 'power2.out' } = action.params;

    if (opacity === undefined) {
      throw new Error('Opacity is required');
    }

    return new Promise((resolve) => {
      gsap.to(node.material, {
        opacity,
        duration,
        ease,
        onComplete: () => resolve({ opacity })
      });
    });
  }

  // ==================== 脚本执行动作 ====================

  /**
   * 执行脚本
   */
  async executeScript(action, context) {
    const { script } = action.params;

    if (!script) {
      throw new Error('Script is required');
    }

    try {
      // 创建沙箱环境
      const sandbox = {
        node: this.getTargetNode(action),
        context,
        console: {
          log: (...args) => this.log('info', 'Script log:', args),
          warn: (...args) => this.log('warn', 'Script warn:', args),
          error: (...args) => this.log('error', 'Script error:', args)
        }
      };

      // 执行脚本
      const func = new Function('sandbox', `
        with (sandbox) {
          ${script}
        }
      `);

      const result = func(sandbox);
      return { result };
    } catch (error) {
      this.log('error', 'Script execution error:', error);
      throw error;
    }
  }

  // ==================== 页面跳转动作 ====================

  /**
   * 页面跳转
   */
  async navigate(action, context) {
    const { path } = action.params;

    if (!path) {
      throw new Error('Path is required');
    }

    // 使用 Vue Router 进行导航
    if (window.$router) {
      window.$router.push(path);
    } else {
      window.location.href = path;
    }

    return { path };
  }

  /**
   * 打开 URL
   */
  async openUrl(action, context) {
    const { url, target = '_blank' } = action.params;

    if (!url) {
      throw new Error('URL is required');
    }

    window.open(url, target);
    return { url, target };
  }

  // ==================== 事件触发动作 ====================

  /**
   * 触发事件
   */
  async triggerEvent(action, context) {
    if (!this.eventManager) {
      throw new Error('EventManager not set');
    }

    const { targetEventId } = action.params;
    if (!targetEventId) {
      throw new Error('Target event ID is required');
    }

    await this.eventManager.triggerEvent(targetEventId, context);
    return { targetEventId, triggered: true };
  }

  // ==================== 日志动作 ====================

  /**
   * 输出日志
   */
  async logMessage(action, context) {
    const { message, level = 'info' } = action.params;

    if (!message) {
      throw new Error('Message is required');
    }

    this.log(level, message, context);
    return { message, level };
  }

  /**
   * 弹出警告
   */
  async alert(action, context) {
    const { message } = action.params;

    if (!message) {
      throw new Error('Message is required');
    }

    window.alert(message);
    return { message };
  }

  // ==================== 自定义动作 ====================

  /**
   * 执行自定义动作
   */
  async executeCustom(action, context) {
    const { handler } = action.params;

    if (typeof handler !== 'function') {
      throw new Error('Custom action handler must be a function');
    }

    const result = await handler(action, context);
    return { result };
  }

  // ==================== 工具方法 ====================

  /**
   * 记录日志
   */
  log(level, message, data = null) {
    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    this.executionLog.push(logEntry);

    // 限制日志大小
    if (this.executionLog.length > this.maxLogSize) {
      this.executionLog.shift();
    }

    // 输出到控制台
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[ActionExecutor] ${message}`, data || '');
  }

  /**
   * 获取执行日志
   */
  getExecutionLog(limit = 50) {
    return this.executionLog.slice(-limit);
  }

  /**
   * 清空执行日志
   */
  clearLog() {
    this.executionLog = [];
  }
}

export default ActionExecutor;

