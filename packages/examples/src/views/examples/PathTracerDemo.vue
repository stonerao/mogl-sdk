<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="18 - Path Tracer"
        :sceneOnly="isSceneOnly"
    >
        <div class="scene-container" ref="sceneContainer">
            <!-- 加载状态 -->
            <template v-if="isLoading">
                <GuiLoading :progress="loadingProgress" :text="loadingText" />
            </template>

            <!-- 渲染进度 -->
            <template v-if="isRendering">
                <GuiLoading :progress="renderProgress" text="GPU 路径追踪渲染中..." />
            </template>

            <!-- 控制面板 -->
            <template v-if="!isLoading">
                <GuiPanel title="路径追踪控制" width="wide">
                    <!-- 渲染控制 -->
                    <GuiSection title="渲染控制">
                        <div class="button-group">
                            <GuiButton
                                label="开始渲染"
                                :disabled="!pathTracer || isRendering"
                                @click="startRender"
                            />
                            <GuiButton
                                label="暂停"
                                variant="secondary"
                                :disabled="!pathTracer || !isRendering"
                                @click="pauseRender"
                            />
                            <GuiButton
                                label="继续"
                                variant="secondary"
                                :disabled="!pathTracer || isRendering"
                                @click="resumeRender"
                            />
                            <GuiButton
                                label="重置"
                                variant="secondary"
                                :disabled="!pathTracer"
                                @click="resetRender"
                            />
                            <GuiButton
                                label="下载图片"
                                variant="secondary"
                                :disabled="!pathTracer"
                                @click="downloadRender"
                            />
                        </div>
                    </GuiSection>

                    <!-- 渲染设置 -->
                    <GuiSection title="渲染设置">
                        <GuiSlider
                            label="目标采样数"
                            v-model="renderSettings.samples"
                            :min="10"
                            :max="500"
                            :step="10"
                            @update:modelValue="updateRenderSettings"
                        />
                        <GuiSlider
                            label="分辨率缩放"
                            v-model="renderSettings.resolutionScale"
                            :min="0.1"
                            :max="1.0"
                            :step="0.1"
                            :precision="1"
                            @update:modelValue="updateRenderSettings"
                        />
                        <GuiSlider
                            label="分块数 (Tiles)"
                            v-model="renderSettings.tiles"
                            :min="1"
                            :max="6"
                            :step="1"
                            @update:modelValue="updateRenderSettings"
                        />
                        <GuiCheckbox
                            label="启用色调映射"
                            v-model="renderSettings.toneMapping"
                            @update:modelValue="updateRenderSettings"
                        />
                        <GuiCheckbox
                            label="透明背景"
                            v-model="renderSettings.transparentBackground"
                            @update:modelValue="updateRenderSettings"
                        />
                    </GuiSection>

                    <!-- 地板设置 -->
                    <GuiSection title="地板设置">
                        <GuiCheckbox
                            label="启用地板"
                            v-model="floorSettings.enabled"
                            @update:modelValue="recreatePathTracer"
                        />
                        <template v-if="floorSettings.enabled">
                            <GuiSlider
                                label="粗糙度"
                                v-model="floorSettings.roughness"
                                :min="0"
                                :max="1"
                                :step="0.01"
                                :precision="2"
                                @update:modelValue="updateFloorMaterial"
                            />
                            <GuiSlider
                                label="金属度"
                                v-model="floorSettings.metalness"
                                :min="0"
                                :max="1"
                                :step="0.01"
                                :precision="2"
                                @update:modelValue="updateFloorMaterial"
                            />
                        </template>
                    </GuiSection>

                    <!-- 材质调整 -->
                    <GuiSection title="材质调整">
                        <GuiCheckbox
                            label="自动调整材质"
                            v-model="materialSettings.adjustMaterials"
                            @update:modelValue="recreatePathTracer"
                        />
                        <template v-if="materialSettings.adjustMaterials">
                            <GuiSlider
                                label="粗糙度缩放"
                                v-model="materialSettings.roughnessScale"
                                :min="0.1"
                                :max="1.0"
                                :step="0.05"
                                :precision="2"
                                @update:modelValue="recreatePathTracer"
                            />
                            <GuiCheckbox
                                label="启用透射效果"
                                v-model="materialSettings.enableTransmission"
                                @update:modelValue="recreatePathTracer"
                            />
                        </template>
                    </GuiSection>

                    <!-- 渲染信息 -->
                    <GuiSection title="渲染信息">
                        <GuiInfoItem label="状态" :value="renderStatus" />
                        <GuiInfoItem label="当前采样" :value="currentSamples" />
                        <GuiInfoItem label="进度" :value="`${renderProgress}%`" />
                    </GuiSection>
                </GuiPanel>
            </template>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { PathTracer, ModelLoader, GridHelper, HDRLoader } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiCheckbox,
    GuiButton,
    GuiInfoItem,
    GuiLoading
} from '@/components/Gui';
import SplitLayout from '../../components/SplitLayout.vue';
import { useSceneOnly } from '../../composables/useSceneOnly';

// 检测是否为 sceneOnly 模式
const isSceneOnly = useSceneOnly();

const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('加载中...');
const loadingProgress = ref(0);
const isRendering = ref(false);
const renderProgress = ref(0);
const currentSamples = ref(0);
const targetSamples = ref(100);
const renderStatus = ref('未开始');

let scene = null;
let pathTracer = null;
let model = null;

// 渲染设置
const renderSettings = reactive({
    samples: 100,
    resolutionScale: 1.0,
    tiles: 3,
    toneMapping: true,
    transparentBackground: false
});

// 地板设置
const floorSettings = reactive({
    enabled: true,
    roughness: 0.15,
    metalness: 0.9
});

// 材质设置
const materialSettings = reactive({
    adjustMaterials: true,
    roughnessScale: 0.25,
    enableTransmission: true
});

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { PathTracer, ModelLoader } from '@w3d/components';

// 创建场景 (启用相机控制器)
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true
  },
  camera: {
    fov: 45,
    position: [5, 5, 10],
    lookAt: [0, 0, 0]
  },
  controls: {
    enabled: true,        // 启用相机控制
    enableDamping: true   // 启用阻尼效果
  }
});

scene.init();

// 注册组件
scene.registerComponent('PathTracer', PathTracer);
scene.registerComponent('ModelLoader', ModelLoader);

// 加载模型
const model = await scene.add('ModelLoader', {
  name: 'christmas',
  url: '/models/christmas.glb',
  scale: 1.0,
  position: [0, 0, 0]
});

// 等待模型加载完成
model.on('loadComplete', async () => {
  // 从场景中移除模型 (PathTracer 会重新添加)
  scene.scene.remove(model.model);

  // 创建路径追踪器 (使用 model.model 获取实际的 THREE.Group)
  const pathTracer = await scene.add('PathTracer', {
    name: 'pathtracer',
    model: model.model,  // ⚠️ 重要: 使用 model.model 而不是 model
    samples: 100,
    tiles: 3,
    resolutionScale: 1.0,
    adjustMaterials: true,
    materialConfig: {
      roughnessScale: 0.25,
      enableTransmission: true,
      transmissionIOR: 1.4
    },
    floor: {
      enabled: true,
      roughness: 0.15,
      metalness: 0.9
    },
    toneMapping: true,
    autoStart: true
  });

  // 监听相机变化 (自动支持)
  pathTracer.on('cameraChanged', () => {
    console.log('相机位置改变,重新渲染中...');
  });

  // 监听渲染进度
  pathTracer.on('progress', (data) => {
    const percent = (data.progress * 100).toFixed(1);
    console.log(\`渲染进度: \${percent}%\`);
    console.log(\`采样数: \${data.samples}/\${data.targetSamples}\`);
  });

  // 监听渲染完成
  pathTracer.on('complete', (data) => {
    console.log('渲染完成!', data.samples);
    // 可以下载渲染结果
    pathTracer.download('pathtraced-render.png');
  });

  // 控制方法
  // pathTracer.start();   // 开始渲染
  // pathTracer.pause();   // 暂停渲染
  // pathTracer.resume();  // 恢复渲染
  // pathTracer.reset();   // 重置渲染
});

// 用户可以自由旋转、缩放、平移相机
// PathTracer 会自动更新并重新渲染

`;

// 初始化场景
onMounted(async () => {
    if (!sceneContainer.value) return;

    try {
        // 创建场景
        scene = new Scene(sceneContainer.value, {
            isRendering: false,
            renderer: {
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: true
            },
            camera: {
                fov: 45,
                position: [445, 445, 440],
                lookAt: [0, 0, 0]
            }
        });

        scene.init();

        // 添加灯光
        scene.light.addAmbient({
            color: '#ffffff',
            intensity: 0.6
        });

        scene.light.addDirectional({
            color: '#ffffff',
            intensity: 0.8,
            position: [5, 5, 5]
        });

        // 注册组件
        scene.registerComponent('PathTracer', PathTracer);
        scene.registerComponent('ModelLoader', ModelLoader);
        scene.registerComponent('GridHelper', GridHelper);
        scene.registerComponent('HDRLoader', HDRLoader);
        // 加载 HDR 环境贴图
        await scene.add('HDRLoader', {
            name: 'environment',
            url: '/textures/blouberg_sunrise_2_1k.hdr',
            intensity: 1.0,
            asEnvironment: true,
            asBackground: true
        });
        // 添加网格
        await scene.add('GridHelper', {
            name: 'grid',
            size: 20,
            divisions: 20
        });
        // 加载模型
        isLoading.value = true;
        loadingText.value = '加载模型中...';

        model = await scene.add('ModelLoader', {
            name: 'christmas',
            url: '/models/christmas.glb',
            scale: 1.0,
            position: [0, 0, 0]
        });
        console.log(model);
        // 监听加载进度
        /* model.on('loadProgress', (data) => {
            loadingProgress.value = Math.round(data.progress * 100);
        });

        model.on('loadComplete', async () => {

            isLoading.value = false;
            loadingText.value = '初始化路径追踪器...';

            // 从场景中移除模型 (PathTracer 会重新添加)
            scene.scene.remove(model.model);

            // 创建路径追踪器
        }); */
        await createPathTracer();
    } catch (error) {
        console.error('初始化失败:', error);
        isLoading.value = false;
    }
});

// 创建路径追踪器
const createPathTracer = async () => {
    try {
        // 移除旧的路径追踪器
        if (pathTracer) {
            scene.remove('pathtracer');
            pathTracer = null;
        }

        isLoading.value = true;
        loadingText.value = '初始化路径追踪器...';

        pathTracer = await scene.add('PathTracer', {
            name: 'pathtracer',
            model: model.componentScene, // 使用 model.model 获取实际的 THREE.Group
            samples: renderSettings.samples,
            tiles: renderSettings.tiles,
            resolutionScale: renderSettings.resolutionScale,
            adjustMaterials: materialSettings.adjustMaterials,
            materialConfig: {
                roughnessScale: materialSettings.roughnessScale,
                enableTransmission: materialSettings.enableTransmission,
                transmissionIOR: 1.4
            },
            floor: {
                enabled: floorSettings.enabled,
                roughness: floorSettings.roughness,
                metalness: floorSettings.metalness
            },
            toneMapping: renderSettings.toneMapping,
            transparentBackground: renderSettings.transparentBackground,
            autoStart: true
        });

        // 监听渲染事件
        pathTracer.on('start', () => {
            isRendering.value = true;
            renderStatus.value = '渲染中';
        });

        pathTracer.on('pause', () => {
            isRendering.value = false;
            renderStatus.value = '已暂停';
        });

        pathTracer.on('resume', () => {
            isRendering.value = true;
            renderStatus.value = '渲染中';
        });

        pathTracer.on('stop', () => {
            isRendering.value = false;
            renderStatus.value = '已停止';
        });

        pathTracer.on('progress', (data) => {
            currentSamples.value = data.samples;
            targetSamples.value = data.targetSamples;
            renderProgress.value = Math.round(data.progress * 100);
        });

        pathTracer.on('complete', () => {
            isRendering.value = false;
            renderStatus.value = '渲染完成';
        });

        isLoading.value = false;
        isRendering.value = true;
        renderStatus.value = '渲染中';
    } catch (error) {
        console.error('创建路径追踪器失败:', error);
        isLoading.value = false;
    }
};

// 渲染控制方法
const startRender = () => {
    if (pathTracer) {
        pathTracer.start();
    }
};

const pauseRender = () => {
    if (pathTracer) {
        pathTracer.pause();
    }
};

const resumeRender = () => {
    if (pathTracer) {
        pathTracer.resume();
    }
};

const resetRender = () => {
    if (pathTracer) {
        pathTracer.reset();
        currentSamples.value = 0;
        renderProgress.value = 0;
    }
};

const downloadRender = () => {
    if (pathTracer) {
        pathTracer.download('pathtraced-christmas.png');
    }
};

// 更新渲染设置
const updateRenderSettings = () => {
    if (!pathTracer) return;

    targetSamples.value = renderSettings.samples;
    pathTracer.setResolutionScale(renderSettings.resolutionScale);
    pathTracer.setTiles(renderSettings.tiles);

    // 更新色调映射和背景需要重新创建
    if (
        pathTracer.config.toneMapping !== renderSettings.toneMapping ||
        pathTracer.config.transparentBackground !== renderSettings.transparentBackground
    ) {
        recreatePathTracer();
    }
};

// 更新地板材质
const updateFloorMaterial = () => {
    if (!pathTracer || !pathTracer.floor) return;

    pathTracer.floor.material.roughness = floorSettings.roughness;
    pathTracer.floor.material.metalness = floorSettings.metalness;
    pathTracer.updateMaterials();
};

// 重新创建路径追踪器
const recreatePathTracer = async () => {
    await createPathTracer();
};

// 清理资源
onUnmounted(() => {
    if (scene) {
        scene.dispose();
        scene = null;
    }
});
</script>

<style scoped lang="less">
@import '@/styles/gui.less';

.scene-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

/* 按钮组 */
.button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>
