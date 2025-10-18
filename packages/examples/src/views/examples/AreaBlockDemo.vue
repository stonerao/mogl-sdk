<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="AreaBlock - Area Block Component"
        :sceneOnly="isSceneOnly"
    >
        <div ref="sceneContainer" class="scene-container"></div>

        <GuiPanel title="Area Block Control">
            <GuiSection title="Area Block Configuration">
                <GuiColorPicker label="Area Color" v-model="areaConfig.color" />
                <GuiSlider
                    label="Wall Height"
                    v-model="areaConfig.wallHeight"
                    :min="1"
                    :max="20"
                    :step="1"
                />
                <GuiSlider
                    label="Wall Opacity"
                    v-model="areaConfig.wallOpacity"
                    :min="0.1"
                    :max="1"
                    :step="0.05"
                    :precision="2"
                />
                <GuiSlider
                    label="Bottom Opacity"
                    v-model="areaConfig.bottomOpacity"
                    :min="0.1"
                    :max="1"
                    :step="0.05"
                    :precision="2"
                />
                <GuiSlider
                    label="Border Width"
                    v-model="areaConfig.borderWidth"
                    :min="1"
                    :max="10"
                    :step="1"
                />
                <GuiSlider
                    label="Animation Speed"
                    v-model="areaConfig.animationSpeed"
                    :min="0.1"
                    :max="3"
                    :step="0.1"
                    :precision="1"
                />
                <GuiSelect
                    label="Display Mode"
                    v-model="displayMode"
                    :options="[
                        { value: 'all', label: 'Wall + Bottom' },
                        { value: 'wall', label: 'Wall Only' },
                        { value: 'bottom', label: 'Bottom Only' },
                        { value: 'border', label: 'Border Only' }
                    ]"
                />
                <GuiSelect
                    label="Shape Type"
                    v-model="areaShapeType"
                    :options="[
                        { value: 'square', label: 'Square' },
                        { value: 'triangle', label: 'Triangle' },
                        { value: 'hexagon', label: 'Hexagon' },
                        { value: 'random', label: 'Random Polygon' }
                    ]"
                />
                <GuiButton label="Add Area Block" block @click="addRandomArea" />
                <GuiButton
                    label="Clear All Area Blocks"
                    variant="danger"
                    block
                    @click="clearAllAreas"
                />

                <div v-if="areaList.length > 0" class="area-list">
                    <h5 class="list-title">Area Block List ({{ areaList.length }})</h5>
                    <div v-for="area in areaList" :key="area.id" class="area-item">
                        <span class="area-name">{{ area.userData?.name || area.id }}</span>
                        <GuiButton
                            label="Delete"
                            variant="danger"
                            size="small"
                            @click="removeArea(area.id)"
                        />
                    </div>
                </div>
            </GuiSection>

            <GuiSection title="Performance Statistics">
                <GuiInfoItem label="FPS:" :value="fps" />
                <GuiInfoItem label="Area Block Count:" :value="areaCount" />
            </GuiSection>

            <GuiSection title="Event Log">
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
import { useSceneOnly } from '../../composables/useSceneOnly';

// Detect if in sceneOnly mode
const isSceneOnly = useSceneOnly();

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

// Area block configuration
const areaConfig = reactive({
    color: '#00ff00',
    wallHeight: 5,
    wallOpacity: 0.5,
    bottomOpacity: 0.5,
    borderWidth: 2,
    animationSpeed: 1.0
});

// Calculate display parameters based on display mode
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

// Source code display
const sourceCode = `import { Scene } from '@w3d/core';
import { AreaBlock, GridHelper } from '@w3d/components';

// Create scene
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

// Add lights
scene.light.addAmbient({
  color: '#ffffff',
  intensity: 0.6
});

scene.light.addDirectional({
  color: '#ffffff',
  intensity: 0.8,
  position: [10, 10, 5]
});

// Register components
scene.registerComponent('AreaBlock', AreaBlock);
scene.registerComponent('GridHelper', GridHelper);

// Add grid
await scene.add('GridHelper', {
  name: 'grid',
  size: 40,
  divisions: 40
});

// Add area block component
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

// Listen to events
areaBlock.on('areaAdded', (data) => {
  console.log('Area block added:', data.areaId);
});

areaBlock.on('areaRemoved', (data) => {
  console.log('Area block removed:', data.areaId);
});

// Add new area block
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

// Remove area block
areaBlock.removeArea('area1');`;

// Add log
const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    eventLogs.value.unshift(`[${timestamp}] ${message}`);
    if (eventLogs.value.length > 10) {
        eventLogs.value.pop();
    }
};

// Initialize scene
const initScene = async () => {
    try {
        // Create scene
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

        // Add lights
        scene.light.addAmbient({
            color: '#ffffff',
            intensity: 0.6
        });

        scene.light.addDirectional({
            color: '#ffffff',
            intensity: 0.8,
            position: [10, 10, 5]
        });

        // Enable auto resize
        scene.renderer.enableResize();

        // Register components
        scene.registerComponent('GridHelper', GridHelper);
        scene.registerComponent('AreaBlock', AreaBlock);

        // Add grid helper
        await scene.add('GridHelper', {
            name: 'grid',
            size: 40,
            divisions: 40,
            color: '#888888'
        });

        // Register AreaBlock component

        // Create area block component
        areaBlockComponent = await scene.add('AreaBlock', {
            name: 'area-blocks',
            areas: [
                // Example 1: Wall + Bottom
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
                    userData: { name: 'Wall + Bottom' }
                },
                // Example 2: Wall Only
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
                    userData: { name: 'Wall Only' }
                },
                // Example 3: Bottom Only
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
                    userData: { name: 'Bottom Only' }
                },
                // Example 4: Border Only
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
                    userData: { name: 'Border Only' }
                }
            ]
        });

        // Expose to window object for debugging
        window.__w3d_areaBlock__ = areaBlockComponent;

        // Listen to events
        areaBlockComponent.on('areaAdded', (data) => {
            addLog(`Area block added: ${data.areaId}`);
            updateAreaList();
        });

        areaBlockComponent.on('areaRemoved', (data) => {
            addLog(`Area block removed: ${data.areaId}`);
            updateAreaList();
        });

        // Update statistics
        updateStats();

        // Start FPS monitoring
        startFPSMonitor();

        addLog('Scene initialization complete');
    } catch (error) {
        console.error('Scene initialization failed:', error);
        addLog(`Error: ${error.message}`);
    }
};

// FPS Monitoring
const updateFPS = () => {
    if (scene && scene.renderer && scene.renderer.renderer) {
        const info = scene.renderer.renderer.info;
        fps.value = Math.round(1000 / (info.render.frame || 16));
    }
};

const startFPSMonitor = () => {
    fpsUpdateInterval = setInterval(updateFPS, 100);
};

// Update statistics
const updateStats = () => {
    if (!areaBlockComponent) return;

    areaCount.value = areaBlockComponent.getAllAreas().length;

    // Update area block list
    updateAreaList();
};

// Update area block list
const updateAreaList = () => {
    if (!areaBlockComponent) return;

    const areas = areaBlockComponent.getAllAreas();
    areaList.value = areas;
    areaCount.value = areas.length;
};

// Generate area block points
const generateAreaPoints = (shapeType, centerX, centerZ, size) => {
    const points = [];

    switch (shapeType) {
        case 'square':
            // Square
            points.push(
                { x: centerX - size / 2, y: 0, z: centerZ - size / 2 },
                { x: centerX + size / 2, y: 0, z: centerZ - size / 2 },
                { x: centerX + size / 2, y: 0, z: centerZ + size / 2 },
                { x: centerX - size / 2, y: 0, z: centerZ + size / 2 }
            );
            break;

        case 'triangle':
            // Equilateral triangle
            const height = (size * Math.sqrt(3)) / 2;
            points.push(
                { x: centerX, y: 0, z: centerZ - height / 2 },
                { x: centerX + size / 2, y: 0, z: centerZ + height / 2 },
                { x: centerX - size / 2, y: 0, z: centerZ + height / 2 }
            );
            break;

        case 'hexagon':
            // Hexagon
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
            // Random polygon (5-8 points)
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

// Add random area block
const addRandomArea = async () => {
    if (!areaBlockComponent) return;

    areaCounter++;
    const newId = `area-${Date.now()}-${areaCounter}`;

    // Random position and size
    const range = 12;
    const centerX = (Math.random() - 0.5) * range * 2;
    const centerZ = (Math.random() - 0.5) * range * 2;
    const size = 5 + Math.random() * 10;

    // Generate points
    const points = generateAreaPoints(areaShapeType.value, centerX, centerZ, size);

    // Random color
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
        userData: { name: `Area Block ${areaCounter}` }
    });

    addLog(`Area block added: ${newId}`);
    updateStats();
};

// Remove area block
const removeArea = async (areaId) => {
    if (!areaBlockComponent) return;

    areaBlockComponent.removeArea(areaId);
    addLog(`Area block removed: ${areaId}`);
    updateStats();
};

// Clear all area blocks
const clearAllAreas = () => {
    if (!areaBlockComponent) return;

    areaBlockComponent.clearAreas();
    addLog('All area blocks cleared');
    updateStats();
};

// Component mounted
onMounted(() => {
    initScene();
});

// Component unmounted
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
