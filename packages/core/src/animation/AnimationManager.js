import * as THREE from 'three';

/**
 * AnimationManager 动画管理器
 *
 * @class AnimationManager
 * @description 动画的创建和管理
 */
export class AnimationManager {
    /**
     * 创建动画管理器实例
     *
     * @param {Scene} scene - 场景实例
     */
    constructor(scene) {
        this.scene = scene;

        // 动画混合器
        this.mixers = new Map();

        // 时钟
        this.clock = new THREE.Clock();
    }

    /**
     * 创建动画混合器
     *
     * @param {THREE.Object3D} object - 3D 对象
     * @returns {THREE.AnimationMixer} 动画混合器
     */
    createMixer(object) {
        const mixer = new THREE.AnimationMixer(object);
        this.mixers.set(object.uuid, mixer);
        return mixer;
    }

    /**
     * 获取动画混合器
     *
     * @param {THREE.Object3D} object - 3D 对象
     * @returns {THREE.AnimationMixer|null} 动画混合器
     */
    getMixer(object) {
        return this.mixers.get(object.uuid) || null;
    }

    /**
     * 播放动画
     *
     * @param {THREE.Object3D} object - 3D 对象
     * @param {THREE.AnimationClip} clip - 动画剪辑
     * @param {Object} options - 播放选项
     * @returns {THREE.AnimationAction} 动画动作
     */
    play(object, clip, options = {}) {
        let mixer = this.getMixer(object);

        if (!mixer) {
            mixer = this.createMixer(object);
        }

        const action = mixer.clipAction(clip);

        // 应用选项
        if (options.loop !== undefined) {
            action.setLoop(options.loop);
        }
        if (options.timeScale !== undefined) {
            action.setEffectiveTimeScale(options.timeScale);
        }
        if (options.weight !== undefined) {
            action.setEffectiveWeight(options.weight);
        }

        action.play();

        return action;
    }

    /**
     * 停止动画
     *
     * @param {THREE.Object3D} object - 3D 对象
     */
    stop(object) {
        const mixer = this.getMixer(object);

        if (mixer) {
            mixer.stopAllAction();
        }
    }

    /**
     * 更新动画
     */
    update() {
        const delta = this.clock.getDelta();

        this.mixers.forEach((mixer) => {
            mixer.update(delta);
        });
    }

    /**
     * 移除动画混合器
     *
     * @param {THREE.Object3D} object - 3D 对象
     */
    remove(object) {
        const mixer = this.getMixer(object);

        if (mixer) {
            mixer.stopAllAction();
            this.mixers.delete(object.uuid);
        }
    }

    /**
     * 销毁动画管理器
     */
    dispose() {
        this.mixers.forEach((mixer) => {
            mixer.stopAllAction();
        });

        this.mixers.clear();
    }
}
