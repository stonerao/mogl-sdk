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
     *
     * @param {IndexedDBCache} indexedDBCache - IndexedDB 缓存实例（可选）
     */
    constructor(indexedDBCache = null) {
        this.loader = new THREE.TextureLoader();
        this.cache = indexedDBCache;
    }

    /**
     * 加载纹理
     *
     * @param {string} url - 纹理 URL
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<THREE.Texture>} 纹理对象
     */
    async load(url, onProgress) {
        // 尝试从 IndexedDB 缓存加载
        if (this.cache) {
            const cachedData = await this.cache.get(url);
            if (cachedData) {
                return this._loadFromCache(url, cachedData, onProgress);
            }
        }

        // 从网络加载
        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                async (texture) => {
                    // 缓存到 IndexedDB
                    if (this.cache) {
                        await this._cacheTexture(url);
                    }
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

    /**
     * 从缓存加载纹理
     *
     * @private
     * @param {string} url - 纹理 URL
     * @param {ArrayBuffer} cachedData - 缓存的数据
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<THREE.Texture>} 纹理对象
     */
    async _loadFromCache(url, cachedData, onProgress) {
        // 模拟进度回调
        if (onProgress) {
            onProgress(1);
        }

        // 将 ArrayBuffer 转换为 Blob
        const blob = new Blob([cachedData]);
        const objectURL = URL.createObjectURL(blob);

        return new Promise((resolve, reject) => {
            this.loader.load(
                objectURL,
                (texture) => {
                    // 释放对象 URL
                    URL.revokeObjectURL(objectURL);
                    resolve(texture);
                },
                undefined,
                (error) => {
                    URL.revokeObjectURL(objectURL);
                    reject(new Error(`纹理解析失败: ${error.message}`));
                }
            );
        });
    }

    /**
     * 缓存纹理到 IndexedDB
     *
     * @private
     * @param {string} url - 纹理 URL
     * @returns {Promise<void>}
     */
    async _cacheTexture(url) {
        try {
            // 重新获取原始数据以缓存
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            await this.cache.set(url, arrayBuffer, 'texture');
        } catch (error) {
            // 缓存失败不影响主流程
            console.warn(`Failed to cache texture: ${url}`, error);
        }
    }
}
