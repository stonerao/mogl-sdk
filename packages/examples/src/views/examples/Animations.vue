<template>
    <SplitLayout :code="sourceCode" language="javascript" title="05 - Path Animations">
        <div class="scene-container" ref="sceneContainer">
            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-overlay">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">{{ loadingText || '加载中...' }}</div>
                    <div class="loading-progress">
                        <div class="progress-bar">
                            <div
                                class="progress-fill"
                                :style="{ width: `${loadingProgress || 0}%` }"
                            ></div>
                        </div>
                        <span class="progress-text">{{ loadingProgress || 0 }}%</span>
                    </div>
                </div>
            </div>

            <!-- 控制面板 -->
            <div class="control-panel">
                <!-- 路径动画播放控制 -->
                <div class="control-section">
                    <h4>路径动画控制</h4>
                    <div class="animation-controls">
                        <div class="playback-controls">
                            <button
                                @click="playAnimation"
                                class="play-btn"
                                :disabled="!pathAnimation"
                            >
                                {{ animationStatus.isPlaying ? '暂停' : '播放' }}
                            </button>
                            <button
                                @click="stopAnimation"
                                class="stop-btn"
                                :disabled="!pathAnimation"
                            >
                                停止
                            </button>
                            <button
                                @click="resetAnimation"
                                class="reset-btn"
                                :disabled="!pathAnimation"
                            >
                                重置
                            </button>
                        </div>

                        <!-- 动画状态显示 -->
                        <div class="status-display">
                            <div class="status-item">
                                <span>状态:</span>
                                <span
                                    class="value"
                                    :class="{
                                        playing: animationStatus.isPlaying,
                                        paused: animationStatus.isPaused
                                    }"
                                >
                                    {{
                                        animationStatus.isPlaying
                                            ? '播放中'
                                            : animationStatus.isPaused
                                            ? '已暂停'
                                            : '已停止'
                                    }}
                                </span>
                            </div>
                            <div class="status-item">
                                <span>进度:</span>
                                <span class="value"
                                    >{{ (animationStatus.progress * 100).toFixed(1) }}%</span
                                >
                            </div>
                        </div>

                        <!-- 进度控制 -->
                        <div class="progress-control">
                            <label>动画进度</label>
                            <div class="param-group">
                                <input
                                    type="range"
                                    :value="animationStatus.progress"
                                    @input="seekToProgress"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    :disabled="!pathAnimation"
                                />
                                <span>{{ (animationStatus.progress * 100).toFixed(1) }}%</span>
                            </div>
                        </div>

                        <!-- 速度控制 -->
                        <div class="speed-control">
                            <label>移动速度</label>
                            <div class="param-group">
                                <input
                                    type="range"
                                    v-model.number="pathSettings.speed"
                                    @input="updateSpeed"
                                    min="0.1"
                                    max="10"
                                    step="0.1"
                                />
                                <span>{{ pathSettings.speed }} 单位/秒</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 循环模式控制 -->
                <div class="control-section">
                    <h4>循环模式</h4>
                    <div class="loop-controls">
                        <div class="setting-group">
                            <label>
                                <input
                                    type="radio"
                                    v-model="pathSettings.loopMode"
                                    value="none"
                                    @change="updateLoopMode"
                                />
                                单次播放
                            </label>
                        </div>
                        <div class="setting-group">
                            <label>
                                <input
                                    type="radio"
                                    v-model="pathSettings.loopMode"
                                    value="loop"
                                    @change="updateLoopMode"
                                />
                                循环播放
                            </label>
                        </div>
                        <div class="setting-group">
                            <label>
                                <input
                                    type="radio"
                                    v-model="pathSettings.loopMode"
                                    value="pingPong"
                                    @change="updateLoopMode"
                                />
                                往返播放
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 朝向控制 -->
                <div class="control-section">
                    <h4>对象朝向</h4>
                    <div class="look-at-controls">
                        <div class="param-group">
                            <label>朝向模式</label>
                            <select
                                v-model="pathSettings.lookAtDirection"
                                @change="updateLookAtDirection"
                            >
                                <option value="forward">朝向运动方向</option>
                                <option value="backward">朝向运动反方向</option>
                                <option value="up">朝向上方 (+Y)</option>
                                <option value="down">朝向下方 (-Y)</option>
                                <option value="fixed">固定朝向</option>
                                <option value="custom">自定义朝向</option>
                            </select>
                        </div>

                        <!-- 自定义朝向角度 -->
                        <div
                            v-if="pathSettings.lookAtDirection === 'custom'"
                            class="custom-rotation"
                        >
                            <div class="param-group">
                                <label>X 旋转 (度)</label>
                                <input
                                    type="range"
                                    v-model.number="customRotation.x"
                                    @input="updateCustomRotation"
                                    min="-180"
                                    max="180"
                                    step="1"
                                />
                                <span>{{ customRotation.x }}°</span>
                            </div>
                            <div class="param-group">
                                <label>Y 旋转 (度)</label>
                                <input
                                    type="range"
                                    v-model.number="customRotation.y"
                                    @input="updateCustomRotation"
                                    min="-180"
                                    max="180"
                                    step="1"
                                />
                                <span>{{ customRotation.y }}°</span>
                            </div>
                            <div class="param-group">
                                <label>Z 旋转 (度)</label>
                                <input
                                    type="range"
                                    v-model.number="customRotation.z"
                                    @input="updateCustomRotation"
                                    min="-180"
                                    max="180"
                                    step="1"
                                />
                                <span>{{ customRotation.z }}°</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 缓动函数 -->
                <div class="control-section">
                    <h4>缓动效果</h4>
                    <div class="easing-controls">
                        <div class="param-group">
                            <label>缓动函数</label>
                            <select v-model="pathSettings.easing" @change="updateEasing">
                                <option value="linear">线性 (Linear)</option>
                                <option value="easeIn">加速 (Ease In)</option>
                                <option value="easeOut">减速 (Ease Out)</option>
                                <option value="easeInOut">平滑 (Ease In Out)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- 预设路径 -->
                <div class="control-section">
                    <h4>预设路径</h4>
                    <div class="preset-controls">
                        <div class="preset-buttons">
                            <button @click="loadPresetPath('line')" class="preset-btn">
                                直线路径
                            </button>
                            <button @click="loadPresetPath('triangle')" class="preset-btn">
                                三角形路径
                            </button>
                            <button @click="loadPresetPath('rectangle')" class="preset-btn">
                                矩形路径
                            </button>
                            <button @click="loadPresetPath('circle')" class="preset-btn">
                                圆形路径
                            </button>
                            <button @click="loadPresetPath('spiral')" class="preset-btn">
                                螺旋路径
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 路径信息 -->
                <div class="control-section" v-if="pathAnimation">
                    <h4>路径信息</h4>
                    <div class="path-info">
                        <div class="info-item">
                            <span>路径点数:</span>
                            <span class="value">{{ currentPath.length }}</span>
                        </div>
                        <div class="info-item">
                            <span>总距离:</span>
                            <span class="value"
                                >{{ animationStatus.totalDistance.toFixed(2) }} 单位</span
                            >
                        </div>
                        <div class="info-item">
                            <span>当前距离:</span>
                            <span class="value"
                                >{{ animationStatus.currentDistance.toFixed(2) }} 单位</span
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { PathAnimation, GridHelper } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';
import * as THREE from 'three';

// 基础状态
const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('初始化场景...');
const loadingProgress = ref(0);

// 场景和组件引用
let scene = null;
let pathAnimation = null;
let animatedObject = null;

// 动画状态
const animationStatus = reactive({
    isPlaying: false,
    isPaused: false,
    progress: 0,
    currentDistance: 0,
    totalDistance: 0
});

// 路径设置
const pathSettings = reactive({
    speed: 2.0,
    loopMode: 'loop', // 'none', 'loop', 'pingPong'
    lookAtDirection: 'forward',
    easing: 'linear',
    showPath: true
});

// 自定义旋转角度
const customRotation = reactive({
    x: 0,
    y: 0,
    z: 0
});

// 预设路径
const presetPaths = {
    line: [
        [0, 0, 0],
        [20, 0, 0]
    ],
    triangle: [
        [0, 0, 0],
        [10, 0, 10],
        [-10, 0, 10]
    ],
    rectangle: [
        [-10, 0, -5],
        [10, 0, -5],
        [10, 0, 5],
        [-10, 0, 5]
    ],
    circle: [],
    spiral: []
};

// 生成圆形路径
const generateCirclePath = () => {
    const points = [];
    const radius = 8;
    const pointCount = 12;

    for (let i = 0; i < pointCount; i++) {
        const angle = (i / pointCount) * Math.PI * 2;
        points.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return points;
};

// 生成螺旋路径
const generateSpiralPath = () => {
    const points = [];
    const turns = 2;
    const height = 15;
    const radius = 6;

    for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const angle = t * turns * Math.PI * 2;
        points.push([Math.cos(angle) * radius, t * height, Math.sin(angle) * radius]);
    }
    return points;
};

// 初始化预设路径
presetPaths.circle = generateCirclePath();
presetPaths.spiral = generateSpiralPath();

// 当前使用的路径
const currentPath = ref([...presetPaths.rectangle]);

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { PathAnimation, GridHelper } from '@w3d/components';

// 创建场景
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    outputColorSpace: 'srgb'
  },
  camera: {
    fov: 45,
    position: [15, 10, 15],
    lookAt: [0, 0, 0]
  }
});

// 初始化场景
scene.init();
scene.renderer.enableShadow(true);
scene.renderer.enableResize();

// 注册组件
scene.registerComponent('PathAnimation', PathAnimation);
scene.registerComponent('GridHelper', GridHelper);

// 添加网格辅助
await scene.add('GridHelper', {
  name: 'grid',
  size: 30,
  divisions: 30,
  color: '#444444'
});

// ===== 基础路径动画 =====

// 创建运动对象（立方体）
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: '#00ff88' });
const cube = new THREE.Mesh(geometry, material);
scene.scene.add(cube);

// 创建路径动画
const pathAnim = await scene.add('PathAnimation', {
  name: 'cubeAnimation',
  path: [
    [-10, 0, -5],  // 起始点
    [10, 0, -5],   // 右上角
    [10, 0, 5],    // 右下角
    [-10, 0, 5]    // 左下角
  ],
  speed: 2.0,              // 移动速度
  loop: true,              // 循环播放
  pingPong: false,         // 往返模式
  lookAtDirection: 'forward', // 朝向运动方向
  easing: 'linear',        // 缓动函数
  showPath: true,          // 显示路径
  pathColor: '#00ff88'     // 路径颜色
});

// 将立方体添加到路径动画
pathAnim.add(cube);

// ===== 路径动画控制 =====

// 播放控制
pathAnim.play();         // 播放
pathAnim.pause();        // 暂停
pathAnim.stop();         // 停止
pathAnim.reset();        // 重置

// 跳转控制
pathAnim.jumpToProgress(0.5);  // 跳转到50%进度
pathAnim.jumpToPoint(2);       // 跳转到第3个路径点

// 配置更新
pathAnim.updateConfig({
  speed: 3.0,
  lookAtDirection: 'up',
  easing: 'easeInOut'
});

// ===== 预设路径示例 =====

// 圆形路径
const circlePoints = [];
const radius = 8;
for (let i = 0; i < 12; i++) {
  const angle = (i / 12) * Math.PI * 2;
  circlePoints.push([
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius
  ]);
}

const circleAnim = await scene.add('PathAnimation', {
  name: 'circleMotion',
  path: circlePoints,
  speed: 1.5,
  loop: true,
  lookAtDirection: 'forward'
});

// 螺旋上升路径
const spiralPoints = [];
const turns = 2;
const height = 15;
for (let i = 0; i <= 30; i++) {
  const t = i / 30;
  const angle = t * turns * Math.PI * 2;
  spiralPoints.push([
    Math.cos(angle) * 6,
    t * height,
    Math.sin(angle) * 6
  ]);
}

const spiralAnim = await scene.add('PathAnimation', {
  name: 'spiralMotion',
  path: spiralPoints,
  speed: 2.0,
  loop: false,
  lookAtDirection: 'forward',
  easing: 'easeInOut'
});

// ===== 事件监听 =====

// 监听动画更新
pathAnim.on('update', (data) => {
  console.log('进度:', data.progress);
  console.log('当前位置:', data.point);
});

// 监听动画完成
pathAnim.on('complete', () => {
  console.log('动画播放完成');
});

// 监听往返模式事件
pathAnim.on('reachEnd', () => {
  console.log('到达终点，开始返回');
});

pathAnim.on('reachStart', () => {
  console.log('返回起点，重新出发');
});

// ===== 高级功能 =====

// 动态添加路径点
pathAnim.addPathPoint([15, 5, 0]);

// 删除路径点
pathAnim.removePathPoint(1);

// 更新整个路径
pathAnim.updatePath([
  [0, 0, 0],
  [20, 10, 0],
  [0, 20, 0]
]);

// 获取动画状态
const status = pathAnim.getStatus();
console.log('播放状态:', status.isPlaying);
console.log('当前进度:', status.progress);

// 启动渲染循环
scene.start();`;

// 初始化场景
const initScene = async () => {
    if (!sceneContainer.value) return;

    try {
        isLoading.value = true;
        loadingText.value = '初始化场景...';
        loadingProgress.value = 20;

        // 创建场景
        scene = new Scene(sceneContainer.value, {
            renderer: {
                antialias: true,
                outputColorSpace: 'srgb'
            },
            camera: {
                fov: 45,
                position: [15, 10, 15],
                lookAt: [0, 0, 0]
            }
        });

        scene.init();
        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        loadingProgress.value = 40;

        // 注册组件
        scene.registerComponent('PathAnimation', PathAnimation);
        scene.registerComponent('GridHelper', GridHelper);

        loadingProgress.value = 60;

        // 添加网格辅助
        await scene.add('GridHelper', {
            name: 'grid',
            size: 30,
            divisions: 30,
            color: '#444444'
        });

        loadingProgress.value = 80;

        // 创建运动对象
        await createAnimatedObject();

        // 创建路径动画
        await createPathAnimation();

        loadingProgress.value = 100;

        // 启动渲染
        scene.start();

        loadingText.value = '场景初始化完成';
    } catch (error) {
        console.error('场景初始化失败:', error);
        loadingText.value = '初始化失败: ' + error.message;
    } finally {
        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    }
};

// 创建运动对象
const createAnimatedObject = async () => {
    // 这里我们使用 Three.js 创建一个简单的立方体
    // 在实际应用中，你可以使用 ModelLoader 加载 3D 模型
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
        color: '#00ff88',
        transparent: true,
        opacity: 0.8
    });

    animatedObject = new THREE.Mesh(geometry, material);
    animatedObject.castShadow = true;
    animatedObject.receiveShadow = true;

    scene.scene.add(animatedObject);
};

// 创建路径动画
const createPathAnimation = async () => {
    pathAnimation = await scene.add('PathAnimation', {
        name: 'mainPathAnimation',
        path: currentPath.value,
        speed: pathSettings.speed,
        loop: pathSettings.loopMode === 'loop',
        pingPong: pathSettings.loopMode === 'pingPong',
        lookAtDirection: pathSettings.lookAtDirection,
        customRotation: [
            (customRotation.x * Math.PI) / 180,
            (customRotation.y * Math.PI) / 180,
            (customRotation.z * Math.PI) / 180
        ],
        easing: pathSettings.easing,
        showPath: pathSettings.showPath,
        pathColor: '#00ff88',
        pathWidth: 3
    });

    // 将运动对象添加到路径动画
    if (animatedObject) {
        pathAnimation.add(animatedObject);
    }

    // 监听动画事件
    setupAnimationEvents();
};

// 设置动画事件监听
const setupAnimationEvents = () => {
    if (!pathAnimation) return;

    pathAnimation.on('update', (data) => {
        animationStatus.progress = data.progress;
        animationStatus.currentDistance = data.currentDistance;
        animationStatus.totalDistance = data.totalDistance;
    });

    pathAnimation.on('play', () => {
        animationStatus.isPlaying = true;
        animationStatus.isPaused = false;
    });

    pathAnimation.on('pause', () => {
        animationStatus.isPlaying = false;
        animationStatus.isPaused = true;
    });

    pathAnimation.on('stop', () => {
        animationStatus.isPlaying = false;
        animationStatus.isPaused = false;
        animationStatus.progress = 0;
    });

    pathAnimation.on('reset', () => {
        animationStatus.isPlaying = false;
        animationStatus.isPaused = false;
        animationStatus.progress = 0;
    });

    pathAnimation.on('complete', () => {
        console.log('路径动画播放完成');
    });

    pathAnimation.on('reachEnd', () => {
        console.log('到达路径终点');
    });

    pathAnimation.on('reachStart', () => {
        console.log('返回路径起点');
    });
};

// 播放控制方法
const playAnimation = () => {
    if (!pathAnimation) return;

    if (animationStatus.isPlaying) {
        pathAnimation.pause();
    } else {
        pathAnimation.play();
    }
};

const stopAnimation = () => {
    if (!pathAnimation) return;
    pathAnimation.stop();
};

const resetAnimation = () => {
    if (!pathAnimation) return;
    pathAnimation.reset();
};

// 进度控制
const seekToProgress = (event) => {
    if (!pathAnimation) return;
    const progress = parseFloat(event.target.value);
    pathAnimation.jumpToProgress(progress);
};

// 速度控制
const updateSpeed = () => {
    if (!pathAnimation) return;
    pathAnimation.updateConfig({ speed: pathSettings.speed });
};

// 循环模式控制
const updateLoopMode = () => {
    if (!pathAnimation) return;

    pathAnimation.updateConfig({
        loop: pathSettings.loopMode === 'loop',
        pingPong: pathSettings.loopMode === 'pingPong'
    });
};

// 朝向控制
const updateLookAtDirection = () => {
    if (!pathAnimation) return;

    pathAnimation.updateConfig({
        lookAtDirection: pathSettings.lookAtDirection
    });
};

// 自定义旋转控制
const updateCustomRotation = () => {
    if (!pathAnimation) return;

    pathAnimation.updateConfig({
        customRotation: [
            (customRotation.x * Math.PI) / 180,
            (customRotation.y * Math.PI) / 180,
            (customRotation.z * Math.PI) / 180
        ]
    });
};

// 缓动函数控制
const updateEasing = () => {
    if (!pathAnimation) return;

    pathAnimation.updateConfig({
        easing: pathSettings.easing
    });
};

// 加载预设路径
const loadPresetPath = async (pathType) => {
    if (!presetPaths[pathType]) return;

    try {
        // 更新当前路径
        currentPath.value = [...presetPaths[pathType]];

        // 如果路径动画已存在，更新路径
        if (pathAnimation) {
            pathAnimation.updatePath(currentPath.value);
        }

        console.log(`已加载 ${pathType} 路径，包含 ${currentPath.value.length} 个点`);
    } catch (error) {
        console.error('加载预设路径失败:', error);
    }
};

// 清理资源
const cleanup = () => {
    if (pathAnimation) {
        pathAnimation.stop();
    }

    if (scene) {
        scene.destroy();
        scene = null;
    }

    pathAnimation = null;
    animatedObject = null;
};

// 生命周期钩子
onMounted(async () => {
    try {
        await initScene();
    } catch (error) {
        console.error('初始化失败:', error);
        isLoading.value = false;
        loadingText.value = '初始化失败: ' + error.message;
    }
});

onUnmounted(() => {
    cleanup();
});
</script>

<style scoped>
.scene-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loading-content {
    text-align: center;
    color: white;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 255, 136, 0.3);
    border-top: 3px solid #00ff88;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 15px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.loading-text {
    font-size: 14px;
    margin-bottom: 15px;
    color: #00ff88;
}

.progress-bar {
    width: 200px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
    margin: 0 auto 10px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00ff88, #00cc6a);
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 12px;
    color: #00ff88;
}

.control-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 320px;
    max-height: calc(100vh - 40px);
    background: rgba(30, 30, 30, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(0, 255, 136, 0.2);
    color: white;
    overflow-y: auto;
    z-index: 100;
}

.control-section {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.control-section:last-child {
    border-bottom: none;
}

.control-section h4 {
    margin: 0 0 15px 0;
    color: #00ff88;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.animation-controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.playback-controls {
    display: flex;
    gap: 10px;
}

.playback-controls button {
    flex: 1;
    padding: 8px 12px;
    background: linear-gradient(135deg, #00ff88, #00cc6a);
    color: black;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.playback-controls button:hover:not(:disabled) {
    background: linear-gradient(135deg, #00cc6a, #00aa55);
    transform: translateY(-1px);
}

.playback-controls button:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
    transform: none;
}

.status-display {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    border: 1px solid rgba(0, 255, 136, 0.1);
}

.status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
}

.status-item .value {
    color: #00ff88;
    font-weight: 500;
}

.status-item .value.playing {
    color: #00ff88;
}

.status-item .value.paused {
    color: #ffaa00;
}

.param-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.param-group label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
}

.param-group input[type='range'] {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    outline: none;
    -webkit-appearance: none;
}

.param-group input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #00ff88;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
}

.param-group input[type='range']::-webkit-slider-thumb:hover {
    background: #00cc6a;
    transform: scale(1.1);
}

.param-group span {
    font-size: 11px;
    color: #00ff88;
    text-align: center;
    font-weight: 500;
}

.loop-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.setting-group {
    display: flex;
    align-items: center;
}

.setting-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: color 0.2s ease;
}

.setting-group label:hover {
    color: white;
}

.setting-group input[type='radio'],
.setting-group input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #00ff88;
}

.look-at-controls select,
.easing-controls select {
    width: 100%;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 255, 136, 0.3);
    border-radius: 6px;
    color: white;
    font-size: 12px;
    outline: none;
    transition: border-color 0.2s ease;
}

.look-at-controls select:focus,
.easing-controls select:focus {
    border-color: #00ff88;
}

.look-at-controls select option,
.easing-controls select option {
    background: #1a1a1a;
    color: white;
}

.custom-rotation {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.custom-rotation .param-group {
    margin-bottom: 12px;
}

.custom-rotation .param-group:last-child {
    margin-bottom: 0;
}

/* 滚动条样式 */
.control-panel::-webkit-scrollbar {
    width: 6px;
}

.control-panel::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 136, 0.5);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 136, 0.7);
}

/* 预设路径按钮样式 */
.preset-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.preset-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.preset-btn {
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 255, 136, 0.3);
    border-radius: 6px;
    color: white;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.preset-btn:hover {
    background: rgba(0, 255, 136, 0.1);
    border-color: #00ff88;
    transform: translateY(-1px);
}

.preset-btn:active {
    transform: translateY(0);
}

/* 路径信息样式 */
.path-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-item:last-child {
    border-bottom: none;
}

.info-item span:first-child {
    color: rgba(255, 255, 255, 0.7);
}

.info-item .value {
    color: #00ff88;
    font-weight: 500;
}

/* 修复 appearance 兼容性 */
.param-group input[type='range'] {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
}
</style>
