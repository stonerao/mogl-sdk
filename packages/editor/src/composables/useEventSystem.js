import { useComponentStore } from '@/stores/useComponentStore';
import { getEventMetadata } from '@/config/eventTypes';

/**
 * 事件系统组合式函数
 * 提供事件绑定、解绑、触发等功能
 */
export function useEventSystem() {
    const componentStore = useComponentStore();

    /**
     * 为组件绑定事件
     * @param {string} componentId - 组件 ID
     * @param {string} eventType - 事件类型
     * @param {Object} eventConfig - 事件配置
     * @returns {Object} 事件对象
     */
    const bindEvent = (componentId, eventType, eventConfig = {}) => {
        const component = componentStore.components.find((c) => c.id === componentId);
        if (!component) {
            throw new Error(`Component not found: ${componentId}`);
        }

        const metadata = getEventMetadata(eventType);
        if (!metadata) {
            throw new Error(`Unknown event type: ${eventType}`);
        }

        // 创建事件对象
        const event = {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: eventType,
            enabled: eventConfig.enabled !== undefined ? eventConfig.enabled : true,
            handler: eventConfig.handler || metadata.example,
            description: eventConfig.description || '',
            createdAt: Date.now()
        };

        // 添加到组件的事件列表
        componentStore.addEvent(componentId, event);

        // 如果事件已启用，立即绑定到组件实例
        if (event.enabled && component.instance) {
            attachEventToInstance(component.instance, event);
        }

        console.log(`Event bound: ${eventType} to ${component.name}`, event);

        return event;
    };

    /**
     * 解绑事件
     * @param {string} componentId - 组件 ID
     * @param {string} eventId - 事件 ID
     */
    const unbindEvent = (componentId, eventId) => {
        const component = componentStore.components.find((c) => c.id === componentId);
        if (!component) {
            throw new Error(`Component not found: ${componentId}`);
        }

        const event = component.events?.find((e) => e.id === eventId);
        if (!event) {
            throw new Error(`Event not found: ${eventId}`);
        }

        // 从组件实例移除事件监听
        if (component.instance) {
            detachEventFromInstance(component.instance, event);
        }

        // 从 store 中移除
        componentStore.removeEvent(componentId, eventId);

        console.log(`Event unbound: ${event.type} from ${component.name}`);
    };

    /**
     * 更新事件配置
     * @param {string} componentId - 组件 ID
     * @param {string} eventId - 事件 ID
     * @param {Object} updates - 更新内容
     */
    const updateEvent = (componentId, eventId, updates) => {
        const component = componentStore.components.find((c) => c.id === componentId);
        if (!component) {
            throw new Error(`Component not found: ${componentId}`);
        }

        const event = component.events?.find((e) => e.id === eventId);
        if (!event) {
            throw new Error(`Event not found: ${eventId}`);
        }

        // 如果启用状态改变，需要重新绑定/解绑
        const enabledChanged = updates.enabled !== undefined && updates.enabled !== event.enabled;

        // 更新事件
        componentStore.updateEvent(componentId, eventId, updates);

        // 重新绑定到实例
        if (component.instance) {
            if (enabledChanged) {
                if (updates.enabled) {
                    attachEventToInstance(component.instance, { ...event, ...updates });
                } else {
                    detachEventFromInstance(component.instance, event);
                }
            } else if (event.enabled) {
                // 如果事件已启用且处理器改变，重新绑定
                detachEventFromInstance(component.instance, event);
                attachEventToInstance(component.instance, { ...event, ...updates });
            }
        }

        console.log(`Event updated: ${event.type}`, updates);
    };

    /**
     * 切换事件启用状态
     * @param {string} componentId - 组件 ID
     * @param {string} eventId - 事件 ID
     */
    const toggleEvent = (componentId, eventId) => {
        const component = componentStore.components.find((c) => c.id === componentId);
        if (!component) return;

        const event = component.events?.find((e) => e.id === eventId);
        if (!event) return;

        updateEvent(componentId, eventId, { enabled: !event.enabled });
    };

    /**
     * 触发事件
     * @param {string} componentId - 组件 ID
     * @param {string} eventType - 事件类型
     * @param {Array} args - 事件参数
     */
    const triggerEvent = (componentId, eventType, ...args) => {
        const component = componentStore.components.find((c) => c.id === componentId);
        if (!component || !component.events) return;

        const events = component.events.filter((e) => e.type === eventType && e.enabled);

        events.forEach((event) => {
            try {
                executeEventHandler(event.handler, args);
            } catch (error) {
                console.error(`Error executing event handler: ${event.type}`, error);
            }
        });
    };

    /**
     * 将事件绑定到组件实例
     * @param {Object} instance - 组件实例
     * @param {Object} event - 事件对象
     */
    const attachEventToInstance = (instance, event) => {
        if (!instance || !event.enabled) return;

        try {
            // 创建事件处理函数
            const handlerFn = createHandlerFunction(event.handler);

            // 根据事件类型绑定到实例
            switch (event.type) {
                case 'onLoaded':
                    // 生命周期事件通过组件的生命周期钩子绑定
                    if (instance.onLoaded) {
                        instance._originalOnLoaded = instance.onLoaded;
                        instance.onLoaded = function (...args) {
                            this._originalOnLoaded?.(...args);
                            handlerFn.call(this, ...args);
                        };
                    } else {
                        instance.onLoaded = handlerFn;
                    }
                    break;

                case 'onMounted':
                    if (instance.onMounted) {
                        instance._originalOnMounted = instance.onMounted;
                        instance.onMounted = function (...args) {
                            this._originalOnMounted?.(...args);
                            handlerFn.call(this, ...args);
                        };
                    } else {
                        instance.onMounted = handlerFn;
                    }
                    break;

                case 'onUnmount':
                    if (instance.onDispose) {
                        instance._originalOnDispose = instance.onDispose;
                        instance.onDispose = function (...args) {
                            handlerFn.call(this, ...args);
                            this._originalOnDispose?.(...args);
                        };
                    } else {
                        instance.onDispose = handlerFn;
                    }
                    break;

                case 'onUpdate':
                    if (instance.onUpdate) {
                        instance._originalOnUpdate = instance.onUpdate;
                        instance.onUpdate = function (...args) {
                            this._originalOnUpdate?.(...args);
                            handlerFn.call(this, ...args);
                        };
                    } else {
                        instance.onUpdate = handlerFn;
                    }
                    break;

                // 交互事件需要通过 Raycaster 实现，这里先预留
                case 'onClick':
                case 'onDoubleClick':
                case 'onHover':
                case 'onHoverOut':
                    // TODO: 实现交互事件绑定
                    console.warn(`Interactive event ${event.type} not yet implemented`);
                    break;

                default:
                    console.warn(`Unknown event type: ${event.type}`);
            }

            // 保存事件处理器引用
            if (!instance._eventHandlers) {
                instance._eventHandlers = {};
            }
            instance._eventHandlers[event.id] = handlerFn;
        } catch (error) {
            console.error(`Failed to attach event: ${event.type}`, error);
        }
    };

    /**
     * 从组件实例移除事件
     * @param {Object} instance - 组件实例
     * @param {Object} event - 事件对象
     */
    const detachEventFromInstance = (instance, event) => {
        if (!instance || !instance._eventHandlers) return;

        try {
            // 移除事件处理器引用
            delete instance._eventHandlers[event.id];

            // 恢复原始方法
            switch (event.type) {
                case 'onLoaded':
                    if (instance._originalOnLoaded) {
                        instance.onLoaded = instance._originalOnLoaded;
                        delete instance._originalOnLoaded;
                    }
                    break;
                case 'onMounted':
                    if (instance._originalOnMounted) {
                        instance.onMounted = instance._originalOnMounted;
                        delete instance._originalOnMounted;
                    }
                    break;
                case 'onUnmount':
                    if (instance._originalOnDispose) {
                        instance.onDispose = instance._originalOnDispose;
                        delete instance._originalOnDispose;
                    }
                    break;
                case 'onUpdate':
                    if (instance._originalOnUpdate) {
                        instance.onUpdate = instance._originalOnUpdate;
                        delete instance._originalOnUpdate;
                    }
                    break;
            }
        } catch (error) {
            console.error(`Failed to detach event: ${event.type}`, error);
        }
    };

    /**
     * 创建事件处理函数
     * @param {string} handlerCode - 处理器代码
     * @returns {Function} 处理函数
     */
    const createHandlerFunction = (handlerCode) => {
        try {
            // 使用 Function 构造器创建函数
            // eslint-disable-next-line no-new-func
            return new Function('return ' + handlerCode)();
        } catch (error) {
            console.error('Failed to create handler function:', error);
            return () => {};
        }
    };

    /**
     * 执行事件处理器
     * @param {string} handlerCode - 处理器代码
     * @param {Array} args - 参数
     */
    const executeEventHandler = (handlerCode, args) => {
        const handlerFn = createHandlerFunction(handlerCode);
        handlerFn(...args);
    };

    return {
        bindEvent,
        unbindEvent,
        updateEvent,
        toggleEvent,
        triggerEvent
    };
}

