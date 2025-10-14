<template>
    <SplitLayout :code="sourceCode" language="javascript" title="Pipeline - 管道效果组件">
        <!-- 3D 场景容器 -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- 控制面板 -->
        <div class="control-panel">
            <h3 class="panel-title">管道效果控制</h3>

            <!-- 管道配置 -->
            <div class="section">
                <h4>管道配置</h4>

                <div class="form-group">
                    <label>管道半径: {{ pipelineConfig.radius.toFixed(2) }}</label>
                    <input
                        v-model.number="pipelineConfig.radius"
                        type="range"
                        min="0.1"
                        max="2"
                        step="0.1"
                    />
                </div>

                <div class="form-group">
                    <label>管道颜色:</label>
                    <input v-model="pipelineConfig.color" type="color" />
                </div>

                <div class="form-group">
                    <label>透明度: {{ pipelineConfig.opacity.toFixed(2) }}</label>
                    <input
                        v-model.number="pipelineConfig.opacity"
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                    />
                </div>

                <div class="form-group">
                    <label>分段数: {{ pipelineConfig.segments }}</label>
                    <input
                        v-model.number="pipelineConfig.segments"
                        type="range"
                        min="16"
                        max="128"
                        step="8"
                    />
                </div>

                <div class="form-group">
                    <label>显示进度: {{ pipelineConfig.progress }}%</label>
                    <input
                        v-model.number="pipelineConfig.progress"
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                    />
                </div>

                <button
                    @click="addRandomPipeline"
                    class="btn-primary"
                    style="width: 100%; margin-bottom: 10px"
                >
                    添加管道
                </button>

                <button @click="clearAllPipelines" class="btn-danger" style="width: 100%">
                    清除所有管道
                </button>
            </div>

            <!-- 流光效果配置 -->
            <div class="section">
                <h4>流光效果</h4>

                <div class="form-group">
                    <label>
                        <input v-model="flowConfig.enabled" type="checkbox" />
                        启用流光效果
                    </label>
                </div>

                <div v-if="flowConfig.enabled" class="form-group">
                    <label>流光速度: {{ flowConfig.speed.toFixed(1) }}</label>
                    <input
                        v-model.number="flowConfig.speed"
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                    />
                </div>

                <div v-if="flowConfig.enabled" class="form-group">
                    <label>流光颜色:</label>
                    <input v-model="flowConfig.color" type="color" />
                </div>

                <div v-if="flowConfig.enabled" class="form-group">
                    <label>流光宽度: {{ flowConfig.width.toFixed(2) }}</label>
                    <input
                        v-model.number="flowConfig.width"
                        type="range"
                        min="0.05"
                        max="0.5"
                        step="0.05"
                    />
                </div>

                <div v-if="flowConfig.enabled" class="form-group">
                    <label>流光强度: {{ flowConfig.intensity.toFixed(1) }}</label>
                    <input
                        v-model.number="flowConfig.intensity"
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                    />
                </div>
            </div>

            <!-- 管道列表 -->
            <div class="section">
                <h4>管道列表 ({{ pipelineList.length }})</h4>

                <div v-if="pipelineList.length > 0" class="pipeline-list">
                    <div v-for="pipe in pipelineList" :key="pipe.id" class="pipeline-item">
                        <div class="pipeline-info">
                            <span class="pipeline-name">{{ pipe.id }}</span>
                            <span class="pipeline-progress">{{ pipe.progress }}%</span>
                        </div>
                        <div class="pipeline-actions">
                            <button @click="animateProgress(pipe.id)" class="btn-toggle">
                                动画
                            </button>
                            <button @click="removePipeline(pipe.id)" class="btn-remove">
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
                        <span>管道数量:</span>
                        <span class="value">{{ pipelineCount }}</span>
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
import { Pipeline, GridHelper } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';

const sceneContainer = ref(null);
const fps = ref(60);
const pipelineCount = ref(0);
const eventLogs = ref([]);
const pipelineList = ref([]);

let scene = null;
let pipelineComponent = null;
let pipelineCounter = 0;
let fpsUpdateInterval = null;

// 管道配置
const pipelineConfig = reactive({
    radius: 0.5,
    color: '#00ff00',
    opacity: 0.8,
    segments: 64,
    progress: 100
});

// 流光效果配置
const flowConfig = reactive({
    enabled: true,
    speed: 1.0,
    color: '#ffffff',
    width: 0.2,
    intensity: 1.5
});

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { Pipeline, GridHelper } from '@w3d/components';

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
scene.registerComponent('Pipeline', Pipeline);
scene.registerComponent('GridHelper', GridHelper);

// 添加网格
await scene.add('GridHelper', {
  name: 'grid',
  size: 40,
  divisions: 40
});

// 添加管道组件
const pipeline = await scene.add('Pipeline', {
  name: 'my-pipelines',
  globalConfig: {
    radius: 0.5,
    color: '#00ff00',
    opacity: 0.8,
    segments: 64
  },
  pipelines: [
    {
      id: 'pipeline1',
      points: [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 5, z: 0 },
        { x: 20, y: 0, z: 0 }
      ],
      progress: 100,
      flow: {
        enabled: true,
        speed: 1.0,
        color: '#ffffff',
        width: 0.2,
        intensity: 1.5
      }
    }
  ]
});

// 监听事件
pipeline.on('pipelineAdded', (data) => {
  console.log('管道已添加:', data.pipelineId);
});

pipeline.on('progressUpdated', (data) => {
  console.log('进度已更新:', data.pipelineId, data.progress);
});

// 添加新管道
await pipeline.addPipeline({
  id: 'pipeline2',
  points: [
    { x: 0, y: 0, z: 0 },
    { x: 5, y: 3, z: 5 },
    { x: 10, y: 0, z: 10 }
  ],
  radius: 0.8,
  color: '#ff0000'
});

// 更新进度
pipeline.updateProgress('pipeline1', 75);

// 更新流光效果
pipeline.updateFlow('pipeline1', {
  speed: 2.0,
  intensity: 2.5
});`;

// 添加日志
const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    eventLogs.value.unshift(`[${timestamp}] ${message}`);
    if (eventLogs.value.length > 50) {
        eventLogs.value.pop();
    }
};

// 更新统计信息
const updateStats = () => {
    if (pipelineComponent) {
        const pipelines = pipelineComponent.getAllPipelines();
        pipelineList.value = pipelines;
        pipelineCount.value = pipelines.length;
    }
};

// 初始化场景
const initScene = async () => {
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

    // 注册组件
    scene.registerComponent('Pipeline', Pipeline);
    scene.registerComponent('GridHelper', GridHelper);

    // 添加网格
    await scene.add('GridHelper', {
        name: 'grid',
        size: 40,
        divisions: 40,
        colorCenterLine: '#888888',
        colorGrid: '#444444'
    });

    // 添加管道组件
    pipelineComponent = await scene.add('Pipeline', {
        name: 'my-pipelines',
        globalConfig: {
            radius: 0.5,
            color: '#00ff00',
            opacity: 0.8,
            segments: 64
        },
        pipelines: [
            {
                id: 'pipeline-demo-1',
                points: [
                    { x: -10, y: 0, z: -10 },
                    { x: -5, y: 3, z: -5 },
                    { x: 0, y: 5, z: 0 },
                    { x: 5, y: 3, z: 5 },
                    { x: 10, y: 0, z: 10 }
                ],
                color: '#00ff00',
                radius: 0.5,
                progress: 100,
                flow: {
                    enabled: true,
                    speed: 1.0,
                    color: '#ffffff',
                    width: 0.2,
                    intensity: 1.5
                }
            },
            {
                id: 'pipeline-demo-2',
                points: [
                    { x: 10, y: 0, z: -10 },
                    { x: 5, y: 4, z: -5 },
                    { x: 0, y: 6, z: 0 },
                    { x: -5, y: 4, z: 5 },
                    { x: -10, y: 0, z: 10 }
                ],
                color: '#ff6600',
                radius: 0.6,
                progress: 100,
                flow: {
                    enabled: true,
                    speed: 1.5,
                    color: '#ffff00',
                    width: 0.25,
                    intensity: 2.0
                }
            }
        ]
    });

    // 暴露到 window 对象以便调试
    window.__w3d_pipeline__ = pipelineComponent;

    // 监听事件
    pipelineComponent.on('pipelineAdded', (data) => {
        addLog(`管道已添加: ${data.pipelineId}`);
        updateStats();
    });

    pipelineComponent.on('pipelineRemoved', (data) => {
        addLog(`管道已移除: ${data.pipelineId}`);
        updateStats();
    });

    pipelineComponent.on('progressUpdated', (data) => {
        addLog(`进度已更新: ${data.pipelineId} -> ${data.progress}%`);
        updateStats();
    });

    pipelineComponent.on('flowUpdated', (data) => {
        addLog(`流光已更新: ${data.pipelineId}`);
    });

    pipelineComponent.on('pipelinesCleared', () => {
        addLog('所有管道已清除');
        updateStats();
    });

    // 更新统计
    updateStats();

    // FPS 更新
    fpsUpdateInterval = setInterval(() => {
        fps.value = Math.round(scene.stats.fps);
    }, 1000);

    addLog('场景初始化完成');
};

// 生成随机路径点
const generateRandomPoints = (count = 5) => {
    const points = [];
    const range = 15;

    for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const x = (Math.random() - 0.5) * range * 2;
        const z = (Math.random() - 0.5) * range * 2;
        const y = Math.sin(t * Math.PI) * 5 + Math.random() * 2;

        points.push({ x, y, z });
    }

    return points;
};

// 添加随机管道
const addRandomPipeline = async () => {
    if (!pipelineComponent) return;

    pipelineCounter++;
    const newId = `pipeline-${Date.now()}-${pipelineCounter}`;

    const pipelineData = {
        id: newId,
        points: generateRandomPoints(5),
        radius: pipelineConfig.radius,
        color: pipelineConfig.color,
        opacity: pipelineConfig.opacity,
        segments: pipelineConfig.segments,
        progress: pipelineConfig.progress
    };

    // 添加流光配置（如果启用）
    if (flowConfig.enabled) {
        pipelineData.flow = {
            enabled: true,
            speed: flowConfig.speed,
            color: flowConfig.color,
            width: flowConfig.width,
            intensity: flowConfig.intensity
        };
    }

    await pipelineComponent.addPipeline(pipelineData);

    addLog(`添加管道: ${newId}`);
    updateStats();
};

// 移除管道
const removePipeline = (pipelineId) => {
    if (!pipelineComponent) return;
    pipelineComponent.removePipeline(pipelineId);
    addLog(`移除管道: ${pipelineId}`);
    updateStats();
};

// 清除所有管道
const clearAllPipelines = () => {
    if (!pipelineComponent) return;
    pipelineComponent.clearPipelines();
    addLog('清除所有管道');
    updateStats();
};

// 进度动画
const animateProgress = (pipelineId) => {
    if (!pipelineComponent) return;

    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        pipelineComponent.updateProgress(pipelineId, progress);

        if (progress >= 100) {
            clearInterval(interval);
            addLog(`管道 ${pipelineId} 进度动画完成`);
        }
    }, 50);

    addLog(`开始管道 ${pipelineId} 进度动画`);
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
    width: 320px;
    max-height: calc(100vh - 40px);
    background: rgba(0, 0, 0, 0.85);
    border: 1px solid #00ff00;
    border-radius: 8px;
    padding: 15px;
    color: #00ff00;
    font-family: 'Courier New', monospace;
    overflow-y: auto;
    backdrop-filter: blur(10px);
}

.panel-title {
    margin: 0 0 15px 0;
    font-size: 16px;
    text-align: center;
    border-bottom: 1px solid #00ff00;
    padding-bottom: 10px;
}

.section {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(0, 255, 0, 0.3);
}

.section:last-child {
    border-bottom: none;
}

.section h4 {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: #00ff00;
}

.form-group {
    margin-bottom: 12px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-size: 11px;
    color: #00ff00;
}

.form-group input[type='range'] {
    width: 100%;
    height: 4px;
    background: rgba(0, 255, 0, 0.2);
    border-radius: 2px;
    outline: none;
}

.form-group input[type='range']::-webkit-slider-thumb {
    width: 12px;
    height: 12px;
    background: #00ff00;
    border-radius: 50%;
    cursor: pointer;
}

.form-group input[type='color'] {
    width: 100%;
    height: 30px;
    border: 1px solid #00ff00;
    background: transparent;
    cursor: pointer;
}

.form-group input[type='text'] {
    width: 100%;
    padding: 6px;
    background: rgba(0, 255, 0, 0.1);
    border: 1px solid #00ff00;
    color: #00ff00;
    font-family: 'Courier New', monospace;
    font-size: 11px;
}

.form-group input[type='checkbox'] {
    margin-right: 8px;
}

.form-group select {
    width: 100%;
    padding: 6px;
    background: rgba(0, 255, 0, 0.1);
    border: 1px solid #00ff00;
    color: #00ff00;
    font-family: 'Courier New', monospace;
    font-size: 11px;
}

.btn-primary,
.btn-danger {
    width: 100%;
    padding: 8px;
    border: 1px solid #00ff00;
    background: rgba(0, 255, 0, 0.1);
    color: #00ff00;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary:hover {
    background: rgba(0, 255, 0, 0.2);
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.btn-danger {
    border-color: #ff0000;
    color: #ff0000;
    background: rgba(255, 0, 0, 0.1);
}

.btn-danger:hover {
    background: rgba(255, 0, 0, 0.2);
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
}

.pipeline-list {
    max-height: 200px;
    overflow-y: auto;
}

.pipeline-item {
    background: rgba(0, 255, 0, 0.05);
    border: 1px solid rgba(0, 255, 0, 0.3);
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 8px;
}

.pipeline-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 11px;
}

.pipeline-name {
    color: #00ff00;
    font-weight: bold;
}

.pipeline-progress {
    color: #00ffff;
}

.pipeline-actions {
    display: flex;
    gap: 5px;
}

.btn-toggle,
.btn-remove {
    flex: 1;
    padding: 4px 8px;
    border: 1px solid #00ff00;
    background: rgba(0, 255, 0, 0.1);
    color: #00ff00;
    font-family: 'Courier New', monospace;
    font-size: 10px;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-toggle:hover {
    background: rgba(0, 255, 0, 0.2);
}

.btn-remove {
    border-color: #ff0000;
    color: #ff0000;
    background: rgba(255, 0, 0, 0.1);
}

.btn-remove:hover {
    background: rgba(255, 0, 0, 0.2);
}

.stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    padding: 5px;
    background: rgba(0, 255, 0, 0.05);
    border-radius: 3px;
}

.stat-item .value {
    color: #00ffff;
    font-weight: bold;
}

.event-log {
    max-height: 150px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 255, 0, 0.3);
    border-radius: 4px;
    padding: 8px;
}

.log-item {
    font-size: 10px;
    color: #00ff00;
    margin-bottom: 4px;
    padding: 2px 0;
    border-bottom: 1px solid rgba(0, 255, 0, 0.1);
}

.log-item:last-child {
    border-bottom: none;
}

/* 滚动条样式 */
.control-panel::-webkit-scrollbar,
.pipeline-list::-webkit-scrollbar,
.event-log::-webkit-scrollbar {
    width: 6px;
}

.control-panel::-webkit-scrollbar-track,
.pipeline-list::-webkit-scrollbar-track,
.event-log::-webkit-scrollbar-track {
    background: rgba(0, 255, 0, 0.1);
}

.control-panel::-webkit-scrollbar-thumb,
.pipeline-list::-webkit-scrollbar-thumb,
.event-log::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 0, 0.5);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover,
.pipeline-list::-webkit-scrollbar-thumb:hover,
.event-log::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 0, 0.7);
}
</style>
