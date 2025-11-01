/**
 * TransformNodeCommand 变换节点命令
 * 
 * @description 变换节点（缩放、旋转）的命令，支持撤销/重做
 * @author W3D Team
 */

import { Command } from './Command.js';
import * as THREE from 'three';

/**
 * 变换节点命令类
 * 
 * @class TransformNodeCommand
 * @extends Command
 */
export class TransformNodeCommand extends Command {
    /**
     * 创建命令实例
     * 
     * @param {Object} data - 命令数据
     * @param {Object} data.node - 要变换的节点
     * @param {String} data.transformType - 变换类型：'scale' | 'rotate'
     * @param {Object} data.oldTransform - 旧变换数据
     * @param {Object} data.newTransform - 新变换数据
     */
    constructor(data) {
        super('变换节点', data);
        
        this.node = data.node;
        this.transformType = data.transformType; // 'scale' | 'rotate'
        this.oldTransform = data.oldTransform;
        this.newTransform = data.newTransform;
    }

    /**
     * 执行命令 - 应用新变换
     * 
     * @returns {Boolean} 是否执行成功
     */
    execute() {
        try {
            this.applyTransform(this.newTransform);
            this.executed = true;
            return true;
        } catch (error) {
            console.error('TransformNodeCommand: execute failed', error);
            return false;
        }
    }

    /**
     * 撤销命令 - 恢复旧变换
     * 
     * @returns {Boolean} 是否撤销成功
     */
    undo() {
        try {
            this.applyTransform(this.oldTransform);
            return true;
        } catch (error) {
            console.error('TransformNodeCommand: undo failed', error);
            return false;
        }
    }

    /**
     * 应用变换
     * 
     * @param {Object} transform - 变换数据
     */
    applyTransform(transform) {
        if (!this.node) return;

        if (this.transformType === 'scale') {
            // 应用缩放
            this.node.scale.copy(transform.scale);
            
            // 同步属性
            if (this.node.setProperty) {
                this.node.setProperty('scaleX', transform.scale.x, true);
                this.node.setProperty('scaleY', transform.scale.y, true);
            }
        } else if (this.transformType === 'rotate') {
            // 应用旋转
            this.node.rotation.copy(transform.rotation);
            
            // 同步属性（转换为角度）
            if (this.node.setProperty) {
                const rotationDeg = THREE.MathUtils.radToDeg(transform.rotation.z);
                this.node.setProperty('rotation', rotationDeg, true);
            }
        }
    }

    /**
     * 获取命令描述
     * 
     * @returns {String} 命令描述
     */
    getDescription() {
        if (this.transformType === 'scale') {
            return '缩放节点';
        } else if (this.transformType === 'rotate') {
            return '旋转节点';
        }
        return '变换节点';
    }

    /**
     * 命令是否可以合并
     * 
     * @param {Command} command - 要合并的命令
     * @returns {Boolean} 是否可以合并
     */
    canMerge(command) {
        if (!(command instanceof TransformNodeCommand)) {
            return false;
        }
        
        // 必须是相同的节点和变换类型
        if (this.node !== command.node || this.transformType !== command.transformType) {
            return false;
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
        // 更新新变换为最新的变换
        this.newTransform = command.newTransform;
        this.timestamp = command.timestamp;
    }
}

