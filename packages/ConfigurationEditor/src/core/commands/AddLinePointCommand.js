/**
 * AddLinePointCommand - 添加线条控制点命令
 *
 * @class AddLinePointCommand
 * @description 为线条节点添加新的控制点，支持撤销/重做
 */
export class AddLinePointCommand {
    /**
     * 创建命令
     *
     * @param {EditableLineNode} lineNode - 线条节点
     * @param {Object} position - 控制点位置 { x, y, z }
     * @param {number} index - 插入位置索引（-1 表示末尾）
     */
    constructor(lineNode, position, index = -1) {
        this.lineNode = lineNode;
        this.position = { ...position };
        this.index = index;
        this.actualIndex = -1; // 实际插入的索引
    }

    /**
     * 执行命令
     */
    execute() {
        this.actualIndex = this.lineNode.addPoint(this.position, this.index);
        return true;
    }

    /**
     * 撤销命令
     */
    undo() {
        if (this.actualIndex >= 0) {
            this.lineNode.removePoint(this.actualIndex);
        }
        return true;
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
        return `添加控制点到线条 "${this.lineNode.nodeName}"`;
    }
}

