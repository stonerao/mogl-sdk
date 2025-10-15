import { Component } from '@w3d/core';
import * as THREE from 'three';
import {
    MeshBVH,
    MeshBVHHelper,
    acceleratedRaycast,
    computeBoundsTree,
    disposeBoundsTree,
    CONTAINED,
    INTERSECTED,
    NOT_INTERSECTED,
    StaticGeometryGenerator
} from 'three-mesh-bvh';

// 扩展 Three.js 原型以支持 BVH 加速
// 参考 three-mesh-bvh 示例的实现方式
THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

/**
 * BVHQuery 空间查询组件
 *
 * @class BVHQuery
 * @extends Component
 * @description 基于 BVH（Bounding Volume Hierarchy）的高性能空间查询组件
 *
 * 功能特性：
 * - 射线投射加速（10-100倍性能提升）
 * - 最近点查询（点到网格、几何体到几何体）
 * - 碰撞检测（球体、包围盒、几何体）
 * - 形状投射（自定义查询）
 * - 距离查询
 * - BVH 可视化调试
 *
 * @example
 * const bvhQuery = await scene.add('BVHQuery', {
 *     mesh: targetMesh,
 *     bvhOptions: {
 *         strategy: 'SAH',
 *         maxDepth: 40,
 *         maxLeafTris: 10
 *     },
 *     showHelper: true
 * });
 */
export class BVHQuery extends Component {
    static defaultConfig = {
        // 目标网格或几何体
        mesh: null,
        geometry: null,

        // BVH 构建选项
        bvhOptions: {
            strategy: 'SAH', // 'CENTER' | 'AVERAGE' | 'SAH'
            maxDepth: 40, // 最大深度
            maxLeafTris: 10, // 叶节点最大三角形数
            verbose: false, // 打印警告
            setBoundingBox: true // 设置包围盒
        },

        // 是否异步生成（使用 WebWorker）
        async: false,

        // 是否自动更新（当几何体变化时）
        autoUpdate: false,

        // 是否启用可视化辅助器
        showHelper: false,
        helperOptions: {
            depth: 10, // 显示深度
            color: 0x00ff88, // 颜色
            opacity: 0.3, // 透明度
            displayEdges: true // 显示边缘
        }
    };

    constructor(scene, config = {}) {
        super(scene, config);

        // BVH 实例
        this.bvh = null;

        // 目标网格
        this.targetMesh = null;

        // 目标几何体
        this.targetGeometry = null;

        // BVH 可视化辅助器
        this.helper = null;

        // 查询统计信息
        this.stats = {
            lastQueryTime: 0,
            totalQueries: 0,
            averageQueryTime: 0
        };
    }

    /**
     * 组件挂载完成
     */
    async onMounted() {
        // 初始化目标几何体
        if (!this._initializeGeometry()) {
            return;
        }

        // 验证几何体
        if (!this._validateGeometry()) {
            return;
        }

        // 生成 BVH
        await this.generateBVH();

        // 创建可视化辅助器
        if (this.config.showHelper) {
            this.createHelper();
        }
    }

    /**
     * 初始化目标几何体
     * @private
     * @returns {boolean} 是否成功初始化
     */
    _initializeGeometry() {
        if (this.config.mesh) {
            this.targetMesh = this.config.mesh;
            this.targetGeometry = this.targetMesh.geometry;
        } else if (this.config.geometry) {
            this.targetGeometry = this.config.geometry;
        } else {
            console.warn('BVHQuery: No mesh or geometry provided');
            return false;
        }

        return true;
    }

    /**
     * 验证几何体
     * @private
     * @returns {boolean} 是否验证通过
     */
    _validateGeometry() {
        if (!this.targetGeometry) {
            const error = new Error('Target geometry is null or undefined');
            console.error('BVHQuery:', error.message);
            this.emit('error', { type: 'initialization', error });
            return false;
        }

        if (!this.targetGeometry.isBufferGeometry) {
            const error = new Error('Target geometry must be a BufferGeometry');
            console.error('BVHQuery:', error.message);
            this.emit('error', { type: 'initialization', error });
            return false;
        }

        return true;
    }

    // ==================== BVH 生成和管理 ====================

    /**
     * 生成 BVH
     * @returns {Promise<void>}
     */
    async generateBVH() {
        const startTime = Date.now();

        try {
            // 创建 BVH（异步生成暂未实现）
            if (this.config.async) {
                console.warn(
                    'BVHQuery: Async generation not implemented yet, using sync generation'
                );
            }

            this.bvh = new MeshBVH(this.targetGeometry, this.config.bvhOptions);

            // 将 BVH 附加到几何体（参考 bvh.js 示例）
            this.targetGeometry.boundsTree = this.bvh;

            const buildTime = Date.now() - startTime;

            // 触发事件
            this.emit('bvhGenerated', {
                buildTime,
                stats: this.getStats()
            });
        } catch (error) {
            console.error('BVHQuery: Failed to generate BVH', error);
            this.emit('error', { type: 'generation', error });
            throw error;
        }
    }

    /**
     * 重新调整 BVH（顶点更新后）
     * @param {Array|null} nodeIndices - 需要更新的节点索引
     */
    refit(nodeIndices = null) {
        if (!this.bvh) {
            console.warn('BVHQuery: BVH not generated yet');
            return;
        }

        try {
            this.bvh.refit(nodeIndices);
            this.emit('bvhRefitted', { nodeIndices });
        } catch (error) {
            console.error('BVHQuery: Failed to refit BVH', error);
            this.emit('error', { type: 'refit', error });
        }
    }

    /**
     * 重新生成 BVH
     * @param {Object|null} options - 新的 BVH 选项
     * @returns {Promise<void>}
     */
    async rebuild(options = null) {
        // 清理现有 BVH
        if (this.bvh) {
            this.bvh = null;
            this.targetGeometry.boundsTree = null;
        }

        // 更新配置
        if (options) {
            this.config.bvhOptions = { ...this.config.bvhOptions, ...options };
        }

        // 重新生成
        await this.generateBVH();
    }

    // ==================== 射线投射 ====================

    /**
     * 射线投射
     * @param {THREE.Ray} ray - 射线
     * @param {Object} options - 选项
     * @param {number} [options.side=THREE.FrontSide] - 面的方向
     * @param {boolean} [options.firstHitOnly=false] - 是否只返回最近的交点
     * @param {number} [options.near=0] - 最近距离
     * @param {number} [options.far=Infinity] - 最远距离
     * @returns {Array|Object|null} 交点数组或单个交点
     */
    raycast(ray, options = {}) {
        if (!this._checkBVH()) {
            return options.firstHitOnly ? null : [];
        }

        // 验证 ray 参数
        if (!ray || !ray.origin || !ray.direction) {
            console.error('BVHQuery: Invalid ray parameter. Expected THREE.Ray object.');
            return options.firstHitOnly ? null : [];
        }

        const { side = THREE.FrontSide, firstHitOnly = false, near = 0, far = Infinity } = options;

        return this._executeQuery(
            'raycast',
            () => {
                return firstHitOnly
                    ? this.bvh.raycastFirst(ray, side, near, far)
                    : this.bvh.raycast(ray, side, near, far);
            },
            firstHitOnly ? null : []
        );
    }

    // ==================== 最近点查询 ====================

    /**
     * 查找最近点
     * @param {THREE.Vector3} point - 查询点
     * @param {Object} options - 选项
     * @param {number} [options.minThreshold=0] - 最小距离阈值
     * @param {number} [options.maxThreshold=Infinity] - 最大距离阈值
     * @returns {Object|null} 最近点信息
     */
    closestPointToPoint(point, options = {}) {
        if (!this._checkBVH()) {
            return null;
        }

        const { minThreshold = 0, maxThreshold = Infinity } = options;

        return this._executeQuery('closestPointToPoint', () => {
            const target = {};
            return this.bvh.closestPointToPoint(point, target, minThreshold, maxThreshold);
        });
    }

    /**
     * 查找几何体间最近点
     * @param {THREE.BufferGeometry} geometry - 目标几何体
     * @param {THREE.Matrix4} geometryToBvh - 几何体到 BVH 的变换矩阵
     * @param {Object} options - 选项
     * @param {number} [options.minThreshold=0] - 最小距离阈值
     * @param {number} [options.maxThreshold=Infinity] - 最大距离阈值
     * @returns {Object|null} 最近点信息
     */
    closestPointToGeometry(geometry, geometryToBvh, options = {}) {
        if (!this._checkBVH()) {
            return null;
        }

        const { minThreshold = 0, maxThreshold = Infinity } = options;

        return this._executeQuery('closestPointToGeometry', () => {
            const target1 = {};
            const target2 = {};
            this.bvh.closestPointToGeometry(
                geometry,
                geometryToBvh,
                target1,
                target2,
                minThreshold,
                maxThreshold
            );
            return { target1, target2 };
        });
    }

    // ==================== 碰撞检测 ====================

    /**
     * 球体碰撞检测
     * @param {THREE.Sphere} sphere - 球体
     * @returns {Boolean} 是否相交
     */
    intersectsSphere(sphere) {
        if (!this._checkBVH()) {
            return false;
        }

        return this._executeQuery(
            'intersectsSphere',
            () => {
                return this.bvh.intersectsSphere(sphere);
            },
            false
        );
    }

    /**
     * 包围盒碰撞检测
     * @param {THREE.Box3} box - 包围盒
     * @param {THREE.Matrix4} boxToBvh - 包围盒到 BVH 的变换矩阵
     * @returns {Boolean} 是否相交
     */
    intersectsBox(box, boxToBvh = null) {
        if (!this._checkBVH()) {
            return false;
        }

        return this._executeQuery(
            'intersectsBox',
            () => {
                return this.bvh.intersectsBox(box, boxToBvh);
            },
            false
        );
    }

    /**
     * 几何体碰撞检测
     * @param {THREE.BufferGeometry} geometry - 几何体
     * @param {THREE.Matrix4} geometryToBvh - 几何体到 BVH 的变换矩阵
     * @returns {Boolean} 是否相交
     */
    intersectsGeometry(geometry, geometryToBvh) {
        if (!this._checkBVH()) {
            return false;
        }

        return this._executeQuery(
            'intersectsGeometry',
            () => {
                return this.bvh.intersectsGeometry(geometry, geometryToBvh);
            },
            false
        );
    }

    // ==================== 形状投射 ====================

    /**
     * 形状投射（高级查询）
     * @param {Object} callbacks - 回调函数
     * @returns {*} 查询结果
     */
    shapecast(callbacks) {
        if (!this._checkBVH()) {
            return null;
        }

        return this._executeQuery('shapecast', () => {
            return this.bvh.shapecast(callbacks);
        });
    }

    // ==================== 距离查询 ====================

    /**
     * 计算点到网格的距离
     * @param {THREE.Vector3} point - 查询点
     * @returns {Number} 距离
     */
    distanceToPoint(point) {
        const result = this.closestPointToPoint(point);
        return result ? result.distance : Infinity;
    }

    /**
     * 计算几何体间的距离
     * @param {THREE.BufferGeometry} geometry - 几何体
     * @param {THREE.Matrix4} geometryToBvh - 几何体到 BVH 的变换矩阵
     * @returns {Number} 距离
     */
    distanceToGeometry(geometry, geometryToBvh) {
        const result = this.closestPointToGeometry(geometry, geometryToBvh);
        return result && result.target1 ? result.target1.distance : Infinity;
    }

    // ==================== 辅助功能 ====================

    /**
     * 创建可视化辅助器
     */
    createHelper() {
        if (!this.bvh) {
            console.warn('BVHQuery: BVH not generated yet');
            return null;
        }

        if (this.helper) {
            this.remove(this.helper);
            this.helper.dispose();
        }

        const options = this.config.helperOptions;

        this.helper = new MeshBVHHelper(this.targetMesh || this.bvh, options.depth);
        this.helper.color.set(options.color);
        this.helper.opacity = options.opacity;
        this.helper.displayEdges = options.displayEdges;
        this.helper.update();

        this.add(this.helper);

        return this.helper;
    }

    /**
     * 更新辅助器
     */
    updateHelper(options = {}) {
        if (!this.helper) {
            return;
        }

        if (options.depth !== undefined) {
            this.helper.depth = options.depth;
        }
        if (options.color !== undefined) {
            this.helper.color.set(options.color);
        }
        if (options.opacity !== undefined) {
            this.helper.opacity = options.opacity;
        }
        if (options.displayEdges !== undefined) {
            this.helper.displayEdges = options.displayEdges;
        }

        this.helper.update();
    }

    /**
     * 显示/隐藏辅助器
     */
    toggleHelper(visible = null) {
        if (!this.helper) {
            if (visible !== false) {
                this.createHelper();
            }
            return;
        }

        if (visible === null) {
            this.helper.visible = !this.helper.visible;
        } else {
            this.helper.visible = visible;
        }
    }

    /**
     * 获取 BVH 统计信息
     */
    getStats() {
        if (!this.bvh) {
            return null;
        }

        // 计算节点数量
        let nodeCount = 0;
        let leafNodeCount = 0;

        this.bvh.shapecast({
            intersectsBounds: (box, isLeaf) => {
                nodeCount++;
                if (isLeaf) {
                    leafNodeCount++;
                }
                return INTERSECTED;
            }
        });

        return {
            nodeCount,
            leafNodeCount,
            triangleCount: this.targetGeometry.index
                ? this.targetGeometry.index.count / 3
                : this.targetGeometry.attributes.position.count / 3,
            ...this.stats
        };
    }

    /**
     * 更新查询统计信息
     * @private
     * @param {number} queryTime - 查询时间（毫秒）
     */
    _updateStats(queryTime) {
        this.stats.lastQueryTime = queryTime;
        this.stats.totalQueries++;
        this.stats.averageQueryTime =
            (this.stats.averageQueryTime * (this.stats.totalQueries - 1) + queryTime) /
            this.stats.totalQueries;
    }

    // ==================== 私有辅助方法 ====================

    /**
     * 检查 BVH 是否已生成
     * @private
     * @returns {boolean}
     */
    _checkBVH() {
        if (!this.bvh) {
            console.warn('BVHQuery: BVH not generated yet');
            return false;
        }
        return true;
    }

    /**
     * 执行查询并处理错误
     * @private
     * @param {string} queryType - 查询类型
     * @param {Function} queryFn - 查询函数
     * @param {*} defaultValue - 默认返回值
     * @returns {*} 查询结果
     */
    _executeQuery(queryType, queryFn, defaultValue = null) {
        const startTime = Date.now();

        try {
            const result = queryFn();
            const queryTime = Date.now() - startTime;

            this._updateStats(queryTime);

            this.emit('queryComplete', {
                type: queryType,
                result,
                queryTime
            });

            return result;
        } catch (error) {
            console.error(`BVHQuery: ${queryType} failed`, error);
            this.emit('error', { type: queryType, error });
            return defaultValue;
        }
    }

    /**
     * 组件销毁
     */
    onDestroy() {
        // 清理 BVH
        if (this.bvh) {
            this.bvh = null;
        }

        // 清理辅助器
        if (this.helper) {
            this.remove(this.helper);
            this.helper.dispose();
            this.helper = null;
        }

        // 清理几何体上的 BVH
        if (this.targetGeometry && this.targetGeometry.boundsTree) {
            this.targetGeometry.boundsTree = null;
        }
    }
}
