<template>
    <SplitLayout :code="sourceCode" language="javascript" title="19 - Skeletal Animation">
        <div class="scene-container" ref="sceneContainer">
            <template v-if="isLoading">
                <GuiLoading :progress="loadingProgress" :text="loadingText" />
            </template>

            <template v-if="!isLoading">
                <GuiPanel title="骨骼动画控制" width="wide">
                    <!-- 动画选择 -->
                    <GuiSection title="动画选择">
                        <GuiSelect
                            label="当前动画"
                            v-model="currentAnimation"
                            :options="animationOptions"
                            @update:modelValue="switchAnimation"
                        />
                        <GuiInfoItem label="动画数量" :value="animationList.length" />
                        <GuiInfoItem
                            label="当前状态"
                            :value="isPlaying ? '播放中' : isPaused ? '已暂停' : '已停止'"
                        />
                    </GuiSection>

                    <!-- 播放控制 -->
                    <GuiSection title="播放控制">
                        <div class="button-group">
                            <GuiButton
                                :label="isPlaying ? '暂停' : '播放'"
                                @click="togglePlayPause"
                            />
                            <GuiButton label="停止" variant="secondary" @click="stopAnimation" />
                        </div>
                    </GuiSection>

                    <!-- 动画参数 -->
                    <GuiSection title="动画参数">
                        <GuiSlider
                            label="播放速度"
                            v-model="animationSpeed"
                            :min="0.1"
                            :max="3.0"
                            :step="0.1"
                            :precision="1"
                            @update:modelValue="updateSpeed"
                        />
                        <GuiCheckbox
                            label="循环播放"
                            v-model="loopAnimation"
                            @update:modelValue="updateLoopMode"
                        />
                    </GuiSection>

                    <!-- 模型信息 -->
                    <GuiSection title="模型信息">
                        <GuiInfoItem label="骨骼数量" :value="skeletonInfo.boneCount" />
                        <GuiInfoItem label="网格数量" :value="modelInfo.meshCount" />
                        <GuiInfoItem label="材质数量" :value="modelInfo.materialCount" />
                    </GuiSection>

                    <!-- 事件日志 -->
                    <GuiSection title="事件日志">
                        <div class="event-log">
                            <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
                                <span class="log-time">{{ log.time }}</span>
                                <span class="log-message">{{ log.message }}</span>
                            </div>
                        </div>
                    </GuiSection>
                </GuiPanel>
            </template>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { ModelLoader, GridHelper, HDRLoader } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiSelect,
    GuiCheckbox,
    GuiButton,
    GuiInfoItem,
    GuiLoading
} from '@/components/Gui';
import SplitLayout from '../../components/SplitLayout.vue';

const sceneContainer = ref(null);
const isLoading = ref(true);
const loadingText = ref('加载模型...');
const loadingProgress = ref(0);

// 动画状态
const currentAnimation = ref('');
const animationList = ref([]);
const animationOptions = ref([]);
const isPlaying = ref(false);
const isPaused = ref(false);
const animationSpeed = ref(1.0);
const loopAnimation = ref(true);

// 模型信息
const skeletonInfo = reactive({
    boneCount: 0
});

const modelInfo = reactive({
    meshCount: 0,
    materialCount: 0
});

// 事件日志
const eventLogs = ref([]);

// 场景和组件
let scene = null;
let modelComponent = null;

// 添加日志
const addLog = (message) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    eventLogs.value.unshift({ time, message });
    if (eventLogs.value.length > 50) {
        eventLogs.value.pop();
    }
};

// 初始化场景
onMounted(async () => {
    scene = new Scene(sceneContainer.value, {
        renderer: {
            antialias: true,
            outputColorSpace: 'srgb'
        },
        camera: {
            fov: 45,
            position: [3, 1.5, 3],
            lookAt: [0, 1, 0]
        }
    });

    scene.init();
    scene.renderer.enableShadow(true);
    scene.renderer.enableResize();

    // 注册组件
    scene.registerComponent('ModelLoader', ModelLoader);
    scene.registerComponent('GridHelper', GridHelper);
    scene.registerComponent('HDRLoader', HDRLoader);

    // 加载 HDR 环境贴图
    await scene.add('HDRLoader', {
        name: 'environment',
        url: '/textures/blouberg_sunrise_2_1k.hdr',
        asEnvironment: true,
        asBackground: true
    });
    // 添加网格
    scene.add('GridHelper', {
        name: 'grid',
        size: 10,
        divisions: 10,
        color: '#888888'
    });

    // 加载模型
    await loadModel();
});

// 加载模型
const loadModel = async () => {
    try {
        loadingText.value = '加载骨骼动画模型...';
        loadingProgress.value = 0;

        // 加载模型（等待加载完成）
        modelComponent = await scene.add('ModelLoader', {
            name: 'character',
            url: '/models/Xbot.glb',
            scale: 1,
            position: [0, 0, 0],
            castShadow: true,
            receiveShadow: true,
            animations: true,
            autoPlayAnimation: false
        });

        console.log('Model loaded:', modelComponent);
        console.log('Animations:', modelComponent.animations);

        // 绑定动画事件监听器
        modelComponent.on('animationStarted', (data) => {
            isPlaying.value = true;
            isPaused.value = false;
            addLog(`开始播放: ${data.name} (时长: ${data.duration.toFixed(2)}s)`);
        });

        modelComponent.on('animationPaused', (data) => {
            isPlaying.value = false;
            isPaused.value = true;
            addLog(`暂停动画: ${data.name}`);
        });

        modelComponent.on('animationResumed', (data) => {
            isPlaying.value = true;
            isPaused.value = false;
            addLog(`恢复播放: ${data.name}`);
        });

        modelComponent.on('animationStopped', (data) => {
            isPlaying.value = false;
            isPaused.value = false;
            addLog(`停止动画: ${data.name}`);
        });

        modelComponent.on('animationFinished', (data) => {
            if (!loopAnimation.value) {
                isPlaying.value = false;
                addLog(`动画播放完成: ${data.name}`);
            }
        });

        // 获取动画列表
        const animations = modelComponent.getAnimationNames();
        console.log('Available animations:', animations);

        if (animations && animations.length > 0) {
            animationList.value = animations;
            animationOptions.value = animations.map((name, index) => ({
                value: name,
                label: name || `Animation ${index + 1}`
            }));
            currentAnimation.value = animations[0];
            addLog(`加载了 ${animations.length} 个动画`);
        } else {
            addLog('模型中没有找到动画数据');
        }

        // 获取模型信息
        updateModelInfo();

        loadingProgress.value = 100;
        isLoading.value = false;
        addLog('模型加载完成');
    } catch (error) {
        console.error('Model loading failed:', error);
        loadingText.value = '模型加载失败';
        addLog(`加载失败: ${error.message}`);
        isLoading.value = false;
    }
};

// 更新模型信息
const updateModelInfo = () => {
    if (!modelComponent || !modelComponent.model) return;

    let meshCount = 0;
    const materials = new Set();
    let boneCount = 0;

    modelComponent.model.traverse((child) => {
        if (child.isMesh) {
            meshCount++;
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => materials.add(mat.uuid));
                } else {
                    materials.add(child.material.uuid);
                }
            }
        }
        if (child.isSkinnedMesh && child.skeleton) {
            boneCount = Math.max(boneCount, child.skeleton.bones.length);
        }
    });

    modelInfo.meshCount = meshCount;
    modelInfo.materialCount = materials.size;
    skeletonInfo.boneCount = boneCount;
};

// 切换动画
const switchAnimation = (animationName) => {
    if (!modelComponent) return;
    modelComponent.playAnimation(animationName, {
        loop: loopAnimation.value,
        fadeIn: 0.5,
        fadeOut: 0.5
    });
};

// 播放/暂停切换
const togglePlayPause = () => {
    if (!modelComponent) return;

    if (isPlaying.value) {
        modelComponent.pauseAnimation();
    } else if (isPaused.value) {
        modelComponent.resumeAnimation();
    } else {
        // 从停止状态开始播放
        switchAnimation(currentAnimation.value);
    }
};

// 停止动画
const stopAnimation = () => {
    if (!modelComponent) return;
    modelComponent.stopAnimation();
};

// 更新速度
const updateSpeed = (speed) => {
    if (!modelComponent) return;
    modelComponent.setAnimationSpeed(speed);
    addLog(`播放速度: ${speed.toFixed(1)}x`);
};

// 更新循环模式
const updateLoopMode = (loop) => {
    addLog(`循环模式: ${loop ? '开启' : '关闭'}`);
    // 如果正在播放，重新播放以应用新的循环设置
    if (isPlaying.value && currentAnimation.value) {
        switchAnimation(currentAnimation.value);
    }
};

// 清理
onUnmounted(() => {
    if (scene) {
        scene.dispose();
    }
});

// 源代码
const sourceCode = `import { Scene } from '@w3d/core';
import { ModelLoader, GridHelper } from '@w3d/components';

// 创建场景
const scene = new Scene(container, {
  renderer: { antialias: true, outputColorSpace: 'srgb' },
  camera: { fov: 45, position: [3, 1.5, 3], lookAt: [0, 1, 0] }
});

scene.init();
scene.renderer.enableShadow(true);
scene.renderer.enableResize();

// 注册组件
scene.registerComponent('ModelLoader', ModelLoader);
scene.registerComponent('GridHelper', GridHelper);

// 添加网格
scene.add('GridHelper', {
  name: 'grid',
  size: 10,
  divisions: 10,
  color: '#888888'
});

// 加载带骨骼动画的模型
const model = await scene.add('ModelLoader', {
  name: 'character',
  url: '/models/readyplayer.me.glb',
  scale: 1,
  position: [0, 0, 0],
  castShadow: true,
  receiveShadow: true,
  animations: true,
  autoPlayAnimation: false  // 不自动播放
});

// 监听动画加载完成
model.on('animationLoaded', (data) => {
  console.log('可用动画:', data.animations);
  console.log('动画数量:', data.count);
});

// 监听动画播放事件
model.on('animationStarted', (data) => {
  console.log('开始播放:', data.name);
  console.log('动画时长:', data.duration);
});

model.on('animationFinished', (data) => {
  console.log('播放完成:', data.name);
});

// 播放指定动画
model.playAnimation('Walk', {
  loop: true,      // 循环播放
  fadeIn: 0.5,     // 淡入时间
  fadeOut: 0.5     // 淡出时间
});

// 控制动画播放
model.pauseAnimation();      // 暂停
model.resumeAnimation();     // 恢复
model.stopAnimation();       // 停止

// 设置播放速度
model.setAnimationSpeed(1.5);  // 1.5倍速

// 获取动画信息
const animations = model.getAnimationNames();
const current = model.getCurrentAnimationName();
const playing = model.isPlaying();
`;
</script>

<style scoped lang="less">
@import '@/styles/gui.less';

.scene-container {
    width: 100%;
    height: 100%;
}

/* 按钮组 */
.button-group {
    display: flex;
    gap: 10px;
}

/* 事件日志 */
.event-log {
    max-height: 200px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    padding: 10px;
    .scrollbar-style();
}

.log-item {
    display: flex;
    gap: 10px;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 12px;
}

.log-item:last-child {
    border-bottom: none;
}

.log-time {
    color: #00ff88;
    font-weight: 600;
    min-width: 80px;
}

.log-message {
    color: #ccc;
    flex: 1;
}
</style>
