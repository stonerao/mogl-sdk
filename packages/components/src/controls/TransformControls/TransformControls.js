import { Component } from '@w3d/core';
import { TransformControls as ThreeTransformControls } from 'three/examples/jsm/controls/TransformControls.js';

/**
 * TransformControls 变换控制组件
 *
 * 提供对3D物体的交互式变换控制（平移、旋转、缩放）
 *
 * @class TransformControls
 * @extends Component
 *
 * @example
 * // 注册组件
 * scene.registerComponent('TransformControls', TransformControls);
 *
 * // 创建变换控制器
 * const transformControls = await scene.add('TransformControls', {
 *     name: 'transform',
 *     mode: 'translate',
 *     size: 1,
 *     space: 'world'
 * });
 *
 * // 附加到物体
 * transformControls.attach(mesh);
 *
 * // 切换模式
 * transformControls.setMode('rotate');
 * transformControls.setMode('scale');
 *
 * // 启用/禁用
 * transformControls.setEnabled(true);
 * transformControls.setEnabled(false);
 */
export class TransformControls extends Component {
    /**
     * 默认配置
     */
    static defaultConfig = {
        mode: 'translate',      // 变换模式: 'translate' | 'rotate' | 'scale'
        size: 1,                // 控制器大小
        space: 'world',         // 坐标空间: 'world' | 'local'
        enabled: true,          // 是否启用
        showX: true,            // 显示X轴
        showY: true,            // 显示Y轴
        showZ: true,            // 显示Z轴
        translationSnap: null,  // 平移吸附
        rotationSnap: null,     // 旋转吸附
        scaleSnap: null,        // 缩放吸附
        disableOrbitOnDrag: true // 拖拽时禁用轨道控制器
    };

    /**
     * 创建组件
     */
    onCreate() {
        // Three.js TransformControls 实例
        this.control = null;

        // 当前附加的物体
        this.attachedObject = null;

        // 事件处理器引用
        this.eventHandlers = {
            change: null,
            draggingChanged: null,
            objectChange: null,
            mouseDown: null,
            mouseUp: null
        };
    }

    /**
     * 组件挂载完成
     */
    onMounted() {
        // 创建 TransformControls
        this.control = new ThreeTransformControls(
            this.scene.camera.instance,
            this.scene.renderer.instance.domElement
        );
        // 应用配置
        this.applyConfig();

        	const gizmo =  this.control.getHelper();
        this.scene.scene.add( gizmo );

        // 添加scene
        // this.scene.scene.add(this.control);

        // 设置事件监听
        this.setupEventListeners();

        // 触发挂载事件
        this.emit('mounted', { control: this.control });
    }

    /**
     * 应用配置
     */
    applyConfig() {
        if (!this.control) return;

        const {
            mode,
            size,
            space,
            enabled,
            showX,
            showY,
            showZ,
            translationSnap,
            rotationSnap,
            scaleSnap
        } = this.config;

        this.control.setMode(mode);
        this.control.setSize(size);
        this.control.setSpace(space);
        this.control.enabled = enabled;
        this.control.showX = showX;
        this.control.showY = showY;
        this.control.showZ = showZ;

        if (translationSnap !== null) {
            this.control.setTranslationSnap(translationSnap);
        }
        if (rotationSnap !== null) {
            this.control.setRotationSnap(rotationSnap);
        }
        if (scaleSnap !== null) {
            this.control.setScaleSnap(scaleSnap);
        }
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        if (!this.control) return;

        // 变换改变事件
        this.eventHandlers.change = (event) => {
            this.emit('change', {
                object: this.attachedObject,
                control: this.control
            });
        };
        this.control.addEventListener('change', this.eventHandlers.change);

        // 拖拽状态改变事件
        this.eventHandlers.draggingChanged = (event) => {
            const isDragging = event.value;

            // 如果配置了禁用轨道控制器
            if (this.config.disableOrbitOnDrag && this.scene.controls) {
                this.scene.controls.instance.enabled = !isDragging;
            }

            this.emit('dragging-changed', {
                dragging: isDragging,
                object: this.attachedObject
            });
        };
        this.control.addEventListener('dragging-changed', this.eventHandlers.draggingChanged);

        // 物体变换事件
        this.eventHandlers.objectChange = () => {
            this.emit('object-change', {
                object: this.attachedObject,
                position: this.attachedObject?.position.toArray(),
                rotation: this.attachedObject?.rotation.toArray(),
                scale: this.attachedObject?.scale.toArray()
            });
        };
        this.control.addEventListener('objectChange', this.eventHandlers.objectChange);

        // 鼠标按下事件
        this.eventHandlers.mouseDown = () => {
            this.emit('mouse-down', {
                object: this.attachedObject
            });
        };
        this.control.addEventListener('mouseDown', this.eventHandlers.mouseDown);

        // 鼠标抬起事件
        this.eventHandlers.mouseUp = () => {
            this.emit('mouse-up', {
                object: this.attachedObject
            });
        };
        this.control.addEventListener('mouseUp', this.eventHandlers.mouseUp);
    }

    /**
     * 附加到物体
     * @param {THREE.Object3D} object - 要控制的3D物体
     */
    attach(object) {
        if (!this.control) {
            console.warn('TransformControls: Control not initialized');
            return;
        }

        if (!object) {
            console.warn('TransformControls: Object is null or undefined');
            return;
        }

        this.attachedObject = object;
        this.control.attach(object);

        this.emit('attached', { object });
    }

    /**
     * 分离当前物体
     */
    detach() {
        if (!this.control) return;

        const previousObject = this.attachedObject;
        this.control.detach();
        this.attachedObject = null;

        this.emit('detached', { object: previousObject });
    }

    /**
     * 设置变换模式
     * @param {string} mode - 'translate' | 'rotate' | 'scale'
     */
    setMode(mode) {
        if (!this.control) return;

        const validModes = ['translate', 'rotate', 'scale'];
        if (!validModes.includes(mode)) {
            console.warn(`TransformControls: Invalid mode "${mode}". Valid modes: ${validModes.join(', ')}`);
            return;
        }

        this.control.setMode(mode);
        this.config.mode = mode;

        this.emit('mode-changed', { mode });
    }

    /**
     * 设置启用/禁用状态
     * @param {boolean} enabled - 是否启用
     */
    setEnabled(enabled) {
        if (!this.control) return;

        this.control.enabled = enabled;
        this.config.enabled = enabled;

        this.emit('enabled-changed', { enabled });
    }

    /**
     * 设置坐标空间
     * @param {string} space - 'world' | 'local'
     */
    setSpace(space) {
        if (!this.control) return;

        const validSpaces = ['world', 'local'];
        if (!validSpaces.includes(space)) {
            console.warn(`TransformControls: Invalid space "${space}". Valid spaces: ${validSpaces.join(', ')}`);
            return;
        }

        this.control.setSpace(space);
        this.config.space = space;

        this.emit('space-changed', { space });
    }

    /**
     * 设置控制器大小
     * @param {number} size - 大小值
     */
    setSize(size) {
        if (!this.control) return;

        this.control.setSize(size);
        this.config.size = size;

        this.emit('size-changed', { size });
    }

    /**
     * 设置平移吸附
     * @param {number|null} snap - 吸附值，null 表示禁用
     */
    setTranslationSnap(snap) {
        if (!this.control) return;

        this.control.setTranslationSnap(snap);
        this.config.translationSnap = snap;

        this.emit('translation-snap-changed', { snap });
    }

    /**
     * 设置旋转吸附
     * @param {number|null} snap - 吸附值（弧度），null 表示禁用
     */
    setRotationSnap(snap) {
        if (!this.control) return;

        this.control.setRotationSnap(snap);
        this.config.rotationSnap = snap;

        this.emit('rotation-snap-changed', { snap });
    }

    /**
     * 设置缩放吸附
     * @param {number|null} snap - 吸附值，null 表示禁用
     */
    setScaleSnap(snap) {
        if (!this.control) return;

        this.control.setScaleSnap(snap);
        this.config.scaleSnap = snap;

        this.emit('scale-snap-changed', { snap });
    }

    /**
     * 设置轴显示
     * @param {string} axis - 'x' | 'y' | 'z'
     * @param {boolean} show - 是否显示
     */
    setAxisVisible(axis, show) {
        if (!this.control) return;

        const axisLower = axis.toLowerCase();
        if (axisLower === 'x') {
            this.control.showX = show;
            this.config.showX = show;
        } else if (axisLower === 'y') {
            this.control.showY = show;
            this.config.showY = show;
        } else if (axisLower === 'z') {
            this.control.showZ = show;
            this.config.showZ = show;
        }

        this.emit('axis-visibility-changed', { axis, show });
    }

    /**
     * 重置变换
     */
    reset() {
        if (!this.control) return;

        this.control.reset();

        this.emit('reset');
    }

    /**
     * 获取当前模式
     * @returns {string} 当前模式
     */
    getMode() {
        return this.control?.mode || this.config.mode;
    }

    /**
     * 获取当前空间
     * @returns {string} 当前空间
     */
    getSpace() {
        return this.control?.space || this.config.space;
    }

    /**
     * 获取当前附加的物体
     * @returns {THREE.Object3D|null} 附加的物体
     */
    getAttachedObject() {
        return this.attachedObject;
    }

    /**
     * 获取控制器实例
     * @returns {TransformControls} Three.js TransformControls 实例
     */
    getControl() {
        return this.control;
    }

    /**
     * 组件销毁
     */
    onDispose() {
        // 移除事件监听
        if (this.control) {
            Object.keys(this.eventHandlers).forEach(key => {
                if (this.eventHandlers[key]) {
                    this.control.removeEventListener(key, this.eventHandlers[key]);
                }
            });

            // 分离物体
            this.detach();

            // 销毁控制器
            this.control.dispose();
            this.control = null;
        }

        this.attachedObject = null;
        this.eventHandlers = {};
    }
}

export default TransformControls;
