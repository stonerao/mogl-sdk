<template>
    <SplitLayout :code="sourceCode" language="javascript" title="MigrationLine - 迁移线动画组件">
        <!-- 3D 场景容器 -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- 控制面板 -->
        <div class="control-panel">
            <h3 class="panel-title">迁移线控制</h3>

            <!-- 全局配置 -->
            <div class="section">
                <h4>全局配置</h4>

                <div class="form-group">
                    <label>颜色:</label>
                    <input v-model="globalConfig.color" type="color" @input="updateGlobalConfig" />
                </div>

                <div class="form-group">
                    <label>持续时间: {{ globalConfig.duration }}ms</label>
                    <input
                        v-model.number="globalConfig.duration"
                        type="range"
                        min="1000"
                        max="10000"
                        step="100"
                        @input="updateGlobalConfig"
                    />
                </div>

                <div class="form-group">
                    <label>速度: {{ globalConfig.speed.toFixed(1) }}</label>
                    <input
                        v-model.number="globalConfig.speed"
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        @input="updateGlobalConfig"
                    />
                </div>

                <div class="form-group">
                    <label>
                        <input
                            v-model="globalConfig.loop"
                            type="checkbox"
                            @change="updateGlobalConfig"
                        />
                        循环播放
                    </label>
                </div>

                <!-- Shader 特定配置 -->
                <div class="form-group">
                    <label>发光强度: {{ globalConfig.glowIntensity.toFixed(1) }}</label>
                    <input
                        v-model.number="globalConfig.glowIntensity"
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        @input="updateGlobalConfig"
                    />
                </div>

                <div class="form-group">
                    <label>流动速度: {{ globalConfig.flowSpeed.toFixed(1) }}</label>
                    <input
                        v-model.number="globalConfig.flowSpeed"
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        @input="updateGlobalConfig"
                    />
                </div>
            </div>

            <!-- 控制按钮 -->
            <div class="section">
                <h4>动画控制</h4>
                <div class="control-buttons">
                    <button @click="startAll" class="btn-primary">全部播放</button>
                    <button @click="pauseAll" class="btn-secondary">全部暂停</button>
                    <button @click="stopAll" class="btn-secondary">全部停止</button>
                    <button @click="clearAll" class="btn-danger">清除全部</button>
                </div>
            </div>

            <!-- 添加迁移线 -->
            <div class="section">
                <h4>添加迁移线</h4>
                <div class="form-group">
                    <label>路径类型:</label>
                    <select v-model="newLinePathType">
                        <option value="simple">简单路径 (A→B)</option>
                        <option value="multi">多段路径 (A→B→C)</option>
                        <option value="curve">曲线路径</option>
                    </select>
                </div>
                <button @click="addRandomLine" class="btn-primary">添加随机迁移线</button>
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
                        <span>迁移线数量:</span>
                        <span class="value">{{ lineCount }}</span>
                    </div>
                    <div class="stat-item">
                        <span>播放中:</span>
                        <span class="value">{{ playingCount }}</span>
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
import { MigrationLine, GridHelper } from '@w3d/components';
import * as THREE from 'three';
import SplitLayout from '../../components/SplitLayout.vue';

const sceneContainer = ref(null);
const fps = ref(60);
const lineCount = ref(0);
const playingCount = ref(0);
const eventLogs = ref([]);
const newLinePathType = ref('simple');

let scene = null;
let migrationLineComponent = null;
let lineCounter = 0;
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

    let playing = 0;
    migrationLineComponent.animationStates.forEach((state) => {
        if (state.isPlaying) playing++;
    });
    playingCount.value = playing;
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
    font-size: 14px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.panel-title {
    margin: 0 0 15px 0;
    font-size: 18px;
    font-weight: bold;
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
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #00ff00;
}

.form-group {
    margin-bottom: 12px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-size: 12px;
    color: #aaa;
}

.form-group input[type='color'] {
    width: 100%;
    height: 30px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.form-group input[type='range'] {
    width: 100%;
}

.form-group input[type='checkbox'] {
    margin-right: 8px;
}

.form-group select {
    width: 100%;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: white;
    font-size: 12px;
}

.control-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.btn-primary {
    padding: 8px 16px;
    background: #00ff00;
    color: black;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    transition: background 0.2s;
}

.btn-primary:hover {
    background: #00cc00;
}

.btn-secondary {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.2);
}

.btn-danger {
    padding: 8px 16px;
    background: rgba(255, 107, 107, 0.3);
    color: white;
    border: 1px solid #ff6b6b;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
    grid-column: 1 / -1;
}

.btn-danger:hover {
    background: rgba(255, 107, 107, 0.5);
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
