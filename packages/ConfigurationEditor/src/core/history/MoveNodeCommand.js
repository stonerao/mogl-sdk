/**
 * MoveNodeCommand 移动节点命令
 * 
 * @description 移动节点的命令，支持撤销/重做
 * @author W3D Team
 */

import { Command } from './Command.js';

/**
 * 移动节点命令类
 * 
 * @class MoveNodeCommand
 * @extends Command
 */
export class MoveNodeCommand extends Command {
    /**
     * 创建命令实例
     * 
     * @param {Object} data - 命令数据
     * @param {Array|Object} data.nodes - 要移动的节点（单个或数组）
     * @param {Object} data.oldPositions - 旧位置数据（Map 或对象）
     * @param {Object} data.newPositions - 新位置数据（Map 或对象）
     */
    constructor(data) {
        super('移动节点', data);
        
        // 统一处理为数组
        this.nodes = Array.isArray(data.nodes) ? data.nodes : [data.nodes];
        this.oldPositions = data.oldPositions || new Map();
        this.newPositions = data.newPositions || new Map();
    }

    /**
     * 执行命令 - 移动到新位置
     * 
     * @returns {Boolean} 是否执行成功
     */
    execute() {
        try {
            this.nodes.forEach(node => {
                const newPos = this.newPositions.get ? 
                    this.newPositions.get(node) : 
                    this.newPositions[node.uuid];
                
                if (newPos) {
                    node.position.x = newPos.x;
                    node.position.y = newPos.y;
                    node.position.z = newPos.z || 0;
                    
                    // 同步属性
                    if (node.setProperty) {
                        node.setProperty('x', newPos.x, true);
                        node.setProperty('y', newPos.y, true);
                    }
                }
            });
            
            this.executed = true;
            return true;
        } catch (error) {
            console.error('MoveNodeCommand: execute failed', error);
            return false;
        }
    }

    /**
     * 撤销命令 - 移动回旧位置
     * 
     * @returns {Boolean} 是否撤销成功
     */
    undo() {
        try {
            this.nodes.forEach(node => {
                const oldPos = this.oldPositions.get ? 
                    this.oldPositions.get(node) : 
                    this.oldPositions[node.uuid];
                
                if (oldPos) {
                    node.position.x = oldPos.x;
                    node.position.y = oldPos.y;
                    node.position.z = oldPos.z || 0;
                    
                    // 同步属性
                    if (node.setProperty) {
                        node.setProperty('x', oldPos.x, true);
                        node.setProperty('y', oldPos.y, true);
                    }
                }
            });
            
            return true;
        } catch (error) {
            console.error('MoveNodeCommand: undo failed', error);
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
        return count === 1 ? '移动节点' : `移动 ${count} 个节点`;
    }

    /**
     * 命令是否可以合并（连续的移动操作可以合并）
     * 
     * @param {Command} command - 要合并的命令
     * @returns {Boolean} 是否可以合并
     */
    canMerge(command) {
        if (!(command instanceof MoveNodeCommand)) {
            return false;
        }
        
        // 检查是否是相同的节点
        if (this.nodes.length !== command.nodes.length) {
            return false;
        }
        
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i] !== command.nodes[i]) {
                return false;
            }
        }
        
        // 时间间隔小于 500ms 可以合并
        return (command.timestamp - this.timestamp) < 500;
    }

    /**
     * 合并命令
     * 
     * @param {Command} command - 要合并的命令
     */
    merge(command) {
        // 更新新位置为最新的位置
        this.newPositions = command.newPositions;
        this.timestamp = command.timestamp;
    }
}

