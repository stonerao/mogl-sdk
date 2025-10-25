import { Component } from '@w3d/core';
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';

/**
 * Ocean 海洋组件
 *
 * @class Ocean
 * @extends Component
 * @description 基于 Three.js Water 的海洋效果组件，支持从模型加载几何体
 *
 * @example
 * // 创建 Ocean 组件
 * const ocean = await scene.add('Ocean', {
 *     name: 'ocean',
 *     position: [0, 0, 0],
 *     rotation: [0, 0, 0],
 *     scale: [1, 1, 1],
 *     waterColor: '#001e0f',
 *     sunColor: '#ffffff',
 *     distortionScale: 3.7,
 *     size: 1.0
 * });
 *
 * // 从模型加载几何体
 * ocean.loadGeometryFromModel('/models/water.glb', 'waterGeometry');
 *
 * // 更新位置
 * ocean.updatePosition(0, 5, 0);
 *
 * // 更新海洋参数
 * ocean.updateWaterParams({
 *     waterColor: '#006994',
 *     distortionScale: 5.0
 * });
 */
export class Ocean extends Component {
    static defaultConfig = {
        // Transform 属性
        position: [0, 0, 0],
        rotation: [-Math.PI / 2, 0, 0], // 默认水平放置
        scale: [1, 1, 1],

        // 几何体配置
        geometryType: 'plane', // 'plane' | 'model'
        geometryWidth: 10000,
        geometryHeight: 10000,
        modelPath: null, // 模型文件路径
        geometryName: null, // 从模型中提取的几何体名称

        // Water 材质配置
        textureWidth: 512,
        textureHeight: 512,
        waterNormalsUrl: '/textures/waternormals.jpg', // 水面法线贴图
        waterColor: '#001e0f', // 水面颜色
        sunColor: '#ffffff', // 太阳光颜色
        sunDirection: [0, 1, 0], // 太阳光方向
        distortionScale: 3.7, // 扭曲强度
        size: 1.0, // 波浪大小
        alpha: 1.0, // 透明度
        time: 0, // 时间（用于动画）
        waterSpeed: 1.0 // 水面动画速度
    };

    constructor(scene, config = {}) {
        super(scene, config);

        // Water 实例
        this.water = null;

        // 几何体
        this.geometry = null;

        // 法线贴图
        this.waterNormals = null;

        // 是否已加载
        this.isLoaded = false;
    }

    /**
     * 组件挂载完成
     */
    async onMounted() {
        try {
            // 加载水面法线贴图
            await this.loadWaterNormals();

            // 创建几何体
            await this.createGeometry();

            // 创建 Water 对象
            this.createWater();

            // 应用 Transform 属性
            this.applyTransform();

            this.isLoaded = true;

            // 触发加载完成事件
            this.emit('loaded', {
                water: this.water,
                geometry: this.geometry
            });
        } catch (error) {
            console.error('[Ocean] 初始化失败:', error);
            this.emit('error', { error });
        }
    }

    /**
     * 加载水面法线贴图
     */
    async loadWaterNormals() {
        return new Promise((resolve, reject) => {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                this.config.waterNormalsUrl,
                (texture) => {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    this.waterNormals = texture;
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.warn('[Ocean] 法线贴图加载失败，使用默认配置:', error);
                    // 即使加载失败也继续，Water 可以没有法线贴图
                    resolve(null);
                }
            );
        });
    }

    /**
     * 创建几何体
     */
    async createGeometry() {
        const { geometryType, geometryWidth, geometryHeight, modelPath, geometryName } =
            this.config;

        if (geometryType === 'model' && modelPath) {
            // 从模型加载几何体
            await this.loadGeometryFromModel(modelPath, geometryName);
        } else {
            // 使用默认平面几何体
            this.geometry = new THREE.PlaneGeometry(geometryWidth, geometryHeight);
        }
    }

    /**
     * 从模型加载几何体
     *
     * @param {string} modelPath - 模型文件路径
     * @param {string} geometryName - 几何体名称（可选）
     */
    async loadGeometryFromModel(modelPath, geometryName = null) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            loader.load(
                modelPath,
                (gltf) => {
                    let targetMesh = null;

                    // 查找指定名称的几何体
                    if (geometryName) {
                        gltf.scene.traverse((child) => {
                            if (child.isMesh && child.name === geometryName) {
                                targetMesh = child;
                            }
                        });
                    }

                    // 如果没有找到指定名称的几何体，使用第一个 Mesh
                    if (!targetMesh) {
                        gltf.scene.traverse((child) => {
                            if (child.isMesh && !targetMesh) {
                                targetMesh = child;
                            }
                        });
                    }

                    if (targetMesh) {
                        this.geometry = targetMesh.geometry.clone();

                        // 提取 Transform 属性
                        if (this.config.position[0] === 0 && this.config.position[1] === 0 && this.config.position[2] === 0) {
                            this.config.position = [
                                targetMesh.position.x,
                                targetMesh.position.y,
                                targetMesh.position.z
                            ];
                        }

                        if (this.config.rotation[0] === -Math.PI / 2 && this.config.rotation[1] === 0 && this.config.rotation[2] === 0) {
                            this.config.rotation = [
                                targetMesh.rotation.x,
                                targetMesh.rotation.y,
                                targetMesh.rotation.z
                            ];
                        }

                        if (this.config.scale[0] === 1 && this.config.scale[1] === 1 && this.config.scale[2] === 1) {
                            this.config.scale = [
                                targetMesh.scale.x,
                                targetMesh.scale.y,
                                targetMesh.scale.z
                            ];
                        }

                        this.emit('geometryLoaded', {
                            geometry: this.geometry,
                            mesh: targetMesh
                        });

                        resolve(this.geometry);
                    } else {
                        reject(new Error('模型中未找到有效的几何体'));
                    }
                },
                undefined,
                (error) => {
                    console.error('[Ocean] 模型加载失败:', error);
                    reject(error);
                }
            );
        });
    }

    /**
     * 创建 Water 对象
     */
    createWater() {
        if (!this.geometry) {
            console.error('[Ocean] 几何体未创建');
            return;
        }

        const waterConfig = {
            textureWidth: this.config.textureWidth,
            textureHeight: this.config.textureHeight,
            waterColor: new THREE.Color(this.config.waterColor),
            sunColor: new THREE.Color(this.config.sunColor),
            sunDirection: new THREE.Vector3(...this.config.sunDirection),
            distortionScale: this.config.distortionScale,
            alpha: this.config.alpha,
            time: this.config.time,
            fog: this.scene.scene.fog !== undefined
        };

        // 如果法线贴图加载成功，添加到配置中
        if (this.waterNormals) {
            waterConfig.waterNormals = this.waterNormals;
        }

        // 创建 Water 实例
        this.water = new Water(this.geometry, waterConfig);

        // 添加到组件场景
        this.componentScene.add(this.water);

        this.emit('waterCreated', { water: this.water });
    }

    /**
     * 应用 Transform 属性
     */
    applyTransform() {
        if (!this.water) return;

        const { position, rotation, scale } = this.config;

        this.water.position.set(position[0], position[1], position[2]);
        this.water.rotation.set(rotation[0], rotation[1], rotation[2]);
        this.water.scale.set(scale[0], scale[1], scale[2]);
    }

    /**
     * 更新位置
     *
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {number} z - Z 坐标
     */
    updatePosition(x, y, z) {
        this.config.position = [x, y, z];
        if (this.water) {
            this.water.position.set(x, y, z);
        }
        this.emit('positionUpdated', { position: [x, y, z] });
    }

    /**
     * 设置位置（对象形式）
     *
     * @param {Object} position - 位置对象 {x, y, z}
     */
    setPosition(position) {
        const { x = 0, y = 0, z = 0 } = position;
        this.updatePosition(x, y, z);
    }

    /**
     * 更新旋转
     *
     * @param {number} x - X 轴旋转（弧度）
     * @param {number} y - Y 轴旋转（弧度）
     * @param {number} z - Z 轴旋转（弧度）
     */
    updateRotation(x, y, z) {
        this.config.rotation = [x, y, z];
        if (this.water) {
            this.water.rotation.set(x, y, z);
        }
        this.emit('rotationUpdated', { rotation: [x, y, z] });
    }

    /**
     * 设置旋转（对象形式）
     *
     * @param {Object} rotation - 旋转对象 {x, y, z}
     */
    setRotation(rotation) {
        const { x = 0, y = 0, z = 0 } = rotation;
        this.updateRotation(x, y, z);
    }

    /**
     * 更新缩放
     *
     * @param {number} x - X 轴缩放
     * @param {number} y - Y 轴缩放
     * @param {number} z - Z 轴缩放
     */
    updateScale(x, y, z) {
        this.config.scale = [x, y, z];
        if (this.water) {
            this.water.scale.set(x, y, z);
        }
        this.emit('scaleUpdated', { scale: [x, y, z] });
    }

    /**
     * 设置缩放（对象形式）
     *
     * @param {Object} scale - 缩放对象 {x, y, z}
     */
    setScale(scale) {
        const { x = 1, y = 1, z = 1 } = scale;
        this.updateScale(x, y, z);
    }

    /**
     * 更新海洋参数
     *
     * @param {Object} params - 海洋参数
     * @param {string} params.waterColor - 水面颜色
     * @param {string} params.sunColor - 太阳光颜色
     * @param {number} params.distortionScale - 扭曲强度
     * @param {number} params.size - 波浪大小
     * @param {number} params.alpha - 透明度
     * @param {number} params.waterSpeed - 水面动画速度
     */
    updateWaterParams(params) {
        if (!this.water || !this.water.material) {
            console.warn('[Ocean] Water 未初始化');
            return;
        }

        const uniforms = this.water.material.uniforms;

        // 更新水面颜色
        if (params.waterColor !== undefined) {
            this.config.waterColor = params.waterColor;
            uniforms.waterColor.value = new THREE.Color(params.waterColor);
        }

        // 更新太阳光颜色
        if (params.sunColor !== undefined) {
            this.config.sunColor = params.sunColor;
            uniforms.sunColor.value = new THREE.Color(params.sunColor);
        }

        // 更新扭曲强度
        if (params.distortionScale !== undefined) {
            this.config.distortionScale = params.distortionScale;
            uniforms.distortionScale.value = params.distortionScale;
        }

        // 更新波浪大小
        if (params.size !== undefined) {
            this.config.size = params.size;
            uniforms.size.value = params.size;
        }

        // 更新透明度
        if (params.alpha !== undefined) {
            this.config.alpha = params.alpha;
            uniforms.alpha.value = params.alpha;
        }

        // 更新水面动画速度
        if (params.waterSpeed !== undefined) {
            this.config.waterSpeed = params.waterSpeed;
        }

        this.emit('waterParamsUpdated', { params });
    }

    /**
     * 更新太阳光方向
     *
     * @param {number} x - X 方向
     * @param {number} y - Y 方向
     * @param {number} z - Z 方向
     */
    updateSunDirection(x, y, z) {
        this.config.sunDirection = [x, y, z];
        if (this.water && this.water.material) {
            this.water.material.uniforms.sunDirection.value.set(x, y, z).normalize();
        }
        this.emit('sunDirectionUpdated', { sunDirection: [x, y, z] });
    }

    /**
     * 更新配置（批量更新）
     *
     * @param {Object} newConfig - 新配置
     */
    updateConfig(newConfig) {
        super.updateConfig(newConfig);

        // 更新 Transform 属性
        if (newConfig.position) {
            this.updatePosition(...newConfig.position);
        }
        if (newConfig.rotation) {
            this.updateRotation(...newConfig.rotation);
        }
        if (newConfig.scale) {
            this.updateScale(...newConfig.scale);
        }

        // 更新海洋参数
        const waterParams = {};
        if (newConfig.waterColor) waterParams.waterColor = newConfig.waterColor;
        if (newConfig.sunColor) waterParams.sunColor = newConfig.sunColor;
        if (newConfig.distortionScale !== undefined)
            waterParams.distortionScale = newConfig.distortionScale;
        if (newConfig.size !== undefined) waterParams.size = newConfig.size;
        if (newConfig.alpha !== undefined) waterParams.alpha = newConfig.alpha;
        if (newConfig.waterSpeed !== undefined) waterParams.waterSpeed = newConfig.waterSpeed;

        if (Object.keys(waterParams).length > 0) {
            this.updateWaterParams(waterParams);
        }

        // 更新太阳光方向
        if (newConfig.sunDirection) {
            this.updateSunDirection(...newConfig.sunDirection);
        }
    }

    /**
     * 每帧更新
     *
     * @param {number} delta - 时间增量
     */
    onUpdate(delta) {
        if (!this.water || !this.water.material) return;

        // 更新水面动画时间
        this.water.material.uniforms.time.value += delta * this.config.waterSpeed;
    }

    /**
     * 获取 Water 实例
     *
     * @returns {Water} Water 实例
     */
    getWater() {
        return this.water;
    }

    /**
     * 获取几何体
     *
     * @returns {THREE.BufferGeometry} 几何体
     */
    getGeometry() {
        return this.geometry;
    }

    /**
     * 组件销毁
     */
    onDispose() {
        // 销毁 Water
        if (this.water) {
            if (this.water.geometry) {
                this.water.geometry.dispose();
            }
            if (this.water.material) {
                this.water.material.dispose();
            }
            this.componentScene.remove(this.water);
            this.water = null;
        }

        // 销毁几何体
        if (this.geometry) {
            this.geometry.dispose();
            this.geometry = null;
        }

        // 销毁法线贴图
        if (this.waterNormals) {
            this.waterNormals.dispose();
            this.waterNormals = null;
        }
    }
}

export default Ocean;

