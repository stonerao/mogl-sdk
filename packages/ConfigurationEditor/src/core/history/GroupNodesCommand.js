import { Command } from './Command.js';
import * as THREE from 'three';

/**
 * GroupNodesCommand 将节点添加到组命令
 *
 * @class GroupNodesCommand
 * @extends Command
 * @description 将选中的节点添加到新创建的分组中
 *
 * @example
 * const command = new GroupNodesCommand(group, nodes, scene);
 * commandManager.execute(command);
 */
export class GroupNodesCommand extends Command {
    /**
     * 创建命令实例
     *
     * @param {GroupNode} group - 分组节点
     * @param {Array<BaseNode>} nodes - 要添加到组的节点列表
     * @param {Scene} scene - 场景对象
     */
    constructor(group, nodes, scene) {
        super();
        this.group = group;
        this.nodes = nodes || [];
        this.scene = scene;

        // 保存节点的原始父节点
        this.originalParents = new Map();
        this.nodes.forEach(node => {
            this.originalParents.set(node.uuid, node.parent);
        });
    }

    /**
     * 执行命令
     */
    execute() {
        if (!this.group || !this.scene) return;

        // 将组添加到场景
        if (!this.group.parent) {
            this.scene.scene.add(this.group);
        }

        // 将所有节点添加到组
        this.nodes.forEach(node => {
            if (node && node !== this.group) {
                // 保存节点的世界位置
                const worldPosition = new THREE.Vector3();
                node.getWorldPosition(worldPosition);

                // 添加到组
                this.group.addChild(node);

                // 恢复世界位置（转换为组的本地坐标）
                const localPosition = this.group.worldToLocal(worldPosition.clone());
                node.position.copy(localPosition);
            }
        });

        console.log('GroupNodesCommand: 将', this.nodes.length, '个节点添加到分组', this.group.nodeName);
    }

    /**
     * 撤销命令
     */
    undo() {
        if (!this.group) return;

        // 将所有节点从组中移除，恢复到原始父节点
        this.nodes.forEach(node => {
            if (node) {
                // 保存节点的世界位置
                const worldPosition = new THREE.Vector3();
                node.getWorldPosition(worldPosition);

                // 从组中移除
                this.group.removeChild(node);

                // 恢复到原始父节点
                const originalParent = this.originalParents.get(node.uuid);
                if (originalParent && originalParent !== this.group) {
                    if (originalParent.add) {
                        originalParent.add(node);
                    }
                } else {
                    this.scene.scene.add(node);
                }

                // 恢复世界位置
                node.position.copy(worldPosition);
            }
        });

        // 如果组为空，从场景中移除
        if (this.group.childNodes.length === 0) {
            this.scene.scene.remove(this.group);
        }

        console.log('GroupNodesCommand: 撤销分组', this.group.nodeName);
    }

    /**
     * 重做命令
     */
    redo() {
        this.execute();
    }
}

