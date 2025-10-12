import * as THREE from 'three';

/**
 * Camera 相机类
 *
 * @class Camera
 * @description 相机的创建和控制
 */
export class Camera {
    /**
     * 创建相机实例
     *
     * @param {Scene} scene - 场景实例
     * @param {Object} options - 配置选项
     */
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = {
            fov: 45,
            near: 0.1,
            far: 10000,
            position: [0, 100, 200],
            lookAt: [0, 0, 0],
            ...options
        };
        // 创建透视相机
        const width = this.scene.container.clientWidth;
        const height = this.scene.container.clientHeight;
        const aspect = width / height;

        this.instance = new THREE.PerspectiveCamera(
            this.options.fov,
            aspect,
            this.options.near,
            this.options.far
        );

        // 设置相机位置
        const [x, y, z] = this.options.position;
        this.instance.position.set(x, y, z);

        // 设置相机朝向
        const [lx, ly, lz] = this.options.lookAt;
        this.instance.lookAt(lx, ly, lz);

        // 添加到场景
        this.scene.scene.add(this.instance);
    }

    /**
     * 设置相机位置
     *
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {number} z - Z 坐标
     */
    setPosition(x, y, z) {
        this.instance.position.set(x, y, z);
    }

    /**
     * 设置相机朝向
     *
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {number} z - Z 坐标
     */
    lookAt(x, y, z) {
        this.instance.lookAt(x, y, z);
    }

    /**
     * 调整相机大小
     *
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    resize(width, height) {
        this.instance.aspect = width / height;
        this.instance.updateProjectionMatrix();
    }

    /**
     * 获取相机位置
     *
     * @returns {THREE.Vector3} 相机位置
     */
    getPosition() {
        return this.instance.position.clone();
    }

    /**
     * 获取相机方向
     *
     * @returns {THREE.Vector3} 相机方向
     */
    getDirection() {
        const direction = new THREE.Vector3();
        this.instance.getWorldDirection(direction);
        return direction;
    }

    /**
     * 销毁相机
     */
    dispose() {
        if (this.instance.parent) {
            this.instance.parent.remove(this.instance);
        }
    }
}
