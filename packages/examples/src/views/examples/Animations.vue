<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="05 - Path Animations"
        :sceneOnly="isSceneOnly"
    >
        <div class="scene-container" ref="sceneContainer">
            <GuiLoading
                :visible="isLoading"
                :text="loadingText || 'Loading...'"
                :showProgress="true"
                :progress="loadingProgress || 0"
            />

            <GuiPanel title="Path Animation">
                <GuiSection title="Playback Control">
                    <div class="playback-controls">
                        <GuiButton
                            :label="animationStatus.isPlaying ? 'Pause' : 'Play'"
                            @click="playAnimation"
                        />
                        <GuiButton label="Stop" variant="secondary" @click="stopAnimation" />
                        <GuiButton label="Reset" variant="secondary" @click="resetAnimation" />
                    </div>

                    <div class="status-display">
                        <GuiInfoItem
                            label="Status:"
                            :value="
                                animationStatus.isPlaying
                                    ? 'Playing'
                                    : animationStatus.isPaused
                                    ? 'Paused'
                                    : 'Stopped'
                            "
                        />
                        <GuiInfoItem
                            label="Progress:"
                            :value="`${(animationStatus.progress * 100).toFixed(1)}%`"
                        />
                    </div>

                    <GuiSlider
                        label="Animation Progress"
                        :modelValue="animationStatus.progress"
                        @update:modelValue="seekToProgress"
                        :min="0"
                        :max="1"
                        :step="0.01"
                        :precision="3"
                        suffix="%"
                    />
                    <GuiSlider
                        label="Movement Speed"
                        v-model="pathSettings.speed"
                        @change="updateSpeed"
                        :min="0.1"
                        :max="10"
                        :step="0.1"
                        :precision="1"
                        suffix=" units/sec"
                    />
                </GuiSection>

                <GuiSection title="Loop Mode">
                    <GuiRadio
                        v-model="pathSettings.loopMode"
                        @change="updateLoopMode"
                        :options="[
                            { value: 'none', label: 'Play Once' },
                            { value: 'loop', label: 'Loop' },
                            { value: 'pingPong', label: 'Ping Pong' }
                        ]"
                    />
                </GuiSection>

                <GuiSection title="Object Orientation">
                    <GuiSelect
                        label="Orientation Mode"
                        v-model="pathSettings.lookAtDirection"
                        @change="updateLookAtDirection"
                        :options="[
                            { value: 'forward', label: 'Face Movement Direction' },
                            { value: 'backward', label: 'Face Opposite Direction' },
                            { value: 'up', label: 'Face Up (+Y)' },
                            { value: 'down', label: 'Face Down (-Y)' },
                            { value: 'fixed', label: 'Fixed Orientation' },
                            { value: 'custom', label: 'Custom Orientation' }
                        ]"
                    />

                    <div v-if="pathSettings.lookAtDirection === 'custom'" class="custom-rotation">
                        <GuiSlider
                            label="X Rotation"
                            v-model="customRotation.x"
                            @change="updateCustomRotation"
                            :min="-180"
                            :max="180"
                            :step="1"
                            suffix="°"
                        />
                        <GuiSlider
                            label="Y Rotation"
                            v-model="customRotation.y"
                            @change="updateCustomRotation"
                            :min="-180"
                            :max="180"
                            :step="1"
                            suffix="°"
                        />
                        <GuiSlider
                            label="Z Rotation"
                            v-model="customRotation.z"
                            @change="updateCustomRotation"
                            :min="-180"
                            :max="180"
                            :step="1"
                            suffix="°"
                        />
                    </div>
                </GuiSection>

                <GuiSection title="Easing Effect">
                    <GuiSelect
                        label="Easing Function"
                        v-model="pathSettings.easing"
                        @change="updateEasing"
                        :options="[
                            { value: 'linear', label: 'Linear' },
                            { value: 'easeIn', label: 'Ease In' },
                            { value: 'easeOut', label: 'Ease Out' },
                            { value: 'easeInOut', label: 'Ease In Out' }
                        ]"
                    />
                </GuiSection>

                <GuiSection title="Preset Paths">
                    <div class="preset-buttons">
                        <GuiButton
                            label="Line Path"
                            variant="secondary"
                            @click="loadPresetPath('line')"
                        />
                        <GuiButton
                            label="Triangle Path"
                            variant="secondary"
                            @click="loadPresetPath('triangle')"
                        />
                        <GuiButton
                            label="Rectangle Path"
                            variant="secondary"
                            @click="loadPresetPath('rectangle')"
                        />
                        <GuiButton
                            label="Circle Path"
                            variant="secondary"
                            @click="loadPresetPath('circle')"
                        />
                        <GuiButton
                            label="Spiral Path"
                            variant="secondary"
                            @click="loadPresetPath('spiral')"
                        />
                    </div>
                </GuiSection>

                <GuiSection title="Path Information">
                    <GuiInfoItem label="Path Points:" :value="currentPath.length" />
                    <GuiInfoItem
                        label="Total Distance:"
                        :value="`${animationStatus.totalDistance.toFixed(2)} units`"
                    />
                    <GuiInfoItem
                        label="Current Distance:"
                        :value="`${animationStatus.currentDistance.toFixed(2)} units`"
                    />
                </GuiSection>
            </GuiPanel>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { PathAnimation, GridHelper } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiSelect,
    GuiButton,
    GuiInfoItem,
    GuiLoading,
    GuiRadio
} from '@/components/Gui';
import * as THREE from 'three';
import { useSceneOnly } from '../../composables/useSceneOnly';

// Detect if in sceneOnly mode
const isSceneOnly = useSceneOnly();

// Basic state
const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('Initializing scene...');
const loadingProgress = ref(0);

// Scene and component references
let scene = null;
let pathAnimation = null;
let animatedObject = null;

// Animation status
const animationStatus = reactive({
    isPlaying: false,
    isPaused: false,
    progress: 0,
    currentDistance: 0,
    totalDistance: 0
});

// Path settings
const pathSettings = reactive({
    speed: 2.0,
    loopMode: 'loop', // 'none', 'loop', 'pingPong'
    lookAtDirection: 'forward',
    easing: 'linear',
    showPath: true
});

// Custom rotation angles
const customRotation = reactive({
    x: 0,
    y: 0,
    z: 0
});

// Preset paths
const presetPaths = {
    line: [
        [0, 0, 0],
        [20, 0, 0]
    ],
    triangle: [
        [0, 0, 0],
        [10, 0, 10],
        [-10, 0, 10]
    ],
    rectangle: [
        [-10, 0, -5],
        [10, 0, -5],
        [10, 0, 5],
        [-10, 0, 5]
    ],
    circle: [],
    spiral: []
};

// Generate circle path
const generateCirclePath = () => {
    const points = [];
    const radius = 8;
    const pointCount = 12;

    for (let i = 0; i < pointCount; i++) {
        const angle = (i / pointCount) * Math.PI * 2;
        points.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return points;
};

// Generate spiral path
const generateSpiralPath = () => {
    const points = [];
    const turns = 2;
    const height = 15;
    const radius = 6;

    for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const angle = t * turns * Math.PI * 2;
        points.push([Math.cos(angle) * radius, t * height, Math.sin(angle) * radius]);
    }
    return points;
};

// Initialize preset paths
presetPaths.circle = generateCirclePath();
presetPaths.spiral = generateSpiralPath();

// Current path in use
const currentPath = ref([...presetPaths.rectangle]);

// Source code display
const sourceCode = `import { Scene } from '@w3d/core';
import { PathAnimation, GridHelper } from '@w3d/components';

// Create scene
const scene = new Scene(container, {
  renderer: {
    antialias: true,
    outputColorSpace: 'srgb'
  },
  camera: {
    fov: 45,
    position: [15, 10, 15],
    lookAt: [0, 0, 0]
  }
});

// Initialize scene
scene.init();
scene.renderer.enableShadow(true);
scene.renderer.enableResize();

// Register components
scene.registerComponent('PathAnimation', PathAnimation);
scene.registerComponent('GridHelper', GridHelper);

// Add grid helper
await scene.add('GridHelper', {
  name: 'grid',
  size: 30,
  divisions: 30,
  color: '#444444'
});

// ===== Basic Path Animation =====

// Create moving object (cube)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: '#00ff88' });
const cube = new THREE.Mesh(geometry, material);
scene.scene.add(cube);

// Create path animation
const pathAnim = await scene.add('PathAnimation', {
  name: 'cubeAnimation',
  path: [
    [-10, 0, -5],  // Start point
    [10, 0, -5],   // Top right
    [10, 0, 5],    // Bottom right
    [-10, 0, 5]    // Bottom left
  ],
  speed: 2.0,              // Movement speed
  loop: true,              // Loop playback
  pingPong: false,         // Ping pong mode
  lookAtDirection: 'forward', // Face movement direction
  easing: 'linear',        // Easing function
  showPath: true,          // Show path
  pathColor: '#00ff88'     // Path color
});

// Add cube to path animation
pathAnim.add(cube);

// ===== Path Animation Control =====

// Playback control
pathAnim.play();         // Play
pathAnim.pause();        // Pause
pathAnim.stop();         // Stop
pathAnim.reset();        // Reset

// Jump control
pathAnim.jumpToProgress(0.5);  // Jump to 50% progress
pathAnim.jumpToPoint(2);       // Jump to 3rd path point

// Config update
pathAnim.updateConfig({
  speed: 3.0,
  lookAtDirection: 'up',
  easing: 'easeInOut'
});

// ===== Preset Path Examples =====

// Circle path
const circlePoints = [];
const radius = 8;
for (let i = 0; i < 12; i++) {
  const angle = (i / 12) * Math.PI * 2;
  circlePoints.push([
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius
  ]);
}

const circleAnim = await scene.add('PathAnimation', {
  name: 'circleMotion',
  path: circlePoints,
  speed: 1.5,
  loop: true,
  lookAtDirection: 'forward'
});

// Spiral ascending path
const spiralPoints = [];
const turns = 2;
const height = 15;
for (let i = 0; i <= 30; i++) {
  const t = i / 30;
  const angle = t * turns * Math.PI * 2;
  spiralPoints.push([
    Math.cos(angle) * 6,
    t * height,
    Math.sin(angle) * 6
  ]);
}

const spiralAnim = await scene.add('PathAnimation', {
  name: 'spiralMotion',
  path: spiralPoints,
  speed: 2.0,
  loop: false,
  lookAtDirection: 'forward',
  easing: 'easeInOut'
});

// ===== Event Listeners =====

// Listen to animation update
pathAnim.on('update', (data) => {
  console.log('Progress:', data.progress);
  console.log('Current position:', data.point);
});

// Listen to animation complete
pathAnim.on('complete', () => {
  console.log('Animation playback complete');
});

// Listen to ping pong mode events
pathAnim.on('reachEnd', () => {
  console.log('Reached end, starting return');
});

pathAnim.on('reachStart', () => {
  console.log('Returned to start, restarting');
});

// ===== Advanced Features =====

// Dynamically add path point
pathAnim.addPathPoint([15, 5, 0]);

// Remove path point
pathAnim.removePathPoint(1);

// Update entire path
pathAnim.updatePath([
  [0, 0, 0],
  [20, 10, 0],
  [0, 20, 0]
]);

// Get animation status
const status = pathAnim.getStatus();
console.log('Playback status:', status.isPlaying);
console.log('Current progress:', status.progress);

// Start render loop
scene.start();`;

// Initialize scene
const initScene = async () => {
    if (!sceneContainer.value) return;

    try {
        isLoading.value = true;
        loadingText.value = 'Initializing scene...';
        loadingProgress.value = 20;

        // Create scene
        scene = new Scene(sceneContainer.value, {
            renderer: {
                antialias: true,
                outputColorSpace: 'srgb'
            },
            camera: {
                fov: 45,
                position: [15, 10, 15],
                lookAt: [0, 0, 0]
            }
        });

        scene.init();
        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        loadingProgress.value = 40;

        // Register components
        scene.registerComponent('PathAnimation', PathAnimation);
        scene.registerComponent('GridHelper', GridHelper);

        loadingProgress.value = 60;

        // Add grid helper
        await scene.add('GridHelper', {
            name: 'grid',
            size: 30,
            divisions: 30,
            color: '#444444'
        });

        loadingProgress.value = 80;

        // Create moving object
        await createAnimatedObject();

        // Create path animation
        await createPathAnimation();

        loadingProgress.value = 100;

        // Start rendering
        scene.start();

        loadingText.value = 'Scene initialization complete';
    } catch (error) {
        console.error('Scene initialization failed:', error);
        loadingText.value = 'Initialization failed: ' + error.message;
    } finally {
        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    }
};

// Create moving object
const createAnimatedObject = async () => {
    // Here we use Three.js to create a simple cube
    // In real applications, you can use ModelLoader to load 3D models
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
        color: '#00ff88',
        transparent: true,
        opacity: 0.8
    });

    animatedObject = new THREE.Mesh(geometry, material);
    animatedObject.castShadow = true;
    animatedObject.receiveShadow = true;

    scene.scene.add(animatedObject);
};

// Create path animation
const createPathAnimation = async () => {
    pathAnimation = await scene.add('PathAnimation', {
        name: 'mainPathAnimation',
        path: currentPath.value,
        speed: pathSettings.speed,
        loop: pathSettings.loopMode === 'loop',
        pingPong: pathSettings.loopMode === 'pingPong',
        lookAtDirection: pathSettings.lookAtDirection,
        customRotation: [
            (customRotation.x * Math.PI) / 180,
            (customRotation.y * Math.PI) / 180,
            (customRotation.z * Math.PI) / 180
        ],
        easing: pathSettings.easing,
        showPath: pathSettings.showPath,
        pathColor: '#00ff88',
        pathWidth: 3
    });

    // Add moving object to path animation
    if (animatedObject) {
        pathAnimation.add(animatedObject);
    }

    // Listen to animation events
    setupAnimationEvents();
};

// Setup animation event listeners
const setupAnimationEvents = () => {
    if (!pathAnimation) return;

    pathAnimation.on('update', (data) => {
        animationStatus.progress = data.progress;
        animationStatus.currentDistance = data.currentDistance;
        animationStatus.totalDistance = data.totalDistance;
    });

    pathAnimation.on('play', () => {
        animationStatus.isPlaying = true;
        animationStatus.isPaused = false;
    });

    pathAnimation.on('pause', () => {
        animationStatus.isPlaying = false;
        animationStatus.isPaused = true;
    });

    pathAnimation.on('stop', () => {
        animationStatus.isPlaying = false;
        animationStatus.isPaused = false;
        animationStatus.progress = 0;
    });

    pathAnimation.on('reset', () => {
        animationStatus.isPlaying = false;
        animationStatus.isPaused = false;
        animationStatus.progress = 0;
    });

    pathAnimation.on('complete', () => {
        console.log('Path animation playback complete');
    });

    pathAnimation.on('reachEnd', () => {
        console.log('Reached path end');
    });

    pathAnimation.on('reachStart', () => {
        console.log('Returned to path start');
    });
};

// Playback control methods
const playAnimation = () => {
    if (!pathAnimation) return;

    if (animationStatus.isPlaying) {
        pathAnimation.pause();
    } else {
        pathAnimation.play();
    }
};

const stopAnimation = () => {
    if (!pathAnimation) return;
    pathAnimation.stop();
};

const resetAnimation = () => {
    if (!pathAnimation) return;
    pathAnimation.reset();
};

// Progress control
const seekToProgress = (event) => {
    if (!pathAnimation) return;
    const progress = parseFloat(event.target.value);
    pathAnimation.jumpToProgress(progress);
};

// Speed control
const updateSpeed = () => {
    if (!pathAnimation) return;
    pathAnimation.updateConfig({ speed: pathSettings.speed });
};

// Loop mode control
const updateLoopMode = () => {
    if (!pathAnimation) return;

    pathAnimation.updateConfig({
        loop: pathSettings.loopMode === 'loop',
        pingPong: pathSettings.loopMode === 'pingPong'
    });
};

// Orientation control
const updateLookAtDirection = () => {
    if (!pathAnimation) return;

    pathAnimation.updateConfig({
        lookAtDirection: pathSettings.lookAtDirection
    });
};

// Custom rotation control
const updateCustomRotation = () => {
    if (!pathAnimation) return;

    pathAnimation.updateConfig({
        customRotation: [
            (customRotation.x * Math.PI) / 180,
            (customRotation.y * Math.PI) / 180,
            (customRotation.z * Math.PI) / 180
        ]
    });
};

// Easing function control
const updateEasing = () => {
    if (!pathAnimation) return;

    pathAnimation.updateConfig({
        easing: pathSettings.easing
    });
};

// Load preset path
const loadPresetPath = async (pathType) => {
    if (!presetPaths[pathType]) return;

    try {
        // Update current path
        currentPath.value = [...presetPaths[pathType]];

        // If path animation exists, update path
        if (pathAnimation) {
            pathAnimation.updatePath(currentPath.value);
        }

        console.log(`Loaded ${pathType} path with ${currentPath.value.length} points`);
    } catch (error) {
        console.error('Failed to load preset path:', error);
    }
};

// Clean up resources
const cleanup = () => {
    if (pathAnimation) {
        pathAnimation.stop();
    }

    if (scene) {
        scene.dispose();
        scene = null;
    }

    pathAnimation = null;
    animatedObject = null;
};

// Lifecycle hooks
onMounted(async () => {
    try {
        await initScene();
    } catch (error) {
        console.error('Initialization failed:', error);
        isLoading.value = false;
        loadingText.value = 'Initialization failed: ' + error.message;
    }
});

onUnmounted(() => {
    cleanup();
});
</script>

<style scoped lang="less">
@import '@/styles/gui.less';

.scene-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.playback-controls {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
}

.status-display {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    border: 1px solid rgba(0, 255, 136, 0.1);
    margin-top: 10px;
}

.custom-rotation {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.preset-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}
</style>
