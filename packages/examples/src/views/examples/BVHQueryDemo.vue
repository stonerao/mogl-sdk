<template>
    <div class="bvh-query-demo">
        <!-- 3D 场景容器 -->
        <div ref="containerRef" class="scene-container"></div>

        <!-- 控制面板 -->
        <div class="control-panel">
            <h3>{{ t('bvhQuery.title') }}</h3>

            <!-- 模式选择 -->
            <div class="form-group">
                <label>{{ t('bvhQuery.mode') }}</label>
                <select v-model="currentMode" @change="onModeChange">
                    <option value="raycast">{{ t('bvhQuery.modes.raycast') }}</option>
                    <option value="nearest">{{ t('bvhQuery.modes.nearest') }}</option>
                    <option value="collision">{{ t('bvhQuery.modes.collision') }}</option>
                    <option value="voxel">{{ t('bvhQuery.modes.voxel') }}</option>
                </select>
            </div>

            <!-- BVH 配置 -->
            <div class="section">
                <h4>{{ t('bvhQuery.bvhConfig') }}</h4>

                <div class="form-group">
                    <label>{{ t('bvhQuery.strategy') }}</label>
                    <select v-model="bvhConfig.strategy" @change="rebuildBVH">
                        <option value="CENTER">CENTER</option>
                        <option value="AVERAGE">AVERAGE</option>
                        <option value="SAH">SAH</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>{{ t('bvhQuery.maxDepth') }}: {{ bvhConfig.maxDepth }}</label>
                    <input
                        type="range"
                        v-model.number="bvhConfig.maxDepth"
                        min="10"
                        max="50"
                        @change="rebuildBVH"
                    />
                </div>

                <div class="form-group">
                    <label>{{ t('bvhQuery.maxLeafTris') }}: {{ bvhConfig.maxLeafTris }}</label>
                    <input
                        type="range"
                        v-model.number="bvhConfig.maxLeafTris"
                        min="5"
                        max="20"
                        @change="rebuildBVH"
                    />
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" v-model="showHelper" @change="toggleBVHHelper" />
                        {{ t('bvhQuery.showHelper') }}
                    </label>
                </div>

                <div v-if="showHelper" class="form-group">
                    <label>{{ t('bvhQuery.helperDepth') }}: {{ helperDepth }}</label>
                    <input
                        type="range"
                        v-model.number="helperDepth"
                        min="1"
                        max="20"
                        @change="updateHelperDepth"
                    />
                </div>
            </div>

            <!-- 射线投射模式配置 -->
            <div v-if="currentMode === 'raycast'" class="section">
                <h4>{{ t('bvhQuery.raycastConfig') }}</h4>

                <div class="form-group">
                    <label>
                        <input type="checkbox" v-model="raycastConfig.firstHitOnly" />
                        {{ t('bvhQuery.firstHitOnly') }}
                    </label>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" v-model="raycastConfig.showNormal" />
                        {{ t('bvhQuery.showNormal') }}
                    </label>
                </div>
            </div>

            <!-- 最近点模式配置 -->
            <div v-if="currentMode === 'nearest'" class="section">
                <h4>{{ t('bvhQuery.nearestConfig') }}</h4>

                <div class="form-group">
                    <label>
                        <input type="checkbox" v-model="nearestConfig.showLine" />
                        {{ t('bvhQuery.showLine') }}
                    </label>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" v-model="nearestConfig.showPoint" />
                        {{ t('bvhQuery.showPoint') }}
                    </label>
                </div>
            </div>

            <!-- 碰撞检测模式配置 -->
            <div v-if="currentMode === 'collision'" class="section">
                <h4>{{ t('bvhQuery.collisionConfig') }}</h4>

                <div class="form-group">
                    <label>{{ t('bvhQuery.collisionType') }}</label>
                    <select v-model="collisionConfig.type">
                        <option value="sphere">{{ t('bvhQuery.sphere') }}</option>
                        <option value="box">{{ t('bvhQuery.box') }}</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>{{ t('bvhQuery.size') }}: {{ collisionConfig.size }}</label>
                    <input
                        type="range"
                        v-model.number="collisionConfig.size"
                        min="0.5"
                        max="5"
                        step="0.1"
                    />
                </div>
            </div>

            <!-- 统计信息 -->
            <div class="section stats">
                <h4>{{ t('stats.title') }}</h4>
                <div class="stat-item">
                    <span>{{ t('stats.fps') }}:</span>
                    <span>{{ fps }}</span>
                </div>
                <div v-if="bvhStats" class="stat-item">
                    <span>{{ t('bvhQuery.nodeCount') }}:</span>
                    <span>{{ bvhStats.nodeCount }}</span>
                </div>
                <div v-if="bvhStats" class="stat-item">
                    <span>{{ t('bvhQuery.leafNodeCount') }}:</span>
                    <span>{{ bvhStats.leafNodeCount }}</span>
                </div>
                <div v-if="bvhStats" class="stat-item">
                    <span>{{ t('bvhQuery.triangleCount') }}:</span>
                    <span>{{ Math.floor(bvhStats.triangleCount) }}</span>
                </div>
                <div v-if="bvhStats" class="stat-item">
                    <span>{{ t('bvhQuery.lastQueryTime') }}:</span>
                    <span>{{ bvhStats.lastQueryTime.toFixed(3) }}ms</span>
                </div>
                <div v-if="bvhStats" class="stat-item">
                    <span>{{ t('bvhQuery.totalQueries') }}:</span>
                    <span>{{ bvhStats.totalQueries }}</span>
                </div>
            </div>

            <!-- 事件日志 -->
            <div class="section event-log">
                <h4>{{ t('bvhQuery.eventLog') }}</h4>
                <div class="log-container">
                    <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
                        <span class="log-time">{{ log.time }}</span>
                        <span class="log-message">{{ log.message }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 提示信息 -->
        <div class="info-panel">
            <div v-if="currentMode === 'raycast'">
                {{ t('bvhQuery.raycastHint') }}
            </div>
            <div v-else-if="currentMode === 'nearest'">
                {{ t('bvhQuery.nearestHint') }}
            </div>
            <div v-else-if="currentMode === 'collision'">
                {{ t('bvhQuery.collisionHint') }}
            </div>
            <div v-else-if="currentMode === 'voxel'">
                {{ t('bvhQuery.voxelHint') }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useLanguage } from '@/composables/useLanguage';
import { Scene } from '@w3d/core';
import { ModelLoader, BVHQuery } from '@w3d/components';
import * as THREE from 'three';

const { t } = useLanguage();

// DOM 引用
const containerRef = ref(null);

// 场景实例
let scene = null;
let bvhQuery = null;
let targetMesh = null;

// 辅助对象
let raycaster = null;
let mouse = new THREE.Vector2();
let hitMarker = null;
let normalHelper = null;
let nearestMarker = null;
let nearestLine = null;
let collisionObject = null;

// 状态
const currentMode = ref('raycast');
const showHelper = ref(false);
const helperDepth = ref(10);
const fps = ref(0);
const bvhStats = ref(null);
const eventLogs = ref([]);

// BVH 配置
const bvhConfig = reactive({
    strategy: 'SAH',
    maxDepth: 40,
    maxLeafTris: 10
});

// 射线投射配置
const raycastConfig = reactive({
    firstHitOnly: true,
    showNormal: true
});

// 最近点配置
const nearestConfig = reactive({
    showLine: true,
    showPoint: true
});

// 碰撞检测配置
const collisionConfig = reactive({
    type: 'sphere',
    size: 2
});

// 初始化场景
const initScene = async () => {
    scene = new Scene(containerRef.value, {
        renderer: {
            antialias: true,
            outputColorSpace: 'srgb'
        },
        camera: {
            fov: 45,
            position: [10, 10, 10],
            lookAt: [0, 0, 0]
        }
    });

    // 初始化场景
    scene.init();

    // 添加光源
    scene.light.addAmbient({
        color: '#ffffff',
        intensity: 0.5
    });

    scene.light.addDirectional({
        color: '#ffffff',
        intensity: 0.8,
        position: [10, 10, 5],
        castShadow: false
    });

    // 启用自动调整大小
    scene.renderer.enableResize();

    // 注册组件
    scene.registerComponent('ModelLoader', ModelLoader);
    scene.registerComponent('BVHQuery', BVHQuery);

    // 加载模型
    await loadModel();

    // 创建辅助对象
    createHelpers();

    // 添加事件监听
    addEventListeners();

    // 启动渲染循环
    scene.start();

    // 更新 FPS
    setInterval(() => {
        fps.value = Math.round(scene.stats?.fps || 0);
    }, 100);
};

// 加载模型
const loadModel = async () => {
    try {
        addLog('Loading model...');

        const modelLoader = await scene.add('ModelLoader', {
            url: '/models/kache.glb',
            scale: 1,
            position: [0, 0, 0],
            castShadow: false,
            receiveShadow: false
        });

        // 监听加载进度
        modelLoader.on('loadProgress', (event) => {
            addLog(`Loading: ${Math.round(event.progress * 100)}%`);
        });

        // 监听加载完成
        modelLoader.on('loadComplete', async (event) => {
            const modelGroup = modelLoader.model;
            addLog('Model loaded successfully');

            // 从模型组中查找第一个 Mesh 对象
            let foundMesh = null;
            modelGroup.traverse((child) => {
                if (child.isMesh && !foundMesh) {
                    foundMesh = child;
                }
            });

            if (!foundMesh) {
                addLog('Error: No mesh found in model');
                console.error('No mesh found in loaded model');
                return;
            }

            targetMesh = foundMesh;
            addLog(`Found mesh: ${targetMesh.name || 'unnamed'}`);
            console.log('Target mesh:', targetMesh);
            console.log('Geometry:', targetMesh.geometry);
            console.log('Geometry type:', targetMesh.geometry.type);
            console.log('Vertices:', targetMesh.geometry.attributes.position?.count);

            // 创建 BVHQuery 组件
            try {
                bvhQuery = await scene.add('BVHQuery', {
                    mesh: targetMesh,
                    bvhOptions: {
                        strategy: bvhConfig.strategy,
                        maxDepth: bvhConfig.maxDepth,
                        maxLeafTris: bvhConfig.maxLeafTris
                    },
                    showHelper: showHelper.value,
                    helperOptions: {
                        depth: helperDepth.value,
                        color: 0x00ff88,
                        opacity: 0.3,
                        displayEdges: true
                    }
                });

                // 监听 BVH 事件
                bvhQuery.on('bvhGenerated', (data) => {
                    addLog(`BVH generated in ${data.buildTime.toFixed(2)}ms`);
                    bvhStats.value = data.stats;
                    console.log('BVH stats:', data.stats);
                });

                bvhQuery.on('queryComplete', (data) => {
                    bvhStats.value = bvhQuery.getStats();
                });

                bvhQuery.on('error', (data) => {
                    addLog(`BVH Error: ${data.error.message}`);
                    console.error('BVH Error:', data);
                });

                addLog('BVH Query component initialized');
            } catch (error) {
                addLog(`Failed to create BVHQuery: ${error.message}`);
                console.error('Failed to create BVHQuery:', error);
            }
        });

        // 监听加载错误
        modelLoader.on('loadError', (event) => {
            console.error('Failed to load model:', event.error);
            addLog(`Error: ${event.error.message}`);
        });
    } catch (error) {
        console.error('Failed to load model:', error);
        addLog(`Error: ${error.message}`);
    }
};

// 创建辅助对象
const createHelpers = () => {
    // 射线投射器
    raycaster = new THREE.Raycaster();

    // 交点标记
    const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    hitMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    hitMarker.visible = false;
    scene.scene.add(hitMarker);

    // 法线辅助器
    normalHelper = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        1,
        0x00ff00,
        0.2,
        0.1
    );
    normalHelper.visible = false;
    scene.scene.add(normalHelper);

    // 最近点标记
    const nearestGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const nearestMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    nearestMarker = new THREE.Mesh(nearestGeometry, nearestMaterial);
    nearestMarker.visible = false;
    scene.scene.add(nearestMarker);

    // 最近点连线
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
    nearestLine = new THREE.Line(lineGeometry, lineMaterial);
    nearestLine.visible = false;
    scene.scene.add(nearestLine);

    // 碰撞检测对象
    createCollisionObject();
};

// 创建碰撞检测对象
const createCollisionObject = () => {
    if (collisionObject) {
        scene.scene.remove(collisionObject);
    }

    let geometry;
    if (collisionConfig.type === 'sphere') {
        geometry = new THREE.SphereGeometry(collisionConfig.size, 32, 32);
    } else {
        geometry = new THREE.BoxGeometry(
            collisionConfig.size,
            collisionConfig.size,
            collisionConfig.size
        );
    }

    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3,
        wireframe: true
    });

    collisionObject = new THREE.Mesh(geometry, material);
    collisionObject.visible = false;
    scene.scene.add(collisionObject);
};

// 添加事件监听
const addEventListeners = () => {
    containerRef.value.addEventListener('mousemove', onMouseMove);
    containerRef.value.addEventListener('click', onClick);
};

// 移除事件监听
const removeEventListeners = () => {
    if (containerRef.value) {
        containerRef.value.removeEventListener('mousemove', onMouseMove);
        containerRef.value.removeEventListener('click', onClick);
    }
};

// 鼠标移动事件
const onMouseMove = (event) => {
    if (!bvhQuery) return;

    const rect = containerRef.value.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    if (currentMode.value === 'raycast') {
        handleRaycast();
    } else if (currentMode.value === 'nearest') {
        handleNearest();
    } else if (currentMode.value === 'collision') {
        handleCollision();
    }
};

// 鼠标点击事件
const onClick = (event) => {
    if (currentMode.value === 'raycast') {
        addLog(
            `Raycast hit at (${hitMarker.position.x.toFixed(2)}, ${hitMarker.position.y.toFixed(
                2
            )}, ${hitMarker.position.z.toFixed(2)})`
        );
    }
};

// 处理射线投射
const handleRaycast = () => {
    raycaster.setFromCamera(mouse, scene.camera.instance);

    const hit = bvhQuery.raycast(raycaster.ray, {
        firstHitOnly: raycastConfig.firstHitOnly,
        side: THREE.FrontSide
    });

    if (hit) {
        hitMarker.position.copy(hit.point);
        hitMarker.visible = true;

        if (raycastConfig.showNormal && hit.face) {
            normalHelper.position.copy(hit.point);
            normalHelper.setDirection(hit.face.normal);
            normalHelper.visible = true;
        } else {
            normalHelper.visible = false;
        }
    } else {
        hitMarker.visible = false;
        normalHelper.visible = false;
    }
};

// 处理最近点查询
const handleNearest = () => {
    raycaster.setFromCamera(mouse, scene.camera.instance);

    // 获取射线上的一个点作为查询点
    const queryPoint = raycaster.ray.origin
        .clone()
        .add(raycaster.ray.direction.clone().multiplyScalar(10));

    const result = bvhQuery.closestPointToPoint(queryPoint);

    if (result) {
        if (nearestConfig.showPoint) {
            nearestMarker.position.copy(result.point);
            nearestMarker.visible = true;
        } else {
            nearestMarker.visible = false;
        }

        if (nearestConfig.showLine) {
            const positions = nearestLine.geometry.attributes.position.array;
            positions[0] = queryPoint.x;
            positions[1] = queryPoint.y;
            positions[2] = queryPoint.z;
            positions[3] = result.point.x;
            positions[4] = result.point.y;
            positions[5] = result.point.z;
            nearestLine.geometry.attributes.position.needsUpdate = true;
            nearestLine.visible = true;
        } else {
            nearestLine.visible = false;
        }
    } else {
        nearestMarker.visible = false;
        nearestLine.visible = false;
    }
};

// 处理碰撞检测
const handleCollision = () => {
    raycaster.setFromCamera(mouse, scene.camera.instance);

    // 获取射线上的一个点作为碰撞对象位置
    const position = raycaster.ray.origin
        .clone()
        .add(raycaster.ray.direction.clone().multiplyScalar(10));

    collisionObject.position.copy(position);
    collisionObject.visible = true;

    let intersects = false;

    if (collisionConfig.type === 'sphere') {
        const sphere = new THREE.Sphere(position, collisionConfig.size);
        intersects = bvhQuery.intersectsSphere(sphere);
    } else {
        const box = new THREE.Box3().setFromCenterAndSize(
            position,
            new THREE.Vector3(collisionConfig.size, collisionConfig.size, collisionConfig.size)
        );
        intersects = bvhQuery.intersectsBox(box);
    }

    // 根据碰撞结果改变颜色
    collisionObject.material.color.setHex(intersects ? 0xff0000 : 0x00ff00);
};

// 模式切换
const onModeChange = () => {
    // 隐藏所有辅助对象
    hitMarker.visible = false;
    normalHelper.visible = false;
    nearestMarker.visible = false;
    nearestLine.visible = false;
    collisionObject.visible = false;

    addLog(`Mode changed to: ${currentMode.value}`);
};

// 重建 BVH
const rebuildBVH = async () => {
    if (!bvhQuery) return;

    addLog('Rebuilding BVH...');

    await bvhQuery.rebuild({
        strategy: bvhConfig.strategy,
        maxDepth: bvhConfig.maxDepth,
        maxLeafTris: bvhConfig.maxLeafTris
    });
};

// 切换 BVH 辅助器
const toggleBVHHelper = () => {
    if (!bvhQuery) return;

    bvhQuery.toggleHelper(showHelper.value);
};

// 更新辅助器深度
const updateHelperDepth = () => {
    if (!bvhQuery) return;

    bvhQuery.updateHelper({ depth: helperDepth.value });
};

// 添加日志
const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    eventLogs.value.unshift({ time, message });

    // 限制日志数量
    if (eventLogs.value.length > 50) {
        eventLogs.value.pop();
    }
};

// 生命周期钩子
onMounted(() => {
    initScene();
});

onUnmounted(() => {
    removeEventListeners();
    if (scene) {
        scene.destroy();
    }
});
</script>

<style scoped>
.bvh-query-demo {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.scene-container {
    width: 100%;
    height: 100%;
}

.control-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 320px;
    max-height: calc(100vh - 40px);
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: 20px;
    border-radius: 8px;
    overflow-y: auto;
    font-size: 14px;
    backdrop-filter: blur(10px);
}

.control-panel h3 {
    margin: 0 0 20px 0;
    font-size: 18px;
    color: #00ff88;
    border-bottom: 2px solid #00ff88;
    padding-bottom: 10px;
}

.control-panel h4 {
    margin: 15px 0 10px 0;
    font-size: 15px;
    color: #00ccff;
}

.section {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section:last-child {
    border-bottom: none;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    color: #ccc;
    font-size: 13px;
}

.form-group input[type='range'] {
    width: 100%;
    margin-top: 5px;
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
    color: #fff;
    font-size: 13px;
}

.form-group select:focus {
    outline: none;
    border-color: #00ff88;
}

.stats {
    background: rgba(0, 255, 136, 0.05);
    padding: 15px;
    border-radius: 6px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
}

.stat-item span:first-child {
    color: #aaa;
}

.stat-item span:last-child {
    color: #00ff88;
    font-weight: bold;
}

.event-log {
    background: rgba(0, 0, 0, 0.3);
    padding: 15px;
    border-radius: 6px;
}

.log-container {
    max-height: 200px;
    overflow-y: auto;
    font-size: 12px;
    font-family: 'Courier New', monospace;
}

.log-item {
    margin-bottom: 6px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
    border-left: 2px solid #00ff88;
}

.log-time {
    color: #888;
    margin-right: 10px;
}

.log-message {
    color: #fff;
}

.info-panel {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: 15px 20px;
    border-radius: 8px;
    font-size: 14px;
    max-width: 400px;
    backdrop-filter: blur(10px);
    border-left: 4px solid #00ff88;
}

/* 滚动条样式 */
.control-panel::-webkit-scrollbar,
.log-container::-webkit-scrollbar {
    width: 6px;
}

.control-panel::-webkit-scrollbar-track,
.log-container::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb,
.log-container::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 136, 0.5);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover,
.log-container::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 136, 0.7);
}
</style>
