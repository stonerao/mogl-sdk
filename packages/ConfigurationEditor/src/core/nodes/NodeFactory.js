/**
 * NodeFactory 节点工厂
 *
 * @class NodeFactory
 * @description 负责节点的创建、注册和克隆
 *
 * @example
 * // 注册节点类型
 * NodeFactory.registerNodeType('rect', RectNode);
 *
 * // 创建节点
 * const node = NodeFactory.createNode('rect', scene, { width: 200, height: 100 });
 *
 * // 克隆节点
 * const clonedNode = NodeFactory.cloneNode(node, scene);
 */
export class NodeFactory {
    /**
     * 节点类型注册表
     * @private
     */
    static nodeTypes = new Map();

    /**
     * 注册节点类型
     *
     * @param {string} type - 节点类型名称
     * @param {Class} NodeClass - 节点类
     * @throws {Error} 如果节点类型已存在
     */
    static registerNodeType(type, NodeClass) {
        if (this.nodeTypes.has(type)) {
            console.warn(`NodeFactory: Node type "${type}" is already registered. Overwriting...`);
        }

        // 验证节点类
        if (!NodeClass || typeof NodeClass !== 'function') {
            throw new Error(`NodeFactory: Invalid node class for type "${type}"`);
        }

        this.nodeTypes.set(type, NodeClass);
        console.log(`NodeFactory: Registered node type "${type}"`);
    }

    /**
     * 批量注册节点类型
     *
     * @param {Object} types - 节点类型对象 { type: NodeClass }
     */
    static registerNodeTypes(types) {
        Object.entries(types).forEach(([type, NodeClass]) => {
            this.registerNodeType(type, NodeClass);
        });
    }

    /**
     * 注销节点类型
     *
     * @param {string} type - 节点类型名称
     */
    static unregisterNodeType(type) {
        if (this.nodeTypes.has(type)) {
            this.nodeTypes.delete(type);
            console.log(`NodeFactory: Unregistered node type "${type}"`);
        }
    }

    /**
     * 检查节点类型是否已注册
     *
     * @param {string} type - 节点类型名称
     * @returns {boolean} 是否已注册
     */
    static hasNodeType(type) {
        return this.nodeTypes.has(type);
    }

    /**
     * 获取所有已注册的节点类型
     *
     * @returns {Array<string>} 节点类型名称数组
     */
    static getRegisteredTypes() {
        return Array.from(this.nodeTypes.keys());
    }

    /**
     * 获取节点类型的类
     *
     * @param {string} type - 节点类型名称
     * @returns {Class|null} 节点类
     */
    static getNodeClass(type) {
        return this.nodeTypes.get(type) || null;
    }

    /**
     * 创建节点
     *
     * @param {string} type - 节点类型名称
     * @param {Scene} scene - W3D Scene 实例
     * @param {Object} config - 节点配置
     * @returns {BaseNode} 创建的节点实例
     * @throws {Error} 如果节点类型不存在
     */
    static createNode(type, scene, config = {}) {
        // 检查节点类型是否存在
        if (!this.nodeTypes.has(type)) {
            throw new Error(`NodeFactory: Node type "${type}" is not registered. Available types: ${this.getRegisteredTypes().join(', ')}`);
        }

        // 检查 scene 参数
        if (!scene) {
            throw new Error('NodeFactory: Scene parameter is required');
        }

        try {
            // 获取节点类
            const NodeClass = this.nodeTypes.get(type);

            // 创建节点实例
            const node = new NodeClass(scene, config);

            // 添加到场景
            if (scene.scene) {
                scene.scene.add(node);
            }

            // 调用挂载钩子
            if (node.onBeforeMount) {
                node.onBeforeMount();
            }

            if (node.onMounted) {
                node.onMounted();
            }

            console.log(`NodeFactory: Created node of type "${type}"`, node);

            return node;
        } catch (error) {
            console.error(`NodeFactory: Failed to create node of type "${type}"`, error);
            throw error;
        }
    }

    /**
     * 批量创建节点
     *
     * @param {Array<Object>} nodeConfigs - 节点配置数组 [{ type, config }]
     * @param {Scene} scene - W3D Scene 实例
     * @returns {Array<BaseNode>} 创建的节点数组
     */
    static createNodes(nodeConfigs, scene) {
        return nodeConfigs.map(({ type, config }) => {
            try {
                return this.createNode(type, scene, config);
            } catch (error) {
                console.error('NodeFactory: Failed to create node', error);
                return null;
            }
        }).filter(node => node !== null);
    }

    /**
     * 克隆节点
     *
     * @param {BaseNode} node - 要克隆的节点
     * @param {Scene} scene - W3D Scene 实例
     * @param {Object} overrideConfig - 覆盖配置
     * @returns {BaseNode} 克隆的节点实例
     * @throws {Error} 如果节点无效
     */
    static cloneNode(node, scene, overrideConfig = {}) {
        if (!node || !node.nodeType) {
            throw new Error('NodeFactory: Invalid node to clone');
        }

        if (!scene) {
            throw new Error('NodeFactory: Scene parameter is required');
        }

        try {
            // 序列化原节点
            const json = node.toJSON();

            // 生成新的 UUID（不使用原节点的 UUID）
            delete json.uuid;

            // 修改名称
            json.name = `${json.name}_copy`;

            // 合并覆盖配置
            const config = {
                ...json,
                properties: {
                    ...json.properties,
                    ...overrideConfig.properties
                },
                ...overrideConfig
            };

            // 创建新节点
            const clonedNode = this.createNode(node.nodeType, scene, config);

            // 从 JSON 恢复状态
            if (clonedNode.fromJSON) {
                clonedNode.fromJSON(json);
            }

            console.log(`NodeFactory: Cloned node of type "${node.nodeType}"`, clonedNode);

            return clonedNode;
        } catch (error) {
            console.error('NodeFactory: Failed to clone node', error);
            throw error;
        }
    }

    /**
     * 从 JSON 创建节点
     *
     * @param {Object} json - JSON 对象
     * @param {Scene} scene - W3D Scene 实例
     * @returns {BaseNode} 创建的节点实例
     */
    static createNodeFromJSON(json, scene) {
        if (!json || !json.nodeType) {
            throw new Error('NodeFactory: Invalid JSON data');
        }

        try {
            // 创建节点
            const node = this.createNode(json.nodeType, scene, {
                uuid: json.uuid,
                name: json.name,
                properties: json.properties
            });

            // 从 JSON 恢复状态
            if (node.fromJSON) {
                node.fromJSON(json);
            }

            return node;
        } catch (error) {
            console.error('NodeFactory: Failed to create node from JSON', error);
            throw error;
        }
    }

    /**
     * 批量从 JSON 创建节点
     *
     * @param {Array<Object>} jsonArray - JSON 对象数组
     * @param {Scene} scene - W3D Scene 实例
     * @returns {Array<BaseNode>} 创建的节点数组
     */
    static createNodesFromJSON(jsonArray, scene) {
        return jsonArray.map(json => {
            try {
                return this.createNodeFromJSON(json, scene);
            } catch (error) {
                console.error('NodeFactory: Failed to create node from JSON', error);
                return null;
            }
        }).filter(node => node !== null);
    }

    /**
     * 销毁节点
     *
     * @param {BaseNode} node - 要销毁的节点
     */
    static destroyNode(node) {
        if (!node) return;

        try {
            // 从场景中移除
            if (node.parent) {
                node.parent.remove(node);
            }

            // 调用销毁方法
            if (node.dispose) {
                node.dispose();
            }

            console.log(`NodeFactory: Destroyed node of type "${node.nodeType}"`);
        } catch (error) {
            console.error('NodeFactory: Failed to destroy node', error);
        }
    }

    /**
     * 批量销毁节点
     *
     * @param {Array<BaseNode>} nodes - 要销毁的节点数组
     */
    static destroyNodes(nodes) {
        nodes.forEach(node => this.destroyNode(node));
    }

    /**
     * 获取节点类型信息
     *
     * @param {string} type - 节点类型名称
     * @returns {Object|null} 节点类型信息
     */
    static getNodeTypeInfo(type) {
        const NodeClass = this.nodeTypes.get(type);
        if (!NodeClass) return null;

        return {
            type,
            name: NodeClass.name,
            defaultProperties: NodeClass.defaultProperties || {},
            description: NodeClass.description || ''
        };
    }

    /**
     * 获取所有节点类型信息
     *
     * @returns {Array<Object>} 节点类型信息数组
     */
    static getAllNodeTypeInfo() {
        return this.getRegisteredTypes().map(type => this.getNodeTypeInfo(type));
    }

    /**
     * 清空所有注册的节点类型
     */
    static clear() {
        this.nodeTypes.clear();
        console.log('NodeFactory: Cleared all registered node types');
    }
}

// 自动注册内置节点类型
import { RectNode, CircleNode, TextNode, ImageNode, GroupNode, NetworkElementNode, EditableLineNode, DevicesNode } from './types/index.js';

NodeFactory.registerNodeTypes({
    'rect': RectNode,
    'circle': CircleNode,
    'text': TextNode,
    'image': ImageNode,
    'group': GroupNode,
    'network-element': NetworkElementNode,
    'editable-line': EditableLineNode,
    'devices': DevicesNode
});

