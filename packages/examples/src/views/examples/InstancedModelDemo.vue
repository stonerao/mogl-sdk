<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="InstancedModel - Instanced Model Component"
        :sceneOnly="isSceneOnly"
    >
        <!-- 3D Scene Container -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- Control Panel -->
        <GuiPanel title="Instanced Model Controls" width="wide">
            <!-- Loading State -->
            <template v-if="isLoading">
                <GuiLoading :progress="loadProgress" text="Loading model..." />
            </template>

            <!-- Instance Configuration -->
            <template v-if="!isLoading">
                <GuiSection title="Instance Configuration">
                    <GuiSlider
                        label="Instance Count"
                        v-model="instanceConfig.instanceCount"
                        :min="100"
                        :max="5000"
                        :step="100"
                        @update:modelValue="recreateInstances"
                    />

                    <GuiSelect
                        label="Layout Method"
                        v-model="instanceConfig.layout"
                        :options="[
                            { value: 'grid', label: 'Grid Layout' },
                            { value: 'random', label: 'Random Layout' },
                            { value: 'custom', label: 'Custom Data' }
                        ]"
                        @update:modelValue="recreateInstances"
                    />

                    <template v-if="instanceConfig.layout === 'grid'">
                        <GuiSlider
                            label="Grid Spacing X"
                            v-model="instanceConfig.spacing.x"
                            :min="5"
                            :max="20"
                            :step="1"
                            @update:modelValue="recreateInstances"
                        />

                        <GuiSlider
                            label="Grid Spacing Z"
                            v-model="instanceConfig.spacing.z"
                            :min="5"
                            :max="20"
                            :step="1"
                            @update:modelValue="recreateInstances"
                        />
                    </template>
                </GuiSection>

                <!-- Color Configuration -->
                <GuiSection title="Color Configuration">
                    <GuiColorPicker
                        label="Default Color"
                        v-model="instanceConfig.normalColor"
                        @update:modelValue="updateColors"
                    />

                    <GuiColorPicker label="Hover Color" v-model="instanceConfig.hoverColor" />

                    <GuiColorPicker label="Click Color" v-model="instanceConfig.clickedColor" />

                    <GuiButton label="Reset All Colors" @click="resetAllColors" />
                </GuiSection>

                <!-- Performance Statistics -->
                <GuiSection title="Performance Statistics">
                    <GuiInfoItem label="FPS" :value="fps" />
                    <GuiInfoItem label="Instance Count" :value="instanceConfig.instanceCount" />
                    <GuiInfoItem label="Clicked" :value="clickedCount" />
                </GuiSection>

                <!-- Event Log -->
                <GuiSection title="Event Log">
                    <div class="event-log">
                        <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
                            <span class="log-time">{{ log.time }}</span>
                            <span class="log-message">{{ log.message }}</span>
                        </div>
                    </div>
                </GuiSection>
            </template>
        </GuiPanel>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Scene } from '@w3d/core';
import { InstancedModel, GridHelper, HDRLoader } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiLoading,
    GuiSlider,
    GuiSelect,
    GuiColorPicker,
    GuiButton,
    GuiInfoItem
} from '@/components/Gui';
import SplitLayout from '../../components/SplitLayout.vue';
import { useSceneOnly } from '../../composables/useSceneOnly';

const { t } = useI18n();

// Detect if in sceneOnly mode
const isSceneOnly = useSceneOnly();

// Scene container reference
const sceneContainer = ref(null);

// Scene instance
let scene = null;

// InstancedModel component instance
let instancedModel = null;

// Loading state
const isLoading = ref(true);
const loadProgress = ref(0);

// Instance configuration
const instanceConfig = reactive({
    instanceCount: 1000,
    layout: 'grid',
    gridSize: { x: 100, z: 100 },
    spacing: { x: 10, z: 10 },
    normalColor: '#00ff00',
    hoverColor: '#ffff00',
    clickedColor: '#ff0000'
});

// Performance statistics
const fps = ref(60);
const clickedCount = ref(0);

// Event logs
const eventLogs = ref([]);
const maxLogs = 10;

// 加载 HDR 环境贴图
const loadHDREnvironment = async () => {
    try {
        await scene.add('HDRLoader', {
            name: 'environment',
            url: '/textures/blouberg_sunrise_2_1k.hdr',
            asEnvironment: true,
            asBackground: true
        });
    } catch (error) {
        console.error('HDR loading failed:', error);
        addLog(`HDR 加载失败: ${error.message}`, 'error');
    }
};

// 初始化场景
const initScene = async () => {
    // 创建场景
    scene = new Scene(sceneContainer.value);
    scene.init();

    // 注册组件
    scene.registerComponent('InstancedModel', InstancedModel);
    scene.registerComponent('GridHelper', GridHelper);
    scene.registerComponent('HDRLoader', HDRLoader);
    // 设置相机位置
    scene.camera.setPosition(0, 50, 100);
    scene.camera.lookAt(0, 0, 0);

    // 添加网格辅助
    await scene.add('GridHelper', {
        size: 200,
        divisions: 20,
        colorCenterLine: 0x444444,
        colorGrid: 0x222222
    });

    // 创建实例化模型
    await createInstancedModel();
    await loadHDREnvironment();

    // 启动 FPS 监控
    startFPSMonitor();
};

// 生成自定义实例数据
const generateCustomInstancesData = () => {
    const data = [];
    const count = 50; // 自定义模式下使用较少的实例数量以便观察

    // 创建一个圆形排列的实例，每个实例有不同的旋转和缩放
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = 30;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // 高度随角度变化
        const y = Math.sin(angle * 3) * 5;

        // 旋转朝向圆心
        const rotationY = angle + Math.PI;

        // 缩放随位置变化
        const scale = 0.5 + Math.abs(Math.sin(angle * 2)) * 1.5;

        data.push({
            position: { x, y, z },
            rotation: { x: 0, y: rotationY, z: 0 },
            scale: scale // 统一缩放
        });
    }

    return data;
};

// 创建实例化模型
const createInstancedModel = async () => {
    isLoading.value = true;
    loadProgress.value = 0;

    const config = {
        modelUrl: '/models/ShaderBall.glb',
        instanceCount: instanceConfig.instanceCount,
        layout: instanceConfig.layout,
        gridSize: instanceConfig.gridSize,
        spacing: instanceConfig.spacing,
        normalColor: parseInt(instanceConfig.normalColor.replace('#', '0x')),
        hoverColor: parseInt(instanceConfig.hoverColor.replace('#', '0x')),
        clickedColor: parseInt(instanceConfig.clickedColor.replace('#', '0x')),
        enableInteraction: true
    };

    // 如果是自定义布局，添加实例数据
    if (instanceConfig.layout === 'custom') {
        config.instancesData = generateCustomInstancesData();
    }

    instancedModel = await scene.add('InstancedModel', config);

    // 监听加载进度
    instancedModel.on('loadProgress', (data) => {
        loadProgress.value = data.percent;
    });

    // 监听加载完成
    instancedModel.on('loadComplete', (data) => {
        isLoading.value = false;
        addLog(`模型加载完成，实例数量: ${data.instanceCount}`);
    });

    // 监听加载错误
    instancedModel.on('loadError', (data) => {
        isLoading.value = false;
        addLog(`模型加载失败: ${data.error.message}`, 'error');
    });

    // 监听实例点击事件
    instancedModel.on('instanceClick', (data) => {
        clickedCount.value = data.clickedCount;
        addLog(
            `点击实例 #${data.index}, 位置: (${data.position.x.toFixed(
                1
            )}, ${data.position.y.toFixed(1)}, ${data.position.z.toFixed(1)})`
        );
    });

    // 监听鼠标进入事件
    instancedModel.on('instanceMouseEnter', (data) => {
        // addLog(`悬停实例 #${data.index}`);
    });

    // 监听鼠标离开事件
    instancedModel.on('instanceMouseLeave', (data) => {
        // addLog(`离开实例 #${data.index}`);
    });
};

// 重新创建实例
const recreateInstances = async () => {
    if (!instancedModel) return;

    await instancedModel.updateConfig({
        instanceCount: instanceConfig.instanceCount,
        layout: instanceConfig.layout,
        gridSize: instanceConfig.gridSize,
        spacing: instanceConfig.spacing
    });

    clickedCount.value = 0;
    addLog(`重新创建实例，数量: ${instanceConfig.instanceCount}, 布局: ${instanceConfig.layout}`);
};

// 更新颜色
const updateColors = async () => {
    if (!instancedModel) return;

    await instancedModel.updateConfig({
        normalColor: parseInt(instanceConfig.normalColor.replace('#', '0x'))
    });

    addLog('更新默认颜色');
};

// 重置所有颜色
const resetAllColors = () => {
    if (!instancedModel) return;

    instancedModel.resetAllColors();
    clickedCount.value = 0;
    addLog('重置所有颜色');
};

// 添加日志
const addLog = (message, type = 'info') => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    eventLogs.value.unshift({
        time,
        message,
        type
    });

    // 限制日志数量
    if (eventLogs.value.length > maxLogs) {
        eventLogs.value.pop();
    }
};

// FPS 监控
let fpsUpdateInterval = null;
const startFPSMonitor = () => {
    let lastTime = performance.now();
    let frames = 0;

    const updateFPS = () => {
        frames++;
        const currentTime = performance.now();
        const delta = currentTime - lastTime;

        if (delta >= 1000) {
            fps.value = Math.round((frames * 1000) / delta);
            frames = 0;
            lastTime = currentTime;
        }

        requestAnimationFrame(updateFPS);
    };

    updateFPS();
};

// 源代码示例
const sourceCode = `// ========== InstancedModel 实例化模型组件示例 ==========

import { Scene } from '@w3d/core';
import { InstancedModel, GridHelper } from '@w3d/components';

// 创建场景
const scene = new Scene('#app');
scene.init();

// 注册组件
scene.registerComponent('InstancedModel', InstancedModel);
scene.registerComponent('GridHelper', GridHelper);

// 设置相机位置
scene.camera.setPosition(0, 50, 100);
scene.camera.lookAt(0, 0, 0);

// 添加网格辅助
await scene.add('GridHelper', {
  size: 200,
  divisions: 20,
  colorCenterLine: 0x444444,
  colorGrid: 0x222222
});

// ========== 创建实例化模型 ==========

const instancedModel = await scene.add('InstancedModel', {
  // 模型文件路径
  modelUrl: 'models/ShaderBall.glb',

  // 实例数量
  instanceCount: 1000,

  // 布局方式：'grid'（网格）、'random'（随机）、'custom'（自定义）
  layout: 'grid',

  // 网格布局的范围
  gridSize: { x: 100, z: 100 },

  // 网格布局的间距
  spacing: { x: 10, z: 10 },

  // 颜色配置
  normalColor: 0x00ff00,    // 默认颜色（绿色）
  hoverColor: 0xffff00,     // 鼠标悬停颜色（黄色）
  clickedColor: 0xff0000,   // 点击后颜色（红色）

  // 是否启用鼠标交互
  enableInteraction: true
});

// ========== 使用自定义实例数据 ==========

// 创建自定义实例数据数组
const customInstancesData = [];
for (let i = 0; i < 50; i++) {
  const angle = (i / 50) * Math.PI * 2;
  const radius = 30;

  customInstancesData.push({
    position: {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle * 3) * 5,
      z: Math.sin(angle) * radius
    },
    rotation: {
      x: 0,
      y: angle + Math.PI,  // 朝向圆心
      z: 0
    },
    scale: 0.5 + Math.abs(Math.sin(angle * 2)) * 1.5  // 统一缩放
    // 或者使用分量缩放：
    // scale: { x: 1.5, y: 1.0, z: 1.5 }
  });
}

// 使用自定义数据创建实例
const customInstancedModel = await scene.add('InstancedModel', {
  modelUrl: 'models/ShaderBall.glb',
  instancesData: customInstancesData,  // 传入自定义实例数据
  normalColor: 0x00ff00,
  hoverColor: 0xffff00,
  clickedColor: 0xff0000,
  enableInteraction: true
});

// ========== 监听事件 ==========

// 监听加载进度
instancedModel.on('loadProgress', (data) => {
  console.log('加载进度:', data.percent + '%');
});

// 监听加载完成
instancedModel.on('loadComplete', (data) => {
  console.log('模型加载完成，实例数量:', data.instanceCount);
});

// 监听加载错误
instancedModel.on('loadError', (data) => {
  console.error('模型加载失败:', data.error);
});

// 监听实例点击事件
instancedModel.on('instanceClick', (data) => {
  console.log('点击实例:', {
    index: data.index,
    position: data.position,
    clickedCount: data.clickedCount
  });
});

// 监听鼠标进入事件
instancedModel.on('instanceMouseEnter', (data) => {
  console.log('鼠标进入实例:', data.index);
});

// 监听鼠标离开事件
instancedModel.on('instanceMouseLeave', (data) => {
  console.log('鼠标离开实例:', data.index);
});

// ========== 动态更新配置 ==========

// 更新实例数量和布局
await instancedModel.updateConfig({
  instanceCount: 2000,
  layout: 'random'
});

// 更新颜色
await instancedModel.updateConfig({
  normalColor: 0x0000ff
});

// 重置所有颜色
instancedModel.resetAllColors();

// ========== 手动更新单个实例 ==========

// 更新指定实例的变换
instancedModel.updateInstanceTransform(
  0,  // 实例索引
  { x: 10, y: 0, z: 10 },  // 位置
  { x: 0, y: Math.PI / 4, z: 0 },  // 旋转
  { x: 1.5, y: 1.5, z: 1.5 }  // 缩放
);

// 更新指定实例的颜色
instancedModel.updateInstanceColor(0, 0xff00ff);

// 重置指定实例的颜色
instancedModel.resetInstanceColor(0);

// ========== 技术要点 ==========
// 1. 使用 THREE.InstancedMesh 渲染大量相同模型，性能优异
// 2. 支持网格布局、随机布局和自定义数据布局
// 3. 支持通过 instancesData 参数传入自定义的位置、旋转、缩放数据
// 4. 每个实例可以有独立的变换矩阵（位置、旋转、缩放）
// 5. 支持鼠标交互（悬停、点击），实时颜色反馈
// 6. 使用 Raycaster 进行高效的射线检测
// 7. 支持动态更新实例数量、布局和颜色
// 8. 完善的事件系统，方便监听各种交互事件
// 9. 自动资源管理，组件销毁时自动清理资源`;

// 组件挂载
onMounted(() => {
    initScene();
});

// 组件卸载
onUnmounted(() => {
    if (fpsUpdateInterval) {
        clearInterval(fpsUpdateInterval);
    }
    if (scene) {
        scene.dispose();
    }
});
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
.scene-container {
    width: 100%;
    height: 100%;
    position: relative;
}

/* 事件日志 */
.event-log {
    max-height: 200px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    padding: 8px;
    .scrollbar-style();
}

.log-item {
    display: flex;
    gap: 8px;
    padding: 4px 0;
    font-size: 11px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.log-item:last-child {
    border-bottom: none;
}

.log-time {
    color: #666;
    flex-shrink: 0;
}

.log-message {
    color: #ccc;
    flex: 1;
}
</style>
