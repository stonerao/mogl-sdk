/**
 * ComponentManager 组件管理器
 *
 * @class ComponentManager
 * @description 管理场景中的所有组件
 */
export class ComponentManager {
    /**
     * 创建组件管理器实例
     *
     * @param {Scene} scene - 场景实例
     */
    constructor(scene) {
        this.scene = scene;

        // 组件注册表
        this.registry = new Map();

        // 组件实例
        this.components = new Map();
    }

    /**
     * 注册组件类
     *
     * @param {string} name - 组件名称
     * @param {Class} ComponentClass - 组件类
     */
    register(name, ComponentClass) {
        if (this.registry.has(name)) {
            console.warn(`Component "${name}" already registered`);
            return;
        }

        this.registry.set(name, ComponentClass);
    }

    /**
     * 添加组件
     *
     * @param {string} componentName - 组件名称
     * @param {Object} config - 组件配置
     * @returns {Promise<Component>} 组件实例
     */
    async add(componentName, config = {}) {
        // 获取组件类
        const ComponentClass = this.registry.get(componentName);

        if (!ComponentClass) {
            throw new Error(`Component "${componentName}" not registered`);
        }

        // 创建组件实例
        const component = new ComponentClass(this.scene, config);

        // 调用创建钩子
        component.onCreate();

        // 调用挂载前钩子
        component.onBeforeMount();

        // 添加到场景
        this.scene.scene.add(component);

        // 标记为已挂载
        component.isMounted = true;

        // 调用挂载完成钩子（等待异步完成）
        await component.onMounted();

        // 保存组件实例
        const name = config.name || component.name;
        this.components.set(name, component);

        return component;
    }

    /**
     * 获取组件
     *
     * @param {string} name - 组件名称
     * @returns {Component|null} 组件实例
     */
    get(name) {
        return this.components.get(name) || null;
    }

    /**
     * 移除组件
     *
     * @param {string} name - 组件名称
     */
    remove(name) {
        const component = this.components.get(name);

        if (component) {
            component.dispose();
            this.components.delete(name);
        }
    }

    /**
     * 更新所有组件
     */
    update() {
        this.components.forEach((component) => {
            component.update();
        });
    }

    /**
     * 获取所有组件
     *
     * @returns {Array<Component>} 组件数组
     */
    getAll() {
        return Array.from(this.components.values());
    }

    /**
     * 销毁所有组件
     */
    dispose() {
        this.components.forEach((component) => {
            component.dispose();
        });

        this.components.clear();
        this.registry.clear();
    }
}
