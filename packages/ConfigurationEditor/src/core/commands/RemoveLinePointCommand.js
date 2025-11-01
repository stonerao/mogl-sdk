/**
 * RemoveLinePointCommand - 删除线条控制点命令
 *
 * @class RemoveLinePointCommand
 * @description 删除线条节点的控制点，支持撤销/重做
 */
export class RemoveLinePointCommand {
    /**
     * 创建命令
     *
     * @param {EditableLineNode} lineNode - 线条节点
     * @param {number} index - 要删除的控制点索引
     */
    constructor(lineNode, index) {
        this.lineNode = lineNode;
        this.index = index;
        this.removedPoint = null;
    }

    /**
     * 执行命令
     */
    execute() {
        // 保存被删除的点
        const points = this.lineNode.properties.points;
        if (this.index >= 0 && this.index < points.length) {
            this.removedPoint = { ...points[this.index] };
            return this.lineNode.removePoint(this.index);
        }
        return false;
    }

    /**
     * 撤销命令
     */
    undo() {
        if (this.removedPoint) {
            this.lineNode.addPoint(this.removedPoint, this.index);
            return true;
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
        return `删除线条 "${this.lineNode.nodeName}" 的控制点 ${this.index}`;
    }
}

