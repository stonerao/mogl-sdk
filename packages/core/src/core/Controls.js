import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Controls 控制器类
 *
 * @class Controls
 * @description 轨道控制器等交互控制
 */
export class Controls {
    /**
     * 创建控制器实例
     *
     * @param {Scene} scene - 场景实例
     * @param {Object} options - 配置选项
     */
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = {
            enableDamping: true,
            dampingFactor: 0.05,
            enableZoom: true,
            enableRotate: true,
            enablePan: true,
            autoRotate: false,
            autoRotateSpeed: 2.0,
            minDistance: 1,
            maxDistance: 1000,
            target: { x: 0, y: 0, z: 0 },
            ...options
        };

        // 创建轨道控制器
        this.instance = new OrbitControls(
            this.scene.camera.instance,
            this.scene.renderer.instance.domElement
        );

        // 应用配置
        this.applyOptions();
    }

    /**
     * 应用配置选项
     */
    applyOptions() {
        if (!this.instance) return;
        this.instance.enableDamping = this.options.enableDamping;
        this.instance.dampingFactor = this.options.dampingFactor;
        this.instance.enableZoom = this.options.enableZoom;
        this.instance.enableRotate = this.options.enableRotate;
        this.instance.enablePan = this.options.enablePan;
        this.instance.autoRotate = this.options.autoRotate;
        this.instance.autoRotateSpeed = this.options.autoRotateSpeed;
        this.instance.minDistance = this.options.minDistance;
        this.instance.maxDistance = this.options.maxDistance;
        this.instance.target.set(
            this.options.target.x,
            this.options.target.y,
            this.options.target.z
        );
    }

    /**
     * 更新控制器
     */
    update() {
        if (this.instance.enableDamping || this.instance.autoRotate) {
            this.instance.update();
        }
    }

    /**
     * 启用自动旋转
     *
     * @param {boolean} enabled - 是否启用
     * @param {number} speed - 旋转速度
     */
    enableAutoRotate(enabled = true, speed = 2.0) {
        this.instance.autoRotate = enabled;
        this.instance.autoRotateSpeed = speed;
    }

    /**
     * 设置目标点
     *
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {number} z - Z 坐标
     */
    setTarget(x, y, z) {
        this.instance.target.set(x, y, z);
        this.instance.update();
    }

    /**
     * 重置控制器
     */
    reset() {
        this.instance.reset();
    }

    /**
     * 销毁控制器
     */
    dispose() {
        this.instance.dispose();
    }
}
