/**
 * ProjectSerializer.js
 * 工程数据序列化/反序列化系统
 *
 * 功能：
 * - 将工程数据序列化为 JSON 格式
 * - 从 JSON 数据反序列化恢复工程
 * - 处理节点、分组、属性、变换等所有数据
 * - 支持版本控制和兼容性处理
 */

import * as THREE from 'three';
import { NodeFactory } from '../nodes/NodeFactory.js';

/**
 * 工程序列化器
 */
export class ProjectSerializer {
    /**
     * 当前序列化格式版本
     */
    static VERSION = '1.0.0';

    /**
     * 序列化工程数据
     * @param {Object} options - 序列化选项
     * @param {string} options.projectName - 工程名称
     * @param {Array} options.nodes - 节点列表
     * @param {Object} options.canvasConfig - 画布配置
     * @param {Object} options.metadata - 额外的元数据
     * @param {Array} options.dataSources - 数据源列表
     * @param {Map} options.bindings - 数据绑定映射
     * @returns {Object} 序列化后的 JSON 对象
     */
    static serialize(options = {}) {
        const {
            projectName = '未命名工程',
            nodes = [],
            canvasConfig = {},
            metadata = {},
            dataSources = [],
            bindings = new Map(),
            events = [],
            globalEvents = null,
            imageAssets = null
        } = options;

        // 创建工程数据结构
        const projectData = {
            // 版本信息
            version: this.VERSION,

            // 工程元数据
            metadata: {
                name: projectName,
                createdAt: metadata.createdAt || new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                author: metadata.author || 'Unknown',
                description: metadata.description || '',
                ...metadata
            },

            // 画布配置
            canvas: {
                width: canvasConfig.width || 1920,
                height: canvasConfig.height || 1080,
                zoom: canvasConfig.zoom || 1,
                panOffset: {
                    x: canvasConfig.panOffset?.x || 0,
                    y: canvasConfig.panOffset?.y || 0
                },
                grid: {
                    enabled: canvasConfig.grid?.enabled !== false,
                    size: canvasConfig.grid?.size || 20,
                    snap: canvasConfig.grid?.snap !== false
                },
                background: canvasConfig.background || '#1a1a1a'
            },

            // 节点数据
            nodes: this.serializeNodes(nodes),

            // 数据源配置
            dataSources: this.serializeDataSources(dataSources),

            // 数据绑定关系
            bindings: this.serializeBindings(bindings),

            // 事件配置
            events: events || [],

            // 全局事件配置
            globalEvents: globalEvents || { events: [], references: [] },

            // 图片资源
            imageAssets: imageAssets || { images: [] },

            // 连接关系（预留，当前版本暂不支持）
            connections: []
        };

        return projectData;
    }

    /**
     * 序列化数据源
     * @param {Array} dataSources - 数据源列表
     * @returns {Array} 序列化后的数据源数组
     */
    static serializeDataSources(dataSources) {
        return dataSources.map(ds => {
            // 获取数据源的序列化配置
            const serialized = {
                id: ds.id,
                name: ds.name,
                type: ds.type,
                description: ds.description,
                config: {}
            };

            // 根据类型序列化特定配置
            if (ds.type === 'static') {
                serialized.config.data = ds.data;
            } else if (ds.type === 'api') {
                serialized.config.url = ds.url;
                serialized.config.method = ds.method;
                serialized.config.interval = ds.interval;
                // 注意：不序列化敏感信息如 headers 中的 token
            } else if (ds.type === 'websocket') {
                serialized.config.url = ds.url;
                serialized.config.reconnectInterval = ds.reconnectInterval;
                serialized.config.maxReconnectAttempts = ds.maxReconnectAttempts;
            } else if (ds.type === 'localStorage') {
                serialized.config.key = ds.key;
                serialized.config.defaultValue = ds.defaultValue;
                serialized.config.autoSave = ds.autoSave;
            }

            return serialized;
        });
    }

    /**
     * 序列化数据绑定
     * @param {Map} bindings - 数据绑定映射
     * @returns {Array} 序列化后的绑定数组
     */
    static serializeBindings(bindings) {
        const bindingsArray = [];

        bindings.forEach((nodeBindings, nodeId) => {
            nodeBindings.forEach((binding, propertyKey) => {
                bindingsArray.push({
                    nodeId,
                    propertyKey,
                    dataSourceId: binding.dataSourceId,
                    dataPath: binding.dataPath,
                    mode: binding.mode
                });
            });
        });

        return bindingsArray;
    }

    /**
     * 序列化节点列表
     * @param {Array} nodes - 节点列表
     * @returns {Array} 序列化后的节点数据
     */
    static serializeNodes(nodes) {
        const serializedNodes = [];
        const processedNodes = new Set();

        // 只序列化根节点（没有父节点或父节点是场景的节点）
        const rootNodes = nodes.filter(node => {
            if (!node.parent || !node.parent.nodeType) {
                return true;
            }
            return false;
        });

        // 递归序列化节点
        const serializeNode = (node) => {
            if (processedNodes.has(node.uuid)) {
                return null;
            }
            processedNodes.add(node.uuid);

            const nodeData = {
                uuid: node.uuid,
                nodeType: node.nodeType,
                nodeName: node.nodeName,

                // 变换属性
                transform: {
                    position: {
                        x: node.position.x,
                        y: node.position.y,
                        z: node.position.z
                    },
                    rotation: {
                        x: node.rotation.x,
                        y: node.rotation.y,
                        z: node.rotation.z
                    },
                    scale: {
                        x: node.scale.x,
                        y: node.scale.y,
                        z: node.scale.z
                    }
                },

                // 节点属性
                properties: this.serializeProperties(node.properties),

                // 可见性和锁定状态
                visible: node.visible,
                locked: node.locked || false
            };

            // 如果是分组节点，序列化子节点
            if (node.nodeType === 'group' && node.childNodes && node.childNodes.length > 0) {
                nodeData.children = node.childNodes
                    .map(child => serializeNode(child))
                    .filter(child => child !== null);
            }

            return nodeData;
        };

        // 序列化所有根节点
        rootNodes.forEach(node => {
            const serialized = serializeNode(node);
            if (serialized) {
                serializedNodes.push(serialized);
            }
        });

        return serializedNodes;
    }

    /**
     * 序列化节点属性
     * @param {Object} properties - 节点属性对象
     * @returns {Object} 序列化后的属性
     */
    static serializeProperties(properties) {
        if (!properties) return {};

        const serialized = {};

        for (const [key, value] of Object.entries(properties)) {
            // 处理特殊类型
            if (value instanceof THREE.Color) {
                // Three.js 颜色对象
                serialized[key] = `#${value.getHexString()}`;
            } else if (value instanceof THREE.Vector2) {
                // 二维向量
                serialized[key] = { x: value.x, y: value.y };
            } else if (value instanceof THREE.Vector3) {
                // 三维向量
                serialized[key] = { x: value.x, y: value.y, z: value.z };
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // 普通对象，递归序列化
                serialized[key] = this.serializeProperties(value);
            } else {
                // 基本类型（string, number, boolean, array）
                serialized[key] = value;
            }
        }

        return serialized;
    }

    /**
     * 反序列化工程数据
     * @param {Object} projectData - 序列化的工程数据
     * @param {Object} scene - Three.js 场景对象
     * @returns {Object} 反序列化后的工程数据
     */
    static deserialize(projectData, scene) {
        if (!projectData) {
            throw new Error('工程数据不能为空');
        }

        // 检查版本兼容性
        this.checkVersion(projectData.version);

        // 反序列化节点
        const nodes = this.deserializeNodes(projectData.nodes || [], scene);

        // 反序列化数据源
        const dataSources = this.deserializeDataSources(projectData.dataSources || []);

        // 反序列化数据绑定
        const bindings = this.deserializeBindings(projectData.bindings || []);

        // 反序列化事件配置
        const events = projectData.events || [];

        // 反序列化全局事件配置
        const globalEvents = projectData.globalEvents || { events: [], references: [] };

        // 反序列化图片资源
        const imageAssets = projectData.imageAssets || { images: [] };

        return {
            metadata: projectData.metadata || {},
            canvas: projectData.canvas || {},
            nodes: nodes,
            dataSources: dataSources,
            bindings: bindings,
            events: events,
            globalEvents: globalEvents,
            imageAssets: imageAssets,
            connections: projectData.connections || []
        };
    }

    /**
     * 反序列化数据源
     * @param {Array} dataSourcesData - 序列化的数据源数据
     * @returns {Array} 反序列化后的数据源配置数组
     */
    static deserializeDataSources(dataSourcesData) {
        return dataSourcesData.map(dsData => ({
            id: dsData.id,
            name: dsData.name,
            type: dsData.type,
            description: dsData.description,
            ...dsData.config
        }));
    }

    /**
     * 反序列化数据绑定
     * @param {Array} bindingsData - 序列化的绑定数据
     * @returns {Map} 反序列化后的绑定映射
     */
    static deserializeBindings(bindingsData) {
        const bindings = new Map();

        bindingsData.forEach(bindingData => {
            const { nodeId, propertyKey, dataSourceId, dataPath, mode } = bindingData;

            if (!bindings.has(nodeId)) {
                bindings.set(nodeId, new Map());
            }

            bindings.get(nodeId).set(propertyKey, {
                dataSourceId,
                dataPath,
                mode
            });
        });

        return bindings;
    }

    /**
     * 反序列化节点列表
     * @param {Array} nodesData - 序列化的节点数据
     * @param {Object} scene - Three.js 场景对象
     * @returns {Array} 反序列化后的节点列表
     */
    static deserializeNodes(nodesData, scene) {
        const nodes = [];
        const nodeMap = new Map(); // UUID -> Node 映射

        // 递归反序列化节点
        const deserializeNode = (nodeData, parent = null) => {
            try {
                // 创建节点
                const node = NodeFactory.createNode(
                    nodeData.nodeType,
                    parent || scene,
                    {
                        uuid: nodeData.uuid,
                        name: nodeData.nodeName,
                        properties: this.deserializeProperties(nodeData.properties)
                    }
                );

                if (!node) {
                    console.warn(`无法创建节点: ${nodeData.nodeType}`);
                    return null;
                }

                // 恢复变换属性
                if (nodeData.transform) {
                    if (nodeData.transform.position) {
                        node.position.set(
                            nodeData.transform.position.x,
                            nodeData.transform.position.y,
                            nodeData.transform.position.z
                        );
                    }
                    if (nodeData.transform.rotation) {
                        node.rotation.set(
                            nodeData.transform.rotation.x,
                            nodeData.transform.rotation.y,
                            nodeData.transform.rotation.z
                        );
                    }
                    if (nodeData.transform.scale) {
                        node.scale.set(
                            nodeData.transform.scale.x,
                            nodeData.transform.scale.y,
                            nodeData.transform.scale.z
                        );
                    }
                }

                // 恢复可见性和锁定状态
                node.visible = nodeData.visible !== false;
                node.locked = nodeData.locked || false;

                // 添加到映射
                nodeMap.set(node.uuid, node);

                // 如果是分组节点，递归反序列化子节点
                if (nodeData.children && nodeData.children.length > 0) {
                    nodeData.children.forEach(childData => {
                        const childNode = deserializeNode(childData, node);
                        if (childNode && node.addChild) {
                            // 分组节点有 addChild 方法
                            node.addChild(childNode);
                        }
                    });
                }

                return node;
            } catch (error) {
                console.error(`反序列化节点失败: ${nodeData.nodeType}`, error);
                return null;
            }
        };

        // 反序列化所有根节点
        nodesData.forEach(nodeData => {
            const node = deserializeNode(nodeData);
            if (node) {
                nodes.push(node);
                // 如果节点没有父节点，添加到场景
                if (!node.parent || node.parent === scene) {
                    scene.add(node);
                }
            }
        });

        return nodes;
    }

    /**
     * 反序列化节点属性
     * @param {Object} properties - 序列化的属性对象
     * @returns {Object} 反序列化后的属性
     */
    static deserializeProperties(properties) {
        if (!properties) return {};

        const deserialized = {};

        for (const [key, value] of Object.entries(properties)) {
            deserialized[key] = value;
        }

        return deserialized;
    }

    /**
     * 检查版本兼容性
     * @param {string} version - 工程文件版本
     */
    static checkVersion(version) {
        if (!version) {
            console.warn('工程文件缺少版本信息，可能是旧版本文件');
            return;
        }

        const [major, minor, patch] = version.split('.').map(Number);
        const [currentMajor, currentMinor, currentPatch] = this.VERSION.split('.').map(Number);

        // 主版本号不同，不兼容
        if (major !== currentMajor) {
            throw new Error(`工程文件版本不兼容: ${version}（当前版本: ${this.VERSION}）`);
        }

        // 次版本号不同，警告
        if (minor > currentMinor) {
            console.warn(`工程文件版本较新: ${version}（当前版本: ${this.VERSION}），可能存在兼容性问题`);
        }
    }

    /**
     * 验证工程数据格式
     * @param {Object} projectData - 工程数据
     * @returns {Object} 验证结果 { valid: boolean, errors: Array }
     */
    static validate(projectData) {
        const errors = [];

        // 检查必需字段
        if (!projectData) {
            errors.push('工程数据不能为空');
            return { valid: false, errors };
        }

        if (!projectData.version) {
            errors.push('缺少版本信息');
        }

        if (!projectData.metadata) {
            errors.push('缺少元数据');
        }

        if (!projectData.nodes || !Array.isArray(projectData.nodes)) {
            errors.push('节点数据格式错误');
        }

        // 检查节点数据
        if (projectData.nodes) {
            projectData.nodes.forEach((node, index) => {
                if (!node.nodeType) {
                    errors.push(`节点 ${index} 缺少 nodeType 字段`);
                }
                if (!node.uuid) {
                    errors.push(`节点 ${index} 缺少 uuid 字段`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

