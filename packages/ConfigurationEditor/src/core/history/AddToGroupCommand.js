import { Command } from './Command.js';
import * as THREE from 'three';

/**
 * AddToGroupCommand 将节点添加到指定组命令
 * 
 * @class AddToGroupCommand
 * @extends Command
 * @description 将一个或多个节点添加到指定的分组中
 * 
 * @example
 * const command = new AddToGroupCommand(nodes, targetGroup);
 * commandManager.execute(command);
 */
export class AddToGroupCommand extends Command {
    /**
     * 创建命令实例
     * 
     * @param {Array<BaseNode>|BaseNode} nodes - 要添加的节点（单个或数组）
     * @param {GroupNode} targetGroup - 目标分组
     */
    constructor(nodes, targetGroup) {
        super();
        this.nodes = Array.isArray(nodes) ? nodes : [nodes];
        this.targetGroup = targetGroup;

        // 保存节点的原始父节点和位置
        this.originalParents = new Map();
        this.worldPositions = new Map();

        this.nodes.forEach(node => {
            this.originalParents.set(node.uuid, node.parent);
            
            // 保存世界位置
            const worldPosition = new THREE.Vector3();
            node.getWorldPosition(worldPosition);
            this.worldPositions.set(node.uuid, worldPosition);
        });
    }

    /**
     * 执行命令
     */
    execute() {
        if (!this.targetGroup) return;

        this.nodes.forEach(node => {
            if (node && node !== this.targetGroup) {
                // 获取世界位置
                const worldPosition = this.worldPositions.get(node.uuid);

                // 添加到目标组
                this.targetGroup.addChild(node);

                // 转换为组的本地坐标
                if (worldPosition) {
                    const localPosition = this.targetGroup.worldToLocal(worldPosition.clone());
                    node.position.copy(localPosition);
                }
            }
        });

        console.log('AddToGroupCommand: 将', this.nodes.length, '个节点添加到分组', this.targetGroup.nodeName);
    }

    /**
     * 撤销命令
     */
    undo() {
        if (!this.targetGroup) return;

        this.nodes.forEach(node => {
            if (node) {
                // 获取世界位置
                const worldPosition = this.worldPositions.get(node.uuid);

                // 从目标组移除
                this.targetGroup.removeChild(node);

                // 恢复到原始父节点
                const originalParent = this.originalParents.get(node.uuid);
                if (originalParent && originalParent.add) {
                    originalParent.add(node);
                    
                    // 转换为原始父节点的本地坐标
                    if (worldPosition) {
                        const localPosition = originalParent.worldToLocal(worldPosition.clone());
                        node.position.copy(localPosition);
                    }
                } else {
                    // 如果原始父节点不存在，恢复世界位置
                    if (worldPosition) {
                        node.position.copy(worldPosition);
                    }
                }
            }
        });

        console.log('AddToGroupCommand: 撤销添加到分组', this.targetGroup.nodeName);
    }

    /**
     * 重做命令
     */
    redo() {
        this.execute();
    }
}

