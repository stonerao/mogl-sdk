import * as THREE from 'three';
import { EventEmitter } from '@w3d/utils';

/**
 * Component 组件基类
 *
 * @class Component
 * @extends THREE.Group
 * @description 所有组件的基类，提供统一的生命周期和事件系统
 *
 * @example
 * class MyComponent extends Component {
 *     static defaultConfig = {
 *         color: '#00ff00',
 *         size: 1
 *     }
 *
 *     onMounted() {
 *         // 组件挂载完成
 *     }
 *
 *     onUpdate(delta) {
 *         // 每帧更新
 *     }
 * }
 */
export class Component extends THREE.Group {
    /**
     * 默认配置
     * 子类可以覆盖此静态属性
     */
    static defaultConfig = {};

    /**
     * 创建组件实例
     *
     * @param {Scene} scene - 场景实例
     * @param {Object} config - 组件配置
     */
    constructor(scene, config = {}) {
        super();

        // 场景实例
        this.scene = scene;

        // 合并配置
        this.config = {
            ...this.constructor.defaultConfig,
            ...config
        };

        // 组件名称
        this.name = this.config.name || `component_${Date.now()}`;

        // 事件发射器
        this.eventEmitter = new EventEmitter();

        // 生命周期状态
        this.isMounted = false;
        this.isDisposed = false;

        // 时间相关
        this.clock = new THREE.Clock();
        this.deltaTime = 0;
    }

    /**
     * 生命周期：组件创建后
     * 子类可以覆盖此方法
     */
    onCreate() {
        // 子类实现
    }

    /**
     * 生命周期：组件挂载前
     * 子类可以覆盖此方法
     */
    onBeforeMount() {
        // 子类实现
    }

    /**
     * 生命周期：组件挂载完成
     * 子类可以覆盖此方法
     */
    onMounted() {
        // 子类实现
    }

    /**
     * 生命周期：组件更新
     * 子类可以覆盖此方法
     *
     * @param {number} delta - 时间增量
     */
    onUpdate(delta) {
        // 子类实现
    }

    /**
     * 生命周期：组件销毁前
     * 子类可以覆盖此方法
     */
    onBeforeDispose() {
        // 子类实现
    }

    /**
     * 生命周期：组件销毁
     * 子类可以覆盖此方法
     */
    onDispose() {
        // 子类实现
    }

    /**
     * 更新组件（由管理器调用）
     */
    update() {
        if (!this.isMounted || this.isDisposed) return;

        this.deltaTime = this.clock.getDelta();
        this.onUpdate(this.deltaTime);
    }

    /**
     * 更新配置
     *
     * @param {Object} newConfig - 新配置
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
        this.onConfigUpdate && this.onConfigUpdate(this.config);
    }

    /**
     * 监听事件
     *
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理函数
     */
    on(event, handler) {
        this.eventEmitter.on(event, handler);
        return this;
    }

    /**
     * 移除事件监听
     *
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理函数
     */
    off(event, handler) {
        this.eventEmitter.off(event, handler);
        return this;
    }

    /**
     * 触发事件
     *
     * @param {string} event - 事件名称
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        this.eventEmitter.emit(event, data);
        return this;
    }

    /**
     * 显示组件
     */
    show() {
        this.visible = true;
        this.emit('show');
    }

    /**
     * 隐藏组件
     */
    hide() {
        this.visible = false;
        this.emit('hide');
    }

    /**
     * 销毁组件
     */
    dispose() {
        if (this.isDisposed) return;

        // 调用销毁前钩子
        this.onBeforeDispose();

        // 标记为已销毁
        this.isDisposed = true;
        this.isMounted = false;

        // 移除所有事件监听
        this.eventEmitter.removeAllListeners();

        // 调用销毁钩子
        this.onDispose();

        // 清理 Three.js 对象
        this.clear();

        // 从父对象移除
        if (this.parent) {
            this.parent.remove(this);
        }
    }

    /**
     * 获取可交互的对象列表
     * 子类可以覆盖此方法来提供特定的交互对象
     *
     * @returns {Array<THREE.Object3D>} 可交互的对象数组
     */
    getInteractiveObjects() {
        // 默认返回组件自身（如果是 THREE.Object3D）
        return this.isMesh || this.isGroup ? [this] : [];
    }
}
