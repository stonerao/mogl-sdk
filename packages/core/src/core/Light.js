import * as THREE from 'three';

/**
 * Light 灯光类
 *
 * @class Light
 * @description 各种灯光的创建和管理
 */
export class Light {
    /**
     * 创建灯光实例
     *
     * @param {Scene} scene - 场景实例
     */
    constructor(scene) {
        this.scene = scene;
        this.lights = new Map();
    }

    /**
     * 添加环境光
     *
     * @param {Object} options - 配置选项
     * @returns {THREE.AmbientLight} 环境光实例
     */
    addAmbient(options = {}) {
        const { color = '#ffffff', intensity = 0.5 } = options;

        const light = new THREE.AmbientLight(color, intensity);
        this.lights.set('ambient', light);
        this.scene.scene.add(light);

        return light;
    }

    /**
     * 添加平行光
     *
     * @param {Object} options - 配置选项
     * @returns {THREE.DirectionalLight} 平行光实例
     */
    addDirectional(options = {}) {
        const {
            color = '#ffffff',
            intensity = 1.0,
            position = [100, 100, 100],
            castShadow = false,
            shadowMapSize = 2048
        } = options;

        const light = new THREE.DirectionalLight(color, intensity);

        const [x, y, z] = position;
        light.position.set(x, y, z);

        // 阴影配置
        light.castShadow = castShadow;
        if (castShadow) {
            light.shadow.mapSize.width = shadowMapSize;
            light.shadow.mapSize.height = shadowMapSize;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 500;
            light.shadow.camera.left = -100;
            light.shadow.camera.right = 100;
            light.shadow.camera.top = 100;
            light.shadow.camera.bottom = -100;
        }

        this.lights.set('directional', light);
        this.scene.scene.add(light);

        return light;
    }

    /**
     * 添加点光源
     *
     * @param {Object} options - 配置选项
     * @returns {THREE.PointLight} 点光源实例
     */
    addPoint(options = {}) {
        const {
            color = '#ffffff',
            intensity = 1.0,
            distance = 0,
            decay = 2,
            position = [0, 100, 0]
        } = options;

        const light = new THREE.PointLight(color, intensity, distance, decay);

        const [x, y, z] = position;
        light.position.set(x, y, z);

        const name = `point_${this.lights.size}`;
        this.lights.set(name, light);
        this.scene.scene.add(light);

        return light;
    }

    /**
     * 添加聚光灯
     *
     * @param {Object} options - 配置选项
     * @returns {THREE.SpotLight} 聚光灯实例
     */
    addSpot(options = {}) {
        const {
            color = '#ffffff',
            intensity = 1.0,
            distance = 0,
            angle = Math.PI / 3,
            penumbra = 0,
            decay = 2,
            position = [0, 100, 0],
            target = [0, 0, 0]
        } = options;

        const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);

        const [x, y, z] = position;
        light.position.set(x, y, z);

        const [tx, ty, tz] = target;
        light.target.position.set(tx, ty, tz);

        const name = `spot_${this.lights.size}`;
        this.lights.set(name, light);
        this.scene.scene.add(light);
        this.scene.scene.add(light.target);

        return light;
    }

    /**
     * 获取灯光
     *
     * @param {string} name - 灯光名称
     * @returns {THREE.Light|null} 灯光实例
     */
    get(name) {
        return this.lights.get(name) || null;
    }

    /**
     * 移除灯光
     *
     * @param {string} name - 灯光名称
     */
    remove(name) {
        const light = this.lights.get(name);
        if (light) {
            this.scene.scene.remove(light);
            this.lights.delete(name);
        }
    }

    /**
     * 销毁所有灯光
     */
    dispose() {
        this.lights.forEach((light) => {
            this.scene.scene.remove(light);
        });
        this.lights.clear();
    }
}
