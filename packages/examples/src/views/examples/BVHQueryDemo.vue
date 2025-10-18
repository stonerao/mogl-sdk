<template>
    <div class="bvh-query-demo">
        <!-- 3D Scene Container -->
        <div ref="containerRef" class="scene-container"></div>

        <!-- Control Panel -->
        <GuiPanel :title="t('bvhQuery.title')" width="wide">
            <!-- Mode Selection -->
            <GuiSelect
                :label="t('bvhQuery.mode')"
                v-model="currentMode"
                :options="[
                    { value: 'raycast', label: t('bvhQuery.modes.raycast') },
                    { value: 'nearest', label: t('bvhQuery.modes.nearest') },
                    { value: 'collision', label: t('bvhQuery.modes.collision') },
                    { value: 'voxel', label: t('bvhQuery.modes.voxel') }
                ]"
                @update:modelValue="onModeChange"
            />

            <!-- BVH Configuration -->
            <GuiSection :title="t('bvhQuery.bvhConfig')">
                <GuiSelect
                    :label="t('bvhQuery.strategy')"
                    v-model="bvhConfig.strategy"
                    :options="[
                        { value: 'CENTER', label: 'CENTER' },
                        { value: 'AVERAGE', label: 'AVERAGE' },
                        { value: 'SAH', label: 'SAH' }
                    ]"
                    @update:modelValue="rebuildBVH"
                />

                <GuiSlider
                    :label="`${t('bvhQuery.maxDepth')}`"
                    v-model="bvhConfig.maxDepth"
                    :min="10"
                    :max="50"
                    :step="1"
                    @update:modelValue="rebuildBVH"
                />

                <GuiSlider
                    :label="`${t('bvhQuery.maxLeafTris')}`"
                    v-model="bvhConfig.maxLeafTris"
                    :min="5"
                    :max="20"
                    :step="1"
                    @update:modelValue="rebuildBVH"
                />

                <GuiCheckbox
                    :label="t('bvhQuery.showHelper')"
                    v-model="showHelper"
                    @update:modelValue="toggleBVHHelper"
                />

                <GuiSlider
                    v-if="showHelper"
                    :label="`${t('bvhQuery.helperDepth')}`"
                    v-model="helperDepth"
                    :min="1"
                    :max="20"
                    :step="1"
                    @update:modelValue="updateHelperDepth"
                />
            </GuiSection>

            <!-- Raycast Mode Configuration -->
            <template v-if="currentMode === 'raycast'">
                <GuiSection :title="t('bvhQuery.raycastConfig')">
                    <GuiCheckbox
                        :label="t('bvhQuery.firstHitOnly')"
                        v-model="raycastConfig.firstHitOnly"
                    />
                    <GuiCheckbox
                        :label="t('bvhQuery.showNormal')"
                        v-model="raycastConfig.showNormal"
                    />
                </GuiSection>
            </template>

            <!-- Nearest Point Mode Configuration -->
            <template v-if="currentMode === 'nearest'">
                <GuiSection :title="t('bvhQuery.nearestConfig')">
                    <GuiCheckbox :label="t('bvhQuery.showLine')" v-model="nearestConfig.showLine" />
                    <GuiCheckbox
                        :label="t('bvhQuery.showPoint')"
                        v-model="nearestConfig.showPoint"
                    />
                </GuiSection>
            </template>

            <!-- Collision Detection Mode Configuration -->
            <template v-if="currentMode === 'collision'">
                <GuiSection :title="t('bvhQuery.collisionConfig')">
                    <GuiSelect
                        :label="t('bvhQuery.collisionType')"
                        v-model="collisionConfig.type"
                        :options="[
                            { value: 'sphere', label: t('bvhQuery.sphere') },
                            { value: 'box', label: t('bvhQuery.box') }
                        ]"
                    />
                    <GuiSlider
                        :label="`${t('bvhQuery.size')}`"
                        v-model="collisionConfig.size"
                        :min="0.5"
                        :max="5"
                        :step="0.1"
                    />
                </GuiSection>
            </template>

            <!-- Statistics Information -->
            <GuiSection :title="t('stats.title')">
                <GuiInfoItem :label="`${t('stats.fps')}`" :value="fps" />
                <template v-if="bvhStats">
                    <GuiInfoItem
                        :label="`${t('bvhQuery.nodeCount')}`"
                        :value="bvhStats.nodeCount"
                    />
                    <GuiInfoItem
                        :label="`${t('bvhQuery.leafNodeCount')}`"
                        :value="bvhStats.leafNodeCount"
                    />
                    <GuiInfoItem
                        :label="`${t('bvhQuery.triangleCount')}`"
                        :value="Math.floor(bvhStats.triangleCount)"
                    />
                    <GuiInfoItem
                        :label="`${t('bvhQuery.lastQueryTime')}`"
                        :value="`${bvhStats.lastQueryTime.toFixed(3)}ms`"
                    />
                    <GuiInfoItem
                        :label="`${t('bvhQuery.totalQueries')}`"
                        :value="bvhStats.totalQueries"
                    />
                </template>
            </GuiSection>

            <!-- Event Log -->
            <GuiSection :title="t('bvhQuery.eventLog')">
                <div class="log-container">
                    <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
                        <span class="log-time">{{ log.time }}</span>
                        <span class="log-message">{{ log.message }}</span>
                    </div>
                </div>
            </GuiSection>
        </GuiPanel>

        <!-- Hint Information -->
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
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiCheckbox,
    GuiSelect,
    GuiInfoItem
} from '@/components/Gui';
import * as THREE from 'three';

const { t } = useLanguage();

// DOM References
const containerRef = ref(null);

// Scene Instance
let scene = null;
let bvhQuery = null;
let targetMesh = null;

// Helper Objects
let raycaster = null;
let mouse = new THREE.Vector2();
let hitMarker = null;
let normalHelper = null;
let nearestMarker = null;
let nearestLine = null;
let collisionObject = null;

// State
const currentMode = ref('raycast');
const showHelper = ref(false);
const helperDepth = ref(10);
const fps = ref(0);
const bvhStats = ref(null);
const eventLogs = ref([]);

// BVH Configuration
const bvhConfig = reactive({
    strategy: 'SAH',
    maxDepth: 40,
    maxLeafTris: 10
});

// Raycast Configuration
const raycastConfig = reactive({
    firstHitOnly: true,
    showNormal: true
});

// Nearest Point Configuration
const nearestConfig = reactive({
    showLine: true,
    showPoint: true
});

// Collision Detection Configuration
const collisionConfig = reactive({
    type: 'sphere',
    size: 2
});

// Initialize Scene
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

    // Initialize scene
    scene.init();

    // Add lights
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

    // Enable auto resize
    scene.renderer.enableResize();

    // Register components
    scene.registerComponent('ModelLoader', ModelLoader);
    scene.registerComponent('BVHQuery', BVHQuery);

    // Load model
    await loadModel();

    // Create helper objects
    createHelpers();

    // Add event listeners
    addEventListeners();

    // Start render loop
    scene.start();

    // Update FPS
    setInterval(() => {
        fps.value = Math.round(scene.stats?.fps || 0);
    }, 100);
};

// Load Model
const loadModel = async () => {
    try {
        addLog('Loading model...');

        const modelLoader = await scene.add('ModelLoader', {
            url: '/models/ShaderBall.glb',
            scale: 1,
            position: [0, 0, 0],
            castShadow: false,
            receiveShadow: false
        });

        // Listen to load progress
        modelLoader.on('loadProgress', (event) => {
            addLog(`Loading: ${Math.round(event.progress * 100)}%`);
        });

        // Listen to load complete
        modelLoader.on('loadComplete', async (event) => {
            const modelGroup = modelLoader.model;
            addLog('Model loaded successfully');

            // Find first Mesh object from model group
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

            // Create BVHQuery component
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

                // Listen to BVH events
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

        // Listen to load errors
        modelLoader.on('loadError', (event) => {
            console.error('Failed to load model:', event.error);
            addLog(`Error: ${event.error.message}`);
        });
    } catch (error) {
        console.error('Failed to load model:', error);
        addLog(`Error: ${error.message}`);
    }
};

// Create helper objects
const createHelpers = () => {
    // Raycaster
    raycaster = new THREE.Raycaster();

    // Hit marker
    const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    hitMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    hitMarker.visible = false;
    scene.scene.add(hitMarker);

    // Normal helper
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

    // Nearest point marker
    const nearestGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const nearestMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    nearestMarker = new THREE.Mesh(nearestGeometry, nearestMaterial);
    nearestMarker.visible = false;
    scene.scene.add(nearestMarker);

    // Nearest point line
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
    nearestLine = new THREE.Line(lineGeometry, lineMaterial);
    nearestLine.visible = false;
    scene.scene.add(nearestLine);

    // Collision detection object
    createCollisionObject();
};

// Create collision detection object
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

// Add event listeners
const addEventListeners = () => {
    containerRef.value.addEventListener('mousemove', onMouseMove);
    containerRef.value.addEventListener('click', onClick);
};

// Remove event listeners
const removeEventListeners = () => {
    if (containerRef.value) {
        containerRef.value.removeEventListener('mousemove', onMouseMove);
        containerRef.value.removeEventListener('click', onClick);
    }
};

// Mouse move event
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

// Mouse click event
const onClick = (event) => {
    if (currentMode.value === 'raycast') {
        addLog(
            `Raycast hit at (${hitMarker.position.x.toFixed(2)}, ${hitMarker.position.y.toFixed(
                2
            )}, ${hitMarker.position.z.toFixed(2)})`
        );
    }
};

// Handle raycast
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

// Handle nearest point query
const handleNearest = () => {
    raycaster.setFromCamera(mouse, scene.camera.instance);

    // Get a point on the ray as the query point
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

// Handle collision detection
const handleCollision = () => {
    raycaster.setFromCamera(mouse, scene.camera.instance);

    // Get a point on the ray as the collision object position
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

    // Change color based on collision result
    collisionObject.material.color.setHex(intersects ? 0xff0000 : 0x00ff00);
};

// Mode change
const onModeChange = () => {
    // Hide all helper objects
    hitMarker.visible = false;
    normalHelper.visible = false;
    nearestMarker.visible = false;
    nearestLine.visible = false;
    collisionObject.visible = false;

    addLog(`Mode changed to: ${currentMode.value}`);
};

// Rebuild BVH
const rebuildBVH = async () => {
    if (!bvhQuery) return;

    addLog('Rebuilding BVH...');

    await bvhQuery.rebuild({
        strategy: bvhConfig.strategy,
        maxDepth: bvhConfig.maxDepth,
        maxLeafTris: bvhConfig.maxLeafTris
    });
};

// Toggle BVH helper
const toggleBVHHelper = () => {
    if (!bvhQuery) return;

    bvhQuery.toggleHelper(showHelper.value);
};

// Update helper depth
const updateHelperDepth = () => {
    if (!bvhQuery) return;

    bvhQuery.updateHelper({ depth: helperDepth.value });
};

// Add log
const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    eventLogs.value.unshift({ time, message });

    // Limit log count
    if (eventLogs.value.length > 50) {
        eventLogs.value.pop();
    }
};

// Lifecycle hooks
onMounted(() => {
    initScene();
});

onUnmounted(() => {
    removeEventListeners();
});
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
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

.log-container {
    max-height: 200px;
    overflow-y: auto;
    .scrollbar-style();
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

/* Scrollbar style */
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
