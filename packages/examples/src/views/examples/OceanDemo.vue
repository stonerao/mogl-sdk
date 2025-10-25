<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        :title="t('home.examples.ocean.title')"
        :sceneOnly="isSceneOnly"
    >
        <!-- 3D Scene Container -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- Control Panel -->
        <template v-if="isLoading">
            <GuiLoading :progress="loadProgress" :text="t('ocean.loading')" />
        </template>

        <template v-if="!isLoading">
            <GuiPanel :title="t('ocean.title')" width="wide">
                <!-- Transform 属性 -->
                <GuiSection :title="t('ocean.transform')">
                    <GuiSlider
                        :label="t('params.positionY')"
                        v-model="transform.positionY"
                        :min="-50"
                        :max="50"
                        :step="0.1"
                        :precision="1"
                        @update:modelValue="updatePosition"
                    />
                    <GuiSlider
                        :label="t('params.scaleX')"
                        v-model="transform.scale"
                        :min="0.1"
                        :max="3.0"
                        :step="0.1"
                        :precision="1"
                        @update:modelValue="updateScale"
                    />
                </GuiSection>

                <!-- 海洋参数 -->
                <GuiSection :title="t('ocean.waterParams')">
                    <GuiColorPicker
                        :label="t('ocean.waterColor')"
                        v-model="waterParams.waterColor"
                        @update:modelValue="updateWaterColor"
                    />
                    <GuiColorPicker
                        :label="t('ocean.sunColor')"
                        v-model="waterParams.sunColor"
                        @update:modelValue="updateSunColor"
                    />
                    <GuiSlider
                        :label="t('ocean.distortionScale')"
                        v-model="waterParams.distortionScale"
                        :min="0"
                        :max="10"
                        :step="0.1"
                        :precision="1"
                        @update:modelValue="updateDistortionScale"
                    />
                    <GuiSlider
                        :label="t('ocean.size')"
                        v-model="waterParams.size"
                        :min="0.1"
                        :max="10"
                        :step="0.1"
                        :precision="1"
                        @update:modelValue="updateSize"
                    />
                    <GuiSlider
                        :label="t('ocean.waterSpeed')"
                        v-model="waterParams.waterSpeed"
                        :min="0.1"
                        :max="5.0"
                        :step="0.1"
                        :precision="1"
                        @update:modelValue="updateWaterSpeed"
                    />
                </GuiSection>

                <!-- 性能统计 -->
                <GuiSection :title="t('stats.title')">
                    <GuiInfoItem :label="t('stats.fps')" :value="fps" />
                    <GuiInfoItem :label="t('ocean.status')" :value="oceanStatus" />
                </GuiSection>

                <!-- 事件日志 -->
                <GuiSection :title="t('controls.eventLog')">
                    <div class="event-log">
                        <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
                            <span class="log-time">{{ log.time }}</span>
                            <span class="log-message">{{ log.message }}</span>
                        </div>
                    </div>
                </GuiSection>
            </GuiPanel>
        </template>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Scene } from '@w3d/core';
import { Ocean, HDRLoader } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiColorPicker,
    GuiInfoItem,
    GuiLoading
} from '@/components/Gui';
import SplitLayout from '../../components/SplitLayout.vue';
import { useSceneOnly } from '../../composables/useSceneOnly';

const { t } = useI18n();

// 检测是否为 sceneOnly 模式
const isSceneOnly = useSceneOnly();

// 场景容器引用
const sceneContainer = ref(null);

// 场景实例
let scene = null;

// Ocean 组件实例
let oceanComponent = null;

// 加载状态
const isLoading = ref(true);
const loadProgress = ref(0);

// Transform 属性
const transform = reactive({
    positionY: 0,
    scale: 1.0
});

// 海洋参数
const waterParams = reactive({
    waterColor: '#001e0f',
    sunColor: '#ffffff',
    distortionScale: 3.7,
    size: 1.0,
    waterSpeed: 1.0
});

// 性能统计
const fps = ref(60);
const oceanStatus = ref('初始化中...');

// 事件日志
const eventLogs = ref([]);

// 添加日志
const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    eventLogs.value.unshift({ time, message });
    if (eventLogs.value.length > 10) {
        eventLogs.value.pop();
    }
};

// 初始化场景
const initScene = async () => {
    try {
        console.log('开始初始化场景');

        scene = new Scene(sceneContainer.value, {
            renderer: {
                antialias: true,
                outputColorSpace: 'srgb'
            },
            camera: {
                fov: 55,
                position: [150, 110, 100],
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
            position: [5, 5, 5],
            castShadow: true
        });

        // 启用阴影
        scene.renderer.enableShadow(true);

        // 启用自动调整大小
        scene.renderer.enableResize();

        // 注册组件
        scene.registerComponent('Ocean', Ocean);
        scene.registerComponent('HDRLoader', HDRLoader);

        console.log('开始加载 HDR 环境');

        await scene.add('HDRLoader', {
            name: 'environment',
            url: '/textures/blouberg_sunrise_2_1k.hdr',
            intensity: 1.0,
            asEnvironment: true,
            asBackground: true
        });
        console.log('开始创建海洋组件');
        // 创建海洋组件
        await createOcean();

        // 启动渲染循环
        scene.start();
        console.log('场景初始化完成');
    } catch (error) {
        console.error('场景初始化失败:', error);
        addLog(`场景初始化失败: ${error.message}`);
        isLoading.value = false;
    }
};

// 创建海洋组件
const createOcean = async () => {
    try {
        oceanComponent = await scene.add('Ocean', {
            name: 'ocean',
            position: [0, transform.positionY, 0],
            rotation: [-Math.PI / 2, 0, 0],
            scale: [transform.scale, transform.scale, transform.scale],
            geometryWidth: 10000,
            geometryHeight: 10000,
            waterColor: waterParams.waterColor,
            sunColor: waterParams.sunColor,
            distortionScale: waterParams.distortionScale,
            size: waterParams.size,
            waterSpeed: waterParams.waterSpeed
        });

        // 监听事件
        oceanComponent.on('loaded', () => {
            oceanStatus.value = '已加载';
            isLoading.value = false;
            addLog('海洋组件加载完成');
        });

        oceanComponent.on('waterCreated', () => {
            addLog('Water 对象创建完成');
        });

        oceanComponent.on('positionUpdated', ({ position }) => {
            addLog(`位置已更新: [${position.join(', ')}]`);
        });

        oceanComponent.on('scaleUpdated', ({ scale }) => {
            addLog(`缩放已更新: [${scale.join(', ')}]`);
        });

        oceanComponent.on('waterParamsUpdated', ({ params }) => {
            addLog(`海洋参数已更新`);
        });

        oceanComponent.on('error', ({ error }) => {
            console.error('海洋组件错误:', error);
            addLog(`错误: ${error.message}`);
            oceanStatus.value = '错误';
        });
    } catch (error) {
        console.error('创建海洋组件失败:', error);
        addLog(`创建海洋组件失败: ${error.message}`);
        isLoading.value = false;
    }
};

// 更新位置
const updatePosition = () => {
    if (!oceanComponent) return;
    oceanComponent.updatePosition(0, transform.positionY, 0);
};

// 更新缩放
const updateScale = () => {
    if (!oceanComponent) return;
    oceanComponent.updateScale(transform.scale, transform.scale, transform.scale);
};

// 更新水面颜色
const updateWaterColor = () => {
    if (!oceanComponent) return;
    oceanComponent.updateWaterParams({
        waterColor: waterParams.waterColor
    });
};

// 更新太阳光颜色
const updateSunColor = () => {
    if (!oceanComponent) return;
    oceanComponent.updateWaterParams({
        sunColor: waterParams.sunColor
    });
};

// 更新扭曲强度
const updateDistortionScale = () => {
    if (!oceanComponent) return;
    oceanComponent.updateWaterParams({
        distortionScale: waterParams.distortionScale
    });
};

// 更新波浪大小
const updateSize = () => {
    if (!oceanComponent) return;
    oceanComponent.updateWaterParams({
        size: waterParams.size
    });
};

// 更新水面动画速度
const updateWaterSpeed = () => {
    if (!oceanComponent) return;
    oceanComponent.updateWaterParams({
        waterSpeed: waterParams.waterSpeed
    });
};

// 组件挂载
onMounted(() => {
    initScene();
});

// 组件卸载
onUnmounted(() => {
    if (scene) {
        scene.dispose();
    }
});

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { Ocean } from '@w3d/components';

// 创建场景
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    outputColorSpace: 'srgb'
  },
  camera: {
    fov: 55,
    position: [30, 30, 100],
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
  position: [5, 5, 5],
  castShadow: true
});

// 注册组件
scene.registerComponent('Ocean', Ocean);

// 创建海洋组件
const ocean = await scene.add('Ocean', {
  name: 'ocean',
  position: [0, 0, 0],
  rotation: [-Math.PI / 2, 0, 0],
  scale: [1, 1, 1],
  geometryWidth: 10000,
  geometryHeight: 10000,
  waterColor: '#001e0f',
  sunColor: '#ffffff',
  distortionScale: 3.7,
  size: 1.0,
  waterSpeed: 1.0
});

// 监听事件
ocean.on('loaded', () => {
  console.log('海洋组件加载完成');
});

// 更新位置
ocean.updatePosition(0, 5, 0);

// 更新海洋参数
ocean.updateWaterParams({
  waterColor: '#006994',
  distortionScale: 5.0,
  waterSpeed: 1.5
});

// 从模型加载几何体（可选）
// ocean.loadGeometryFromModel('/models/water.glb', 'waterGeometry');

// 启动渲染
scene.start();

/**
 * 技术要点：
 *
 * 1. Ocean 组件特性
 *    - 基于 Three.js Water 的真实海洋效果
 *    - 支持从模型加载几何体
 *    - 完整的 Transform 属性控制
 *    - 丰富的海洋参数配置
 *
 * 2. 公共方法接口
 *    - updatePosition(x, y, z) - 更新位置
 *    - updateRotation(x, y, z) - 更新旋转
 *    - updateScale(x, y, z) - 更新缩放
 *    - updateWaterParams(params) - 更新海洋参数
 *    - updateConfig(config) - 批量更新配置
 *
 * 3. 海洋参数
 *    - waterColor - 水面颜色
 *    - sunColor - 太阳光颜色
 *    - distortionScale - 扭曲强度（波浪幅度）
 *    - size - 波浪大小
 *    - waterSpeed - 水面动画速度
 *
 * 4. 从模型加载几何体
 *    - 支持 GLTF/GLB 模型
 *    - 自动提取几何体和 Transform 属性
 *    - 可指定几何体名称
 */`;
</script>

<style scoped lang="less">
@import '@/styles/gui.less';

.scene-container {
    width: 100%;
    height: 100%;
}

/* Event log */
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

