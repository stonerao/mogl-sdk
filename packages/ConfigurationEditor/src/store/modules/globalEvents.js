/**
 * globalEvents.js - 全局事件 Store
 *
 * @description 管理全局事件的状态和操作
 * @features
 * - 全局事件的增删改查
 * - 事件引用关系管理
 * - 事件搜索和筛选
 * - 事件导入/导出
 *
 * @author ConfigurationEditor Team
 * @date 2025-10-31
 */

import { defineStore } from 'pinia';
import { EventType } from '@/core/events/EventTypes.js';

/**
 * 全局事件 Store
 */
export const useGlobalEventsStore = defineStore('globalEvents', {
  state: () => ({
    // 全局事件列表 (Map: eventId -> globalEvent)
    events: new Map(),

    // 事件引用关系 (Map: eventId -> Set<nodeId>)
    references: new Map(),

    // 搜索关键词
    searchQuery: '',

    // 筛选条件
    filterType: null, // 事件类型筛选

    // 选中的事件 ID
    selectedEventId: null
  }),

  getters: {
    /**
     * 获取所有全局事件（数组形式）
     */
    allEvents: (state) => {
      return Array.from(state.events.values());
    },

    /**
     * 获取筛选后的事件列表
     */
    filteredEvents: (state) => {
      let events = Array.from(state.events.values());

      // 按搜索关键词筛选
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        events = events.filter(event =>
          event.name.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query)
        );
      }

      // 按事件类型筛选
      if (state.filterType) {
        events = events.filter(event => event.eventType === state.filterType);
      }

      return events;
    },

    /**
     * 获取选中的事件
     */
    selectedEvent: (state) => {
      return state.selectedEventId ? state.events.get(state.selectedEventId) : null;
    },

    /**
     * 获取事件总数
     */
    eventCount: (state) => {
      return state.events.size;
    },

    /**
     * 获取事件的引用节点列表
     */
    getEventReferences: (state) => {
      return (eventId) => {
        const refs = state.references.get(eventId);
        return refs ? Array.from(refs) : [];
      };
    },

    /**
     * 获取事件的引用数量
     */
    getEventReferenceCount: (state) => {
      return (eventId) => {
        const refs = state.references.get(eventId);
        return refs ? refs.size : 0;
      };
    },

    /**
     * 检查事件是否被引用
     */
    isEventReferenced: (state) => {
      return (eventId) => {
        const refs = state.references.get(eventId);
        return refs && refs.size > 0;
      };
    }
  },

  actions: {
    /**
     * 添加全局事件
     */
    addEvent(event) {
      // 生成 ID（如果没有）
      if (!event.id) {
        event.id = this.generateEventId();
      }

      // 添加时间戳
      const now = new Date().toISOString();
      event.createdAt = event.createdAt || now;
      event.updatedAt = now;

      // 添加到 Map
      this.events.set(event.id, event);

      // 初始化引用关系
      if (!this.references.has(event.id)) {
        this.references.set(event.id, new Set());
      }

      console.log('[GlobalEvents] 添加全局事件:', event.name, event.id);
      return event.id;
    },

    /**
     * 更新全局事件
     */
    updateEvent(eventId, updates) {
      const event = this.events.get(eventId);
      if (!event) {
        console.warn('[GlobalEvents] 事件不存在:', eventId);
        return false;
      }

      // 更新事件
      Object.assign(event, updates);
      event.updatedAt = new Date().toISOString();

      console.log('[GlobalEvents] 更新全局事件:', event.name, eventId);
      return true;
    },

    /**
     * 删除全局事件
     */
    deleteEvent(eventId) {
      const event = this.events.get(eventId);
      if (!event) {
        console.warn('[GlobalEvents] 事件不存在:', eventId);
        return false;
      }

      // 检查是否被引用
      if (this.isEventReferenced(eventId)) {
        const refCount = this.getEventReferenceCount(eventId);
        console.warn('[GlobalEvents] 事件被引用，无法删除:', event.name, `(${refCount} 个节点)`);
        return false;
      }

      // 删除事件
      this.events.delete(eventId);
      this.references.delete(eventId);

      // 如果是选中的事件，清除选中状态
      if (this.selectedEventId === eventId) {
        this.selectedEventId = null;
      }

      console.log('[GlobalEvents] 删除全局事件:', event.name, eventId);
      return true;
    },

    /**
     * 复制全局事件
     */
    duplicateEvent(eventId) {
      const event = this.events.get(eventId);
      if (!event) {
        console.warn('[GlobalEvents] 事件不存在:', eventId);
        return null;
      }

      // 创建副本
      const newEvent = {
        ...event,
        id: this.generateEventId(),
        name: `${event.name} (副本)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 添加副本
      this.addEvent(newEvent);

      console.log('[GlobalEvents] 复制全局事件:', newEvent.name, newEvent.id);
      return newEvent.id;
    },

    /**
     * 添加事件引用
     */
    addReference(eventId, nodeId) {
      if (!this.events.has(eventId)) {
        console.warn('[GlobalEvents] 事件不存在:', eventId);
        return false;
      }

      if (!this.references.has(eventId)) {
        this.references.set(eventId, new Set());
      }

      this.references.get(eventId).add(nodeId);
      console.log('[GlobalEvents] 添加引用:', eventId, '->', nodeId);
      return true;
    },

    /**
     * 移除事件引用
     */
    removeReference(eventId, nodeId) {
      const refs = this.references.get(eventId);
      if (!refs) {
        return false;
      }

      refs.delete(nodeId);
      console.log('[GlobalEvents] 移除引用:', eventId, '->', nodeId);
      return true;
    },

    /**
     * 移除节点的所有引用
     */
    removeNodeReferences(nodeId) {
      let count = 0;
      for (const [eventId, refs] of this.references.entries()) {
        if (refs.has(nodeId)) {
          refs.delete(nodeId);
          count++;
        }
      }
      if (count > 0) {
        console.log('[GlobalEvents] 移除节点的所有引用:', nodeId, `(${count} 个)`);
      }
      return count;
    },

    /**
     * 设置搜索关键词
     */
    setSearchQuery(query) {
      this.searchQuery = query;
    },

    /**
     * 设置筛选类型
     */
    setFilterType(type) {
      this.filterType = type;
    },

    /**
     * 选中事件
     */
    selectEvent(eventId) {
      this.selectedEventId = eventId;
    },

    /**
     * 清除选中
     */
    clearSelection() {
      this.selectedEventId = null;
    },

    /**
     * 清空所有事件
     */
    clearAll() {
      this.events.clear();
      this.references.clear();
      this.selectedEventId = null;
      console.log('[GlobalEvents] 清空所有事件');
    },

    /**
     * 生成事件 ID
     */
    generateEventId() {
      return `global-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * 序列化全局事件
     */
    serialize() {
      return {
        events: Array.from(this.events.values()),
        references: Array.from(this.references.entries()).map(([eventId, nodeIds]) => ({
          eventId,
          nodeIds: Array.from(nodeIds)
        }))
      };
    },

    /**
     * 反序列化全局事件
     */
    deserialize(data) {
      if (!data) return;

      // 清空现有数据
      this.clearAll();

      // 恢复事件
      if (data.events && Array.isArray(data.events)) {
        data.events.forEach(event => {
          this.events.set(event.id, event);
        });
      }

      // 恢复引用关系
      if (data.references && Array.isArray(data.references)) {
        data.references.forEach(({ eventId, nodeIds }) => {
          this.references.set(eventId, new Set(nodeIds));
        });
      }

      console.log('[GlobalEvents] 反序列化完成:', this.events.size, '个事件');
    }
  }
});

