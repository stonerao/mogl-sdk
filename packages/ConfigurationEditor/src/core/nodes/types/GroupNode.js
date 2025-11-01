import { BaseNode } from '../BaseNode.js';
import * as THREE from 'three';

/**
 * GroupNode 分组节点类
 *
 * @class GroupNode
 * @extends BaseNode
 * @description 用于组织和管理多个节点的容器节点
 *
 * 功能特性：
 * - 支持添加/移除子节点
 * - 支持嵌套分组（组内可以包含子组）
 * - 组的变换属性影响所有子节点
 * - 自动计算组的包围盒
 * - 支持展开/折叠状态
 * - 完整的序列化/反序列化支持
 *
 * @example
 * const group = new GroupNode(scene, {
 *     name: '分组1',
 *     properties: {
 *         x: 100,
 *         y: 100,
 *         expanded: true
 *     }
 * });
 *
 * // 添加子节点
 * group.addChild(rectNode);
 * group.addChild(circleNode);
 *
 * // 移动组（所有子节点一起移动）
 * group.setProperty('x', 200);
 */
export class GroupNode extends BaseNode {
    /**
     * 节点类型
     */
    static nodeType = 'group';

    /**
     * 默认属性
     */
    static defaultProperties = {
        ...BaseNode.defaultProperties,

        // 组特有属性
        expanded: true,        // 展开/折叠状态
        autoResize: true,      // 自动调整大小以适应子节点
        showBorder: true,      // 是否显示边框
        borderStyle: 'dashed', // 边框样式：solid, dashed, dotted
        backgroundColor: 'rgba(64, 158, 255, 0.05)', // 背景色

        // 覆盖默认值
        width: 200,
        height: 200,
        color: '#409EFF',
        borderColor: '#409EFF',
        borderWidth: 2
    };

    /**
     * 创建分组节点
     */
    constructor(scene, config = {}) {
        super(scene, config);

        // 子节点列表（使用数组而不是 THREE.Group.children，便于序列化）
        this.childNodes = [];

        // 包围盒辅助对象
        this.boundingBox = new THREE.Box3();
        this.boundingBoxHelper = null;

        // 背景平面
        this.backgroundPlane = null;
    }

    /**
     * 创建钩子
     */
    onCreate() {
        super.onCreate();

        // 创建背景平面
        this.createBackground();

        // 创建包围盒辅助线
        this.createBoundingBoxHelper();
    }

    /**
     * 创建背景平面
     */
    createBackground() {
        const width = this.properties.width;
        const height = this.properties.height;

        // 创建平面几何体
        const geometry = new THREE.PlaneGeometry(width, height);

        // 创建材质
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(this.properties.backgroundColor),
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        // 创建网格
        this.backgroundPlane = new THREE.Mesh(geometry, material);
        this.backgroundPlane.renderOrder = -1; // 确保在最底层渲染
        this.add(this.backgroundPlane);
    }

    /**
     * 创建包围盒辅助线
     */
    createBoundingBoxHelper() {
        // 创建边框线
        const width = this.properties.width;
        const height = this.properties.height;

        const points = [
            new THREE.Vector3(-width / 2, -height / 2, 0),
            new THREE.Vector3(width / 2, -height / 2, 0),
            new THREE.Vector3(width / 2, height / 2, 0),
            new THREE.Vector3(-width / 2, height / 2, 0),
            new THREE.Vector3(-width / 2, -height / 2, 0)
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // 根据边框样式创建材质
        const material = new THREE.LineDashedMaterial({
            color: new THREE.Color(this.properties.borderColor),
            linewidth: this.properties.borderWidth,
            dashSize: this.properties.borderStyle === 'dashed' ? 10 : 0,
            gapSize: this.properties.borderStyle === 'dashed' ? 5 : 0,
            transparent: true,
            opacity: 0.8
        });

        this.boundingBoxHelper = new THREE.Line(geometry, material);
        this.boundingBoxHelper.computeLineDistances(); // 必须调用才能显示虚线
        this.add(this.boundingBoxHelper);
    }

    /**
     * 添加子节点
     *
     * @param {BaseNode} node - 要添加的节点
     * @returns {boolean} 是否添加成功
     */
    addChild(node) {
        if (!node) {
            console.warn('GroupNode.addChild: node is null');
            return false;
        }

        // 检查循环嵌套
        if (this.isDescendantOf(node)) {
            console.warn('GroupNode.addChild: 不能将组添加到自己或自己的子组中');
            return false;
        }

        // 检查是否已经是子节点
        if (this.childNodes.includes(node)) {
            console.warn('GroupNode.addChild: 节点已经是子节点');
            return false;
        }

        // 从原父节点移除
        if (node.parent && node.parent !== this.scene) {
            if (node.parent.removeChild) {
                node.parent.removeChild(node);
            } else {
                node.parent.remove(node);
            }
        } else if (node.parent === this.scene) {
            this.scene.scene.remove(node);
        }

        // 添加到子节点列表
        this.childNodes.push(node);

        // 添加到 Three.js 场景图
        this.add(node);

        // 更新包围盒
        if (this.properties.autoResize) {
            this.updateBoundingBox();
        }

        // 触发事件
        this.emit('child-added', { child: node });

        return true;
    }

    /**
     * 移除子节点
     *
     * @param {BaseNode} node - 要移除的节点
     * @returns {boolean} 是否移除成功
     */
    removeChild(node) {
        if (!node) {
            console.warn('GroupNode.removeChild: node is null');
            return false;
        }

        const index = this.childNodes.indexOf(node);
        if (index === -1) {
            console.warn('GroupNode.removeChild: 节点不是子节点');
            return false;
        }

        // 从子节点列表移除
        this.childNodes.splice(index, 1);

        // 从 Three.js 场景图移除
        this.remove(node);

        // 更新包围盒
        if (this.properties.autoResize) {
            this.updateBoundingBox();
        }

        // 触发事件
        this.emit('child-removed', { child: node });

        return true;
    }

    /**
     * 检查是否是某个节点的后代
     *
     * @param {BaseNode} node - 要检查的节点
     * @returns {boolean}
     */
    isDescendantOf(node) {
        if (!node) return false;
        if (node === this) return true;

        let parent = this.parent;
        while (parent) {
            if (parent === node) return true;
            parent = parent.parent;
        }

        return false;
    }

    /**
     * 更新包围盒
     */
    updateBoundingBox() {
        if (this.childNodes.length === 0) {
            // 空组使用默认大小
            return;
        }

        // 重置包围盒
        this.boundingBox.makeEmpty();

        // 计算所有子节点的包围盒
        this.childNodes.forEach(child => {
            // 获取子节点的世界包围盒
            const childBox = new THREE.Box3();

            if (child.geometry) {
                // 如果有几何体，使用几何体计算
                childBox.setFromObject(child);
            } else {
                // 否则使用位置和大小估算
                const halfWidth = (child.properties?.width || 100) / 2;
                const halfHeight = (child.properties?.height || 100) / 2;
                const pos = child.position;

                childBox.min.set(pos.x - halfWidth, pos.y - halfHeight, pos.z);
                childBox.max.set(pos.x + halfWidth, pos.y + halfHeight, pos.z);
            }

            // 合并到组的包围盒
            this.boundingBox.union(childBox);
        });

        // 更新组的大小
        const size = new THREE.Vector3();
        this.boundingBox.getSize(size);

        this.setProperty('width', Math.max(size.x, 50)); // 最小宽度 50
        this.setProperty('height', Math.max(size.y, 50)); // 最小高度 50

        // 更新背景和边框
        this.updateBackground();
        this.updateBoundingBoxHelper();
    }

    /**
     * 更新背景平面
     */
    updateBackground() {
        if (!this.backgroundPlane) return;

        const width = this.properties.width;
        const height = this.properties.height;

        // 更新几何体
        this.backgroundPlane.geometry.dispose();
        this.backgroundPlane.geometry = new THREE.PlaneGeometry(width, height);

        // 更新材质
        this.backgroundPlane.material.color.set(this.properties.backgroundColor);
        this.backgroundPlane.visible = this.properties.showBorder;
    }

    /**
     * 更新包围盒辅助线
     */
    updateBoundingBoxHelper() {
        if (!this.boundingBoxHelper) return;

        const width = this.properties.width;
        const height = this.properties.height;

        const points = [
            new THREE.Vector3(-width / 2, -height / 2, 0),
            new THREE.Vector3(width / 2, -height / 2, 0),
            new THREE.Vector3(width / 2, height / 2, 0),
            new THREE.Vector3(-width / 2, height / 2, 0),
            new THREE.Vector3(-width / 2, -height / 2, 0)
        ];

        // 更新几何体
        this.boundingBoxHelper.geometry.dispose();
        this.boundingBoxHelper.geometry = new THREE.BufferGeometry().setFromPoints(points);
        this.boundingBoxHelper.computeLineDistances();

        // 更新材质
        this.boundingBoxHelper.material.color.set(this.properties.borderColor);
        this.boundingBoxHelper.visible = this.properties.showBorder;
    }

    /**
     * 设置属性
     */
    setProperty(key, value) {
        super.setProperty(key, value);

        // 处理特殊属性
        switch (key) {
        case 'width':
        case 'height':
            this.updateBackground();
            this.updateBoundingBoxHelper();
            break;

        case 'borderColor':
        case 'borderWidth':
        case 'borderStyle':
            this.updateBoundingBoxHelper();
            break;

        case 'backgroundColor':
            this.updateBackground();
            break;

        case 'showBorder':
            if (this.backgroundPlane) {
                this.backgroundPlane.visible = value;
            }
            if (this.boundingBoxHelper) {
                this.boundingBoxHelper.visible = value;
            }
            break;

        case 'visible':
            // 组的可见性影响所有子节点
            this.childNodes.forEach(child => {
                child.visible = value;
            });
            break;

        case 'locked':
            // 组的锁定状态影响所有子节点
            this.childNodes.forEach(child => {
                if (child.properties) {
                    child.properties.locked = value;
                }
            });
            break;
        }
    }

    /**
     * 序列化
     */
    serialize() {
        const data = super.serialize();

        // 添加子节点信息
        data.children = this.childNodes.map(child => ({
            uuid: child.uuid,
            // 递归序列化子节点
            ...(child.serialize ? child.serialize() : {})
        }));

        return data;
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        super.deserialize(data);

        // 子节点的反序列化由外部处理（需要先创建所有节点，再建立父子关系）
        // 这里只保存子节点的 UUID 列表
        this.childNodeUUIDs = data.children?.map(child => child.uuid) || [];

        return this;
    }

    /**
     * 销毁
     */
    onDispose() {
        // 清理子节点
        this.childNodes.forEach(child => {
            if (child.dispose) {
                child.dispose();
            }
        });
        this.childNodes = [];

        // 清理几何体和材质
        if (this.backgroundPlane) {
            this.backgroundPlane.geometry.dispose();
            this.backgroundPlane.material.dispose();
        }

        if (this.boundingBoxHelper) {
            this.boundingBoxHelper.geometry.dispose();
            this.boundingBoxHelper.material.dispose();
        }

        super.onDispose();
    }
}

