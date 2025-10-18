<template>
    <SplitLayout
        :code="sourceCode || '// Loading...'"
        language="javascript"
        :title="'07 - Advanced Model Loader'"
        :sceneOnly="isSceneOnly"
    >
        <!-- 3D Scene Container -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- Loading State -->
        <GuiLoading v-if="isLoading" :progress="loadingProgress" :text="loadingText" />

        <!-- Control Panel -->
        <GuiPanel title="Model Controls" width="wide">
            <!-- Model Info -->
            <GuiSection title="Model Info">
                <GuiInfoItem label="Mesh Count" :value="meshCount || 0" />
                <GuiInfoItem label="Currently Selected" :value="selectedMeshName || 'None'" />
            </GuiSection>

            <!-- Mesh Selection -->
            <GuiSection title="Select Mesh">
                <GuiSelect
                    label="Mesh"
                    v-model="selectedMeshName"
                    :options="[
                        { value: '', label: 'Select Mesh' },
                        ...(meshNames || []).map((name) => ({ value: name, label: name }))
                    ]"
                    @update:modelValue="onMeshSelect"
                />
            </GuiSection>

            <!-- Transform Controls -->
            <template v-if="selectedMesh">
                <GuiSection title="Transform Controls">
                    <!-- Position Controls -->
                    <div class="transform-grid">
                        <GuiNumberInput
                            label="Position X"
                            v-model="meshTransform.position.x"
                            :step="0.1"
                            @update:modelValue="updateMeshTransform"
                        />
                        <GuiNumberInput
                            label="Position Y"
                            v-model="meshTransform.position.y"
                            :step="0.1"
                            @update:modelValue="updateMeshTransform"
                        />
                        <GuiNumberInput
                            label="Position Z"
                            v-model="meshTransform.position.z"
                            :step="0.1"
                            @update:modelValue="updateMeshTransform"
                        />
                    </div>

                    <!-- Rotation Controls -->
                    <div class="transform-grid">
                        <GuiNumberInput
                            label="Rotation X"
                            v-model="meshTransform.rotation.x"
                            :step="0.1"
                            @update:modelValue="updateMeshTransform"
                        />
                        <GuiNumberInput
                            label="Rotation Y"
                            v-model="meshTransform.rotation.y"
                            :step="0.1"
                            @update:modelValue="updateMeshTransform"
                        />
                        <GuiNumberInput
                            label="Rotation Z"
                            v-model="meshTransform.rotation.z"
                            :step="0.1"
                            @update:modelValue="updateMeshTransform"
                        />
                    </div>

                    <!-- Scale Controls -->
                    <div class="transform-grid">
                        <GuiNumberInput
                            label="Scale X"
                            v-model="meshTransform.scale.x"
                            :step="0.1"
                            :min="0.1"
                            @update:modelValue="updateMeshTransform"
                        />
                        <GuiNumberInput
                            label="Scale Y"
                            v-model="meshTransform.scale.y"
                            :step="0.1"
                            :min="0.1"
                            @update:modelValue="updateMeshTransform"
                        />
                        <GuiNumberInput
                            label="Scale Z"
                            v-model="meshTransform.scale.z"
                            :step="0.1"
                            :min="0.1"
                            @update:modelValue="updateMeshTransform"
                        />
                    </div>

                    <GuiButton label="Reset Transform" @click="resetMeshTransform" />
                </GuiSection>
            </template>

            <!-- Interactive Configuration -->
            <GuiSection title="Interactive Configuration">
                <GuiSelect
                    label="Event Listening Mode"
                    v-model="interactiveMode"
                    :options="[
                        { value: 'disabled', label: 'Disable All Events' },
                        { value: 'all', label: 'Enable All Mesh Events' },
                        { value: 'selected', label: 'Selected Meshes Only' }
                    ]"
                    @update:modelValue="updateInteractiveMode"
                />

                <template v-if="interactiveMode === 'selected'">
                    <div class="mesh-selection">
                        <div v-for="meshName in availableMeshes || []" :key="meshName">
                            <GuiCheckbox
                                :label="meshName"
                                :modelValue="selectedInteractiveMeshes.includes(meshName)"
                                @update:modelValue="
                                    (val) => {
                                        if (val) {
                                            selectedInteractiveMeshes.push(meshName);
                                        } else {
                                            selectedInteractiveMeshes =
                                                selectedInteractiveMeshes.filter(
                                                    (m) => m !== meshName
                                                );
                                        }
                                        updateInteractiveMode();
                                    }
                                "
                            />
                        </div>
                    </div>
                </template>

                <GuiInfoItem label="Interactive Object Count" :value="currentInteractiveCount" />
                <template v-if="performanceWarning">
                    <div class="warning-text">⚠️ {{ performanceWarning }}</div>
                </template>
            </GuiSection>

            <!-- Event Log -->
            <GuiSection title="Event Log">
                <div class="event-log">
                    <div
                        v-for="(event, index) in eventLog || []"
                        :key="index"
                        class="event-item"
                        :class="`event-${event?.type || 'unknown'}`"
                    >
                        <span class="event-time">{{ event?.time || '' }}</span>
                        <span class="event-message">{{ event?.message || '' }}</span>
                    </div>
                </div>
                <GuiButton label="Clear Log" @click="clearEventLog" />
            </GuiSection>
        </GuiPanel>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { ModelLoader, HDRLoader } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiLoading,
    GuiInfoItem,
    GuiSelect,
    GuiNumberInput,
    GuiButton,
    GuiCheckbox
} from '@/components/Gui';
import SplitLayout from '../../components/SplitLayout.vue';
import { useSceneOnly } from '../../composables/useSceneOnly';

// Detect if in sceneOnly mode
const isSceneOnly = useSceneOnly();

const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('Initializing...');
const loadingProgress = ref(0);

// Model related state
const meshNames = ref([]);
const selectedMeshName = ref('');
const selectedMesh = ref(null);
const meshCount = computed(() => (meshNames.value || []).length);

// Mesh transform state
const meshTransform = reactive({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
});

// Event log
const eventLog = ref([]);

// Interactive configuration state
const interactiveMode = ref('all'); // 'disabled', 'all', 'selected'
const availableMeshes = ref([]);
const selectedInteractiveMeshes = ref([]);
const currentInteractiveCount = ref(0);
const performanceWarning = ref('');

let scene = null;
let modelComponent = null;
let hdrComponent = null;

// Source code display
const sourceCode = `import { Scene } from '@w3d/core';
import { ModelLoader, HDRLoader } from '@w3d/components';

// Create scene
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    outputColorSpace: 'srgb'
  },
  camera: {
    fov: 45,
    position: [10, 8, 15],
    lookAt: [0, 0, 0]
  }
});

// Initialize scene
scene.init();

// Register components
scene.registerComponent('ModelLoader', ModelLoader);
scene.registerComponent('HDRLoader', HDRLoader);

// Load HDR environment map
const hdr = await scene.add('HDRLoader', {
  name: 'environment',
  url: '/textures/blouberg_sunrise_2_1k.hdr',
  asEnvironment: true,
  asBackground: true
});

// Load GLB model (configure interactive events)
const model = await scene.add('ModelLoader', {
  name: 'overview',
  url: '/models/ShaderBall.glb',
  scale: 1,
  position: [0, 0, 0],
  castShadow: true,
  receiveShadow: true,

  // ===== Interactive Event Configuration (interactiveMeshes) =====
  // Controls which Meshes can respond to mouse events (click, hover, etc.)
  //
  // Configuration options:
  // 1. false (default) - Disable all events, best performance
  //    interactiveMeshes: false
  //
  // 2. '*' - Enable all Mesh events, significant performance impact
  //    Performance warning shown when Mesh count > 50
  //    interactiveMeshes: '*'
  //
  // 3. Array - Enable events only for specified Mesh names (recommended)
  //    interactiveMeshes: ['Building A', 'Building B', 'Parking Lot']

  interactiveMeshes: '*'  // For demo, use array in production
});

// ===== Other Configuration Mode Examples =====
//
// Example 1: Disable all events (default, best performance)
// const model1 = await scene.add('ModelLoader', {
//   url: '/models/building.glb',
//   interactiveMeshes: false  // Or omit this config
// });
//
// Example 2: Enable events only for specified Meshes (recommended)
// const model2 = await scene.add('ModelLoader', {
//   url: '/models/building.glb',
//   interactiveMeshes: ['Building A', 'Building B', 'Parking Lot']
// });
//
// Example 3: Enable events for all Meshes (use with caution)
// const model3 = await scene.add('ModelLoader', {
//   url: '/models/small-object.glb',
//   interactiveMeshes: '*'  // Performance warning when Mesh count > 50
// });

// Get all Mesh names
const meshNames = model.getMeshNames();
console.log('Available meshes:', meshNames);

// Find specific Mesh
const buildingMesh = model.getMeshByName('Building A');
if (buildingMesh) {
  // Set Mesh properties
  buildingMesh.position.set(2, 0, 0);
  buildingMesh.rotation.set(0, Math.PI / 4, 0);
  buildingMesh.scale.set(1.2, 1.2, 1.2);
}

// ===== Dynamically Modify Interactive Configuration =====
// Can adjust which Meshes respond to events at runtime

// Method 1: Enable events only for specified Meshes (recommended, best performance)
// model.setInteractiveMeshes(['Building A', 'Building B', 'Parking Lot']);

// Method 2: Enable all Mesh events (use with caution)
// model.setInteractiveMeshes('*');

// Method 3: Disable all events (best performance)
// model.setInteractiveMeshes(false);

// Check if Mesh is interactive
// const isInteractive = model.isMeshInteractive(someMesh);

// Get current interactive objects list
// const interactiveObjects = model.getInteractiveObjects();
// console.log('Current interactive object count:', interactiveObjects.length);

// Listen to model events
model.on('click', (event) => {
  console.log('Model clicked:', event.object.name);
});

model.on('mouseenter', (event) => {
  console.log('Mouse entered model:', event.object.name);
  // Highlight effect
  if (event.object.material) {
    event.object.material.emissive.setHex(0x444444);
  }
});

model.on('mouseleave', (event) => {
  console.log('Mouse left model:', event.object.name);
  // Remove highlight
  if (event.object.material) {
    event.object.material.emissive.setHex(0x000000);
  }
});

// ===== Performance Best Practices =====
// 1. Disable events by default: For display-only models, use interactiveMeshes: false
// 2. Specify precisely: Enable events only for key Meshes that need interaction
// 3. Avoid enabling all: When model contains many Meshes (> 50), avoid using '*'
// 4. Performance monitoring: Console shows performance warning when all events enabled

// Start rendering
scene.start();`;

onMounted(async () => {
    try {
        await initScene();
    } catch (error) {
        console.error('Scene initialization failed:', error);
        isLoading.value = false;
        loadingText.value = 'Initialization failed: ' + error.message;
    }
});

onUnmounted(() => {
    cleanup();
});

// Initialize scene
const initScene = async () => {
    if (!sceneContainer.value) return;

    try {
        isLoading.value = true;
        loadingText.value = 'Initializing scene...';
        loadingProgress.value = 10;
        // Create scene
        scene = new Scene(sceneContainer.value, {
            renderer: {
                antialias: true,
                outputColorSpace: 'srgb'
            },
            camera: {
                fov: 45,
                position: [10, 8, 15],
                lookAt: [0, 0, 0]
            }
        });

        // Initialize scene
        scene.init();

        // Add basic lighting
        scene.light.addAmbient({
            color: '#ffffff',
            intensity: 0.4
        });

        scene.light.addDirectional({
            color: '#ffffff',
            intensity: 0.8,
            position: [10, 10, 5],
            castShadow: true
        });

        // Enable shadows
        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        // Register components
        scene.registerComponent('ModelLoader', ModelLoader);
        scene.registerComponent('HDRLoader', HDRLoader);

        loadingProgress.value = 30;

        // Load HDR environment map
        await loadHDREnvironment();

        loadingProgress.value = 60;

        // Load model
        await loadModel();

        loadingProgress.value = 100;

        // Start rendering
        scene.start();

        // Setup event listeners
        setupEventListeners();

        addEventLog('success', 'Scene initialization complete');
    } catch (error) {
        addEventLog('error', `Scene initialization failed: ${error.message}`);
    } finally {
        isLoading.value = false;
    }
};

// Load HDR environment map
const loadHDREnvironment = async () => {
    try {
        loadingText.value = 'Loading HDR environment map...';

        hdrComponent = await scene.add('HDRLoader', {
            name: 'environment',
            url: '/textures/blouberg_sunrise_2_1k.hdr',
            asEnvironment: true,
            asBackground: true
        });

        // Listen to loading progress
        hdrComponent.on('loadProgress', (event) => {
            const progress = 30 + event.progress * 30; // 30-60%
            loadingProgress.value = progress;
        });

        hdrComponent.on('loadComplete', () => {
            addEventLog('success', 'HDR environment map loaded');
        });

        hdrComponent.on('loadError', (event) => {
            addEventLog('error', `HDR loading failed: ${event.error.message}`);
        });
    } catch (error) {
        console.error('HDR loading failed:', error);
        addEventLog('error', `HDR loading failed: ${error.message}`);
    }
};

// Load model
const loadModel = async () => {
    try {
        loadingText.value = 'Loading 3D model...';

        modelComponent = await scene.add('ModelLoader', {
            name: 'overview',
            url: '/models/ShaderBall.glb',
            scale: 1,
            position: [0, 0, 0],
            castShadow: true,
            receiveShadow: true,
            interactiveMeshes: '*' // Enable all Mesh event listening (for demo)
        });

        // Listen to loading progress
        modelComponent.on('loadProgress', (event) => {
            const progress = 60 + event.progress * 40; // 60-100%
            loadingProgress.value = progress;
        });

        modelComponent.on('loadComplete', () => {
            // Get all Mesh names
            meshNames.value = modelComponent.getMeshNames();
            availableMeshes.value = [...meshNames.value];

            // Initialize interactive configuration state
            updateInteractiveStatus();

            addEventLog('success', `Model loaded with ${meshNames.value.length} meshes`);
        });

        modelComponent.on('loadError', (event) => {
            addEventLog('error', `Model loading failed: ${event.error.message}`);
        });
    } catch (error) {
        addEventLog('error', `Model loading failed: ${error.message}`);
    }
};

// Setup event listeners
const setupEventListeners = () => {
    if (!modelComponent) return;

    // Listen to model click events
    modelComponent.on('click', (event) => {
        const meshName = event.object.name || 'Unnamed Mesh';
        addEventLog('click', `Clicked Mesh: ${meshName}`);

        // Auto-select clicked Mesh
        if (event.object.name && meshNames.value.includes(event.object.name)) {
            selectedMeshName.value = event.object.name;
            onMeshSelect();
        }
    });

    // Listen to mouse enter events
    modelComponent.on('mouseenter', (event) => {
        const meshName = event.object.name || 'Unnamed Mesh';
        addEventLog('hover', `Mouse entered Mesh: ${meshName}`);

        // Add highlight effect
        if (event.object.material) {
            if (Array.isArray(event.object.material)) {
                event.object.material.forEach((material) => {
                    material.emissive.setHex(0x444444);
                });
            } else {
                event.object.material.emissive.setHex(0x444444);
            }
        }
    });

    // Listen to mouse leave events
    modelComponent.on('mouseleave', (event) => {
        const meshName = event.object.name || 'Unnamed Mesh';
        addEventLog('hover', `Mouse left Mesh: ${meshName}`);

        // Remove highlight effect
        if (event.object.material) {
            if (Array.isArray(event.object.material)) {
                event.object.material.forEach((material) => {
                    material.emissive.setHex(0x000000);
                });
            } else {
                event.object.material.emissive.setHex(0x000000);
            }
        }
    });
};

// Mesh selection handler
const onMeshSelect = () => {
    if (!selectedMeshName.value || !modelComponent) {
        selectedMesh.value = null;
        return;
    }

    // Get selected Mesh
    selectedMesh.value = modelComponent.getMeshByName(selectedMeshName.value);

    if (selectedMesh.value) {
        // Update transform controller values
        meshTransform.position.x = selectedMesh.value.position.x;
        meshTransform.position.y = selectedMesh.value.position.y;
        meshTransform.position.z = selectedMesh.value.position.z;

        meshTransform.rotation.x = selectedMesh.value.rotation.x;
        meshTransform.rotation.y = selectedMesh.value.rotation.y;
        meshTransform.rotation.z = selectedMesh.value.rotation.z;

        meshTransform.scale.x = selectedMesh.value.scale.x;
        meshTransform.scale.y = selectedMesh.value.scale.y;
        meshTransform.scale.z = selectedMesh.value.scale.z;

        addEventLog('info', `Selected Mesh: ${selectedMeshName.value}`);
    }
};

// Update Mesh transform
const updateMeshTransform = () => {
    if (!selectedMesh.value) return;

    // Apply position transform
    selectedMesh.value.position.set(
        meshTransform.position.x,
        meshTransform.position.y,
        meshTransform.position.z
    );

    // Apply rotation transform
    selectedMesh.value.rotation.set(
        meshTransform.rotation.x,
        meshTransform.rotation.y,
        meshTransform.rotation.z
    );

    // Apply scale transform
    selectedMesh.value.scale.set(
        meshTransform.scale.x,
        meshTransform.scale.y,
        meshTransform.scale.z
    );
};

// Reset Mesh transform
const resetMeshTransform = () => {
    if (!selectedMesh.value) return;

    // Reset to default values
    meshTransform.position.x = 0;
    meshTransform.position.y = 0;
    meshTransform.position.z = 0;

    meshTransform.rotation.x = 0;
    meshTransform.rotation.y = 0;
    meshTransform.rotation.z = 0;

    meshTransform.scale.x = 1;
    meshTransform.scale.y = 1;
    meshTransform.scale.z = 1;

    // Apply reset
    updateMeshTransform();

    addEventLog('info', `Reset Mesh transform: ${selectedMeshName.value}`);
};

// Add event log
const addEventLog = (type, message) => {
    try {
        const now = new Date();
        const time = now.toLocaleTimeString();

        if (!eventLog.value) {
            eventLog.value = [];
        }

        eventLog.value.unshift({
            type,
            message,
            time
        });

        // Limit log count
        if (eventLog.value.length > 50) {
            eventLog.value = eventLog.value.slice(0, 50);
        }
    } catch (error) {
        console.error('Failed to add event log:', error);
    }
};

// Clear event log
const clearEventLog = () => {
    eventLog.value = [];
    addEventLog('info', 'Event log cleared');
};

// Update interactive mode
const updateInteractiveMode = () => {
    if (!modelComponent) return;

    let config;
    switch (interactiveMode.value) {
        case 'disabled':
            config = false;
            break;
        case 'all':
            config = '*';
            break;
        case 'selected':
            config =
                selectedInteractiveMeshes.value.length > 0
                    ? selectedInteractiveMeshes.value
                    : false;
            break;
        default:
            config = false;
    }

    // Apply configuration
    modelComponent.setInteractiveMeshes(config);

    // Update status
    updateInteractiveStatus();

    // Log event
    addEventLog('info', `Interactive mode updated: ${getInteractiveModeDescription()}`);
};

// Update interactive status information
const updateInteractiveStatus = () => {
    if (!modelComponent) return;

    const interactiveObjects = modelComponent.getInteractiveObjects();
    currentInteractiveCount.value = interactiveObjects.length;

    // Performance warning
    if (interactiveMode.value === 'all' && availableMeshes.value.length > 50) {
        performanceWarning.value = `Enabling events for all ${availableMeshes.value.length} Meshes may impact performance`;
    } else {
        performanceWarning.value = '';
    }
};

// Get interactive mode description
const getInteractiveModeDescription = () => {
    switch (interactiveMode.value) {
        case 'disabled':
            return 'All events disabled';
        case 'all':
            return `Events enabled for all ${availableMeshes.value.length} Meshes`;
        case 'selected':
            return `Events enabled for ${selectedInteractiveMeshes.value.length} specified Meshes`;
        default:
            return 'Unknown mode';
    }
};

// Cleanup resources
const cleanup = () => {
    console.log('Cleaning up Advanced Model Loader example');

    if (scene) {
        scene.dispose();
        scene = null;
    }

    modelComponent = null;
    hdrComponent = null;
    selectedMesh.value = null;
    meshNames.value = [];
    selectedMeshName.value = '';
    eventLog.value = [];
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
.scene-container {
    width: 100%;
    height: 100%;
}

.transform-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 10px;
}

.mesh-selection {
    margin-bottom: 10px;
}

.warning-text {
    color: #ff6b6b;
    font-size: 12px;
    padding: 8px;
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 6px;
    margin-top: 10px;
}

.event-log {
    max-height: 200px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 10px;
    .scrollbar-style();
}

.event-item {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    font-size: 12px;
    padding: 4px 6px;
    border-radius: 4px;
}

.event-click {
    background: rgba(255, 193, 7, 0.2);
    border-left: 3px solid #ffc107;
}

.event-hover {
    background: rgba(0, 123, 255, 0.2);
    border-left: 3px solid #007bff;
}

.event-success {
    background: rgba(40, 167, 69, 0.2);
    border-left: 3px solid #28a745;
}

.event-error {
    background: rgba(220, 53, 69, 0.2);
    border-left: 3px solid #dc3545;
}

.event-info {
    background: rgba(23, 162, 184, 0.2);
    border-left: 3px solid #17a2b8;
}

.event-time {
    font-family: 'Consolas', monospace;
    opacity: 0.7;
    margin-right: 8px;
    min-width: 60px;
}

.event-message {
    flex: 1;
}

/* 滚动条样式 */
.control-panel::-webkit-scrollbar,
.event-log::-webkit-scrollbar {
    width: 6px;
}

.control-panel::-webkit-scrollbar-track,
.event-log::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb,
.event-log::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover,
.event-log::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

/* 交互配置样式 */
.interactive-config {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.interactive-config select {
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 13px;
    cursor: pointer;
}

.interactive-config select:focus {
    outline: none;
    border-color: #00ff88;
}

.interactive-config option {
    background: #1a1a1a;
    color: white;
}

.selected-meshes {
    margin-top: 8px;
}

.mesh-checkboxes {
    max-height: 150px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 8px;
    margin-top: 6px;
}

.mesh-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mesh-checkbox:last-child {
    border-bottom: none;
}

.mesh-checkbox input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #00ff88;
}

.mesh-checkbox label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    flex: 1;
}

.interactive-info {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    padding: 10px;
    font-size: 12px;
}

.interactive-info p {
    margin: 4px 0;
    color: rgba(255, 255, 255, 0.8);
}

.interactive-info .warning {
    color: #ffaa00;
    font-weight: 500;
}
</style>
