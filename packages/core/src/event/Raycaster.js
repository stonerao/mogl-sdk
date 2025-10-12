import * as THREE from 'three';

/**
 * Raycaster 射线拾取器
 *
 * @class Raycaster
 * @description 射线拾取和碰撞检测
 */
export class Raycaster {
    /**
     * 创建射线拾取器实例
     *
     * @param {Scene} scene - 场景实例
     */
    constructor(scene) {
        this.scene = scene;

        // Three.js 射线拾取器
        this.instance = new THREE.Raycaster();

        // 鼠标位置
        this.mouse = new THREE.Vector2();
    }

    /**
     * 更新鼠标位置
     *
     * @param {MouseEvent} event - 鼠标事件
     */
    updateMousePosition(event) {
        const rect = this.scene.renderer.instance.domElement.getBoundingClientRect();

        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    /**
     * 射线拾取
     *
     * @param {MouseEvent} event - 鼠标事件
     * @param {Array} objects - 要检测的对象数组（可选）
     * @returns {Array} 相交对象数组
     */
    raycast(event, objects = null) {
        // 更新鼠标位置
        this.updateMousePosition(event);

        // 更新射线
        this.instance.setFromCamera(this.mouse, this.scene.camera.instance);

        // 获取要检测的对象
        const targets = objects || this.scene.scene.children;

        // 执行射线检测
        const intersects = this.instance.intersectObjects(targets, true);

        return intersects;
    }

    /**
     * 从屏幕坐标获取世界坐标
     *
     * @param {number} x - 屏幕 X 坐标
     * @param {number} y - 屏幕 Y 坐标
     * @param {number} z - 深度值（0-1）
     * @returns {THREE.Vector3} 世界坐标
     */
    screenToWorld(x, y, z = 0) {
        const vector = new THREE.Vector3(x, y, z);
        vector.unproject(this.scene.camera.instance);
        return vector;
    }

    /**
     * 从世界坐标获取屏幕坐标
     *
     * @param {THREE.Vector3} worldPosition - 世界坐标
     * @returns {THREE.Vector2} 屏幕坐标
     */
    worldToScreen(worldPosition) {
        const vector = worldPosition.clone();
        vector.project(this.scene.camera.instance);

        const rect = this.scene.renderer.instance.domElement.getBoundingClientRect();

        return new THREE.Vector2(
            ((vector.x + 1) * rect.width) / 2 + rect.left,
            (-(vector.y - 1) * rect.height) / 2 + rect.top
        );
    }
}
