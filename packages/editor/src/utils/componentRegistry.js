/**
 * 组件注册表
 * 管理所有可用的 W3D 组件
 */

import { ModelLoader, GridHelper } from '@w3d/components';

// 组件注册表
const componentRegistry = new Map();

/**
 * 注册组件
 * @param {string} name - 组件名称
 * @param {Class} ComponentClass - 组件类
 * @param {Object} metadata - 组件元数据
 */
export function registerComponent(name, ComponentClass, metadata = {}) {
    componentRegistry.set(name, {
        name,
        class: ComponentClass,
        metadata: {
            displayName: metadata.displayName || name,
            description: metadata.description || '',
            icon: metadata.icon || '📦',
            category: metadata.category || 'general',
            defaultConfig: metadata.defaultConfig || {},
            configSchema: metadata.configSchema || []
        }
    });
}

/**
 * 获取组件
 * @param {string} name - 组件名称
 * @returns {Object|null} 组件信息
 */
export function getComponent(name) {
    return componentRegistry.get(name) || null;
}

/**
 * 获取所有组件
 * @returns {Array} 组件列表
 */
export function getAllComponents() {
    return Array.from(componentRegistry.values());
}

/**
 * 根据分类获取组件
 * @param {string} category - 分类名称
 * @returns {Array} 组件列表
 */
export function getComponentsByCategory(category) {
    return Array.from(componentRegistry.values()).filter(
        (comp) => comp.metadata.category === category
    );
}

/**
 * 检查组件是否已注册
 * @param {string} name - 组件名称
 * @returns {boolean}
 */
export function hasComponent(name) {
    return componentRegistry.has(name);
}

/**
 * 注销组件
 * @param {string} name - 组件名称
 */
export function unregisterComponent(name) {
    componentRegistry.delete(name);
}

/**
 * 清空注册表
 */
export function clearRegistry() {
    componentRegistry.clear();
}

// 初始化默认组件
export function initializeDefaultComponents() {
    // 注册 ModelLoader
    registerComponent('ModelLoader', ModelLoader, {
        displayName: '模型加载器',
        description: '加载 GLTF/GLB/FBX 格式的 3D 模型，支持动画和交互',
        icon: '🎨',
        category: 'loaders',
        defaultConfig: {
            url: '',
            scale: 1,
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            castShadow: false,
            receiveShadow: false,
            animations: true,
            autoPlayAnimation: false,
            interactiveMeshes: false
        },
        configSchema: [
            {
                key: 'url',
                label: '模型 URL',
                type: 'text',
                required: true,
                placeholder: '/models/example.glb',
                description: '支持 GLTF、GLB、FBX 格式'
            },
            {
                key: 'position',
                label: '位置',
                type: 'vector3',
                default: [0, 0, 0]
            },
            {
                key: 'rotation',
                label: '旋转',
                type: 'vector3',
                default: [0, 0, 0]
            },
            {
                key: 'scale',
                label: '缩放',
                type: 'number',
                default: 1,
                min: 0.01,
                max: 10,
                step: 0.1
            },
            {
                key: 'castShadow',
                label: '投射阴影',
                type: 'boolean',
                default: false
            },
            {
                key: 'receiveShadow',
                label: '接收阴影',
                type: 'boolean',
                default: false
            },
            {
                key: 'animations',
                label: '启用动画',
                type: 'boolean',
                default: true,
                description: '是否加载模型动画'
            },
            {
                key: 'autoPlayAnimation',
                label: '自动播放动画',
                type: 'boolean',
                default: false,
                description: '加载完成后自动播放第一个动画'
            },
            {
                key: 'interactiveMeshes',
                label: '交互模式',
                type: 'select',
                default: false,
                options: [
                    { label: '禁用', value: false },
                    { label: '全部启用', value: '*' },
                    { label: '指定 Mesh', value: 'custom' }
                ],
                description: '配置哪些 Mesh 可以响应交互事件'
            }
        ]
    });

    // 注册 GridHelper
    registerComponent('GridHelper', GridHelper, {
        displayName: '网格辅助',
        description: '显示网格辅助线',
        icon: '📐',
        category: 'helpers',
        defaultConfig: {
            size: 20,
            divisions: 20,
            color: '#888888'
        },
        configSchema: [
            {
                key: 'size',
                label: '网格大小',
                type: 'number',
                default: 20,
                min: 1,
                max: 100
            },
            {
                key: 'divisions',
                label: '分割数',
                type: 'number',
                default: 20,
                min: 1,
                max: 100
            },
            {
                key: 'color',
                label: '颜色',
                type: 'color',
                default: '#888888'
            }
        ]
    });
}

// 自动初始化
initializeDefaultComponents();

