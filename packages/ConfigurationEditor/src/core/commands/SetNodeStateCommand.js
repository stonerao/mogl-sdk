import { Command } from '../history/Command.js';

/**
 * SetNodeStateCommand 设置节点状态命令
 *
 * @class SetNodeStateCommand
 * @extends Command
 * @description 设置节点的状态，支持撤销/重做
 *
 * @example
 * const command = new SetNodeStateCommand({
 *     node: myNode,
 *     newStateId: 1
 * });
 * commandManager.execute(command);
 */
export class SetNodeStateCommand extends Command {
    /**
     * 创建设置节点状态命令
     *
     * @param {Object} options - 命令选项
     * @param {BaseNode} options.node - 目标节点
     * @param {number} options.newStateId - 新状态 ID
     */
    constructor(options) {
        super();

        this.node = options.node;
        this.newStateId = options.newStateId;
        this.oldStateId = this.node.getCurrentStateId();

        // 验证节点是否支持状态
        if (!this.node.getStates || this.node.getStates().length === 0) {
            throw new Error('SetNodeStateCommand: Node does not support states');
        }

        // 验证新状态是否存在
        const newState = this.node.getStateById(this.newStateId);
        if (!newState) {
            throw new Error(`SetNodeStateCommand: State ${this.newStateId} not found`);
        }
    }

    /**
     * 执行命令
     */
    execute() {
        this.node.setState(this.newStateId);
        console.log(`[SetNodeStateCommand] Set node "${this.node.nodeName}" state to ${this.newStateId}`);
    }

    /**
     * 撤销命令
     */
    undo() {
        this.node.setState(this.oldStateId);
        console.log(`[SetNodeStateCommand] Undo: Restored node "${this.node.nodeName}" state to ${this.oldStateId}`);
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
     * @returns {string} 命令描述
     */
    getDescription() {
        const oldState = this.node.getStateById(this.oldStateId);
        const newState = this.node.getStateById(this.newStateId);

        const oldStateName = oldState ? oldState.stateName : this.oldStateId;
        const newStateName = newState ? newState.stateName : this.newStateId;

        return `设置节点 "${this.node.nodeName}" 状态: ${oldStateName} → ${newStateName}`;
    }
}

/**
 * BatchSetNodeStateCommand 批量设置节点状态命令
 *
 * @class BatchSetNodeStateCommand
 * @extends Command
 * @description 批量设置多个节点的状态，支持撤销/重做
 *
 * @example
 * const command = new BatchSetNodeStateCommand({
 *     nodes: [node1, node2, node3],
 *     newStateId: 1
 * });
 * commandManager.execute(command);
 */
export class BatchSetNodeStateCommand extends Command {
    /**
     * 创建批量设置节点状态命令
     *
     * @param {Object} options - 命令选项
     * @param {Array<BaseNode>} options.nodes - 目标节点数组
     * @param {number} options.newStateId - 新状态 ID
     */
    constructor(options) {
        super();

        this.nodes = options.nodes || [];
        this.newStateId = options.newStateId;

        // 保存每个节点的旧状态
        this.oldStateIds = this.nodes.map(node => node.getCurrentStateId());

        // 验证所有节点是否支持状态
        this.nodes.forEach(node => {
            if (!node.getStates || node.getStates().length === 0) {
                throw new Error(`BatchSetNodeStateCommand: Node "${node.nodeName}" does not support states`);
            }

            const newState = node.getStateById(this.newStateId);
            if (!newState) {
                throw new Error(`BatchSetNodeStateCommand: State ${this.newStateId} not found in node "${node.nodeName}"`);
            }
        });
    }

    /**
     * 执行命令
     */
    execute() {
        this.nodes.forEach(node => {
            node.setState(this.newStateId);
        });
        console.log(`[BatchSetNodeStateCommand] Set ${this.nodes.length} nodes state to ${this.newStateId}`);
    }

    /**
     * 撤销命令
     */
    undo() {
        this.nodes.forEach((node, index) => {
            node.setState(this.oldStateIds[index]);
        });
        console.log(`[BatchSetNodeStateCommand] Undo: Restored ${this.nodes.length} nodes state`);
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
     * @returns {string} 命令描述
     */
    getDescription() {
        return `批量设置 ${this.nodes.length} 个节点状态`;
    }
}

