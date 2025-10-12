import { Component } from '@w3d/core';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import * as THREE from 'three';

/**
 * HDRLoader HDR 环境贴图加载器组件
 *
 * @class HDRLoader
 * @extends Component
 * @description 加载 HDR 环境贴图
 */
export class HDRLoader extends Component {
    static defaultConfig = {
        url: '',
        mapping: THREE.EquirectangularReflectionMapping,
        asEnvironment: true,
        asBackground: false
    };

    async onMounted() {
        this.loader = new RGBELoader();
        await this.loadHDR();
    }

    async loadHDR() {
        if (!this.config.url) {
            console.warn('HDRLoader: url is required');
            return;
        }

        try {
            this.emit('loadStart', { url: this.config.url });

            this.texture = await new Promise((resolve, reject) => {
                this.loader.load(
                    this.config.url,
                    (texture) => resolve(texture),
                    (progress) => {
                        const percent = progress.loaded / progress.total;
                        this.emit('loadProgress', { progress: percent });
                    },
                    (error) => reject(error)
                );
            });

            // 设置映射方式
            this.texture.mapping = this.config.mapping;

            // 应用到场景
            if (this.config.asEnvironment) {
                this.scene.scene.environment = this.texture;
            }

            if (this.config.asBackground) {
                this.scene.scene.background = this.texture;
            }

            this.emit('loadComplete', { texture: this.texture });
        } catch (error) {
            console.error('HDRLoader: Failed to load HDR', error);
            this.emit('loadError', { error });
        }
    }

    getTexture() {
        return this.texture;
    }

    onDispose() {
        if (this.texture) {
            this.texture.dispose();
        }
    }
}

export default HDRLoader;
