import { Component } from '@w3d/core';
import { ModelLoader as CoreModelLoader } from '@w3d/core';
import * as THREE from 'three';

/**
 * ModelLoader 模型加载器组件
 *
 * @class ModelLoader
 * @extends Component
 * @description 加载 GLTF/GLB/FBX 模型，支持自动格式检测
 *
 * @example
 * // 加载 GLTF/GLB 模型
 * const model = await scene.add('ModelLoader', {
 *     name: 'robot',
 *     url: '/models/robot.glb',
 *     scale: 2,
 *     position: [0, 0, 0]
 * });
 *
 * // 加载 FBX 模型（自动检测格式）
 * const fbxModel = await scene.add('ModelLoader', {
 *     name: 'character',
 *     url: '/models/character.fbx',
 *     scale: 0.01
 * });
 */
export class ModelLoader extends Component {
    /**
     * 默认配置
     */
    static defaultConfig = {
        url: '',
        scale: 1,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        dracoDecoderPath: '/draco/',
        castShadow: false,
        receiveShadow: false,
        animations: true,
        autoPlayAnimation: false, // 是否自动播放第一个动画
        interactiveMeshes: false, // false: 禁用事件, '*': 全部启用, ['name1', 'name2']: 指定 Mesh

        // 烘焙光照配置
        bakedLighting: {
            enabled: false, // 是否启用烘焙光照
            textureMapping: {}, // 物体名称到纹理路径的映射
            mode: 'map', // 'map' 或 'lightMap'
            intensity: 1.0, // 光照强度（仅 lightMap 模式）
            autoApply: true, // 模型加载完成后自动应用
            channel: 1 // UV 通道索引：0=UV1, 1=UV2（烘焙贴图标准）
        }
    };

    /**
     * 组件挂载完成
     */
    async onMounted() {
        // 初始化交互对象列表
        this.interactiveObjects = [];

        // 初始化烘焙光照相关变量
        this.textureLoader = null;
        this.bakedTextureCache = new Map();
        this.originalMaterials = new Map(); // 保存原始材质用于恢复

        // 使用 Core 版本的 ModelLoader（支持 GLTF/GLB/FBX）
        this.coreLoader = new CoreModelLoader();

        // 配置 Draco 解码器路径
        this.coreLoader.setDracoDecoderPath(this.config.dracoDecoderPath);

        // ✅ 修复：异步加载模型但不阻塞 onMounted 返回
        // 这样外部代码可以在模型加载完成前注册事件监听器
        this.loadModel()
            .then(() => {
                // 模型加载完成后的后续操作
                // 设置交互对象
                this.setupInteractiveObjects();

                // 如果启用了烘焙光照且设置了自动应用，则应用烘焙光照
                if (this.config.bakedLighting.enabled && this.config.bakedLighting.autoApply) {
                    this.applyBakedLighting(this.config.bakedLighting.textureMapping, {
                        mode: this.config.bakedLighting.mode,
                        intensity: this.config.bakedLighting.intensity
                    }).catch((error) => {
                        // eslint-disable-next-line no-console
                        console.error('ModelLoader: Failed to apply baked lighting', error);
                    });
                }
            })
            .catch((error) => {
                // loadModel 内部已经处理了错误并触发了 'error' 事件
                // 这里只是确保 Promise rejection 被捕获，避免未处理的 rejection 警告
                // eslint-disable-next-line no-console
                console.error('ModelLoader: Model loading failed in onMounted', error);
            });

        // onMounted 立即返回，不等待模型加载完成
        // 这样 scene.add() 可以立即返回组件实例
    }

    /**
     * 加载模型
     * 使用 Core 的 ModelLoader，自动支持 GLTF/GLB/FBX 格式
     */
    async loadModel() {
        if (!this.config.url) {
            // eslint-disable-next-line no-console
            console.warn('ModelLoader: url is required');
            return;
        }

        try {
            // 触发加载开始事件
            this.emit('loadStart', { url: this.config.url });

            // 使用 Core 加载器加载模型（自动检测格式）
            const modelData = await this.coreLoader.load(this.config.url, (progress) => {
                // 触发加载进度事件（同时触发两个事件名以保持向后兼容）
                this.emit('loadProgress', { progress });
                this.emit('progress', { progress }); // 向后兼容
            });

            // 保存模型数据（统一格式）
            this.modelData = modelData;
            this.model = modelData.scene;
            this.animations = modelData.animations || [];

            // 为了向后兼容，保留 gltf 属性
            this.gltf = {
                scene: modelData.scene,
                animations: modelData.animations,
                cameras: modelData.cameras,
                asset: modelData.asset,
                userData: modelData.userData
            };

            // 应用变换
            this.applyTransform();

            // 应用阴影
            this.applyShadow();

            // 添加到场景
            this.add(this.model);

            // 处理动画
            if (this.config.animations && this.animations.length > 0) {
                this.setupAnimations(this.animations);
            }

            // 触发加载完成事件（同时触发两个事件名以保持向后兼容）
            const loadCompleteData = {
                modelData,
                type: modelData.type, // 'gltf' 或 'fbx'
                gltf: this.gltf, // 向后兼容
                model: this.model // 添加 model 属性以便直接访问
            };
            this.emit('loadComplete', loadCompleteData);
            this.emit('loaded', loadCompleteData); // 向后兼容
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('ModelLoader: Failed to load model', error);
            // 触发加载错误事件（同时触发两个事件名以保持向后兼容）
            this.emit('loadError', { error });
            this.emit('error', { error }); // 向后兼容
        }
    }

    /**
     * 应用变换
     */
    applyTransform() {
        if (!this.model) return;

        // 缩放
        const scale = this.config.scale;
        this.model.scale.set(scale, scale, scale);

        // 位置
        const [x, y, z] = this.config.position;
        this.model.position.set(x, y, z);

        // 旋转
        const [rx, ry, rz] = this.config.rotation;
        this.model.rotation.set(rx, ry, rz);
    }

    /**
     * 应用阴影
     */
    applyShadow() {
        if (!this.model) return;

        this.model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = this.config.castShadow;
                child.receiveShadow = this.config.receiveShadow;
            }
        });
    }

    /**
     * 设置动画
     *
     * @param {Array} animations - 动画剪辑数组
     */
    setupAnimations(animations) {
        this.animations = animations;
        this.mixer = this.scene.animationManager.createMixer(this.model);
        this.currentAction = null;
        this.animationSpeed = 1.0;
        this.isAnimationPlaying = false;

        // 触发动画加载完成事件
        this.emit('animationLoaded', {
            animations: this.getAnimationNames(),
            count: animations.length
        });

        // 播放第一个动画（如果配置了自动播放）
        if (this.config.autoPlayAnimation && animations.length > 0) {
            this.playAnimation(0);
        }
    }

    /**
     * 播放动画
     *
     * @param {number|string} index - 动画索引或名称
     * @param {Object} options - 播放选项
     * @param {boolean} options.loop - 是否循环播放
     * @param {number} options.fadeIn - 淡入时间（秒）
     * @param {number} options.fadeOut - 淡出时间（秒）
     */
    playAnimation(index, options = {}) {
        if (!this.animations || !this.mixer) return;

        const clip =
            typeof index === 'number'
                ? this.animations[index]
                : this.animations.find((a) => a.name === index);

        if (!clip) {
            // eslint-disable-next-line no-console
            console.warn(`ModelLoader: Animation "${index}" not found`);
            return;
        }

        // 停止当前动画（带淡出效果）
        if (this.currentAction) {
            const fadeOutTime = options.fadeOut || 0.5;
            this.currentAction.fadeOut(fadeOutTime);
        }

        // 创建新动画动作
        const action = this.mixer.clipAction(clip);

        // 设置循环模式
        if (options.loop !== undefined) {
            action.setLoop(
                options.loop ? THREE.LoopRepeat : THREE.LoopOnce,
                options.loop ? Infinity : 1
            );
        } else {
            action.setLoop(THREE.LoopRepeat, Infinity);
        }

        // 设置播放速度
        action.setEffectiveTimeScale(this.animationSpeed);

        // 淡入效果
        const fadeInTime = options.fadeIn || 0.5;
        action.reset().fadeIn(fadeInTime).play();

        this.currentAction = action;
        this.currentAnimationName = clip.name;
        this.isAnimationPlaying = true;

        // 触发动画开始事件
        this.emit('animationStarted', {
            name: clip.name,
            duration: clip.duration
        });

        // 监听动画完成事件
        const onFinished = () => {
            this.emit('animationFinished', { name: clip.name });
            this.mixer.removeEventListener('finished', onFinished);
        };
        this.mixer.addEventListener('finished', onFinished);
    }

    /**
     * 暂停动画
     */
    pauseAnimation() {
        if (this.currentAction && this.isAnimationPlaying) {
            this.currentAction.paused = true;
            this.isAnimationPlaying = false;
            this.emit('animationPaused', { name: this.currentAnimationName });
        }
    }

    /**
     * 恢复动画
     */
    resumeAnimation() {
        if (this.currentAction && !this.isAnimationPlaying) {
            this.currentAction.paused = false;
            this.isAnimationPlaying = true;
            this.emit('animationResumed', { name: this.currentAnimationName });
        }
    }

    /**
     * 停止动画
     */
    stopAnimation() {
        if (this.currentAction) {
            this.currentAction.stop();
            this.isAnimationPlaying = false;
            this.emit('animationStopped', { name: this.currentAnimationName });
        }
    }

    /**
     * 设置动画播放速度
     *
     * @param {number} speed - 播放速度（1.0 为正常速度）
     */
    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
        if (this.currentAction) {
            this.currentAction.setEffectiveTimeScale(speed);
        }
    }

    /**
     * 获取所有动画名称
     *
     * @returns {Array<string>} 动画名称数组
     */
    getAnimationNames() {
        if (!this.animations) return [];
        return this.animations.map(
            (clip) => clip.name || `Animation ${this.animations.indexOf(clip)}`
        );
    }

    /**
     * 获取当前播放的动画名称
     *
     * @returns {string|null} 当前动画名称
     */
    getCurrentAnimationName() {
        return this.currentAnimationName || null;
    }

    /**
     * 获取动画播放状态
     *
     * @returns {boolean} 是否正在播放
     */
    isPlaying() {
        return this.isAnimationPlaying;
    }

    /**
     * 获取模型
     *
     * @returns {THREE.Group} 模型对象
     */
    getModel() {
        return this.model;
    }

    /**
     * 通过名称查找 Mesh
     *
     * @param {string} name - Mesh 名称
     * @returns {THREE.Mesh|null} 找到的 Mesh 对象
     */
    getMeshByName(name) {
        if (!this.model) {
            // eslint-disable-next-line no-console
            console.warn('ModelLoader: Model not loaded yet');
            return null;
        }

        let foundMesh = null;
        this.model.traverse((child) => {
            if (child.isMesh && child.name === name) {
                foundMesh = child;
            }
        });

        return foundMesh;
    }

    /**
     * 查找符合条件的 Mesh
     *
     * @param {Object} criteria - 查找条件
     * @param {string} criteria.name - Mesh 名称
     * @param {string} criteria.type - Mesh 类型
     * @param {Function} criteria.filter - 自定义过滤函数
     * @returns {THREE.Mesh|null} 找到的 Mesh 对象
     */
    findMesh(criteria) {
        if (!this.model) {
            // eslint-disable-next-line no-console
            console.warn('ModelLoader: Model not loaded yet');
            return null;
        }

        let foundMesh = null;
        this.model.traverse((child) => {
            if (child.isMesh) {
                let matches = true;

                // 按名称匹配
                if (criteria.name && child.name !== criteria.name) {
                    matches = false;
                }

                // 按类型匹配
                if (criteria.type && child.type !== criteria.type) {
                    matches = false;
                }

                // 自定义过滤函数
                if (criteria.filter && !criteria.filter(child)) {
                    matches = false;
                }

                if (matches) {
                    foundMesh = child;
                }
            }
        });

        return foundMesh;
    }

    /**
     * 获取所有 Mesh 对象
     *
     * @returns {Array<THREE.Mesh>} Mesh 对象数组
     */
    getAllMeshes() {
        if (!this.model) {
            // eslint-disable-next-line no-console
            console.warn('ModelLoader: Model not loaded yet');
            return [];
        }

        const meshes = [];
        this.model.traverse((child) => {
            if (child.isMesh) {
                meshes.push(child);
            }
        });

        return meshes;
    }

    /**
     * 获取所有 Mesh 的名称列表
     *
     * @returns {Array<string>} Mesh 名称数组
     */
    getMeshNames() {
        const meshes = this.getAllMeshes();
        return meshes.map((mesh) => mesh.name).filter((name) => name);
    }

    /**
     * 设置交互对象
     * 根据 interactiveMeshes 配置筛选可交互的 Mesh
     */
    setupInteractiveObjects() {
        if (!this.model) {
            // eslint-disable-next-line no-console
            console.warn('ModelLoader: Model not loaded, cannot setup interactive objects');
            return;
        }

        const { interactiveMeshes } = this.config;

        // 首先清除所有 Mesh 的事件发射器
        const allMeshes = this.getAllMeshes();
        allMeshes.forEach((mesh) => {
            if (mesh.userData.eventEmitter) {
                delete mesh.userData.eventEmitter;
            }
        });

        this.interactiveObjects = [];

        // 禁用所有事件
        if (
            interactiveMeshes === false ||
            interactiveMeshes === null ||
            interactiveMeshes === undefined
        ) {
            return;
        }

        // 启用所有 Mesh 的事件
        if (interactiveMeshes === '*') {
            this.interactiveObjects = [...allMeshes];

            // 为每个 Mesh 附加事件发射器（关键修复！）
            this.interactiveObjects.forEach((mesh) => {
                mesh.userData.eventEmitter = this.eventEmitter;
            });

            // 性能警告
            if (allMeshes.length > 50) {
                // eslint-disable-next-line no-console
                console.warn(
                    `[W3D Performance Warning] ModelLoader: Enabling events for all meshes (count: ${allMeshes.length}) may impact performance. ` +
                        "Consider specifying only interactive meshes using interactiveMeshes: ['mesh1', 'mesh2']."
                );
            }
            return;
        }

        // 启用指定 Mesh 的事件
        if (Array.isArray(interactiveMeshes)) {
            const foundMeshes = [];
            const notFoundMeshes = [];

            interactiveMeshes.forEach((meshName) => {
                const mesh = this.getMeshByName(meshName);
                if (mesh) {
                    foundMeshes.push(mesh);
                } else {
                    notFoundMeshes.push(meshName);
                }
            });

            this.interactiveObjects = foundMeshes;

            // 为每个找到的 Mesh 附加事件发射器（关键修复！）
            this.interactiveObjects.forEach((mesh) => {
                mesh.userData.eventEmitter = this.eventEmitter;
            });

            // 警告未找到的 Mesh
            if (notFoundMeshes.length > 0) {
                // eslint-disable-next-line no-console
                console.warn(
                    `ModelLoader: The following mesh names were not found in the model: ${notFoundMeshes.join(', ')}. ` +
                        `Available meshes: ${this.getMeshNames().join(', ')}`
                );
            }

            return;
        }

        // eslint-disable-next-line no-console
        console.warn(
            `ModelLoader: Invalid interactiveMeshes configuration: ${interactiveMeshes}. ` +
                "Expected: false, '*', or array of mesh names."
        );
    }

    /**
     * 获取可交互的对象列表
     * 供 EventSystem 调用
     *
     * @returns {Array<THREE.Mesh>} 可交互的 Mesh 对象数组
     */
    getInteractiveObjects() {
        return this.interactiveObjects || [];
    }

    /**
     * 动态设置可交互的 Mesh
     *
     * @param {boolean|string|Array<string>} meshes - 交互配置
     */
    setInteractiveMeshes(meshes) {
        this.config.interactiveMeshes = meshes;
        this.setupInteractiveObjects();
    }

    /**
     * 检查指定 Mesh 是否可交互
     *
     * @param {THREE.Mesh} mesh - 要检查的 Mesh
     * @returns {boolean} 是否可交互
     */
    isMeshInteractive(mesh) {
        return this.interactiveObjects.includes(mesh);
    }

    /**
     * 应用烘焙光照
     * @param {Object} textureMapping - 物体名称到纹理路径的映射
     * @param {Object} options - 选项
     * @param {string} options.mode - 应用模式：'map' 或 'lightMap'
     * @param {number} options.intensity - 光照强度（仅 lightMap 模式）
     * @param {number} options.channel - UV 通道索引：0=UV1, 1=UV2
     */
    async applyBakedLighting(textureMapping = {}, options = {}) {
        if (!this.model) {
            // eslint-disable-next-line no-console
            console.warn('ModelLoader: 模型未加载，无法应用烘焙光照');
            return;
        }

        const {
            mode = 'map',
            intensity = 1.0,
            channel = this.config.bakedLighting.channel || 1 // 读取 channel 配置
        } = options;

        try {
            // 初始化纹理加载器
            if (!this.textureLoader) {
                this.textureLoader = new THREE.TextureLoader();
            }

            // 获取模型的所有网格
            const meshes = [];
            this.model.traverse((child) => {
                if (child.isMesh) {
                    meshes.push(child);
                }
            });

            let appliedCount = 0;
            const loadPromises = [];

            // 遍历所有网格，应用烘焙贴图（支持层级匹配）
            for (const mesh of meshes) {
                const meshName = mesh.name;
                let texturePath = null;
                let matchSource = '';

                // 优先检查 Mesh 自身名称
                if (textureMapping[meshName]) {
                    texturePath = textureMapping[meshName];
                    matchSource = `Mesh自身 "${meshName}"`;
                }

                // 如果 Mesh 自身没有映射，检查父级层级
                if (!texturePath && mesh.parent) {
                    let currentParent = mesh.parent;
                    let level = 1;

                    // 向上遍历父级层级，最多检查3层
                    while (currentParent && level <= 3) {
                        const parentName = currentParent.name;

                        if (parentName && textureMapping[parentName]) {
                            texturePath = textureMapping[parentName];
                            matchSource = `父级${level}层 "${parentName}"`;
                            break;
                        }

                        currentParent = currentParent.parent;
                        level++;
                    }
                }

                if (texturePath) {
                    const promise = this.loadAndApplyBakeTexture(
                        mesh,
                        texturePath,
                        mode,
                        intensity,
                        matchSource,
                        channel
                    );
                    loadPromises.push(promise);
                }
            }

            // 等待所有纹理加载完成
            const results = await Promise.allSettled(loadPromises);

            results.forEach((result) => {
                if (result.status === 'fulfilled') {
                    appliedCount++;
                } else {
                    // eslint-disable-next-line no-console
                    console.error('纹理加载失败:', result.reason);
                }
            });

            // 触发烘焙光照应用事件
            this.emit('bakedLightingApplied', { appliedCount, mode, intensity });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('应用烘焙光照失败:', error);
            this.emit('bakedLightingError', { error: error.message });
        }
    }

    /**
     * 加载并应用烘焙纹理到网格
     * @param {THREE.Mesh} mesh - 目标网格
     * @param {string} texturePath - 纹理路径
     * @param {string} mode - 应用模式
     * @param {number} intensity - 光照强度
     * @param {string} matchSource - 匹配来源描述
     * @param {number} channel - UV 通道索引
     */
    async loadAndApplyBakeTexture(
        mesh,
        texturePath,
        mode,
        intensity,
        _matchSource = '',
        channel = 1
    ) {
        return new Promise((resolve, reject) => {
            // 检查缓存
            if (this.bakedTextureCache.has(texturePath)) {
                const cachedTexture = this.bakedTextureCache.get(texturePath);
                this.applyTextureToMesh(mesh, cachedTexture, mode, intensity, channel);
                resolve(mesh);
                return;
            }

            // 加载新纹理
            this.textureLoader.load(
                texturePath,
                // 加载成功
                (texture) => {
                    // GLB/GLTF 模型必须设置 flipY = false
                    texture.flipY = false;
                    texture.colorSpace = THREE.SRGBColorSpace;

                    // 缓存纹理
                    this.bakedTextureCache.set(texturePath, texture);

                    // 应用到网格
                    this.applyTextureToMesh(mesh, texture, mode, intensity, channel);

                    resolve(mesh);
                },
                // 加载进度
                undefined,
                // 加载失败
                (error) => {
                    // eslint-disable-next-line no-console
                    console.error(`纹理加载失败: ${texturePath}`, error);
                    reject(new Error(`纹理加载失败: ${texturePath} - ${error.message}`));
                }
            );
        });
    }

    /**
     * 将纹理应用到网格
     * @param {THREE.Mesh} mesh - 目标网格
     * @param {THREE.Texture} texture - 纹理
     * @param {string} mode - 应用模式
     * @param {number} intensity - 光照强度
     * @param {number} channel - UV 通道索引：0=UV1, 1=UV2
     */
    applyTextureToMesh(mesh, texture, mode, intensity, channel = 1) {
        // 保存原始材质（如果还没有保存）
        if (!this.originalMaterials.has(mesh.uuid)) {
            this.originalMaterials.set(mesh.uuid, mesh.material);
        }

        // 重要：克隆材质以避免共享问题
        mesh.material = mesh.material.clone();

        if (mode === 'lightMap') {
            // 设置 UV 通道（重要：lightMap 通常使用 UV2）
            texture.channel = channel;

            // 使用光照贴图模式
            mesh.material.lightMap = texture;
            mesh.material.lightMapIntensity = intensity;
        } else {
            // 使用替换贴图模式（通常使用默认 UV1）
            mesh.material.map = texture;
        }

        mesh.material.needsUpdate = true;
    }

    /**
     * 更新烘焙强度
     * @param {number} intensity - 新的强度值
     */
    updateBakedIntensity(intensity) {
        if (!this.model) return;

        this.model.traverse((child) => {
            if (child.isMesh && child.material.lightMap) {
                child.material.lightMapIntensity = intensity;
                child.material.needsUpdate = true;
            }
        });
    }

    /**
     * 移除烘焙光照
     */
    removeBakedLighting() {
        if (!this.model) return;

        let removedCount = 0;

        this.model.traverse((child) => {
            if (child.isMesh) {
                // 恢复原始材质
                const originalMaterial = this.originalMaterials.get(child.uuid);
                if (originalMaterial) {
                    child.material = originalMaterial;
                    removedCount++;
                }
            }
        });

        // 清空原始材质缓存
        this.originalMaterials.clear();

        // 触发烘焙光照移除事件
        this.emit('bakedLightingRemoved', { removedCount });
    }

    /**
     * 销毁组件
     */
    onDispose() {
        if (this.mixer) {
            this.scene.animationManager.remove(this.model);
        }

        // 清理烘焙光照资源
        if (this.bakedTextureCache) {
            this.bakedTextureCache.forEach((texture) => {
                texture.dispose();
            });
            this.bakedTextureCache.clear();
        }

        if (this.originalMaterials) {
            this.originalMaterials.clear();
        }

        if (this.model) {
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((m) => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
        }
    }
}

export default ModelLoader;
