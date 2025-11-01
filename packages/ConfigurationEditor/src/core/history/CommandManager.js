/**
 * CommandManager 命令管理器
 * 
 * @description 管理命令的执行、撤销、重做，实现历史记录功能
 * @author W3D Team
 */

/**
 * 命令管理器类
 * 
 * @class CommandManager
 */
export class CommandManager {
    /**
     * 创建命令管理器实例
     * 
     * @param {Object} options - 配置选项
     */
    constructor(options = {}) {
        // 配置选项
        this.options = {
            maxHistorySize: options.maxHistorySize || 50,  // 最大历史记录数
            mergeCommands: options.mergeCommands !== false, // 是否合并命令
            ...options
        };

        // 历史记录栈
        this.undoStack = [];  // 撤销栈
        this.redoStack = [];  // 重做栈

        // 当前执行的命令
        this.currentCommand = null;

        // 回调函数
        this.onHistoryChangeCallback = null;

        // 键盘快捷键绑定
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        this.enableKeyboardShortcuts();
    }

    /**
     * 执行命令
     * 
     * @param {Command} command - 要执行的命令
     * @returns {Boolean} 是否执行成功
     */
    execute(command) {
        if (!command) {
            console.warn('CommandManager: command is null');
            return false;
        }

        // 执行命令
        const success = command.execute();
        
        if (success) {
            // 尝试合并命令
            if (this.options.mergeCommands && this.undoStack.length > 0) {
                const lastCommand = this.undoStack[this.undoStack.length - 1];
                
                if (lastCommand.canMerge && lastCommand.canMerge(command)) {
                    // 合并命令
                    lastCommand.merge(command);
                    this.notifyHistoryChange();
                    return true;
                }
            }

            // 添加到撤销栈
            this.undoStack.push(command);

            // 限制历史记录大小
            if (this.undoStack.length > this.options.maxHistorySize) {
                this.undoStack.shift();
            }

            // 清空重做栈
            this.redoStack = [];

            // 通知历史记录变化
            this.notifyHistoryChange();
        }

        return success;
    }

    /**
     * 撤销
     * 
     * @returns {Boolean} 是否撤销成功
     */
    undo() {
        if (!this.canUndo()) {
            return false;
        }

        // 从撤销栈弹出命令
        const command = this.undoStack.pop();

        // 执行撤销
        const success = command.undo();

        if (success) {
            // 添加到重做栈
            this.redoStack.push(command);

            // 通知历史记录变化
            this.notifyHistoryChange();
        } else {
            // 撤销失败，放回撤销栈
            this.undoStack.push(command);
        }

        return success;
    }

    /**
     * 重做
     * 
     * @returns {Boolean} 是否重做成功
     */
    redo() {
        if (!this.canRedo()) {
            return false;
        }

        // 从重做栈弹出命令
        const command = this.redoStack.pop();

        // 执行重做
        const success = command.redo();

        if (success) {
            // 添加到撤销栈
            this.undoStack.push(command);

            // 通知历史记录变化
            this.notifyHistoryChange();
        } else {
            // 重做失败，放回重做栈
            this.redoStack.push(command);
        }

        return success;
    }

    /**
     * 是否可以撤销
     * 
     * @returns {Boolean} 是否可以撤销
     */
    canUndo() {
        return this.undoStack.length > 0;
    }

    /**
     * 是否可以重做
     * 
     * @returns {Boolean} 是否可以重做
     */
    canRedo() {
        return this.redoStack.length > 0;
    }

    /**
     * 清空历史记录
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.notifyHistoryChange();
    }

    /**
     * 获取撤销栈大小
     * 
     * @returns {Number} 撤销栈大小
     */
    getUndoStackSize() {
        return this.undoStack.length;
    }

    /**
     * 获取重做栈大小
     * 
     * @returns {Number} 重做栈大小
     */
    getRedoStackSize() {
        return this.redoStack.length;
    }

    /**
     * 获取历史记录
     * 
     * @returns {Object} 历史记录信息
     */
    getHistory() {
        return {
            undoStack: this.undoStack.map(cmd => cmd.getDescription()),
            redoStack: this.redoStack.map(cmd => cmd.getDescription()),
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        };
    }

    /**
     * 通知历史记录变化
     */
    notifyHistoryChange() {
        if (this.onHistoryChangeCallback) {
            this.onHistoryChangeCallback({
                canUndo: this.canUndo(),
                canRedo: this.canRedo(),
                undoCount: this.undoStack.length,
                redoCount: this.redoStack.length
            });
        }
    }

    /**
     * 设置历史记录变化回调
     * 
     * @param {Function} callback - 回调函数
     */
    onHistoryChange(callback) {
        this.onHistoryChangeCallback = callback;
    }

    /**
     * 启用键盘快捷键
     */
    enableKeyboardShortcuts() {
        window.addEventListener('keydown', this.boundHandleKeyDown);
    }

    /**
     * 禁用键盘快捷键
     */
    disableKeyboardShortcuts() {
        window.removeEventListener('keydown', this.boundHandleKeyDown);
    }

    /**
     * 处理键盘事件
     * 
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeyDown(event) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

        // Ctrl/Cmd + Z: 撤销
        if (ctrlKey && event.key === 'z' && !event.shiftKey) {
            if (this.canUndo()) {
                event.preventDefault();
                this.undo();
            }
        }
        // Ctrl/Cmd + Shift + Z: 重做
        else if (ctrlKey && event.key === 'z' && event.shiftKey) {
            if (this.canRedo()) {
                event.preventDefault();
                this.redo();
            }
        }
        // Ctrl/Cmd + Y: 重做（Windows 风格）
        else if (ctrlKey && event.key === 'y') {
            if (this.canRedo()) {
                event.preventDefault();
                this.redo();
            }
        }
    }

    /**
     * 销毁命令管理器
     */
    dispose() {
        this.disableKeyboardShortcuts();
        this.clear();
        this.onHistoryChangeCallback = null;
        
        console.log('CommandManager: disposed');
    }
}

