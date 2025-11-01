import { Command } from './Command.js';

/**
 * CreateGroupCommand 创建分组命令
 *
 * @class CreateGroupCommand
 * @extends Command
 * @description 创建新的分组节点
 *
 * @example
 * const command = new CreateGroupCommand(groupNode, scene);
 * commandManager.execute(command);
 */
export class CreateGroupCommand extends Command {
    /**
     * 创建命令实例
     *
     * @param {GroupNode} group - 分组节点
     * @param {Scene} scene - 场景对象
     */
    constructor(group, scene) {
        super();
        this.group = group;
        this.scene = scene;
    }

    /**
     * 执行命令
     */
    execute() {
        if (this.group && this.scene) {

            this.scene.scene.add(this.group);
            console.log('CreateGroupCommand: 创建分组', this.group.nodeName);
        }
    }

    /**
     * 撤销命令
     */
    undo() {
        if (this.group && this.scene) {
            this.scene.scene.remove(this.group);
            console.log('CreateGroupCommand: 撤销创建分组', this.group.nodeName);
        }
    }

    /**
     * 重做命令
     */
    redo() {
        this.execute();
    }
}

