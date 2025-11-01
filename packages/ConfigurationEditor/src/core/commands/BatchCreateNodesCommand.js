/**
 * BatchCreateNodesCommand.js - 批量创建节点命令
 * 
 * @description 用于批量创建大量节点，支持撤销/重做
 * @author W3D Team
 * @date 2025-10-30
 */

import { Command } from './Command.js';

/**
 * 批量创建节点命令
 */
export class BatchCreateNodesCommand extends Command {
  /**
   * @param {Object} options - 命令选项
   * @param {Array} options.nodes - 要创建的节点数组
   * @param {Object} options.canvasManager - 画布管理器
   * @param {Object} options.editorStore - 编辑器 store
   */
  constructor(options) {
    super();
    this.nodes = options.nodes || [];
    this.canvasManager = options.canvasManager;
    this.editorStore = options.editorStore;
    this.createdNodes = [];
  }

  /**
   * 执行命令
   */
  execute() {
    // 批量添加节点到画布
    this.nodes.forEach(node => {
      // 添加到场景
      this.canvasManager.addNode(node);
      
      // 添加到 store
      this.editorStore.addNode(node);
      
      // 记录创建的节点
      this.createdNodes.push(node);
    });

    console.log(`[BatchCreateNodesCommand] Created ${this.createdNodes.length} nodes`);
  }

  /**
   * 撤销命令
   */
  undo() {
    // 批量移除节点
    this.createdNodes.forEach(node => {
      // 从场景移除
      this.canvasManager.removeNode(node);
      
      // 从 store 移除
      this.editorStore.removeNode(node.uuid);
    });

    console.log(`[BatchCreateNodesCommand] Removed ${this.createdNodes.length} nodes`);
  }

  /**
   * 重做命令
   */
  redo() {
    this.execute();
  }

  /**
   * 获取命令描述
   */
  getDescription() {
    return `批量创建 ${this.nodes.length} 个节点`;
  }
}

