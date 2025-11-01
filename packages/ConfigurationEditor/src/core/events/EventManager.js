/**
 * EventManager.js - 事件管理器
 *
 * @description 管理所有事件的注册、监听、触发和分发
 * @features
 * - 事件注册和注销
 * - 事件监听和触发
 * - 事件优先级和传播控制
 * - 事件队列和异步执行
 * - 循环依赖检测
 * - 调试模式
 *
 * @author W3D Team
 * @date 2025-10-30
 */

import { EventType, EventPriority, EventPropagation, EventStatus } from './EventTypes.js';

/**
 * 事件配置类
 */
export class EventConfig {
  constructor(options = {}) {
    this.id = options.id || this.generateId();
    this.name = options.name || 'Untitled Event';
    this.nodeId = options.nodeId || null;           // 关联的节点 ID
    this.eventType = options.eventType || EventType.CLICK;
    this.priority = options.priority || EventPriority.NORMAL;
    this.propagation = options.propagation || EventPropagation.BUBBLE;
    this.status = options.status || EventStatus.ENABLED;
    this.condition = options.condition || null;     // 触发条件
    this.actions = options.actions || [];           // 动作列表
    this.delay = options.delay || 0;                // 延迟执行（毫秒）
    this.debounce = options.debounce || 0;          // 防抖时间（毫秒）
    this.throttle = options.throttle || 0;          // 节流时间（毫秒）
    this.once = options.once || false;              // 是否只触发一次
    this.metadata = options.metadata || {};         // 元数据

    // 内部状态
    this._lastTriggerTime = 0;
    this._debounceTimer = null;
    this._throttleTimer = null;
    this._triggerCount = 0;
  }

  generateId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 序列化事件配置
   */
  serialize() {
    return {
      id: this.id,
      name: this.name,
      nodeId: this.nodeId,
      eventType: this.eventType,
      priority: this.priority,
      propagation: this.propagation,
      status: this.status,
      condition: this.condition,
      actions: this.actions,
      delay: this.delay,
      debounce: this.debounce,
      throttle: this.throttle,
      once: this.once,
      metadata: this.metadata
    };
  }

  /**
   * 从序列化数据恢复
   */
  static deserialize(data) {
    return new EventConfig(data);
  }
}

/**
 * 事件管理器（单例）
 */
export class EventManager {
  constructor() {
    if (EventManager.instance) {
      return EventManager.instance;
    }

    this.events = new Map();              // 事件配置映射 (eventId -> EventConfig)
    this.listeners = new Map();           // 事件监听器映射 (eventType -> Set<listener>)
    this.nodeEvents = new Map();          // 节点事件映射 (nodeId -> Set<eventId>)
    this.eventQueue = [];                 // 事件队列
    this.isProcessing = false;            // 是否正在处理事件
    this.debugMode = false;               // 调试模式
    this.executionLog = [];               // 执行日志
    this.maxLogSize = 100;                // 最大日志数量
    this.dependencyGraph = new Map();     // 事件依赖图

    EventManager.instance = this;
  }

  /**
   * 获取单例实例
   */
  static getInstance() {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  /**
   * 注册事件
   */
  registerEvent(eventConfig) {
    if (!(eventConfig instanceof EventConfig)) {
      eventConfig = new EventConfig(eventConfig);
    }

    this.events.set(eventConfig.id, eventConfig);

    // 建立节点事件映射
    if (eventConfig.nodeId) {
      if (!this.nodeEvents.has(eventConfig.nodeId)) {
        this.nodeEvents.set(eventConfig.nodeId, new Set());
      }
      this.nodeEvents.get(eventConfig.nodeId).add(eventConfig.id);
    }

    // 更新依赖图
    this.updateDependencyGraph(eventConfig);

    this.log('info', `Event registered: ${eventConfig.name} (${eventConfig.id})`);

    return eventConfig.id;
  }

  /**
   * 注销事件
   */
  unregisterEvent(eventId) {
    const eventConfig = this.events.get(eventId);
    if (!eventConfig) {
      this.log('warn', `Event not found: ${eventId}`);
      return false;
    }

    // 移除节点事件映射
    if (eventConfig.nodeId) {
      const nodeEvents = this.nodeEvents.get(eventConfig.nodeId);
      if (nodeEvents) {
        nodeEvents.delete(eventId);
        if (nodeEvents.size === 0) {
          this.nodeEvents.delete(eventConfig.nodeId);
        }
      }
    }

    // 移除依赖图
    this.dependencyGraph.delete(eventId);

    // 移除事件配置
    this.events.delete(eventId);

    this.log('info', `Event unregistered: ${eventConfig.name} (${eventId})`);

    return true;
  }

  /**
   * 获取事件配置
   */
  getEvent(eventId) {
    return this.events.get(eventId);
  }

  /**
   * 获取节点的所有事件
   */
  getNodeEvents(nodeId) {
    const eventIds = this.nodeEvents.get(nodeId);
    if (!eventIds) {
      return [];
    }
    return Array.from(eventIds).map(id => this.events.get(id)).filter(Boolean);
  }

  /**
   * 获取所有事件
   */
  getAllEvents() {
    return Array.from(this.events.values());
  }

  /**
   * 更新事件配置
   */
  updateEvent(eventId, updates) {
    const eventConfig = this.events.get(eventId);
    if (!eventConfig) {
      this.log('warn', `Event not found: ${eventId}`);
      return false;
    }

    Object.assign(eventConfig, updates);
    this.updateDependencyGraph(eventConfig);

    this.log('info', `Event updated: ${eventConfig.name} (${eventId})`);

    return true;
  }

  /**
   * 启用/禁用事件
   */
  setEventStatus(eventId, status) {
    return this.updateEvent(eventId, { status });
  }

  /**
   * 触发事件
   */
  async triggerEvent(eventId, context = {}) {
    const eventConfig = this.events.get(eventId);
    if (!eventConfig) {
      this.log('warn', `Event not found: ${eventId}`);
      return false;
    }

    // 检查事件状态
    if (eventConfig.status !== EventStatus.ENABLED) {
      this.log('debug', `Event disabled: ${eventConfig.name} (${eventId})`);
      return false;
    }

    // 检查是否只触发一次
    if (eventConfig.once && eventConfig._triggerCount > 0) {
      this.log('debug', `Event already triggered once: ${eventConfig.name} (${eventId})`);
      return false;
    }

    // 防抖处理
    if (eventConfig.debounce > 0) {
      if (eventConfig._debounceTimer) {
        clearTimeout(eventConfig._debounceTimer);
      }
      eventConfig._debounceTimer = setTimeout(() => {
        this._executeEvent(eventConfig, context);
      }, eventConfig.debounce);
      return true;
    }

    // 节流处理
    if (eventConfig.throttle > 0) {
      const now = Date.now();
      if (now - eventConfig._lastTriggerTime < eventConfig.throttle) {
        this.log('debug', `Event throttled: ${eventConfig.name} (${eventId})`);
        return false;
      }
      eventConfig._lastTriggerTime = now;
    }

    // 延迟执行
    if (eventConfig.delay > 0) {
      setTimeout(() => {
        this._executeEvent(eventConfig, context);
      }, eventConfig.delay);
      return true;
    }

    // 立即执行
    return await this._executeEvent(eventConfig, context);
  }

  /**
   * 执行事件（内部方法）
   */
  async _executeEvent(eventConfig, context) {
    const startTime = Date.now();

    this.log('info', `Executing event: ${eventConfig.name} (${eventConfig.id})`);

    try {
      // 增加触发计数
      eventConfig._triggerCount++;

      // 添加到事件队列
      this.eventQueue.push({
        eventConfig,
        context,
        timestamp: startTime
      });

      // 处理事件队列
      if (!this.isProcessing) {
        await this.processEventQueue();
      }

      return true;
    } catch (error) {
      this.log('error', `Event execution failed: ${eventConfig.name} (${eventConfig.id})`, error);
      return false;
    }
  }

  /**
   * 处理事件队列
   */
  async processEventQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const { eventConfig, context } = this.eventQueue.shift();

      try {
        // 触发事件监听器
        await this.notifyListeners(eventConfig.eventType, {
          eventConfig,
          context
        });

        this.log('success', `Event executed: ${eventConfig.name} (${eventConfig.id})`);
      } catch (error) {
        this.log('error', `Event processing failed: ${eventConfig.name} (${eventConfig.id})`, error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * 添加事件监听器
   */
  addEventListener(eventType, listener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(listener);

    this.log('debug', `Listener added for event type: ${eventType}`);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(eventType, listener) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
      this.log('debug', `Listener removed for event type: ${eventType}`);
    }
  }

  /**
   * 通知监听器
   */
  async notifyListeners(eventType, data) {
    const listeners = this.listeners.get(eventType);
    if (!listeners || listeners.size === 0) {
      return;
    }

    const promises = Array.from(listeners).map(listener => {
      try {
        return Promise.resolve(listener(data));
      } catch (error) {
        this.log('error', `Listener execution failed for event type: ${eventType}`, error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }

  /**
   * 更新依赖图
   */
  updateDependencyGraph(eventConfig) {
    const dependencies = new Set();

    // 检查动作中是否有触发其他事件的动作
    if (eventConfig.actions) {
      eventConfig.actions.forEach(action => {
        if (action.type === 'triggerEvent' && action.targetEventId) {
          dependencies.add(action.targetEventId);
        }
      });
    }

    this.dependencyGraph.set(eventConfig.id, dependencies);
  }

  /**
   * 检测循环依赖
   */
  detectCircularDependency(eventId, visited = new Set(), path = []) {
    if (visited.has(eventId)) {
      // 找到循环依赖
      const cycleStart = path.indexOf(eventId);
      const cycle = path.slice(cycleStart).concat(eventId);
      return cycle;
    }

    visited.add(eventId);
    path.push(eventId);

    const dependencies = this.dependencyGraph.get(eventId);
    if (dependencies) {
      for (const depId of dependencies) {
        const cycle = this.detectCircularDependency(depId, new Set(visited), [...path]);
        if (cycle) {
          return cycle;
        }
      }
    }

    return null;
  }

  /**
   * 获取所有循环依赖
   */
  getAllCircularDependencies() {
    const cycles = [];
    const checked = new Set();

    for (const eventId of this.events.keys()) {
      if (!checked.has(eventId)) {
        const cycle = this.detectCircularDependency(eventId);
        if (cycle) {
          cycles.push(cycle);
          cycle.forEach(id => checked.add(id));
        }
      }
    }

    return cycles;
  }

  /**
   * 清空所有事件
   */
  clear() {
    this.events.clear();
    this.listeners.clear();
    this.nodeEvents.clear();
    this.eventQueue = [];
    this.dependencyGraph.clear();
    this.executionLog = [];

    this.log('info', 'All events cleared');
  }

  /**
   * 启用/禁用调试模式
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    this.log('info', `Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

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

    // 调试模式下输出到控制台
    if (this.debugMode) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[EventManager] ${message}`, data || '');
    }
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

  /**
   * 获取统计信息
   */
  getStatistics() {
    return {
      totalEvents: this.events.size,
      enabledEvents: Array.from(this.events.values()).filter(e => e.status === EventStatus.ENABLED).length,
      disabledEvents: Array.from(this.events.values()).filter(e => e.status === EventStatus.DISABLED).length,
      totalListeners: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0),
      queueSize: this.eventQueue.length,
      circularDependencies: this.getAllCircularDependencies().length
    };
  }
}

// 导出单例实例
export default EventManager.getInstance();

