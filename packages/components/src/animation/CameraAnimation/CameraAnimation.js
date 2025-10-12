import { Component } from '@w3d/core';
import { Tween } from '@w3d/core';

/**
 * CameraAnimation 相机动画组件
 *
 * @class CameraAnimation
 * @extends Component
 * @description 相机移动和旋转动画
 */
export class CameraAnimation extends Component {
    static defaultConfig = {
        targetPosition: null,
        targetLookAt: null,
        duration: 1000,
        easing: 'easeInOutQuad',
        autoStart: false
    };

    onMounted() {
        if (this.config.autoStart) {
            this.play();
        }
    }

    play() {
        const camera = this.scene.camera.instance;

        if (this.config.targetPosition) {
            const [x, y, z] = this.config.targetPosition;
            Tween.to(camera.position, { x, y, z }, this.config.duration, {
                easing: this.config.easing,
                onUpdate: () => {
                    this.emit('update');
                },
                onComplete: () => {
                    this.emit('complete');
                }
            });
        }
    }
}

export default CameraAnimation;
