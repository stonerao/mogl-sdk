/**
 * CreateNodeCommand 创建节点命令
 * 
 * @description 创建节点的命令，支持撤销/重做
 * @author W3D Team
 */

import { Command } from './Command.js';

/**
 * 创建节点命令类
 * 
 * @class CreateNodeCommand
 * @extends Command
 */
export class CreateNodeCommand extends Command {
    /**
     * 创建命令实例
     * 
     * @param {Object} data - 命令数据
     * @param {String} data.nodeType - 节点类型
     * @param {Object} data.config - 节点配置
     * @param {Object} data.scene - 场景对象
     * @param {Function} data.onCreate - 创建回调
     * @param {Function} data.onDelete - 删除回调
     */
    constructor(data) {
        super('创建节点', data);
        
        this.nodeType = data.nodeType;
        this.config = data.config;
        this.scene = data.scene;
        this.onCreate = data.onCreate;
        this.onDelete = data.onDelete;
        
        // 创建的节点实例
        this.node = null;
    }

    /**
     * 执行命令 - 创建节点
     * 
     * @returns {Boolean} 是否执行成功
     */
    execute() {
        try {
            if (this.node) {
                // 如果节点已存在（重做），重新添加到场景
                if (this.onCreate) {
                    this.onCreate(this.node);
                }
            } else {
                // 首次创建节点
                if (this.onCreate) {
                    this.node = this.onCreate(this.nodeType, this.config);
                }
            }
            
            this.executed = true;
            return true;
        } catch (error) {
            console.error('CreateNodeCommand: execute failed', error);
            return false;
        }
    }

    /**
     * 撤销命令 - 删除节点
     * 
     * @returns {Boolean} 是否撤销成功
     */
    undo() {
        try {
            if (this.node && this.onDelete) {
                this.onDelete(this.node);
            }
            
            return true;
        } catch (error) {
            console.error('CreateNodeCommand: undo failed', error);
            return false;
        }
    }

    /**
     * 获取命令描述
     * 
     * @returns {String} 命令描述
     */
    getDescription() {
        return `创建 ${this.nodeType} 节点`;
    }
}

