import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

/**
 * ModelLoader 模型加载器
 *
 * @class ModelLoader
 * @description 支持 GLTF/GLB/FBX 格式的模型加载
 */
export class ModelLoader {
    /**
     * 创建模型加载器实例
     *
     * @param {IndexedDBCache} indexedDBCache - IndexedDB 缓存实例（可选）
     */
    constructor(indexedDBCache = null) {
        // GLTF/GLB 加载器
        this.gltfLoader = new GLTFLoader();

        // 配置 Draco 解码器
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        this.gltfLoader.setDRACOLoader(dracoLoader);

        // FBX 加载器
        this.fbxLoader = new FBXLoader();

        // 保持向后兼容
        this.loader = this.gltfLoader;

        // IndexedDB 缓存
        this.cache = indexedDBCache;
    }

    /**
     * 根据文件扩展名检测模型格式
     *
     * @param {string} url - 模型 URL
     * @returns {string} 模型格式 ('gltf', 'glb', 'fbx')
     */
    detectFormat(url) {
        const extension = url.split('.').pop().toLowerCase().split('?')[0];
        return extension;
    }

    /**
     * 加载模型（自动检测格式）
     *
     * @param {string} url - 模型 URL
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<Object>} 统一的模型对象
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
        const format = this.detectFormat(url);
        let modelData;

        switch (format) {
            case 'fbx':
                modelData = await this.loadFBX(url, onProgress);
                break;
            case 'gltf':
            case 'glb':
                modelData = await this.loadGLTF(url, onProgress);
                break;
            default:
                return Promise.reject(
                    new Error(`不支持的模型格式: ${format}。支持的格式: .gltf, .glb, .fbx`)
                );
        }

        // 缓存到 IndexedDB
        if (this.cache && modelData) {
            await this._cacheModel(url, format);
        }

        return modelData;
    }

    /**
     * 加载 GLTF/GLB 模型
     *
     * @param {string} url - 模型 URL
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<Object>} GLTF 对象
     */
    loadGLTF(url, onProgress) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf) => {
                    // 返回统一的格式
                    resolve({
                        scene: gltf.scene,
                        animations: gltf.animations || [],
                        cameras: gltf.cameras || [],
                        asset: gltf.asset || {},
                        parser: gltf.parser,
                        userData: gltf.userData || {},
                        type: 'gltf'
                    });
                },
                (progress) => {
                    if (onProgress && progress.total > 0) {
                        const percent = progress.loaded / progress.total;
                        onProgress(percent);
                    }
                },
                (error) => {
                    reject(new Error(`GLTF 加载失败: ${error.message}`));
                }
            );
        });
    }

    /**
     * 加载 FBX 模型
     *
     * @param {string} url - 模型 URL
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<Object>} 统一格式的 FBX 对象
     */
    loadFBX(url, onProgress) {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                url,
                (object) => {
                    // 将 FBX 对象转换为统一的格式（类似 GLTF）
                    const animations = object.animations || [];

                    resolve({
                        scene: object,
                        animations: animations,
                        cameras: [],
                        asset: { generator: 'FBXLoader' },
                        parser: null,
                        userData: object.userData || {},
                        type: 'fbx'
                    });
                },
                (progress) => {
                    if (onProgress && progress.total > 0) {
                        const percent = progress.loaded / progress.total;
                        onProgress(percent);
                    }
                },
                (error) => {
                    reject(new Error(`FBX 加载失败: ${error.message}`));
                }
            );
        });
    }

    /**
     * 设置 Draco 解码器路径
     *
     * @param {string} path - 解码器路径
     */
    setDracoDecoderPath(path) {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(path);
        this.gltfLoader.setDRACOLoader(dracoLoader);
    }

    /**
     * 从缓存加载模型
     *
     * @private
     * @param {string} url - 模型 URL
     * @param {ArrayBuffer} cachedData - 缓存的数据
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<Object>} 统一的模型对象
     */
    async _loadFromCache(url, cachedData, onProgress) {
        const format = this.detectFormat(url);

        // 模拟进度回调
        if (onProgress) {
            onProgress(1);
        }

        // 根据格式解析缓存数据
        switch (format) {
            case 'gltf':
            case 'glb':
                return this._parseGLTFFromCache(cachedData);
            case 'fbx':
                return this._parseFBXFromCache(cachedData);
            default:
                throw new Error(`不支持的模型格式: ${format}`);
        }
    }

    /**
     * 从缓存解析 GLTF/GLB 模型
     *
     * @private
     * @param {ArrayBuffer} data - 缓存的数据
     * @returns {Promise<Object>} GLTF 对象
     */
    _parseGLTFFromCache(data) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.parse(
                data,
                '',
                (gltf) => {
                    resolve({
                        scene: gltf.scene,
                        animations: gltf.animations || [],
                        cameras: gltf.cameras || [],
                        asset: gltf.asset || {},
                        parser: gltf.parser,
                        userData: gltf.userData || {},
                        type: 'gltf'
                    });
                },
                (error) => {
                    reject(new Error(`GLTF 解析失败: ${error.message}`));
                }
            );
        });
    }

    /**
     * 从缓存解析 FBX 模型
     *
     * @private
     * @param {ArrayBuffer} data - 缓存的数据
     * @returns {Promise<Object>} 统一格式的 FBX 对象
     */
    _parseFBXFromCache(data) {
        return new Promise((resolve, reject) => {
            try {
                const object = this.fbxLoader.parse(data, '');
                const animations = object.animations || [];

                resolve({
                    scene: object,
                    animations: animations,
                    cameras: [],
                    asset: { generator: 'FBXLoader' },
                    parser: null,
                    userData: object.userData || {},
                    type: 'fbx'
                });
            } catch (error) {
                reject(new Error(`FBX 解析失败: ${error.message}`));
            }
        });
    }

    /**
     * 缓存模型到 IndexedDB
     *
     * @private
     * @param {string} url - 模型 URL
     * @param {string} format - 模型格式
     * @returns {Promise<void>}
     */
    async _cacheModel(url, format) {
        try {
            // 重新获取原始数据以缓存
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            await this.cache.set(url, arrayBuffer, 'model');
        } catch (error) {
            // 缓存失败不影响主流程
            console.warn(`Failed to cache model: ${url}`, error);
        }
    }
}
