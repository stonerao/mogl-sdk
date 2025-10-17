import { Component } from '@w3d/core';
import * as THREE from 'three';

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
     * @param {string} name - 材质的唯一标识名称
     * @param {Object} config - 材质配置
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
     * const material = shaderMaterial.createMaterial('gradientShader', {
     *     vertexShader: `
     *         varying vec2 vUv;
     *         void main() {
     *             vUv = uv;
     *             gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
     *         }
     *     `,
     *     fragmentShader: `
     *         uniform vec3 color1;
     *         uniform vec3 color2;
     *         varying vec2 vUv;
     *         void main() {
     *             gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
     *         }
     *     `,
     *     uniforms: {
     *         color1: { value: new THREE.Color(0xff0000) },
     *         color2: { value: new THREE.Color(0x0000ff) }
     *     },
     *     transparent: false,
     *     side: THREE.DoubleSide
     * });
     */
    createMaterial(name, config = {}) {
        if (!name) {
            console.error('ShaderMaterial: 材质名称不能为空');
            return null;
        }

        if (this.materials.has(name)) {
            console.warn(`ShaderMaterial: 材质 "${name}" 已存在，将被覆盖`);
            // 销毁旧材质
            const oldMaterial = this.materials.get(name);
            oldMaterial.dispose();
        }

        // 创建着色器材质
        const material = new THREE.ShaderMaterial({
            vertexShader: config.vertexShader || this.getDefaultVertexShader(),
            fragmentShader: config.fragmentShader || this.getDefaultFragmentShader(),
            uniforms: config.uniforms || {},
            transparent: config.transparent !== undefined ? config.transparent : false,
            side: config.side !== undefined ? config.side : THREE.FrontSide,
            wireframe: config.wireframe !== undefined ? config.wireframe : false,
            depthTest: config.depthTest !== undefined ? config.depthTest : true,
            depthWrite: config.depthWrite !== undefined ? config.depthWrite : true
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
     * @param {string} name - 材质名称
     * @returns {THREE.ShaderMaterial|null} 材质实例，如果不存在返回 null
     * 
     * @example
     * const material = shaderMaterial.getMaterial('basicShader');
     * if (material) {
     *     mesh.material = material;
     * }
     */
    getMaterial(name) {
        if (!this.materials.has(name)) {
            console.warn(`ShaderMaterial: 材质 "${name}" 不存在`);
            return null;
        }

        return this.materials.get(name);
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

