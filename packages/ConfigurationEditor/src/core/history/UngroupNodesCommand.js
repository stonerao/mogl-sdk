import { Command } from './Command.js';

/**
 * UngroupNodesCommand 解散分组命令
 *
 * @class UngroupNodesCommand
 * @extends Command
 * @description 解散分组，将子节点移出到场景根节点
 *
 * @example
 * const command = new UngroupNodesCommand(group, scene);
 * commandManager.execute(command);
 */
export class UngroupNodesCommand extends Command {
    /**
     * 创建命令实例
     *
     * @param {GroupNode} group - 要解散的分组节点
     * @param {Scene} scene - 场景对象
     * @param {boolean} deleteGroup - 是否删除分组节点（默认 true）
     */
    constructor(group, scene, deleteGroup = true) {
        super();
        this.group = group;
        this.scene = scene;
        this.deleteGroup = deleteGroup;

        // 保存子节点列表（浅拷贝）
        this.childNodes = group ? [...group.childNodes] : [];

        // 保存子节点在组中的本地位置
        this.localPositions = new Map();
        this.childNodes.forEach(node => {
            this.localPositions.set(node.uuid, node.position.clone());
        });
    }

    /**
     * 执行命令
     */
    execute() {
        if (!this.group || !this.scene) return;

        // 将所有子节点移出到场景
        this.childNodes.forEach(node => {
            if (node) {
                // 保存节点的世界位置
                const worldPosition = new THREE.Vector3();
                node.getWorldPosition(worldPosition);

                // 从组中移除
                this.group.removeChild(node);

                // 添加到场景
                this.scene.scene.add(node);

                // 恢复世界位置
                node.position.copy(worldPosition);
            }
        });

        // 删除分组节点
        if (this.deleteGroup) {
            this.scene.scene.remove(this.group);
        }

        console.log('UngroupNodesCommand: 解散分组', this.group.nodeName, '移出', this.childNodes.length, '个节点');
    }

    /**
     * 撤销命令
     */
    undo() {
        if (!this.group || !this.scene) return;

        // 如果删除了分组，重新添加到场景
        if (this.deleteGroup && !this.group.parent) {
            this.scene.scene.add(this.group);
        }

        // 将所有节点重新添加到组
        this.childNodes.forEach(node => {
            if (node) {
                // 从场景中移除
                this.scene.scene.remove(node);

                // 添加到组
                this.group.addChild(node);

                // 恢复本地位置
                const localPosition = this.localPositions.get(node.uuid);
                if (localPosition) {
                    node.position.copy(localPosition);
                }
            }
        });

        console.log('UngroupNodesCommand: 撤销解散分组', this.group.nodeName);
    }

    /**
     * 重做命令
     */
    redo() {
        this.execute();
    }
}

