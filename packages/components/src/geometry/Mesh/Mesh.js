import { Component } from '@w3d/core';
import * as THREE from 'three';
import {
    createPresetMaterial,
    getAvailablePresets,
    getPresetDefaults
} from '../../material/ShaderMaterial/presets/index.js';

/**
 * Mesh 几何体组件
 *
 * @class Mesh
 * @extends Component
 * @description 创建各种基础几何体的组件，支持多种几何体类型和材质配置
 *
 * 支持的几何体类型：
 * - Plane（平面）
 * - Box（立方体）
 * - Sphere（球体）
 * - Cylinder（圆柱体）
 * - Cone（圆锥体）
 * - Torus（圆环）
 * - TorusKnot（圆环结）
 * - Dodecahedron（十二面体）
 * - Icosahedron（二十面体）
 * - Octahedron（八面体）
 * - Tetrahedron（四面体）
 *
 * @example
 * // 创建立方体
 * const box = await scene.add('Mesh', {
 *     type: 'Box',
 *     width: 2,
 *     height: 2,
 *     depth: 2,
 *     material: {
 *         color: '#00ff00',
 *         wireframe: false
 *     }
 * });
 *
 * @example
 * // 创建球体
 * const sphere = await scene.add('Mesh', {
 *     type: 'Sphere',
 *     radius: 1,
 *     widthSegments: 32,
 *     heightSegments: 32,
 *     material: {
 *         color: '#ff0000',
 *         metalness: 0.5,
 *         roughness: 0.5
 *     }
 * });
 */
export class Mesh extends Component {
    static defaultConfig = {
        // 几何体类型
        type: 'Box',

        // 通用参数
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],

        // Box 参数
        width: 1,
        height: 1,
        depth: 1,
        widthSegments: 1,
        heightSegments: 1,
        depthSegments: 1,

        // Sphere 参数
        radius: 1,
        // widthSegments: 32,
        // heightSegments: 32,
        phiStart: 0,
        phiLength: Math.PI * 2,
        thetaStart: 0,
        thetaLength: Math.PI,

        // Cylinder 参数
        radiusTop: 1,
        radiusBottom: 1,
        // height: 1,
        radialSegments: 32,
        // heightSegments: 1,
        openEnded: false,
        thetaStart: 0,
        thetaLength: Math.PI * 2,

        // Cone 参数
        // radius: 1,
        // height: 1,
        // radialSegments: 32,
        // heightSegments: 1,
        // openEnded: false,
        // thetaStart: 0,
        // thetaLength: Math.PI * 2,

        // Plane 参数
        // width: 1,
        // height: 1,
        // widthSegments: 1,
        // heightSegments: 1,

        // Torus 参数
        // radius: 1,
        tube: 0.4,
        // radialSegments: 16,
        tubularSegments: 100,
        arc: Math.PI * 2,

        // TorusKnot 参数
        // radius: 1,
        // tube: 0.4,
        // tubularSegments: 64,
        // radialSegments: 8,
        p: 2,
        q: 3,

        // Polyhedron 参数（十二面体、二十面体等）
        // radius: 1,
        detail: 0,

        // 材质类型：'standard' 或 'shader'
        materialType: 'standard',

        // 着色器预设（当 materialType 为 'shader' 时使用）
        shaderPreset: 'basicColor',

        // 标准材质配置（当 materialType 为 'standard' 时使用）
        material: {
            color: '#00ff00',
            wireframe: false,
            transparent: false,
            opacity: 1.0,
            metalness: 0.5,
            roughness: 0.5,
            emissive: '#000000',
            emissiveIntensity: 0,
            side: THREE.FrontSide // FrontSide, BackSide, DoubleSide
        },

        // 着色器材质 uniform 参数（当 materialType 为 'shader' 时使用）
        shaderUniforms: {
            // 根据不同预设提供对应的参数
            // basicColor: { color: '#00ff00' }
            // gradient: { color1: '#ff0000', color2: '#0000ff' }
            // animated: { color: '#00ff00', speed: 1.0 }
            // diffusion: { uBaseColor: '#3319cc', uSpeed: 1.0, uIntensity: 1.0 }
        },

        // 阴影
        castShadow: true,
        receiveShadow: true
    };

    /**
     * 组件创建时调用
     */
    onCreate() {
        console.log(`[Mesh] 创建几何体组件: ${this.config.type}`);

        try {
            // 创建几何体
            this.geometry = this.createGeometry();

            // 创建材质
            this.material = this.createMaterial();

            // 创建网格
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.name = this.config.name || `mesh_${this.config.type}`;

            // 添加到组件场景
            this.componentScene.add(this.mesh);

            console.log(`[Mesh] 几何体创建成功: ${this.config.type}`);
        } catch (error) {
            console.error('[Mesh] 创建几何体失败:', error);
            throw error;
        }
    }

    /**
     * 组件挂载完成时调用
     */
    onMounted() {
        // 设置位置
        if (this.config.position) {
            const [x, y, z] = this.config.position;
            this.mesh.position.set(x, y, z);
        }

        // 设置旋转
        if (this.config.rotation) {
            const [x, y, z] = this.config.rotation;
            this.mesh.rotation.set(x, y, z);
        }

        // 设置缩放
        if (this.config.scale) {
            if (Array.isArray(this.config.scale)) {
                const [x, y, z] = this.config.scale;
                this.mesh.scale.set(x, y, z);
            } else {
                this.mesh.scale.setScalar(this.config.scale);
            }
        }

        // 设置阴影
        this.mesh.castShadow = this.config.castShadow;
        this.mesh.receiveShadow = this.config.receiveShadow;

        console.log('[Mesh] 组件挂载完成');
    }

    /**
     * 每帧更新（用于着色器动画）
     * @param {number} delta - 时间增量
     */
    onUpdate(delta) {
        // 如果使用着色器材质，更新时间 uniform
        if (this.config.materialType === 'shader' && this.material && this.material.uniforms) {
            if (this.material.uniforms.time) {
                this.shaderTime = (this.shaderTime || 0) + delta;
                this.material.uniforms.time.value = this.shaderTime;
            }
        }
    }

    /**
     * 创建几何体
     * @returns {THREE.BufferGeometry}
     */
    createGeometry() {
        const { type } = this.config;

        switch (type) {
        case 'Plane':
            return new THREE.PlaneGeometry(
                this.config.width,
                this.config.height,
                this.config.widthSegments,
                this.config.heightSegments
            );

        case 'Box':
            return new THREE.BoxGeometry(
                this.config.width,
                this.config.height,
                this.config.depth,
                this.config.widthSegments,
                this.config.heightSegments,
                this.config.depthSegments
            );

        case 'Sphere':
            return new THREE.SphereGeometry(
                this.config.radius,
                this.config.widthSegments || 32,
                this.config.heightSegments || 32,
                this.config.phiStart,
                this.config.phiLength,
                this.config.thetaStart,
                this.config.thetaLength
            );

        case 'Cylinder':
            return new THREE.CylinderGeometry(
                this.config.radiusTop,
                this.config.radiusBottom,
                this.config.height,
                this.config.radialSegments,
                this.config.heightSegments,
                this.config.openEnded,
                this.config.thetaStart,
                this.config.thetaLength
            );

        case 'Cone':
            return new THREE.ConeGeometry(
                this.config.radius,
                this.config.height,
                this.config.radialSegments || 32,
                this.config.heightSegments || 1,
                this.config.openEnded,
                this.config.thetaStart,
                this.config.thetaLength
            );

        case 'Torus':
            return new THREE.TorusGeometry(
                this.config.radius,
                this.config.tube,
                this.config.radialSegments || 16,
                this.config.tubularSegments,
                this.config.arc
            );

        case 'TorusKnot':
            return new THREE.TorusKnotGeometry(
                this.config.radius,
                this.config.tube,
                this.config.tubularSegments || 64,
                this.config.radialSegments || 8,
                this.config.p,
                this.config.q
            );

        case 'Dodecahedron':
            return new THREE.DodecahedronGeometry(this.config.radius, this.config.detail);

        case 'Icosahedron':
            return new THREE.IcosahedronGeometry(this.config.radius, this.config.detail);

        case 'Octahedron':
            return new THREE.OctahedronGeometry(this.config.radius, this.config.detail);

        case 'Tetrahedron':
            return new THREE.TetrahedronGeometry(this.config.radius, this.config.detail);

        default:
            console.warn(`[Mesh] 未知的几何体类型: ${type}，使用默认 Box`);
            return new THREE.BoxGeometry(1, 1, 1);
        }
    }

    /**
     * 创建材质
     * @returns {THREE.Material}
     */
    createMaterial() {
        const { materialType } = this.config;

        if (materialType === 'shader') {
            return this.createShaderMaterial();
        } else {
            return this.createStandardMaterial();
        }
    }

    /**
     * 创建标准材质
     * @returns {THREE.MeshStandardMaterial}
     */
    createStandardMaterial() {
        const mat = this.config.material;

        return new THREE.MeshStandardMaterial({
            color: new THREE.Color(mat.color),
            wireframe: mat.wireframe,
            transparent: mat.transparent,
            opacity: mat.opacity,
            metalness: mat.metalness,
            roughness: mat.roughness,
            emissive: new THREE.Color(mat.emissive),
            emissiveIntensity: mat.emissiveIntensity,
            side: mat.side
        });
    }

    /**
     * 创建着色器材质
     * @returns {THREE.ShaderMaterial}
     */
    createShaderMaterial() {
        const { shaderPreset, shaderUniforms } = this.config;

        // 获取预设材质配置
        const presetConfig = createPresetMaterial(shaderPreset, shaderUniforms || {});

        if (!presetConfig) {
            console.warn(
                `[Mesh] 着色器预设 "${shaderPreset}" 不存在，使用默认标准材质。可用预设: ${getAvailablePresets().join(', ')}`
            );
            return this.createStandardMaterial();
        }

        // 创建着色器材质
        const material = new THREE.ShaderMaterial({
            vertexShader: presetConfig.vertexShader,
            fragmentShader: presetConfig.fragmentShader,
            uniforms: presetConfig.uniforms || {},
            transparent: presetConfig.transparent !== undefined ? presetConfig.transparent : false,
            side: presetConfig.side !== undefined ? presetConfig.side : THREE.FrontSide,
            wireframe: presetConfig.wireframe !== undefined ? presetConfig.wireframe : false,
            depthTest: presetConfig.depthTest !== undefined ? presetConfig.depthTest : true,
            depthWrite: presetConfig.depthWrite !== undefined ? presetConfig.depthWrite : true
        });

        // 保存时间引用（用于动画材质）
        this.shaderTime = 0;

        return material;
    }

    /**
     * 更新几何体参数
     * @param {Object} params - 新的参数
     */
    updateGeometry(params) {
        // 更新配置
        Object.assign(this.config, params);

        // 销毁旧几何体
        if (this.geometry) {
            this.geometry.dispose();
        }

        // 创建新几何体
        this.geometry = this.createGeometry();
        this.mesh.geometry = this.geometry;

        console.log('[Mesh] 几何体参数已更新');
    }

    /**
     * 更新材质参数
     * @param {Object} params - 新的材质参数
     */
    updateMaterial(params) {
        const { materialType } = this.config;

        if (materialType === 'shader') {
            // 更新着色器材质参数
            this.updateShaderMaterial(params);
        } else {
            // 更新标准材质参数
            this.updateStandardMaterial(params);
        }

        console.log('[Mesh] 材质参数已更新');
    }

    /**
     * 更新标准材质参数
     * @param {Object} params - 新的材质参数
     */
    updateStandardMaterial(params) {
        // 检查材质是否存在
        if (!this.material) {
            console.warn('[Mesh] 材质未初始化,无法更新');
            return;
        }

        // 检查材质类型
        if (!(this.material instanceof THREE.MeshStandardMaterial)) {
            console.warn('[Mesh] 当前材质不是 MeshStandardMaterial,无法更新标准材质参数');
            return;
        }

        // 更新配置对象
        Object.assign(this.config.material, params);

        // 逐个更新材质属性 (不使用 Object.assign,因为 Three.js Material 对象可能被冻结)
        if (params.color !== undefined) {
            this.material.color.set(params.color);
        }
        if (params.wireframe !== undefined) {
            this.material.wireframe = params.wireframe;
        }
        if (params.transparent !== undefined) {
            this.material.transparent = params.transparent;
        }
        if (params.opacity !== undefined) {
            this.material.opacity = params.opacity;
        }
        if (params.metalness !== undefined) {
            this.material.metalness = params.metalness;
        }
        if (params.roughness !== undefined) {
            this.material.roughness = params.roughness;
        }
        if (params.emissive !== undefined) {
            this.material.emissive.set(params.emissive);
        }
        if (params.emissiveIntensity !== undefined) {
            this.material.emissiveIntensity = params.emissiveIntensity;
        }
        if (params.side !== undefined) {
            this.material.side = params.side;
        }

        // 标记材质需要更新
        this.material.needsUpdate = true;

        console.log('[Mesh] 标准材质参数已更新:', params);
    }

    /**
     * 更新着色器材质参数
     * @param {Object} params - 新的 uniform 参数
     */
    updateShaderMaterial(params) {
        Object.assign(this.config.shaderUniforms, params);

        if (!this.material || !this.material.uniforms) {
            console.warn('[Mesh] 着色器材质未初始化');
            return;
        }

        // 更新 uniform 值
        Object.keys(params).forEach((key) => {
            if (this.material.uniforms[key]) {
                const value = params[key];
                // 如果是颜色值，转换为 THREE.Color
                if (
                    typeof value === 'string' &&
                    (value.startsWith('#') || value.startsWith('rgb'))
                ) {
                    this.material.uniforms[key].value = new THREE.Color(value);
                } else {
                    this.material.uniforms[key].value = value;
                }
            }
        });

        this.material.needsUpdate = true;
    }

    /**
     * 切换材质类型
     * @param {string} materialType - 材质类型：'standard' 或 'shader'
     * @param {Object} options - 额外选项
     */
    switchMaterialType(materialType, options = {}) {
        if (this.config.materialType === materialType) {
            console.log(`[Mesh] 材质类型已经是 ${materialType}`);
            return;
        }

        // 更新配置
        this.config.materialType = materialType;

        if (materialType === 'shader' && options.shaderPreset) {
            this.config.shaderPreset = options.shaderPreset;
        }

        if (options.shaderUniforms) {
            this.config.shaderUniforms = {
                ...this.config.shaderUniforms,
                ...options.shaderUniforms
            };
        }

        // 销毁旧材质
        if (this.material) {
            this.material.dispose();
        }

        // 创建新材质
        this.material = this.createMaterial();
        this.mesh.material = this.material;

        console.log(`[Mesh] 材质类型已切换为: ${materialType}`);
    }

    /**
     * 更新着色器预设
     * @param {string} preset - 预设名称
     * @param {Object} uniforms - uniform 参数
     */
    updateShaderPreset(preset, uniforms = {}) {
        if (this.config.materialType !== 'shader') {
            console.warn('[Mesh] 当前不是着色器材质，无法更新预设');
            return;
        }

        this.config.shaderPreset = preset;
        this.config.shaderUniforms = { ...this.config.shaderUniforms, ...uniforms };

        // 销毁旧材质
        if (this.material) {
            this.material.dispose();
        }

        // 创建新材质
        this.material = this.createShaderMaterial();
        this.mesh.material = this.material;

        console.log(`[Mesh] 着色器预设已更新为: ${preset}`);
    }

    /**
     * 组件销毁时调用
     */
    onDispose() {
        console.log('[Mesh] 销毁几何体组件');

        // 清理几何体
        if (this.geometry) {
            this.geometry.dispose();
            this.geometry = null;
        }

        // 清理材质
        if (this.material) {
            this.material.dispose();
            this.material = null;
        }

        // 清理网格
        if (this.mesh) {
            this.componentScene.remove(this.mesh);
            this.mesh = null;
        }
    }

    /**
     * 获取可交互的对象列表
     * @returns {Array<THREE.Object3D>}
     */
    getInteractiveObjects() {
        return this.mesh ? [this.mesh] : [];
    }
}
