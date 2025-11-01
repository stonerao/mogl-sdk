/**
 * CanvasManager 画布管理器
 *
 * @description 基于 @w3d/core Scene 的画布管理器，负责初始化 3D 场景、相机、渲染器等
 * @author W3D Team
 */

import * as THREE from 'three';
import { Scene } from '@w3d/core';

/**
 * 画布管理器类
 *
 * @class CanvasManager
 */
export class CanvasManager {
    /**
     * 创建画布管理器实例
     *
     * @param {HTMLElement} container - 画布容器 DOM 元素
     * @param {Object} options - 配置选项
     * @param {Object} options.canvasStore - Canvas Store 实例（用于状态同步）
     * @param {Object} options.editorStore - Editor Store 实例（用于状态同步）
     */
    constructor(container, options = {}) {
        if (!container) {
            throw new Error('CanvasManager: container is required');
        }

        this.container = container;
        this.options = options;

        // Store 实例
        this.canvasStore = options.canvasStore;
        this.editorStore = options.editorStore;

        // W3D Scene 实例
        this.scene = null;

        // 正交相机实例（覆盖默认的透视相机）
        this.orthographicCamera = null;

        // 是否已初始化
        this.isInitialized = false;

        // 辅助对象
        this.helpers = {
            grid: null,
            axes: null
        };
    }

    /**
     * 初始化画布
     *
     * @returns {Promise<CanvasManager>} 返回自身，支持链式调用
     */
    async init() {
        if (this.isInitialized) {
            console.warn('CanvasManager: already initialized');
            return this;
        }

        try {
            // 1. 创建 W3D Scene 实例
            this.scene = new Scene(this.container, {
                isRendering: true,  // 启用自动渲染
                isResize: false,    // 禁用自动 resize（我们手动控制）
                renderer: {
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance'
                }
            });

            // 2. 初始化场景（这会创建默认的透视相机）
            await this.scene.init();

            // 3. 替换为正交相机
            this.setupOrthographicCamera();

            // 4. 设置背景色
            this.setBackgroundColor(this.canvasStore?.backgroundColor || '#1e1e1e');

            // 5. 禁用默认控制器（我们使用自定义的平移和缩放）
            if (this.scene.controls) {
                this.scene.controls.instance.enabled = false;
            }

            // 6. 设置初始画布尺寸
            this.resize();

            // 7. 标记为已初始化
            this.isInitialized = true;

            console.log('CanvasManager: initialized successfully');
            return this;
        } catch (error) {
            console.error('CanvasManager: initialization failed', error);
            throw error;
        }
    }

    /**
     * 设置正交相机
     *
     * @description 替换默认的透视相机为正交相机，适用于 2D 组态编辑
     */
    setupOrthographicCamera() {
        if (!this.scene) {
            console.warn('CanvasManager: scene not initialized');
            return;
        }

        // 获取容器尺寸
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // 计算正交相机的视口范围
        const aspect = width / height;
        const viewSize = 1000; // 视口大小（可以根据需要调整）

        const left = -viewSize * aspect / 2;
        const right = viewSize * aspect / 2;
        const top = viewSize / 2;
        const bottom = -viewSize / 2;

        // 创建正交相机
        this.orthographicCamera = new THREE.OrthographicCamera(
            left,
            right,
            top,
            bottom,
            0.1,    // near
            10000   // far
        );

        // 设置相机位置（从上方俯视）
        this.orthographicCamera.position.set(0, 0, 1000);
        this.orthographicCamera.lookAt(0, 0, 0);
        this.orthographicCamera.up.set(0, 1, 0);

        // 移除旧相机
        if (this.scene.camera && this.scene.camera.instance) {
            this.scene.scene.remove(this.scene.camera.instance);
        }

        // 替换相机实例
        this.scene.camera.instance = this.orthographicCamera;
        this.scene.scene.add(this.orthographicCamera);

        console.log('CanvasManager: orthographic camera setup complete');
    }

    /**
     * 设置背景颜色
     *
     * @param {string|number} color - 颜色值
     */
    setBackgroundColor(color) {
        if (this.scene && this.scene.renderer) {
            this.scene.renderer.setBackground(color);
        }
    }

    /**
     * 调整画布尺寸
     *
     * @param {number} width - 宽度（可选，默认使用容器宽度）
     * @param {number} height - 高度（可选，默认使用容器高度）
     */
    resize(width, height) {
        if (!this.scene || !this.scene.renderer) {
            return;
        }

        // 使用传入的尺寸或容器尺寸
        const w = width || this.container.clientWidth;
        const h = height || this.container.clientHeight;

        // 更新渲染器尺寸
        this.scene.renderer.instance.setSize(w, h);

        // 更新正交相机
        if (this.orthographicCamera) {
            const aspect = w / h;
            const viewSize = 1000;

            this.orthographicCamera.left = -viewSize * aspect / 2;
            this.orthographicCamera.right = viewSize * aspect / 2;
            this.orthographicCamera.top = viewSize / 2;
            this.orthographicCamera.bottom = -viewSize / 2;

            this.orthographicCamera.updateProjectionMatrix();
        }

        // 更新 Store 中的容器尺寸
        if (this.canvasStore) {
            this.canvasStore.setContainerSize(w, h);
        }

        console.log(`CanvasManager: resized to ${w}x${h}`);
    }

    /**
     * 设置缩放级别
     *
     * @param {number} zoom - 缩放级别（1.0 为原始大小）
     * @param {Object} center - 缩放中心点（可选）
     */
    setZoom(zoom, center = null) {
        if (!this.orthographicCamera) {
            return;
        }

        // 限制缩放范围
        const minZoom = this.canvasStore?.minZoom || 0.1;
        const maxZoom = this.canvasStore?.maxZoom || 5.0;
        const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom));

        // 计算缩放比例
        const scale = 1 / clampedZoom;

        // 更新相机视口
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        const aspect = width / height;
        const viewSize = 1000 * scale;

        this.orthographicCamera.left = -viewSize * aspect / 2;
        this.orthographicCamera.right = viewSize * aspect / 2;
        this.orthographicCamera.top = viewSize / 2;
        this.orthographicCamera.bottom = -viewSize / 2;

        this.orthographicCamera.updateProjectionMatrix();

        // 更新 Store
        if (this.canvasStore) {
            this.canvasStore.setZoom(clampedZoom);
        }
    }

    /**
     * 设置平移偏移
     *
     * @param {number} x - X 轴偏移
     * @param {number} y - Y 轴偏移
     */
    setPan(x, y) {
        if (!this.orthographicCamera) {
            return;
        }

        // 更新相机位置
        // 注意：相机移动方向与视觉效果相反
        this.orthographicCamera.position.x = -x;
        this.orthographicCamera.position.y = -y;

        // 更新 Store
        if (this.canvasStore) {
            this.canvasStore.setPanOffset(x, y);
        }
    }

    /**
     * 屏幕坐标转世界坐标
     *
     * @param {number} screenX - 屏幕 X 坐标（相对于容器）
     * @param {number} screenY - 屏幕 Y 坐标（相对于容器）
     * @returns {Object} 世界坐标 { x, y, z }
     */
    screenToWorld(screenX, screenY) {
        if (!this.orthographicCamera || !this.container) {
            console.warn('CanvasManager: camera or container not initialized');
            return { x: 0, y: 0, z: 0 };
        }

        // 获取容器尺寸
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // 将屏幕坐标转换为 NDC（归一化设备坐标）
        // NDC 范围是 [-1, 1]
        const ndcX = (screenX / width) * 2 - 1;
        const ndcY = -(screenY / height) * 2 + 1; // Y 轴反转

        // 创建射线
        const vector = new THREE.Vector3(ndcX, ndcY, 0);
        vector.unproject(this.orthographicCamera);

        // 对于正交相机，射线方向是固定的（沿着 -Z 轴）
        // 我们需要找到射线与 Z=0 平面的交点
        const worldX = vector.x;
        const worldY = vector.y;
        const worldZ = 0;

        return { x: worldX, y: worldY, z: worldZ };
    }

    /**
     * 世界坐标转屏幕坐标
     *
     * @param {number} worldX - 世界 X 坐标
     * @param {number} worldY - 世界 Y 坐标
     * @param {number} worldZ - 世界 Z 坐标（默认 0）
     * @returns {Object} 屏幕坐标 { x, y }
     */
    worldToScreen(worldX, worldY, worldZ = 0) {
        if (!this.orthographicCamera || !this.container) {
            console.warn('CanvasManager: camera or container not initialized');
            return { x: 0, y: 0 };
        }

        // 创建世界坐标向量
        const vector = new THREE.Vector3(worldX, worldY, worldZ);

        // 投影到屏幕空间
        vector.project(this.orthographicCamera);

        // 获取容器尺寸
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // 将 NDC 转换为屏幕坐标
        const screenX = (vector.x + 1) * width / 2;
        const screenY = -(vector.y - 1) * height / 2;

        return { x: screenX, y: screenY };
    }

    /**
     * 获取场景实例
     *
     * @returns {Scene} W3D Scene 实例
     */
    getScene() {
        return this.scene;
    }

    /**
     * 获取相机实例
     *
     * @returns {THREE.OrthographicCamera} 正交相机实例
     */
    getCamera() {
        return this.orthographicCamera;
    }

    /**
     * 获取渲染器实例
     *
     * @returns {Renderer} 渲染器实例
     */
    getRenderer() {
        return this.scene?.renderer;
    }

    /**
     * 添加辅助对象
     *
     * @param {string} type - 辅助对象类型
     * @param {THREE.Object3D} helper - 辅助对象实例
     */
    addHelper(type, helper) {
        if (this.helpers[type]) {
            this.removeHelper(type);
        }

        this.helpers[type] = helper;
        this.scene.scene.add(helper);
    }

    /**
     * 移除辅助对象
     *
     * @param {string} type - 辅助对象类型
     */
    removeHelper(type) {
        if (this.helpers[type]) {
            this.scene.scene.remove(this.helpers[type]);
            this.helpers[type] = null;
        }
    }

    /**
     * 销毁画布管理器
     */
    dispose() {
        if (!this.isInitialized) {
            return;
        }

        // 移除所有辅助对象
        Object.keys(this.helpers).forEach(type => {
            this.removeHelper(type);
        });

        // 销毁场景
        if (this.scene) {
            this.scene.dispose();
            this.scene = null;
        }

        // 清空相机引用
        this.orthographicCamera = null;

        // 标记为未初始化
        this.isInitialized = false;

        console.log('CanvasManager: disposed');
    }
}

