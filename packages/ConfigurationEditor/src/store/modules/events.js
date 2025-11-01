/**
 * events.js - 事件状态管理
 * 
 * @description Pinia store for managing event system state
 * @author W3D Team
 * @date 2025-10-30
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import EventManager, { EventConfig } from '@/core/events/EventManager.js';
import ActionExecutor, { ActionConfig } from '@/core/events/ActionExecutor.js';
import ConditionEvaluator from '@/core/events/ConditionEvaluator.js';
import { EventType, ActionType, EventStatus } from '@/core/events/EventTypes.js';

export const useEventsStore = defineStore('events', () => {
  // ==================== State ====================
  
  // 事件管理器实例
  const eventManager = EventManager;
  const actionExecutor = new ActionExecutor();
  const conditionEvaluator = new ConditionEvaluator();
  
  // 当前选中的事件 ID
  const selectedEventId = ref(null);
  
  // 调试模式
  const debugMode = ref(false);
  
  // 事件执行日志
  const executionLog = ref([]);
  
  // 循环依赖警告
  const circularDependencies = ref([]);
  
  // ==================== Computed ====================
  
  /**
   * 所有事件
   */
  const allEvents = computed(() => {
    return eventManager.getAllEvents();
  });
  
  /**
   * 启用的事件
   */
  const enabledEvents = computed(() => {
    return allEvents.value.filter(e => e.status === EventStatus.ENABLED);
  });
  
  /**
   * 禁用的事件
   */
  const disabledEvents = computed(() => {
    return allEvents.value.filter(e => e.status === EventStatus.DISABLED);
  });
  
  /**
   * 当前选中的事件
   */
  const selectedEvent = computed(() => {
    if (!selectedEventId.value) {
      return null;
    }
    return eventManager.getEvent(selectedEventId.value);
  });
  
  /**
   * 事件统计信息
   */
  const statistics = computed(() => {
    return eventManager.getStatistics();
  });
  
  // ==================== Actions ====================
  
  /**
   * 初始化事件系统
   */
  function initialize(nodeManager, dataSourceManager) {
    // 设置依赖
    actionExecutor.setNodeManager(nodeManager);
    actionExecutor.setDataSourceManager(dataSourceManager);
    actionExecutor.setEventManager(eventManager);
    
    // 设置调试模式
    eventManager.setDebugMode(debugMode.value);
    
    console.log('[EventsStore] Event system initialized');
  }
  
  /**
   * 创建事件
   */
  function createEvent(eventConfig) {
    const eventId = eventManager.registerEvent(eventConfig);
    
    // 检查循环依赖
    checkCircularDependencies();
    
    return eventId;
  }
  
  /**
   * 更新事件
   */
  function updateEvent(eventId, updates) {
    const success = eventManager.updateEvent(eventId, updates);
    
    if (success) {
      // 检查循环依赖
      checkCircularDependencies();
    }
    
    return success;
  }
  
  /**
   * 删除事件
   */
  function deleteEvent(eventId) {
    const success = eventManager.unregisterEvent(eventId);
    
    if (success && selectedEventId.value === eventId) {
      selectedEventId.value = null;
    }
    
    // 检查循环依赖
    checkCircularDependencies();
    
    return success;
  }
  
  /**
   * 获取事件
   */
  function getEvent(eventId) {
    return eventManager.getEvent(eventId);
  }
  
  /**
   * 获取节点的所有事件
   */
  function getNodeEvents(nodeId) {
    return eventManager.getNodeEvents(nodeId);
  }
  
  /**
   * 选择事件
   */
  function selectEvent(eventId) {
    selectedEventId.value = eventId;
  }
  
  /**
   * 取消选择
   */
  function deselectEvent() {
    selectedEventId.value = null;
  }
  
  /**
   * 启用事件
   */
  function enableEvent(eventId) {
    return eventManager.setEventStatus(eventId, EventStatus.ENABLED);
  }
  
  /**
   * 禁用事件
   */
  function disableEvent(eventId) {
    return eventManager.setEventStatus(eventId, EventStatus.DISABLED);
  }
  
  /**
   * 触发事件
   */
  async function triggerEvent(eventId, context = {}) {
    // 设置条件评估器的上下文
    conditionEvaluator.setContext(context);
    
    // 获取事件配置
    const eventConfig = eventManager.getEvent(eventId);
    if (!eventConfig) {
      console.warn(`Event not found: ${eventId}`);
      return false;
    }
    
    // 评估条件
    if (eventConfig.condition) {
      const conditionMet = conditionEvaluator.evaluate(eventConfig.condition);
      if (!conditionMet) {
        console.log(`Event condition not met: ${eventConfig.name}`);
        return false;
      }
    }
    
    // 触发事件
    const success = await eventManager.triggerEvent(eventId, context);
    
    if (success && eventConfig.actions && eventConfig.actions.length > 0) {
      // 执行动作
      try {
        await actionExecutor.executeActions(eventConfig.actions, 'serial', context);
      } catch (error) {
        console.error(`Action execution failed for event: ${eventConfig.name}`, error);
      }
    }
    
    // 更新执行日志
    updateExecutionLog();
    
    return success;
  }
  
  /**
   * 检查循环依赖
   */
  function checkCircularDependencies() {
    const cycles = eventManager.getAllCircularDependencies();
    circularDependencies.value = cycles;
    
    if (cycles.length > 0) {
      console.warn('[EventsStore] Circular dependencies detected:', cycles);
    }
    
    return cycles;
  }
  
  /**
   * 设置调试模式
   */
  function setDebugMode(enabled) {
    debugMode.value = enabled;
    eventManager.setDebugMode(enabled);
  }
  
  /**
   * 更新执行日志
   */
  function updateExecutionLog() {
    executionLog.value = [
      ...eventManager.getExecutionLog(50),
      ...actionExecutor.getExecutionLog(50)
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 100);
  }
  
  /**
   * 清空执行日志
   */
  function clearExecutionLog() {
    eventManager.clearLog();
    actionExecutor.clearLog();
    executionLog.value = [];
  }
  
  /**
   * 清空所有事件
   */
  function clearAllEvents() {
    eventManager.clear();
    selectedEventId.value = null;
    circularDependencies.value = [];
    executionLog.value = [];
  }
  
  /**
   * 序列化事件配置
   */
  function serializeEvents() {
    return allEvents.value.map(event => event.serialize());
  }
  
  /**
   * 反序列化事件配置
   */
  function deserializeEvents(eventsData) {
    if (!Array.isArray(eventsData)) {
      return;
    }
    
    // 清空现有事件
    clearAllEvents();
    
    // 恢复事件
    eventsData.forEach(eventData => {
      const eventConfig = EventConfig.deserialize(eventData);
      eventManager.registerEvent(eventConfig);
    });
    
    // 检查循环依赖
    checkCircularDependencies();
    
    console.log(`[EventsStore] Deserialized ${eventsData.length} events`);
  }
  
  // ==================== Return ====================
  
  return {
    // State
    selectedEventId,
    debugMode,
    executionLog,
    circularDependencies,
    
    // Computed
    allEvents,
    enabledEvents,
    disabledEvents,
    selectedEvent,
    statistics,
    
    // Actions
    initialize,
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    getNodeEvents,
    selectEvent,
    deselectEvent,
    enableEvent,
    disableEvent,
    triggerEvent,
    checkCircularDependencies,
    setDebugMode,
    updateExecutionLog,
    clearExecutionLog,
    clearAllEvents,
    serializeEvents,
    deserializeEvents,
    
    // Instances (for advanced usage)
    eventManager,
    actionExecutor,
    conditionEvaluator
  };
});

