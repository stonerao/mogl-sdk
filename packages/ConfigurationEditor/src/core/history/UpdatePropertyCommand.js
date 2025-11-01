/**
 * UpdatePropertyCommand 更新属性命令
 * 
 * @description 更新节点属性的命令，支持撤销/重做
 * @author W3D Team
 */

import { Command } from './Command.js';

/**
 * 更新属性命令类
 * 
 * @class UpdatePropertyCommand
 * @extends Command
 */
export class UpdatePropertyCommand extends Command {
    /**
     * 创建命令实例
     * 
     * @param {Object} data - 命令数据
     * @param {Object} data.node - 要更新的节点
     * @param {String} data.propertyKey - 属性键
     * @param {*} data.oldValue - 旧值
     * @param {*} data.newValue - 新值
     */
    constructor(data) {
        super('更新属性', data);
        
        this.node = data.node;
        this.propertyKey = data.propertyKey;
        this.oldValue = data.oldValue;
        this.newValue = data.newValue;
    }

    /**
     * 执行命令 - 设置新值
     * 
     * @returns {Boolean} 是否执行成功
     */
    execute() {
        try {
            if (this.node && this.node.setProperty) {
                this.node.setProperty(this.propertyKey, this.newValue);
            }
            
            this.executed = true;
            return true;
        } catch (error) {
            console.error('UpdatePropertyCommand: execute failed', error);
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
            if (this.node && this.node.setProperty) {
                this.node.setProperty(this.propertyKey, this.oldValue);
            }
            
            return true;
        } catch (error) {
            console.error('UpdatePropertyCommand: undo failed', error);
            return false;
        }
    }

    /**
     * 获取命令描述
     * 
     * @returns {String} 命令描述
     */
    getDescription() {
        return `更新属性: ${this.propertyKey}`;
    }

    /**
     * 命令是否可以合并
     * 
     * @param {Command} command - 要合并的命令
     * @returns {Boolean} 是否可以合并
     */
    canMerge(command) {
        if (!(command instanceof UpdatePropertyCommand)) {
            return false;
        }
        
        // 必须是相同的节点和属性
        if (this.node !== command.node || this.propertyKey !== command.propertyKey) {
            return false;
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

