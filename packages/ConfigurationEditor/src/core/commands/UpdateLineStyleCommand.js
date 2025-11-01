/**
 * UpdateLineStyleCommand - 更新线条样式命令
 *
 * @class UpdateLineStyleCommand
 * @description 更新线条节点的样式属性（颜色、宽度、样式等），支持撤销/重做
 */
export class UpdateLineStyleCommand {
    /**
     * 创建命令
     *
     * @param {EditableLineNode} lineNode - 线条节点
     * @param {Object} newStyle - 新样式属性
     * @param {Object} oldStyle - 旧样式属性（可选，如果不提供会自动获取）
     */
    constructor(lineNode, newStyle, oldStyle = null) {
        this.lineNode = lineNode;
        this.newStyle = { ...newStyle };

        // 如果没有提供旧样式，从节点获取
        if (oldStyle) {
            this.oldStyle = { ...oldStyle };
        } else {
            this.oldStyle = {};
            Object.keys(newStyle).forEach(key => {
                this.oldStyle[key] = this.lineNode.properties[key];
            });
        }
    }

    /**
     * 执行命令
     */
    execute() {
        Object.keys(this.newStyle).forEach(key => {
            this.lineNode.setProperty(key, this.newStyle[key]);
        });
        return true;
    }

    /**
     * 撤销命令
     */
    undo() {
        Object.keys(this.oldStyle).forEach(key => {
            this.lineNode.setProperty(key, this.oldStyle[key]);
        });
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
        const changedProps = Object.keys(this.newStyle).join(', ');
        return `更新线条 "${this.lineNode.nodeName}" 的样式 (${changedProps})`;
    }
}

