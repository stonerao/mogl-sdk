import { Command } from './Command.js';
import * as THREE from 'three';

/**
 * RemoveFromGroupCommand 将节点从组中移除命令
 * 
 * @class RemoveFromGroupCommand
 * @extends Command
 * @description 将一个或多个节点从分组中移除，移动到场景根节点或指定父节点
 * 
 * @example
 * const command = new RemoveFromGroupCommand(nodes, scene);
 * commandManager.execute(command);
 */
export class RemoveFromGroupCommand extends Command {
    /**
     * 创建命令实例
     * 
     * @param {Array<BaseNode>|BaseNode} nodes - 要移除的节点（单个或数组）
     * @param {Scene} scene - 场景对象
     * @param {Object3D} targetParent - 目标父节点（可选，默认为场景根节点）
     */
    constructor(nodes, scene, targetParent = null) {
        super();
        this.nodes = Array.isArray(nodes) ? nodes : [nodes];
        this.scene = scene;
        this.targetParent = targetParent;

        // 保存节点的原始父节点（分组）和本地位置
        this.originalParents = new Map();
        this.localPositions = new Map();
        this.worldPositions = new Map();

        this.nodes.forEach(node => {
            this.originalParents.set(node.uuid, node.parent);
            this.localPositions.set(node.uuid, node.position.clone());
            
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
        if (!this.scene) return;

        this.nodes.forEach(node => {
            if (node) {
                // 获取世界位置
                const worldPosition = this.worldPositions.get(node.uuid);

                // 从原始父节点移除
                const originalParent = this.originalParents.get(node.uuid);
                if (originalParent && originalParent.removeChild) {
                    originalParent.removeChild(node);
                } else if (originalParent && originalParent.remove) {
                    originalParent.remove(node);
                }

                // 添加到目标父节点
                const parent = this.targetParent || this.scene;
                if (parent.add) {
                    parent.add(node);
                }

                // 恢复世界位置
                if (worldPosition) {
                    if (this.targetParent && this.targetParent.worldToLocal) {
                        const localPosition = this.targetParent.worldToLocal(worldPosition.clone());
                        node.position.copy(localPosition);
                    } else {
                        node.position.copy(worldPosition);
                    }
                }
            }
        });

        console.log('RemoveFromGroupCommand: 将', this.nodes.length, '个节点从分组中移除');
    }

    /**
     * 撤销命令
     */
    undo() {
        this.nodes.forEach(node => {
            if (node) {
                // 从当前父节点移除
                const currentParent = node.parent;
                if (currentParent && currentParent.remove) {
                    currentParent.remove(node);
                }

                // 恢复到原始父节点
                const originalParent = this.originalParents.get(node.uuid);
                if (originalParent) {
                    if (originalParent.addChild) {
                        originalParent.addChild(node);
                    } else if (originalParent.add) {
                        originalParent.add(node);
                    }

                    // 恢复本地位置
                    const localPosition = this.localPositions.get(node.uuid);
                    if (localPosition) {
                        node.position.copy(localPosition);
                    }
                }
            }
        });

        console.log('RemoveFromGroupCommand: 撤销从分组中移除');
    }

    /**
     * 重做命令
     */
    redo() {
        this.execute();
    }
}

