/**
 * TransformController 变换控制器
 *
 * @description 基于 Three.js TransformControls 的节点变换控制器
 * @author W3D Team
 */

import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

/**
 * 变换控制器类
 *
 * @class TransformController
 */
export class TransformController {
    /**
     * 创建变换控制器实例
     *
     * @param {CanvasManager} canvasManager - 画布管理器实例
     * @param {Object} options - 配置选项
     */
    constructor(canvasManager, options = {}) {
        this.canvasManager = canvasManager;
        this.scene = canvasManager.getScene();
        this.camera = canvasManager.getCamera();
        this.renderer = canvasManager.getRenderer();

        if (!this.scene || !this.camera || !this.renderer) {
            throw new Error('TransformController: scene, camera, or renderer not available');
        }

        // 配置选项
        this.options = {
            mode: options.mode || 'translate',  // 变换模式：translate, rotate, scale
            space: options.space || 'world',    // 坐标空间：world, local
            enabled: options.enabled !== false, // 是否启用
            showX: options.showX !== false,     // 显示 X 轴
            showY: options.showY !== false,     // 显示 Y 轴
            showZ: options.showZ !== false,     // 显示 Z 轴
            size: options.size || 1,            // 控制器大小
            uniformScale: options.uniformScale !== false, // 等比例缩放（按住 Shift）
            rotationSnap: options.rotationSnap || 15,     // 旋转吸附角度（度）
            scaleMin: options.scaleMin || 0.1,            // 最小缩放
            scaleMax: options.scaleMax || 10,             // 最大缩放
            ...options
        };

        // 当前选中的对象
        this.selectedObject = null;

        // 键盘状态
        this.shiftPressed = false;

        // 绑定键盘事件
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        this.boundHandleKeyUp = this.handleKeyUp.bind(this);
        window.addEventListener('keydown', this.boundHandleKeyDown);
        window.addEventListener('keyup', this.boundHandleKeyUp);

        // 创建 TransformControls
        this.controls = new TransformControls(
            this.camera,
            this.renderer.instance.domElement
        );

        // 设置初始模式
        this.controls.setMode(this.options.mode);
        this.controls.setSpace(this.options.space);
        this.controls.setSize(this.options.size);

        // 设置轴显示
        this.controls.showX = this.options.showX;
        this.controls.showY = this.options.showY;
        this.controls.showZ = this.options.showZ;

        // 添加到场景
        this.scene.scene.add(this.controls);

        // 绑定事件
        this.setupEvents();

        // 变换状态
        this.isTransforming = false;
        this.transformStartData = null;
    }

    /**
     * 设置事件监听
     */
    setupEvents() {
        // 变换开始
        this.controls.addEventListener('dragging-changed', (event) => {
            const isDragging = event.value;

            if (isDragging) {
                // 开始变换
                this.onTransformStart();
            } else {
                // 结束变换
                this.onTransformEnd();
            }

            // 禁用/启用相机控制（如果有）
            if (this.scene.controls && this.scene.controls.instance) {
                this.scene.controls.instance.enabled = !isDragging;
            }
        });

        // 变换中
        this.controls.addEventListener('change', () => {
            if (this.isTransforming) {
                this.onTransforming();
            }
        });
    }

    /**
     * 变换开始回调
     */
    onTransformStart() {
        this.isTransforming = true;

        if (this.selectedObject) {
            // 保存变换前的状态
            this.transformStartData = {
                position: this.selectedObject.position.clone(),
                rotation: this.selectedObject.rotation.clone(),
                scale: this.selectedObject.scale.clone()
            };
        }

        // 触发自定义事件
        this.emit('transform-start', {
            object: this.selectedObject,
            mode: this.controls.mode
        });
    }

    /**
     * 变换中回调
     */
    onTransforming() {
        if (!this.selectedObject) return;

        const mode = this.controls.mode;

        // 应用旋转吸附（按住 Shift 键）
        if (mode === 'rotate' && this.shiftPressed) {
            this.applyRotationSnap();
        }

        // 应用等比例缩放（按住 Shift 键）
        if (mode === 'scale' && this.shiftPressed && this.options.uniformScale) {
            this.applyUniformScale();
        }

        // 应用缩放限制
        if (mode === 'scale') {
            this.applyScaleLimits();
        }

        // 同步节点属性
        this.syncNodeProperties();

        // 触发自定义事件
        this.emit('transforming', {
            object: this.selectedObject,
            mode: this.controls.mode,
            position: this.selectedObject.position.clone(),
            rotation: this.selectedObject.rotation.clone(),
            scale: this.selectedObject.scale.clone()
        });
    }

    /**
     * 变换结束回调
     */
    onTransformEnd() {
        this.isTransforming = false;

        if (this.selectedObject && this.transformStartData) {
            // 触发自定义事件
            this.emit('transform-end', {
                object: this.selectedObject,
                mode: this.controls.mode,
                before: this.transformStartData,
                after: {
                    position: this.selectedObject.position.clone(),
                    rotation: this.selectedObject.rotation.clone(),
                    scale: this.selectedObject.scale.clone()
                }
            });
        }

        this.transformStartData = null;
    }

    /**
     * 附加到对象
     *
     * @param {THREE.Object3D} object - 要控制的对象
     */
    attach(object) {
        if (!object) {
            console.warn('TransformController: object is null');
            return;
        }

        this.selectedObject = object;
        this.controls.attach(object);
        this.controls.visible = true;
    }

    /**
     * 分离对象
     */
    detach() {
        this.controls.detach();
        this.controls.visible = false;
        this.selectedObject = null;
    }

    /**
     * 设置变换模式
     *
     * @param {string} mode - 变换模式：translate, rotate, scale
     */
    setMode(mode) {
        if (['translate', 'rotate', 'scale'].includes(mode)) {
            this.controls.setMode(mode);
            this.options.mode = mode;
        } else {
            console.warn(`TransformController: invalid mode "${mode}"`);
        }
    }

    /**
     * 设置坐标空间
     *
     * @param {string} space - 坐标空间：world, local
     */
    setSpace(space) {
        if (['world', 'local'].includes(space)) {
            this.controls.setSpace(space);
            this.options.space = space;
        } else {
            console.warn(`TransformController: invalid space "${space}"`);
        }
    }

    /**
     * 设置控制器大小
     *
     * @param {number} size - 大小
     */
    setSize(size) {
        this.controls.setSize(size);
        this.options.size = size;
    }

    /**
     * 启用控制器
     */
    enable() {
        this.controls.enabled = true;
        this.options.enabled = true;
    }

    /**
     * 禁用控制器
     */
    disable() {
        this.controls.enabled = false;
        this.options.enabled = false;
    }

    /**
     * 显示控制器
     */
    show() {
        this.controls.visible = true;
    }

    /**
     * 隐藏控制器
     */
    hide() {
        this.controls.visible = false;
    }

    /**
     * 设置轴约束
     *
     * @param {Object} axes - 轴约束配置 { x: boolean, y: boolean, z: boolean }
     */
    setAxisConstraint(axes) {
        this.controls.showX = axes.x !== false;
        this.controls.showY = axes.y !== false;
        this.controls.showZ = axes.z !== false;
    }

    /**
     * 设置为仅 XY 平面变换（2D 模式）
     */
    set2DMode() {
        this.controls.showX = true;
        this.controls.showY = true;
        this.controls.showZ = false;
    }

    /**
     * 获取当前模式
     *
     * @returns {string} 当前变换模式
     */
    getMode() {
        return this.controls.mode;
    }

    /**
     * 获取当前选中的对象
     *
     * @returns {THREE.Object3D|null} 选中的对象
     */
    getSelectedObject() {
        return this.selectedObject;
    }

    /**
     * 触发自定义事件
     *
     * @param {string} eventName - 事件名称
     * @param {Object} data - 事件数据
     */
    emit(eventName, data) {
        // 可以在这里集成到 EventEmitter 或其他事件系统
        const event = new CustomEvent(eventName, { detail: data });
        this.controls.dispatchEvent(event);
    }

    /**
     * 监听事件
     *
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(eventName, callback) {
        this.controls.addEventListener(eventName, callback);
    }

    /**
     * 移除事件监听
     *
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    off(eventName, callback) {
        this.controls.removeEventListener(eventName, callback);
    }

    /**
     * 处理键盘按下事件
     *
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeyDown(event) {
        if (event.key === 'Shift') {
            this.shiftPressed = true;
        }
    }

    /**
     * 处理键盘释放事件
     *
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeyUp(event) {
        if (event.key === 'Shift') {
            this.shiftPressed = false;
        }
    }

    /**
     * 应用旋转吸附
     */
    applyRotationSnap() {
        if (!this.selectedObject) return;

        const snapAngle = THREE.MathUtils.degToRad(this.options.rotationSnap);

        // 吸附 Z 轴旋转（2D 模式主要使用 Z 轴）
        const currentZ = this.selectedObject.rotation.z;
        const snappedZ = Math.round(currentZ / snapAngle) * snapAngle;
        this.selectedObject.rotation.z = snappedZ;
    }

    /**
     * 应用等比例缩放
     */
    applyUniformScale() {
        if (!this.selectedObject) return;

        const scale = this.selectedObject.scale;
        // 使用 X 轴的缩放值作为基准
        const uniformScale = scale.x;
        scale.y = uniformScale;
        scale.z = uniformScale;
    }

    /**
     * 应用缩放限制
     */
    applyScaleLimits() {
        if (!this.selectedObject) return;

        const scale = this.selectedObject.scale;
        const min = this.options.scaleMin;
        const max = this.options.scaleMax;

        scale.x = Math.max(min, Math.min(max, scale.x));
        scale.y = Math.max(min, Math.min(max, scale.y));
        scale.z = Math.max(min, Math.min(max, scale.z));
    }

    /**
     * 同步节点属性
     */
    syncNodeProperties() {
        if (!this.selectedObject || !this.selectedObject.setProperty) return;

        const mode = this.controls.mode;

        if (mode === 'translate') {
            // 同步位置属性
            this.selectedObject.setProperty('x', this.selectedObject.position.x, true);
            this.selectedObject.setProperty('y', this.selectedObject.position.y, true);
        } else if (mode === 'rotate') {
            // 同步旋转属性（转换为角度）
            const rotationDeg = THREE.MathUtils.radToDeg(this.selectedObject.rotation.z);
            this.selectedObject.setProperty('rotation', rotationDeg, true);
        } else if (mode === 'scale') {
            // 同步缩放属性
            this.selectedObject.setProperty('scaleX', this.selectedObject.scale.x, true);
            this.selectedObject.setProperty('scaleY', this.selectedObject.scale.y, true);
        }
    }

    /**
     * 设置旋转吸附角度
     *
     * @param {Number} angle - 吸附角度（度）
     */
    setRotationSnap(angle) {
        this.options.rotationSnap = angle;
    }

    /**
     * 设置缩放限制
     *
     * @param {Number} min - 最小缩放
     * @param {Number} max - 最大缩放
     */
    setScaleLimits(min, max) {
        this.options.scaleMin = min;
        this.options.scaleMax = max;
    }

    /**
     * 销毁控制器
     */
    dispose() {
        // 移除键盘事件监听
        window.removeEventListener('keydown', this.boundHandleKeyDown);
        window.removeEventListener('keyup', this.boundHandleKeyUp);

        // 分离对象
        this.detach();

        // 从场景中移除
        if (this.scene && this.scene.scene) {
            this.scene.scene.remove(this.controls);
        }

        // 销毁控制器
        this.controls.dispose();

        console.log('TransformController: disposed');
    }
}

