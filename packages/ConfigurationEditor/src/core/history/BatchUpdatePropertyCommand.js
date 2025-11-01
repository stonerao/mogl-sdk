/**
 * BatchUpdatePropertyCommand 批量更新属性命令
 * 
 * @description 批量更新多个节点的属性，支持撤销/重做
 * @author W3D Team
 */

import { Command } from './Command.js';

/**
 * 批量更新属性命令类
 * 
 * @class BatchUpdatePropertyCommand
 * @extends Command
 */
export class BatchUpdatePropertyCommand extends Command {
    /**
     * 创建命令实例
     * 
     * @param {Object} data - 命令数据
     * @param {Array} data.nodes - 要更新的节点数组
     * @param {String} data.propertyKey - 属性键
     * @param {*} data.newValue - 新值
     */
    constructor(data) {
        super('批量更新属性', data);
        
        this.nodes = data.nodes || [];
        this.propertyKey = data.propertyKey;
        this.newValue = data.newValue;
        
        // 保存每个节点的旧值
        this.oldValues = this.nodes.map(node => {
            if (node && node.properties) {
                return node.properties[this.propertyKey];
            }
            return undefined;
        });
    }

    /**
     * 执行命令 - 设置新值
     * 
     * @returns {Boolean} 是否执行成功
     */
    execute() {
        try {
            this.nodes.forEach(node => {
                if (node && node.setProperty) {
                    node.setProperty(this.propertyKey, this.newValue);
                }
            });
            
            this.executed = true;
            return true;
        } catch (error) {
            console.error('BatchUpdatePropertyCommand: execute failed', error);
            return false;
        }
    }

    /**
     * 撤销命令 - 恢复旧值
     * 
     * @returns {Boolean} 是否撤销成功
     */
    undo() {
        try {
            this.nodes.forEach((node, index) => {
                if (node && node.setProperty) {
                    node.setProperty(this.propertyKey, this.oldValues[index]);
                }
            });
            
            return true;
        } catch (error) {
            console.error('BatchUpdatePropertyCommand: undo failed', error);
            return false;
        }
    }

    /**
     * 获取命令描述
     * 
     * @returns {String} 命令描述
     */
    getDescription() {
        return `批量更新属性: ${this.propertyKey} (${this.nodes.length} 个节点)`;
    }

    /**
     * 命令是否可以合并
     * 
     * @param {Command} command - 要合并的命令
     * @returns {Boolean} 是否可以合并
     */
    canMerge(command) {
        if (!(command instanceof BatchUpdatePropertyCommand)) {
            return false;
        }
        
        // 必须是相同的节点集合和属性
        if (this.nodes.length !== command.nodes.length) {
            return false;
        }
        
        if (this.propertyKey !== command.propertyKey) {
            return false;
        }
        
        // 检查是否是相同的节点
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i] !== command.nodes[i]) {
                return false;
            }
        }
        
        // 时间间隔小于 1000ms 可以合并
        return (command.timestamp - this.timestamp) < 1000;
    }

    /**
     * 合并命令
     * 
     * @param {Command} command - 要合并的命令
     */
    merge(command) {
        // 更新新值为最新的值
        this.newValue = command.newValue;
        this.timestamp = command.timestamp;
    }
}

