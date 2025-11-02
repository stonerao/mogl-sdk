import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useComponentStore = defineStore('component', () => {
    // 组件列表（场景中已添加的组件）
    const components = ref([]);

    // 选中的组件 ID
    const selectedComponentId = ref(null);

    // 组件计数器（用于生成唯一 ID）
    let componentCounter = 0;

    // 获取选中的组件
    const selectedComponent = computed(() => {
        return components.value.find((c) => c.id === selectedComponentId.value) || null;
    });

    // 添加组件
    const addComponent = (componentData) => {
        const component = {
            id: `component_${++componentCounter}`,
            name: componentData.name || `Component ${componentCounter}`,
            type: componentData.type,
            config: componentData.config || {},
            instance: componentData.instance || null,
            visible: true,
            locked: false,
            events: [], // 事件列表
            createdAt: Date.now()
        };

        components.value.push(component);
        return component;
    };

    // 删除组件
    const removeComponent = (componentId) => {
        const index = components.value.findIndex((c) => c.id === componentId);
        if (index !== -1) {
            const component = components.value[index];
            components.value.splice(index, 1);

            // 如果删除的是选中的组件，清除选中状态
            if (selectedComponentId.value === componentId) {
                selectedComponentId.value = null;
            }

            return component;
        }
        return null;
    };

    // 更新组件配置
    const updateComponent = (componentId, updates) => {
        const component = components.value.find((c) => c.id === componentId);
        if (component) {
            Object.assign(component, updates);
            return component;
        }
        return null;
    };

    // 更新组件实例
    const updateComponentInstance = (componentId, instance) => {
        const component = components.value.find((c) => c.id === componentId);
        if (component) {
            component.instance = instance;
            return component;
        }
        return null;
    };

    // 选中组件
    const selectComponent = (componentId) => {
        selectedComponentId.value = componentId;
    };

    // 取消选中
    const deselectComponent = () => {
        selectedComponentId.value = null;
    };

    // 切换组件可见性
    const toggleComponentVisibility = (componentId) => {
        const component = components.value.find((c) => c.id === componentId);
        if (component) {
            component.visible = !component.visible;
            return component;
        }
        return null;
    };

    // 根据类型获取组件
    const getComponentsByType = (type) => {
        return components.value.filter((c) => c.type === type);
    };

    // 根据名称获取组件
    const getComponentByName = (name) => {
        return components.value.find((c) => c.name === name);
    };

    // 清空所有组件
    const clearComponents = () => {
        components.value = [];
        selectedComponentId.value = null;
        componentCounter = 0;
    };

    // ========== 事件管理方法 ==========

    // 添加事件到组件
    const addEvent = (componentId, event) => {
        const component = components.value.find((c) => c.id === componentId);
        if (component) {
            if (!component.events) {
                component.events = [];
            }
            component.events.push(event);
            return event;
        }
        return null;
    };

    // 移除组件的事件
    const removeEvent = (componentId, eventId) => {
        const component = components.value.find((c) => c.id === componentId);
        if (component && component.events) {
            const index = component.events.findIndex((e) => e.id === eventId);
            if (index !== -1) {
                const event = component.events[index];
                component.events.splice(index, 1);
                return event;
            }
        }
        return null;
    };

    // 更新组件的事件
    const updateEvent = (componentId, eventId, updates) => {
        const component = components.value.find((c) => c.id === componentId);
        if (component && component.events) {
            const event = component.events.find((e) => e.id === eventId);
            if (event) {
                Object.assign(event, updates);
                return event;
            }
        }
        return null;
    };

    // 获取组件的所有事件
    const getComponentEvents = (componentId) => {
        const component = components.value.find((c) => c.id === componentId);
        return component?.events || [];
    };

    return {
        // 状态
        components,
        selectedComponentId,
        selectedComponent,

        // 组件方法
        addComponent,
        removeComponent,
        updateComponent,
        updateComponentInstance,
        selectComponent,
        deselectComponent,
        toggleComponentVisibility,
        getComponentsByType,
        getComponentByName,
        clearComponents,

        // 事件方法
        addEvent,
        removeEvent,
        updateEvent,
        getComponentEvents
    };
});

