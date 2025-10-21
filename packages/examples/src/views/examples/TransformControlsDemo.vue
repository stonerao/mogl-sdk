<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="21 - Transform Controls"
        :sceneOnly="isSceneOnly"
    >
        <div class="scene-container" ref="sceneContainer">
            <GuiLoading
                :visible="isLoading"
                :text="loadingText"
                :showProgress="true"
                :progress="loadingProgress"
            />

            <GuiPanel title="Transform Controls">
                <GuiSection title="Transform Mode">
                    <div class="mode-buttons">
                        <GuiButton
                            :label="mode === 'translate' ? '✓ Translate (W)' : 'Translate (W)'"
                            :variant="mode === 'translate' ? 'primary' : 'secondary'"
                            size="small"
                            @click="setMode('translate')"
                        />
                        <GuiButton
                            :label="mode === 'rotate' ? '✓ Rotate (E)' : 'Rotate (E)'"
                            :variant="mode === 'rotate' ? 'primary' : 'secondary'"
                            size="small"
                            @click="setMode('rotate')"
                        />
                        <GuiButton
                            :label="mode === 'scale' ? '✓ Scale (R)' : 'Scale (R)'"
                            :variant="mode === 'scale' ? 'primary' : 'secondary'"
                            size="small"
                            @click="setMode('scale')"
                        />
                    </div>
                </GuiSection>

                <GuiSection title="Coordinate Space">
                    <div class="space-buttons">
                        <GuiButton
                            :label="space === 'world' ? '✓ World (Q)' : 'World (Q)'"
                            :variant="space === 'world' ? 'primary' : 'secondary'"
                            size="small"
                            @click="setSpace('world')"
                        />
                        <GuiButton
                            :label="space === 'local' ? '✓ Local (Q)' : 'Local (Q)'"
                            :variant="space === 'local' ? 'primary' : 'secondary'"
                            size="small"
                            @click="setSpace('local')"
                        />
                    </div>
                </GuiSection>

                <GuiSection title="Control Settings">
                    <GuiCheckbox
                        label="Enabled (Spacebar)"
                        v-model="enabled"
                        @change="toggleEnabled"
                    />
                    <GuiSlider
                        label="Control Size"
                        v-model="controlSize"
                        :min="0.5"
                        :max="2"
                        :step="0.1"
                        :precision="1"
                        @change="updateControlSize"
                    />
                </GuiSection>

                <GuiSection title="Axis Visibility">
                    <GuiCheckbox
                        label="Show X Axis"
                        v-model="showX"
                        @change="updateAxisVisibility"
                    />
                    <GuiCheckbox
                        label="Show Y Axis"
                        v-model="showY"
                        @change="updateAxisVisibility"
                    />
                    <GuiCheckbox
                        label="Show Z Axis"
                        v-model="showZ"
                        @change="updateAxisVisibility"
                    />
                </GuiSection>

                <GuiSection title="Snap Settings">
                    <GuiCheckbox
                        label="Enable Snap (Shift)"
                        v-model="snapEnabled"
                        @change="toggleSnap"
                    />
                    <GuiSlider
                        label="Translation Snap"
                        v-model="translationSnap"
                        :min="0.1"
                        :max="2"
                        :step="0.1"
                        :precision="1"
                        :disabled="!snapEnabled"
                        @change="updateSnap"
                    />
                    <GuiSlider
                        label="Rotation Snap (deg)"
                        v-model="rotationSnapDeg"
                        :min="5"
                        :max="90"
                        :step="5"
                        :disabled="!snapEnabled"
                        @change="updateSnap"
                    />
                    <GuiSlider
                        label="Scale Snap"
                        v-model="scaleSnap"
                        :min="0.1"
                        :max="1"
                        :step="0.05"
                        :precision="2"
                        :disabled="!snapEnabled"
                        @change="updateSnap"
                    />
                </GuiSection>

                <GuiSection title="Select Object">
                    <div class="object-buttons">
                        <GuiButton
                            label="Cube (1)"
                            :variant="currentObjectIndex === 0 ? 'primary' : 'secondary'"
                            size="small"
                            @click="selectObject(0)"
                        />
                        <GuiButton
                            label="Sphere (2)"
                            :variant="currentObjectIndex === 1 ? 'primary' : 'secondary'"
                            size="small"
                            @click="selectObject(1)"
                        />
                        <GuiButton
                            label="Cylinder (3)"
                            :variant="currentObjectIndex === 2 ? 'primary' : 'secondary'"
                            size="small"
                            @click="selectObject(2)"
                        />
                    </div>
                </GuiSection>

                <GuiSection title="Actions">
                    <GuiButton
                        label="Reset Transform (ESC)"
                        variant="secondary"
                        block
                        @click="resetTransform"
                    />
                </GuiSection>

                <GuiSection title="Object Transform">
                    <GuiInfoItem label="Position" :value="objectPosition" />
                    <GuiInfoItem label="Rotation" :value="objectRotation" />
                    <GuiInfoItem label="Scale" :value="objectScale" />
                </GuiSection>

                <GuiSection title="Keyboard Shortcuts">
                    <div class="shortcuts">
                        <div class="shortcut-item">
                            <span class="key">W</span>
                            <span class="desc">Translate Mode</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="key">E</span>
                            <span class="desc">Rotate Mode</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="key">R</span>
                            <span class="desc">Scale Mode</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="key">Q</span>
                            <span class="desc">Toggle Space</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="key">Space</span>
                            <span class="desc">Toggle Enabled</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="key">Shift</span>
                            <span class="desc">Enable Snap</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="key">ESC</span>
                            <span class="desc">Reset</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="key">1-3</span>
                            <span class="desc">Select Object</span>
                        </div>
                    </div>
                </GuiSection>
            </GuiPanel>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { TransformControls, GridHelper } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';
import {
    GuiPanel,
    GuiSection,
    GuiSlider,
    GuiCheckbox,
    GuiButton,
    GuiLoading,
    GuiInfoItem
} from '@/components/Gui';
import * as THREE from 'three';
import { useSceneOnly } from '../../composables/useSceneOnly';

// Detect if in sceneOnly mode
const isSceneOnly = useSceneOnly();

const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('');
const loadingProgress = ref(0);

// Transform controls state
const mode = ref('translate');
const space = ref('world');
const enabled = ref(true);
const controlSize = ref(1);
const showX = ref(true);
const showY = ref(true);
const showZ = ref(true);

// Snap settings
const snapEnabled = ref(false);
const translationSnap = ref(1);
const rotationSnapDeg = ref(15);
const scaleSnap = ref(0.25);

// Object selection
const currentObjectIndex = ref(0);

// Object transform info
const objectTransform = reactive({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
});

const objectPosition = computed(() =>
    `(${objectTransform.position.map(v => v.toFixed(2)).join(', ')})`
);
const objectRotation = computed(() =>
    `(${objectTransform.rotation.map(v => (v * 180 / Math.PI).toFixed(1)).join('°, ')})°`
);
const objectScale = computed(() =>
    `(${objectTransform.scale.map(v => v.toFixed(2)).join(', ')})`
);

let scene = null;
let transformControls = null;
let objects = [];

// Source code display
const sourceCode = `import { Scene } from '@w3d/core';
import { TransformControls, GridHelper } from '@w3d/components';
import * as THREE from 'three';

// Create scene
const scene = new Scene(container, {
  renderer: { antialias: true },
  camera: {
    fov: 45,
    position: [8, 6, 8],
    lookAt: [0, 0, 0]
  }
});

scene.init();

// Add lighting
scene.light.addAmbient({ color: '#ffffff', intensity: 0.6 });
scene.light.addDirectional({
  color: '#ffffff',
  intensity: 0.8,
  position: [10, 10, 5],
  castShadow: true
});

scene.renderer.enableShadow(true);
scene.renderer.enableResize();

// Add grid
scene.registerComponent('GridHelper', GridHelper);
await scene.add('GridHelper', {
  name: 'grid',
  size: 20,
  divisions: 20
});

// Create objects
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({ color: '#00ff88' })
);
cube.position.set(-3, 1, 0);
cube.castShadow = true;
scene.scene.add(cube);

// Register and create TransformControls
scene.registerComponent('TransformControls', TransformControls);
const transformControls = await scene.add('TransformControls', {
  name: 'transform',
  mode: 'translate',
  size: 1,
  space: 'world'
});

// Attach to object
transformControls.attach(cube);

// Listen to events
transformControls.on('object-change', (data) => {
  console.log('Position:', data.position);
  console.log('Rotation:', data.rotation);
  console.log('Scale:', data.scale);
});

// Keyboard shortcuts
window.addEventListener('keydown', (event) => {
  switch (event.key.toLowerCase()) {
    case 'w': transformControls.setMode('translate'); break;
    case 'e': transformControls.setMode('rotate'); break;
    case 'r': transformControls.setMode('scale'); break;
    case 'q':
      const space = transformControls.getSpace();
      transformControls.setSpace(space === 'world' ? 'local' : 'world');
      break;
    case ' ':
      const control = transformControls.getControl();
      transformControls.setEnabled(!control.enabled);
      break;
    case 'escape':
      transformControls.reset();
      break;
  }
});

// Shift key for snap
window.addEventListener('keydown', (event) => {
  if (event.key === 'Shift') {
    transformControls.setTranslationSnap(1);
    transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
    transformControls.setScaleSnap(0.25);
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'Shift') {
    transformControls.setTranslationSnap(null);
    transformControls.setRotationSnap(null);
    transformControls.setScaleSnap(null);
  }
});

scene.start();`;

onMounted(() => {
    initScene();
    setupKeyboardShortcuts();
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
                position: [8, 6, 8],
                lookAt: [0, 0, 0]
            }
        });

        loadingProgress.value = 30;
        scene.init();

        loadingProgress.value = 50;
        loadingText.value = 'Setting up lights...';

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

        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        loadingProgress.value = 70;
        loadingText.value = 'Adding scene objects...';

        // Register and add grid
        scene.registerComponent('GridHelper', GridHelper);
        await scene.add('GridHelper', {
            name: 'grid',
            size: 20,
            divisions: 20,
            color: '#888888'
        });

        // Create objects
        createObjects();

        loadingProgress.value = 80;
        loadingText.value = 'Creating transform controls...';

        // Register and create TransformControls
        scene.registerComponent('TransformControls', TransformControls);
        transformControls = await scene.add('TransformControls', {
            name: 'transform',
            mode: mode.value,
            size: controlSize.value,
            space: space.value,
            enabled: enabled.value,
            showX: showX.value,
            showY: showY.value,
            showZ: showZ.value
        });

        // Attach to first object
        transformControls.attach(objects[currentObjectIndex.value]);

        // Setup event listeners
        setupTransformEvents();

        loadingProgress.value = 100;
        loadingText.value = 'Complete';

        // Start rendering
        scene.start();

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

// Create 3D objects
const createObjects = () => {
    // Cube
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: '#00ff88' });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(-3, 1, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.scene.add(cube);
    objects.push(cube);

    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: '#ff0088' });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 1, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.scene.add(sphere);
    objects.push(sphere);

    // Cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
    const cylinderMaterial = new THREE.MeshStandardMaterial({ color: '#0088ff' });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(3, 1, 0);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    scene.scene.add(cylinder);
    objects.push(cylinder);
};

// Setup transform events
const setupTransformEvents = () => {
    if (!transformControls) return;

    // Listen to object change
    transformControls.on('object-change', (data) => {
        objectTransform.position = data.position || [0, 0, 0];
        objectTransform.rotation = data.rotation || [0, 0, 0];
        objectTransform.scale = data.scale || [1, 1, 1];
    });

    // Listen to mode change
    transformControls.on('mode-changed', (data) => {
        mode.value = data.mode;
    });

    // Listen to space change
    transformControls.on('space-changed', (data) => {
        space.value = data.space;
    });

    // Listen to enabled change
    transformControls.on('enabled-changed', (data) => {
        enabled.value = data.enabled;
    });
};

// Setup keyboard shortcuts
const setupKeyboardShortcuts = () => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
};

const handleKeyDown = (event) => {
    if (!transformControls) return;

    switch (event.key.toLowerCase()) {
        case 'w':
            setMode('translate');
            break;
        case 'e':
            setMode('rotate');
            break;
        case 'r':
            setMode('scale');
            break;
        case 'q':
            toggleSpace();
            break;
        case ' ':
            event.preventDefault();
            toggleEnabled();
            break;
        case 'escape':
            resetTransform();
            break;
        case '1':
        case '2':
        case '3':
            const index = parseInt(event.key) - 1;
            if (index >= 0 && index < objects.length) {
                selectObject(index);
            }
            break;
    }

    // Shift key for snap
    if (event.key === 'Shift') {
        snapEnabled.value = true;
        updateSnap();
    }
};

const handleKeyUp = (event) => {
    if (event.key === 'Shift') {
        snapEnabled.value = false;
        updateSnap();
    }
};

// Control methods
const setMode = (newMode) => {
    if (!transformControls) return;
    transformControls.setMode(newMode);
    mode.value = newMode;
};

const setSpace = (newSpace) => {
    if (!transformControls) return;
    transformControls.setSpace(newSpace);
    space.value = newSpace;
};

const toggleSpace = () => {
    const newSpace = space.value === 'world' ? 'local' : 'world';
    setSpace(newSpace);
};

const toggleEnabled = () => {
    if (!transformControls) return;
    const newEnabled = !enabled.value;
    transformControls.setEnabled(newEnabled);
    enabled.value = newEnabled;
};

const updateControlSize = () => {
    if (!transformControls) return;
    transformControls.setSize(controlSize.value);
};

const updateAxisVisibility = () => {
    if (!transformControls) return;
    transformControls.setAxisVisible('x', showX.value);
    transformControls.setAxisVisible('y', showY.value);
    transformControls.setAxisVisible('z', showZ.value);
};

const toggleSnap = () => {
    updateSnap();
};

const updateSnap = () => {
    if (!transformControls) return;

    if (snapEnabled.value) {
        transformControls.setTranslationSnap(translationSnap.value);
        transformControls.setRotationSnap(THREE.MathUtils.degToRad(rotationSnapDeg.value));
        transformControls.setScaleSnap(scaleSnap.value);
    } else {
        transformControls.setTranslationSnap(null);
        transformControls.setRotationSnap(null);
        transformControls.setScaleSnap(null);
    }
};

const selectObject = (index) => {
    if (!transformControls || index < 0 || index >= objects.length) return;

    currentObjectIndex.value = index;
    console.log(objects[index])
    transformControls.attach(objects[index]);

    // Update transform info
    const obj = objects[index];
    objectTransform.position = obj.position.toArray();
    objectTransform.rotation = obj.rotation.toArray();
    objectTransform.scale = obj.scale.toArray();
};

const resetTransform = () => {
    if (!transformControls) return;
    transformControls.reset();
    transformControls.detach();
};

// Cleanup resources
const cleanup = () => {
    console.log('Cleaning up Transform Controls example');

    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);

    if (scene) {
        scene.dispose();
        scene = null;
    }

    transformControls = null;
    objects = [];
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';

.scene-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.mode-buttons,
.space-buttons,
.object-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
}

.space-buttons {
    grid-template-columns: 1fr 1fr;
}

.shortcuts {
    font-size: 12px;
    line-height: 1.6;
}

.shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.shortcut-item:last-child {
    border-bottom: none;
}

.key {
    display: inline-block;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    font-family: monospace;
    font-weight: bold;
    min-width: 50px;
    text-align: center;
}

.desc {
    color: rgba(255, 255, 255, 0.7);
}
</style>


