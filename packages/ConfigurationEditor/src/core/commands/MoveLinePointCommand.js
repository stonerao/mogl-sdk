/**
 * MoveLinePointCommand - 移动线条控制点命令
 *
 * @class MoveLinePointCommand
 * @description 移动线条节点的控制点位置，支持撤销/重做
 */
export class MoveLinePointCommand {
    /**
     * 创建命令
     *
     * @param {EditableLineNode} lineNode - 线条节点
     * @param {number} index - 控制点索引
     * @param {Object} newPosition - 新位置 { x, y, z }
     * @param {Object} oldPosition - 旧位置 { x, y, z }（可选，如果不提供会自动获取）
     */
    constructor(lineNode, index, newPosition, oldPosition = null) {
        this.lineNode = lineNode;
        this.index = index;
        this.newPosition = { ...newPosition };

        // 如果没有提供旧位置，从节点获取
        if (oldPosition) {
            this.oldPosition = { ...oldPosition };
        } else {
            const points = this.lineNode.properties.points;
            if (this.index >= 0 && this.index < points.length) {
                this.oldPosition = { ...points[this.index] };
            }
        }
    }

    /**
     * 执行命令
     */
    execute() {
        return this.lineNode.updatePoint(this.index, this.newPosition);
    }

    /**
     * 撤销命令
     */
    undo() {
        if (this.oldPosition) {
            return this.lineNode.updatePoint(this.index, this.oldPosition);
        }
        return false;
    }

    /**
     * 重做命令
     */
    redo() {
        return this.execute();
    }

    /**
     * 获取命令描述
     */
    getDescription() {
        return `移动线条 "${this.lineNode.nodeName}" 的控制点 ${this.index}`;
    }
}

