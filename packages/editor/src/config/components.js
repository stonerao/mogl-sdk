/**
 * 可用组件配置
 * 定义编辑器中可以使用的所有组件
 */

export const availableComponents = [
    {
        type: 'ModelLoader',
        displayName: '模型加载器',
        description: '加载 GLTF/GLB/FBX 格式的 3D 模型',
        // icon: '🎨',
        category: 'loaders',
        enabled: true
    }
    /* {
        type: 'GridHelper',
        displayName: '网格辅助',
        description: '显示网格辅助线',
        icon: '📐',
        category: 'helpers',
        enabled: true
    } */
];

/**
 * 组件分类
 */
export const componentCategories = [
    {
        key: 'loaders',
        label: '加载器',
        icon: '📁',
        description: '模型和资源加载组件'
    },
    {
        key: 'helpers',
        label: '辅助工具',
        icon: '🛠️',
        description: '场景辅助显示组件'
    },
    {
        key: 'lights',
        label: '光源',
        icon: '💡',
        description: '场景光照组件'
    },
    {
        key: 'effects',
        label: '特效',
        icon: '✨',
        description: '视觉特效组件'
    }
];

/**
 * 根据分类获取组件
 * @param {string} category - 分类 key
 * @returns {Array} 组件列表
 */
export function getComponentsByCategory(category) {
    return availableComponents.filter((comp) => comp.category === category && comp.enabled);
}

/**
 * 获取所有启用的组件
 * @returns {Array} 组件列表
 */
export function getEnabledComponents() {
    return availableComponents.filter((comp) => comp.enabled);
}

/**
 * 根据类型获取组件配置
 * @param {string} type - 组件类型
 * @returns {Object|null} 组件配置
 */
export function getComponentConfig(type) {
    return availableComponents.find((comp) => comp.type === type) || null;
}

