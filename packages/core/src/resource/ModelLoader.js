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
     */
    constructor() {
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
    load(url, onProgress) {
        const format = this.detectFormat(url);
        switch (format) {
            case 'fbx':
                return this.loadFBX(url, onProgress);
            case 'gltf':
            case 'glb':
                return this.loadGLTF(url, onProgress);
            default:
                return Promise.reject(
                    new Error(`不支持的模型格式: ${format}。支持的格式: .gltf, .glb, .fbx`)
                );
        }
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
}
