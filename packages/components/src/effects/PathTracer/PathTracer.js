import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * PathTracer GPU 路径追踪渲染组件
 *
 * @class PathTracer
 * @extends Component
 * @description 使用 GPU 路径追踪技术实现照片级真实感渲染效果
 *
 * @example
 * const pathTracer = await scene.add('PathTracer', {
 *     name: 'pathtracer',
 *     model: modelMesh,
 *     environment: hdrTexture,
 *     samples: 100,
 *     tiles: 3,
 *     resolutionScale: 1.0
 * });
 */
export class PathTracer extends Component {
    /**
     * 默认配置
     */
    static defaultConfig = {
        // 渲染设置
        enable: true, // 启用路径追踪
        pause: false, // 暂停渲染
        samples: 100, // 目标采样数
        minSamples: 3, // 最小采样数
        tiles: 3, // 分块渲染 (tiles x tiles)
        resolutionScale: 1.0, // 分辨率缩放 (0.1 - 1.0)

        // 场景设置
        model: null, // 要渲染的模型 (THREE.Object3D)
        environment: null, // 环境贴图 (THREE.Texture)
        background: null, // 背景 (THREE.Texture 或 THREE.Color)

        // 环境贴图设置
        envMapIntensity: 1.0, // 环境贴图强度
        envMapBlur: 0.0, // 环境贴图模糊度 (0-1)

        // 材质调整
        adjustMaterials: true, // 自动调整材质
        materialConfig: {
            roughnessScale: 0.25, // 粗糙度缩放
            enableTransmission: true, // 启用透射效果
            transmissionIOR: 1.4 // 透射折射率
        },

        // 地板设置
        floor: {
            enabled: false, // 启用地板
            size: 2500, // 地板大小
            roughness: 0.15, // 粗糙度
            metalness: 0.9, // 金属度
            color: '#ffffff', // 颜色
            generateTexture: true // 生成径向渐变纹理
        },

        // 渲染质量
        filterGlossyFactor: 1, // 光泽过滤因子

        // 色调映射
        toneMapping: true, // 启用色调映射
        toneMappingType: 'ACESFilmic', // 色调映射类型

        // 透明背景
        transparentBackground: false,

        // 自动开始
        autoStart: true,

        // 进度回调
        onProgress: null, // (progress) => {}
        onComplete: null // () => {}
    };

    /**
     * 组件挂载完成
     */
    async onMounted() {
        // 检查是否有模型
        if (!this.config.model) {
            console.warn('PathTracer: No model provided');
            return;
        }

        // 动态导入 three-gpu-pathtracer
        try {
            const module = await import('three-gpu-pathtracer');
            this.WebGLPathTracer = module.WebGLPathTracer;
            this.BlurredEnvMapGenerator = module.BlurredEnvMapGenerator;
            this.GradientEquirectTexture = module.GradientEquirectTexture;
        } catch (error) {
            console.error('PathTracer: Failed to load three-gpu-pathtracer library', error);
            console.warn('Please install: npm install three-gpu-pathtracer');
            return;
        }

        // 初始化路径追踪器
        this.initializePathTracer();

        // 设置环境
        this.setupEnvironment();

        // 调整材质
        if (this.config.adjustMaterials && this.config.model) {
            this.adjustModelMaterials(this.config.model);
        }

        // 添加地板
        if (this.config.floor.enabled) {
            this.createFloor();
        }

        // 添加模型到主场景 (不是 componentScene)
        // PathTracer 需要直接访问主场景中的对象
        if (this.config.model) {
            this.scene.scene.add(this.config.model);
            this.addedModel = this.config.model; // 记录以便清理
        }

        // 设置场景到路径追踪器
        await this.updateScene();

        // 设置相机控制器监听
        this.setupCameraControls();

        // 自动开始渲染
        if (this.config.autoStart) {
            this.start();
        }

        this.emit('mounted');
    }

    /**
     * 初始化路径追踪器
     */
    initializePathTracer() {
        const renderer = this.scene.renderer.instance;

        // 创建路径追踪器
        this.pathTracer = new this.WebGLPathTracer(renderer);
        this.pathTracer.filterGlossyFactor = this.config.filterGlossyFactor;
        this.pathTracer.minSamples = this.config.minSamples;
        this.pathTracer.renderScale = this.config.resolutionScale;
        this.pathTracer.tiles.set(this.config.tiles, this.config.tiles);

        // 保存原始渲染器设置
        this.originalToneMapping = renderer.toneMapping;

        // 设置色调映射
        if (this.config.toneMapping) {
            const toneMappingTypes = {
                Linear: THREE.LinearToneMapping,
                Reinhard: THREE.ReinhardToneMapping,
                Cineon: THREE.CineonToneMapping,
                ACESFilmic: THREE.ACESFilmicToneMapping,
                Custom: THREE.CustomToneMapping
            };
            renderer.toneMapping =
                toneMappingTypes[this.config.toneMappingType] || THREE.ACESFilmicToneMapping;
        }

        // 禁用 W3D Scene 的默认渲染,让 PathTracer 完全接管
        // 保存原始渲染函数
        this.originalSceneRender = this.scene.renderer.render.bind(this.scene.renderer);

        // 替换为空函数,阻止默认渲染覆盖 PathTracer 的输出
        this.scene.renderer.render = () => {
            // PathTracer 在 onUpdate 中已经调用了 renderSample()
            // 这里不需要再调用 renderer.render(),否则会覆盖 PathTracer 的渲染结果
        };

        this.isInitialized = true;
        this.currentSamples = 0;
    }

    /**
     * 设置环境
     */
    setupEnvironment() {
        // 设置背景
        if (this.config.transparentBackground) {
            this.scene.scene.background = null;
        } else if (this.config.background) {
            if (this.config.background instanceof THREE.Color) {
                this.scene.scene.background = this.config.background;
            } else {
                this.scene.scene.background = this.config.background;
            }
        } else {
            // 创建默认渐变背景
            const gradientMap = new this.GradientEquirectTexture();
            gradientMap.topColor.set(0xeeeeee);
            gradientMap.bottomColor.set(0xeaeaea);
            gradientMap.update();
            this.scene.scene.background = gradientMap;
            this.gradientMap = gradientMap;
        }
    }

    /**
     * 调整模型材质
     */
    adjustModelMaterials(model) {
        const { roughnessScale, enableTransmission, transmissionIOR } = this.config.materialConfig;

        model.traverse((child) => {
            if (child.isMesh && child.material) {
                const material = child.material;

                // 调整粗糙度
                if (material.roughness !== undefined) {
                    material.roughness *= roughnessScale;
                }

                // 处理透明材质 - 转换为透射材质
                if (enableTransmission && material.opacity < 1.0) {
                    const oldMaterial = material;
                    const newMaterial = new THREE.MeshPhysicalMaterial();

                    newMaterial.opacity = 1.0;
                    newMaterial.transmission = 1.0;
                    newMaterial.thickness = 1.0;
                    newMaterial.ior = transmissionIOR;
                    newMaterial.roughness = oldMaterial.roughness || 0.1;
                    newMaterial.metalness = 0.0;

                    // 调整颜色亮度
                    const hsl = {};
                    oldMaterial.color.getHSL(hsl);
                    hsl.l = Math.max(hsl.l, 0.35);
                    newMaterial.color.setHSL(hsl.h, hsl.s, hsl.l);

                    child.material = newMaterial;

                    // 清理旧材质
                    if (oldMaterial.dispose) {
                        oldMaterial.dispose();
                    }
                }
            }

            // 隐藏线段
            if (child.isLineSegments) {
                child.visible = false;
            }
        });
    }

    /**
     * 创建地板
     */
    createFloor() {
        const floorConfig = this.config.floor;

        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshStandardMaterial({
            side: THREE.DoubleSide,
            roughness: floorConfig.roughness,
            metalness: floorConfig.metalness,
            color: floorConfig.color,
            transparent: true
        });

        // 生成径向渐变纹理
        if (floorConfig.generateTexture) {
            material.map = this.generateRadialFloorTexture(1024);
        }

        this.floor = new THREE.Mesh(geometry, material);
        this.floor.scale.setScalar(floorConfig.size);
        this.floor.rotation.x = -Math.PI / 2;

        // 将地板放置在模型下方
        if (this.config.model) {
            const bbox = new THREE.Box3().setFromObject(this.config.model);
            this.floor.position.y = bbox.min.y;
        }

        // 添加到主场景,不是 componentScene
        this.scene.scene.add(this.floor);
    }

    /**
     * 生成径向渐变地板纹理
     */
    generateRadialFloorTexture(dim) {
        const data = new Uint8Array(dim * dim * 4);

        for (let x = 0; x < dim; x++) {
            for (let y = 0; y < dim; y++) {
                const xNorm = x / (dim - 1);
                const yNorm = y / (dim - 1);

                const xCent = 2.0 * (xNorm - 0.5);
                const yCent = 2.0 * (yNorm - 0.5);
                let a = Math.max(Math.min(1.0 - Math.sqrt(xCent ** 2 + yCent ** 2), 1.0), 0.0);
                a = a ** 1.5;
                a = a * 1.5;
                a = Math.min(a, 1.0);

                const i = y * dim + x;
                data[i * 4 + 0] = 255;
                data[i * 4 + 1] = 255;
                data[i * 4 + 2] = 255;
                data[i * 4 + 3] = a * 255;
            }
        }

        const tex = new THREE.DataTexture(data, dim, dim);
        tex.format = THREE.RGBAFormat;
        tex.type = THREE.UnsignedByteType;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.needsUpdate = true;
        return tex;
    }

    /**
     * 更新场景到路径追踪器
     */
    async updateScene() {
        if (!this.pathTracer) return;

        // 设置场景和相机
        await this.pathTracer.setScene(this.scene.scene, this.scene.camera.instance);

        this.emit('sceneUpdated');
    }

    /**
     * 设置相机控制器监听
     */
    setupCameraControls() {
        // 获取 W3D Scene 的 OrbitControls 实例
        const controls = this.scene.controls?.instance;

        if (!controls) {
            return;
        }

        // 创建相机变化处理函数
        this.cameraChangeHandler = () => {
            if (this.pathTracer && this.isInitialized) {
                // 更新 PathTracer 的相机状态
                this.pathTracer.updateCamera();

                // 重置采样计数,因为相机改变后需要重新渲染
                this.pathTracer.reset();

                // 触发相机变化事件
                this.emit('cameraChanged');
            }
        };

        // 添加事件监听器
        controls.addEventListener('change', this.cameraChangeHandler);
    }

    /**
     * 开始渲染
     */
    start() {
        this.config.enable = true;
        this.config.pause = false;
        this.isRendering = true;
        this.emit('start');
    }

    /**
     * 暂停渲染
     */
    pause() {
        this.config.pause = true;
        this.emit('pause');
    }

    /**
     * 恢复渲染
     */
    resume() {
        this.config.pause = false;
        this.emit('resume');
    }

    /**
     * 停止渲染
     */
    stop() {
        this.config.enable = false;
        this.isRendering = false;
        this.emit('stop');
    }

    /**
     * 重置渲染
     */
    reset() {
        if (this.pathTracer) {
            this.pathTracer.reset();
            this.currentSamples = 0;
            this.emit('reset');
        }
    }

    /**
     * 更新相机
     */
    updateCamera() {
        if (this.pathTracer) {
            this.pathTracer.updateCamera();
            this.emit('cameraUpdated');
        }
    }

    /**
     * 更新材质
     */
    updateMaterials() {
        if (this.pathTracer) {
            this.pathTracer.updateMaterials();
            this.emit('materialsUpdated');
        }
    }

    /**
     * 更新环境
     */
    updateEnvironment() {
        if (this.pathTracer) {
            this.pathTracer.updateEnvironment();
            this.emit('environmentUpdated');
        }
    }

    /**
     * 设置分辨率缩放
     */
    setResolutionScale(scale) {
        this.config.resolutionScale = Math.max(0.1, Math.min(1.0, scale));
        if (this.pathTracer) {
            this.pathTracer.renderScale = this.config.resolutionScale;
            this.pathTracer.reset();
        }
    }

    /**
     * 设置分块数
     */
    setTiles(tiles) {
        this.config.tiles = Math.max(1, Math.min(6, tiles));
        if (this.pathTracer) {
            this.pathTracer.tiles.set(this.config.tiles, this.config.tiles);
        }
    }

    /**
     * 获取当前采样数
     */
    getSamples() {
        return this.pathTracer ? Math.floor(this.pathTracer.samples) : 0;
    }

    /**
     * 获取渲染状态
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isRendering: this.isRendering,
            isPaused: this.config.pause,
            samples: this.getSamples(),
            targetSamples: this.config.samples,
            progress: this.getSamples() / this.config.samples
        };
    }

    /**
     * 下载渲染结果
     */
    download(filename = 'pathtraced-render.png') {
        const renderer = this.scene.renderer.instance;
        const link = document.createElement('a');
        link.download = filename;
        link.href = renderer.domElement.toDataURL().replace('image/png', 'image/octet-stream');
        link.click();
        this.emit('download', { filename });
    }

    /**
     * 每帧更新
     */
    onUpdate(_deltaTime) {
        if (!this.pathTracer || !this.isInitialized) return;

        // 更新路径追踪器状态
        this.pathTracer.enablePathTracing = this.config.enable;
        this.pathTracer.pausePathTracing = this.config.pause;

        // 渲染一个采样
        if (this.config.enable && !this.config.pause) {
            this.pathTracer.renderSample();

            const samples = this.getSamples();

            // 触发进度回调
            if (this.config.onProgress) {
                this.config.onProgress(samples / this.config.samples);
            }

            // 触发进度事件
            this.emit('progress', {
                samples,
                targetSamples: this.config.samples,
                progress: samples / this.config.samples
            });

            // 检查是否完成
            if (samples >= this.config.samples && this.currentSamples < this.config.samples) {
                this.currentSamples = samples;

                if (this.config.onComplete) {
                    this.config.onComplete();
                }

                this.emit('complete', { samples });
            }
        }
    }

    /**
     * 组件销毁
     */
    onDispose() {
        // 停止渲染
        this.stop();

        // 移除相机控制器监听
        if (this.scene.controls?.instance && this.cameraChangeHandler) {
            this.scene.controls.instance.removeEventListener('change', this.cameraChangeHandler);
            this.cameraChangeHandler = null;
        }

        // 恢复原始渲染函数
        if (this.originalSceneRender) {
            this.scene.renderer.render = this.originalSceneRender;
        }

        // 恢复原始渲染器设置
        if (this.originalToneMapping !== undefined) {
            this.scene.renderer.instance.toneMapping = this.originalToneMapping;
        }

        // 从主场景移除模型
        if (this.addedModel) {
            this.scene.scene.remove(this.addedModel);
        }

        // 清理地板
        if (this.floor) {
            this.scene.scene.remove(this.floor);
            this.floor.geometry.dispose();
            this.floor.material.dispose();
            if (this.floor.material.map) {
                this.floor.material.map.dispose();
            }
        }

        if (this.gradientMap) {
            this.gradientMap.dispose();
        }

        // 清理路径追踪器
        if (this.pathTracer) {
            this.pathTracer.reset();
            this.pathTracer = null;
        }

        this.emit('disposed');
    }
}

export default PathTracer;
