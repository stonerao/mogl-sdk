<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="03 - Lighting"
        :sceneOnly="isSceneOnly"
    >
        <div class="scene-container" ref="sceneContainer">
            <!-- Loading State -->
            <template v-if="isLoading">
                <GuiLoading :progress="loadingProgress" :text="loadingText" />
            </template>

            <!-- Control Panel -->
            <template v-if="!isLoading">
                <GuiPanel title="Lighting Controls" width="wide">
                    <!-- Ambient Light Control -->
                    <GuiSection title="Ambient Light">
                        <GuiCheckbox
                            label="Enable Ambient Light"
                            v-model="ambientLight.enabled"
                            @update:modelValue="updateAmbientLight"
                        />
                        <template v-if="ambientLight.enabled">
                            <GuiSlider
                                label="Intensity"
                                v-model="ambientLight.intensity"
                                :min="0"
                                :max="2"
                                :step="0.1"
                                @update:modelValue="updateAmbientLight"
                            />
                            <GuiColorPicker
                                label="Color"
                                v-model="ambientLight.color"
                                @update:modelValue="updateAmbientLight"
                            />
                        </template>
                    </GuiSection>

                    <!-- Directional Light Control -->
                    <GuiSection title="Directional Light">
                        <GuiCheckbox
                            label="Enable Directional Light"
                            v-model="directionalLight.enabled"
                            @update:modelValue="updateDirectionalLight"
                        />
                        <template v-if="directionalLight.enabled">
                            <GuiSlider
                                label="Intensity"
                                v-model="directionalLight.intensity"
                                :min="0"
                                :max="3"
                                :step="0.1"
                                @update:modelValue="updateDirectionalLight"
                            />
                            <GuiColorPicker
                                label="Color"
                                v-model="directionalLight.color"
                                @update:modelValue="updateDirectionalLight"
                            />
                            <div class="position-grid">
                                <GuiNumberInput
                                    label="Position X"
                                    v-model="directionalLight.position.x"
                                    :step="1"
                                    @update:modelValue="updateDirectionalLight"
                                />
                                <GuiNumberInput
                                    label="Position Y"
                                    v-model="directionalLight.position.y"
                                    :step="1"
                                    @update:modelValue="updateDirectionalLight"
                                />
                                <GuiNumberInput
                                    label="Position Z"
                                    v-model="directionalLight.position.z"
                                    :step="1"
                                    @update:modelValue="updateDirectionalLight"
                                />
                            </div>
                            <GuiCheckbox
                                label="Cast Shadow"
                                v-model="directionalLight.castShadow"
                                @update:modelValue="updateDirectionalLight"
                            />
                        </template>
                    </GuiSection>

                    <!-- Point Light Control -->
                    <GuiSection title="Point Light">
                        <GuiCheckbox
                            label="Enable Point Light"
                            v-model="pointLight.enabled"
                            @update:modelValue="updatePointLight"
                        />
                        <template v-if="pointLight.enabled">
                            <GuiSlider
                                label="Intensity"
                                v-model="pointLight.intensity"
                                :min="0"
                                :max="5"
                                :step="0.1"
                                @update:modelValue="updatePointLight"
                            />
                            <GuiColorPicker
                                label="Color"
                                v-model="pointLight.color"
                                @update:modelValue="updatePointLight"
                            />
                            <div class="position-grid">
                                <GuiNumberInput
                                    label="Position X"
                                    v-model="pointLight.position.x"
                                    :step="1"
                                    @update:modelValue="updatePointLight"
                                />
                                <GuiNumberInput
                                    label="Position Y"
                                    v-model="pointLight.position.y"
                                    :step="1"
                                    @update:modelValue="updatePointLight"
                                />
                                <GuiNumberInput
                                    label="Position Z"
                                    v-model="pointLight.position.z"
                                    :step="1"
                                    @update:modelValue="updatePointLight"
                                />
                            </div>
                            <GuiSlider
                                label="Distance"
                                v-model="pointLight.distance"
                                :min="0"
                                :max="100"
                                :step="1"
                                @update:modelValue="updatePointLight"
                            />
                            <GuiSlider
                                label="Decay"
                                v-model="pointLight.decay"
                                :min="0"
                                :max="5"
                                :step="0.1"
                                @update:modelValue="updatePointLight"
                            />
                        </template>
                    </GuiSection>

                    <!-- Spot Light Control -->
                    <GuiSection title="Spot Light">
                        <GuiCheckbox
                            label="Enable Spot Light"
                            v-model="spotLight.enabled"
                            @update:modelValue="updateSpotLight"
                        />
                        <template v-if="spotLight.enabled">
                            <GuiSlider
                                label="Intensity"
                                v-model="spotLight.intensity"
                                :min="0"
                                :max="5"
                                :step="0.1"
                                @update:modelValue="updateSpotLight"
                            />
                            <GuiColorPicker
                                label="Color"
                                v-model="spotLight.color"
                                @update:modelValue="updateSpotLight"
                            />
                            <div class="position-grid">
                                <GuiNumberInput
                                    label="Position X"
                                    v-model="spotLight.position.x"
                                    :step="1"
                                    @update:modelValue="updateSpotLight"
                                />
                                <GuiNumberInput
                                    label="Position Y"
                                    v-model="spotLight.position.y"
                                    :step="1"
                                    @update:modelValue="updateSpotLight"
                                />
                                <GuiNumberInput
                                    label="Position Z"
                                    v-model="spotLight.position.z"
                                    :step="1"
                                    @update:modelValue="updateSpotLight"
                                />
                            </div>
                            <GuiSlider
                                label="Angle"
                                v-model="spotLight.angle"
                                :min="0.1"
                                :max="1.57"
                                :step="0.01"
                                :precision="2"
                                @update:modelValue="updateSpotLight"
                            />
                            <GuiSlider
                                label="Edge Blur"
                                v-model="spotLight.penumbra"
                                :min="0"
                                :max="1"
                                :step="0.01"
                                :precision="2"
                                @update:modelValue="updateSpotLight"
                            />
                        </template>
                    </GuiSection>

                    <!-- Preset Configuration -->
                    <GuiSection title="Preset Configuration">
                        <div class="preset-buttons">
                            <GuiButton label="Daylight" @click="setLightingPreset('daylight')" />
                            <GuiButton label="Sunset" @click="setLightingPreset('sunset')" />
                            <GuiButton label="Night" @click="setLightingPreset('night')" />
                            <GuiButton label="Studio" @click="setLightingPreset('studio')" />
                            <GuiButton label="Reset" variant="secondary" @click="resetLighting" />
                        </div>
                    </GuiSection>
                </GuiPanel>
            </template>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { GridHelper } from '@w3d/components';
import {
    GuiPanel,
    GuiSection,
    GuiLoading,
    GuiCheckbox,
    GuiSlider,
    GuiColorPicker,
    GuiNumberInput,
    GuiButton
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

// Ambient light state
const ambientLight = reactive({
    enabled: true,
    intensity: 0.4,
    color: '#ffffff'
});

// Directional light state
const directionalLight = reactive({
    enabled: true,
    intensity: 1.0,
    color: '#ffffff',
    position: { x: 10, y: 10, z: 5 },
    castShadow: true
});

// Point light state
const pointLight = reactive({
    enabled: false,
    intensity: 1.0,
    color: '#ff6b6b',
    position: { x: 5, y: 8, z: 5 },
    distance: 20,
    decay: 2
});

// Spot light state
const spotLight = reactive({
    enabled: false,
    intensity: 1.0,
    color: '#4ecdc4',
    position: { x: -5, y: 10, z: 5 },
    angle: Math.PI / 6,
    penumbra: 0.1
});

let scene = null;
let gridHelper = null;
let sphere = null;
let plane = null;
let cube = null;

// Light instance references
let ambientLightInstance = null;
let directionalLightInstance = null;
let pointLightInstance = null;
let spotLightInstance = null;

// Source code display
const sourceCode = `import { Scene } from '@w3d/core';
import { GridHelper } from '@w3d/components';
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

// Enable shadow and auto-resize
scene.renderer.enableShadow(true);
scene.renderer.enableResize();

// Register components
scene.registerComponent('GridHelper', GridHelper);

// Add grid helper
scene.add('GridHelper', {
  name: 'grid',
  size: 20,
  divisions: 20,
  color: '#888888'
});

// ===== Lighting System Configuration =====

// 1. Ambient Light
// Provides basic scene illumination, no directionality
const ambientLight = scene.light.addAmbient({
  color: '#ffffff',
  intensity: 0.4
});

// 2. Directional Light
// Simulates sunlight, has direction but no position decay
const directionalLight = scene.light.addDirectional({
  color: '#ffffff',
  intensity: 1.0,
  position: [10, 10, 5],
  castShadow: true,
  shadowMapSize: 2048
});

// 3. Point Light
// Emits light from a point in all directions, has position and distance decay
const pointLight = scene.light.addPoint({
  color: '#ff6b6b',
  intensity: 1.0,
  position: [5, 8, 5],
  distance: 20,  // Light distance
  decay: 2       // Decay coefficient
});

// 4. Spot Light
// Cone-shaped light beam, has position, direction and angle
const spotLight = scene.light.addSpot({
  color: '#4ecdc4',
  intensity: 1.0,
  position: [-5, 10, 5],
  target: [0, 0, 0],
  angle: Math.PI / 6,    // Light cone angle
  penumbra: 0.1,         // Edge blur
  distance: 30,
  decay: 2
});

// ===== Dynamic Light Control =====

// Enable/Disable lights
// ambientLight.visible = true/false;
// directionalLight.visible = true/false;

// Adjust light properties
// ambientLight.intensity = 0.5;
// directionalLight.color.setHex(0xffffff);
// pointLight.position.set(x, y, z);

// Animate lights (e.g.: point light movement)
// function animatePointLight() {
//   const time = Date.now() * 0.001;
//   pointLight.position.x = Math.cos(time) * 10;
//   pointLight.position.z = Math.sin(time) * 10;
// }

// ===== Preset Lighting Configuration =====

// Daylight mode
function setDaylightMode() {
  scene.light.removeAll();
  scene.light.addAmbient({ color: '#87CEEB', intensity: 0.6 });
  scene.light.addDirectional({
    color: '#FFF8DC',
    intensity: 1.2,
    position: [10, 20, 10],
    castShadow: true
  });
}

// Night mode
function setNightMode() {
  scene.light.removeAll();
  scene.light.addAmbient({ color: '#191970', intensity: 0.2 });
  scene.light.addPoint({
    color: '#FFD700',
    intensity: 2.0,
    position: [0, 10, 0],
    distance: 25
  });
}

// Studio mode
function setStudioMode() {
  scene.light.removeAll();
  scene.light.addAmbient({ color: '#ffffff', intensity: 0.3 });

  // Main light source
  scene.light.addDirectional({
    color: '#ffffff',
    intensity: 1.0,
    position: [10, 10, 10],
    castShadow: true
  });

  // Fill light
  scene.light.addDirectional({
    color: '#ffffff',
    intensity: 0.5,
    position: [-10, 5, -5]
  });
}

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

        // Enable shadow and auto-resize
        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        loadingProgress.value = 50;
        loadingText.value = 'Setting up lights...';

        // Initialize lights
        initLights();

        loadingProgress.value = 70;
        loadingText.value = 'Adding scene objects...';

        // Register components
        scene.registerComponent('GridHelper', GridHelper);

        // Add grid helper
        gridHelper = await scene.add('GridHelper', {
            name: 'grid',
            size: 20,
            divisions: 20,
            color: '#888888'
        });

        // Add demo objects
        createDemoObjects();

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

// Initialize lights
const initLights = () => {
    // Ambient light
    if (ambientLight.enabled) {
        ambientLightInstance = scene.light.addAmbient({
            color: ambientLight.color,
            intensity: ambientLight.intensity
        });
    }

    // Directional light
    if (directionalLight.enabled) {
        directionalLightInstance = scene.light.addDirectional({
            color: directionalLight.color,
            intensity: directionalLight.intensity,
            position: [
                directionalLight.position.x,
                directionalLight.position.y,
                directionalLight.position.z
            ],
            castShadow: directionalLight.castShadow,
            shadowMapSize: 2048
        });
    }

    // Point light
    if (pointLight.enabled) {
        pointLightInstance = scene.light.addPoint({
            color: pointLight.color,
            intensity: pointLight.intensity,
            position: [pointLight.position.x, pointLight.position.y, pointLight.position.z],
            distance: pointLight.distance,
            decay: pointLight.decay
        });
    }

    // Spot light
    if (spotLight.enabled) {
        spotLightInstance = scene.light.addSpot({
            color: spotLight.color,
            intensity: spotLight.intensity,
            position: [spotLight.position.x, spotLight.position.y, spotLight.position.z],
            target: [0, 0, 0],
            angle: spotLight.angle,
            penumbra: spotLight.penumbra,
            distance: 30,
            decay: 2
        });
    }
};

// Create demo objects
const createDemoObjects = () => {
    // Ground plane
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshLambertMaterial({ color: '#cccccc' });
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.scene.add(plane);

    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: '#ff6b6b' });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-3, 1.5, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.scene.add(sphere);

    // Cube
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: '#4ecdc4' });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(3, 1, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.scene.add(cube);
};
// Update ambient light
const updateAmbientLight = () => {
    if (!scene) return;

    if (ambientLight.enabled) {
        if (!ambientLightInstance) {
            ambientLightInstance = scene.light.addAmbient({
                color: ambientLight.color,
                intensity: ambientLight.intensity
            });
        } else {
            ambientLightInstance.color.setHex(ambientLight.color.replace('#', '0x'));
            ambientLightInstance.intensity = ambientLight.intensity;
        }
    } else {
        if (ambientLightInstance) {
            scene.scene.remove(ambientLightInstance);
            ambientLightInstance = null;
        }
    }
};

// Update directional light
const updateDirectionalLight = () => {
    if (!scene) return;

    if (directionalLight.enabled) {
        if (!directionalLightInstance) {
            directionalLightInstance = scene.light.addDirectional({
                color: directionalLight.color,
                intensity: directionalLight.intensity,
                position: [
                    directionalLight.position.x,
                    directionalLight.position.y,
                    directionalLight.position.z
                ],
                castShadow: directionalLight.castShadow,
                shadowMapSize: 2048
            });
        } else {
            directionalLightInstance.color.setHex(directionalLight.color.replace('#', '0x'));
            directionalLightInstance.intensity = directionalLight.intensity;
            directionalLightInstance.position.set(
                directionalLight.position.x,
                directionalLight.position.y,
                directionalLight.position.z
            );
            directionalLightInstance.castShadow = directionalLight.castShadow;
        }
    } else {
        if (directionalLightInstance) {
            scene.scene.remove(directionalLightInstance);
            directionalLightInstance = null;
        }
    }
};

// Update point light
const updatePointLight = () => {
    if (!scene) return;

    if (pointLight.enabled) {
        if (!pointLightInstance) {
            pointLightInstance = scene.light.addPoint({
                color: pointLight.color,
                intensity: pointLight.intensity,
                position: [pointLight.position.x, pointLight.position.y, pointLight.position.z],
                distance: pointLight.distance,
                decay: pointLight.decay
            });
        } else {
            pointLightInstance.color.setHex(pointLight.color.replace('#', '0x'));
            pointLightInstance.intensity = pointLight.intensity;
            pointLightInstance.position.set(
                pointLight.position.x,
                pointLight.position.y,
                pointLight.position.z
            );
            pointLightInstance.distance = pointLight.distance;
            pointLightInstance.decay = pointLight.decay;
        }
    } else {
        if (pointLightInstance) {
            scene.scene.remove(pointLightInstance);
            pointLightInstance = null;
        }
    }
};

// Update spot light
const updateSpotLight = () => {
    if (!scene) return;

    if (spotLight.enabled) {
        if (!spotLightInstance) {
            spotLightInstance = scene.light.addSpot({
                color: spotLight.color,
                intensity: spotLight.intensity,
                position: [spotLight.position.x, spotLight.position.y, spotLight.position.z],
                target: [0, 0, 0],
                angle: spotLight.angle,
                penumbra: spotLight.penumbra,
                distance: 30,
                decay: 2
            });
        } else {
            spotLightInstance.color.setHex(spotLight.color.replace('#', '0x'));
            spotLightInstance.intensity = spotLight.intensity;
            spotLightInstance.position.set(
                spotLight.position.x,
                spotLight.position.y,
                spotLight.position.z
            );
            spotLightInstance.angle = spotLight.angle;
            spotLightInstance.penumbra = spotLight.penumbra;
        }
    } else {
        if (spotLightInstance) {
            scene.scene.remove(spotLightInstance);
            spotLightInstance = null;
        }
    }
};

// Set preset lighting configuration
const setLightingPreset = (preset) => {
    if (!scene) return;

    // Remove all lights
    scene.light.removeAll();
    ambientLightInstance = null;
    directionalLightInstance = null;
    pointLightInstance = null;
    spotLightInstance = null;

    const presets = {
        daylight: {
            ambient: { enabled: true, intensity: 0.6, color: '#87CEEB' },
            directional: {
                enabled: true,
                intensity: 1.2,
                color: '#FFF8DC',
                position: { x: 10, y: 20, z: 10 },
                castShadow: true
            },
            point: { enabled: false },
            spot: { enabled: false }
        },
        sunset: {
            ambient: { enabled: true, intensity: 0.3, color: '#FF6347' },
            directional: {
                enabled: true,
                intensity: 0.8,
                color: '#FF8C00',
                position: { x: -10, y: 5, z: 10 },
                castShadow: true
            },
            point: { enabled: false },
            spot: { enabled: false }
        },
        night: {
            ambient: { enabled: true, intensity: 0.2, color: '#191970' },
            directional: { enabled: false },
            point: {
                enabled: true,
                intensity: 2.0,
                color: '#FFD700',
                position: { x: 0, y: 10, z: 0 },
                distance: 25,
                decay: 2
            },
            spot: { enabled: false }
        },
        studio: {
            ambient: { enabled: true, intensity: 0.3, color: '#ffffff' },
            directional: {
                enabled: true,
                intensity: 1.0,
                color: '#ffffff',
                position: { x: 10, y: 10, z: 10 },
                castShadow: true
            },
            point: { enabled: false },
            spot: {
                enabled: true,
                intensity: 1.5,
                color: '#ffffff',
                position: { x: -5, y: 10, z: 5 },
                angle: Math.PI / 4,
                penumbra: 0.2
            }
        }
    };

    const config = presets[preset];
    if (config) {
        // Apply preset configuration
        Object.assign(ambientLight, config.ambient);
        Object.assign(directionalLight, config.directional);
        Object.assign(pointLight, config.point);
        Object.assign(spotLight, config.spot);

        // Re-initialize lights
        initLights();
    }
};

// Reset lighting
const resetLighting = () => {
    ambientLight.enabled = true;
    ambientLight.intensity = 0.4;
    ambientLight.color = '#ffffff';

    directionalLight.enabled = true;
    directionalLight.intensity = 1.0;
    directionalLight.color = '#ffffff';
    directionalLight.position = { x: 10, y: 10, z: 5 };
    directionalLight.castShadow = true;

    pointLight.enabled = false;
    pointLight.intensity = 1.0;
    pointLight.color = '#ff6b6b';
    pointLight.position = { x: 5, y: 8, z: 5 };
    pointLight.distance = 20;
    pointLight.decay = 2;

    spotLight.enabled = false;
    spotLight.intensity = 1.0;
    spotLight.color = '#4ecdc4';
    spotLight.position = { x: -5, y: 10, z: 5 };
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.1;

    // Re-initialize lights
    if (scene) {
        scene.light.removeAll();
        ambientLightInstance = null;
        directionalLightInstance = null;
        pointLightInstance = null;
        spotLightInstance = null;
        initLights();
    }
};

// Clean up resources
const cleanup = () => {
    console.log('Cleaning up Lighting example');

    if (scene) {
        scene.dispose();
        scene = null;
    }

    gridHelper = null;
    sphere = null;
    plane = null;
    cube = null;
    ambientLightInstance = null;
    directionalLightInstance = null;
    pointLightInstance = null;
    spotLightInstance = null;
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
.scene-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 10px;
}

.preset-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>

