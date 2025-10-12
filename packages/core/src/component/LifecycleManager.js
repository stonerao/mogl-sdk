/**
 * LifecycleManager 生命周期管理器
 *
 * @class LifecycleManager
 * @description 管理组件的生命周期钩子
 */
export class LifecycleManager {
    /**
     * 创建生命周期管理器实例
     */
    constructor() {
        // 生命周期钩子队列
        this.hooks = {
            onCreate: [],
            onBeforeMount: [],
            onMounted: [],
            onUpdate: [],
            onBeforeDispose: [],
            onDispose: []
        };
    }

    /**
     * 注册生命周期钩子
     *
     * @param {string} hookName - 钩子名称
     * @param {Function} handler - 处理函数
     */
    registerHook(hookName, handler) {
        if (!this.hooks[hookName]) {
            console.warn(`Unknown hook: ${hookName}`);
            return;
        }

        this.hooks[hookName].push(handler);
    }

    /**
     * 调用生命周期钩子
     *
     * @param {string} hookName - 钩子名称
     * @param {*} context - 上下文
     * @param {Array} args - 参数
     */
    callHook(hookName, context, ...args) {
        if (!this.hooks[hookName]) {
            return;
        }

        this.hooks[hookName].forEach((handler) => {
            try {
                handler.call(context, ...args);
            } catch (error) {
                console.error(`Error in ${hookName} hook:`, error);
            }
        });
    }

    /**
     * 移除生命周期钩子
     *
     * @param {string} hookName - 钩子名称
     * @param {Function} handler - 处理函数
     */
    removeHook(hookName, handler) {
        if (!this.hooks[hookName]) {
            return;
        }

        const index = this.hooks[hookName].indexOf(handler);
        if (index > -1) {
            this.hooks[hookName].splice(index, 1);
        }
    }

    /**
     * 清空所有钩子
     */
    clear() {
        Object.keys(this.hooks).forEach((key) => {
            this.hooks[key] = [];
        });
    }
}
