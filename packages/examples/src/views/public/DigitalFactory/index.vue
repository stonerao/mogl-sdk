<template>
    <div>
        <div ref="sceneContainer" class="scene-container">
            <div class="top-right-toolbar">
                <button class="btn btn-primary" @click="navigateToExamples">{{ t('intro.viewExamples') }}</button>
                <button class="btn btn-success">{{ t('common.projects') }}</button>
            </div>

            <!-- 第一人称控制提示 -->
            <div v-if="!isPointerLocked" class="control-hint">
                <div class="hint-content">
                    <h3>🎮 第一人称控制</h3>
                    <p>点击画面进入第一人称视角</p>
                    <div class="controls-list">
                        <div class="control-item">
                            <span class="key">W A S D</span>
                            <span class="desc">移动</span>
                        </div>
                        <div class="control-item">
                            <span class="key">鼠标</span>
                            <span class="desc">视角</span>
                        </div>
                        <div class="control-item">
                            <span class="key">空格</span>
                            <span class="desc">跳跃</span>
                        </div>
                        <div class="control-item">
                            <span class="key">Shift</span>
                            <span class="desc">跑步</span>
                        </div>
                        <div class="control-item">
                            <span class="key">ESC</span>
                            <span class="desc">退出</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 状态指示器 -->
            <div v-if="isPointerLocked" class="status-indicator">
                <div class="status-item">
                    <span class="label">位置:</span>
                    <span class="value">{{ cameraPosition }}</span>
                </div>
                <div class="status-item">
                    <span class="label">地面:</span>
                    <span class="value" :class="{ 'on-ground': isOnGround }">
                        {{ isOnGround ? '✓' : '✗' }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Scene } from '@w3d/core';
import { ModelLoader, HDRLoader, FirstPersonControls } from '@w3d/components';

const sceneContainer = ref(null);

let scene = null;
let modelComponent = null;
let hdrComponent = null;
let fpControls = null;

// UI状态
const isPointerLocked = ref(false);
const isOnGround = ref(false);
const cameraPosition = ref('0, 0, 0');

const { t } = useI18n();
const router = useRouter();
const navigateToExamples = () => {
    router.push('/examples');
};


onMounted(async () => {
    try {
        await initScene();
    } catch (error) {
        console.error('Scene initialization failed:', error);
    }
});

onUnmounted(() => {
    cleanup();
});

// Initialize scene
const initScene = async () => {
    try {
        // Create scene
        scene = new Scene(sceneContainer.value, {
            renderer: {
                antialias: true,
                outputColorSpace: 'srgb'
            },
            camera: {
                fov: 75,  // 增大FOV以获得更好的第一人称视野
                position: [-225, 50, 105],  // 初始位置（会自动调整到地面）
                near: 0.1,  // 减小near值以避免近处物体被裁剪
                lookAt: [0, 5, 0]
            }
        });

        // Initialize scene
        scene.init();

        // 🔧 禁用默认的 OrbitControls，避免与 FirstPersonControls 冲突
        if (scene.controls && scene.controls.instance) {
            console.log('[DigitalFactory] 禁用默认 OrbitControls...');
            scene.controls.instance.enabled = false;
            // 移除事件监听器，彻底禁用
            scene.controls.instance.dispose();
        }
        // Enable shadow and auto-resize
        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        // Register components
        scene.registerComponent('ModelLoader', ModelLoader);
        scene.registerComponent('HDRLoader', HDRLoader);
        scene.registerComponent('FirstPersonControls', FirstPersonControls);

        // Load HDR environment map
        hdrComponent = await scene.add('HDRLoader', {
            name: 'environment',
            url: '/textures/blouberg_sunrise_2_1k.hdr',
            intensity: 1.0,
            asEnvironment: true,
            asBackground: true
        });

        // Load model - use SDK built-in baked lighting feature
        modelComponent = await scene.add('ModelLoader', {
            name: 'model',
            url: '/models/DigitalFactory.glb',
            scale: 1,
            position: [0, 0, 0],
            castShadow: true,
            receiveShadow: true,

            // Use SDK built-in baked lighting functionality
            bakedLighting: {
                enabled: true,
                textureMapping: {
                    Land02: '/bake/DigitalFactory/Land02.jpg',
                    设备01: '/bake/DigitalFactory/设备01.jpg',
                    设备02: '/bake/DigitalFactory/设备02.jpg',
                    build01: '/bake/DigitalFactory/build01.jpg',
                    build02: '/bake/DigitalFactory/build02.jpg',
                    Land01: '/bake/DigitalFactory/Land01.jpg'
                },
                mode: 'bake',
                intensity: 0.4,
                autoApply: true,
                channel: 0,
                flipY: false,
                IndependentMaterial: true
            }
        });

        console.log('[DigitalFactory] ModelLoader 组件已添加，等待模型加载完成...');

        // 🔧 修复：等待模型完全加载后再添加第一人称控制器
        await new Promise((resolve) => {
            modelComponent.on('loadComplete', (data) => {
                console.log('[DigitalFactory] 模型加载完成:', data);
                console.log('[DigitalFactory] componentScene 子对象数量:', modelComponent.componentScene?.children?.length || 0);

                // 遍历并打印场景结构（用于调试）
                if (modelComponent.componentScene) {
                    let meshCount = 0;
                    modelComponent.componentScene.traverse((child) => {
                        if (child.isMesh) meshCount++;
                    });
                    console.log('[DigitalFactory] 场景中的 Mesh 数量:', meshCount);
                }

                resolve();
            });
        });

        console.log('[DigitalFactory] 开始添加第一人称控制器...');
        console.log('[DigitalFactory] modelComponent.componentScene:', modelComponent);
        // 添加第一人称控制器（带碰撞检测）
        fpControls = await scene.add('FirstPersonControls', {
            moveSpeed: 8,           // 移动速度
            lookSpeed: 0.1,       // 视角旋转速度
            runSpeedMultiplier: 4.0,

            // 碰撞检测配置
            collision: {
                enabled: true,
                rayDistance: 5.5,   // 碰撞检测距离
                groundDistance: 3.0, // 地面检测距离
                targets: [modelComponent.componentScene], // 与工厂模型碰撞
                debug: true,        // 🔧 临时启用调试模式查看射线
                // 🔧 第三阶段：性能优化
                useBVH: false,      // BVH加速（大型场景建议启用）
                updateRate: 60      // 碰撞检测频率（Hz）
            },

            // 重力配置
            gravity: {
                enabled: true,
                strength: 9.8,
                maxFallSpeed: 20
            },

            // 跳跃配置
            jump: {
                enabled: true,
                height: 2.0,
                cooldown: 500
            },

            // 玩家配置
            playerBody: {
                height: 1.8,
                eyeHeight: 1.6
            },

            // 自动锁定鼠标
            autoPointerLock: true,

            // 自动调整初始高度（防止掉落）
            autoAdjustHeight: true,
            maxInitGroundDistance: 100,  // 初始化时的最大地面检测距离

            // 🔧 临时启用调试模式查看详细日志
            debugMode: true
        });

        // 监听第一人称控制器事件
        fpControls.on('pointerlock', (locked) => {
            isPointerLocked.value = locked;
            console.log('指针锁定状态:', locked);
        });

        fpControls.on('collision', (data) => {
            console.log('碰撞:', data.direction, data.distance);
        });

        fpControls.on('jump', () => {
            console.log('跳跃!');
        });

        fpControls.on('ground', (onGround) => {
            isOnGround.value = onGround;
        });

        // 定时更新相机位置显示
        setInterval(() => {
            if (scene && scene.camera) {
                const pos = scene.camera.instance.position;
                cameraPosition.value = `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
            }
        }, 100);

        // 🔧 第三阶段：定时输出性能统计
        setInterval(() => {
            if (fpControls) {
                const stats = fpControls.getPerformanceStats();
                if (stats && stats.collision) {
                    console.log('[性能统计]', {
                        平均耗时: `${stats.collision.averageTime.toFixed(3)}ms`,
                        最后耗时: `${stats.collision.lastCheckTime.toFixed(3)}ms`,
                        最大耗时: `${stats.collision.maxTime.toFixed(3)}ms`,
                        最小耗时: `${stats.collision.minTime === Infinity ? 'N/A' : stats.collision.minTime.toFixed(3) + 'ms'}`,
                        总检测次数: stats.collision.totalChecks,
                        使用BVH: stats.collision.useBVH ? '是' : '否',
                        更新频率: `${stats.updateRate}Hz`
                    });
                }
            }
        }, 5000);  // 每5秒输出一次

        // Start rendering
        scene.start();
    } catch (error) {
        console.error('Scene loading failed:', error);
    }
};

// Clean up resources
const cleanup = () => {
    if (scene) {
        scene.dispose();
        scene = null;
    }
    modelComponent = null;
    hdrComponent = null;
    fpControls = null;
};
</script>

<style scoped>
.scene-container {
    width: 100vw;
    height: 100vh;
    background: #1a1a1a;
    position: relative;
    overflow: hidden;
    cursor: pointer;
}

.top-right-toolbar {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    gap: 8px;
    z-index: 2;
}

/* 控制提示面板 */
.control-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 32px;
    color: white;
    z-index: 10;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translate(-50%, -45%);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%);
    }
}

.hint-content h3 {
    margin: 0 0 16px 0;
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    color: #4CAF50;
}

.hint-content p {
    margin: 0 0 24px 0;
    text-align: center;
    color: #aaa;
    font-size: 14px;
}

.controls-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.control-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
}

.control-item .key {
    background: rgba(255, 255, 255, 0.1);
    padding: 6px 12px;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    min-width: 80px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.control-item .desc {
    color: #ccc;
    flex: 1;
}

/* 状态指示器 */
.status-indicator {
    position: absolute;
    top: 16px;
    left: 16px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    padding: 12px 16px;
    color: white;
    z-index: 2;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-item {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
}

.status-item:last-child {
    margin-bottom: 0;
}

.status-item .label {
    color: #888;
}

.status-item .value {
    color: #fff;
    font-weight: bold;
}

.status-item .value.on-ground {
    color: #4CAF50;
}
</style>
