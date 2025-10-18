/**
 * EventEmitter 事件发射器
 *
 * @class EventEmitter
 * @description 简单的事件发射器实现
 */
export class EventEmitter {
    /**
     * 创建事件发射器实例
     */
    constructor() {
        this.events = new Map();
    }

    /**
     * 监听事件
     *
     * @param {string} event - 事件名称
     * @param {Function} listener - 事件监听器
     */
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }

        this.events.get(event).push(listener);
        return this;
    }

    /**
     * 监听一次事件
     *
     * @param {string} event - 事件名称
     * @param {Function} listener - 事件监听器
     */
    once(event, listener) {
        const onceWrapper = (...args) => {
            listener(...args);
            this.off(event, onceWrapper);
        };

        return this.on(event, onceWrapper);
    }

    /**
     * 移除事件监听
     *
     * @param {string} event - 事件名称
     * @param {Function} listener - 事件监听器
     */
    off(event, listener) {
        const listeners = this.events.get(event);

        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }

        return this;
    }

    /**
     * 触发事件
     *
     * @param {string} event - 事件名称
     * @param {*} args - 事件参数
     */
    emit(event, ...args) {
        const listeners = this.events.get(event);
        if (listeners) {
            listeners.forEach((listener) => {
                try {
                    listener(...args);
                } catch (error) {
                    console.error(`Error in event listener for "${event}":`, error);
                }
            });
        }

        return this;
    }

    /**
     * 移除所有事件监听
     *
     * @param {string} event - 事件名称（可选）
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }

        return this;
    }

    /**
     * 获取事件监听器数量
     *
     * @param {string} event - 事件名称
     * @returns {number} 监听器数量
     */
    listenerCount(event) {
        const listeners = this.events.get(event);
        return listeners ? listeners.length : 0;
    }
}
