<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="04 - Model Loader"
        :sceneOnly="isSceneOnly"
    >
        <div class="scene-container" ref="sceneContainer">
            <!-- Loading State -->
            <template v-if="isLoading">
                <GuiLoading :progress="loadingProgress" :text="loadingText" />
            </template>

            <!-- Control Panel -->
            <template v-if="!isLoading">
                <GuiPanel title="Model Loader" width="wide">
                    <!-- Model Loading -->
                    <GuiSection title="Model Loading">
                        <GuiTextInput
                            label="Model URL"
                            v-model="modelConfig.url"
                            placeholder="Enter model file URL"
                            @keyup.enter="loadModel"
                        />
                        <div class="button-group">
                            <GuiButton
                                label="Load Model"
                                :disabled="!modelConfig.url"
                                @click="loadModel"
                            />
                            <GuiButton
                                label="Clear Model"
                                variant="secondary"
                                :disabled="!currentModel"
                                @click="clearModel"
                            />
                        </div>
                    </GuiSection>

                    <!-- Model Transform -->
                    <template v-if="currentModel">
                        <GuiSection title="Model Transform">
                            <!-- Position Control -->
                            <div class="position-grid">
                                <GuiNumberInput
                                    label="X"
                                    v-model="modelTransform.position.x"
                                    :step="0.1"
                                    @update:modelValue="updateModelTransform"
                                />
                                <GuiNumberInput
                                    label="Y"
                                    v-model="modelTransform.position.y"
                                    :step="0.1"
                                    @update:modelValue="updateModelTransform"
                                />
                                <GuiNumberInput
                                    label="Z"
                                    v-model="modelTransform.position.z"
                                    :step="0.1"
                                    @update:modelValue="updateModelTransform"
                                />
                            </div>

                            <!-- Rotation Control -->
                            <GuiSlider
                                label="Rotation X Axis"
                                v-model="modelTransform.rotation.x"
                                :min="0"
                                :max="360"
                                :step="1"
                                suffix="°"
                                @update:modelValue="updateModelTransform"
                            />
                            <GuiSlider
                                label="Rotation Y Axis"
                                v-model="modelTransform.rotation.y"
                                :min="0"
                                :max="360"
                                :step="1"
                                suffix="°"
                                @update:modelValue="updateModelTransform"
                            />
                            <GuiSlider
                                label="Rotation Z Axis"
                                v-model="modelTransform.rotation.z"
                                :min="0"
                                :max="360"
                                :step="1"
                                suffix="°"
                                @update:modelValue="updateModelTransform"
                            />

                            <!-- Scale Control -->
                            <GuiSlider
                                label="Uniform Scale"
                                v-model="modelTransform.scale.uniform"
                                :min="0.1"
                                :max="3"
                                :step="0.1"
                                :precision="1"
                                suffix="x"
                                @update:modelValue="updateUniformScale"
                            />
                            <GuiCheckbox
                                label="Lock Aspect Ratio"
                                v-model="modelTransform.scale.lockAspect"
                                @update:modelValue="updateModelTransform"
                            />
                        </GuiSection>
                    </template>

                    <!-- Interactive Event Configuration -->
                    <template v-if="currentModel">
                        <GuiSection title="Interactive Event Configuration">
                            <GuiSelect
                                label="Interaction Mode"
                                v-model="interactionConfig.mode"
                                :options="[
                                    { value: 'disabled', label: 'Disabled' },
                                    { value: 'all', label: 'Enable All' },
                                    { value: 'selected', label: 'Selective Enable' }
                                ]"
                                @update:modelValue="updateInteractionMode"
                            />

                            <template v-if="interactionConfig.mode === 'selected'">
                                <div class="mesh-list">
                                    <div
                                        v-for="mesh in availableMeshes"
                                        :key="mesh.name"
                                        class="mesh-item"
                                    >
                                        <GuiCheckbox
                                            :label="mesh.name"
                                            :modelValue="
                                                interactionConfig.selectedMeshes.includes(mesh.name)
                                            "
                                            @update:modelValue="
                                                (val) => {
                                                    if (val) {
                                                        interactionConfig.selectedMeshes.push(
                                                            mesh.name
                                                        );
                                                    } else {
                                                        interactionConfig.selectedMeshes =
                                                            interactionConfig.selectedMeshes.filter(
                                                                (m) => m !== mesh.name
                                                            );
                                                    }
                                                    updateInteractionMode();
                                                }
                                            "
                                        />
                                    </div>
                                </div>
                            </template>

                            <GuiInfoItem
                                label="Current Interactive Objects"
                                :value="currentInteractiveCount"
                            />
                            <template v-if="performanceWarning">
                                <div class="warning">⚠️ {{ performanceWarning }}</div>
                            </template>
                        </GuiSection>
                    </template>

                    <!-- Model Information -->
                    <template v-if="currentModel">
                        <GuiSection title="Model Information">
                            <GuiInfoItem label="Mesh Count" :value="modelInfo.meshCount" />
                            <GuiInfoItem label="Material Count" :value="modelInfo.materialCount" />
                            <GuiInfoItem label="Vertex Count" :value="modelInfo.vertexCount" />
                            <GuiInfoItem label="File Size" :value="modelInfo.fileSize" />
                        </GuiSection>
                    </template>

                    <!-- Reset Button -->
                    <GuiSection title="Operations">
                        <GuiButton
                            label="Reset Transform"
                            :disabled="!currentModel"
                            @click="resetTransform"
                        />
                    </GuiSection>
                </GuiPanel>
            </template>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { ModelLoader, GridHelper } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiColorPicker,
    GuiSelect,
    GuiCheckbox,
    GuiButton,
    GuiInfoItem,
    GuiLoading,
    GuiNumberInput,
    GuiTextInput
} from '@/components/Gui';
import SplitLayout from '../../components/SplitLayout.vue';
import * as THREE from 'three';
import { useSceneOnly } from '../../composables/useSceneOnly';

// Detect if in sceneOnly mode
const isSceneOnly = useSceneOnly();

const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('');
const loadingProgress = ref(0);

// Model configuration
const modelConfig = reactive({
    url: '/models/ShaderBall.glb'
});

// Model transform state
const modelTransform = reactive({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { uniform: 1, lockAspect: true }
});

// Interaction configuration
const interactionConfig = reactive({
    mode: 'disabled', // 'disabled', 'all', 'selected'
    selectedMeshes: []
});

// Model information
const modelInfo = reactive({
    meshCount: 0,
    materialCount: 0,
    vertexCount: 0,
    fileSize: '0 KB'
});

const availableMeshes = ref([]);
const currentInteractiveCount = ref(0);
const performanceWarning = ref('');

let scene = null;
let currentModel = ref(null);
let gridHelper = null;

// Source code display
const sourceCode = `import { Scene } from '@w3d/core';
import { ModelLoader, GridHelper } from '@w3d/components';
import * as THREE from 'three';

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

// Enable shadows and auto resize
scene.renderer.enableShadow(true);
scene.renderer.enableResize();

// Register components
scene.registerComponent('ModelLoader', ModelLoader);
scene.registerComponent('GridHelper', GridHelper);

// Add grid helper
scene.add('GridHelper', {
  name: 'grid',
  size: 20,
  divisions: 20,
  color: '#888888'
});

// ===== Model Loading Configuration =====

// 1. Basic model loading
const model = await scene.add('ModelLoader', {
  name: 'building',
  url: './models/ShaderBall.glb',

  // Interactive event configuration (interactiveMeshes)
  // false (default) - Disable all events, best performance
  // '*' - Enable all Mesh events, significant performance impact
  // Array - Enable events only for specified Mesh names (recommended)
  interactiveMeshes: false,

  // Model transform
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1]
});

// 2. Selective event enabling (recommended)
const interactiveModel = await scene.add('ModelLoader', {
  name: 'interactive-building',
  url: '/models/ShaderBall.glb',
  interactiveMeshes: ['Admin Building', 'Office A', 'Parking Lot']
});

// 3. Dynamically modify interactive configuration
// Enable events for specified Meshes
model.setInteractiveMeshes(['Building A', 'Building B']);

// Enable events for all Meshes (use with caution)
model.setInteractiveMeshes('*');

// Disable all events
model.setInteractiveMeshes(false);

// ===== Model Transform Control =====

// Position transform
model.setPosition(x, y, z);
model.position.set(x, y, z);

// Rotation transform (radians)
model.setRotation(rx, ry, rz);
model.rotation.set(rx, ry, rz);

// Scale transform
model.setScale(sx, sy, sz);
model.scale.set(sx, sy, sz);

// ===== Model Information Retrieval =====

// Get all Meshes in the model
const meshes = model.getMeshes();
console.log('Mesh count:', meshes.length);

// Get interactive objects
const interactiveObjects = model.getInteractiveObjects();
console.log('Interactive object count:', interactiveObjects.length);

// Check if Mesh is interactive
const isInteractive = model.isMeshInteractive(someMesh);

// ===== Event Listening =====

// Listen for model loading completion
model.addEventListener('loaded', (event) => {
  console.log('Model loaded:', event.detail);
});

// Listen for Mesh click events
model.addEventListener('click', (event) => {
  console.log('Mesh clicked:', event.detail.object.name);
});

// Listen for Mesh mouse enter events
model.addEventListener('mouseenter', (event) => {
  console.log('Mouse entered Mesh:', event.detail.object.name);
});

// Start rendering
scene.start();`;
onMounted(() => {
    initScene();
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

        loadingProgress.value = 30;
        loadingText.value = 'Initializing renderer...';

        // Initialize scene
        scene.init();

        // Enable shadows and auto resize
        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        loadingProgress.value = 50;
        loadingText.value = 'Setting up lighting...';

        // Add basic lighting
        scene.light.addAmbient({
            color: '#ffffff',
            intensity: 0.6
        });

        scene.light.addDirectional({
            color: '#ffffff',
            intensity: 0.8,
            position: [10, 10, 5],
            castShadow: true
        });

        loadingProgress.value = 70;
        loadingText.value = 'Adding scene objects...';

        // Register components
        scene.registerComponent('ModelLoader', ModelLoader);
        scene.registerComponent('GridHelper', GridHelper);

        // Add grid helper
        gridHelper = await scene.add('GridHelper', {
            name: 'grid',
            size: 20,
            divisions: 20,
            color: '#888888'
        });

        loadingProgress.value = 100;
        loadingText.value = 'Complete';

        // Start rendering
        scene.start();

        // Delay hiding loading state
        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    } catch (error) {
        console.error('Scene initialization failed:', error);
        loadingText.value = 'Initialization failed';
        setTimeout(() => {
            isLoading.value = false;
        }, 1000);
    }
};

// Load model
const loadModel = async () => {
    if (!scene || !modelConfig.url) return;

    try {
        isLoading.value = true;
        loadingText.value = 'Loading model...';
        loadingProgress.value = 0;

        // Clear existing model
        if (currentModel.value) {
            scene.remove(currentModel.value.name);
            currentModel.value = null;
        }

        // Load new model
        currentModel.value = await scene.add('ModelLoader', {
            name: 'loaded-model',
            url: modelConfig.url,
            interactiveMeshes: false
        });

        // Update model information
        updateModelInfo();

        // Reset transform
        resetTransform();

        loadingProgress.value = 100;
        loadingText.value = 'Model loaded successfully';

        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    } catch (error) {
        console.error('Model loading failed:', error);
        loadingText.value = 'Model loading failed';
        setTimeout(() => {
            isLoading.value = false;
        }, 1000);
    }
};

// Clear model
const clearModel = () => {
    if (currentModel.value && scene) {
        scene.remove(currentModel.value.name);
        currentModel.value = null;
        availableMeshes.value = [];
        interactionConfig.selectedMeshes = [];
        currentInteractiveCount.value = 0;
        performanceWarning.value = '';

        // Reset model information
        modelInfo.meshCount = 0;
        modelInfo.materialCount = 0;
        modelInfo.vertexCount = 0;
        modelInfo.fileSize = '0 KB';
    }
};

// Update model transform
const updateModelTransform = () => {
    if (!currentModel.value) return;

    // Position
    currentModel.value.position.set(
        modelTransform.position.x,
        modelTransform.position.y,
        modelTransform.position.z
    );

    // Rotation (degrees to radians)
    currentModel.value.rotation.set(
        (modelTransform.rotation.x * Math.PI) / 180,
        (modelTransform.rotation.y * Math.PI) / 180,
        (modelTransform.rotation.z * Math.PI) / 180
    );

    // Scale
    if (modelTransform.scale.lockAspect) {
        const scale = modelTransform.scale.uniform;
        currentModel.value.scale.set(scale, scale, scale);
    }
};
// Update uniform scale
const updateUniformScale = () => {
    if (modelTransform.scale.lockAspect) {
        updateModelTransform();
    }
};

// Update interaction mode
const updateInteractionMode = () => {
    if (!currentModel.value) return;

    let interactiveMeshes;

    switch (interactionConfig.mode) {
        case 'disabled':
            interactiveMeshes = false;
            break;
        case 'all':
            interactiveMeshes = '*';
            break;
        case 'selected':
            interactiveMeshes = interactionConfig.selectedMeshes;
            break;
        default:
            interactiveMeshes = false;
    }

    // Apply interaction configuration
    currentModel.value.setInteractiveMeshes(interactiveMeshes);

    // Update status
    updateInteractionStatus();
};

// Update interaction status
const updateInteractionStatus = () => {
    if (!currentModel.value) return;

    const interactiveObjects = currentModel.value.getInteractiveObjects();
    currentInteractiveCount.value = interactiveObjects.length;

    // Performance warning
    if (interactionConfig.mode === 'all' && availableMeshes.value.length > 50) {
        performanceWarning.value = `Enabled events for ${availableMeshes.value.length} Meshes, may affect performance`;
    } else {
        performanceWarning.value = '';
    }
};

// Update model information
const updateModelInfo = () => {
    if (!currentModel.value) return;

    try {
        // Get all Meshes
        const meshes = currentModel.value.getMeshes ? currentModel.value.getMeshes() : [];
        availableMeshes.value = meshes.map((mesh) => ({
            name: mesh.name || 'Unnamed Mesh',
            uuid: mesh.uuid
        }));

        // Statistics
        modelInfo.meshCount = meshes.length;

        // Count materials
        const materials = new Set();
        let vertexCount = 0;

        meshes.forEach((mesh) => {
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((mat) => materials.add(mat.uuid));
                } else {
                    materials.add(mesh.material.uuid);
                }
            }

            if (mesh.geometry && mesh.geometry.attributes.position) {
                vertexCount += mesh.geometry.attributes.position.count;
            }
        });

        modelInfo.materialCount = materials.size;
        modelInfo.vertexCount = vertexCount;

        // File size (simulated)
        modelInfo.fileSize = `${Math.round(vertexCount / 1000)}KB`;
    } catch (error) {
        console.error('Failed to update model info:', error);
    }
};

// Reset transform
const resetTransform = () => {
    modelTransform.position.x = 0;
    modelTransform.position.y = 0;
    modelTransform.position.z = 0;
    modelTransform.rotation.x = 0;
    modelTransform.rotation.y = 0;
    modelTransform.rotation.z = 0;
    modelTransform.scale.uniform = 1;

    updateModelTransform();
};

// Cleanup resources
const cleanup = () => {
    console.log('Cleaning up Model Loader example');

    if (scene) {
        scene.dispose();
        scene = null;
    }

    currentModel.value = null;
    gridHelper = null;
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';

/* Scene container */
.scene-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #1a1a1a;
    overflow: hidden;
}

/* Position grid layout */
.position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 15px;
}

/* Mesh list */
.mesh-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 15px;
}

.mesh-item {
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
}

/* Warning message */
.warning {
    padding: 10px;
    background: rgba(255, 165, 0, 0.1);
    border-left: 3px solid #ffa500;
    border-radius: 4px;
    color: #ffa500;
    font-size: 12px;
    margin-top: 10px;
    min-width: 40px;
    text-align: right;
}

.setting-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.setting-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ffffff;
    font-size: 14px;
    cursor: pointer;
}

.setting-group input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #00ff88;
}

.setting-group select {
    flex: 1;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: #ffffff;
    font-size: 14px;
}

/* Interaction controls */
.interaction-controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.mesh-selection {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.mesh-list {
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 8px;
}

.mesh-item {
    padding: 4px 0;
}

.mesh-item label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ffffff;
    font-size: 12px;
    cursor: pointer;
}

.interaction-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #ffffff;
    font-size: 12px;
}

.info-value {
    color: #00ff88;
    font-weight: 500;
}

.warning {
    color: #ff6b6b;
    font-size: 12px;
    padding: 8px;
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 6px;
}

/* Model information */
.model-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* Scrollbar styles */
.control-panel::-webkit-scrollbar,
.mesh-list::-webkit-scrollbar {
    width: 6px;
}

.control-panel::-webkit-scrollbar-track,
.mesh-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb,
.mesh-list::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 136, 0.5);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover,
.mesh-list::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 136, 0.7);
}

/* Animation */
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>

