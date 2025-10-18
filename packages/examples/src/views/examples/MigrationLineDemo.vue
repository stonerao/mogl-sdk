<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="MigrationLine - Migration Line Animation Component"
        :sceneOnly="isSceneOnly"
    >
        <!-- 3D Scene Container -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- Control Panel -->
        <GuiPanel title="Migration Line Controls" width="wide">
            <!-- Global Configuration -->
            <GuiSection title="Global Configuration">
                <GuiColorPicker
                    label="Color"
                    v-model="globalConfig.color"
                    @update:modelValue="updateGlobalConfig"
                />

                <GuiSlider
                    label="Duration"
                    v-model="globalConfig.duration"
                    :min="1000"
                    :max="10000"
                    :step="100"
                    suffix="ms"
                    @update:modelValue="updateGlobalConfig"
                />

                <GuiSlider
                    label="Speed"
                    v-model="globalConfig.speed"
                    :min="0.1"
                    :max="3"
                    :step="0.1"
                    :precision="1"
                    @update:modelValue="updateGlobalConfig"
                />

                <GuiCheckbox
                    label="Loop Playback"
                    v-model="globalConfig.loop"
                    @update:modelValue="updateGlobalConfig"
                />

                <GuiSlider
                    label="Glow Intensity"
                    v-model="globalConfig.glowIntensity"
                    :min="0"
                    :max="3"
                    :step="0.1"
                    :precision="1"
                    @update:modelValue="updateGlobalConfig"
                />

                <GuiSlider
                    label="Flow Speed"
                    v-model="globalConfig.flowSpeed"
                    :min="0.1"
                    :max="3"
                    :step="0.1"
                    :precision="1"
                    @update:modelValue="updateGlobalConfig"
                />
            </GuiSection>

            <!-- Area Block Configuration -->
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

                <GuiCheckbox label="Show Wall" v-model="areaConfig.showWall" />

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

                <div class="button-group">
                    <GuiButton label="Add Area Block" @click="addRandomArea" />
                    <GuiButton
                        label="Clear All Area Blocks"
                        variant="secondary"
                        @click="clearAllAreas"
                    />
                </div>

                <!-- Area Block List -->
                <template v-if="areaList.length > 0">
                    <div class="area-list">
                        <div v-for="area in areaList" :key="area.id" class="area-item">
                            <span class="area-name">{{ area.userData?.name || area.id }}</span>
                            <GuiButton label="Delete" size="small" @click="removeArea(area.id)" />
                        </div>
                    </div>
                </template>
            </GuiSection>

            <!-- Animation Control -->
            <GuiSection title="Animation Control">
                <div class="button-group">
                    <GuiButton label="Play All" @click="startAll" />
                    <GuiButton label="Pause All" variant="secondary" @click="pauseAll" />
                    <GuiButton label="Stop All" variant="secondary" @click="stopAll" />
                    <GuiButton label="Clear All" variant="secondary" @click="clearAll" />
                </div>
            </GuiSection>

            <!-- Add Migration Line -->
            <GuiSection title="Add Migration Line">
                <GuiSelect
                    label="Path Type"
                    v-model="newLinePathType"
                    :options="[
                        { value: 'simple', label: 'Simple Path (A→B)' },
                        { value: 'multi', label: 'Multi-segment Path (A→B→C)' },
                        { value: 'curve', label: 'Curve Path' }
                    ]"
                />
                <GuiButton label="Add Random Migration Line" @click="addRandomLine" />
            </GuiSection>

            <!-- Performance Statistics -->
            <GuiSection title="Performance Statistics">
                <GuiInfoItem label="FPS" :value="fps" />
                <GuiInfoItem label="Migration Line Count" :value="lineCount" />
                <GuiInfoItem label="Area Block Count" :value="areaCount" />
                <GuiInfoItem label="Playing" :value="playingCount" />
            </GuiSection>

            <!-- Event Log -->
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

// Detect if in sceneOnly mode
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

// Global configuration (Shader type only)
const globalConfig = reactive({
    color: '#00ff00',
    duration: 3000,
    speed: 1,
    loop: true,
    // Shader-specific configuration
    glowIntensity: 1.5,
    flowSpeed: 1.0
});

// Area block configuration
const areaConfig = reactive({
    color: '#00ff00',
    wallHeight: 5,
    wallOpacity: 0.5,
    borderWidth: 2,
    animationSpeed: 1.0,
    showWall: true
});

// Source code display
const sourceCode = `import { Scene } from '@w3d/core';
import { MigrationLine, GridHelper } from '@w3d/components';

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

// Add lighting
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
scene.registerComponent('MigrationLine', MigrationLine);
scene.registerComponent('GridHelper', GridHelper);

// Add grid
await scene.add('GridHelper', {
  name: 'grid',
  size: 40,
  divisions: 40
});

// Add migration line
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

// Listen for events
migrationLines.on('start', (data) => {
  console.log('Animation started:', data.lineId);
});

migrationLines.on('complete', (data) => {
  console.log('Animation completed:', data.lineId);
});

migrationLines.on('update', (data) => {
  console.log('Progress:', data.progress);
});`;

// Add event log
const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    eventLogs.value.unshift(`[${timestamp}] ${message}`);
    if (eventLogs.value.length > 10) {
        eventLogs.value.pop();
    }
};

// Initialize scene
const initScene = async () => {
    if (!sceneContainer.value) return;

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

        // Expose to window object for debugging
        window.__w3d_scene__ = scene;

        // Add lighting
        scene.light.addAmbient({
            color: '#ffffff',
            intensity: 0.6
        });

        scene.light.addDirectional({
            color: '#ffffff',
            intensity: 0.8,
            position: [10, 10, 5]
        });

        // Enable auto-resize
        scene.renderer.enableResize();

        // Register components
        scene.registerComponent('MigrationLine', MigrationLine);
        scene.registerComponent('GridHelper', GridHelper);

        // Add grid helper
        await scene.add('GridHelper', {
            name: 'grid',
            size: 40,
            divisions: 40,
            color: '#888888'
        });

        // Add some reference cubes
        createReferenceCubes();

        // Create migration line component
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
                    userData: { name: 'Example Line 1' }
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
                    userData: { name: 'Example Line 2' }
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
                    userData: { name: 'Example Line 3' }
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
                    userData: { name: 'Example Area 1' }
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
                    userData: { name: 'Example Area 2' }
                }
            ]
        });

        // Expose to window object for debugging
        window.__w3d_migrationLine__ = migrationLineComponent;

        // Listen for events
        migrationLineComponent.on('start', (data) => {
            addLog(`Started: ${data.lineId}`);
        });

        migrationLineComponent.on('complete', (data) => {
            addLog(`Completed: ${data.lineId}`);
        });

        migrationLineComponent.on('loop', (data) => {
            addLog(`Loop: ${data.lineId}`);
        });

        // Area block events
        migrationLineComponent.on('areaAdded', (data) => {
            addLog(`Area block added: ${data.areaId}`);
            updateAreaList();
        });

        migrationLineComponent.on('areaRemoved', (data) => {
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

// Create reference cubes
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

// Start FPS monitoring
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

// Update statistics
const updateStats = () => {
    if (!migrationLineComponent) return;

    lineCount.value = migrationLineComponent.getAllLines().length;
    areaCount.value = migrationLineComponent.getAllAreas().length;

    let playing = 0;
    migrationLineComponent.animationStates.forEach((state) => {
        if (state.isPlaying) playing++;
    });
    playingCount.value = playing;

    // Update area block list
    updateAreaList();
};

// Update global configuration
const updateGlobalConfig = async () => {
    if (!migrationLineComponent) return;

    // Update all lines
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

    addLog('Global configuration updated');
};

// Add random migration line
const addRandomLine = async () => {
    if (!migrationLineComponent) return;

    lineCounter++;
    const newId = `line-${Date.now()}-${lineCounter}`;

    // Generate random path
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

    // Random color
    const colors = ['#00ff00', '#ff0000', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    await migrationLineComponent.addLine({
        id: newId,
        points: points,
        color: randomColor,
        userData: { name: `Random Line ${lineCounter}` }
    });

    addLog(`Migration line added: ${newId}`);
    updateStats();
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
    if (!migrationLineComponent) return;

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

    await migrationLineComponent.addArea({
        id: newId,
        points: points,
        color: areaConfig.color || randomColor,
        wallHeight: areaConfig.wallHeight,
        wallOpacity: areaConfig.wallOpacity,
        borderWidth: areaConfig.borderWidth,
        animationSpeed: areaConfig.animationSpeed,
        showWall: areaConfig.showWall,
        userData: { name: `Area Block ${areaCounter}` }
    });

    addLog(`Area block added: ${newId}`);
    updateStats();
};

// Remove area block
const removeArea = async (areaId) => {
    if (!migrationLineComponent) return;

    migrationLineComponent.removeArea(areaId);
    addLog(`Area block removed: ${areaId}`);
    updateStats();
};

// Clear all area blocks
const clearAllAreas = () => {
    if (!migrationLineComponent) return;

    migrationLineComponent.clearAreas();
    addLog('All area blocks cleared');
    updateStats();
};

// Update area block list
const updateAreaList = () => {
    if (!migrationLineComponent) return;

    const areas = migrationLineComponent.getAllAreas();
    areaList.value = areas;
    areaCount.value = areas.length;
};

// Control buttons
const startAll = () => {
    if (migrationLineComponent) {
        migrationLineComponent.startAll();
        addLog('Play all');
        updateStats();
    }
};

const pauseAll = () => {
    if (migrationLineComponent) {
        migrationLineComponent.pauseAll();
        addLog('Pause all');
        updateStats();
    }
};

const stopAll = () => {
    if (migrationLineComponent) {
        migrationLineComponent.stopAll();
        addLog('Stop all');
        updateStats();
    }
};

const clearAll = () => {
    if (migrationLineComponent) {
        migrationLineComponent.clearLines();
        addLog('Clear all');
        updateStats();
    }
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
