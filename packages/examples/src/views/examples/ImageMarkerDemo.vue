<template>
    <SplitLayout :code="sourceCode" language="javascript" title="ImageMarker - 图片点位组件">
        <!-- 3D 场景容器 -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- 控制面板 -->
        <div class="control-panel">
            <h3 class="panel-title">图片点位控制</h3>

            <!-- 点位配置 -->
            <div class="section">
                <h4>点位配置</h4>

                <div class="form-group">
                    <label>渲染类型:</label>
                    <select v-model="markerConfig.type">
                        <option value="sprite">Sprite</option>
                        <option value="plane">Plane</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>图片大小: {{ markerConfig.size }}</label>
                    <input
                        v-model.number="markerConfig.size"
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                    />
                </div>

                <div class="form-group">
                    <label>颜色叠加:</label>
                    <input v-model="markerConfig.color" type="color" />
                </div>

                <div class="form-group">
                    <label>透明度: {{ markerConfig.opacity.toFixed(2) }}</label>
                    <input
                        v-model.number="markerConfig.opacity"
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                    />
                </div>

                <div class="form-group">
                    <label>位置偏移 Y: {{ markerConfig.offset.y }}</label>
                    <input
                        v-model.number="markerConfig.offset.y"
                        type="range"
                        min="-10"
                        max="10"
                        step="0.5"
                    />
                </div>

                <div class="form-group">
                    <label>
                        <input v-model="markerConfig.sizeAttenuation" type="checkbox" />
                        大小随距离衰减 (Sprite)
                    </label>
                </div>

                <button
                    @click="addRandomMarker"
                    class="btn-primary"
                    style="width: 100%; margin-bottom: 10px"
                >
                    添加点位
                </button>

                <button @click="clearAllMarkers" class="btn-danger" style="width: 100%">
                    清除所有点位
                </button>

                <!-- 点位列表 -->
                <div v-if="markerList.length > 0" style="margin-top: 15px">
                    <h5 style="font-size: 12px; color: #00ff00; margin-bottom: 8px">
                        点位列表 ({{ markerList.length }})
                    </h5>
                    <div v-for="marker in markerList" :key="marker.id" class="marker-item">
                        <div class="marker-info">
                            <span class="marker-name">{{
                                marker.userData?.name || marker.id
                            }}</span>
                            <span class="marker-state">状态: {{ marker.state }}</span>
                        </div>
                        <div class="marker-actions">
                            <button @click="toggleMarkerState(marker.id)" class="btn-toggle">
                                切换
                            </button>
                            <button @click="removeMarker(marker.id)" class="btn-remove">
                                删除
                            </button>
                        </div>
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
                        <span>点位数量:</span>
                        <span class="value">{{ markerCount }}</span>
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
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { ImageMarker, GridHelper } from '@w3d/components';
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
    sizeAttenuation: true
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

// 添加图片点位组件
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
      opacity: 1.0
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

// 添加新点位
await imageMarker.addMarker({
  id: 'marker2',
  position: { x: 10, y: 5, z: 0 },
  type: 'plane',
  images: {
    state1: '/images/camera.png'
  }
});

// 切换点位状态
await imageMarker.updateState('marker1', 'state2');

// 更新点位配置
imageMarker.updateMarker('marker1', {
  size: 8,
  color: '#ff0000'
});`;

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

    await imageMarkerComponent.addMarker({
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
    });

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
.btn-danger,
.btn-toggle,
.btn-remove {
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

.btn-danger {
    background: rgba(255, 0, 0, 0.3);
    color: white;
}

.btn-danger:hover {
    background: rgba(255, 0, 0, 0.5);
}

.btn-toggle {
    padding: 2px 8px;
    font-size: 11px;
    background: rgba(0, 255, 0, 0.3);
    color: white;
    border: 1px solid rgba(0, 255, 0, 0.5);
    margin-right: 4px;
}

.btn-toggle:hover {
    background: rgba(0, 255, 0, 0.5);
}

.btn-remove {
    padding: 2px 8px;
    font-size: 11px;
    background: rgba(255, 0, 0, 0.3);
    color: white;
    border: 1px solid rgba(255, 0, 0, 0.5);
}

.btn-remove:hover {
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

/* 点位列表样式 */
.marker-item {
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    margin-bottom: 6px;
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

