import { Component } from '@w3d/core';
import * as THREE from 'three';
import {
    createPresetMaterial,
    hasPreset,
    getPresetDefaults,
    getAvailablePresets
} from './presets/index.js';

/**
 * ShaderMaterial 着色器材质管理组件
 *
 * @class ShaderMaterial
 * @extends Component
 * @description 管理多个自定义着色器材质，支持创建、获取、删除等操作
 *
 * @example
 * // 创建 ShaderMaterial 组件
 * const shaderMaterial = await scene.add('ShaderMaterial', {
 *     name: 'shaderManager'
 * });
 *
 * // 创建一个着色器材质
 * const material = shaderMaterial.createMaterial('basicShader', {
 *     vertexShader: vertexShaderCode,
 *     fragmentShader: fragmentShaderCode,
 *     uniforms: {
 *         time: { value: 0.0 },
 *         color: { value: new THREE.Color(0x00ff00) }
 *     }
 * });
 *
 * // 获取材质
 * const mat = shaderMaterial.getMaterial('basicShader');
 *
 * // 删除材质
 * shaderMaterial.removeMaterial('basicShader');
 */
export class ShaderMaterial extends Component {
    static defaultConfig = {
        // 默认配置为空，材质通过方法动态创建
    };

    constructor(scene, config = {}) {
        super(scene, config);

        // 材质存储 Map，key 为材质名称，value 为材质实例
        this.materials = new Map();

        // 时间统一变量（用于动画材质）
        this.time = 0;
    }

    /**
     * 组件挂载完成
     */
    onMounted() {
        this.emit('mounted', {
            name: this.name
        });
    }

    /**
     * 每帧更新
     * @param {number} delta - 时间增量
     */
    onUpdate(delta) {
        // 更新时间
        this.time += delta;

        // 更新所有材质中的 time uniform
        this.materials.forEach((material) => {
            if (material.uniforms && material.uniforms.time) {
                material.uniforms.time.value = this.time;
            }
        });
    }

    /**
     * 创建着色器材质
     *
     * 支持两种调用方式：
     * 1. 自定义材质：传入完整的 shader 配置
     * 2. 预设材质：使用 preset 参数指定预设材质类型
     *
     * @param {string} name - 材质的唯一标识名称
     * @param {Object} config - 材质配置
     * @param {string} config.preset - 预设材质类型（可选）：'basicColor', 'gradient', 'animated'
     * @param {string} config.vertexShader - 顶点着色器代码（GLSL）
     * @param {string} config.fragmentShader - 片段着色器代码（GLSL）
     * @param {Object} config.uniforms - 着色器 uniform 变量
     * @param {boolean} config.transparent - 是否透明，默认 false
     * @param {number} config.side - 渲染面，默认 THREE.FrontSide
     * @param {boolean} config.wireframe - 是否线框模式，默认 false
     * @param {number} config.depthTest - 是否深度测试，默认 true
     * @param {number} config.depthWrite - 是否写入深度，默认 true
     * @returns {THREE.ShaderMaterial} 创建的着色器材质
     *
     * @example
     * // 方式 1：使用预设材质
     * const material1 = shaderMaterial.createMaterial('myGradient', {
     *     preset: 'gradient',
     *     color1: '#ff0000',
     *     color2: '#0000ff'
     * });
     *
     * // 方式 2：自定义材质
     * const material2 = shaderMaterial.createMaterial('customShader', {
     *     vertexShader: `...`,
     *     fragmentShader: `...`,
     *     uniforms: { ... }
     * });
     */
    createMaterial(name, config = {}) {
        if (!name) {
            // eslint-disable-next-line no-console
            console.error('ShaderMaterial: 材质名称不能为空');
            return null;
        }

        if (this.materials.has(name)) {
            // eslint-disable-next-line no-console
            console.warn(`ShaderMaterial: 材质 "${name}" 已存在，将被覆盖`);
            // 销毁旧材质
            const oldMaterial = this.materials.get(name);
            oldMaterial.dispose();
        }

        // 如果指定了预设材质，使用预设配置
        let finalConfig = config;
        if (config.preset) {
            const presetConfig = createPresetMaterial(config.preset, config);
            if (!presetConfig) {
                // eslint-disable-next-line no-console
                console.error(
                    `ShaderMaterial: 预设材质 "${config.preset}" 不存在。可用预设: ${getAvailablePresets().join(', ')}`
                );
                return null;
            }
            // 合并预设配置和用户配置
            finalConfig = { ...presetConfig, ...config };
        }

        // 创建着色器材质
        const material = new THREE.ShaderMaterial({
            vertexShader: finalConfig.vertexShader || this.getDefaultVertexShader(),
            fragmentShader: finalConfig.fragmentShader || this.getDefaultFragmentShader(),
            uniforms: finalConfig.uniforms || {},
            transparent: finalConfig.transparent !== undefined ? finalConfig.transparent : false,
            side: finalConfig.side !== undefined ? finalConfig.side : THREE.FrontSide,
            wireframe: finalConfig.wireframe !== undefined ? finalConfig.wireframe : false,
            depthTest: finalConfig.depthTest !== undefined ? finalConfig.depthTest : true,
            depthWrite: finalConfig.depthWrite !== undefined ? finalConfig.depthWrite : true
        });

        // 存储材质
        this.materials.set(name, material);

        // 触发事件
        this.emit('materialCreated', {
            name,
            material
        });

        return material;
    }

    /**
     * 获取材质
     *
     * 支持两种调用方式：
     * 1. 仅传入名称：获取已创建的材质
     * 2. 传入名称和参数：如果材质不存在且名称是预设材质，则自动创建
     *
     * @param {string} name - 材质名称或预设材质类型
     * @param {Object} params - 材质参数（可选）
     * @returns {THREE.ShaderMaterial|null} 材质实例，如果不存在返回 null
     *
     * @example
     * // 方式 1：获取已创建的材质
     * const material1 = shaderMaterial.getMaterial('myMaterial');
     *
     * // 方式 2：获取预设材质（如果不存在则自动创建）
     * const material2 = shaderMaterial.getMaterial('gradient', {
     *     color1: '#ff0000',
     *     color2: '#0000ff'
     * });
     *
     * // 方式 3：更新已存在材质的参数
     * const material3 = shaderMaterial.getMaterial('gradient', {
     *     color1: '#00ff00'  // 只更新 color1
     * });
     */
    getMaterial(name, params) {
        // 如果材质已存在
        if (this.materials.has(name)) {
            const material = this.materials.get(name);

            // 如果提供了参数，更新 uniforms
            if (params) {
                Object.keys(params).forEach((key) => {
                    if (material.uniforms && material.uniforms[key]) {
                        const value = params[key];
                        // 如果是颜色值，转换为 THREE.Color
                        if (
                            typeof value === 'string' &&
                            (value.startsWith('#') || value.startsWith('rgb'))
                        ) {
                            material.uniforms[key].value = new THREE.Color(value);
                        } else {
                            material.uniforms[key].value = value;
                        }
                    }
                });
            }

            return material;
        }

        // 如果材质不存在，检查是否是预设材质
        if (params !== undefined && hasPreset(name)) {
            // 自动创建预设材质
            return this.createMaterial(name, {
                preset: name,
                ...params
            });
        }

        // 材质不存在且不是预设材质
        if (params === undefined) {
            // eslint-disable-next-line no-console
            console.warn(`ShaderMaterial: 材质 "${name}" 不存在`);
        } else {
            // eslint-disable-next-line no-console
            console.warn(
                `ShaderMaterial: 材质 "${name}" 不存在，且不是有效的预设材质。可用预设: ${getAvailablePresets().join(', ')}`
            );
        }

        return null;
    }

    /**
     * 删除材质
     *
     * @param {string} name - 材质名称
     * @returns {boolean} 是否删除成功
     *
     * @example
     * shaderMaterial.removeMaterial('basicShader');
     */
    removeMaterial(name) {
        if (!this.materials.has(name)) {
            // eslint-disable-next-line no-console
            console.warn(`ShaderMaterial: 材质 "${name}" 不存在`);
            return false;
        }

        const material = this.materials.get(name);
        material.dispose();
        this.materials.delete(name);

        // 触发事件
        this.emit('materialRemoved', {
            name
        });

        return true;
    }

    /**
     * 获取所有材质列表
     *
     * @returns {Array<{name: string, material: THREE.ShaderMaterial}>} 材质列表
     *
     * @example
     * const materials = shaderMaterial.getAllMaterials();
     * materials.forEach(({ name, material }) => {
     *     console.log(name, material);
     * });
     */
    getAllMaterials() {
        const result = [];
        this.materials.forEach((material, name) => {
            result.push({ name, material });
        });
        return result;
    }

    /**
     * 更新材质的 uniform 变量
     *
     * @param {string} name - 材质名称
     * @param {string} uniformName - uniform 变量名
     * @param {*} value - 新值
     * @returns {boolean} 是否更新成功
     *
     * @example
     * shaderMaterial.updateUniform('basicShader', 'color', new THREE.Color(0xff0000));
     */
    updateUniform(name, uniformName, value) {
        const material = this.getMaterial(name);
        if (!material) {
            return false;
        }

        if (!material.uniforms[uniformName]) {
            // eslint-disable-next-line no-console
            console.warn(`ShaderMaterial: 材质 "${name}" 中不存在 uniform "${uniformName}"`);
            return false;
        }

        material.uniforms[uniformName].value = value;

        // 触发事件
        this.emit('uniformUpdated', {
            materialName: name,
            uniformName,
            value
        });

        return true;
    }

    /**
     * 获取所有可用的预设材质列表
     *
     * @returns {string[]} 预设材质名称数组
     *
     * @example
     * const presets = shaderMaterial.getAvailablePresets();
     * console.log('可用预设:', presets); // ['basicColor', 'gradient', 'animated']
     */
    getAvailablePresets() {
        return getAvailablePresets();
    }

    /**
     * 获取预设材质的默认参数
     *
     * @param {string} presetName - 预设材质名称
     * @returns {Object|null} 默认参数对象，如果预设不存在则返回 null
     *
     * @example
     * const defaults = shaderMaterial.getPresetDefaults('gradient');
     * console.log(defaults); // { color1: '#ff0000', color2: '#0000ff' }
     */
    getPresetDefaults(presetName) {
        return getPresetDefaults(presetName);
    }

    /**
     * 获取默认顶点着色器
     * @private
     */
    getDefaultVertexShader() {
        return `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    }

    /**
     * 获取默认片段着色器
     * @private
     */
    getDefaultFragmentShader() {
        return `
            varying vec2 vUv;
            void main() {
                gl_FragColor = vec4(vUv.x, vUv.y, 0.5, 1.0);
            }
        `;
    }

    /**
     * 组件销毁
     */
    onDispose() {
        // 销毁所有材质
        this.materials.forEach((material) => {
            material.dispose();
        });
        this.materials.clear();

        this.emit('disposed');
    }
}
