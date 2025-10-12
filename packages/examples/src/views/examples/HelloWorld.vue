<template>
  <SplitLayout 
    :code="sourceCode" 
    language="javascript"
    title="01 - Hello World"
  >
    <!-- 3D 场景容器 -->
    <div ref="sceneContainer" class="scene-container"></div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <h3 class="panel-title">场景信息</h3>
      <div class="info-item">
        <span>FPS:</span>
        <span class="value">{{ fps }}</span>
      </div>
      <div class="info-item">
        <span>立方体旋转:</span>
        <span class="value">{{ cubeRotation.toFixed(2) }} rad</span>
      </div>
      <div class="info-item">
        <span>相机位置:</span>
        <span class="value">{{ cameraPosition }}</span>
      </div>
    </div>
  </SplitLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { GridHelper } from '@w3d/components';
import * as THREE from 'three';
import SplitLayout from '../../components/SplitLayout.vue';

const sceneContainer = ref(null);
const fps = ref(60);
const cubeRotation = ref(0);
const cameraPos = ref({ x: 5, y: 5, z: 10 });

const cameraPosition = computed(() => {
  return `(${cameraPos.value.x.toFixed(1)}, ${cameraPos.value.y.toFixed(1)}, ${cameraPos.value.z.toFixed(1)})`;
});

let scene = null;
let cube = null;

// 源代码
const sourceCode = `import { Scene } from '@w3d/core';
import { GridHelper } from '@w3d/components';
import * as THREE from 'three';

// 创建场景
const scene = new Scene(container, {
  renderer: {
    antialias: true
  },
  camera: {
    fov: 45,
    position: [5, 5, 10],
    lookAt: [0, 0, 0]
  }
});

// 初始化场景
scene.init();

// 添加环境光
scene.light.addAmbient({
  color: '#ffffff',
  intensity: 0.6
});

// 添加平行光
scene.light.addDirectional({
  color: '#ffffff',
  intensity: 0.8,
  position: [5, 5, 5],
  castShadow: true
});

// 启用阴影
scene.renderer.enableShadow(true);

// 启用自动调整大小
scene.renderer.enableResize();

// 注册组件
scene.registerComponent('GridHelper', GridHelper);

// 添加网格辅助
scene.add('GridHelper', {
  name: 'grid',
  size: 20,
  divisions: 20
});

// 创建立方体
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshStandardMaterial({
  color: '#00ff00',
  roughness: 0.5,
  metalness: 0.5
});
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.y = 1;
scene.scene.add(cube);

// 创建地面
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ 
    color: '#808080',
    roughness: 0.8,
    metalness: 0.2
  })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.scene.add(ground);

// 动画循环
const originalUpdate = scene.animate.bind(scene);
scene.animate = function() {
  originalUpdate();
  
  // 旋转立方体
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
};

// 启动渲染
scene.start();

console.log('🎉 Hello World Example');`;

onMounted(() => {
  initScene();
});

onUnmounted(() => {
  cleanup();
});

const initScene = () => {
  if (!sceneContainer.value) return;

  // 创建场景
  scene = new Scene(sceneContainer.value, {
    renderer: {
      antialias: true
    },
    camera: {
      fov: 45,
      position: [5, 5, 10],
      lookAt: [0, 0, 0]
    }
  });

  // 初始化场景
  scene.init();

  // 添加环境光
  scene.light.addAmbient({
    color: '#ffffff',
    intensity: 0.6
  });

  // 添加平行光
  scene.light.addDirectional({
    color: '#ffffff',
    intensity: 0.8,
    position: [5, 5, 5],
    castShadow: true
  });

  // 启用阴影
  scene.renderer.enableShadow(true);

  // 启用自动调整大小
  scene.renderer.enableResize();

  // 注册组件
  scene.registerComponent('GridHelper', GridHelper);

  // 添加网格辅助
  scene.add('GridHelper', {
    name: 'grid',
    size: 20,
    divisions: 20
  });

  // 创建立方体
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshStandardMaterial({
    color: '#00ff00',
    roughness: 0.5,
    metalness: 0.5
  });
  cube = new THREE.Mesh(geometry, material);
  cube.castShadow = true;
  cube.receiveShadow = true;
  cube.position.y = 1;
  scene.scene.add(cube);

  // 创建地面
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ 
      color: '#808080',
      roughness: 0.8,
      metalness: 0.2
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.scene.add(ground);

  // FPS 计算
  let lastTime = performance.now();
  let frames = 0;

  // 动画循环
  const originalUpdate = scene.animate.bind(scene);
  scene.animate = function() {
    originalUpdate();
    
    // 旋转立方体
    if (cube) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      cubeRotation.value = cube.rotation.y;
    }

    // 更新相机位置
    if (scene.camera && scene.camera.camera) {
      const pos = scene.camera.camera.position;
      cameraPos.value = { x: pos.x, y: pos.y, z: pos.z };
    }

    // 计算 FPS
    frames++;
    const currentTime = performance.now();
    if (currentTime >= lastTime + 1000) {
      fps.value = Math.round((frames * 1000) / (currentTime - lastTime));
      frames = 0;
      lastTime = currentTime;
    }
  };

  // 启动渲染
  scene.start();

  console.log('🎉 Hello World Example - Vue 3');
  console.log('Scene:', scene);
};

const cleanup = () => {
  console.log('Cleaning up Hello World example');
  if (scene) {
    scene.dispose();
    scene = null;
  }
  cube = null;
};
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: 100%;
}

.control-panel {
  position: absolute;
  top: 60px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  font-size: 14px;
  min-width: 220px;
  backdrop-filter: blur(10px);
}

.panel-title {
  font-size: 16px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 8px;
  font-weight: 600;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  align-items: center;
}

.info-item span:first-child {
  opacity: 0.8;
  font-size: 13px;
}

.info-item .value {
  font-weight: bold;
  color: var(--success-color);
  font-family: 'Consolas', monospace;
}
</style>

