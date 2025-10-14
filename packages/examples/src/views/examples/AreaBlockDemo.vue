<template>
    <SplitLayout :code="sourceCode" language="javascript" title="AreaBlock - 区域块组件">
        <!-- 3D 场景容器 -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- 控制面板 -->
        <div class="control-panel">
            <h3 class="panel-title">区域块控制</h3>

            <!-- 区域块配置 -->
            <div class="section">
                <h4>区域块配置</h4>

                <div class="form-group">
                    <label>区域颜色:</label>
                    <input v-model="areaConfig.color" type="color" />
                </div>

                <div class="form-group">
                    <label>墙壁高度: {{ areaConfig.wallHeight }}</label>
                    <input
                        v-model.number="areaConfig.wallHeight"
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                    />
                </div>

                <div class="form-group">
                    <label>墙壁透明度: {{ areaConfig.wallOpacity.toFixed(2) }}</label>
                    <input
                        v-model.number="areaConfig.wallOpacity"
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                    />
                </div>

                <div class="form-group">
                    <label>底部透明度: {{ areaConfig.bottomOpacity.toFixed(2) }}</label>
                    <input
                        v-model.number="areaConfig.bottomOpacity"
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                    />
                </div>

                <div class="form-group">
                    <label>边框宽度: {{ areaConfig.borderWidth }}</label>
                    <input
                        v-model.number="areaConfig.borderWidth"
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                    />
                </div>

                <div class="form-group">
                    <label>动画速度: {{ areaConfig.animationSpeed.toFixed(1) }}</label>
                    <input
                        v-model.number="areaConfig.animationSpeed"
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                    />
                </div>

                <div class="form-group">
                    <label>显示模式:</label>
                    <select v-model="displayMode">
                        <option value="all">墙壁+底部</option>
                        <option value="wall">只显示墙壁</option>
                        <option value="bottom">只显示底部</option>
                        <option value="border">只显示边框</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>形状类型:</label>
                    <select v-model="areaShapeType">
                        <option value="square">正方形</option>
                        <option value="triangle">三角形</option>
                        <option value="hexagon">六边形</option>
                        <option value="random">随机多边形</option>
                    </select>
                </div>

                <button
                    @click="addRandomArea"
                    class="btn-primary"
                    style="width: 100%; margin-bottom: 10px"
                >
                    添加区域块
                </button>

                <button @click="clearAllAreas" class="btn-danger" style="width: 100%">
                    清除所有区域块
                </button>

                <!-- 区域块列表 -->
                <div v-if="areaList.length > 0" style="margin-top: 15px">
                    <h5 style="font-size: 12px; color: #00ff00; margin-bottom: 8px">
                        区域块列表 ({{ areaList.length }})
                    </h5>
                    <div v-for="area in areaList" :key="area.id" class="area-item">
                        <span class="area-name">{{ area.userData?.name || area.id }}</span>
                        <button @click="removeArea(area.id)" class="btn-remove">删除</button>
                    </div>
                </div>
            </div>

            <!-- 性能统计 -->
            <div class="section">
                <h4>性能统计</h4>
                <div class="stats">
                    <div class="stat-item">
                        <span>FPS:</span>
                        <span class="value">{{ fps }}</span>
                    </div>
                    <div class="stat-item">
                        <span>区域块数量:</span>
                        <span class="value">{{ areaCount }}</span>
                    </div>
                </div>
            </div>

            <!-- 事件日志 -->
            <div class="section">
                <h4>事件日志</h4>
                <div class="event-log">
                    <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
                        {{ log }}
                    </div>
                </div>
            </div>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { Scene } from '@w3d/core';
import { AreaBlock, GridHelper } from '@w3d/components';
import * as THREE from 'three';
import SplitLayout from '../../components/SplitLayout.vue';

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

<style scoped>
.scene-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.control-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.85);
    padding: 20px;
    border-radius: 8px;
    color: white;
    max-width: 340px;
    max-height: calc(100% - 40px);
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.panel-title {
    margin: 0 0 20px 0;
    font-size: 18px;
    color: #00ff00;
    text-align: center;
    border-bottom: 2px solid #00ff00;
    padding-bottom: 10px;
}

.section {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section:last-child {
    border-bottom: none;
}

.section h4 {
    margin: 0 0 15px 0;
    font-size: 14px;
    color: #00ff00;
    font-weight: normal;
}

.form-group {
    margin-bottom: 12px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    color: #ccc;
}

.form-group input[type='range'] {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    outline: none;
}

.form-group input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    background: #00ff00;
    cursor: pointer;
    border-radius: 50%;
}

.form-group input[type='range']::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: #00ff00;
    cursor: pointer;
    border-radius: 50%;
    border: none;
}

.form-group input[type='color'] {
    width: 100%;
    height: 32px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
}

.form-group input[type='checkbox'] {
    margin-right: 8px;
    cursor: pointer;
}

.form-group select {
    width: 100%;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: white;
    font-size: 12px;
    cursor: pointer;
}

.form-group select option {
    background: #1a1a1a;
    color: white;
}

.btn-primary,
.btn-secondary,
.btn-danger {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
}

.btn-primary {
    background: #00ff00;
    color: black;
}

.btn-primary:hover {
    background: #00cc00;
    transform: translateY(-1px);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.3);
}

.btn-danger {
    background: rgba(255, 0, 0, 0.3);
    color: white;
}

.btn-danger:hover {
    background: rgba(255, 0, 0, 0.5);
}

.stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    font-size: 12px;
}

.stat-item .value {
    color: #00ff00;
    font-weight: bold;
}

.event-log {
    max-height: 150px;
    overflow-y: auto;
    font-size: 11px;
    font-family: monospace;
}

.log-item {
    padding: 4px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: #aaa;
}

.log-item:last-child {
    border-bottom: none;
}

/* 区域块列表样式 */
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

.btn-remove {
    padding: 2px 8px;
    font-size: 11px;
    background: rgba(255, 0, 0, 0.3);
    color: white;
    border: 1px solid rgba(255, 0, 0, 0.5);
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-remove:hover {
    background: rgba(255, 0, 0, 0.5);
    border-color: rgba(255, 0, 0, 0.8);
}

/* 滚动条样式 */
.control-panel::-webkit-scrollbar,
.event-log::-webkit-scrollbar {
    width: 6px;
}

.control-panel::-webkit-scrollbar-track,
.event-log::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb,
.event-log::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover,
.event-log::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}
</style>
