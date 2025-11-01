/**
 * RenameNodeCommand 重命名节点命令
 * 
 * @description 用于撤销/重做节点重命名操作
 * @author W3D Team
 */

import { Command } from './Command.js';

/**
 * 重命名节点命令类
 * 
 * @class RenameNodeCommand
 * @extends Command
 */
export class RenameNodeCommand extends Command {
    /**
     * 创建重命名节点命令
     * 
     * @param {Object} node - 要重命名的节点
     * @param {String} newName - 新名称
     * @param {String} oldName - 旧名称
     */
    constructor(node, newName, oldName) {
        super();
        this.node = node;
        this.newName = newName;
        this.oldName = oldName;
    }

    /**
     * 执行命令
     */
    execute() {
        if (this.node) {
            this.node.nodeName = this.newName;
            this.node.name = this.newName; // 同时更新 name 属性
        }
    }

    /**
     * 撤销命令
     */
    undo() {
        if (this.node) {
            this.node.nodeName = this.oldName;
            this.node.name = this.oldName;
        }
    }

    /**
     * 重做命令
     */
    redo() {
        this.execute();
    }

    /**
     * 获取命令描述
     * 
     * @returns {String} 命令描述
     */
    getDescription() {
        return `重命名节点: ${this.oldName} → ${this.newName}`;
    }
}

