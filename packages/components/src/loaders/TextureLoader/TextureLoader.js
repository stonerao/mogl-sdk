import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * TextureLoader 纹理加载器组件
 *
 * @class TextureLoader
 * @extends Component
 * @description 加载纹理资源
 */
export class TextureLoader extends Component {
    static defaultConfig = {
        url: '',
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        repeat: [1, 1],
        offset: [0, 0],
        rotation: 0,
        flipY: true
    };

    async onMounted() {
        this.loader = new THREE.TextureLoader();
        await this.loadTexture();
    }

    async loadTexture() {
        if (!this.config.url) {
            console.warn('TextureLoader: url is required');
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

            // 应用配置
            this.applyConfig();

            this.emit('loadComplete', { texture: this.texture });
        } catch (error) {
            console.error('TextureLoader: Failed to load texture', error);
            this.emit('loadError', { error });
        }
    }

    applyConfig() {
        if (!this.texture) return;

        this.texture.wrapS = this.config.wrapS;
        this.texture.wrapT = this.config.wrapT;
        this.texture.repeat.set(...this.config.repeat);
        this.texture.offset.set(...this.config.offset);
        this.texture.rotation = this.config.rotation;
        this.texture.flipY = this.config.flipY;
        this.texture.needsUpdate = true;
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

export default TextureLoader;
