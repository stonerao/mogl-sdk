<template>
    <SplitLayout
        :code="sourceCode || '// 加载中...'"
        language="javascript"
        :title="'08 - 模型烘焙光照'"
        :sceneOnly="isSceneOnly"
    >
        <!-- 3D 场景容器 -->
        <div ref="sceneContainer" class="scene-container"></div>

        <!-- 加载状态 -->
        <template v-if="isLoading">
            <GuiLoading :progress="loadingProgress" :text="loadingText || '加载中...'" />
        </template>

        <!-- 控制面板 -->
        <template v-if="!isLoading">
            <GuiPanel title="模型烘焙光照控制" width="wide">
                <!-- 模型信息 -->
                <GuiSection title="模型信息">
                    <GuiInfoItem label="Mesh 数量" :value="meshCount || 0" />
                </GuiSection>

                <!-- 烘焙光照控制 -->
                <GuiSection title="烘焙光照设置">
                    <GuiCheckbox
                        label="启用烘焙光照"
                        v-model="bakedLightingSettings.enabled"
                        @update:modelValue="toggleBakedLighting"
                    />

                    <template v-if="bakedLightingSettings.enabled">
                        <GuiSlider
                            label="烘焙强度"
                            v-model="bakedLightingSettings.intensity"
                            :min="0"
                            :max="2"
                            :step="0.1"
                            :precision="1"
                            @update:modelValue="updateBakedIntensity"
                        />

                        <GuiSelect
                            label="应用模式"
                            v-model="bakedLightingSettings.mode"
                            :options="[
                                { value: 'map', label: '替换贴图 (map)' },
                                { value: 'lightMap', label: '光照贴图 (lightMap)' }
                            ]"
                            @update:modelValue="updateBakedMode"
                        />

                        <GuiSelect
                            label="UV 通道"
                            v-model="bakedLightingSettings.channel"
                            :options="[
                                { value: '0', label: 'UV1 (channel 0)' },
                                { value: '1', label: 'UV2 (channel 1) - 推荐' }
                            ]"
                            @update:modelValue="updateBakedChannel"
                        />

                        <GuiInfoItem
                            label="已应用物体"
                            :value="bakedLightingSettings.appliedCount || 0"
                        />
                        <GuiInfoItem
                            label="加载状态"
                            :value="bakedLightingSettings.statusText || '未开始'"
                        />
                    </template>
                </GuiSection>

                <!-- 调试工具 -->
                <GuiSection title="调试工具">
                    <div class="button-group">
                        <GuiButton label="打印模型信息" @click="printModelInfo" />
                        <GuiButton label="测试烘焙光照" @click="testBakedLighting" />
                        <GuiButton label="测试材质克隆" @click="testMaterialCloning" />
                    </div>
                </GuiSection>

                <!-- 相机控制 -->
                <GuiSection title="相机控制">
                    <div class="button-group">
                        <GuiButton label="重置视角" @click="resetCamera" />
                        <GuiButton label="聚焦模型" @click="focusModel" />
                    </div>
                </GuiSection>
            </GuiPanel>
        </template>
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
    GuiCheckbox,
    GuiSlider,
    GuiSelect,
    GuiButton
} from '@/components/Gui';
import SplitLayout from '../../components/SplitLayout.vue';
import { useSceneOnly } from '../../composables/useSceneOnly';

// 检测是否为 sceneOnly 模式
const isSceneOnly = useSceneOnly();

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

<style scoped lang="less">
@import '@/styles/gui.less';
.scene-container {
    width: 100%;
    height: 100%;
    background: #1a1a1a;
    position: relative;
    overflow: hidden;
}

.button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
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
