<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="MigrationLine - 迁移线动画组件"
        :sceneOnly="isSceneOnly"
    >
        <!-- 3D 场景容器 -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- 控制面板 -->
        <GuiPanel title="迁移线控制" width="wide">
            <!-- 全局配置 -->
            <GuiSection title="全局配置">
                <GuiColorPicker
                    label="颜色"
                    v-model="globalConfig.color"
                    @update:modelValue="updateGlobalConfig"
                />

                <GuiSlider
                    label="持续时间"
                    v-model="globalConfig.duration"
                    :min="1000"
                    :max="10000"
                    :step="100"
                    suffix="ms"
                    @update:modelValue="updateGlobalConfig"
                />

                <GuiSlider
                    label="速度"
                    v-model="globalConfig.speed"
                    :min="0.1"
                    :max="3"
                    :step="0.1"
                    :precision="1"
                    @update:modelValue="updateGlobalConfig"
                />

                <GuiCheckbox
                    label="循环播放"
                    v-model="globalConfig.loop"
                    @update:modelValue="updateGlobalConfig"
                />

                <GuiSlider
                    label="发光强度"
                    v-model="globalConfig.glowIntensity"
                    :min="0"
                    :max="3"
                    :step="0.1"
                    :precision="1"
                    @update:modelValue="updateGlobalConfig"
                />

                <GuiSlider
                    label="流动速度"
                    v-model="globalConfig.flowSpeed"
                    :min="0.1"
                    :max="3"
                    :step="0.1"
                    :precision="1"
                    @update:modelValue="updateGlobalConfig"
                />
            </GuiSection>

            <!-- 区域块配置 -->
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

                <GuiCheckbox label="显示墙壁" v-model="areaConfig.showWall" />

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

                <div class="button-group">
                    <GuiButton label="添加区域块" @click="addRandomArea" />
                    <GuiButton label="清除所有区域块" variant="secondary" @click="clearAllAreas" />
                </div>

                <!-- 区域块列表 -->
                <template v-if="areaList.length > 0">
                    <div class="area-list">
                        <div v-for="area in areaList" :key="area.id" class="area-item">
                            <span class="area-name">{{ area.userData?.name || area.id }}</span>
                            <GuiButton label="删除" size="small" @click="removeArea(area.id)" />
                        </div>
                    </div>
                </template>
            </GuiSection>

            <!-- 动画控制 -->
            <GuiSection title="动画控制">
                <div class="button-group">
                    <GuiButton label="全部播放" @click="startAll" />
                    <GuiButton label="全部暂停" variant="secondary" @click="pauseAll" />
                    <GuiButton label="全部停止" variant="secondary" @click="stopAll" />
                    <GuiButton label="清除全部" variant="secondary" @click="clearAll" />
                </div>
            </GuiSection>

            <!-- 添加迁移线 -->
            <GuiSection title="添加迁移线">
                <GuiSelect
                    label="路径类型"
                    v-model="newLinePathType"
                    :options="[
                        { value: 'simple', label: '简单路径 (A→B)' },
                        { value: 'multi', label: '多段路径 (A→B→C)' },
                        { value: 'curve', label: '曲线路径' }
                    ]"
                />
                <GuiButton label="添加随机迁移线" @click="addRandomLine" />
            </GuiSection>

            <!-- 性能统计 -->
            <GuiSection title="性能统计">
                <GuiInfoItem label="FPS" :value="fps" />
                <GuiInfoItem label="迁移线数量" :value="lineCount" />
                <GuiInfoItem label="区域块数量" :value="areaCount" />
                <GuiInfoItem label="播放中" :value="playingCount" />
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
import { MigrationLine, GridHelper } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiColorPicker,
    GuiSlider,
    GuiCheckbox,
    GuiSelect,
    GuiButton,
    GuiInfoItem
} from '@/components/Gui';
import * as THREE from 'three';
import SplitLayout from '../../components/SplitLayout.vue';
import { useSceneOnly } from '../../composables/useSceneOnly';

// 检测是否为 sceneOnly 模式
const isSceneOnly = useSceneOnly();

const sceneContainer = ref(null);
const fps = ref(60);
const lineCount = ref(0);
const areaCount = ref(0);
const playingCount = ref(0);
const eventLogs = ref([]);
const newLinePathType = ref('simple');
const areaList = ref([]);
const areaShapeType = ref('square');

let scene = null;
let migrationLineComponent = null;
let lineCounter = 0;
let areaCounter = 0;
let fpsUpdateInterval = null;

// 全局配置（只保留 Shader 类型）
const globalConfig = reactive({
    color: '#00ff00',
    duration: 3000,
    speed: 1,
    loop: true,
    // Shader 特定配置
    glowIntensity: 1.5,
    flowSpeed: 1.0
});

// 区域块配置
const areaConfig = reactive({
    color: '#00ff00',
    wallHeight: 5,
    wallOpacity: 0.5,
    borderWidth: 2,
    animationSpeed: 1.0,
    showWall: true
});

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { MigrationLine, GridHelper } from '@w3d/components';

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
scene.registerComponent('MigrationLine', MigrationLine);
scene.registerComponent('GridHelper', GridHelper);

// 添加网格
await scene.add('GridHelper', {
  name: 'grid',
  size: 40,
  divisions: 40
});

// 添加迁移线
const migrationLines = await scene.add('MigrationLine', {
  name: 'migration-lines',
  globalConfig: {
    type: 'shader',
    color: '#00ff00',
    duration: 3000,
    loop: true,
    glowIntensity: 1.5,
    flowSpeed: 1.0
  },
  lines: [
    {
      id: 'line1',
      points: [
        { x: -15, y: 0, z: -15 },
        { x: 0, y: 5, z: 0 },
        { x: 15, y: 0, z: 15 }
      ],
      type: 'shader',
      color: '#00ff00'
    }
  ]
});

// 监听事件
migrationLines.on('start', (data) => {
  console.log('动画开始:', data.lineId);
});

migrationLines.on('complete', (data) => {
  console.log('动画完成:', data.lineId);
});

migrationLines.on('update', (data) => {
  console.log('进度:', data.progress);
});`;

// 添加事件日志
const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    eventLogs.value.unshift(`[${timestamp}] ${message}`);
    if (eventLogs.value.length > 10) {
        eventLogs.value.pop();
    }
};

// 初始化场景
const initScene = async () => {
    if (!sceneContainer.value) return;

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

        // 暴露到 window 对象以便调试
        window.__w3d_scene__ = scene;

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
        scene.registerComponent('MigrationLine', MigrationLine);
        scene.registerComponent('GridHelper', GridHelper);

        // 添加网格辅助
        await scene.add('GridHelper', {
            name: 'grid',
            size: 40,
            divisions: 40,
            color: '#888888'
        });

        // 添加一些参考立方体
        createReferenceCubes();

        // 创建迁移线组件
        migrationLineComponent = await scene.add('MigrationLine', {
            name: 'migration-lines',
            globalConfig: {
                type: 'shader',
                color: globalConfig.color,
                duration: globalConfig.duration,
                speed: globalConfig.speed,
                loop: globalConfig.loop,
                autoStart: true,
                glowIntensity: globalConfig.glowIntensity,
                flowSpeed: globalConfig.flowSpeed
            },
            lines: [
                {
                    id: 'line1',
                    points: [
                        { x: -15, y: 0, z: -15 },
                        { x: 0, y: 5, z: 0 },
                        { x: 15, y: 0, z: 15 }
                    ],
                    color: '#00ff00',
                    userData: { name: '示例线条 1' }
                },
                {
                    id: 'line2',
                    points: [
                        { x: 15, y: 0, z: -15 },
                        { x: 0, y: 3, z: 0 },
                        { x: -15, y: 0, z: 15 }
                    ],
                    color: '#ff0000',
                    delay: 500,
                    userData: { name: '示例线条 2' }
                },
                {
                    id: 'line3',
                    points: [
                        { x: -15, y: 0, z: 0 },
                        { x: -5, y: 4, z: 5 },
                        { x: 5, y: 4, z: -5 },
                        { x: 15, y: 0, z: 0 }
                    ],
                    color: '#0000ff',
                    delay: 1000,
                    userData: { name: '示例线条 3' }
                }
            ],
            areas: [
                {
                    id: 'demo-area-1',
                    points: [
                        { x: -8, y: 0, z: -8 },
                        { x: 8, y: 0, z: -8 },
                        { x: 8, y: 0, z: 8 },
                        { x: -8, y: 0, z: 8 }
                    ],
                    color: '#00ff00',
                    wallHeight: 6,
                    wallOpacity: 0.5,
                    userData: { name: '示例区域 1' }
                },
                {
                    id: 'demo-area-2',
                    points: [
                        { x: -12, y: 0, z: -12 },
                        { x: 12, y: 0, z: -12 },
                        { x: 12, y: 0, z: 12 },
                        { x: -12, y: 0, z: 12 }
                    ],
                    color: '#0088ff',
                    wallHeight: 4,
                    wallOpacity: 0.3,
                    userData: { name: '示例区域 2' }
                }
            ]
        });

        // 暴露到 window 对象以便调试
        window.__w3d_migrationLine__ = migrationLineComponent;

        // 监听事件
        migrationLineComponent.on('start', (data) => {
            addLog(`开始: ${data.lineId}`);
        });

        migrationLineComponent.on('complete', (data) => {
            addLog(`完成: ${data.lineId}`);
        });

        migrationLineComponent.on('loop', (data) => {
            addLog(`循环: ${data.lineId}`);
        });

        // 区域块事件
        migrationLineComponent.on('areaAdded', (data) => {
            addLog(`区域块已添加: ${data.areaId}`);
            updateAreaList();
        });

        migrationLineComponent.on('areaRemoved', (data) => {
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

// 创建参考立方体
const createReferenceCubes = () => {
    const positions = [
        { x: -15, y: 0.5, z: -15, color: '#ff6b6b' },
        { x: 15, y: 0.5, z: 15, color: '#4ecdc4' },
        { x: 15, y: 0.5, z: -15, color: '#45b7d1' },
        { x: -15, y: 0.5, z: 15, color: '#ffd93d' }
    ];

    positions.forEach((pos) => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: pos.color,
            metalness: 0.3,
            roughness: 0.7
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(pos.x, pos.y, pos.z);
        scene.scene.add(cube);
    });
};

// 启动 FPS 监控
const startFPSMonitor = () => {
    let lastTime = performance.now();
    let frames = 0;

    const updateFPS = () => {
        frames++;
        const currentTime = performance.now();
        if (currentTime >= lastTime + 1000) {
            fps.value = Math.round((frames * 1000) / (currentTime - lastTime));
            frames = 0;
            lastTime = currentTime;
        }
    };

    fpsUpdateInterval = setInterval(updateFPS, 100);
};

// 更新统计
const updateStats = () => {
    if (!migrationLineComponent) return;

    lineCount.value = migrationLineComponent.getAllLines().length;
    areaCount.value = migrationLineComponent.getAllAreas().length;

    let playing = 0;
    migrationLineComponent.animationStates.forEach((state) => {
        if (state.isPlaying) playing++;
    });
    playingCount.value = playing;

    // 更新区域块列表
    updateAreaList();
};

// 更新全局配置
const updateGlobalConfig = async () => {
    if (!migrationLineComponent) return;

    // 更新所有线条
    const allLines = migrationLineComponent.getAllLines();
    for (const lineData of allLines) {
        await migrationLineComponent.updateLine(lineData.id, {
            color: globalConfig.color,
            duration: globalConfig.duration,
            speed: globalConfig.speed,
            loop: globalConfig.loop,
            glowIntensity: globalConfig.glowIntensity,
            flowSpeed: globalConfig.flowSpeed
        });
    }

    addLog('更新全局配置');
};

// 添加随机迁移线
const addRandomLine = async () => {
    if (!migrationLineComponent) return;

    lineCounter++;
    const newId = `line-${Date.now()}-${lineCounter}`;

    // 生成随机路径
    let points = [];
    const range = 15;

    switch (newLinePathType.value) {
        case 'simple':
            points = [
                {
                    x: (Math.random() - 0.5) * range * 2,
                    y: Math.random() * 3,
                    z: (Math.random() - 0.5) * range * 2
                },
                {
                    x: (Math.random() - 0.5) * range * 2,
                    y: Math.random() * 3,
                    z: (Math.random() - 0.5) * range * 2
                }
            ];
            break;
        case 'multi':
            points = [
                {
                    x: (Math.random() - 0.5) * range * 2,
                    y: Math.random() * 2,
                    z: (Math.random() - 0.5) * range * 2
                },
                {
                    x: (Math.random() - 0.5) * range * 2,
                    y: Math.random() * 5,
                    z: (Math.random() - 0.5) * range * 2
                },
                {
                    x: (Math.random() - 0.5) * range * 2,
                    y: Math.random() * 2,
                    z: (Math.random() - 0.5) * range * 2
                }
            ];
            break;
        case 'curve':
            const pointCount = 4 + Math.floor(Math.random() * 3);
            for (let i = 0; i < pointCount; i++) {
                points.push({
                    x: (Math.random() - 0.5) * range * 2,
                    y: Math.random() * 4,
                    z: (Math.random() - 0.5) * range * 2
                });
            }
            break;
    }

    // 随机颜色
    const colors = ['#00ff00', '#ff0000', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    await migrationLineComponent.addLine({
        id: newId,
        points: points,
        color: randomColor,
        userData: { name: `随机线条 ${lineCounter}` }
    });

    addLog(`添加迁移线: ${newId}`);
    updateStats();
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
    if (!migrationLineComponent) return;

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

    await migrationLineComponent.addArea({
        id: newId,
        points: points,
        color: areaConfig.color || randomColor,
        wallHeight: areaConfig.wallHeight,
        wallOpacity: areaConfig.wallOpacity,
        borderWidth: areaConfig.borderWidth,
        animationSpeed: areaConfig.animationSpeed,
        showWall: areaConfig.showWall,
        userData: { name: `区域块 ${areaCounter}` }
    });

    addLog(`添加区域块: ${newId}`);
    updateStats();
};

// 移除区域块
const removeArea = async (areaId) => {
    if (!migrationLineComponent) return;

    migrationLineComponent.removeArea(areaId);
    addLog(`移除区域块: ${areaId}`);
    updateStats();
};

// 清除所有区域块
const clearAllAreas = () => {
    if (!migrationLineComponent) return;

    migrationLineComponent.clearAreas();
    addLog('清除所有区域块');
    updateStats();
};

// 更新区域块列表
const updateAreaList = () => {
    if (!migrationLineComponent) return;

    const areas = migrationLineComponent.getAllAreas();
    areaList.value = areas;
    areaCount.value = areas.length;
};

// 控制按钮
const startAll = () => {
    if (migrationLineComponent) {
        migrationLineComponent.startAll();
        addLog('全部播放');
        updateStats();
    }
};

const pauseAll = () => {
    if (migrationLineComponent) {
        migrationLineComponent.pauseAll();
        addLog('全部暂停');
        updateStats();
    }
};

const stopAll = () => {
    if (migrationLineComponent) {
        migrationLineComponent.stopAll();
        addLog('全部停止');
        updateStats();
    }
};

const clearAll = () => {
    if (migrationLineComponent) {
        migrationLineComponent.clearLines();
        addLog('清除全部');
        updateStats();
    }
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
    flex-direction: column;
    gap: 8px;
}

.area-list {
    max-height: 200px;
    overflow-y: auto;
    .scrollbar-style();
}

.area-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    margin-bottom: 4px;
    font-size: 12px;
}

.area-name {
    flex: 1;
    color: #00ff88;
}

.event-log {
    max-height: 150px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    padding: 8px;
    font-size: 11px;
    font-family: monospace;
    .scrollbar-style();
}

.log-item {
    padding: 2px 0;
    color: #aaa;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.log-item:last-child {
    border-bottom: none;
}
</style>
