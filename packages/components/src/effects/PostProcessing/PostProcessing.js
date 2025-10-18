import { Component } from '@w3d/core';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSRPass } from 'three/examples/jsm/postprocessing/SSRPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader.js';
import { SobelOperatorShader } from 'three/examples/jsm/shaders/SobelOperatorShader.js';
import { ReflectorForSSRPass } from 'three/examples/jsm/objects/ReflectorForSSRPass.js';

/**
 * PostProcessing 后期处理组件
 *
 * @class PostProcessing
 * @extends Component
 * @description 统一的后期处理效果组件，支持 Sobel、SSR、Bloom、AO 等多种效果
 */
export class PostProcessing extends Component {
    static defaultConfig = {
        // 启用的效果
        effects: {
            sobel: false,
            ssr: false,
            bloom: false,
            ao: false
        },

        // Sobel 边缘检测配置
        sobel: {
            enabled: false
        },

        // SSR 屏幕空间反射配置
        ssr: {
            enabled: false,
            resolutionScale: 0.5,
            thickness: 0.018,
            infiniteThick: false,
            fresnel: true,
            distanceAttenuation: true,
            maxDistance: 0.1,
            bouncing: false,
            output: 0, // 0: Default, 1: SSR, 3: Beauty, 4: Depth, 5: Normal, 7: Metalness
            opacity: 1,
            blur: true,
            groundReflector: null, // 地面反射器配置 { enabled: true, clipBias: 0.0003, color: 0x888888 }
            selects: null // 需要反射的对象数组
        },

        // Bloom 泛光配置
        bloom: {
            enabled: false,
            threshold: 0,
            strength: 1,
            radius: 0,
            exposure: 1
        },

        // AO 环境光遮蔽配置
        ao: {
            enabled: false,
            radius: 0.5,
            distanceExponent: 2,
            thickness: 10,
            scale: 1,
            samples: 16,
            distanceFallOff: 1,
            output: 0 // 0: material AO, 1: post blended AO, 2: only diffuse, 3: only AO
        }
    };

    constructor(scene, config = {}) {
        super(scene, config);

        // 后期处理合成器
        this.composer = null;

        // 各种 Pass
        this.renderPass = null;
        this.sobelPass = null;
        this.ssrPass = null;
        this.bloomPass = null;
        this.aoPass = null;
        this.outputPass = null;

        // 地面反射器
        this.groundReflector = null;

        // 窗口大小
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    /**
     * 组件挂载完成
     */
    async onMounted() {
        // 获取渲染器
        const renderer = this.scene.renderer.instance;

        // 创建 EffectComposer
        this.composer = new EffectComposer(renderer);

        // 根据配置创建各种效果
        // 注意：RenderPass 的添加时机由 setupEffects 控制
        this.setupEffects();

        // 监听窗口大小变化
        this.handleResize = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.handleResize);

        // 触发事件
        this.emit('mounted');
    }

    /**
     * 设置所有效果
     */
    setupEffects() {
        // 按照正确的顺序添加效果
        // 顺序很重要：GTAOPass -> RenderPass -> Sobel -> SSR -> Bloom -> Output
        // 注意：GTAOPass 必须在 RenderPass 之前（除了 post blended AO 模式）

        // 1. AO 环境光遮蔽（必须在 RenderPass 之前）
        if (this.config.ao.enabled) {
            this.setupAO();
        }

        // 2. 创建基础 RenderPass
        this.renderPass = new RenderPass(this.scene.scene, this.scene.camera.instance);
        this.composer.addPass(this.renderPass);

        // 3. Sobel 边缘检测（需要先转灰度）
        if (this.config.sobel.enabled) {
            this.setupSobel();
        }

        // 4. SSR 屏幕空间反射
        if (this.config.ssr.enabled) {
            this.setupSSR();
        }

        // 5. Bloom 泛光
        if (this.config.bloom.enabled) {
            this.setupBloom();
        }

        // 6. 输出 Pass（如果需要）
        if (this.needsOutputPass()) {
            this.outputPass = new OutputPass();
            this.composer.addPass(this.outputPass);
        }
    }

    /**
     * 设置 Sobel 边缘检测效果
     */
    setupSobel() {
        // 灰度转换
        const grayScalePass = new ShaderPass(LuminosityShader);
        this.composer.addPass(grayScalePass);

        // Sobel 算子
        this.sobelPass = new ShaderPass(SobelOperatorShader);
        this.sobelPass.uniforms['resolution'].value.x = this.width * window.devicePixelRatio;
        this.sobelPass.uniforms['resolution'].value.y = this.height * window.devicePixelRatio;
        this.composer.addPass(this.sobelPass);

        this.emit('sobelSetup');
    }

    /**
     * 设置 SSR 屏幕空间反射效果
     */
    setupSSR() {
        const config = this.config.ssr;

        // 创建地面反射器（如果配置了）
        if (config.groundReflector && config.groundReflector.enabled) {
            const geometry = new THREE.PlaneGeometry(1, 1);
            this.groundReflector = new ReflectorForSSRPass(geometry, {
                clipBias: config.groundReflector.clipBias || 0.0003,
                textureWidth: this.width,
                textureHeight: this.height,
                color: config.groundReflector.color || 0x888888,
                useDepthTexture: true
            });
            this.groundReflector.material.depthWrite = false;
            this.groundReflector.rotation.x = -Math.PI / 2;
            this.groundReflector.visible = false;

            // 添加到场景
            this.scene.scene.add(this.groundReflector);
        }

        // 创建 SSRPass
        this.ssrPass = new SSRPass({
            renderer: this.scene.renderer.instance,
            scene: this.scene.scene,
            camera: this.scene.camera.instance,
            width: this.width,
            height: this.height,
            groundReflector: this.groundReflector,
            selects: config.selects
        });
        // 应用配置
        this.ssrPass.resolutionScale = config.resolutionScale;
        this.ssrPass.thickness = config.thickness;
        this.ssrPass.infiniteThick = config.infiniteThick;
        this.ssrPass.fresnel = config.fresnel;
        this.ssrPass.distanceAttenuation = config.distanceAttenuation;
        this.ssrPass.maxDistance = config.maxDistance;
        this.ssrPass.bouncing = config.bouncing;
        this.ssrPass.output = config.output ?? SSRPass.OUTPUT.Default;
        this.ssrPass.opacity = config.opacity;
        this.ssrPass.blur = config.blur;

        // 同步地面反射器配置
        if (this.groundReflector) {
            this.groundReflector.fresnel = config.fresnel;
            this.groundReflector.distanceAttenuation = config.distanceAttenuation;
            this.groundReflector.maxDistance = config.maxDistance;
            this.groundReflector.opacity = config.opacity;
        }

        this.composer.addPass(this.ssrPass);

        this.emit('ssrSetup');
    }

    /**
     * 设置 Bloom 泛光效果
     */
    setupBloom() {
        const config = this.config.bloom;

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.width, this.height),
            config.strength,
            config.radius,
            config.threshold
        );

        this.bloomPass.threshold = config.threshold;
        this.bloomPass.strength = config.strength;
        this.bloomPass.radius = config.radius;

        // 设置曝光度
        if (config.exposure !== undefined) {
            this.scene.renderer.toneMappingExposure = Math.pow(config.exposure, 4.0);
        }

        this.composer.addPass(this.bloomPass);

        this.emit('bloomSetup');
    }

    /**
     * 设置 AO 环境光遮蔽效果
     */
    setupAO() {
        const config = this.config.ao;

        this.aoPass = new GTAOPass(
            this.scene.scene,
            this.scene.camera.instance,
            this.width,
            this.height
        );

        // 应用配置
        this.aoPass.updateGtaoMaterial({
            radius: config.radius,
            distanceExponent: config.distanceExponent,
            thickness: config.thickness,
            scale: config.scale,
            samples: config.samples,
            distanceFallOff: config.distanceFallOff
        });

        // 设置输出模式并添加到 composer
        // 注意：post blended AO (output=1) 需要在 RenderPass 之后
        this.updateAOPassOrder();

        this.composer.addPass(this.aoPass);

        this.emit('aoSetup');
    }

    /**
     * 更新 AO Pass 的输出模式和启用状态
     */
    updateAOPassOrder() {
        const config = this.config.ao;

        switch (config.output) {
            case 0: // material AO
                this.aoPass.output = GTAOPass.OUTPUT.Off;
                this.aoPass.enabled = true;
                if (this.renderPass) this.renderPass.enabled = true;
                break;
            case 1: // post blended AO
                this.aoPass.output = GTAOPass.OUTPUT.Default;
                this.aoPass.enabled = true;
                if (this.renderPass) this.renderPass.enabled = true;
                break;
            case 2: // only diffuse
                this.aoPass.output = GTAOPass.OUTPUT.Diffuse;
                this.aoPass.enabled = false;
                if (this.renderPass) this.renderPass.enabled = true;
                break;
            case 3: // only AO
                this.aoPass.output = GTAOPass.OUTPUT.Denoise;
                this.aoPass.enabled = true;
                if (this.renderPass) this.renderPass.enabled = false;
                break;
        }
    }

    /**
     * 判断是否需要 OutputPass
     */
    needsOutputPass() {
        return (
            this.config.ssr.enabled ||
            this.config.bloom.enabled ||
            this.config.ao.enabled ||
            this.config.sobel.enabled
        );
    }

    // ==================== 效果控制方法 ====================

    /**
     * 启用/禁用 Sobel 效果
     */
    toggleSobel(enabled) {
        this.config.sobel.enabled = enabled;
        this.rebuildComposer();
    }

    /**
     * 启用/禁用 SSR 效果
     */
    toggleSSR(enabled) {
        this.config.ssr.enabled = enabled;
        this.rebuildComposer();
    }

    /**
     * 启用/禁用 Bloom 效果
     */
    toggleBloom(enabled) {
        this.config.bloom.enabled = enabled;
        this.rebuildComposer();
    }

    /**
     * 启用/禁用 AO 效果
     */
    toggleAO(enabled) {
        this.config.ao.enabled = enabled;
        this.rebuildComposer();
    }

    /**
     * 更新 Sobel 配置
     */
    updateSobel(config) {
        Object.assign(this.config.sobel, config);
        if (this.sobelPass) {
            // Sobel 主要是分辨率参数，在 resize 时更新
            this.onWindowResize();
        }
    }

    /**
     * 更新 SSR 配置
     */
    updateSSR(config) {
        Object.assign(this.config.ssr, config);
        if (this.ssrPass) {
            const cfg = this.config.ssr;
            if (config.resolutionScale !== undefined)
                this.ssrPass.resolutionScale = cfg.resolutionScale;
            if (config.thickness !== undefined) this.ssrPass.thickness = cfg.thickness;
            if (config.infiniteThick !== undefined) this.ssrPass.infiniteThick = cfg.infiniteThick;
            if (config.fresnel !== undefined) {
                this.ssrPass.fresnel = cfg.fresnel;
                if (this.groundReflector) this.groundReflector.fresnel = cfg.fresnel;
            }
            if (config.distanceAttenuation !== undefined) {
                this.ssrPass.distanceAttenuation = cfg.distanceAttenuation;
                if (this.groundReflector)
                    this.groundReflector.distanceAttenuation = cfg.distanceAttenuation;
            }
            if (config.maxDistance !== undefined) {
                this.ssrPass.maxDistance = cfg.maxDistance;
                if (this.groundReflector) this.groundReflector.maxDistance = cfg.maxDistance;
            }
            if (config.bouncing !== undefined) this.ssrPass.bouncing = cfg.bouncing;
            if (config.output !== undefined) {
                const validOutputs = new Set([0, 1, 3, 4, 5, 7]);
                this.ssrPass.output = validOutputs.has(cfg.output)
                    ? cfg.output
                    : SSRPass.OUTPUT.Default;
            }
            if (config.opacity !== undefined) {
                this.ssrPass.opacity = cfg.opacity;
                if (this.groundReflector) this.groundReflector.opacity = cfg.opacity;
            }
            if (config.blur !== undefined) this.ssrPass.blur = cfg.blur;
        }
        this.emit('ssrUpdated', config);
    }

    /**
     * 更新 Bloom 配置
     */
    updateBloom(config) {
        Object.assign(this.config.bloom, config);
        if (this.bloomPass) {
            const cfg = this.config.bloom;
            if (config.threshold !== undefined) this.bloomPass.threshold = cfg.threshold;
            if (config.strength !== undefined) this.bloomPass.strength = cfg.strength;
            if (config.radius !== undefined) this.bloomPass.radius = cfg.radius;
            if (config.exposure !== undefined) {
                this.scene.renderer.toneMappingExposure = Math.pow(cfg.exposure, 4.0);
            }
        }
        this.emit('bloomUpdated', config);
    }

    /**
     * 更新 AO 配置
     */
    updateAO(config) {
        Object.assign(this.config.ao, config);
        if (this.aoPass) {
            const cfg = this.config.ao;

            // 更新材质参数
            const materialParams = {};
            if (config.radius !== undefined) materialParams.radius = cfg.radius;
            if (config.distanceExponent !== undefined)
                materialParams.distanceExponent = cfg.distanceExponent;
            if (config.thickness !== undefined) materialParams.thickness = cfg.thickness;
            if (config.scale !== undefined) materialParams.scale = cfg.scale;
            if (config.samples !== undefined) materialParams.samples = cfg.samples;
            if (config.distanceFallOff !== undefined)
                materialParams.distanceFallOff = cfg.distanceFallOff;

            if (Object.keys(materialParams).length > 0) {
                this.aoPass.updateGtaoMaterial(materialParams);
            }

            // 更新输出模式
            if (config.output !== undefined) {
                this.updateAOPassOrder();
            }
        }
        this.emit('aoUpdated', config);
    }

    /**
     * 重建 Composer（当启用/禁用效果时）
     */
    rebuildComposer() {
        // 清除现有的 passes
        this.composer.passes = [];
        this.sobelPass = null;
        this.ssrPass = null;
        this.bloomPass = null;
        this.aoPass = null;
        this.outputPass = null;

        // 重新添加基础 RenderPass
        this.composer.addPass(this.renderPass);

        // 重新设置效果
        this.setupEffects();

        this.emit('composerRebuilt');
    }

    /**
     * 获取 AO 贴图（用于材质）
     */
    getAOMap() {
        return this.aoPass ? this.aoPass.gtaoMap : null;
    }

    // ==================== 生命周期方法 ====================

    /**
     * 窗口大小变化处理
     */
    onWindowResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // 更新 composer 大小
        if (this.composer) {
            this.composer.setSize(this.width, this.height);
        }

        // 更新 Sobel 分辨率
        if (this.sobelPass) {
            this.sobelPass.uniforms['resolution'].value.x = this.width * window.devicePixelRatio;
            this.sobelPass.uniforms['resolution'].value.y = this.height * window.devicePixelRatio;
        }

        // 更新地面反射器
        if (this.groundReflector) {
            this.groundReflector.getRenderTarget().setSize(this.width, this.height);
            this.groundReflector.resolution.set(this.width, this.height);
        }

        this.emit('resize', { width: this.width, height: this.height });
    }

    /**
     * 每帧更新
     */
    onUpdate(delta) {
        // 使用 composer 渲染
        if (this.composer) {
            this.composer.render(delta);
        }
    }

    /**
     * 组件销毁
     */
    onDispose() {
        // 移除窗口监听
        if (this.handleResize) {
            window.removeEventListener('resize', this.handleResize);
        }

        // 清理地面反射器
        if (this.groundReflector) {
            this.scene.scene.remove(this.groundReflector);
            this.groundReflector.dispose();
            this.groundReflector = null;
        }

        // 清理 composer
        if (this.composer) {
            this.composer.dispose();
            this.composer = null;
        }

        this.emit('disposed');
    }

    /**
     * 获取可交互对象
     */
    getInteractiveObjects() {
        return [];
    }
}

export default PostProcessing;
