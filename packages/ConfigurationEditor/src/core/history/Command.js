/**
 * Command 命令基类
 * 
 * @description 命令模式基类，用于实现撤销/重做功能
 * @author W3D Team
 */

/**
 * 命令基类
 * 
 * @class Command
 */
export class Command {
    /**
     * 创建命令实例
     * 
     * @param {String} name - 命令名称
     * @param {Object} data - 命令数据
     */
    constructor(name, data = {}) {
        this.name = name;
        this.data = data;
        this.timestamp = Date.now();
        this.executed = false;
    }

    /**
     * 执行命令
     * 
     * @abstract
     * @returns {Boolean} 是否执行成功
     */
    execute() {
        throw new Error('Command.execute() must be implemented by subclass');
    }

    /**
     * 撤销命令
     * 
     * @abstract
     * @returns {Boolean} 是否撤销成功
     */
    undo() {
        throw new Error('Command.undo() must be implemented by subclass');
    }

    /**
     * 重做命令
     * 
     * @returns {Boolean} 是否重做成功
     */
    redo() {
        // 默认重做就是重新执行
        return this.execute();
    }

    /**
     * 获取命令描述
     * 
     * @returns {String} 命令描述
     */
    getDescription() {
        return this.name;
    }

    /**
     * 命令是否可以合并
     * 
     * @param {Command} command - 要合并的命令
     * @returns {Boolean} 是否可以合并
     */
    canMerge(command) {
        return false;
    }

    /**
     * 合并命令
     * 
     * @param {Command} command - 要合并的命令
     */
    merge(command) {
        // 子类可以重写此方法实现命令合并
    }
}

