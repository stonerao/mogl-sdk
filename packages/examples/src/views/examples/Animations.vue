<template>
    <SplitLayout :code="sourceCode" language="javascript" title="05 - Path Animations">
        <div class="scene-container" ref="sceneContainer">
            <GuiLoading
                :visible="isLoading"
                :text="loadingText || '加载中...'"
                :showProgress="true"
                :progress="loadingProgress || 0"
            />

            <GuiPanel title="路径动画">
                <GuiSection title="播放控制">
                    <div class="playback-controls">
                        <GuiButton
                            :label="animationStatus.isPlaying ? '暂停' : '播放'"
                            @click="playAnimation"
                        />
                        <GuiButton label="停止" variant="secondary" @click="stopAnimation" />
                        <GuiButton label="重置" variant="secondary" @click="resetAnimation" />
                    </div>

                    <div class="status-display">
                        <GuiInfoItem
                            label="状态:"
                            :value="
                                animationStatus.isPlaying
                                    ? '播放中'
                                    : animationStatus.isPaused
                                    ? '已暂停'
                                    : '已停止'
                            "
                        />
                        <GuiInfoItem
                            label="进度:"
                            :value="`${(animationStatus.progress * 100).toFixed(1)}%`"
                        />
                    </div>

                    <GuiSlider
                        label="动画进度"
                        :modelValue="animationStatus.progress"
                        @update:modelValue="seekToProgress"
                        :min="0"
                        :max="1"
                        :step="0.01"
                        :precision="3"
                        suffix="%"
                    />
                    <GuiSlider
                        label="移动速度"
                        v-model="pathSettings.speed"
                        @change="updateSpeed"
                        :min="0.1"
                        :max="10"
                        :step="0.1"
                        :precision="1"
                        suffix=" 单位/秒"
                    />
                </GuiSection>

                <GuiSection title="循环模式">
                    <GuiRadio
                        v-model="pathSettings.loopMode"
                        @change="updateLoopMode"
                        :options="[
                            { value: 'none', label: '单次播放' },
                            { value: 'loop', label: '循环播放' },
                            { value: 'pingPong', label: '往返播放' }
                        ]"
                    />
                </GuiSection>

                <GuiSection title="对象朝向">
                    <GuiSelect
                        label="朝向模式"
                        v-model="pathSettings.lookAtDirection"
                        @change="updateLookAtDirection"
                        :options="[
                            { value: 'forward', label: '朝向运动方向' },
                            { value: 'backward', label: '朝向运动反方向' },
                            { value: 'up', label: '朝向上方 (+Y)' },
                            { value: 'down', label: '朝向下方 (-Y)' },
                            { value: 'fixed', label: '固定朝向' },
                            { value: 'custom', label: '自定义朝向' }
                        ]"
                    />

                    <div v-if="pathSettings.lookAtDirection === 'custom'" class="custom-rotation">
                        <GuiSlider
                            label="X 旋转"
                            v-model="customRotation.x"
                            @change="updateCustomRotation"
                            :min="-180"
                            :max="180"
                            :step="1"
                            suffix="°"
                        />
                        <GuiSlider
                            label="Y 旋转"
                            v-model="customRotation.y"
                            @change="updateCustomRotation"
                            :min="-180"
                            :max="180"
                            :step="1"
                            suffix="°"
                        />
                        <GuiSlider
                            label="Z 旋转"
                            v-model="customRotation.z"
                            @change="updateCustomRotation"
                            :min="-180"
                            :max="180"
                            :step="1"
                            suffix="°"
                        />
                    </div>
                </GuiSection>

                <GuiSection title="缓动效果">
                    <GuiSelect
                        label="缓动函数"
                        v-model="pathSettings.easing"
                        @change="updateEasing"
                        :options="[
                            { value: 'linear', label: '线性 (Linear)' },
                            { value: 'easeIn', label: '加速 (Ease In)' },
                            { value: 'easeOut', label: '减速 (Ease Out)' },
                            { value: 'easeInOut', label: '平滑 (Ease In Out)' }
                        ]"
                    />
                </GuiSection>

                <GuiSection title="预设路径">
                    <div class="preset-buttons">
                        <GuiButton
                            label="直线路径"
                            variant="secondary"
                            @click="loadPresetPath('line')"
                        />
                        <GuiButton
                            label="三角形路径"
                            variant="secondary"
                            @click="loadPresetPath('triangle')"
                        />
                        <GuiButton
                            label="矩形路径"
                            variant="secondary"
                            @click="loadPresetPath('rectangle')"
                        />
                        <GuiButton
                            label="圆形路径"
                            variant="secondary"
                            @click="loadPresetPath('circle')"
                        />
                        <GuiButton
                            label="螺旋路径"
                            variant="secondary"
                            @click="loadPresetPath('spiral')"
                        />
                    </div>
                </GuiSection>

                <GuiSection title="路径信息">
                    <GuiInfoItem label="路径点数:" :value="currentPath.length" />
                    <GuiInfoItem
                        label="总距离:"
                        :value="`${animationStatus.totalDistance.toFixed(2)} 单位`"
                    />
                    <GuiInfoItem
                        label="当前距离:"
                        :value="`${animationStatus.currentDistance.toFixed(2)} 单位`"
                    />
                </GuiSection>
            </GuiPanel>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { PathAnimation, GridHelper } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiSelect,
    GuiButton,
    GuiInfoItem,
    GuiLoading,
    GuiRadio
} from '@/components/Gui';
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
        scene.dispose();
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

<style scoped lang="less">
@import '@/styles/gui.less';

.scene-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.playback-controls {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
}

.status-display {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    border: 1px solid rgba(0, 255, 136, 0.1);
    margin-top: 10px;
}

.custom-rotation {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.preset-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}
</style>
