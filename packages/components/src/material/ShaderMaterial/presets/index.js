/**
 * ShaderMaterial 预设材质库
 *
 * 提供常用的着色器材质预设，简化材质创建流程
 */

import {
    createBasicColorMaterial,
    getBasicColorMaterialDefaults,
    BasicColorMaterialMeta
} from './BasicColorMaterial.js';

import {
    createGradientMaterial,
    getGradientMaterialDefaults,
    GradientMaterialMeta
} from './GradientMaterial.js';

import {
    createAnimatedMaterial,
    getAnimatedMaterialDefaults,
    AnimatedMaterialMeta
} from './AnimatedMaterial.js';

import {
    createDiffusionMaterial,
    getDiffusionMaterialDefaults,
    DiffusionMaterialMeta
} from './DiffusionMaterial.js';

/**
 * 预设材质工厂函数映射表
 */
export const PRESET_FACTORIES = {
    basicColor: createBasicColorMaterial,
    gradient: createGradientMaterial,
    animated: createAnimatedMaterial,
    diffusion: createDiffusionMaterial
};

/**
 * 预设材质默认参数映射表
 */
export const PRESET_DEFAULTS = {
    basicColor: getBasicColorMaterialDefaults,
    gradient: getGradientMaterialDefaults,
    animated: getAnimatedMaterialDefaults,
    diffusion: getDiffusionMaterialDefaults
};

/**
 * 预设材质元数据映射表
 */
export const PRESET_META = {
    basicColor: BasicColorMaterialMeta,
    gradient: GradientMaterialMeta,
    animated: AnimatedMaterialMeta,
    diffusion: DiffusionMaterialMeta
};

/**
 * 获取所有可用的预设材质名称
 * @returns {string[]} 预设材质名称数组
 */
export function getAvailablePresets() {
    return Object.keys(PRESET_FACTORIES);
}

/**
 * 检查预设材质是否存在
 * @param {string} presetName - 预设材质名称
 * @returns {boolean} 是否存在
 */
export function hasPreset(presetName) {
    return presetName in PRESET_FACTORIES;
}

/**
 * 获取预设材质的默认参数
 * @param {string} presetName - 预设材质名称
 * @returns {Object|null} 默认参数对象，如果预设不存在则返回 null
 */
export function getPresetDefaults(presetName) {
    const defaultsGetter = PRESET_DEFAULTS[presetName];
    return defaultsGetter ? defaultsGetter() : null;
}

/**
 * 获取预设材质的元数据
 * @param {string} presetName - 预设材质名称
 * @returns {Object|null} 元数据对象，如果预设不存在则返回 null
 */
export function getPresetMeta(presetName) {
    return PRESET_META[presetName] || null;
}

/**
 * 创建预设材质配置
 * @param {string} presetName - 预设材质名称
 * @param {Object} params - 材质参数
 * @returns {Object|null} 材质配置对象，如果预设不存在则返回 null
 */
export function createPresetMaterial(presetName, params = {}) {
    const factory = PRESET_FACTORIES[presetName];
    if (!factory) {
        // eslint-disable-next-line no-console
        console.error(`ShaderMaterial: 预设材质 "${presetName}" 不存在`);
        return null;
    }
    return factory(params);
}

// 导出所有预设材质工厂函数
export {
    createBasicColorMaterial,
    createGradientMaterial,
    createAnimatedMaterial,
    createDiffusionMaterial
};
