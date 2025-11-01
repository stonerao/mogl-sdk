/**
 * 可编辑线条组件使用示例
 *
 * 本示例展示如何使用可编辑线条组件：
 * 1. 创建线条节点
 * 2. 添加和删除控制点
 * 3. 移动控制点
 * 4. 调整线条样式
 * 5. 使用编辑手柄
 * 6. 序列化和反序列化
 */

import { NodeFactory } from '@/core/nodes/NodeFactory.js';
import { AddLinePointCommand } from '@/core/commands/AddLinePointCommand.js';
import { RemoveLinePointCommand } from '@/core/commands/RemoveLinePointCommand.js';
import { MoveLinePointCommand } from '@/core/commands/MoveLinePointCommand.js';
import { UpdateLineStyleCommand } from '@/core/commands/UpdateLineStyleCommand.js';

// ========== 示例 1: 创建线条节点 ==========

console.log('========== 示例 1: 创建线条节点 ==========');

// 创建简单的直线
const straightLine = NodeFactory.createNode('editable-line', scene, {
  name: '直线',
  properties: {
    points: [
      { x: 0, y: 0, z: 0 },
      { x: 200, y: 0, z: 0 }
    ],
    color: '#409EFF',
    lineWidth: 2,
    lineStyle: 'solid'
  }
});

console.log('创建直线:', straightLine);

// 创建折线
const polyline = NodeFactory.createNode('editable-line', scene, {
  name: '折线',
  properties: {
    points: [
      { x: 0, y: 0, z: 0 },
      { x: 100, y: 50, z: 0 },
      { x: 200, y: 50, z: 0 },
      { x: 300, y: 100, z: 0 }
    ],
    color: '#67C23A',
    lineWidth: 3,
    lineStyle: 'solid'
  }
});

console.log('创建折线:', polyline);

// 创建虚线
const dashedLine = NodeFactory.createNode('editable-line', scene, {
  name: '虚线',
  properties: {
    points: [
      { x: 0, y: 100, z: 0 },
      { x: 300, y: 100, z: 0 }
    ],
    color: '#E6A23C',
    lineWidth: 2,
    lineStyle: 'dashed',
    dashSize: 10,
    gapSize: 5
  }
});

console.log('创建虚线:', dashedLine);

// ========== 示例 2: 添加控制点 ==========

console.log('\n========== 示例 2: 添加控制点 ==========');

// 在末尾添加控制点
const newPointIndex1 = straightLine.addPoint({ x: 300, y: 50, z: 0 });
console.log('在末尾添加控制点，索引:', newPointIndex1);

// 在指定位置插入控制点
const newPointIndex2 = straightLine.addPoint({ x: 150, y: 25, z: 0 }, 1);
console.log('在索引 1 处插入控制点，新索引:', newPointIndex2);

// 查看当前所有控制点
console.log('当前控制点:', straightLine.properties.points);

// ========== 示例 3: 删除控制点 ==========

console.log('\n========== 示例 3: 删除控制点 ==========');

// 删除指定索引的控制点
const deleted = polyline.removePoint(2);
console.log('删除索引 2 的控制点:', deleted);

// 尝试删除导致控制点少于 2 个（会失败）
const line2Points = NodeFactory.createNode('editable-line', scene, {
  name: '两点线',
  properties: {
    points: [
      { x: 0, y: 0, z: 0 },
      { x: 100, y: 0, z: 0 }
    ]
  }
});

const deleteFailed = line2Points.removePoint(0);
console.log('尝试删除导致少于 2 个点（应失败）:', deleteFailed);

// ========== 示例 4: 移动控制点 ==========

console.log('\n========== 示例 4: 移动控制点 ==========');

// 更新控制点位置
const updated = polyline.updatePoint(1, { x: 120, y: 60, z: 0 });
console.log('更新索引 1 的控制点:', updated);

// 批量更新多个控制点
polyline.updatePoint(0, { x: 10, y: 10, z: 0 });
polyline.updatePoint(2, { x: 310, y: 110, z: 0 });
console.log('批量更新后的控制点:', polyline.properties.points);

// ========== 示例 5: 调整线条样式 ==========

console.log('\n========== 示例 5: 调整线条样式 ==========');

// 更改颜色
straightLine.setProperty('color', '#F56C6C');
console.log('更改颜色为红色');

// 更改线宽
straightLine.setProperty('lineWidth', 4);
console.log('更改线宽为 4');

// 切换到虚线
straightLine.setProperty('lineStyle', 'dashed');
straightLine.setProperty('dashSize', 8);
straightLine.setProperty('gapSize', 4);
console.log('切换到虚线样式');

// 切换回实线
setTimeout(() => {
  straightLine.setProperty('lineStyle', 'solid');
  console.log('切换回实线样式');
}, 2000);

// ========== 示例 6: 编辑模式和手柄 ==========

console.log('\n========== 示例 6: 编辑模式和手柄 ==========');

// 开启编辑模式
polyline.setEditMode(true);
console.log('开启编辑模式，显示编辑手柄');

// 选中控制点
polyline.selectPoint(1);
console.log('选中索引 1 的控制点');

// 调整手柄大小
polyline.setProperty('handleSize', 15);
console.log('调整手柄大小为 15');

// 自定义手柄颜色
polyline.setProperty('handleColor', '#ffffff');
polyline.setProperty('handleBorderColor', '#67C23A');
polyline.setProperty('handleSelectedColor', '#FFD700');
console.log('自定义手柄颜色');

// 关闭编辑模式
setTimeout(() => {
  polyline.setEditMode(false);
  console.log('关闭编辑模式，隐藏编辑手柄');
}, 3000);

// ========== 示例 7: 使用命令系统 ==========

console.log('\n========== 示例 7: 使用命令系统 ==========');

// 假设有一个命令管理器
const commandManager = {
  execute: (command) => {
    console.log('执行命令:', command.getDescription());
    command.execute();
  },
  undo: (command) => {
    console.log('撤销命令:', command.getDescription());
    command.undo();
  },
  redo: (command) => {
    console.log('重做命令:', command.getDescription());
    command.redo();
  }
};

// 添加控制点命令
const addCommand = new AddLinePointCommand(
  dashedLine,
  { x: 150, y: 100, z: 0 },
  1
);
commandManager.execute(addCommand);

// 移动控制点命令
const moveCommand = new MoveLinePointCommand(
  dashedLine,
  1,
  { x: 150, y: 120, z: 0 },
  { x: 150, y: 100, z: 0 }
);
commandManager.execute(moveCommand);

// 更新样式命令
const styleCommand = new UpdateLineStyleCommand(
  dashedLine,
  { color: '#909399', lineWidth: 3 },
  { color: '#E6A23C', lineWidth: 2 }
);
commandManager.execute(styleCommand);

// 撤销操作
commandManager.undo(styleCommand);
commandManager.undo(moveCommand);
commandManager.undo(addCommand);

// 重做操作
commandManager.redo(addCommand);
commandManager.redo(moveCommand);

// ========== 示例 8: 序列化和反序列化 ==========

console.log('\n========== 示例 8: 序列化和反序列化 ==========');

// 序列化线条
const serialized = polyline.serialize();
console.log('序列化数据:', JSON.stringify(serialized, null, 2));

// 创建新线条并反序列化
const clonedLine = NodeFactory.createNode('editable-line', scene, {
  name: '克隆线条'
});
clonedLine.deserialize(serialized);
console.log('反序列化后的线条:', clonedLine);

// ========== 示例 9: 创建复杂路径 ==========

console.log('\n========== 示例 9: 创建复杂路径 ==========');

// 创建 Z 字形路径
const zigzagLine = NodeFactory.createNode('editable-line', scene, {
  name: 'Z字形路径',
  properties: {
    points: [
      { x: 0, y: 0, z: 0 },
      { x: 100, y: 0, z: 0 },
      { x: 0, y: 50, z: 0 },
      { x: 100, y: 50, z: 0 },
      { x: 0, y: 100, z: 0 },
      { x: 100, y: 100, z: 0 }
    ],
    color: '#409EFF',
    lineWidth: 2
  }
});

console.log('创建 Z 字形路径:', zigzagLine);

// 创建圆形路径（近似）
const circlePoints = [];
const radius = 50;
const segments = 16;
for (let i = 0; i <= segments; i++) {
  const angle = (i / segments) * Math.PI * 2;
  circlePoints.push({
    x: Math.cos(angle) * radius + 100,
    y: Math.sin(angle) * radius + 100,
    z: 0
  });
}

const circleLine = NodeFactory.createNode('editable-line', scene, {
  name: '圆形路径',
  properties: {
    points: circlePoints,
    color: '#67C23A',
    lineWidth: 2
  }
});

console.log('创建圆形路径（近似）:', circleLine);

// ========== 示例 10: 动态路径动画 ==========

console.log('\n========== 示例 10: 动态路径动画 ==========');

// 创建动画线条
const animatedLine = NodeFactory.createNode('editable-line', scene, {
  name: '动画线条',
  properties: {
    points: [
      { x: 0, y: 0, z: 0 },
      { x: 100, y: 0, z: 0 },
      { x: 100, y: 100, z: 0 }
    ],
    color: '#E6A23C',
    lineWidth: 3
  }
});

// 动画：让第二个控制点上下移动
let time = 0;
const animate = () => {
  time += 0.05;
  const y = Math.sin(time) * 50;

  animatedLine.updatePoint(1, {
    x: 100,
    y: y,
    z: 0
  });

  if (time < Math.PI * 4) {
    requestAnimationFrame(animate);
  }
};

console.log('开始动画...');
animate();

// ========== 示例 11: 连接两个节点 ==========

console.log('\n========== 示例 11: 连接两个节点 ==========');

// 假设有两个节点
const node1 = { position: { x: 0, y: 0, z: 0 } };
const node2 = { position: { x: 200, y: 100, z: 0 } };

// 创建连接线
const connectionLine = NodeFactory.createNode('editable-line', scene, {
  name: '连接线',
  properties: {
    points: [
      { x: node1.position.x, y: node1.position.y, z: 0 },
      { x: node2.position.x, y: node2.position.y, z: 0 }
    ],
    color: '#909399',
    lineWidth: 2,
    lineStyle: 'dashed'
  }
});

console.log('创建节点连接线:', connectionLine);

// 当节点移动时更新连接线
const updateConnection = (node, index) => {
  connectionLine.updatePoint(index, {
    x: node.position.x,
    y: node.position.y,
    z: 0
  });
};

// 模拟节点移动
node1.position.x = 50;
node1.position.y = 50;
updateConnection(node1, 0);

node2.position.x = 250;
node2.position.y = 150;
updateConnection(node2, 1);

console.log('更新连接线位置');

console.log('\n========== 示例完成 ==========');

