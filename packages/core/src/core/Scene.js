import * as THREE from 'three';
import { Renderer } from './Renderer.js';
import { Camera } from './Camera.js';
import { Controls } from './Controls.js';
import { Light } from './Light.js';
import { ComponentManager } from '../component/ComponentManager.js';
import { EventSystem } from '../event/EventSystem.js';
import { ResourceManager } from '../resource/ResourceManager.js';
import { AnimationManager } from '../animation/AnimationManager.js';

/**
 * Scene 场景类
 *
 * @class Scene
 * @description 场景的创建、初始化和管理，是整个 SDK 的入口类
 *
 * @example
 * const scene = new Scene('#app')
 *     .camera({ position: [0, 100, 200] })
 *     .light('ambient', { color: '#fff', intensity: 0.8 })
 *     .init();
 */
export class Scene {
    /**
     * 创建场景实例
     *
     * @param {string|HTMLElement} container - 容器选择器或 DOM 元素
     * @param {Object} options - 配置选项
     */
    constructor(container, options = {}) {
        // 容器元素
        this.container =
            typeof container === 'string' ? document.querySelector(container) : container;

        if (!this.container) {
            throw new Error('Container not found');
        }
        // 配置选项
        this.options = Object.assign(
            {
                isRendering: true
            },
            options
        );

        // Three.js 场景
        this.scene = new THREE.Scene();

        // 核心模块
        this.renderer = null;
        this.camera = null;
        this.controls = null;
        this.light = null;
        console.log(options);
        // 管理器
        this.componentManager = new ComponentManager(this);
        this.eventSystem = new EventSystem(this);
        this.resourceManager = new ResourceManager(this);
        this.animationManager = new AnimationManager(this);

        // 状态
        this.isInitialized = false;
        this.isRunning = false;

        // 动画帧 ID
        this.animationFrameId = null;
    }

    /**
     * 初始化场景
     *
     * @returns {Scene} 返回自身，支持链式调用
     */
    init() {
        if (this.isInitialized) {
            console.warn('Scene already initialized');
            return this;
        }

        // 初始化渲染器
        if (!this.renderer) {
            this.renderer = new Renderer(this, this.options.renderer);
        }

        // 初始化相机
        if (!this.camera) {
            this.camera = new Camera(this, this.options.camera);
        }

        // 初始化控制器
        if (!this.controls) {
            this.controls = new Controls(this, this.options.controls);
        }

        // 初始化灯光
        if (!this.light) {
            this.light = new Light(this, this.options.lights);
        }

        // 初始化事件系统（在 renderer 创建后）
        this.eventSystem.init();

        // 标记为已初始化
        this.isInitialized = true;

        // 开始渲染循环
        this.start();

        return this;
    }

    /**
     * 开始渲染循环
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.animate();
    }

    /**
     * 停止渲染循环
     */
    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * 动画循环
     */
    animate() {
        if (!this.isRunning) return;

        this.animationFrameId = requestAnimationFrame(() => this.animate());

        // 更新动画管理器
        this.animationManager.update();

        // 更新组件
        this.componentManager.update();

        // 更新控制器
        if (this.controls) {
            this.controls.update();
        }

        // 渲染场景
        if (this.renderer && this.camera && this.options.isRendering) {
            this.renderer.render(this.scene, this.camera.instance);
        }
    }

    /**
     * 添加组件
     *
     * @param {string} componentName - 组件名称
     * @param {Object} config - 组件配置
     * @returns {Promise<Component>} 组件实例
     */
    async add(componentName, config = {}) {
        return this.componentManager.add(componentName, config);
    }

    /**
     * 获取组件
     *
     * @param {string} name - 组件名称
     * @returns {Component|null} 组件实例
     */
    get(name) {
        return this.componentManager.get(name);
    }

    /**
     * 移除组件
     *
     * @param {string} name - 组件名称
     */
    remove(name) {
        this.componentManager.remove(name);
    }

    /**
     * 注册组件
     *
     * @param {string} name - 组件名称
     * @param {Class} ComponentClass - 组件类
     */
    registerComponent(name, ComponentClass) {
        this.componentManager.register(name, ComponentClass);
    }

    /**
     * 销毁场景
     */
    dispose() {
        // 停止渲染
        this.stop();

        // 销毁组件
        this.componentManager.dispose();

        // 销毁事件系统
        this.eventSystem.dispose();

        // 销毁资源管理器
        this.resourceManager.dispose();

        // 销毁动画管理器
        this.animationManager.dispose();

        // 销毁渲染器
        if (this.renderer) {
            this.renderer.dispose();
        }

        // 清空场景
        this.scene.clear();

        // 标记为未初始化
        this.isInitialized = false;
    }
}
