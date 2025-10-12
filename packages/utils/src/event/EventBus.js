import { EventEmitter } from './EventEmitter.js';

/**
 * EventBus 全局事件总线
 *
 * @class EventBus
 * @extends EventEmitter
 * @description 全局事件总线，单例模式
 */
class EventBus extends EventEmitter {
    constructor() {
        super();
    }
}

// 导出单例
export default new EventBus();
