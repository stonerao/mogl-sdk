/**
 * DeleteNodeCommand 删除节点命令
 * 
 * @description 删除节点的命令，支持撤销/重做
 * @author W3D Team
 */

import { Command } from './Command.js';

/**
 * 删除节点命令类
 * 
 * @class DeleteNodeCommand
 * @extends Command
 */
export class DeleteNodeCommand extends Command {
    /**
     * 创建命令实例
     * 
     * @param {Object} data - 命令数据
     * @param {Array|Object} data.nodes - 要删除的节点（单个或数组）
     * @param {Function} data.onDelete - 删除回调
     * @param {Function} data.onRestore - 恢复回调
     */
    constructor(data) {
        super('删除节点', data);
        
        // 统一处理为数组
        this.nodes = Array.isArray(data.nodes) ? data.nodes : [data.nodes];
        this.onDelete = data.onDelete;
        this.onRestore = data.onRestore;
        
        // 保存节点数据用于恢复
        this.nodeData = this.nodes.map(node => ({
            node: node,
            json: node.toJSON ? node.toJSON() : null,
            parent: node.parent
        }));
    }

    /**
     * 执行命令 - 删除节点
     * 
     * @returns {Boolean} 是否执行成功
     */
    execute() {
        try {
            this.nodes.forEach(node => {
                if (this.onDelete) {
                    this.onDelete(node);
                }
            });
            
            this.executed = true;
            return true;
        } catch (error) {
            console.error('DeleteNodeCommand: execute failed', error);
            return false;
        }
    }

    /**
     * 撤销命令 - 恢复节点
     * 
     * @returns {Boolean} 是否撤销成功
     */
    undo() {
        try {
            this.nodeData.forEach(data => {
                if (this.onRestore) {
                    this.onRestore(data.node);
                }
            });
            
            return true;
        } catch (error) {
            console.error('DeleteNodeCommand: undo failed', error);
            return false;
        }
    }

    /**
     * 获取命令描述
     * 
     * @returns {String} 命令描述
     */
    getDescription() {
        const count = this.nodes.length;
        return count === 1 ? '删除节点' : `删除 ${count} 个节点`;
    }
}

