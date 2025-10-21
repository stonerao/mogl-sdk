import { TransformControls as ThreeTransformControls } from 'three/examples/jsm/controls/TransformControls';

/**
 * TransformControls 管理器
 * 用于在场景中添加可视化的变换控制器
 * 支持移动 (translate)、旋转 (rotate)、缩放 (scale) 三种模式
 */
class TransformControlsManager {
    /**
     * 构造函数
     * @param {THREE.Scene} scene - Three.js 场景
     * @param {THREE.Camera} camera - Three.js 相机
     * @param {HTMLElement} domElement - 渲染器的 DOM 元素
     */
    constructor(scene, camera, domElement) {
        if (!scene || !camera || !domElement) {
            throw new Error('[TransformControlsManager] scene, camera, domElement 都是必需的');
        }

        this.scene = scene;
        this.camera = camera;
        this.domElement = domElement;

        // 创建 TransformControls 实例
        this.controls = new ThreeTransformControls(camera, domElement);
        
        // 默认设置
        this.controls.setMode('translate'); // 默认为移动模式
        this.controls.setSpace('world'); // 世界坐标系
        this.controls.setSize(1); // 控制器大小
        
        // 添加到场景
        this.scene.add(this.controls);

        // 当前附加的对象
        this.attachedObject = null;

        // 事件监听器
        this.eventListeners = {
            'dragging-changed': [],
            'objectChange': [],
            'mouseDown': [],
            'mouseUp': []
        };

        // 绑定内部事件
        this._bindEvents();

        console.log('[TransformControlsManager] 初始化完成');
    }

    /**
     * 绑定内部事件
     * @private
     */
    _bindEvents() {
        // 拖拽状态变化事件
        this.controls.addEventListener('dragging-changed', (event) => {
            this._triggerEvent('dragging-changed', event);
        });

        // 对象变换事件
        this.controls.addEventListener('objectChange', (event) => {
            this._triggerEvent('objectChange', event);
        });

        // 鼠标按下事件
        this.controls.addEventListener('mouseDown', (event) => {
            this._triggerEvent('mouseDown', event);
        });

        // 鼠标释放事件
        this.controls.addEventListener('mouseUp', (event) => {
            this._triggerEvent('mouseUp', event);
        });
    }

    /**
     * 触发事件
     * @private
     * @param {string} eventName - 事件名称
     * @param {Object} event - 事件对象
     */
    _triggerEvent(eventName, event) {
        const listeners = this.eventListeners[eventName];
        if (listeners) {
            listeners.forEach((callback) => callback(event));
        }
    }

    /**
     * 添加事件监听器
     * @param {string} eventName - 事件名称 ('dragging-changed' | 'objectChange' | 'mouseDown' | 'mouseUp')
     * @param {Function} callback - 回调函数
     */
    addEventListener(eventName, callback) {
        if (!this.eventListeners[eventName]) {
            console.warn(`[TransformControlsManager] 未知的事件类型: ${eventName}`);
            return;
        }

        this.eventListeners[eventName].push(callback);
    }

    /**
     * 移除事件监听器
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    removeEventListener(eventName, callback) {
        if (!this.eventListeners[eventName]) {
            return;
        }

        const index = this.eventListeners[eventName].indexOf(callback);
        if (index !== -1) {
            this.eventListeners[eventName].splice(index, 1);
        }
    }

    /**
     * 将控制器附加到指定的 Three.js 对象
     * @param {THREE.Object3D} object - Three.js 对象
     */
    attach(object) {
        if (!object) {
            console.warn('[TransformControlsManager] attach: object 为空');
            return;
        }

        this.controls.attach(object);
        this.attachedObject = object;
        console.log('[TransformControlsManager] 已附加到对象:', object.name || object.uuid);
    }

    /**
     * 分离控制器
     */
    detach() {
        this.controls.detach();
        this.attachedObject = null;
        console.log('[TransformControlsManager] 已分离控制器');
    }

    /**
     * 设置变换模式
     * @param {string} mode - 模式 ('translate' | 'rotate' | 'scale')
     */
    setMode(mode) {
        const validModes = ['translate', 'rotate', 'scale'];
        if (!validModes.includes(mode)) {
            console.warn(`[TransformControlsManager] 无效的模式: ${mode}`);
            return;
        }

        this.controls.setMode(mode);
        console.log(`[TransformControlsManager] 模式已切换为: ${mode}`);
    }

    /**
     * 获取当前模式
     * @returns {string} 当前模式
     */
    getMode() {
        return this.controls.mode;
    }

    /**
     * 设置坐标空间
     * @param {string} space - 坐标空间 ('world' | 'local')
     */
    setSpace(space) {
        const validSpaces = ['world', 'local'];
        if (!validSpaces.includes(space)) {
            console.warn(`[TransformControlsManager] 无效的坐标空间: ${space}`);
            return;
        }

        this.controls.setSpace(space);
        console.log(`[TransformControlsManager] 坐标空间已切换为: ${space}`);
    }

    /**
     * 获取当前坐标空间
     * @returns {string} 当前坐标空间
     */
    getSpace() {
        return this.controls.space;
    }

    /**
     * 设置控制器大小
     * @param {number} size - 大小
     */
    setSize(size) {
        this.controls.setSize(size);
    }

    /**
     * 启用/禁用控制器
     * @param {boolean} enabled - 是否启用
     */
    setEnabled(enabled) {
        this.controls.enabled = enabled;
        console.log(`[TransformControlsManager] 控制器已${enabled ? '启用' : '禁用'}`);
    }

    /**
     * 获取控制器启用状态
     * @returns {boolean} 是否启用
     */
    isEnabled() {
        return this.controls.enabled;
    }

    /**
     * 显示/隐藏控制器
     * @param {boolean} visible - 是否可见
     */
    setVisible(visible) {
        this.controls.visible = visible;
    }

    /**
     * 获取控制器可见性
     * @returns {boolean} 是否可见
     */
    isVisible() {
        return this.controls.visible;
    }

    /**
     * 获取当前附加的对象
     * @returns {THREE.Object3D|null} 附加的对象
     */
    getAttachedObject() {
        return this.attachedObject;
    }

    /**
     * 获取 Three.js TransformControls 实例
     * @returns {ThreeTransformControls} TransformControls 实例
     */
    getInstance() {
        return this.controls;
    }

    /**
     * 清理资源
     */
    dispose() {
        // 分离对象
        this.detach();

        // 从场景中移除
        this.scene.remove(this.controls);

        // 清理事件监听器
        Object.keys(this.eventListeners).forEach((eventName) => {
            this.eventListeners[eventName] = [];
        });

        // 释放 TransformControls 资源
        this.controls.dispose();

        console.log('[TransformControlsManager] 已清理资源');
    }
}

export default TransformControlsManager;

