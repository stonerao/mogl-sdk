<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="Label3D - 3D Label Component"
        :sceneOnly="isSceneOnly"
    >
        <!-- 3D Scene Container -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- Control Panel -->
        <GuiPanel title="Label Controls" width="wide">
            <!-- Label List -->
            <GuiSection title="Label List">
                <div class="label-list">
                    <div
                        v-for="label in labelList"
                        :key="label.id"
                        class="label-item"
                        :class="{ active: selectedLabelId === label.id }"
                        @click="selectLabel(label.id)"
                    >
                        <span class="label-name">{{ label.label }}</span>
                        <div class="label-actions">
                            <GuiButton
                                :label="label.visible ? 'Hide' : 'Show'"
                                size="small"
                                @click.stop="toggleLabelVisibility(label.id)"
                            />
                            <GuiButton
                                label="Delete"
                                size="small"
                                variant="secondary"
                                @click.stop="removeLabel(label.id)"
                            />
                        </div>
                    </div>
                </div>
            </GuiSection>

            <!-- Add Label -->
            <GuiSection title="Add Label">
                <GuiTextInput
                    label="Label Text"
                    v-model="newLabelText"
                    placeholder="Enter label text"
                />
                <GuiButton label="Add Label" @click="addNewLabel" />
            </GuiSection>

            <!-- Global Style Configuration -->
            <GuiSection title="Global Style">
                <GuiSlider
                    label="Font Size"
                    v-model="globalConfig.fontSize"
                    :min="16"
                    :max="64"
                    suffix="px"
                    @update:modelValue="updateGlobalStyle"
                />

                <GuiColorPicker
                    label="Text Color"
                    v-model="globalConfig.textColor"
                    @update:modelValue="updateGlobalStyle"
                />

                <GuiColorPicker
                    label="Background Color"
                    v-model="globalConfig.backgroundColor"
                    @update:modelValue="updateGlobalStyle"
                />

                <GuiColorPicker
                    label="Border Color"
                    v-model="globalConfig.borderColor"
                    @update:modelValue="updateGlobalStyle"
                />

                <GuiSlider
                    label="Border Width"
                    v-model="globalConfig.borderWidth"
                    :min="0"
                    :max="10"
                    suffix="px"
                    @update:modelValue="updateGlobalStyle"
                />

                <GuiSlider
                    label="Border Radius"
                    v-model="globalConfig.borderRadius"
                    :min="0"
                    :max="20"
                    suffix="px"
                    @update:modelValue="updateGlobalStyle"
                />

                <GuiSlider
                    label="Scale"
                    v-model="globalConfig.scale"
                    :min="0.5"
                    :max="3"
                    :step="0.1"
                    :precision="1"
                    @update:modelValue="updateGlobalStyle"
                />
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
import { Label3D, GridHelper } from '@w3d/components';
import * as THREE from 'three';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiColorPicker,
    GuiButton,
    GuiTextInput
} from '@/components/Gui';
import SplitLayout from '../../components/SplitLayout.vue';
import { useSceneOnly } from '../../composables/useSceneOnly';

// Detect if in sceneOnly mode
const isSceneOnly = useSceneOnly();

const sceneContainer = ref(null);
const selectedLabelId = ref(null);
const newLabelText = ref('New Label');
const eventLogs = ref([]);

let scene = null;
let labelComponent = null;
let labelCounter = 0;

// Label list
const labelList = ref([
    { id: 'label1', label: 'Building A', visible: true },
    { id: 'label2', label: 'Building B', visible: true },
    { id: 'label3', label: 'Building C', visible: true },
    { id: 'label4', label: 'Parking Lot', visible: true },
    { id: 'label5', label: 'Park', visible: true }
]);

// Global configuration
const globalConfig = reactive({
    fontSize: 32,
    textColor: '#ffffff',
    backgroundColor: '#000000',
    borderColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 5,
    scale: 1
});

// Source code display
const sourceCode = `import { Scene } from '@w3d/core';
import { Label3D, GridHelper } from '@w3d/components';
import * as THREE from 'three';

// Create scene
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    outputColorSpace: 'srgb'
  },
  camera: {
    fov: 45,
    position: [20, 15, 20],
    lookAt: [0, 0, 0]
  }
});

// Initialize scene
scene.init();

// Add lighting
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

// Enable shadow and auto-resize
scene.renderer.enableShadow(true);
scene.renderer.enableResize();

// Register components
scene.registerComponent('Label3D', Label3D);
scene.registerComponent('GridHelper', GridHelper);

// Add grid helper
await scene.add('GridHelper', {
  name: 'grid',
  size: 30,
  divisions: 30
});

// Add 3D labels
const labels = await scene.add('Label3D', {
  name: 'my-labels',
  globalConfig: {
    fontSize: 32,
    fontFamily: 'Arial, sans-serif',
    textColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: '#ffffff',
    borderWidth: 2,
    padding: 10,
    borderRadius: 5,
    scale: 1,
    billboard: true
  },
  labels: [
    {
      id: 'label1',
      label: 'Building A',
      position: { x: -8, y: 3, z: -8 },
      userData: { type: 'building', name: 'Building A' }
    },
    {
      id: 'label2',
      label: 'Building B',
      position: { x: 8, y: 3, z: -8 },
      userData: { type: 'building', name: 'Building B' }
    },
    {
      id: 'label3',
      label: 'Building C',
      position: { x: 0, y: 3, z: 8 },
      userData: { type: 'building', name: 'Building C' }
    }
  ]
});

// Listen for click events
labels.on('click', (event) => {
  const labelId = event.object.userData.labelId;
  const customData = event.object.userData.customData;
  console.log('Label clicked:', labelId, customData);
});

// Listen for mouse enter events
labels.on('mouseenter', (event) => {
  const sprite = event.object;
  sprite.scale.multiplyScalar(1.2);
  console.log('Mouse enter:', event.object.userData.labelId);
});

// Listen for mouse leave events
labels.on('mouseleave', (event) => {
  const sprite = event.object;
  sprite.scale.divideScalar(1.2);
  console.log('Mouse leave:', event.object.userData.labelId);
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
                position: [20, 15, 20],
                lookAt: [0, 0, 0]
            }
        });

        // Initialize scene
        scene.init();

        // Add lighting
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

        // Enable shadow and auto-resize
        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        // Register components
        scene.registerComponent('Label3D', Label3D);
        scene.registerComponent('GridHelper', GridHelper);

        // Add grid helper
        await scene.add('GridHelper', {
            name: 'grid',
            size: 30,
            divisions: 30,
            color: '#888888'
        });

        // Add some cubes as reference
        createReferenceCubes();

        // Add 3D labels
        labelComponent = await scene.add('Label3D', {
            name: 'my-labels',
            globalConfig: {
                fontSize: globalConfig.fontSize,
                fontFamily: 'Arial, sans-serif',
                textColor: globalConfig.textColor,
                backgroundColor: hexToRgba(globalConfig.backgroundColor, 0.7),
                borderColor: globalConfig.borderColor,
                borderWidth: globalConfig.borderWidth,
                padding: 10,
                borderRadius: globalConfig.borderRadius,
                scale: globalConfig.scale,
                billboard: true,
                depthTest: true,
                sizeAttenuation: true
            },
            labels: [
                {
                    id: 'label1',
                    label: 'Building A',
                    position: { x: -8, y: 3, z: -8 },
                    userData: { type: 'building', name: 'Building A' }
                },
                {
                    id: 'label2',
                    label: 'Building B',
                    position: { x: 8, y: 3, z: -8 },
                    userData: { type: 'building', name: 'Building B' }
                },
                {
                    id: 'label3',
                    label: 'Building C',
                    position: { x: 0, y: 3, z: 8 },
                    userData: { type: 'building', name: 'Building C' }
                },
                {
                    id: 'label4',
                    label: 'Parking Lot',
                    position: { x: -8, y: 1, z: 8 },
                    userData: { type: 'parking', name: 'Parking Lot' },
                    config: {
                        fontSize: 24,
                        textColor: '#ffff00',
                        backgroundColor: 'rgba(0, 100, 200, 0.8)'
                    }
                },
                {
                    id: 'label5',
                    label: 'Park',
                    position: { x: 8, y: 1, z: 8 },
                    userData: { type: 'park', name: 'Park' },
                    config: {
                        fontSize: 28,
                        textColor: '#00ff00',
                        backgroundColor: 'rgba(0, 150, 0, 0.8)'
                    }
                }
            ]
        });

        // Listen for click events
        labelComponent.on('click', (event) => {
            const labelId = event.object.userData.labelId;
            const customData = event.object.userData.customData;
            selectedLabelId.value = labelId;
            addLog(`Label clicked: ${labelId} - ${customData.name}`);
        });

        // Listen for mouse enter events
        labelComponent.on('mouseenter', (event) => {
            const sprite = event.object;
            sprite.scale.multiplyScalar(1.2);
            addLog(`Mouse enter: ${event.object.userData.labelId}`);
        });

        // Listen for mouse leave events
        labelComponent.on('mouseleave', (event) => {
            const sprite = event.object;
            sprite.scale.divideScalar(1.2);
            addLog(`Mouse leave: ${event.object.userData.labelId}`);
        });

        addLog('Scene initialization complete');
    } catch (error) {
        console.error('Scene initialization failed:', error);
        addLog(`Error: ${error.message}`);
    }
};

// Create reference cubes
const createReferenceCubes = () => {
    const positions = [
        { x: -8, y: 1, z: -8, color: '#ff6b6b' },
        { x: 8, y: 1, z: -8, color: '#4ecdc4' },
        { x: 0, y: 1, z: 8, color: '#45b7d1' },
        { x: -8, y: 0.5, z: 8, color: '#ffd93d' },
        { x: 8, y: 0.5, z: 8, color: '#6bcf7f' }
    ];

    positions.forEach((pos) => {
        const geometry = new THREE.BoxGeometry(2, pos.y * 2, 2);
        const material = new THREE.MeshStandardMaterial({
            color: pos.color,
            metalness: 0.3,
            roughness: 0.7
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(pos.x, pos.y, pos.z);
        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.scene.add(cube);
    });
};

// Color conversion helper function
const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Select label
const selectLabel = (id) => {
    selectedLabelId.value = id;
    addLog(`Label selected: ${id}`);
};

// Toggle label visibility
const toggleLabelVisibility = (id) => {
    const label = labelList.value.find((l) => l.id === id);
    if (label) {
        label.visible = !label.visible;
        if (label.visible) {
            labelComponent.showLabel(id);
            addLog(`Label shown: ${id}`);
        } else {
            labelComponent.hideLabel(id);
            addLog(`Label hidden: ${id}`);
        }
    }
};

// Remove label
const removeLabel = (id) => {
    labelComponent.removeLabel(id);
    const index = labelList.value.findIndex((l) => l.id === id);
    if (index > -1) {
        labelList.value.splice(index, 1);
    }
    addLog(`Label removed: ${id}`);
};

// Add new label
const addNewLabel = async () => {
    if (!newLabelText.value.trim()) {
        addLog('Error: Label text cannot be empty');
        return;
    }

    labelCounter++;
    const newId = `label-${Date.now()}-${labelCounter}`;

    // Random position
    const x = (Math.random() - 0.5) * 20;
    const z = (Math.random() - 0.5) * 20;
    const y = Math.random() * 5 + 2;

    await labelComponent.createLabel({
        id: newId,
        label: newLabelText.value,
        position: { x, y, z },
        userData: { type: 'custom', name: newLabelText.value }
    });

    labelList.value.push({
        id: newId,
        label: newLabelText.value,
        visible: true
    });

    addLog(`Label added: ${newLabelText.value}`);
    newLabelText.value = 'New Label';
};

// Update global style
const updateGlobalStyle = async () => {
    if (!labelComponent) return;

    // Update style for all labels
    const allLabels = labelComponent.getAllLabels();
    for (const label of allLabels) {
        // Only update labels without custom configuration
        if (!label.config || Object.keys(label.config).length === 0) {
            await labelComponent.updateLabel(label.id, {
                config: {
                    fontSize: globalConfig.fontSize,
                    textColor: globalConfig.textColor,
                    backgroundColor: hexToRgba(globalConfig.backgroundColor, 0.7),
                    borderColor: globalConfig.borderColor,
                    borderWidth: globalConfig.borderWidth,
                    borderRadius: globalConfig.borderRadius,
                    scale: globalConfig.scale
                }
            });
        }
    }

    addLog('Global style updated');
};

// Component mounted
onMounted(() => {
    initScene();
});

// Component unmounted
onUnmounted(() => {
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

.label-list {
    max-height: 200px;
    overflow-y: auto;
    .scrollbar-style();
}

.label-item {
    padding: 8px;
    margin-bottom: 5px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.label-item:hover {
    background: rgba(255, 255, 255, 0.1);
}

.label-item.active {
    background: rgba(78, 205, 196, 0.3);
    border: 1px solid #4ecdc4;
}

.label-name {
    flex: 1;
    font-size: 13px;
}

.label-actions {
    display: flex;
    gap: 5px;
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
}

.log-item:last-child {
    border-bottom: none;
}
</style>

