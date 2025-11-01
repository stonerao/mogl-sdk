/**
 * 全局事件系统使用示例
 * 
 * 本示例展示如何使用全局事件系统：
 * 1. 创建和管理全局事件
 * 2. 在节点中引用全局事件
 * 3. 使用节点生命周期事件
 * 4. 序列化和反序列化全局事件
 */

import { useGlobalEventsStore } from '@/store/modules/globalEvents.js';
import { useEventsStore } from '@/store/modules/events.js';
import { NodeFactory } from '@/core/nodes/NodeFactory.js';

// ========== 示例 1: 创建全局事件 ==========

console.log('========== 示例 1: 创建全局事件 ==========');

const globalEventsStore = useGlobalEventsStore();

// 创建设备告警处理事件
const alarmEventId = globalEventsStore.addEvent({
  name: '设备告警处理',
  description: '当设备状态变为告警时，改变节点颜色为红色',
  eventType: 'state-changed',
  conditions: [
    { field: 'state', operator: '==', value: 'alarm' }
  ],
  actions: [
    { type: 'setProperty', target: 'color', value: '#ff0000' },
    { type: 'setProperty', target: 'opacity', value: '1' }
  ]
});

console.log('创建全局事件:', alarmEventId);

// 创建设备正常处理事件
const normalEventId = globalEventsStore.addEvent({
  name: '设备正常处理',
  description: '当设备状态变为正常时，改变节点颜色为绿色',
  eventType: 'state-changed',
  conditions: [
    { field: 'state', operator: '==', value: 'normal' }
  ],
  actions: [
    { type: 'setProperty', target: 'color', value: '#00ff00' },
    { type: 'setProperty', target: 'opacity', value: '0.8' }
  ]
});

console.log('创建全局事件:', normalEventId);

// 创建数据刷新事件
const refreshEventId = globalEventsStore.addEvent({
  name: '数据刷新',
  description: '每5秒刷新一次数据',
  eventType: 'custom',
  conditions: [],
  actions: [
    { type: 'script', target: '', value: 'console.log("刷新数据")' }
  ]
});

console.log('创建全局事件:', refreshEventId);

// 查看所有全局事件
console.log('所有全局事件:', globalEventsStore.allEvents);

// ========== 示例 2: 在节点中引用全局事件 ==========

console.log('\n========== 示例 2: 在节点中引用全局事件 ==========');

const eventsStore = useEventsStore();

// 假设我们有一个网元节点
const nodeId = 'network-element-001';

// 为节点引用告警处理事件
eventsStore.createEvent({
  name: '[全局] 设备告警处理',
  eventType: 'state-changed',
  eventSource: 'global',
  globalEventId: alarmEventId,
  nodeId: nodeId,
  status: 'enabled'
});

// 添加引用关系
globalEventsStore.addReference(alarmEventId, nodeId);

console.log('节点引用全局事件:', alarmEventId);

// 为节点引用正常处理事件
eventsStore.createEvent({
  name: '[全局] 设备正常处理',
  eventType: 'state-changed',
  eventSource: 'global',
  globalEventId: normalEventId,
  nodeId: nodeId,
  status: 'enabled'
});

globalEventsStore.addReference(normalEventId, nodeId);

console.log('节点引用全局事件:', normalEventId);

// 查看事件引用情况
console.log('告警事件引用数:', globalEventsStore.getEventReferenceCount(alarmEventId));
console.log('告警事件引用节点:', globalEventsStore.getEventReferences(alarmEventId));

// ========== 示例 3: 修改全局事件 ==========

console.log('\n========== 示例 3: 修改全局事件 ==========');

// 修改告警处理事件，添加闪烁效果
globalEventsStore.updateEvent(alarmEventId, {
  description: '当设备状态变为告警时，改变节点颜色为红色并闪烁',
  actions: [
    { type: 'setProperty', target: 'color', value: '#ff0000' },
    { type: 'setProperty', target: 'opacity', value: '1' },
    { type: 'script', target: '', value: 'node.startBlinking()' }
  ]
});

console.log('修改全局事件:', alarmEventId);
console.log('修改后的事件:', globalEventsStore.events.get(alarmEventId));

// ========== 示例 4: 复制全局事件 ==========

console.log('\n========== 示例 4: 复制全局事件 ==========');

const copiedEventId = globalEventsStore.duplicateEvent(alarmEventId);

console.log('复制全局事件:', copiedEventId);
console.log('复制后的事件:', globalEventsStore.events.get(copiedEventId));

// ========== 示例 5: 删除全局事件 ==========

console.log('\n========== 示例 5: 删除全局事件 ==========');

// 尝试删除被引用的事件（会失败）
const refCount = globalEventsStore.getEventReferenceCount(alarmEventId);
if (refCount > 0) {
  console.log(`无法删除事件 ${alarmEventId}，因为它被 ${refCount} 个节点引用`);
}

// 删除未被引用的事件（成功）
globalEventsStore.deleteEvent(copiedEventId);
console.log('删除全局事件:', copiedEventId);

// ========== 示例 6: 使用节点生命周期事件 ==========

console.log('\n========== 示例 6: 使用节点生命周期事件 ==========');

// 创建自定义节点类
class CustomNetworkNode extends BaseNode {
  constructor(options) {
    super(options);
    
    // 监听生命周期事件
    this.on('loaded', this.handleLoaded.bind(this));
    this.on('destroyed', this.handleDestroyed.bind(this));
    this.on('shown', this.handleShown.bind(this));
    this.on('hidden', this.handleHidden.bind(this));
    this.on('state-changed', this.handleStateChanged.bind(this));
  }
  
  handleLoaded(event) {
    console.log('[生命周期] 节点加载完成:', this.nodeName);
    // 初始化数据
    this.initializeData();
    // 启动定时器
    this.startDataRefresh();
  }
  
  handleDestroyed(event) {
    console.log('[生命周期] 节点即将销毁:', this.nodeName);
    // 停止定时器
    this.stopDataRefresh();
    // 清理资源
    this.cleanup();
  }
  
  handleShown(event) {
    console.log('[生命周期] 节点显示:', this.nodeName);
    // 恢复动画
    this.resumeAnimation();
    // 恢复数据更新
    this.startDataRefresh();
  }
  
  handleHidden(event) {
    console.log('[生命周期] 节点隐藏:', this.nodeName);
    // 暂停动画
    this.pauseAnimation();
    // 暂停数据更新
    this.stopDataRefresh();
  }
  
  handleStateChanged(event) {
    console.log('[生命周期] 节点状态变化:', {
      oldState: event.oldStateId,
      newState: event.newStateId
    });
    // 根据状态更新显示
    this.updateDisplay();
  }
  
  // 辅助方法
  initializeData() {
    console.log('  - 初始化数据');
  }
  
  startDataRefresh() {
    console.log('  - 启动数据刷新');
    this.refreshTimer = setInterval(() => {
      console.log('  - 刷新数据');
    }, 5000);
  }
  
  stopDataRefresh() {
    console.log('  - 停止数据刷新');
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
  
  resumeAnimation() {
    console.log('  - 恢复动画');
  }
  
  pauseAnimation() {
    console.log('  - 暂停动画');
  }
  
  updateDisplay() {
    console.log('  - 更新显示');
  }
  
  cleanup() {
    console.log('  - 清理资源');
  }
}

// 创建节点实例
const customNode = new CustomNetworkNode({
  name: '自定义网元节点',
  nodeType: 'network-element'
});

// 触发生命周期事件
console.log('\n触发 onLoad:');
customNode.onLoad();

console.log('\n触发 onHide:');
customNode.setVisible(false);

console.log('\n触发 onShow:');
customNode.setVisible(true);

console.log('\n触发 onDestroy:');
customNode.onDestroy();

// ========== 示例 7: 序列化和反序列化 ==========

console.log('\n========== 示例 7: 序列化和反序列化 ==========');

// 序列化全局事件
const serialized = globalEventsStore.serialize();
console.log('序列化数据:', JSON.stringify(serialized, null, 2));

// 清空全局事件
globalEventsStore.clearAll();
console.log('清空后的事件数量:', globalEventsStore.eventCount);

// 反序列化
globalEventsStore.deserialize(serialized);
console.log('反序列化后的事件数量:', globalEventsStore.eventCount);
console.log('反序列化后的事件:', globalEventsStore.allEvents);

// ========== 示例 8: 搜索和筛选 ==========

console.log('\n========== 示例 8: 搜索和筛选 ==========');

// 搜索包含"告警"的事件
globalEventsStore.setSearchQuery('告警');
console.log('搜索"告警"的结果:', globalEventsStore.filteredEvents);

// 清除搜索
globalEventsStore.setSearchQuery('');

// 筛选状态变化事件
globalEventsStore.setFilterType('state-changed');
console.log('筛选"state-changed"的结果:', globalEventsStore.filteredEvents);

// 清除筛选
globalEventsStore.setFilterType(null);

// ========== 示例 9: 批量操作 ==========

console.log('\n========== 示例 9: 批量操作 ==========');

// 为多个节点引用同一个全局事件
const nodeIds = ['node-001', 'node-002', 'node-003'];

nodeIds.forEach(nodeId => {
  // 创建本地事件引用
  eventsStore.createEvent({
    name: '[全局] 设备告警处理',
    eventType: 'state-changed',
    eventSource: 'global',
    globalEventId: alarmEventId,
    nodeId: nodeId,
    status: 'enabled'
  });
  
  // 添加引用关系
  globalEventsStore.addReference(alarmEventId, nodeId);
});

console.log('批量引用完成');
console.log('告警事件引用数:', globalEventsStore.getEventReferenceCount(alarmEventId));
console.log('告警事件引用节点:', globalEventsStore.getEventReferences(alarmEventId));

// 移除某个节点的所有引用
globalEventsStore.removeNodeReferences('node-001');
console.log('移除 node-001 的引用后:');
console.log('告警事件引用数:', globalEventsStore.getEventReferenceCount(alarmEventId));
console.log('告警事件引用节点:', globalEventsStore.getEventReferences(alarmEventId));

// ========== 示例 10: 完整工作流 ==========

console.log('\n========== 示例 10: 完整工作流 ==========');

// 1. 创建全局事件库
console.log('1. 创建全局事件库');
const eventLibrary = [
  {
    name: '设备上线',
    eventType: 'loaded',
    actions: [
      { type: 'setProperty', target: 'color', value: '#00ff00' },
      { type: 'script', target: '', value: 'console.log("设备上线")' }
    ]
  },
  {
    name: '设备下线',
    eventType: 'destroyed',
    actions: [
      { type: 'setProperty', target: 'color', value: '#808080' },
      { type: 'script', target: '', value: 'console.log("设备下线")' }
    ]
  },
  {
    name: '设备隐藏',
    eventType: 'hidden',
    actions: [
      { type: 'setProperty', target: 'opacity', value: '0.3' }
    ]
  },
  {
    name: '设备显示',
    eventType: 'shown',
    actions: [
      { type: 'setProperty', target: 'opacity', value: '1' }
    ]
  }
];

const eventIds = eventLibrary.map(event => globalEventsStore.addEvent(event));
console.log('创建了', eventIds.length, '个全局事件');

// 2. 为节点批量引用事件
console.log('\n2. 为节点批量引用事件');
const targetNodeId = 'network-element-002';

eventIds.forEach((eventId, index) => {
  const event = globalEventsStore.events.get(eventId);
  
  eventsStore.createEvent({
    name: `[全局] ${event.name}`,
    eventType: event.eventType,
    eventSource: 'global',
    globalEventId: eventId,
    nodeId: targetNodeId,
    status: 'enabled'
  });
  
  globalEventsStore.addReference(eventId, targetNodeId);
});

console.log('为节点', targetNodeId, '引用了', eventIds.length, '个全局事件');

// 3. 导出配置
console.log('\n3. 导出配置');
const exportData = globalEventsStore.serialize();
console.log('导出数据:', {
  eventCount: exportData.events.length,
  referenceCount: exportData.references.length
});

console.log('\n========== 示例完成 ==========');

