import { useSceneStore } from '@/stores/useSceneStore';
import { useComponentStore } from '@/stores/useComponentStore';
import { getComponent } from '@/utils/componentRegistry';

/**
 * 组件操作组合式函数
 */
export function useComponent() {
    const sceneStore = useSceneStore();
    const componentStore = useComponentStore();

    /**
     * 添加组件到场景
     * @param {string} type - 组件类型
     * @param {Object} config - 组件配置
     * @returns {Promise<Object>} 组件数据
     */
    const addComponent = async (type, config = {}) => {
        const scene = sceneStore.sceneInstance;
        if (!scene) {
            throw new Error('Scene not initialized');
        }

        try {
            // 获取组件信息
            const componentInfo = getComponent(type);
            if (!componentInfo) {
                throw new Error(`Component type "${type}" not found`);
            }

            // 生成唯一名称
            const name = config.name || `${type}_${Date.now()}`;

            // 合并默认配置
            const finalConfig = {
                ...componentInfo.metadata.defaultConfig,
                ...config,
                name
            };

            // 添加到场景
            const instance = await scene.add(type, finalConfig);

            // 保存到组件 store
            const componentData = componentStore.addComponent({
                name,
                type,
                config: finalConfig,
                instance
            });

            // 自动选中新添加的组件
            componentStore.selectComponent(componentData.id);

            console.log(`Component added: ${type}`, componentData);

            return componentData;
        } catch (error) {
            console.error('Failed to add component:', error);
            throw error;
        }
    };

    /**
     * 删除组件
     * @param {string} componentId - 组件 ID
     */
    const removeComponent = (componentId) => {
        const scene = sceneStore.sceneInstance;
        if (!scene) {
            throw new Error('Scene not initialized');
        }

        try {
            const component = componentStore.components.find((c) => c.id === componentId);
            if (!component) {
                throw new Error(`Component not found: ${componentId}`);
            }

            // 从场景中移除
            scene.remove(component.name);

            // 从 store 中移除
            componentStore.removeComponent(componentId);

            console.log(`Component removed: ${component.name}`);
        } catch (error) {
            console.error('Failed to remove component:', error);
            throw error;
        }
    };

    /**
     * 更新组件配置
     * @param {string} componentId - 组件 ID
     * @param {Object} config - 新配置
     */
    const updateComponentConfig = async (componentId, config) => {
        const component = componentStore.components.find((c) => c.id === componentId);
        if (!component) {
            throw new Error(`Component not found: ${componentId}`);
        }

        try {
            // 合并新配置到现有配置
            const newConfig = { ...component.config, ...config };

            // 更新组件实例（如果实例存在）
            if (component.instance && component.instance.updateConfig) {
                // 调用组件的 updateConfig 方法，让组件自己处理属性更新
                // 这是最正确的方式，因为不同组件可能有不同的更新逻辑
                await component.instance.updateConfig(config);
            }

            // 更新 store 中的配置
            componentStore.updateComponent(componentId, { config: newConfig });

            console.log(`Component config updated: ${component.name}`, config);
        } catch (error) {
            console.error('Failed to update component config:', error);
            throw error;
        }
    };

    /**
     * 选中组件
     * @param {string} componentId - 组件 ID
     */
    const selectComponent = (componentId) => {
        componentStore.selectComponent(componentId);

        // TODO: 在场景中高亮显示选中的组件
        const component = componentStore.components.find((c) => c.id === componentId);
        if (component && component.instance) {
            console.log(`Component selected: ${component.name}`);
        }
    };

    /**
     * 取消选中组件
     */
    const deselectComponent = () => {
        componentStore.deselectComponent();
    };

    /**
     * 切换组件可见性
     * @param {string} componentId - 组件 ID
     */
    const toggleComponentVisibility = (componentId) => {
        const component = componentStore.toggleComponentVisibility(componentId);
        if (component && component.instance) {
            component.instance.visible = component.visible;
            console.log(`Component visibility toggled: ${component.name} -> ${component.visible}`);
        }
    };

    /**
     * 获取组件列表
     * @returns {Array} 组件列表
     */
    const getComponents = () => {
        return componentStore.components;
    };

    /**
     * 获取选中的组件
     * @returns {Object|null} 选中的组件
     */
    const getSelectedComponent = () => {
        return componentStore.selectedComponent;
    };

    /**
     * 清空所有组件
     */
    const clearAllComponents = () => {
        const scene = sceneStore.sceneInstance;
        if (scene) {
            // 从场景中移除所有组件
            componentStore.components.forEach((component) => {
                try {
                    scene.remove(component.name);
                } catch (error) {
                    console.error(`Failed to remove component: ${component.name}`, error);
                }
            });
        }

        // 清空 store
        componentStore.clearComponents();
    };

    return {
        // 状态
        components: componentStore.components,
        selectedComponent: componentStore.selectedComponent,

        // 方法
        addComponent,
        removeComponent,
        updateComponentConfig,
        selectComponent,
        deselectComponent,
        toggleComponentVisibility,
        getComponents,
        getSelectedComponent,
        clearAllComponents
    };
}

