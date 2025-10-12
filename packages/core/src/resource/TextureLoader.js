import * as THREE from 'three';

/**
 * TextureLoader 纹理加载器
 *
 * @class TextureLoader
 * @description 纹理资源加载
 */
export class TextureLoader {
    /**
     * 创建纹理加载器实例
     */
    constructor() {
        this.loader = new THREE.TextureLoader();
    }

    /**
     * 加载纹理
     *
     * @param {string} url - 纹理 URL
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<THREE.Texture>} 纹理对象
     */
    load(url, onProgress) {
        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (texture) => {
                    resolve(texture);
                },
                (progress) => {
                    if (onProgress) {
                        const percent = progress.loaded / progress.total;
                        onProgress(percent);
                    }
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    /**
     * 批量加载纹理
     *
     * @param {Array<string>} urls - 纹理 URL 数组
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<Array<THREE.Texture>>} 纹理数组
     */
    async loadMultiple(urls, onProgress) {
        const textures = [];
        let loaded = 0;

        for (const url of urls) {
            const texture = await this.load(url, (progress) => {
                const totalProgress = (loaded + progress) / urls.length;
                if (onProgress) {
                    onProgress(totalProgress);
                }
            });

            textures.push(texture);
            loaded++;
        }

        return textures;
    }
}
