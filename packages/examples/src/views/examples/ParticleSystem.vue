<template>
    <SplitLayout
        :code="sourceCode"
        language="javascript"
        title="06 - Particle System"
        :sceneOnly="isSceneOnly"
    >
        <div class="scene-container" ref="sceneContainer">
            <!-- 加载状态 -->
            <template v-if="isLoading">
                <GuiLoading :progress="loadingProgress" :text="loadingText" />
            </template>

            <!-- 控制面板 -->
            <template v-if="!isLoading">
                <GuiPanel title="粒子系统控制" width="wide">
                    <!-- 粒子参数控制 -->
                    <GuiSection title="粒子参数">
                        <GuiSlider
                            label="粒子数量"
                            v-model="particleSettings.count"
                            :min="100"
                            :max="10000"
                            :step="100"
                            @update:modelValue="updateParticleCount"
                        />
                        <GuiSlider
                            label="粒子大小"
                            v-model="particleSettings.size"
                            :min="0.1"
                            :max="5"
                            :step="0.1"
                            :precision="1"
                            @update:modelValue="updateParticleSize"
                        />
                        <GuiSlider
                            label="生命周期"
                            v-model="particleSettings.lifetime"
                            :min="1"
                            :max="10"
                            :step="0.5"
                            :precision="1"
                            suffix="s"
                            @update:modelValue="updateParticleLifetime"
                        />
                        <GuiSlider
                            label="发射速率"
                            v-model="particleSettings.emissionRate"
                            :min="10"
                            :max="1000"
                            :step="10"
                            suffix="/s"
                            @update:modelValue="updateEmissionRate"
                        />
                        <GuiColorPicker
                            label="粒子颜色"
                            v-model="particleSettings.color"
                            @update:modelValue="updateParticleColor"
                        />
                    </GuiSection>

                    <!-- 发射器配置 -->
                    <GuiSection title="发射器配置">
                        <GuiSelect
                            label="发射器形状"
                            v-model="emitterSettings.shape"
                            :options="[
                                { value: 'point', label: '点' },
                                { value: 'sphere', label: '球体' },
                                { value: 'box', label: '盒子' },
                                { value: 'cone', label: '圆锥' }
                            ]"
                            @update:modelValue="updateEmitterShape"
                        />
                        <div class="position-grid">
                            <GuiNumberInput
                                label="X"
                                v-model="emitterSettings.position.x"
                                :step="0.1"
                                @update:modelValue="updateEmitterPosition"
                            />
                            <GuiNumberInput
                                label="Y"
                                v-model="emitterSettings.position.y"
                                :step="0.1"
                                @update:modelValue="updateEmitterPosition"
                            />
                            <GuiNumberInput
                                label="Z"
                                v-model="emitterSettings.position.z"
                                :step="0.1"
                                @update:modelValue="updateEmitterPosition"
                            />
                        </div>
                        <GuiSlider
                            label="发射范围"
                            v-model="emitterSettings.range"
                            :min="0.1"
                            :max="5"
                            :step="0.1"
                            :precision="1"
                            @update:modelValue="updateEmitterRange"
                        />
                        <GuiSlider
                            label="初始速度 (最小)"
                            v-model="emitterSettings.velocity.min"
                            :min="0"
                            :max="20"
                            :step="0.5"
                            :precision="1"
                            @update:modelValue="updateVelocity"
                        />
                        <GuiSlider
                            label="初始速度 (最大)"
                            v-model="emitterSettings.velocity.max"
                            :min="0"
                            :max="20"
                            :step="0.5"
                            :precision="1"
                            @update:modelValue="updateVelocity"
                        />
                    </GuiSection>

                    <!-- 物理设置 -->
                    <GuiSection title="物理设置">
                        <GuiSlider
                            label="重力"
                            v-model="physicsSettings.gravity"
                            :min="-20"
                            :max="20"
                            :step="0.5"
                            :precision="1"
                            @update:modelValue="updateGravity"
                        />
                        <GuiSlider
                            label="阻力"
                            v-model="physicsSettings.damping"
                            :min="0"
                            :max="1"
                            :step="0.01"
                            :precision="2"
                            @update:modelValue="updateDamping"
                        />
                        <GuiSelect
                            label="混合模式"
                            v-model="physicsSettings.blendMode"
                            :options="[
                                { value: 'normal', label: '正常' },
                                { value: 'additive', label: '叠加' },
                                { value: 'multiply', label: '相乘' },
                                { value: 'screen', label: '滤色' }
                            ]"
                            @update:modelValue="updateBlendMode"
                        />
                    </GuiSection>

                    <!-- 预设效果 -->
                    <GuiSection title="预设效果">
                        <div class="button-group">
                            <GuiButton label="🔥 火焰" @click="loadPresetEffect('fire')" />
                            <GuiButton label="💨 烟雾" @click="loadPresetEffect('smoke')" />
                            <GuiButton label="🌧️ 雨" @click="loadPresetEffect('rain')" />
                            <GuiButton label="❄️ 雪" @click="loadPresetEffect('snow')" />
                            <GuiButton label="⭐ 星星" @click="loadPresetEffect('stars')" />
                            <GuiButton label="💥 爆炸" @click="loadPresetEffect('explosion')" />
                        </div>
                    </GuiSection>

                    <!-- 纹理设置 -->
                    <GuiSection title="纹理设置">
                        <GuiTextInput
                            label="纹理路径"
                            v-model="textureSettings.path"
                            placeholder="/images/lensflare0.png"
                            @change="updateTexture"
                        />
                        <GuiSlider
                            label="纹理重复 X"
                            v-model="textureSettings.repeatX"
                            :min="0.1"
                            :max="5"
                            :step="0.1"
                            :precision="1"
                            @update:modelValue="updateTextureRepeat"
                        />
                        <GuiSlider
                            label="纹理重复 Y"
                            v-model="textureSettings.repeatY"
                            :min="0.1"
                            :max="5"
                            :step="0.1"
                            :precision="1"
                            @update:modelValue="updateTextureRepeat"
                        />
                        <template v-if="textureStatus">
                            <div :class="['texture-status', textureStatus.type]">
                                {{ textureStatus.message }}
                            </div>
                        </template>
                    </GuiSection>

                    <!-- Shader 设置 -->
                    <GuiSection title="自定义 Shader">
                        <GuiCheckbox
                            label="启用自定义 Shader"
                            v-model="shaderSettings.useCustomShader"
                            @update:modelValue="updateShaderMode"
                        />

                        <template v-if="shaderSettings.useCustomShader">
                            <GuiSelect
                                label="Shader 类型"
                                v-model="shaderSettings.type"
                                :options="[
                                    { value: 'glow', label: '发光效果' },
                                    { value: 'sparkle', label: '闪烁效果' },
                                    { value: 'fire', label: '火焰效果' },
                                    { value: 'smoke', label: '烟雾效果' }
                                ]"
                                @update:modelValue="updateShaderType"
                            />

                            <template v-if="shaderSettings.type === 'glow'">
                                <GuiSlider
                                    label="发光强度"
                                    v-model="shaderSettings.glowIntensity"
                                    :min="0.1"
                                    :max="3"
                                    :step="0.1"
                                    :precision="1"
                                    @update:modelValue="updateShaderUniforms"
                                />
                            </template>

                            <template v-if="shaderSettings.type === 'sparkle'">
                                <GuiSlider
                                    label="闪烁频率"
                                    v-model="shaderSettings.sparkleFrequency"
                                    :min="1"
                                    :max="20"
                                    :step="1"
                                    @update:modelValue="updateShaderUniforms"
                                />
                            </template>

                            <template
                                v-if="
                                    shaderSettings.type === 'fire' ||
                                    shaderSettings.type === 'smoke'
                                "
                            >
                                <GuiSlider
                                    label="噪声缩放"
                                    v-model="shaderSettings.noiseScale"
                                    :min="0.1"
                                    :max="5"
                                    :step="0.1"
                                    :precision="1"
                                    @update:modelValue="updateShaderUniforms"
                                />
                            </template>
                        </template>
                    </GuiSection>

                    <!-- 控制按钮 -->
                    <GuiSection title="控制">
                        <div class="button-group">
                            <GuiButton
                                :label="isEmitting ? '停止发射' : '开始发射'"
                                :disabled="!particleSystem"
                                @click="startParticles"
                            />
                            <GuiButton
                                label="清除粒子"
                                variant="secondary"
                                :disabled="!particleSystem"
                                @click="clearParticles"
                            />
                            <GuiButton
                                label="重置设置"
                                variant="secondary"
                                @click="resetSettings"
                            />
                        </div>
                    </GuiSection>

                    <!-- 粒子信息 -->
                    <template v-if="particleSystem">
                        <GuiSection title="粒子信息">
                            <GuiInfoItem label="活跃粒子" :value="activeParticleCount" />
                            <GuiInfoItem
                                label="发射状态"
                                :value="isEmitting ? '发射中' : '已停止'"
                            />
                            <GuiInfoItem label="当前帧率" :value="`${currentFPS} FPS`" />
                            <GuiInfoItem label="渲染模式" :value="physicsSettings.blendMode" />
                        </GuiSection>
                    </template>
                </GuiPanel>
            </template>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { GridHelper, ParticleSystem } from '@w3d/components';
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
import { useSceneOnly } from '../../composables/useSceneOnly';

// 检测是否为 sceneOnly 模式
const isSceneOnly = useSceneOnly();

const sceneContainer = ref(null);
const isLoading = ref(false);
const loadingText = ref('');
const loadingProgress = ref(0);

// 粒子系统状态
const isEmitting = ref(false);
const activeParticleCount = ref(0);
const currentFPS = ref(60);

// 粒子设置
const particleSettings = reactive({
    count: 1000,
    size: 1.0,
    lifetime: 5.0,
    emissionRate: 100,
    color: '#00ff88'
});

// 发射器设置
const emitterSettings = reactive({
    shape: 'point',
    position: { x: 0, y: 0, z: 0 },
    range: 1.0,
    velocity: { min: 2, max: 8 }
});

// 物理设置
const physicsSettings = reactive({
    gravity: -9.8,
    damping: 0.98,
    blendMode: 'additive'
});

// 纹理设置
const textureSettings = reactive({
    path: '',
    repeatX: 1.0,
    repeatY: 1.0
});

// Shader 设置
const shaderSettings = reactive({
    useCustomShader: false,
    type: 'glow',
    glowIntensity: 1.0,
    sparkleFrequency: 10,
    noiseScale: 1.0
});

// 纹理状态
const textureStatus = ref(null);

let scene = null;
let particleSystem = null;
let animationFrameId = null;

// 源代码展示
const sourceCode = `import { Scene } from '@w3d/core';
import { GridHelper, ParticleSystem } from '@w3d/components';

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
scene.registerComponent('GridHelper', GridHelper);
scene.registerComponent('ParticleSystem', ParticleSystem);

// 添加网格辅助
await scene.add('GridHelper', {
  name: 'grid',
  size: 20,
  divisions: 20,
  color: '#888888'
});

// ===== 基础粒子系统 =====

// 创建基础粒子系统
const particles = await scene.add('ParticleSystem', {
  name: 'basic-particles',
  count: 1000,
  size: 1.0,
  color: '#00ff88',
  lifetime: 5.0,
  emitter: {
    shape: 'point',
    position: [0, 0, 0],
    rate: 100,
    autoStart: true
  },
  physics: {
    gravity: -9.8,
    damping: 0.98,
    velocity: { min: 2, max: 8 }
  },
  blending: 'additive'
});

// ===== 高级粒子系统配置 =====

// 带纹理的粒子系统
const texturedParticles = await scene.add('ParticleSystem', {
  name: 'textured',
  count: 1000,
  size: 2.0,
  color: '#ffffff',
  lifetime: 4.0,
  texture: '/images/lensflare0.png',  // 纹理路径
  textureRepeat: [1, 1],           // 纹理重复
  emitter: {
    shape: 'sphere',
    position: [0, 0, 0],
    range: 2,
    rate: 150
  },
  physics: {
    gravity: -5,
    damping: 0.98,
    velocity: { min: 1, max: 5 }
  },
  blending: 'additive'
});

// 自定义 Shader 粒子系统 - 发光效果
const glowParticles = await scene.add('ParticleSystem', {
  name: 'glow',
  count: 1500,
  size: 1.8,
  color: '#00ff88',
  lifetime: 5.0,
  useCustomShader: true,          // 启用自定义 Shader
  shaderType: 'glow',            // Shader 类型
  shaderUniforms: {
    uGlowIntensity: 1.5          // 发光强度
  },
  emitter: {
    shape: 'point',
    position: [0, 0, 0],
    rate: 200
  },
  physics: {
    gravity: -3,
    damping: 0.96,
    velocity: { min: 2, max: 6 }
  },
  blending: 'additive'
});

// 火焰效果 Shader
const fireParticles = await scene.add('ParticleSystem', {
  name: 'fire',
  count: 2000,
  size: 1.5,
  color: '#ff4500',
  lifetime: 3.0,
  useCustomShader: true,
  shaderType: 'fire',
  shaderUniforms: {
    uNoiseScale: 1.2
  },
  emitter: {
    shape: 'point',
    position: [0, 0, 0],
    rate: 200,
    autoStart: true
  },
  physics: {
    gravity: -2,
    damping: 0.95,
    velocity: { min: 3, max: 8 }
  },
  blending: 'additive'
});

// 雨效果
const rainParticles = await scene.add('ParticleSystem', {
  name: 'rain',
  count: 5000,
  size: 0.5,
  color: '#4169e1',
  lifetime: 4.0,
  emitter: {
    shape: 'box',
    position: [0, 10, 0],
    range: 10,
    rate: 500
  },
  physics: {
    gravity: -20,
    velocity: { min: 8, max: 12 }
  },
  blending: 'normal'
});

// ===== 粒子系统控制 =====

// 控制发射
particles.startEmission();    // 开始发射
particles.stopEmission();     // 停止发射
particles.toggleEmission();   // 切换发射状态

// 管理粒子
particles.clearParticles();   // 清除所有粒子
particles.reset();            // 重置粒子系统

// 实时更新配置
particles.updateConfig({
  color: '#ff0000',
  size: 2.0,
  emitter: {
    rate: 300,
    shape: 'sphere',
    range: 2.0
  },
  physics: {
    gravity: -15,
    velocity: { min: 5, max: 12 }
  }
});

// ===== 预设效果 =====

// 使用内置预设效果
particles.setPreset('fire');      // 火焰效果
particles.setPreset('smoke');     // 烟雾效果
particles.setPreset('rain');      // 雨效果
particles.setPreset('snow');      // 雪效果
particles.setPreset('stars');     // 星星效果
particles.setPreset('explosion'); // 爆炸效果

// ===== 获取统计信息 =====

// 获取粒子系统状态
const stats = particles.getStats();
console.log('活跃粒子数:', stats.activeParticles);
console.log('发射状态:', stats.isEmitting);
console.log('总粒子数:', stats.totalParticles);

// ===== 多种发射器形状 =====

// 点发射器
particles.updateConfig({
  emitter: { shape: 'point' }
});

// 球体发射器
particles.updateConfig({
  emitter: {
    shape: 'sphere',
    range: 3.0
  }
});

// 盒子发射器
particles.updateConfig({
  emitter: {
    shape: 'box',
    range: 5.0
  }
});

// 圆锥发射器
particles.updateConfig({
  emitter: {
    shape: 'cone',
    range: 2.0
  }
});

// ===== 混合模式 =====

// 叠加混合（适合火焰、光效）
particles.updateConfig({ blending: 'additive' });

// 正常混合（适合烟雾、雨雪）
particles.updateConfig({ blending: 'normal' });

// 相乘混合（适合阴影效果）
particles.updateConfig({ blending: 'multiply' });

// 启动渲染循环
scene.start();`;
onMounted(() => {
    initScene();
});

onUnmounted(() => {
    cleanup();
});

// 初始化场景
const initScene = async () => {
    if (!sceneContainer.value) return;

    try {
        isLoading.value = true;
        loadingText.value = '初始化场景...';
        loadingProgress.value = 10;

        // 创建场景
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
        loadingText.value = '初始化渲染器...';

        // 初始化场景
        scene.init();

        // 启用阴影和自动调整大小
        scene.renderer.enableShadow(true);
        scene.renderer.enableResize();

        loadingProgress.value = 50;
        loadingText.value = '设置灯光...';

        // 添加基础灯光
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

        loadingProgress.value = 70;
        loadingText.value = '添加场景对象...';

        // 注册组件
        scene.registerComponent('GridHelper', GridHelper);
        scene.registerComponent('ParticleSystem', ParticleSystem);

        // 添加网格辅助
        await scene.add('GridHelper', {
            name: 'grid',
            size: 20,
            divisions: 20,
            color: '#888888'
        });

        loadingProgress.value = 90;
        loadingText.value = '创建粒子系统...';

        // 创建粒子系统
        await createParticleSystem();

        loadingProgress.value = 100;
        loadingText.value = '完成';

        // 延迟隐藏加载状态
        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    } catch (error) {
        console.error('Scene initialization failed:', error);
        loadingText.value = '初始化失败';
        setTimeout(() => {
            isLoading.value = false;
        }, 1000);
    }
};

// 创建粒子系统
const createParticleSystem = async () => {
    try {
        // 使用 Mogl SDK 的 ParticleSystem 组件
        particleSystem = await scene.add('ParticleSystem', {
            name: 'main-particles',
            count: particleSettings.count,
            size: particleSettings.size,
            color: particleSettings.color,
            lifetime: particleSettings.lifetime,
            emitter: {
                shape: emitterSettings.shape,
                position: [
                    emitterSettings.position.x,
                    emitterSettings.position.y,
                    emitterSettings.position.z
                ],
                range: emitterSettings.range,
                rate: particleSettings.emissionRate,
                autoStart: false
            },
            physics: {
                gravity: physicsSettings.gravity,
                damping: physicsSettings.damping,
                velocity: emitterSettings.velocity
            },
            blending: physicsSettings.blendMode,
            transparent: true,
            sizeAttenuation: true,

            // 纹理设置
            texture: textureSettings.path || null,
            textureRepeat: [textureSettings.repeatX, textureSettings.repeatY],

            // Shader 设置
            useCustomShader: shaderSettings.useCustomShader,
            shaderType: shaderSettings.type,
            shaderUniforms: {
                uGlowIntensity: shaderSettings.glowIntensity,
                uSparkleFrequency: shaderSettings.sparkleFrequency,
                uNoiseScale: shaderSettings.noiseScale
            }
        });
    } catch (error) {
        console.error('创建粒子系统失败:', error);
    }
};

// 控制方法
const startParticles = () => {
    if (!particleSystem) return;

    const newState = particleSystem.toggleEmission();
    isEmitting.value = newState;
};

const clearParticles = () => {
    if (!particleSystem) return;

    particleSystem.clearParticles();
    activeParticleCount.value = 0;
};

const resetSettings = () => {
    // 重置粒子设置
    particleSettings.count = 1000;
    particleSettings.size = 1.0;
    particleSettings.lifetime = 5.0;
    particleSettings.emissionRate = 100;
    particleSettings.color = '#00ff88';

    // 重置发射器设置
    emitterSettings.shape = 'point';
    emitterSettings.position = { x: 0, y: 0, z: 0 };
    emitterSettings.range = 1.0;
    emitterSettings.velocity = { min: 2, max: 8 };

    // 重置物理设置
    physicsSettings.gravity = -9.8;
    physicsSettings.damping = 0.98;
    physicsSettings.blendMode = 'additive';

    // 停止发射
    isEmitting.value = false;

    // 重新创建粒子系统
    if (particleSystem) {
        scene.remove('main-particles');
        particleSystem = null;
        createParticleSystem();
    }
};

// 参数更新方法
const updateParticleCount = () => {
    if (!particleSystem) return;

    // 重新创建粒子系统
    scene.remove('main-particles');
    particleSystem = null;
    createParticleSystem();
};

const updateParticleSize = () => {
    if (!particleSystem) return;
    particleSystem.updateConfig({ size: particleSettings.size });
};

const updateParticleLifetime = () => {
    if (!particleSystem) return;
    particleSystem.updateConfig({ lifetime: particleSettings.lifetime });
};

const updateEmissionRate = () => {
    if (!particleSystem) return;
    particleSystem.updateConfig({
        emitter: { rate: particleSettings.emissionRate }
    });
};

const updateParticleColor = () => {
    if (!particleSystem) return;
    particleSystem.updateConfig({ color: particleSettings.color });
};

const updateEmitterShape = () => {
    if (!particleSystem) return;
    particleSystem.updateConfig({
        emitter: { shape: emitterSettings.shape }
    });
};

const updateEmitterPosition = () => {
    if (!particleSystem) return;
    particleSystem.updateConfig({
        emitter: {
            position: [
                emitterSettings.position.x,
                emitterSettings.position.y,
                emitterSettings.position.z
            ]
        }
    });
};

const updateEmitterRange = () => {
    if (!particleSystem) return;
    particleSystem.updateConfig({
        emitter: { range: emitterSettings.range }
    });
};

const updateVelocity = () => {
    if (!particleSystem) return;
    particleSystem.updateConfig({
        physics: { velocity: emitterSettings.velocity }
    });
};

const updateGravity = () => {
    if (!particleSystem) return;
    particleSystem.updateConfig({
        physics: { gravity: physicsSettings.gravity }
    });
};

const updateDamping = () => {
    if (!particleSystem) return;
    particleSystem.updateConfig({
        physics: { damping: physicsSettings.damping }
    });
};

const updateBlendMode = () => {
    if (!particleSystem) return;
    particleSystem.updateConfig({ blending: physicsSettings.blendMode });
};

// 纹理相关方法
const updateTexture = () => {
    if (!particleSystem) return;

    if (textureSettings.path.trim()) {
        textureStatus.value = { type: 'loading', message: '正在加载纹理...' };
        particleSystem.updateConfig({
            texture: textureSettings.path.trim()
        });
    } else {
        particleSystem.updateConfig({ texture: null });
        textureStatus.value = null;
    }
};

const updateTextureRepeat = () => {
    if (!particleSystem) return;
    particleSystem.updateConfig({
        textureRepeat: [textureSettings.repeatX, textureSettings.repeatY]
    });
};

// Shader 相关方法
const updateShaderMode = () => {
    if (!particleSystem) return;
    particleSystem.updateConfig({
        useCustomShader: shaderSettings.useCustomShader,
        shaderType: shaderSettings.type
    });
};

const updateShaderType = () => {
    if (!particleSystem) return;
    particleSystem.updateConfig({
        shaderType: shaderSettings.type
    });
};

const updateShaderUniforms = () => {
    if (!particleSystem) return;

    const uniforms = {};

    switch (shaderSettings.type) {
        case 'glow':
            uniforms.uGlowIntensity = shaderSettings.glowIntensity;
            break;
        case 'sparkle':
            uniforms.uSparkleFrequency = shaderSettings.sparkleFrequency;
            break;
        case 'fire':
        case 'smoke':
            uniforms.uNoiseScale = shaderSettings.noiseScale;
            break;
    }

    particleSystem.updateConfig({
        shaderUniforms: uniforms
    });
};

// 预设效果
const loadPresetEffect = (type) => {
    if (!particleSystem) return;

    // 使用 ParticleSystem 组件的预设功能
    particleSystem.setPreset(type);

    // 更新本地状态以反映预设值
    const presets = {
        fire: {
            color: '#ff4500',
            size: 1.5,
            lifetime: 3.0,
            emissionRate: 200,
            shape: 'point',
            velocity: { min: 3, max: 8 },
            gravity: -2,
            damping: 0.95,
            blendMode: 'additive'
        },
        smoke: {
            color: '#888888',
            size: 2.0,
            lifetime: 8.0,
            emissionRate: 50,
            shape: 'sphere',
            range: 0.5,
            velocity: { min: 1, max: 3 },
            gravity: -1,
            damping: 0.99,
            blendMode: 'normal'
        },
        rain: {
            color: '#4169e1',
            size: 0.5,
            lifetime: 4.0,
            emissionRate: 500,
            shape: 'box',
            range: 10,
            position: { x: 0, y: 10, z: 0 },
            velocity: { min: 8, max: 12 },
            gravity: -20,
            damping: 1.0,
            blendMode: 'normal'
        },
        snow: {
            color: '#ffffff',
            size: 1.0,
            lifetime: 10.0,
            emissionRate: 100,
            shape: 'box',
            range: 8,
            position: { x: 0, y: 8, z: 0 },
            velocity: { min: 0.5, max: 2 },
            gravity: -2,
            damping: 0.99,
            blendMode: 'normal'
        },
        stars: {
            color: '#ffff00',
            size: 2.0,
            lifetime: 6.0,
            emissionRate: 30,
            shape: 'sphere',
            range: 5,
            velocity: { min: 0.1, max: 0.5 },
            gravity: 0,
            damping: 1.0,
            blendMode: 'additive'
        },
        explosion: {
            color: '#ff6600',
            size: 1.5,
            lifetime: 2.0,
            emissionRate: 1000,
            shape: 'point',
            velocity: { min: 10, max: 20 },
            gravity: -5,
            damping: 0.9,
            blendMode: 'additive'
        }
    };

    const preset = presets[type];
    if (preset) {
        // 更新本地状态
        particleSettings.color = preset.color;
        particleSettings.size = preset.size;
        particleSettings.lifetime = preset.lifetime;
        particleSettings.emissionRate = preset.emissionRate;

        emitterSettings.shape = preset.shape;
        if (preset.range) emitterSettings.range = preset.range;
        if (preset.position) emitterSettings.position = preset.position;
        emitterSettings.velocity = preset.velocity;

        physicsSettings.gravity = preset.gravity;
        physicsSettings.damping = preset.damping;
        physicsSettings.blendMode = preset.blendMode;
    }
};

// 清理资源
const cleanup = () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    if (particleSystem && scene) {
        scene.remove('main-particles');
        particleSystem = null;
    }

    if (scene) {
        scene.dispose();
        scene = null;
    }
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';

/* 场景容器 */
.scene-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #1a1a1a;
    overflow: hidden;
}

/* 位置网格布局 */
.position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 15px;
}

/* 按钮组 */
.button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* 纹理状态 */
.texture-status {
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    text-align: center;
    margin-top: 8px;
}

.texture-status.loading {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
    border: 1px solid rgba(255, 193, 7, 0.3);
}

.texture-status.success {
    background: rgba(40, 167, 69, 0.2);
    color: #28a745;
    border: 1px solid rgba(40, 167, 69, 0.3);
}

.texture-status.error {
    background: rgba(220, 53, 69, 0.2);
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, 0.3);
}

/* 动画 */
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>

