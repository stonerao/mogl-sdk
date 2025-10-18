<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="Post Processing Effects"
        :sceneOnly="isSceneOnly"
    >
        <div class="scene-container" ref="sceneContainer">
            <!-- Loading State -->
            <template v-if="isLoading">
                <GuiLoading :progress="loadingProgress" :text="loadingText" />
            </template>

            <!-- Control Panel -->
            <template v-if="!isLoading">
                <GuiPanel title="Post Processing Controls" width="wide">
                    <!-- Effect Toggles -->
                    <GuiSection title="Effects">
                        <GuiCheckbox
                            label="Sobel (Edge Detection)"
                            v-model="effects.sobel"
                            @update:modelValue="toggleSobel"
                        />
                        <GuiCheckbox
                            label="SSR (Screen Space Reflection)"
                            v-model="effects.ssr"
                            @update:modelValue="toggleSSR"
                        />
                        <GuiCheckbox
                            label="Bloom (Glow)"
                            v-model="effects.bloom"
                            @update:modelValue="toggleBloom"
                        />
                        <GuiCheckbox
                            label="AO (Ambient Occlusion)"
                            v-model="effects.ao"
                            @update:modelValue="toggleAO"
                        />
                    </GuiSection>

                    <!-- Bloom Settings -->
                    <GuiSection title="Bloom Settings" v-if="effects.bloom">
                        <GuiSlider
                            label="Threshold"
                            v-model="bloomSettings.threshold"
                            :min="0"
                            :max="1"
                            :step="0.01"
                            :precision="2"
                            @update:modelValue="updateBloom"
                        />
                        <GuiSlider
                            label="Strength"
                            v-model="bloomSettings.strength"
                            :min="0"
                            :max="3"
                            :step="0.1"
                            :precision="1"
                            @update:modelValue="updateBloom"
                        />
                        <GuiSlider
                            label="Radius"
                            v-model="bloomSettings.radius"
                            :min="0"
                            :max="1"
                            :step="0.01"
                            :precision="2"
                            @update:modelValue="updateBloom"
                        />
                        <GuiSlider
                            label="Exposure"
                            v-model="bloomSettings.exposure"
                            :min="0.1"
                            :max="2"
                            :step="0.1"
                            :precision="1"
                            @update:modelValue="updateBloom"
                        />
                    </GuiSection>

                    <!-- SSR Settings -->
                    <GuiSection title="SSR Settings" v-if="effects.ssr">
                        <GuiSlider
                            label="Resolution Scale"
                            v-model="ssrSettings.resolutionScale"
                            :min="0"
                            :max="1"
                            :step="0.05"
                            :precision="2"
                            @update:modelValue="updateSSR"
                        />
                        <GuiSlider
                            label="Thickness"
                            v-model="ssrSettings.thickness"
                            :min="0"
                            :max="0.1"
                            :step="0.001"
                            :precision="3"
                            @update:modelValue="updateSSR"
                        />
                        <GuiSlider
                            label="Max Distance"
                            v-model="ssrSettings.maxDistance"
                            :min="0"
                            :max="0.5"
                            :step="0.01"
                            :precision="2"
                            @update:modelValue="updateSSR"
                        />
                        <GuiSlider
                            label="Opacity"
                            v-model="ssrSettings.opacity"
                            :min="0"
                            :max="1"
                            :step="0.01"
                            :precision="2"
                            @update:modelValue="updateSSR"
                        />
                        <GuiCheckbox
                            label="Fresnel"
                            v-model="ssrSettings.fresnel"
                            @update:modelValue="updateSSR"
                        />
                        <GuiCheckbox
                            label="Distance Attenuation"
                            v-model="ssrSettings.distanceAttenuation"
                            @update:modelValue="updateSSR"
                        />
                        <GuiCheckbox
                            label="Blur"
                            v-model="ssrSettings.blur"
                            @update:modelValue="updateSSR"
                        />
                    </GuiSection>

                    <!-- AO Settings -->
                    <GuiSection title="AO Settings" v-if="effects.ao">
                        <GuiSlider
                            label="Radius"
                            v-model="aoSettings.radius"
                            :min="0.01"
                            :max="2"
                            :step="0.01"
                            :precision="2"
                            @update:modelValue="updateAO"
                        />
                        <GuiSlider
                            label="Distance Exponent"
                            v-model="aoSettings.distanceExponent"
                            :min="1"
                            :max="4"
                            :step="0.1"
                            :precision="1"
                            @update:modelValue="updateAO"
                        />
                        <GuiSlider
                            label="Thickness"
                            v-model="aoSettings.thickness"
                            :min="0.01"
                            :max="10"
                            :step="0.1"
                            :precision="2"
                            @update:modelValue="updateAO"
                        />
                        <GuiSlider
                            label="Scale"
                            v-model="aoSettings.scale"
                            :min="0.01"
                            :max="2"
                            :step="0.01"
                            :precision="2"
                            @update:modelValue="updateAO"
                        />
                        <GuiSlider
                            label="Samples"
                            v-model="aoSettings.samples"
                            :min="2"
                            :max="32"
                            :step="1"
                            @update:modelValue="updateAO"
                        />
                        <GuiSlider
                            label="Distance Fall Off"
                            v-model="aoSettings.distanceFallOff"
                            :min="0"
                            :max="1"
                            :step="0.01"
                            :precision="2"
                            @update:modelValue="updateAO"
                        />
                        <GuiSelect
                            label="Output Mode"
                            v-model="aoSettings.output"
                            :options="[
                                { value: 0, label: 'Material AO' },
                                { value: 1, label: 'Post Blended AO' },
                                { value: 2, label: 'Only Diffuse' },
                                { value: 3, label: 'Only AO' }
                            ]"
                            @update:modelValue="updateAO"
                        />
                    </GuiSection>

                    <!-- Scene Settings -->
                    <GuiSection title="Scene Settings">
                        <GuiCheckbox label="Auto Rotate" v-model="sceneSettings.autoRotate" />
                        <GuiSelect
                            label="Scene Object"
                            v-model="sceneSettings.objectType"
                            :options="[
                                { value: 'torusKnot', label: 'Torus Knot' },
                                { value: 'sphere', label: 'Sphere' },
                                { value: 'cube', label: 'Cube' },
                                { value: 'suzanne', label: 'Suzanne (Monkey)' }
                            ]"
                            @update:modelValue="changeSceneObject"
                        />
                    </GuiSection>
                </GuiPanel>
            </template>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { PostProcessing } from '@w3d/components';
import * as THREE from 'three';
import SplitLayout from '@/components/SplitLayout.vue';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiCheckbox,
    GuiSelect,
    GuiLoading
} from '@/components/Gui';
import { useSceneOnly } from '../../composables/useSceneOnly';
// Scene container ref
const sceneContainer = ref(null);
const isSceneOnly = useSceneOnly();

// Loading state
const isLoading = ref(true);
const loadingProgress = ref(0);
const loadingText = ref('Initializing scene...');

// Scene and components
let scene = null;
let postProcessing = null;
let sceneObject = null;

// Effect toggles
const effects = ref({
    sobel: false,
    ssr: false,
    bloom: true,
    ao: false
});

// Bloom settings
const bloomSettings = ref({
    threshold: 1,
    strength: 0.5,
    radius: 0.4,
    exposure: 1
});

// SSR settings
const ssrSettings = ref({
    resolutionScale: 0.5,
    thickness: 0.018,
    maxDistance: 0.1,
    opacity: 1,
    fresnel: true,
    distanceAttenuation: true,
    blur: true
});

// AO settings
const aoSettings = ref({
    radius: 0.5,
    distanceExponent: 2,
    thickness: 10,
    scale: 1,
    samples: 16,
    distanceFallOff: 1,
    output: 0
});

// Scene settings
const sceneSettings = ref({
    autoRotate: true,
    objectType: 'torusKnot'
});

// Initialize scene
onMounted(async () => {
    try {
        loadingText.value = 'Creating scene...';
        loadingProgress.value = 20;

        // Create scene
        scene = new Scene(sceneContainer.value, {
            isRendering: false,
            renderer: {
                antialias: true,
                toneMapping: THREE.ReinhardToneMapping
            },
            camera: {
                fov: 45,
                position: [0, 2, 8],
                lookAt: [0, 0, 0]
            }
        });

        scene.init();

        loadingText.value = 'Adding lights...';
        loadingProgress.value = 40;

        // Add lights
        scene.light.addAmbient({
            color: '#ffffff',
            intensity: 0.5
        });

        scene.light.addDirectional({
            color: '#ffffff',
            intensity: 1.0,
            position: [5, 5, 5]
        });

        scene.light.addPoint({
            color: '#ff0000',
            intensity: 50,
            position: [-3, 2, 0]
        });

        scene.light.addPoint({
            color: '#00ff00',
            intensity: 50,
            position: [3, 2, 0]
        });

        scene.light.addPoint({
            color: '#0000ff',
            intensity: 50,
            position: [0, 2, 3]
        });

        loadingText.value = 'Creating scene object...';
        loadingProgress.value = 60;

        // Create scene object
        createSceneObject(sceneSettings.value.objectType);

        // Add ground plane
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        scene.scene.add(ground);

        loadingText.value = 'Setting up post processing...';
        loadingProgress.value = 80;

        // Register and add PostProcessing component
        scene.registerComponent('PostProcessing', PostProcessing);

        postProcessing = await scene.add('PostProcessing', {
            name: 'postProcessing',
            bloom: {
                enabled: effects.value.bloom,
                threshold: bloomSettings.value.threshold,
                strength: bloomSettings.value.strength,
                radius: bloomSettings.value.radius,
                exposure: bloomSettings.value.exposure
            },
            ssr: {
                enabled: effects.value.ssr,
                resolutionScale: ssrSettings.value.resolutionScale,
                thickness: ssrSettings.value.thickness,
                maxDistance: ssrSettings.value.maxDistance,
                opacity: ssrSettings.value.opacity,
                fresnel: ssrSettings.value.fresnel,
                distanceAttenuation: ssrSettings.value.distanceAttenuation,
                blur: ssrSettings.value.blur
            },
            ao: {
                enabled: effects.value.ao,
                radius: aoSettings.value.radius,
                distanceExponent: aoSettings.value.distanceExponent,
                thickness: aoSettings.value.thickness,
                scale: aoSettings.value.scale,
                samples: aoSettings.value.samples,
                distanceFallOff: aoSettings.value.distanceFallOff,
                output: aoSettings.value.output
            },
            sobel: {
                enabled: effects.value.sobel
            }
        });

        // Start animation loop
        scene.start();

        loadingProgress.value = 100;
        setTimeout(() => {
            isLoading.value = false;
        }, 300);
    } catch (error) {
        console.error('Failed to initialize scene:', error);
        loadingText.value = 'Error: ' + error.message;
    }
});

// Cleanup
onUnmounted(() => {
    if (scene) {
        scene.dispose();
    }
});

// Create scene object
function createSceneObject(type) {
    // Remove existing object
    if (sceneObject) {
        scene.scene.remove(sceneObject);
        sceneObject.geometry?.dispose();
        sceneObject.material?.dispose();
    }

    let geometry;
    switch (type) {
        case 'torusKnot':
            geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32);
            break;
        case 'sphere':
            geometry = new THREE.SphereGeometry(1.5, 64, 64);
            break;
        case 'cube':
            geometry = new THREE.BoxGeometry(2, 2, 2);
            break;
        case 'suzanne':
            // For simplicity, use icosahedron as placeholder
            geometry = new THREE.IcosahedronGeometry(1.5, 2);
            break;
        default:
            geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32);
    }

    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.7
    });

    sceneObject = new THREE.Mesh(geometry, material);
    scene.scene.add(sceneObject);
}

// Update functions
function toggleSobel(enabled) {
    if (postProcessing) {
        postProcessing.toggleSobel(enabled);
    }
}

function toggleSSR(enabled) {
    if (postProcessing) {
        postProcessing.toggleSSR(enabled);
    }
}

function toggleBloom(enabled) {
    if (postProcessing) {
        postProcessing.toggleBloom(enabled);
    }
}

function toggleAO(enabled) {
    if (postProcessing) {
        postProcessing.toggleAO(enabled);
    }
}

function updateBloom() {
    if (postProcessing) {
        postProcessing.updateBloom({
            threshold: bloomSettings.value.threshold,
            strength: bloomSettings.value.strength,
            radius: bloomSettings.value.radius,
            exposure: bloomSettings.value.exposure
        });
    }
}

function updateSSR() {
    if (postProcessing) {
        postProcessing.updateSSR({
            resolutionScale: ssrSettings.value.resolutionScale,
            thickness: ssrSettings.value.thickness,
            maxDistance: ssrSettings.value.maxDistance,
            opacity: ssrSettings.value.opacity,
            fresnel: ssrSettings.value.fresnel,
            distanceAttenuation: ssrSettings.value.distanceAttenuation,
            blur: ssrSettings.value.blur
        });
    }
}

function updateAO() {
    if (postProcessing) {
        postProcessing.updateAO({
            radius: aoSettings.value.radius,
            distanceExponent: aoSettings.value.distanceExponent,
            thickness: aoSettings.value.thickness,
            scale: aoSettings.value.scale,
            samples: aoSettings.value.samples,
            distanceFallOff: aoSettings.value.distanceFallOff,
            output: aoSettings.value.output
        });
    }
}

function changeSceneObject(type) {
    createSceneObject(type);
}

// Animation loop
if (scene) {
    scene.onUpdate(() => {
        if (sceneObject && sceneSettings.value.autoRotate) {
            sceneObject.rotation.y += 0.005;
            sceneObject.rotation.x += 0.002;
        }
    });
}

// Source code
const sourceCode = `import { Scene } from '@w3d/core';
import { PostProcessing } from '@w3d/components';
import * as THREE from 'three';

// Create scene
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    toneMapping: THREE.ReinhardToneMapping
  },
  camera: {
    fov: 45,
    position: [0, 2, 8],
    lookAt: [0, 0, 0]
  }
});

scene.init();

// Add lights
scene.light.addAmbient({
  color: '#ffffff',
  intensity: 0.5
});

scene.light.addDirectional({
  color: '#ffffff',
  intensity: 1.0,
  position: [5, 5, 5]
});

// Add colored point lights for bloom effect
scene.light.addPoint({
  color: '#ff0000',
  intensity: 50,
  position: [-3, 2, 0]
});

scene.light.addPoint({
  color: '#00ff00',
  intensity: 50,
  position: [3, 2, 0]
});

scene.light.addPoint({
  color: '#0000ff',
  intensity: 50,
  position: [0, 2, 3]
});

// Create scene object
const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32);
const material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.3,
  metalness: 0.7
});
const mesh = new THREE.Mesh(geometry, material);
scene.scene.add(mesh);

// Add ground plane
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x808080,
  roughness: 0.8,
  metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
scene.scene.add(ground);

// Register and add PostProcessing component
scene.registerComponent('PostProcessing', PostProcessing);

const postProcessing = await scene.add('PostProcessing', {
  name: 'postProcessing',

  // Enable Bloom effect
  bloom: {
    enabled: true,
    threshold: 0,
    strength: 1.5,
    radius: 0.4,
    exposure: 1
  },

  // SSR (disabled by default)
  ssr: {
    enabled: false,
    resolutionScale: 0.5,
    thickness: 0.018,
    maxDistance: 0.1,
    opacity: 1,
    fresnel: true,
    distanceAttenuation: true,
    blur: true
  },

  // AO (disabled by default)
  ao: {
    enabled: false,
    radius: 0.5,
    distanceExponent: 2,
    thickness: 10,
    scale: 1,
    samples: 16,
    distanceFallOff: 1,
    output: 0
  },

  // Sobel (disabled by default)
  sobel: {
    enabled: false
  }
});

// Start animation
scene.start();

// Animate mesh
scene.onUpdate(() => {
  mesh.rotation.y += 0.005;
  mesh.rotation.x += 0.002;
});

// Toggle effects
postProcessing.toggleBloom(true);
postProcessing.toggleSSR(false);
postProcessing.toggleAO(false);
postProcessing.toggleSobel(false);

// Update effect parameters
postProcessing.updateBloom({
  strength: 2.0,
  threshold: 0.5
});

postProcessing.updateSSR({
  thickness: 0.02,
  opacity: 0.8
});

postProcessing.updateAO({
  radius: 0.8,
  samples: 24
});

// Listen to events
postProcessing.on('bloomSetup', () => {
  console.log('Bloom effect setup complete');
});

postProcessing.on('bloomUpdated', (config) => {
  console.log('Bloom parameters updated:', config);
});
`;
</script>

<style scoped lang="less">
.scene-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 8px;
}
</style>
