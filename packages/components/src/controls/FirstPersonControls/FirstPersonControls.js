import { Component } from '@w3d/core';
import * as THREE from 'three';
import { CollisionDetector } from './CollisionDetector.js';

/**
 * FirstPersonControls 第一人称控制组件
 *
 * @class FirstPersonControls
 * @extends Component
 * @description 第一人称视角控制器，支持WASD移动、鼠标视角、碰撞检测、重力和跳跃
 *
 * @example
 * const fpControls = await scene.add('FirstPersonControls', {
 *     moveSpeed: 5,
 *     lookSpeed: 0.002,
 *     collision: {
 *         enabled: true,
 *         rayDistance: 1.0,
 *         targets: [modelComponent.componentScene]
 *     },
 *     gravity: {
 *         enabled: true,
 *         strength: 9.8
 *     }
 * });
 */
export class FirstPersonControls extends Component {
    static defaultConfig = {
        // 移动速度（米/秒）
        moveSpeed: 5.0,
        // 视角旋转速度
        lookSpeed: 0.002,
        // 跑步速度倍数
        runSpeedMultiplier: 2.0,

        // 碰撞检测配置
        collision: {
            enabled: true,
            rayDistance: 1.0,      // 碰撞检测距离
            groundDistance: 2.0,   // 地面检测距离
            targets: null,         // 检测目标（null=所有物体）
            debug: false,          // 是否显示调试射线
            // 🔧 第三阶段：BVH加速
            useBVH: false,         // 是否使用BVH加速
            // 🔧 第三阶段：碰撞检测频率控制
            updateRate: 60         // 碰撞检测更新频率（Hz）
        },

        // 重力配置
        gravity: {
            enabled: true,
            strength: 9.8,         // 重力加速度（米/秒²）
            maxFallSpeed: 20       // 最大下落速度（米/秒）
        },

        // 跳跃配置
        jump: {
            enabled: true,
            height: 2.0,           // 跳跃高度（米）
            cooldown: 500          // 跳跃冷却时间（毫秒）
        },

        // 玩家碰撞体配置
        playerBody: {
            height: 1.8,           // 玩家高度（米）
            eyeHeight: 1.6         // 眼睛高度（米）
        },

        // 键盘控制配置
        keys: {
            forward: ['KeyW', 'ArrowUp'],
            backward: ['KeyS', 'ArrowDown'],
            left: ['KeyA', 'ArrowLeft'],
            right: ['KeyD', 'ArrowRight'],
            jump: ['Space'],
            run: ['ShiftLeft', 'ShiftRight']
        },

        // 是否自动锁定鼠标指针
        autoPointerLock: true,

        // 是否自动调整初始高度到地面
        autoAdjustHeight: true,

        // 初始化时的最大地面检测距离
        maxInitGroundDistance: 100,

        // 调试模式（输出详细日志）
        debugMode: false
    };

    constructor(scene, config = {}) {
        super(scene, config);

        // 相机引用
        this.camera = this.scene.camera.instance;

        // 碰撞检测器
        this.collisionDetector = null;

        // 键盘状态
        this.keys = {};

        // 鼠标状态
        this.isPointerLocked = false;

        // 移动状态
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.isRunning = false;

        // 重力相关
        this.verticalVelocity = 0;
        this.isOnGround = false;

        // 跳跃冷却
        this.lastJumpTime = 0;

        // 欧拉角（用于相机旋转）
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');

        // 临时向量（避免重复创建）
        this.tempVector = new THREE.Vector3();
        this.tempQuaternion = new THREE.Quaternion();

        // 帧计数器（用于调试日志）
        this.frameCount = 0;

        // 🔧 第三阶段：碰撞检测频率控制
        this.collisionCheckInterval = 1000 / this.config.collision.updateRate;  // 毫秒
        this.lastCollisionCheckTime = 0;
        this.shouldCheckCollision = true;
    }

    /**
     * 组件挂载完成
     */
    async onMounted() {
        console.log('FirstPersonControls mounted');

        // 初始化碰撞检测器
        if (this.config.collision.enabled) {
            this.collisionDetector = new CollisionDetector(this.scene, {
                rayDistance: this.config.collision.rayDistance,
                groundDistance: this.config.collision.groundDistance,
                targets: this.config.collision.targets,
                debug: this.config.collision.debug,
                // 🔧 第三阶段：BVH加速
                useBVH: this.config.collision.useBVH
            });

            // 🔧 第三阶段：初始化BVH（如果启用）
            if (this.config.collision.useBVH) {
                await this.collisionDetector.initializeBVH();
            }
        }

        // 设置相机初始旋转
        this.euler.setFromQuaternion(this.camera.quaternion);

        // 自动调整初始高度到地面
        if (this.config.autoAdjustHeight && this.config.gravity.enabled && this.collisionDetector) {
            this.adjustInitialHeight();
        }

        // 绑定事件监听器
        this.bindEvents();

        // 如果启用自动锁定，点击容器时锁定鼠标
        if (this.config.autoPointerLock) {
            this.scene.renderer.instance.domElement.addEventListener('click', () => {
                this.lockPointer();
            });
        }
    }

    /**
     * 调整初始高度到地面
     * 防止初始化时相机掉落
     */
    adjustInitialHeight() {
        const currentPosition = this.camera.position.clone();
        const eyeHeight = this.config.playerBody.eyeHeight;
        const maxDistance = this.config.maxInitGroundDistance;

        console.log(`[FirstPersonControls] 开始调整初始高度...`);
        console.log(`  - 当前位置: (${currentPosition.x.toFixed(2)}, ${currentPosition.y.toFixed(2)}, ${currentPosition.z.toFixed(2)})`);
        console.log(`  - 最大检测距离: ${maxDistance}m`);

        // 检查碰撞检测目标
        const targets = this.collisionDetector.getTargets();
        console.log(`  - 碰撞检测目标数量: ${targets.length}`);

        if (targets.length > 0) {
            let totalMeshes = 0;
            targets.forEach((target, index) => {
                let meshCount = 0;
                target.traverse((child) => {
                    if (child.isMesh) meshCount++;
                });
                totalMeshes += meshCount;
                console.log(`  - 目标[${index}] Mesh数量: ${meshCount}`);
            });
            console.log(`  - 总 Mesh 数量: ${totalMeshes}`);
        } else {
            console.warn(`  - ⚠️ 警告: 没有碰撞检测目标！`);
        }

        // 使用临时的大距离检测地面
        const originalGroundDistance = this.collisionDetector.config.groundDistance;
        this.collisionDetector.config.groundDistance = maxDistance;

        // 检测地面
        const groundInfo = this.collisionDetector.checkGround(currentPosition);

        // 恢复原始地面检测距离
        this.collisionDetector.config.groundDistance = originalGroundDistance;

        if (groundInfo && groundInfo.distance < maxDistance) {
            // 计算正确的地面高度
            const groundHeight = groundInfo.point.y;
            const targetHeight = groundHeight + eyeHeight;

            // 调整相机位置
            this.camera.position.y = targetHeight;

            // 设置为在地面上
            this.isOnGround = true;
            this.verticalVelocity = 0;

            console.log(`[FirstPersonControls] ✅ 初始高度已调整:`);
            console.log(`  - 地面高度: ${groundHeight.toFixed(2)}m`);
            console.log(`  - 相机高度: ${targetHeight.toFixed(2)}m`);
            console.log(`  - 检测距离: ${groundInfo.distance.toFixed(2)}m`);
            console.log(`  - 碰撞对象: ${groundInfo.object.name || '(unnamed)'}`);

            // 触发地面事件
            this.emit('ground', true);
        } else {
            console.error(`[FirstPersonControls] ❌ 未检测到地面 (检测距离: ${maxDistance}m)`);
            console.error(`  - 当前位置: (${currentPosition.x.toFixed(2)}, ${currentPosition.y.toFixed(2)}, ${currentPosition.z.toFixed(2)})`);
            console.error(`  - 建议: 手动调整相机初始位置或增加 maxInitGroundDistance`);
            console.error(`  - 或检查碰撞检测目标是否正确配置`);
        }
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 键盘事件
        this.onKeyDown = this.handleKeyDown.bind(this);
        this.onKeyUp = this.handleKeyUp.bind(this);
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);

        // 鼠标移动事件
        this.onMouseMove = this.handleMouseMove.bind(this);
        document.addEventListener('mousemove', this.onMouseMove);

        // 指针锁定事件
        this.onPointerLockChange = this.handlePointerLockChange.bind(this);
        this.onPointerLockError = this.handlePointerLockError.bind(this);
        document.addEventListener('pointerlockchange', this.onPointerLockChange);
        document.addEventListener('pointerlockerror', this.onPointerLockError);
    }

    /**
     * 解绑事件监听器
     */
    unbindEvents() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('pointerlockchange', this.onPointerLockChange);
        document.removeEventListener('pointerlockerror', this.onPointerLockError);
    }

    /**
     * 锁定鼠标指针
     */
    lockPointer() {
        const element = this.scene.renderer.instance.domElement;
        console.log(`[FirstPersonControls] 请求锁定指针...`);
        console.log(`  - canvas element:`, element);
        element.requestPointerLock();
    }

    /**
     * 解锁鼠标指针
     */
    unlockPointer() {
        document.exitPointerLock();
    }

    /**
     * 处理指针锁定状态变化
     */
    handlePointerLockChange() {
        const element = this.scene.renderer.instance.domElement;
        this.isPointerLocked = document.pointerLockElement === element;

        // 🔧 调试日志：确认指针锁定状态
        console.log(`[FirstPersonControls] 指针锁定状态变化: ${this.isPointerLocked ? '已锁定' : '已解锁'}`);
        console.log(`  - pointerLockElement:`, document.pointerLockElement);
        console.log(`  - canvas element:`, element);

        if (this.isPointerLocked) {
            this.emit('pointerlock', true);
        } else {
            this.emit('pointerlock', false);
        }
    }

    /**
     * 处理指针锁定错误
     */
    handlePointerLockError() {
        console.error('Pointer lock error');
        this.emit('pointerlockerror');
    }

    /**
     * 处理键盘按下事件
     */
    handleKeyDown(event) {
        const code = event.code;

        // 记录按键状态
        this.keys[code] = true;

        // 移动控制
        if (this.config.keys.forward.includes(code)) {
            this.moveForward = true;
        }
        if (this.config.keys.backward.includes(code)) {
            this.moveBackward = true;
        }
        if (this.config.keys.left.includes(code)) {
            this.moveLeft = true;
        }
        if (this.config.keys.right.includes(code)) {
            this.moveRight = true;
        }

        // 跑步控制
        if (this.config.keys.run.includes(code)) {
            this.isRunning = true;
        }

        // 跳跃控制
        if (this.config.keys.jump.includes(code) && this.config.jump.enabled) {
            this.tryJump();
        }
    }

    /**
     * 处理键盘释放事件
     */
    handleKeyUp(event) {
        const code = event.code;

        // 清除按键状态
        this.keys[code] = false;

        // 移动控制
        if (this.config.keys.forward.includes(code)) {
            this.moveForward = false;
        }
        if (this.config.keys.backward.includes(code)) {
            this.moveBackward = false;
        }
        if (this.config.keys.left.includes(code)) {
            this.moveLeft = false;
        }
        if (this.config.keys.right.includes(code)) {
            this.moveRight = false;
        }

        // 跑步控制
        if (this.config.keys.run.includes(code)) {
            this.isRunning = false;
        }
    }

    /**
     * 处理鼠标移动事件
     */
    handleMouseMove(event) {
        if (!this.isPointerLocked) return;

        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        // 🔧 调试日志：验证鼠标事件是否触发
        if (this.config.debugMode && this.frameCount % 60 === 0) {
            console.log(`[FirstPersonControls] 鼠标移动: movementX=${movementX}, movementY=${movementY}`);
        }

        // 更新欧拉角
        this.euler.y -= movementX * this.config.lookSpeed;
        this.euler.x -= movementY * this.config.lookSpeed;

        // 限制俯仰角度（防止翻转）
        this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));

        // 应用到相机
        this.camera.quaternion.setFromEuler(this.euler);
    }

    /**
     * 尝试跳跃
     */
    tryJump() {
        const now = Date.now();
        const canJumpNow = this.isOnGround &&
                          (now - this.lastJumpTime) > this.config.jump.cooldown;

        if (canJumpNow) {
            // 计算跳跃初速度：v = sqrt(2 * g * h)
            const jumpVelocity = Math.sqrt(
                2 * this.config.gravity.strength * this.config.jump.height
            );
            this.verticalVelocity = jumpVelocity;
            this.isOnGround = false;
            this.lastJumpTime = now;

            this.emit('jump', { height: this.config.jump.height });
        }
    }

    /**
     * 更新移动
     */
    updateMovement(delta) {
        // 计算移动速度
        const actualSpeed = this.isRunning
            ? this.config.moveSpeed * this.config.runSpeedMultiplier
            : this.config.moveSpeed;

        // 重置速度
        this.velocity.x = 0;
        this.velocity.z = 0;

        // 获取相机前方和右方向（忽略Y轴）
        this.camera.getWorldDirection(this.direction);
        this.direction.y = 0;
        this.direction.normalize();

        // 计算右方向
        const right = new THREE.Vector3();
        right.crossVectors(this.direction, this.camera.up).normalize();

        // 根据按键计算移动方向
        if (this.moveForward) {
            this.velocity.add(this.direction.clone().multiplyScalar(actualSpeed));
        }
        if (this.moveBackward) {
            this.velocity.add(this.direction.clone().multiplyScalar(-actualSpeed));
        }
        if (this.moveLeft) {
            this.velocity.add(right.clone().multiplyScalar(-actualSpeed));
        }
        if (this.moveRight) {
            this.velocity.add(right.clone().multiplyScalar(actualSpeed));
        }

        // 如果有移动，进行碰撞检测
        if (this.velocity.length() > 0 && this.collisionDetector) {
            this.applyCollisionDetection(delta);
        } else {
            // 没有碰撞检测，直接移动
            this.camera.position.x += this.velocity.x * delta;
            this.camera.position.z += this.velocity.z * delta;
        }
    }

    /**
     * 应用碰撞检测
     */
    applyCollisionDetection(delta) {
        // 🔧 第三阶段：碰撞检测频率控制
        const currentTime = performance.now();
        const timeSinceLastCheck = currentTime - this.lastCollisionCheckTime;

        // 检查是否需要执行碰撞检测
        if (timeSinceLastCheck < this.collisionCheckInterval) {
            // 使用上一次的碰撞检测结果，直接移动
            this.camera.position.x += this.velocity.x * delta;
            this.camera.position.z += this.velocity.z * delta;
            return;
        }

        // 更新最后检测时间
        this.lastCollisionCheckTime = currentTime;

        // 计算预期的新位置
        const newPosition = this.camera.position.clone();
        const moveX = this.velocity.x * delta;
        const moveZ = this.velocity.z * delta;

        // 分别检测X和Z方向的碰撞
        let canMoveX = true;
        let canMoveZ = true;

        // 检测X方向
        if (Math.abs(moveX) > 0.001) {
            const testPosX = newPosition.clone();
            testPosX.x += moveX;

            const directionX = new THREE.Vector3(Math.sign(moveX), 0, 0);
            const collisionX = this.collisionDetector.checkDirection(
                this.camera.position,
                directionX,
                Math.abs(moveX) + this.config.collision.rayDistance
            );

            if (collisionX && collisionX.distance < this.config.collision.rayDistance) {
                canMoveX = false;
                this.emit('collision', {
                    direction: 'x',
                    object: collisionX.object,
                    point: collisionX.point,
                    distance: collisionX.distance
                });
            }
        }

        // 检测Z方向
        if (Math.abs(moveZ) > 0.001) {
            const testPosZ = newPosition.clone();
            testPosZ.z += moveZ;

            const directionZ = new THREE.Vector3(0, 0, Math.sign(moveZ));
            const collisionZ = this.collisionDetector.checkDirection(
                this.camera.position,
                directionZ,
                Math.abs(moveZ) + this.config.collision.rayDistance
            );

            if (collisionZ && collisionZ.distance < this.config.collision.rayDistance) {
                canMoveZ = false;
                this.emit('collision', {
                    direction: 'z',
                    object: collisionZ.object,
                    point: collisionZ.point,
                    distance: collisionZ.distance
                });
            }
        }

        // 应用移动（只移动没有碰撞的方向）
        if (canMoveX) {
            this.camera.position.x += moveX;
        }
        if (canMoveZ) {
            this.camera.position.z += moveZ;
        }
    }

    /**
     * 更新重力
     */
    updateGravity(delta) {
        // 检测地面
        const groundCheck = this.collisionDetector.checkGround(this.camera.position);

        // 调试日志（每60帧输出一次，避免刷屏）
        if (this.config.debugMode && this.frameCount % 60 === 0) {
            console.log(`[FirstPersonControls] 重力系统状态:`);
            console.log(`  - 相机位置: (${this.camera.position.x.toFixed(2)}, ${this.camera.position.y.toFixed(2)}, ${this.camera.position.z.toFixed(2)})`);
            console.log(`  - 垂直速度: ${this.verticalVelocity.toFixed(2)} m/s`);
            console.log(`  - 地面检测: ${groundCheck ? '✓' : '✗'}`);
            if (groundCheck) {
                console.log(`  - 地面距离: ${groundCheck.distance.toFixed(2)}m`);
                console.log(`  - 地面高度: ${groundCheck.point.y.toFixed(2)}m`);
            }
        }

        if (groundCheck) {
            // 🔧 修复：使用更小的阈值，避免反复调整高度
            const groundThreshold = 0.05;  // 从 0.1 改为 0.05
            const distanceToGround = groundCheck.distance;

            if (distanceToGround <= groundThreshold) {
                // 在地面上
                if (!this.isOnGround && this.config.debugMode) {
                    console.log(`[FirstPersonControls] 着陆 - 地面距离: ${distanceToGround.toFixed(3)}m`);
                }

                this.isOnGround = true;
                this.verticalVelocity = 0;

                // 🔧 修复：只在距离过小时才调整，避免反复调整
                // 使用更小的阈值 0.01 来判断是否需要调整
                const adjustThreshold = 0.01;
                if (distanceToGround < adjustThreshold) {
                    this.camera.position.y = groundCheck.point.y + this.config.playerBody.eyeHeight;
                }

                this.emit('ground', true);
            } else {
                // 在空中，应用重力
                if (this.isOnGround && this.config.debugMode) {
                    console.log(`[FirstPersonControls] 离开地面 - 距离: ${distanceToGround.toFixed(2)}m`);
                }

                this.isOnGround = false;
                this.applyGravity(delta);
            }
        } else {
            // 没有检测到地面，应用重力
            if (this.isOnGround && this.config.debugMode) {
                console.log(`[FirstPersonControls] ⚠️ 失去地面检测！开始下落...`);
            }

            this.isOnGround = false;
            this.applyGravity(delta);
        }
    }

    /**
     * 应用重力加速度
     */
    applyGravity(delta) {
        // 更新垂直速度：v = v - g * t
        this.verticalVelocity -= this.config.gravity.strength * delta;

        // 限制最大下落速度
        this.verticalVelocity = Math.max(
            -this.config.gravity.maxFallSpeed,
            this.verticalVelocity
        );

        // 应用垂直移动
        this.camera.position.y += this.verticalVelocity * delta;

        this.emit('ground', false);
    }

    /**
     * 每帧更新
     */
    onUpdate(delta) {
        if (!this.isPointerLocked) return;

        // 增加帧计数器
        this.frameCount++;

        // 更新移动
        this.updateMovement(delta);

        // 更新重力
        if (this.config.gravity.enabled) {
            this.updateGravity(delta);
        }

        // 更新调试辅助对象
        if (this.collisionDetector && this.config.collision.debug) {
            this.collisionDetector.updateDebugHelpers(this.camera.position);
        }
    }

    // ==================== 🔧 第三阶段：性能监控API ====================

    /**
     * 获取性能统计信息
     * @returns {Object} 性能统计数据
     */
    getPerformanceStats() {
        if (!this.collisionDetector) {
            return null;
        }

        const stats = this.collisionDetector.getPerformanceStats();

        return {
            collision: stats,
            updateRate: this.config.collision.updateRate,
            actualUpdateInterval: this.collisionCheckInterval,
            frameCount: this.frameCount
        };
    }

    /**
     * 重置性能统计
     */
    resetPerformanceStats() {
        if (this.collisionDetector) {
            this.collisionDetector.resetPerformanceStats();
        }
        this.frameCount = 0;
    }

    /**
     * 组件销毁
     */
    onDispose() {
        // 解绑事件
        this.unbindEvents();

        // 解锁鼠标
        if (this.isPointerLocked) {
            this.unlockPointer();
        }

        // 销毁碰撞检测器
        if (this.collisionDetector) {
            this.collisionDetector.dispose();
            this.collisionDetector = null;
        }

        console.log('FirstPersonControls disposed');
    }
}

export default FirstPersonControls;
