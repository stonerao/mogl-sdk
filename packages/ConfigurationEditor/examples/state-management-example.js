/**
 * 节点状态管理系统使用示例
 * 
 * @description 演示如何使用 Mock API 和节点状态管理功能
 * @author ConfigurationEditor Team
 * @date 2025-10-31
 */

import { MockApi } from '../src/mock/mockApi.js';
import { getNodeById } from '../src/mock/mockNodeData.js';
import { NodeFactory } from '../src/core/nodes/NodeFactory.js';
import { SetNodeStateCommand, BatchSetNodeStateCommand } from '../src/core/commands/SetNodeStateCommand.js';

/**
 * 示例 1: 使用 Mock API 获取节点数据
 */
async function example1_MockAPI() {
  console.log('=== 示例 1: Mock API 使用 ===\n');

  // 1. 获取节点分类
  const categoriesRes = await MockApi.getNodeCategories();
  console.log('节点分类:', categoriesRes.data);

  // 2. 获取所有节点
  const allNodesRes = await MockApi.getNodeList();
  console.log('\n所有节点数量:', allNodesRes.total);

  // 3. 获取网络节点
  const networkNodesRes = await MockApi.getNodeList({ category: 'network' });
  console.log('网络节点:', networkNodesRes.data.map(n => n.name));

  // 4. 搜索节点
  const searchRes = await MockApi.searchNodes('网元');
  console.log('\n搜索"网元"结果:', searchRes.data.map(n => n.name));

  // 5. 获取节点详情
  const detailRes = await MockApi.getNodeDetail('network-element-access-3');
  console.log('\n节点详情:', detailRes.data);
}

/**
 * 示例 2: 创建支持状态的节点
 */
function example2_CreateNodeWithStates(scene) {
  console.log('\n=== 示例 2: 创建支持状态的节点 ===\n');

  // 1. 从 Mock 数据获取节点配置
  const nodeConfig = getNodeById('network-element-access-3');
  console.log('节点配置:', nodeConfig);

  // 2. 创建节点
  const node = NodeFactory.createNode('network-element', scene, {
    name: nodeConfig.name,
    properties: {
      x: 100,
      y: 100,
      width: nodeConfig.defaultWidth,
      height: nodeConfig.defaultHeight
    },
    states: nodeConfig.states
  });

  console.log('\n节点创建成功:', node.nodeName);
  console.log('支持的状态:', node.getStates().map(s => s.stateName));
  console.log('当前状态:', node.getCurrentState().stateName);

  return node;
}

/**
 * 示例 3: 手动切换节点状态
 */
function example3_ManualStateChange(node) {
  console.log('\n=== 示例 3: 手动切换节点状态 ===\n');

  // 1. 获取所有状态
  const states = node.getStates();
  console.log('所有状态:', states.map(s => `${s.stateId}: ${s.stateName}`));

  // 2. 获取当前状态
  const currentState = node.getCurrentState();
  console.log('\n当前状态:', currentState.stateName);

  // 3. 切换到状态 1（告警）
  console.log('\n切换到状态 1...');
  node.setState(1);
  console.log('当前状态:', node.getCurrentState().stateName);

  // 4. 切换到下一个状态
  console.log('\n切换到下一个状态...');
  node.nextState();
  console.log('当前状态:', node.getCurrentState().stateName);

  // 5. 切换到上一个状态
  console.log('\n切换到上一个状态...');
  node.previousState();
  console.log('当前状态:', node.getCurrentState().stateName);
}

/**
 * 示例 4: 使用命令系统切换状态（支持撤销/重做）
 */
function example4_CommandStateChange(node, commandManager) {
  console.log('\n=== 示例 4: 使用命令系统切换状态 ===\n');

  console.log('初始状态:', node.getCurrentState().stateName);

  // 1. 创建状态切换命令
  const command1 = new SetNodeStateCommand({
    node: node,
    newStateId: 1
  });

  // 2. 执行命令
  console.log('\n执行命令: 切换到状态 1');
  commandManager.execute(command1);
  console.log('当前状态:', node.getCurrentState().stateName);

  // 3. 再次切换
  const command2 = new SetNodeStateCommand({
    node: node,
    newStateId: 2
  });
  console.log('\n执行命令: 切换到状态 2');
  commandManager.execute(command2);
  console.log('当前状态:', node.getCurrentState().stateName);

  // 4. 撤销
  console.log('\n撤销...');
  commandManager.undo();
  console.log('当前状态:', node.getCurrentState().stateName);

  // 5. 再次撤销
  console.log('\n再次撤销...');
  commandManager.undo();
  console.log('当前状态:', node.getCurrentState().stateName);

  // 6. 重做
  console.log('\n重做...');
  commandManager.redo();
  console.log('当前状态:', node.getCurrentState().stateName);
}

/**
 * 示例 5: 批量切换节点状态
 */
function example5_BatchStateChange(nodes, commandManager) {
  console.log('\n=== 示例 5: 批量切换节点状态 ===\n');

  console.log('节点数量:', nodes.length);
  console.log('初始状态:', nodes.map(n => n.getCurrentState().stateName));

  // 1. 创建批量状态切换命令
  const command = new BatchSetNodeStateCommand({
    nodes: nodes,
    newStateId: 1
  });

  // 2. 执行命令
  console.log('\n批量切换到状态 1...');
  commandManager.execute(command);
  console.log('当前状态:', nodes.map(n => n.getCurrentState().stateName));

  // 3. 撤销
  console.log('\n撤销批量操作...');
  commandManager.undo();
  console.log('当前状态:', nodes.map(n => n.getCurrentState().stateName));
}

/**
 * 示例 6: 监听状态变化事件
 */
function example6_StateChangeEvents(node) {
  console.log('\n=== 示例 6: 监听状态变化事件 ===\n');

  // 1. 监听状态变化事件
  node.on('state-changed', (event) => {
    console.log('状态变化事件:', {
      oldState: event.oldState.stateName,
      newState: event.newState.stateName,
      oldStateId: event.oldStateId,
      newStateId: event.newStateId
    });
  });

  // 2. 监听状态图标变化事件
  node.on('state-icon-changed', (event) => {
    console.log('图标变化事件:', event.iconPath);
  });

  // 3. 触发状态变化
  console.log('\n切换状态...');
  node.setState(1);
  node.setState(2);
  node.setState(0);
}

/**
 * 示例 7: 数据绑定驱动状态（扩展示例）
 */
function example7_DataDrivenState(node, dataSource) {
  console.log('\n=== 示例 7: 数据绑定驱动状态 ===\n');

  // 1. 设置状态数据绑定键
  node.properties.stateDataKey = 'status';
  console.log('绑定数据键: status');

  // 2. 监听数据源变化
  dataSource.on('data-changed', (data) => {
    console.log('\n数据源更新:', data);
    
    // 根据数据自动切换状态
    if (data.status !== undefined) {
      const oldState = node.getCurrentState().stateName;
      node.setState(data.status);
      const newState = node.getCurrentState().stateName;
      console.log(`状态自动切换: ${oldState} → ${newState}`);
    }
  });

  // 3. 模拟数据更新
  console.log('\n模拟数据更新...');
  dataSource.updateData({ status: 0 });  // 正常
  setTimeout(() => dataSource.updateData({ status: 1 }), 1000);  // 告警
  setTimeout(() => dataSource.updateData({ status: 2 }), 2000);  // 离线
  setTimeout(() => dataSource.updateData({ status: 0 }), 3000);  // 恢复正常
}

/**
 * 示例 8: 序列化和反序列化
 */
function example8_Serialization(node) {
  console.log('\n=== 示例 8: 序列化和反序列化 ===\n');

  // 1. 设置节点状态
  node.setState(1);
  console.log('当前状态:', node.getCurrentState().stateName);

  // 2. 序列化节点
  const serialized = node.serialize();
  console.log('\n序列化数据:', {
    currentStateId: serialized.currentStateId,
    states: serialized.states.map(s => s.stateName)
  });

  // 3. 创建新节点并反序列化
  const newNode = NodeFactory.createNode('network-element', node.scene, {
    name: 'Restored Node'
  });
  newNode.deserialize(serialized);
  
  console.log('\n反序列化后的状态:', newNode.getCurrentState().stateName);
  console.log('状态是否一致:', newNode.getCurrentStateId() === node.getCurrentStateId());
}

/**
 * 运行所有示例
 */
export async function runAllExamples(scene, commandManager, dataSource) {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     节点状态管理系统 - 使用示例                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // 示例 1: Mock API
  await example1_MockAPI();

  // 示例 2: 创建节点
  const node = example2_CreateNodeWithStates(scene);

  // 示例 3: 手动切换状态
  example3_ManualStateChange(node);

  // 示例 4: 命令系统
  if (commandManager) {
    example4_CommandStateChange(node, commandManager);
  }

  // 示例 5: 批量切换
  if (commandManager) {
    const nodes = [
      example2_CreateNodeWithStates(scene),
      example2_CreateNodeWithStates(scene),
      example2_CreateNodeWithStates(scene)
    ];
    example5_BatchStateChange(nodes, commandManager);
  }

  // 示例 6: 事件监听
  example6_StateChangeEvents(node);

  // 示例 7: 数据驱动（如果提供了数据源）
  if (dataSource) {
    example7_DataDrivenState(node, dataSource);
  }

  // 示例 8: 序列化
  example8_Serialization(node);

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     所有示例运行完成！                                  ║');
  console.log('╚════════════════════════════════════════════════════════╝');
}

// 导出单个示例函数
export {
  example1_MockAPI,
  example2_CreateNodeWithStates,
  example3_ManualStateChange,
  example4_CommandStateChange,
  example5_BatchStateChange,
  example6_StateChangeEvents,
  example7_DataDrivenState,
  example8_Serialization
};

