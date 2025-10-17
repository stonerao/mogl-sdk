<template>
    <SplitLayout :code="sourceCode" language="javascript" title="ImageMarker - 图片点位组件">
        <!-- 3D 场景容器 -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- 控制面板 -->
        <GuiPanel title="图片点位控制" width="wide">
            <!-- 点位配置 -->
            <GuiSection title="点位配置">
                <GuiSelect
                    label="渲染类型"
                    v-model="markerConfig.type"
                    :options="[
                        { value: 'sprite', label: 'Sprite' },
                        { value: 'plane', label: 'Plane' }
                    ]"
                />

                <GuiSlider
                    label="图片大小"
                    v-model="markerConfig.size"
                    :min="1"
                    :max="20"
                    :step="0.5"
                />

                <GuiColorPicker label="颜色叠加" v-model="markerConfig.color" />

                <GuiSlider
                    label="透明度"
                    v-model="markerConfig.opacity"
                    :min="0.1"
                    :max="1"
                    :step="0.05"
                    :precision="2"
                />

                <GuiSlider
                    label="位置偏移 Y"
                    v-model="markerConfig.offset.y"
                    :min="-10"
                    :max="10"
                    :step="0.5"
                />

                <GuiCheckbox
                    label="大小随距离衰减 (Sprite)"
                    v-model="markerConfig.sizeAttenuation"
                />

                <GuiCheckbox label="显示文字标签" v-model="markerConfig.showLabel" />

                <template v-if="markerConfig.showLabel">
                    <GuiTextInput
                        label="标签文字"
                        v-model="markerConfig.labelText"
                        placeholder="输入标签文字"
                    />

                    <GuiSlider
                        label="标签偏移 Y"
                        v-model="markerConfig.labelOffset.y"
                        :min="0"
                        :max="5"
                        :step="0.5"
                    />
                </template>

                <div class="button-group">
                    <GuiButton label="添加点位" @click="addRandomMarker" />
                    <GuiButton label="清除所有点位" variant="secondary" @click="clearAllMarkers" />
                </div>
            </GuiSection>

            <!-- 点位列表 -->
            <template v-if="markerList.length > 0">
                <GuiSection title="点位列表">
                    <div class="marker-list">
                        <div v-for="marker in markerList" :key="marker.id" class="marker-item">
                            <div class="marker-info">
                                <span class="marker-name">{{
                                    marker.userData?.name || marker.id
                                }}</span>
                                <span class="marker-state">{{ marker.state }}</span>
                            </div>
                            <div class="marker-actions">
                                <GuiButton
                                    label="切换"
                                    size="small"
                                    @click="toggleMarkerState(marker.id)"
                                />
                                <GuiButton
                                    v-if="marker.label"
                                    label="标签"
                                    size="small"
                                    @click="toggleLabel(marker.id)"
                                />
                                <GuiButton
                                    label="移动"
                                    size="small"
                                    @click="moveMarker(marker.id)"
                                />
                                <GuiButton
                                    label="删除"
                                    size="small"
                                    variant="secondary"
                                    @click="removeMarker(marker.id)"
                                />
                            </div>
                        </div>
                    </div>
                </GuiSection>
            </template>

            <!-- 性能统计 -->
            <GuiSection title="性能统计">
                <GuiInfoItem label="FPS" :value="fps" />
                <GuiInfoItem label="点位数量" :value="markerCount" />
            </GuiSection>

            <!-- 事件日志 -->
            <GuiSection title="事件日志">
                <div class="event-log">
                    <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
                        {{ log }}
                    </div>
                </div>
            </GuiSection>
        </GuiPanel>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { ImageMarker, GridHelper } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiSelect,
    GuiSlider,
    GuiColorPicker,
    GuiCheckbox,
    GuiTextInput,
    GuiButton,
    GuiInfoItem
} from '@/components/Gui';
import SplitLayout from '../../components/SplitLayout.vue';

const sceneContainer = ref(null);
const fps = ref(60);
const markerCount = ref(0);
const eventLogs = ref([]);
const markerList = ref([]);

let scene = null;
let imageMarkerComponent = null;
let markerCounter = 0;
let fpsUpdateInterval = null;

// 点位配置
const markerConfig = reactive({
    type: 'sprite',
    size: 5,
    color: '#ffffff',
    opacity: 1.0,
    offset: { x: 0, y: 0, z: 0 },
    sizeAttenuation: true,
    showLabel: true,
    labelText: '点位',
    labelOffset: { x: 0, y: 2, z: 0 }
});

// 可用的图片状态
const availableImages = {
    state1: '/images/ic_place_name.png',
    state2: '/images/camera.png',
    state3: '/images/icon-jj.png'
};

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { ImageMarker, GridHelper } from '@w3d/components';

// 创建场景
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    outputColorSpace: 'srgb'
  },
  camera: {
    fov: 45,
    position: [30, 20, 30],
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
  position: [10, 10, 5]
});

// 注册组件
scene.registerComponent('ImageMarker', ImageMarker);
scene.registerComponent('GridHelper', GridHelper);

// 添加网格
await scene.add('GridHelper', {
  name: 'grid',
  size: 40,
  divisions: 40
});

// 添加图片点位组件（带标签）
const imageMarker = await scene.add('ImageMarker', {
  name: 'image-markers',
  markers: [
    {
      id: 'marker1',
      position: { x: 0, y: 5, z: 0 },
      type: 'sprite',
      state: 'state1',
      images: {
        state1: '/images/icon1.png',
        state2: '/images/camera.png',
        state3: '/images/particle.png'
      },
      size: 5,
      sizeAttenuation: true,
      opacity: 1.0,
      // 添加文字标签
      label: {
        text: '重要地点',
        offset: { x: 0, y: 2, z: 0 },
        fontSize: 16,
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderColor: '#00ff00',
        visible: true
      }
    }
  ]
});

// 监听事件
imageMarker.on('markerClick', (data) => {
  console.log('点位被点击:', data.markerId);
});

imageMarker.on('markerStateChanged', (data) => {
  console.log('状态切换:', data.oldState, '->', data.newState);
});

imageMarker.on('positionUpdated', (data) => {
  console.log('位置已更新:', data.markerId, data.newPosition);
});

// 添加新点位（带标签）
await imageMarker.addMarker({
  id: 'marker2',
  position: { x: 10, y: 5, z: 0 },
  type: 'plane',
  images: {
    state1: '/images/camera.png'
  },
  label: {
    text: '监控点',
    offset: { x: 0, y: 2, z: 0 }
  }
});

// 切换点位状态
await imageMarker.updateState('marker1', 'state2');

// 更新点位配置
imageMarker.updateMarker('marker1', {
  size: 8,
  color: '#ff0000'
});

// 更新点位位置（带动画）
imageMarker.updatePosition('marker1', { x: 5, y: 8, z: 5 }, {
  duration: 1000,  // 1秒动画
  easing: 'easeInOut'
});

// 更新标签文字
await imageMarker.updateLabel('marker1', {
  text: '新的文字'
});

// 显示/隐藏标签
imageMarker.showLabel('marker1');
imageMarker.hideLabel('marker1');`;

// 添加日志
const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    eventLogs.value.unshift(`[${timestamp}] ${message}`);
    if (eventLogs.value.length > 10) {
        eventLogs.value.pop();
    }
};

// 初始化场景
const initScene = async () => {
    try {
        // 创建场景
        scene = new Scene(sceneContainer.value, {
            renderer: {
                antialias: true,
                outputColorSpace: 'srgb'
            },
            camera: {
                fov: 45,
                position: [30, 20, 30],
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
            position: [10, 10, 5]
        });

        // 启用自动调整大小
        scene.renderer.enableResize();

        // 注册组件
        scene.registerComponent('GridHelper', GridHelper);
        scene.registerComponent('ImageMarker', ImageMarker);

        // 添加网格辅助
        await scene.add('GridHelper', {
            name: 'grid',
            size: 40,
            divisions: 40,
            color: '#888888'
        });

        // 注册 ImageMarker 组件

        // 创建图片点位组件
        imageMarkerComponent = await scene.add('ImageMarker', {
            name: 'image-markers',
            markers: [
                // 示例 1: Sprite 类型
                {
                    id: 'demo-marker-1',
                    position: { x: -10, y: 5, z: 0 },
                    type: 'sprite',
                    state: 'state1',
                    images: availableImages,
                    size: 2,
                    opacity: 1.0,
                    userData: { name: 'Sprite 点位' }
                },
                // 示例 2: Plane 类型
                {
                    id: 'demo-marker-2',
                    position: { x: 0, y: 5, z: 0 },
                    type: 'plane',
                    state: 'state2',
                    images: availableImages,
                    size: 2,
                    color: '#ff0000',
                    opacity: 1.0,
                    userData: { name: 'Plane 点位' }
                },
                // 示例 3: 不同颜色叠加
                {
                    id: 'demo-marker-3',
                    position: { x: 10, y: 5, z: 0 },
                    type: 'sprite',
                    state: 'state3',
                    images: availableImages,
                    size: 2,
                    color: '#ff0000',
                    opacity: 0.8,
                    // sizeAttenuation: false,
                    userData: { name: '红色点位' }
                }
            ]
        });

        // 暴露到 window 对象以便调试
        window.__w3d_imageMarker__ = imageMarkerComponent;

        // 监听事件
        imageMarkerComponent.on('markerAdded', (data) => {
            // console.log()
            addLog(`点位已添加: ${data.markerId}`);
            updateMarkerList();
        });

        imageMarkerComponent.on('markerRemoved', (data) => {
            addLog(`点位已移除: ${data.markerId}`);
            updateMarkerList();
        });

        imageMarkerComponent.on('markerStateChanged', (data) => {
            addLog(`状态切换: ${data.markerId} (${data.oldState} -> ${data.newState})`);
            updateMarkerList();
        });

        // 监听鼠标交互事件
        imageMarkerComponent.on('markerClick', (data) => {
            addLog(`点击点位: ${data.markerId}`);
        });

        imageMarkerComponent.on('markerMouseEnter', (data) => {
            addLog(`鼠标移入: ${data.markerId}`);
        });

        imageMarkerComponent.on('markerMouseLeave', (data) => {
            addLog(`鼠标移出: ${data.markerId}`);
        });

        // 监听位置更新事件
        imageMarkerComponent.on('positionUpdated', (data) => {
            addLog(
                `位置已更新: ${data.markerId} -> (${data.newPosition.x.toFixed(
                    1
                )}, ${data.newPosition.y.toFixed(1)}, ${data.newPosition.z.toFixed(1)})`
            );
        });

        // 更新统计
        updateStats();

        // 启动 FPS 监控
        startFPSMonitor();

        addLog('场景初始化完成');
    } catch (error) {
        console.error('初始化场景失败:', error);
        addLog(`错误: ${error.message}`);
    }
};

// FPS 监控
const updateFPS = () => {
    if (scene && scene.renderer && scene.renderer.renderer) {
        const info = scene.renderer.renderer.info;
        fps.value = Math.round(1000 / (info.render.frame || 16));
    }
};

const startFPSMonitor = () => {
    fpsUpdateInterval = setInterval(updateFPS, 100);
};

// 更新统计
const updateStats = () => {
    if (!imageMarkerComponent) return;
    markerCount.value = imageMarkerComponent.getAllMarkers().length;
    updateMarkerList();
};

// 更新点位列表
const updateMarkerList = () => {
    if (!imageMarkerComponent) return;
    const markers = imageMarkerComponent.getAllMarkers();
    markerList.value = markers;
    markerCount.value = markers.length;
};

// 添加随机点位
const addRandomMarker = async () => {
    if (!imageMarkerComponent) return;

    markerCounter++;
    const newId = `marker-${Date.now()}-${markerCounter}`;

    // 随机位置
    const range = 15;
    const x = (Math.random() - 0.5) * range * 2;
    const z = (Math.random() - 0.5) * range * 2;
    const y = 3 + Math.random() * 5;

    const markerData = {
        id: newId,
        position: { x, y, z },
        type: markerConfig.type,
        state: 'state1',
        images: availableImages,
        size: markerConfig.size,
        color: markerConfig.color,
        opacity: markerConfig.opacity,
        sizeAttenuation: markerConfig.sizeAttenuation,
        offset: markerConfig.offset,
        userData: { name: `点位 ${markerCounter}` }
    };

    // 添加标签配置（如果启用）
    if (markerConfig.showLabel) {
        markerData.label = {
            text: markerConfig.labelText || `点位 ${markerCounter}`,
            offset: markerConfig.labelOffset,
            fontSize: 16,
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderColor: '#00ff00',
            borderWidth: 1,
            visible: true
        };
    }

    await imageMarkerComponent.addMarker(markerData);

    addLog(`添加点位: ${newId}`);
    updateStats();
};

// 切换点位状态
const toggleMarkerState = async (markerId) => {
    if (!imageMarkerComponent) return;

    const marker = imageMarkerComponent.getMarker(markerId);
    if (!marker) return;

    // 获取所有状态
    const states = Object.keys(marker.images);
    const currentIndex = states.indexOf(marker.state);
    const nextIndex = (currentIndex + 1) % states.length;
    const nextState = states[nextIndex];

    await imageMarkerComponent.updateState(markerId, nextState);
};

// 移除点位
const removeMarker = (markerId) => {
    if (!imageMarkerComponent) return;
    imageMarkerComponent.removeMarker(markerId);
    addLog(`移除点位: ${markerId}`);
    updateStats();
};

// 清除所有点位
const clearAllMarkers = () => {
    if (!imageMarkerComponent) return;
    imageMarkerComponent.clearMarkers();
    addLog('清除所有点位');
    updateStats();
};

// 切换标签显示/隐藏
const toggleLabel = (markerId) => {
    if (!imageMarkerComponent) return;

    const marker = imageMarkerComponent.getMarker(markerId);
    if (!marker || !marker.label) return;

    // 检查标签是否可见（通过内部状态）
    const labelInfo = imageMarkerComponent.markerLabels.get(markerId);
    if (!labelInfo) return;

    if (labelInfo.visible) {
        imageMarkerComponent.hideLabel(markerId);
        addLog(`隐藏标签: ${markerId}`);
    } else {
        imageMarkerComponent.showLabel(markerId);
        addLog(`显示标签: ${markerId}`);
    }
};

// 移动点位（带动画）
const moveMarker = (markerId) => {
    if (!imageMarkerComponent) return;

    const marker = imageMarkerComponent.getMarker(markerId);
    if (!marker) return;

    // 生成随机新位置
    const range = 15;
    const newPosition = {
        x: (Math.random() - 0.5) * range * 2,
        y: 3 + Math.random() * 5,
        z: (Math.random() - 0.5) * range * 2
    };

    // 使用动画更新位置
    imageMarkerComponent.updatePosition(markerId, newPosition, {
        duration: 1000, // 1秒动画
        easing: 'easeInOut'
    });

    addLog(`移动点位: ${markerId}`);
};

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

.button-group {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.marker-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.marker-item {
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}

.marker-info {
    display: flex;
    flex-direction: column;
    margin-bottom: 6px;
}

.marker-name {
    color: #00ff00;
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 2px;
}

.marker-state {
    color: #888;
    font-size: 10px;
}

.marker-actions {
    display: flex;
    gap: 4px;
}

.event-log {
    max-height: 150px;
    overflow-y: auto;
    font-size: 11px;
    font-family: monospace;
    .scrollbar-style();
}

.log-item {
    padding: 4px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: #aaa;
}

.log-item:last-child {
    border-bottom: none;
}
</style>

