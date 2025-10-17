<template>
    <SplitLayout :code="sourceCode" language="javascript" title="AreaBlock - 区域块组件">
        <div ref="sceneContainer" class="scene-container"></div>

        <GuiPanel title="区域块控制">
            <GuiSection title="区域块配置">
                <GuiColorPicker label="区域颜色" v-model="areaConfig.color" />
                <GuiSlider
                    label="墙壁高度"
                    v-model="areaConfig.wallHeight"
                    :min="1"
                    :max="20"
                    :step="1"
                />
                <GuiSlider
                    label="墙壁透明度"
                    v-model="areaConfig.wallOpacity"
                    :min="0.1"
                    :max="1"
                    :step="0.05"
                    :precision="2"
                />
                <GuiSlider
                    label="底部透明度"
                    v-model="areaConfig.bottomOpacity"
                    :min="0.1"
                    :max="1"
                    :step="0.05"
                    :precision="2"
                />
                <GuiSlider
                    label="边框宽度"
                    v-model="areaConfig.borderWidth"
                    :min="1"
                    :max="10"
                    :step="1"
                />
                <GuiSlider
                    label="动画速度"
                    v-model="areaConfig.animationSpeed"
                    :min="0.1"
                    :max="3"
                    :step="0.1"
                    :precision="1"
                />
                <GuiSelect
                    label="显示模式"
                    v-model="displayMode"
                    :options="[
                        { value: 'all', label: '墙壁+底部' },
                        { value: 'wall', label: '只显示墙壁' },
                        { value: 'bottom', label: '只显示底部' },
                        { value: 'border', label: '只显示边框' }
                    ]"
                />
                <GuiSelect
                    label="形状类型"
                    v-model="areaShapeType"
                    :options="[
                        { value: 'square', label: '正方形' },
                        { value: 'triangle', label: '三角形' },
                        { value: 'hexagon', label: '六边形' },
                        { value: 'random', label: '随机多边形' }
                    ]"
                />
                <GuiButton label="添加区域块" block @click="addRandomArea" />
                <GuiButton label="清除所有区域块" variant="danger" block @click="clearAllAreas" />

                <div v-if="areaList.length > 0" class="area-list">
                    <h5 class="list-title">区域块列表 ({{ areaList.length }})</h5>
                    <div v-for="area in areaList" :key="area.id" class="area-item">
                        <span class="area-name">{{ area.userData?.name || area.id }}</span>
                        <GuiButton
                            label="删除"
                            variant="danger"
                            size="small"
                            @click="removeArea(area.id)"
                        />
                    </div>
                </div>
            </GuiSection>

            <GuiSection title="性能统计">
                <GuiInfoItem label="FPS:" :value="fps" />
                <GuiInfoItem label="区域块数量:" :value="areaCount" />
            </GuiSection>

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
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { Scene } from '@w3d/core';
import { AreaBlock, GridHelper } from '@w3d/components';
import * as THREE from 'three';
import SplitLayout from '../../components/SplitLayout.vue';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiColorPicker,
    GuiSelect,
    GuiButton,
    GuiInfoItem
} from '@/components/Gui';

const sceneContainer = ref(null);
const fps = ref(60);
const areaCount = ref(0);
const eventLogs = ref([]);
const areaList = ref([]);
const areaShapeType = ref('square');
const displayMode = ref('all');

let scene = null;
let areaBlockComponent = null;
let areaCounter = 0;
let fpsUpdateInterval = null;

// 区域块配置
const areaConfig = reactive({
    color: '#00ff00',
    wallHeight: 5,
    wallOpacity: 0.5,
    bottomOpacity: 0.5,
    borderWidth: 2,
    animationSpeed: 1.0
});

// 根据显示模式计算显示参数
const displayConfig = computed(() => {
    switch (displayMode.value) {
        case 'wall':
            return { showWall: true, showBottom: false, showBorder: true };
        case 'bottom':
            return { showWall: false, showBottom: true, showBorder: true };
        case 'border':
            return { showWall: false, showBottom: false, showBorder: true };
        case 'all':
        default:
            return { showWall: true, showBottom: true, showBorder: true };
    }
});

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { AreaBlock, GridHelper } from '@w3d/components';

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
scene.registerComponent('AreaBlock', AreaBlock);
scene.registerComponent('GridHelper', GridHelper);

// 添加网格
await scene.add('GridHelper', {
  name: 'grid',
  size: 40,
  divisions: 40
});

// 添加区域块组件
const areaBlock = await scene.add('AreaBlock', {
  name: 'area-blocks',
  areas: [
    {
      id: 'area1',
      points: [
        { x: -8, y: 0, z: -8 },
        { x: 8, y: 0, z: -8 },
        { x: 8, y: 0, z: 8 },
        { x: -8, y: 0, z: 8 }
      ],
      color: '#00ff00',
      wallHeight: 6,
      wallOpacity: 0.5,
      bottomOpacity: 0.5,
      showWall: true,
      showBottom: true,
      showBorder: true
    }
  ]
});

// 监听事件
areaBlock.on('areaAdded', (data) => {
  console.log('区域块已添加:', data.areaId);
});

areaBlock.on('areaRemoved', (data) => {
  console.log('区域块已移除:', data.areaId);
});

// 添加新区域块
await areaBlock.addArea({
  id: 'area2',
  points: [
    { x: 10, y: 0, z: 10 },
    { x: 20, y: 0, z: 10 },
    { x: 20, y: 0, z: 20 },
    { x: 10, y: 0, z: 20 }
  ],
  color: '#ff0000',
  wallHeight: 8,
  showWall: true,
  showBottom: false
});

// 移除区域块
areaBlock.removeArea('area1');`;

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
        scene.registerComponent('AreaBlock', AreaBlock);

        // 添加网格辅助
        await scene.add('GridHelper', {
            name: 'grid',
            size: 40,
            divisions: 40,
            color: '#888888'
        });

        // 注册 AreaBlock 组件

        // 创建区域块组件
        areaBlockComponent = await scene.add('AreaBlock', {
            name: 'area-blocks',
            areas: [
                // 示例 1：墙壁+底部
                {
                    id: 'demo-area-1',
                    points: [
                        { x: -10, y: 0, z: -10 },
                        { x: -2, y: 0, z: -10 },
                        { x: -2, y: 0, z: -2 },
                        { x: -10, y: 0, z: -2 }
                    ],
                    color: '#00ff00',
                    wallHeight: 6,
                    wallOpacity: 0.5,
                    bottomOpacity: 0.5,
                    showWall: true,
                    showBottom: true,
                    showBorder: true,
                    userData: { name: '墙壁+底部' }
                },
                // 示例 2：只显示墙壁
                {
                    id: 'demo-area-2',
                    points: [
                        { x: 2, y: 0, z: -10 },
                        { x: 10, y: 0, z: -10 },
                        { x: 10, y: 0, z: -2 },
                        { x: 2, y: 0, z: -2 }
                    ],
                    color: '#ff0000',
                    wallHeight: 8,
                    wallOpacity: 0.6,
                    showWall: true,
                    showBottom: false,
                    showBorder: true,
                    userData: { name: '只显示墙壁' }
                },
                // 示例 3：只显示底部
                {
                    id: 'demo-area-3',
                    points: [
                        { x: -10, y: 0, z: 2 },
                        { x: -2, y: 0, z: 2 },
                        { x: -2, y: 0, z: 10 },
                        { x: -10, y: 0, z: 10 }
                    ],
                    color: '#0000ff',
                    bottomOpacity: 0.7,
                    showWall: false,
                    showBottom: true,
                    showBorder: true,
                    userData: { name: '只显示底部' }
                },
                // 示例 4：只显示边框
                {
                    id: 'demo-area-4',
                    points: [
                        { x: 2, y: 0, z: 2 },
                        { x: 10, y: 0, z: 2 },
                        { x: 10, y: 0, z: 10 },
                        { x: 2, y: 0, z: 10 }
                    ],
                    color: '#ffff00',
                    showWall: false,
                    showBottom: false,
                    showBorder: true,
                    userData: { name: '只显示边框' }
                }
            ]
        });

        // 暴露到 window 对象以便调试
        window.__w3d_areaBlock__ = areaBlockComponent;

        // 监听事件
        areaBlockComponent.on('areaAdded', (data) => {
            addLog(`区域块已添加: ${data.areaId}`);
            updateAreaList();
        });

        areaBlockComponent.on('areaRemoved', (data) => {
            addLog(`区域块已移除: ${data.areaId}`);
            updateAreaList();
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
    if (!areaBlockComponent) return;

    areaCount.value = areaBlockComponent.getAllAreas().length;

    // 更新区域块列表
    updateAreaList();
};

// 更新区域块列表
const updateAreaList = () => {
    if (!areaBlockComponent) return;

    const areas = areaBlockComponent.getAllAreas();
    areaList.value = areas;
    areaCount.value = areas.length;
};

// 生成区域块点位
const generateAreaPoints = (shapeType, centerX, centerZ, size) => {
    const points = [];

    switch (shapeType) {
        case 'square':
            // 正方形
            points.push(
                { x: centerX - size / 2, y: 0, z: centerZ - size / 2 },
                { x: centerX + size / 2, y: 0, z: centerZ - size / 2 },
                { x: centerX + size / 2, y: 0, z: centerZ + size / 2 },
                { x: centerX - size / 2, y: 0, z: centerZ + size / 2 }
            );
            break;

        case 'triangle':
            // 等边三角形
            const height = (size * Math.sqrt(3)) / 2;
            points.push(
                { x: centerX, y: 0, z: centerZ - height / 2 },
                { x: centerX + size / 2, y: 0, z: centerZ + height / 2 },
                { x: centerX - size / 2, y: 0, z: centerZ + height / 2 }
            );
            break;

        case 'hexagon':
            // 六边形
            const radius = size / 2;
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                points.push({
                    x: centerX + Math.cos(angle) * radius,
                    y: 0,
                    z: centerZ + Math.sin(angle) * radius
                });
            }
            break;

        case 'random':
            // 随机多边形（5-8个点）
            const pointCount = 5 + Math.floor(Math.random() * 4);
            const angleStep = (Math.PI * 2) / pointCount;
            for (let i = 0; i < pointCount; i++) {
                const angle = angleStep * i;
                const r = (size / 2) * (0.7 + Math.random() * 0.3);
                points.push({
                    x: centerX + Math.cos(angle) * r,
                    y: 0,
                    z: centerZ + Math.sin(angle) * r
                });
            }
            break;
    }

    return points;
};

// 添加随机区域块
const addRandomArea = async () => {
    if (!areaBlockComponent) return;

    areaCounter++;
    const newId = `area-${Date.now()}-${areaCounter}`;

    // 随机位置和大小
    const range = 12;
    const centerX = (Math.random() - 0.5) * range * 2;
    const centerZ = (Math.random() - 0.5) * range * 2;
    const size = 5 + Math.random() * 10;

    // 生成点位
    const points = generateAreaPoints(areaShapeType.value, centerX, centerZ, size);

    // 随机颜色
    const colors = ['#00ff00', '#ff0000', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    await areaBlockComponent.addArea({
        id: newId,
        points: points,
        color: areaConfig.color || randomColor,
        wallHeight: areaConfig.wallHeight,
        wallOpacity: areaConfig.wallOpacity,
        bottomOpacity: areaConfig.bottomOpacity,
        borderWidth: areaConfig.borderWidth,
        animationSpeed: areaConfig.animationSpeed,
        ...displayConfig.value,
        userData: { name: `区域块 ${areaCounter}` }
    });

    addLog(`添加区域块: ${newId}`);
    updateStats();
};

// 移除区域块
const removeArea = async (areaId) => {
    if (!areaBlockComponent) return;

    areaBlockComponent.removeArea(areaId);
    addLog(`移除区域块: ${areaId}`);
    updateStats();
};

// 清除所有区域块
const clearAllAreas = () => {
    if (!areaBlockComponent) return;

    areaBlockComponent.clearAreas();
    addLog('清除所有区域块');
    updateStats();
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

.area-list {
    margin-top: 15px;
}

.list-title {
    font-size: 12px;
    color: #00ff00;
    margin-bottom: 8px;
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

    &:last-child {
        border-bottom: none;
    }
}

.area-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    font-size: 12px;
    margin-bottom: 6px;
}

.area-name {
    color: #00ff00;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
