import { useHistoryStore } from '@/stores/useHistoryStore';
import { useComponentStore } from '@/stores/useComponentStore';

/**
 * 历史记录组合式函数
 * 提供常用的命令工厂方法
 */
export function useHistory() {
    const historyStore = useHistoryStore();
    const componentStore = useComponentStore();

    /**
     * 创建添加组件命令
     * @param {Object} componentData - 组件数据
     * @returns {Object} 命令对象
     */
    const createAddComponentCommand = (componentData) => {
        return {
            name: `添加组件: ${componentData.name}`,
            data: { componentData },
            execute: async () => {
                // 添加组件的逻辑在外部已经执行，这里只需要记录
                // 实际的添加操作由 useComponent.addComponent 完成
            },
            undo: async () => {
                // 撤销：删除组件
                componentStore.removeComponent(componentData.id);
            }
        };
    };

    /**
     * 创建删除组件命令
     * @param {Object} component - 要删除的组件
     * @returns {Object} 命令对象
     */
    const createRemoveComponentCommand = (component) => {
        // 保存组件的完整数据，用于恢复
        const savedComponent = {
            id: component.id,
            name: component.name,
            type: component.type,
            config: { ...component.config },
            visible: component.visible,
            locked: component.locked,
            events: component.events ? [...component.events] : [],
            createdAt: component.createdAt
        };

        return {
            name: `删除组件: ${component.name}`,
            data: { component: savedComponent },
            execute: async () => {
                // 删除组件的逻辑在外部已经执行
            },
            undo: async () => {
                // 撤销：重新添加组件
                // 注意：这里需要重新创建组件实例
                // 由于组件实例无法序列化，撤销删除时需要重新创建
                componentStore.addComponent(savedComponent);
                
                // TODO: 重新创建场景实例
                // 这需要调用 useComponent.addComponent 来重新创建场景中的实例
                console.warn('[History] 撤销删除组件需要重新创建场景实例（待实现）');
            }
        };
    };

    /**
     * 创建更新组件配置命令
     * @param {String} componentId - 组件 ID
     * @param {Object} oldConfig - 旧配置
     * @param {Object} newConfig - 新配置
     * @returns {Object} 命令对象
     */
    const createUpdateConfigCommand = (componentId, oldConfig, newConfig) => {
        const component = componentStore.components.find((c) => c.id === componentId);
        const componentName = component ? component.name : componentId;

        return {
            name: `修改属性: ${componentName}`,
            data: { componentId, oldConfig, newConfig },
            execute: async () => {
                // 更新配置的逻辑在外部已经执行
            },
            undo: async () => {
                // 撤销：恢复旧配置
                componentStore.updateComponent(componentId, { config: oldConfig });
                
                // 同步到场景实例
                const component = componentStore.components.find((c) => c.id === componentId);
                if (component?.instance?.updateConfig) {
                    await component.instance.updateConfig(oldConfig);
                }
            }
        };
    };

    /**
     * 创建更新组件名称命令
     * @param {String} componentId - 组件 ID
     * @param {String} oldName - 旧名称
     * @param {String} newName - 新名称
     * @returns {Object} 命令对象
     */
    const createRenameComponentCommand = (componentId, oldName, newName) => {
        return {
            name: `重命名组件: ${oldName} → ${newName}`,
            data: { componentId, oldName, newName },
            execute: async () => {
                // 重命名的逻辑在外部已经执行
            },
            undo: async () => {
                // 撤销：恢复旧名称
                componentStore.updateComponent(componentId, { name: oldName });
            }
        };
    };

    /**
     * 创建添加事件命令
     * @param {String} componentId - 组件 ID
     * @param {Object} event - 事件对象
     * @returns {Object} 命令对象
     */
    const createAddEventCommand = (componentId, event) => {
        const component = componentStore.components.find((c) => c.id === componentId);
        const componentName = component ? component.name : componentId;

        return {
            name: `添加事件: ${componentName} - ${event.type}`,
            data: { componentId, event },
            execute: async () => {
                // 添加事件的逻辑在外部已经执行
            },
            undo: async () => {
                // 撤销：删除事件
                componentStore.removeEvent(componentId, event.id);
            }
        };
    };

    /**
     * 创建删除事件命令
     * @param {String} componentId - 组件 ID
     * @param {Object} event - 事件对象
     * @returns {Object} 命令对象
     */
    const createRemoveEventCommand = (componentId, event) => {
        const component = componentStore.components.find((c) => c.id === componentId);
        const componentName = component ? component.name : componentId;

        return {
            name: `删除事件: ${componentName} - ${event.type}`,
            data: { componentId, event },
            execute: async () => {
                // 删除事件的逻辑在外部已经执行
            },
            undo: async () => {
                // 撤销：重新添加事件
                componentStore.addEvent(componentId, event);
            }
        };
    };

    /**
     * 创建更新事件命令
     * @param {String} componentId - 组件 ID
     * @param {String} eventId - 事件 ID
     * @param {Object} oldEvent - 旧事件数据
     * @param {Object} newEvent - 新事件数据
     * @returns {Object} 命令对象
     */
    const createUpdateEventCommand = (componentId, eventId, oldEvent, newEvent) => {
        const component = componentStore.components.find((c) => c.id === componentId);
        const componentName = component ? component.name : componentId;

        return {
            name: `修改事件: ${componentName} - ${oldEvent.type}`,
            data: { componentId, eventId, oldEvent, newEvent },
            execute: async () => {
                // 更新事件的逻辑在外部已经执行
            },
            undo: async () => {
                // 撤销：恢复旧事件数据
                componentStore.updateEvent(componentId, eventId, oldEvent);
            }
        };
    };

    return {
        // Store 方法
        executeCommand: historyStore.executeCommand,
        undo: historyStore.undo,
        redo: historyStore.redo,
        clear: historyStore.clear,
        getHistory: historyStore.getHistory,

        // 计算属性
        canUndo: historyStore.canUndo,
        canRedo: historyStore.canRedo,
        historyCount: historyStore.historyCount,

        // 命令工厂方法
        createAddComponentCommand,
        createRemoveComponentCommand,
        createUpdateConfigCommand,
        createRenameComponentCommand,
        createAddEventCommand,
        createRemoveEventCommand,
        createUpdateEventCommand
    };
}

