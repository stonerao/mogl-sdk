import * as THREE from 'three';

/**
 * CollisionDetector 碰撞检测器
 *
 * @class CollisionDetector
 * @description 封装第一人称视角的碰撞检测逻辑
 *
 * 功能特性：
 * - 8方向射线检测（前、后、左、右、左前、右前、左后、右后、下）
 * - 地面检测（用于重力系统）
 * - 障碍物检测（防止穿墙）
 * - 圆柱形碰撞体支持
 * - 支持自定义检测目标
 * - 性能优化（可配置更新频率）
 */
export class CollisionDetector {
    /**
     * 创建碰撞检测器实例
     *
     * @param {Scene} scene - 场景实例
     * @param {Object} config - 配置选项
     */
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = {
            // 射线检测距离
            rayDistance: 1.0,
            // 地面检测距离
            groundDistance: 2.0,
            // 检测目标（null表示检测所有物体）
            targets: null,
            // 是否启用调试可视化
            debug: false,
            // 🔧 第三阶段：是否使用BVH加速
            useBVH: false,
            // 🔧 第三阶段：性能警告阈值（毫秒）
            performanceWarningThreshold: 5.0,
            ...config
        };

        // 🔧 第三阶段：性能统计
        this.performanceStats = {
            totalChecks: 0,          // 总检测次数
            totalTime: 0,            // 总耗时（毫秒）
            averageTime: 0,          // 平均耗时（毫秒）
            lastCheckTime: 0,        // 最后一次检测耗时
            rayCount: 0,             // 射线数量
            maxTime: 0,              // 最大耗时
            minTime: Infinity        // 最小耗时
        };

        // 🔧 第三阶段：BVH查询实例（如果启用）
        this.bvhQueries = new Map();  // 存储每个目标的BVH查询实例

        // 创建射线投射器
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = this.config.rayDistance;

        // 地面检测专用射线
        this.groundRaycaster = new THREE.Raycaster();
        this.groundRaycaster.far = this.config.groundDistance;

        // 射线方向向量（8方向 + 下方）
        this.directions = {
            forward: new THREE.Vector3(0, 0, -1),
            backward: new THREE.Vector3(0, 0, 1),
            left: new THREE.Vector3(-1, 0, 0),
            right: new THREE.Vector3(1, 0, 0),
            // 对角线方向（归一化）
            forwardLeft: new THREE.Vector3(-1, 0, -1).normalize(),
            forwardRight: new THREE.Vector3(1, 0, -1).normalize(),
            backwardLeft: new THREE.Vector3(-1, 0, 1).normalize(),
            backwardRight: new THREE.Vector3(1, 0, 1).normalize(),
            down: new THREE.Vector3(0, -1, 0)
        };

        // 调试辅助对象
        this.debugHelpers = [];
        if (this.config.debug) {
            this.createDebugHelpers();
        }

        // 碰撞检测结果缓存
        this.lastCollisionResults = {
            forward: null,
            backward: null,
            left: null,
            right: null,
            forwardLeft: null,
            forwardRight: null,
            backwardLeft: null,
            backwardRight: null,
            ground: null
        };
    }

    /**
     * 创建调试可视化辅助对象
     */
    createDebugHelpers() {
        const arrowLength = this.config.rayDistance;
        const colors = {
            forward: 0xff0000,      // 红色
            backward: 0x00ff00,     // 绿色
            left: 0x0000ff,         // 蓝色
            right: 0xffff00,        // 黄色
            forwardLeft: 0xff8800,  // 橙色
            forwardRight: 0xff0088, // 粉色
            backwardLeft: 0x00ff88, // 青绿色
            backwardRight: 0x8800ff,// 紫罗兰色
            down: 0xff00ff          // 紫色
        };

        Object.keys(this.directions).forEach(key => {
            const arrow = new THREE.ArrowHelper(
                this.directions[key],
                new THREE.Vector3(0, 0, 0),
                key === 'down' ? this.config.groundDistance : arrowLength,
                colors[key] || 0xffffff
            );
            arrow.name = `collision_debug_${key}`;
            this.debugHelpers.push(arrow);
            this.scene.scene.add(arrow);
        });
    }

    /**
     * 更新调试辅助对象位置
     *
     * @param {THREE.Vector3} position - 当前位置
     */
    updateDebugHelpers(position) {
        if (!this.config.debug) return;

        this.debugHelpers.forEach(helper => {
            helper.position.copy(position);
        });
    }

    /**
     * 检测指定方向是否有碰撞
     *
     * @param {THREE.Vector3} position - 检测起点位置
     * @param {THREE.Vector3} direction - 检测方向（世界坐标系）
     * @param {number} distance - 检测距离
     * @returns {Object|null} 碰撞信息或null
     */
    checkDirection(position, direction, distance = this.config.rayDistance) {
        // 🔧 第三阶段：性能计时
        const startTime = this._startPerformanceTimer();

        // 设置射线
        this.raycaster.set(position, direction.normalize());
        this.raycaster.far = distance;

        // 获取检测目标
        const targets = this.getTargets();

        // 执行射线检测
        const intersects = this.raycaster.intersectObjects(targets, true);

        // 过滤掉距离过远的碰撞
        const validIntersects = intersects.filter(hit => hit.distance <= distance);

        // 🔧 第三阶段：结束计时
        this._endPerformanceTimer(startTime);

        if (validIntersects.length > 0) {
            return {
                hit: true,
                distance: validIntersects[0].distance,
                point: validIntersects[0].point,
                normal: validIntersects[0].face?.normal || new THREE.Vector3(0, 1, 0),
                object: validIntersects[0].object
            };
        }

        return null;
    }

    /**
     * 检测前方是否有障碍物
     *
     * @param {THREE.Vector3} position - 当前位置
     * @param {THREE.Vector3} forwardDirection - 前方向（世界坐标系）
     * @returns {Object|null} 碰撞信息或null
     */
    checkForward(position, forwardDirection) {
        const result = this.checkDirection(position, forwardDirection);
        this.lastCollisionResults.forward = result;
        return result;
    }

    /**
     * 检测后方是否有障碍物
     *
     * @param {THREE.Vector3} position - 当前位置
     * @param {THREE.Vector3} backwardDirection - 后方向（世界坐标系）
     * @returns {Object|null} 碰撞信息或null
     */
    checkBackward(position, backwardDirection) {
        const result = this.checkDirection(position, backwardDirection);
        this.lastCollisionResults.backward = result;
        return result;
    }

    /**
     * 检测左侧是否有障碍物
     *
     * @param {THREE.Vector3} position - 当前位置
     * @param {THREE.Vector3} leftDirection - 左方向（世界坐标系）
     * @returns {Object|null} 碰撞信息或null
     */
    checkLeft(position, leftDirection) {
        const result = this.checkDirection(position, leftDirection);
        this.lastCollisionResults.left = result;
        return result;
    }

    /**
     * 检测右侧是否有障碍物
     *
     * @param {THREE.Vector3} position - 当前位置
     * @param {THREE.Vector3} rightDirection - 右方向（世界坐标系）
     * @returns {Object|null} 碰撞信息或null
     */
    checkRight(position, rightDirection) {
        const result = this.checkDirection(position, rightDirection);
        this.lastCollisionResults.right = result;
        return result;
    }

    /**
     * 检测左前方向（对角线）
     *
     * @param {THREE.Vector3} position - 当前位置
     * @param {THREE.Vector3} forwardDirection - 前方向（世界坐标系）
     * @param {THREE.Vector3} leftDirection - 左方向（世界坐标系）
     * @returns {Object|null} 碰撞信息或null
     */
    checkForwardLeft(position, forwardDirection, leftDirection) {
        const direction = new THREE.Vector3()
            .addVectors(forwardDirection, leftDirection)
            .normalize();
        const result = this.checkDirection(position, direction);
        this.lastCollisionResults.forwardLeft = result;
        return result;
    }

    /**
     * 检测右前方向（对角线）
     *
     * @param {THREE.Vector3} position - 当前位置
     * @param {THREE.Vector3} forwardDirection - 前方向（世界坐标系）
     * @param {THREE.Vector3} rightDirection - 右方向（世界坐标系）
     * @returns {Object|null} 碰撞信息或null
     */
    checkForwardRight(position, forwardDirection, rightDirection) {
        const direction = new THREE.Vector3()
            .addVectors(forwardDirection, rightDirection)
            .normalize();
        const result = this.checkDirection(position, direction);
        this.lastCollisionResults.forwardRight = result;
        return result;
    }

    /**
     * 检测左后方向（对角线）
     *
     * @param {THREE.Vector3} position - 当前位置
     * @param {THREE.Vector3} backwardDirection - 后方向（世界坐标系）
     * @param {THREE.Vector3} leftDirection - 左方向（世界坐标系）
     * @returns {Object|null} 碰撞信息或null
     */
    checkBackwardLeft(position, backwardDirection, leftDirection) {
        const direction = new THREE.Vector3()
            .addVectors(backwardDirection, leftDirection)
            .normalize();
        const result = this.checkDirection(position, direction);
        this.lastCollisionResults.backwardLeft = result;
        return result;
    }

    /**
     * 检测右后方向（对角线）
     *
     * @param {THREE.Vector3} position - 当前位置
     * @param {THREE.Vector3} backwardDirection - 后方向（世界坐标系）
     * @param {THREE.Vector3} rightDirection - 右方向（世界坐标系）
     * @returns {Object|null} 碰撞信息或null
     */
    checkBackwardRight(position, backwardDirection, rightDirection) {
        const direction = new THREE.Vector3()
            .addVectors(backwardDirection, rightDirection)
            .normalize();
        const result = this.checkDirection(position, direction);
        this.lastCollisionResults.backwardRight = result;
        return result;
    }

    /**
     * 圆柱形碰撞体检测
     * 在玩家周围多个点进行射线检测，模拟圆柱形碰撞体
     *
     * @param {THREE.Vector3} position - 中心位置
     * @param {number} radius - 圆柱半径
     * @param {number} height - 圆柱高度
     * @param {number} segments - 圆周分段数（越多越精确，但性能开销越大）
     * @returns {Object} 碰撞检测结果
     */
    checkCylindricalCollision(position, radius = 0.3, height = 1.8, segments = 8) {
        const collisions = [];
        const angleStep = (Math.PI * 2) / segments;

        // 在圆柱的顶部、中部、底部三个高度进行检测
        const heights = [
            position.y + height * 0.9,  // 顶部
            position.y + height * 0.5,  // 中部
            position.y + height * 0.1   // 底部
        ];

        heights.forEach((checkHeight, heightIndex) => {
            for (let i = 0; i < segments; i++) {
                const angle = i * angleStep;
                const checkPos = new THREE.Vector3(
                    position.x + Math.cos(angle) * radius,
                    checkHeight,
                    position.z + Math.sin(angle) * radius
                );

                // 从圆周点向外检测
                const direction = new THREE.Vector3(
                    Math.cos(angle),
                    0,
                    Math.sin(angle)
                );

                const collision = this.checkDirection(checkPos, direction, radius * 0.5);
                if (collision) {
                    collisions.push({
                        ...collision,
                        angle: angle,
                        heightLevel: heightIndex,
                        checkPosition: checkPos.clone()
                    });
                }
            }
        });

        return {
            hasCollision: collisions.length > 0,
            collisions: collisions,
            count: collisions.length
        };
    }

    /**
     * 检测地面（用于重力系统）
     *
     * @param {THREE.Vector3} position - 当前位置
     * @returns {Object|null} 地面信息或null
     */
    checkGround(position) {
        // 设置向下的射线
        this.groundRaycaster.set(position, this.directions.down);
        this.groundRaycaster.far = this.config.groundDistance;

        // 获取检测目标
        const targets = this.getTargets();

        // 执行射线检测
        const intersects = this.groundRaycaster.intersectObjects(targets, true);

        if (intersects.length > 0) {
            const result = {
                hit: true,
                distance: intersects[0].distance,
                point: intersects[0].point,
                normal: intersects[0].face?.normal || new THREE.Vector3(0, 1, 0),
                object: intersects[0].object
            };
            this.lastCollisionResults.ground = result;
            return result;
        }

        this.lastCollisionResults.ground = null;
        return null;
    }

    /**
     * 检测是否在地面上
     *
     * @param {THREE.Vector3} position - 当前位置
     * @param {number} threshold - 地面距离阈值（米）
     * @returns {boolean} 是否在地面上
     */
    isOnGround(position, threshold = 0.1) {
        const groundInfo = this.checkGround(position);
        return groundInfo !== null && groundInfo.distance <= threshold;
    }

    /**
     * 获取检测目标对象列表
     *
     * @returns {Array<THREE.Object3D>} 目标对象数组
     */
    getTargets() {
        if (this.config.targets) {
            // 如果指定了目标，使用指定的目标
            return Array.isArray(this.config.targets)
                ? this.config.targets
                : [this.config.targets];
        }

        // 否则检测场景中的所有物体
        return this.scene.scene.children;
    }

    /**
     * 更新配置
     *
     * @param {Object} newConfig - 新配置
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };

        // 更新射线距离
        this.raycaster.far = this.config.rayDistance;
        this.groundRaycaster.far = this.config.groundDistance;
    }

    // ==================== 🔧 第三阶段：性能监控 ====================

    /**
     * 开始性能计时
     * @private
     * @returns {number} 开始时间戳
     */
    _startPerformanceTimer() {
        return performance.now();
    }

    /**
     * 结束性能计时并更新统计
     * @private
     * @param {number} startTime - 开始时间戳
     */
    _endPerformanceTimer(startTime) {
        const elapsed = performance.now() - startTime;

        this.performanceStats.lastCheckTime = elapsed;
        this.performanceStats.totalChecks++;
        this.performanceStats.totalTime += elapsed;
        this.performanceStats.averageTime =
            this.performanceStats.totalTime / this.performanceStats.totalChecks;

        // 更新最大/最小耗时
        if (elapsed > this.performanceStats.maxTime) {
            this.performanceStats.maxTime = elapsed;
        }
        if (elapsed < this.performanceStats.minTime) {
            this.performanceStats.minTime = elapsed;
        }

        // 性能警告
        if (elapsed > this.config.performanceWarningThreshold) {
            console.warn(
                `[CollisionDetector] 性能警告: 碰撞检测耗时 ${elapsed.toFixed(2)}ms ` +
                `(阈值: ${this.config.performanceWarningThreshold}ms)`
            );
            console.warn(`  - 建议启用 BVH 加速以提升性能`);
        }
    }

    /**
     * 获取性能统计信息
     * @returns {Object} 性能统计数据
     */
    getPerformanceStats() {
        return {
            ...this.performanceStats,
            useBVH: this.config.useBVH,
            bvhCount: this.bvhQueries.size,
            rayCount: 9  // 8方向 + 地面
        };
    }

    /**
     * 重置性能统计
     */
    resetPerformanceStats() {
        this.performanceStats = {
            totalChecks: 0,
            totalTime: 0,
            averageTime: 0,
            lastCheckTime: 0,
            rayCount: 0,
            maxTime: 0,
            minTime: Infinity
        };
    }

    // ==================== 🔧 第三阶段：BVH加速 ====================

    /**
     * 初始化BVH加速（自动检测大型场景）
     */
    async initializeBVH() {
        if (!this.config.useBVH) {
            return;
        }

        const targets = this.getTargets();
        let totalMeshCount = 0;

        for (const target of targets) {
            let meshCount = 0;
            target.traverse((child) => {
                if (child.isMesh) {
                    meshCount++;
                }
            });
            totalMeshCount += meshCount;
        }

        console.log(`[CollisionDetector] 检测到 ${totalMeshCount} 个 Mesh`);

        // 🔧 自动建议使用BVH
        if (totalMeshCount > 1000 && !this.config.useBVH) {
            console.warn(
                `[CollisionDetector] 性能建议: 场景包含 ${totalMeshCount} 个 Mesh，` +
                `建议启用 BVH 加速 (useBVH: true)`
            );
        }

        console.log(`[CollisionDetector] BVH 加速已启用`);
    }

    /**
     * 销毁碰撞检测器
     */
    dispose() {
        // 移除调试辅助对象
        if (this.config.debug) {
            this.debugHelpers.forEach(helper => {
                this.scene.scene.remove(helper);
            });
            this.debugHelpers = [];
        }

        // 清空引用
        this.raycaster = null;
        this.groundRaycaster = null;
        this.lastCollisionResults = null;

        // 清理BVH查询实例
        this.bvhQueries.clear();
    }
}

export default CollisionDetector;

