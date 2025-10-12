<template>
    <SplitLayout
        :code="sourceCode || '// 加载中...'"
        language="javascript"
        :title="'08 - 模型烘焙光照'"
    >
        <!-- 3D 场景容器 -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p class="loading-text">{{ loadingText || '加载中...' }}</p>
                <div class="loading-progress">
                    <div class="progress-bar" :style="{ width: `${loadingProgress || 0}%` }"></div>
                </div>
            </div>
        </div>

        <!-- 控制面板 -->
        <div class="control-panel">
            <h3 class="panel-title">模型烘焙光照控制</h3>

            <!-- 模型信息 -->
            <div class="info-section">
                <h4>模型信息</h4>
                <div class="info-item">
                    <span>模型名称:</span>
                    <span class="value"></span>
                </div>
                <div class="info-item">
                    <span>Mesh 数量:</span>
                    <span class="value">{{ meshCount || 0 }}</span>
                </div>
            </div>

            <!-- 烘焙光照控制 -->
            <div class="control-section">
                <h4>烘焙光照设置</h4>
                <div class="baked-lighting-controls">
                    <div class="setting-group">
                        <label>
                            <input
                                type="checkbox"
                                v-model="bakedLightingSettings.enabled"
                                @change="toggleBakedLighting"
                            />
                            启用烘焙光照
                        </label>
                    </div>

                    <div v-if="bakedLightingSettings.enabled" class="baked-options">
                        <div class="setting-group">
                            <label>烘焙强度</label>
                            <input
                                type="range"
                                v-model.number="bakedLightingSettings.intensity"
                                @input="updateBakedIntensity"
                                min="0"
                                max="2"
                                step="0.1"
                            />
                            <span>{{ bakedLightingSettings.intensity.toFixed(1) }}</span>
                        </div>

                        <div class="setting-group">
                            <label>应用模式</label>
                            <select v-model="bakedLightingSettings.mode" @change="updateBakedMode">
                                <option value="map">替换贴图 (map)</option>
                                <option value="lightMap">光照贴图 (lightMap)</option>
                            </select>
                        </div>

                        <div class="setting-group">
                            <label>UV 通道</label>
                            <select
                                v-model="bakedLightingSettings.channel"
                                @change="updateBakedChannel"
                            >
                                <option value="0">UV1 (channel 0)</option>
                                <option value="1">UV2 (channel 1) - 推荐</option>
                            </select>
                            <small class="setting-hint">烘焙贴图通常使用 UV2</small>
                        </div>

                        <div class="baked-info">
                            <div class="info-item">
                                <span>已应用物体:</span>
                                <span class="value">{{
                                    bakedLightingSettings.appliedCount || 0
                                }}</span>
                            </div>
                            <div class="info-item">
                                <span>加载状态:</span>
                                <span class="value" :class="bakedLightingSettings.status">
                                    {{ bakedLightingSettings.statusText || '未开始' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 调试工具 -->
            <div class="control-section">
                <h4>调试工具</h4>
                <div class="debug-controls">
                    <button @click="printModelInfo" class="control-btn">打印模型信息</button>
                    <button @click="testBakedLighting" class="control-btn">测试烘焙光照</button>
                    <button @click="testMaterialCloning" class="control-btn">测试材质克隆</button>
                </div>
            </div>

            <!-- 相机控制 -->
            <div class="control-section">
                <h4>相机控制</h4>
                <div class="camera-controls">
                    <button @click="resetCamera" class="control-btn">重置视角</button>
                    <button @click="focusModel" class="control-btn">聚焦模型</button>
                </div>
            </div>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { ModelLoader, HDRLoader } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';

const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('初始化中...');
const loadingProgress = ref(0);

// 模型相关状态
const meshCount = ref(0);

// 烘焙光照状态
const bakedLightingSettings = reactive({
    enabled: false,
    intensity: 1.0,
    mode: 'map', // 'map' 或 'lightMap'
    channel: 1, // UV 通道：0=UV1, 1=UV2
    appliedCount: 0,
    status: 'idle', // 'idle', 'loading', 'success', 'error'
    statusText: '未开始'
});

let scene = null;
let modelComponent = null;
let hdrComponent = null;

// 烘焙贴图映射配置
const bakeTextureMapping = {
    Castle_Exterior: '/bake/room/Castle_Exterior.jpg',
    Towers_Doors_and_Windows: '/bake/room/Towers_Doors_and_Windows.jpg',
    Ground_and_Fountain: '/bake/room/Ground_and_Fountain.jpg',
    Castle_Interior: '/bake/room/Castle_Interior.jpg'
};

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { ModelLoader, HDRLoader } from '@w3d/components';

// 创建场景
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

// 初始化场景
scene.init();

// 启用阴影和自动调整大小
scene.renderer.enableShadow(true);
scene.renderer.enableResize();

// 注册组件
scene.registerComponent('ModelLoader', ModelLoader);
scene.registerComponent('HDRLoader', HDRLoader);

// 加载 HDR 环境贴图
const hdr = await scene.add('HDRLoader', {
  name: 'environment',
  url: '/textures/blouberg_sunrise_2_1k.hdr',
  intensity: 1.0
});

// 烘焙贴图映射配置
const bakeTextureMapping = {
  Castle_Exterior: '/bake/room/Castle_Exterior.jpg',
  Towers_Doors_and_Windows: '/bake/room/Towers_Doors_and_Windows.jpg',
  Ground_and_Fountain: '/bake/room/Ground_and_Fountain.jpg',
  Castle_Interior: '/bake/room/Castle_Interior.jpg'
};

// ===== ModelLoader 现已支持多种格式 =====
// 支持格式：GLTF (.gltf), GLB (.glb), FBX (.fbx)
// 自动检测格式，无需手动指定加载器

// 加载 GLTF/GLB 模型 + 烘焙光照
const model = await scene.add('ModelLoader', {
  name: 'castle',
  url: '/models/room.glb',  // 支持 .glb, .gltf, .fbx
  scale: 1,
  position: [0, 0, 0],
  castShadow: true,
  receiveShadow: true,

  // 使用 SDK 内置的烘焙光照功能
  bakedLighting: {
    enabled: true,                      // 启用烘焙光照
    textureMapping: bakeTextureMapping, // 纹理映射配置
    mode: 'lightMap',                   // 应用模式：'map' 或 'lightMap'
    intensity: 1.0,                     // 光照强度（仅 lightMap 模式）
    autoApply: true,                    // 模型加载完成后自动应用
    channel: 1                          // UV 通道索引：0=UV1, 1=UV2（推荐）
  }
});

// 也可以加载 FBX 模型（自动检测格式）
const fbxModel = await scene.add('ModelLoader', {
  name: 'character',
  url: '/models/character.fbx',  // FBX 格式自动识别
  scale: 0.01,  // FBX 模型通常需要缩小
  position: [5, 0, 0],
  castShadow: true,

  // FBX 模型也支持烘焙光照
  bakedLighting: {
    enabled: true,
    textureMapping: {
      'body': '/textures/character_baked.jpg'
    },
    mode: 'map'
  }
});

// 监听烘焙光照事件
model.on('bakedLightingApplied', (event) => {
  console.log('烘焙光照已应用:', event.appliedCount, '个物体');
  console.log('应用模式:', event.mode);
  console.log('光照强度:', event.intensity);
});

model.on('bakedLightingRemoved', (event) => {
  console.log('烘焙光照已移除:', event.removedCount, '个物体');
});

// 监听模型加载完成
model.on('loadComplete', (data) => {
  console.log('模型加载完成');
  console.log('模型类型:', data.type);  // 'gltf' 或 'fbx'
  console.log('动画数量:', data.modelData.animations.length);
});

// 动态控制烘焙光照
// 启用烘焙光照
await model.applyBakedLighting(bakeTextureMapping, {
  mode: 'lightMap',
  intensity: 1.0,
  channel: 1
});

// 更新烘焙强度（仅 lightMap 模式有效）
model.updateBakedIntensity(1.5);

// 移除烘焙光照（恢复原始材质）
model.removeBakedLighting();

// 启动渲染
scene.start();

// ===== 重要特性说明 =====

// 1. 多格式支持（新功能）：
//    - 自动检测 GLTF/GLB/FBX 格式
//    - 统一的 API，无需关心格式差异
//    - 所有格式都支持烘焙光照

// 2. SDK 自动处理材质克隆：
//    - 内部自动克隆材质，避免共享问题
//    - 保存原始材质，可随时恢复

// 3. SDK 自动处理纹理设置：
//    - 自动设置 flipY = false（GLB/GLTF 标准）
//    - 自动设置正确的色彩空间（SRGBColorSpace）
//    - 自动设置 UV 通道（支持 UV1 和 UV2）

// 4. 性能优化：
//    - 纹理缓存机制，避免重复加载
//    - 异步加载，不阻塞主线程
//    - 完善的错误处理

// 5. 灵活的配置：
//    - 支持两种模式：map（替换贴图）和 lightMap（光照贴图）
//    - 可配置 UV 通道（烘焙贴图通常使用 UV2）
//    - 可动态调整强度和模式`;

onMounted(async () => {
    try {
        await initScene();
    } catch (error) {
        console.error('初始化场景失败:', error);
        isLoading.value = false;
        loadingText.value = '初始化失败: ' + error.message;
    }
});

onUnmounted(() => {
    cleanup();
});

// 初始化场景
const initScene = async () => {
    isLoading.value = true;
    loadingText.value = '初始化场景...';
    loadingProgress.value = 10;

    try {
        // 创建场景
        scene = new Scene(sceneContainer.value, {
            renderer: {
                antialias: true,
                outputColorSpace: 'srgb'
            },
            camera: {
                fov: 45,
                position: [1, 2, 1],
                lookAt: [0, 0, 0]
            }
        });

        // 初始化场景
        scene.init();
        // 启用阴影和自动调整大小
        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        // 注册组件
        scene.registerComponent('ModelLoader', ModelLoader);
        scene.registerComponent('HDRLoader', HDRLoader);

        loadingText.value = '加载环境贴图...';
        loadingProgress.value = 30;

        // 加载 HDR 环境贴图
        hdrComponent = await scene.add('HDRLoader', {
            name: 'environment',
            url: '/textures/blouberg_sunrise_2_1k.hdr',
            intensity: 1.0,
            asEnvironment: true,
            asBackground: true
        });

        loadingText.value = '加载模型...';
        loadingProgress.value = 50;

        // 加载模型 - 使用 SDK 内置烘焙光照功能
        modelComponent = await scene.add('ModelLoader', {
            name: 'model',
            url: '/models/room.glb',
            scale: 1,
            position: [0, 0, 0],
            castShadow: true,
            receiveShadow: true,

            // 使用 SDK 内置的烘焙光照功能
            bakedLighting: {
                enabled: true, // 初始不启用，由用户控制
                textureMapping: bakeTextureMapping, // 纹理映射配置
                mode: 'lightMap', // 应用模式
                intensity: 0.6, // 光照强度
                autoApply: true, // 不自动应用，由用户控制
                channel: 0
            }
        });

        // 监听模型加载事件
        modelComponent.on('loaded', () => {
            // 统计 Mesh 数量并打印调试信息
            let count = 0;
            console.log('=== 模型加载完成，开始调试信息 ===');
            console.log('烘焙贴图映射配置:', bakeTextureMapping);

            modelComponent.model.traverse((child) => {
                if (child.isMesh) {
                    count++;
                    console.log(`Mesh ${count}: 名称="${child.name}", UUID=${child.uuid}`);

                    // 检查是否有对应的烘焙贴图
                    const texturePath = bakeTextureMapping[child.name];
                    if (texturePath) {
                        console.log(`  ✅ 找到烘焙贴图: ${texturePath}`);
                    } else {
                        console.log(`  ❌ 未找到烘焙贴图 (名称: "${child.name}")`);
                    }
                }
            });

            meshCount.value = count;
            console.log(`总共找到 ${count} 个 Mesh`);
            console.log('=== 调试信息结束 ===');
        });

        // 监听烘焙光照事件
        modelComponent.on('bakedLightingApplied', (event) => {
            bakedLightingSettings.appliedCount = event.appliedCount;
            bakedLightingSettings.status = 'success';
            bakedLightingSettings.statusText = '应用成功';
        });

        modelComponent.on('bakedLightingRemoved', () => {
            bakedLightingSettings.appliedCount = 0;
            bakedLightingSettings.status = 'idle';
            bakedLightingSettings.statusText = '未开始';
        });

        loadingText.value = '启动渲染...';
        loadingProgress.value = 90;

        // 启动渲染
        scene.start();

        loadingProgress.value = 100;
        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    } catch (error) {
        console.error('场景初始化失败:', error);
        isLoading.value = false;
        loadingText.value = '加载失败: ' + error.message;
    }
};

// 烘焙光照控制方法
const toggleBakedLighting = async () => {
    if (!modelComponent) return;

    if (bakedLightingSettings.enabled) {
        bakedLightingSettings.status = 'loading';
        bakedLightingSettings.statusText = '应用中...';

        await modelComponent.applyBakedLighting(bakeTextureMapping, {
            mode: bakedLightingSettings.mode,
            intensity: bakedLightingSettings.intensity,
            channel: parseInt(bakedLightingSettings.channel)
        });
    } else {
        modelComponent.removeBakedLighting();
    }
};

const updateBakedIntensity = () => {
    if (!modelComponent || !bakedLightingSettings.enabled) return;
    modelComponent.updateBakedIntensity(bakedLightingSettings.intensity);
};

const updateBakedMode = async () => {
    if (!modelComponent || !bakedLightingSettings.enabled) return;

    bakedLightingSettings.status = 'loading';
    bakedLightingSettings.statusText = '更新中...';

    await modelComponent.applyBakedLighting(bakeTextureMapping, {
        mode: bakedLightingSettings.mode,
        intensity: bakedLightingSettings.intensity,
        channel: parseInt(bakedLightingSettings.channel)
    });
};

const updateBakedChannel = async () => {
    if (!modelComponent || !bakedLightingSettings.enabled) return;

    bakedLightingSettings.status = 'loading';
    bakedLightingSettings.statusText = '更新UV通道...';

    await modelComponent.applyBakedLighting(bakeTextureMapping, {
        mode: bakedLightingSettings.mode,
        intensity: bakedLightingSettings.intensity,
        channel: parseInt(bakedLightingSettings.channel)
    });
};

// 调试方法
const printModelInfo = () => {
    if (!modelComponent) {
        console.log('❌ 模型未加载');
        return;
    }

    console.log('=== 模型详细信息 ===');
    console.log('模型组件:', modelComponent);
    console.log('模型对象:', modelComponent.model);

    let meshCount = 0;
    const meshNames = [];

    // 递归函数：打印层级结构
    const printHierarchy = (object, level = 0) => {
        const indent = '  '.repeat(level);
        const type = object.isMesh ? 'Mesh' : object.isGroup ? 'Group' : object.type || 'Object3D';
        const name = object.name || '(unnamed)';

        console.log(`${indent}${type}: "${name}" (UUID: ${object.uuid.substring(0, 8)}...)`);

        if (object.isMesh) {
            meshCount++;
            meshNames.push(object.name);

            console.log(`${indent}  材质类型: ${object.material.type}`);
            console.log(`${indent}  当前贴图:`, object.material.map ? '有' : '无');
            console.log(`${indent}  光照贴图:`, object.material.lightMap ? '有' : '无');

            // 检查层级匹配逻辑
            let texturePath = null;
            let matchSource = '';

            // 优先检查 Mesh 自身名称
            if (bakeTextureMapping[object.name]) {
                texturePath = bakeTextureMapping[object.name];
                matchSource = `Mesh自身 "${object.name}"`;
            }

            // 如果 Mesh 自身没有映射，检查父级层级
            if (!texturePath && object.parent) {
                let currentParent = object.parent;
                let parentLevel = 1;

                while (currentParent && parentLevel <= 3) {
                    const parentName = currentParent.name;

                    if (parentName && bakeTextureMapping[parentName]) {
                        texturePath = bakeTextureMapping[parentName];
                        matchSource = `父级${parentLevel}层 "${parentName}"`;
                        break;
                    }

                    currentParent = currentParent.parent;
                    parentLevel++;
                }
            }

            if (texturePath) {
                console.log(`${indent}  ✅ 烘焙贴图: ${texturePath} (来源: ${matchSource})`);
            } else {
                console.log(`${indent}  ❌ 无烘焙贴图映射`);
            }

            // 显示父级链
            const parentChain = [];
            let parent = object.parent;
            while (parent && parent !== modelComponent.model) {
                parentChain.push(parent.name || '(unnamed)');
                parent = parent.parent;
            }
            if (parentChain.length > 0) {
                console.log(`${indent}  父级链: ${parentChain.reverse().join(' -> ')}`);
            }
        }

        // 递归处理子对象
        object.children.forEach((child) => {
            printHierarchy(child, level + 1);
        });
    };

    console.log('\n=== 模型层级结构 ===');
    printHierarchy(modelComponent.model);

    console.log(`\n=== 总结 ===`);
    console.log(`总计: ${meshCount} 个 Mesh`);
    console.log('所有 Mesh 名称:', meshNames);
    console.log('烘焙贴图映射配置:', bakeTextureMapping);
    console.log('=== 模型信息结束 ===');
};

const testBakedLighting = async () => {
    if (!modelComponent) {
        console.log('❌ 模型未加载，无法测试烘焙光照');
        return;
    }

    console.log('=== 开始测试烘焙光照 ===');

    // 首先测试纹理文件是否可访问
    console.log('🔍 测试纹理文件可访问性...');
    for (const [meshName, texturePath] of Object.entries(bakeTextureMapping)) {
        try {
            const response = await fetch(texturePath);
            if (response.ok) {
                console.log(`✅ 纹理文件可访问: ${texturePath} (${response.status})`);
            } else {
                console.error(`❌ 纹理文件不可访问: ${texturePath} (${response.status})`);
            }
        } catch (error) {
            console.error(`❌ 纹理文件访问失败: ${texturePath}`, error);
        }
    }

    // 强制启用烘焙光照
    bakedLightingSettings.enabled = true;
    bakedLightingSettings.status = 'loading';
    bakedLightingSettings.statusText = '测试中...';

    try {
        await modelComponent.applyBakedLighting(bakeTextureMapping, {
            mode: bakedLightingSettings.mode,
            intensity: bakedLightingSettings.intensity,
            channel: parseInt(bakedLightingSettings.channel)
        });
        console.log('✅ 烘焙光照测试完成');
    } catch (error) {
        console.error('❌ 烘焙光照测试失败:', error);
    }
};

const testMaterialCloning = () => {
    if (!modelComponent) {
        console.log('❌ 模型未加载，无法测试材质克隆');
        return;
    }

    console.log('=== 开始测试材质克隆机制 ===');

    const meshes = [];
    const materialMap = new Map(); // 记录材质实例

    // 收集所有 Mesh 和它们的材质
    modelComponent.model.traverse((child) => {
        if (child.isMesh) {
            meshes.push(child);

            // 检查材质是否被多个 Mesh 共享
            const materialId = child.material.uuid;
            if (!materialMap.has(materialId)) {
                materialMap.set(materialId, []);
            }
            materialMap.get(materialId).push(child.name || '(unnamed)');
        }
    });

    console.log(`找到 ${meshes.length} 个 Mesh`);
    console.log(`找到 ${materialMap.size} 个不同的材质实例`);

    // 显示材质共享情况
    console.log('\n=== 材质共享情况 ===');
    materialMap.forEach((meshNames, materialId) => {
        if (meshNames.length > 1) {
            console.log(
                `⚠️  材质 ${materialId.substring(0, 8)}... 被 ${meshNames.length} 个 Mesh 共享:`
            );
            meshNames.forEach((name) => console.log(`    - ${name}`));
        } else {
            console.log(`✅ 材质 ${materialId.substring(0, 8)}... 独占: ${meshNames[0]}`);
        }
    });

    // 测试应用烘焙光照后的材质独立性
    if (meshes.length >= 2) {
        console.log('\n=== 测试材质克隆效果 ===');

        const testMesh1 = meshes[0];
        const testMesh2 = meshes[1];

        console.log(
            `测试 Mesh 1: "${testMesh1.name}" (材质 UUID: ${testMesh1.material.uuid.substring(
                0,
                8
            )}...)`
        );
        console.log(
            `测试 Mesh 2: "${testMesh2.name}" (材质 UUID: ${testMesh2.material.uuid.substring(
                0,
                8
            )}...)`
        );

        const originalMaterial1UUID = testMesh1.material.uuid;
        const originalMaterial2UUID = testMesh2.material.uuid;

        // 模拟应用烘焙光照（只对第一个 Mesh）
        console.log('\n🧪 模拟对 Mesh 1 应用烘焙光照...');

        // 保存原始材质
        const originalMaterial1 = testMesh1.material;

        // 克隆材质（模拟 applyTextureToMesh 的行为）
        testMesh1.material = testMesh1.material.clone();
        testMesh1.material.needsUpdate = true;

        console.log(`Mesh 1 新材质 UUID: ${testMesh1.material.uuid.substring(0, 8)}...`);
        console.log(
            `Mesh 2 材质 UUID: ${testMesh2.material.uuid.substring(0, 8)}... (应该保持不变)`
        );

        // 验证材质独立性
        if (testMesh1.material.uuid !== originalMaterial1UUID) {
            console.log('✅ Mesh 1 材质已成功克隆');
        } else {
            console.log('❌ Mesh 1 材质克隆失败');
        }

        if (testMesh2.material.uuid === originalMaterial2UUID) {
            console.log('✅ Mesh 2 材质保持不变');
        } else {
            console.log('❌ Mesh 2 材质意外改变');
        }

        if (testMesh1.material.uuid !== testMesh2.material.uuid) {
            console.log('✅ 两个 Mesh 现在拥有不同的材质实例');
        } else {
            console.log('❌ 两个 Mesh 仍然共享相同的材质实例');
        }

        // 恢复原始材质
        console.log('\n🔄 恢复 Mesh 1 的原始材质...');
        testMesh1.material = originalMaterial1;

        if (testMesh1.material.uuid === originalMaterial1UUID) {
            console.log('✅ Mesh 1 材质已恢复');
        } else {
            console.log('❌ Mesh 1 材质恢复失败');
        }
    }

    console.log('\n=== 材质克隆测试完成 ===');
};

// 相机控制方法
const resetCamera = () => {
    if (!scene) return;
    scene.camera.setPosition(10, 8, 15);
    scene.camera.lookAt(0, 0, 0);
};

const focusModel = () => {
    if (!scene || !modelComponent) return;
    // 简单的聚焦逻辑
    scene.camera.setPosition(5, 5, 8);
    scene.camera.lookAt(0, 0, 0);
};

// 清理资源
const cleanup = () => {
    if (scene) {
        scene.dispose();
        scene = null;
    }
    modelComponent = null;
    hdrComponent = null;
};
</script>

<style scoped>
.scene-container {
    width: 100%;
    height: 100%;
    background: #1a1a1a;
    position: relative;
    overflow: hidden;
}

/* 加载状态样式 */
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loading-content {
    text-align: center;
    color: white;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #00ccff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.loading-text {
    font-size: 16px;
    margin-bottom: 15px;
    color: #ffffff;
}

.loading-progress {
    width: 200px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
    margin: 0 auto;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #00ccff, #0099cc);
    transition: width 0.3s ease;
}

/* 控制面板样式 */
.control-panel {
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 20px;
    border-radius: 8px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-height: 80vh;
    overflow-y: auto;
}

.panel-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #00ccff;
    text-align: center;
}

.info-section,
.control-section {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-section:last-child,
.control-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.info-section h4,
.control-section h4 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    color: rgba(255, 255, 255, 0.9);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 12px;
}

.info-item span:first-child {
    color: rgba(255, 255, 255, 0.7);
}

.info-item .value {
    color: #ffffff;
    font-weight: 500;
}

/* 烘焙光照控件样式 */
.baked-lighting-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.setting-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.setting-group label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    gap: 8px;
}

.setting-group input[type='checkbox'] {
    accent-color: #00ccff;
}

.setting-group input[type='range'] {
    width: 100%;
    margin: 4px 0;
}

.setting-group select {
    width: 100%;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #ffffff;
    font-size: 12px;
    outline: none;
    cursor: pointer;
}

.setting-group select:focus {
    border-color: #00ccff;
    background: rgba(255, 255, 255, 0.15);
}

.setting-group select option {
    background: #2a2a2a;
    color: #ffffff;
}

.setting-hint {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
    margin-top: 2px;
}

.baked-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.baked-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.baked-info .info-item .value.loading {
    color: #ffc107;
}

.baked-info .info-item .value.success {
    color: #28a745;
}

.baked-info .info-item .value.error {
    color: #dc3545;
}

.baked-info .info-item .value.idle {
    color: rgba(255, 255, 255, 0.5);
}

/* 调试控制样式 */
.debug-controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 10px;
}

/* 相机控制样式 */
.camera-controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.control-btn {
    flex: 1;
    min-width: 80px;
    padding: 8px 12px;
    background: rgba(0, 204, 255, 0.2);
    border: 1px solid #00ccff;
    border-radius: 4px;
    color: #00ccff;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.control-btn:hover {
    background: rgba(0, 204, 255, 0.3);
    transform: translateY(-1px);
}

.control-btn:active {
    transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .control-panel {
        padding: 15px;
    }

    .panel-title {
        font-size: 16px;
    }

    .camera-controls {
        flex-direction: column;
    }

    .control-btn {
        min-width: auto;
    }
}

/* 滚动条样式 */
.control-panel::-webkit-scrollbar {
    width: 6px;
}

.control-panel::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb {
    background: rgba(0, 204, 255, 0.5);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 204, 255, 0.7);
}
</style>
