<template>
    <SplitLayout :code="sourceCode" language="javascript" title="06 - Particle System">
        <div class="scene-container" ref="sceneContainer">
            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-overlay">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">{{ loadingText }}</div>
                    <div class="loading-progress">
                        <div class="progress-bar">
                            <div
                                class="progress-fill"
                                :style="{ width: loadingProgress + '%' }"
                            ></div>
                        </div>
                        <span class="progress-text">{{ loadingProgress }}%</span>
                    </div>
                </div>
            </div>

            <!-- 控制面板 -->
            <div class="control-panel">
                <!-- 粒子参数控制 -->
                <div class="control-section">
                    <h4>粒子参数</h4>
                    <div class="particle-controls">
                        <div class="param-group">
                            <label>粒子数量</label>
                            <input
                                type="range"
                                v-model.number="particleSettings.count"
                                @input="updateParticleCount"
                                min="100"
                                max="10000"
                                step="100"
                            />
                            <span>{{ particleSettings.count }}</span>
                        </div>

                        <div class="param-group">
                            <label>粒子大小</label>
                            <input
                                type="range"
                                v-model.number="particleSettings.size"
                                @input="updateParticleSize"
                                min="0.1"
                                max="5"
                                step="0.1"
                            />
                            <span>{{ particleSettings.size }}</span>
                        </div>

                        <div class="param-group">
                            <label>生命周期</label>
                            <input
                                type="range"
                                v-model.number="particleSettings.lifetime"
                                @input="updateParticleLifetime"
                                min="1"
                                max="10"
                                step="0.5"
                            />
                            <span>{{ particleSettings.lifetime }}s</span>
                        </div>

                        <div class="param-group">
                            <label>发射速率</label>
                            <input
                                type="range"
                                v-model.number="particleSettings.emissionRate"
                                @input="updateEmissionRate"
                                min="10"
                                max="1000"
                                step="10"
                            />
                            <span>{{ particleSettings.emissionRate }}/s</span>
                        </div>

                        <div class="color-control">
                            <label>粒子颜色</label>
                            <input
                                type="color"
                                v-model="particleSettings.color"
                                @input="updateParticleColor"
                            />
                        </div>
                    </div>
                </div>

                <!-- 发射器配置 -->
                <div class="control-section">
                    <h4>发射器配置</h4>
                    <div class="emitter-controls">
                        <div class="setting-group">
                            <label>发射器形状</label>
                            <select v-model="emitterSettings.shape" @change="updateEmitterShape">
                                <option value="point">点</option>
                                <option value="sphere">球体</option>
                                <option value="box">盒子</option>
                                <option value="cone">圆锥</option>
                            </select>
                        </div>

                        <div class="position-controls">
                            <label>发射器位置</label>
                            <div class="position-inputs">
                                <div class="input-group">
                                    <label>X</label>
                                    <input
                                        type="number"
                                        v-model.number="emitterSettings.position.x"
                                        @input="updateEmitterPosition"
                                        step="0.1"
                                    />
                                </div>
                                <div class="input-group">
                                    <label>Y</label>
                                    <input
                                        type="number"
                                        v-model.number="emitterSettings.position.y"
                                        @input="updateEmitterPosition"
                                        step="0.1"
                                    />
                                </div>
                                <div class="input-group">
                                    <label>Z</label>
                                    <input
                                        type="number"
                                        v-model.number="emitterSettings.position.z"
                                        @input="updateEmitterPosition"
                                        step="0.1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div class="param-group">
                            <label>发射范围</label>
                            <input
                                type="range"
                                v-model.number="emitterSettings.range"
                                @input="updateEmitterRange"
                                min="0.1"
                                max="5"
                                step="0.1"
                            />
                            <span>{{ emitterSettings.range }}</span>
                        </div>

                        <div class="velocity-controls">
                            <label>初始速度</label>
                            <div class="param-group">
                                <label>最小</label>
                                <input
                                    type="range"
                                    v-model.number="emitterSettings.velocity.min"
                                    @input="updateVelocity"
                                    min="0"
                                    max="20"
                                    step="0.5"
                                />
                                <span>{{ emitterSettings.velocity.min }}</span>
                            </div>
                            <div class="param-group">
                                <label>最大</label>
                                <input
                                    type="range"
                                    v-model.number="emitterSettings.velocity.max"
                                    @input="updateVelocity"
                                    min="0"
                                    max="20"
                                    step="0.5"
                                />
                                <span>{{ emitterSettings.velocity.max }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 物理设置 -->
                <div class="control-section">
                    <h4>物理设置</h4>
                    <div class="physics-controls">
                        <div class="param-group">
                            <label>重力</label>
                            <input
                                type="range"
                                v-model.number="physicsSettings.gravity"
                                @input="updateGravity"
                                min="-20"
                                max="20"
                                step="0.5"
                            />
                            <span>{{ physicsSettings.gravity }}</span>
                        </div>

                        <div class="param-group">
                            <label>阻力</label>
                            <input
                                type="range"
                                v-model.number="physicsSettings.damping"
                                @input="updateDamping"
                                min="0"
                                max="1"
                                step="0.01"
                            />
                            <span>{{ physicsSettings.damping.toFixed(2) }}</span>
                        </div>

                        <div class="setting-group">
                            <label>混合模式</label>
                            <select v-model="physicsSettings.blendMode" @change="updateBlendMode">
                                <option value="normal">正常</option>
                                <option value="additive">叠加</option>
                                <option value="multiply">相乘</option>
                                <option value="screen">滤色</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- 预设效果 -->
                <div class="control-section">
                    <h4>预设效果</h4>
                    <div class="preset-effects">
                        <button @click="loadPresetEffect('fire')" class="preset-btn">
                            🔥 火焰
                        </button>
                        <button @click="loadPresetEffect('smoke')" class="preset-btn">
                            💨 烟雾
                        </button>
                        <button @click="loadPresetEffect('rain')" class="preset-btn">🌧️ 雨</button>
                        <button @click="loadPresetEffect('snow')" class="preset-btn">❄️ 雪</button>
                        <button @click="loadPresetEffect('stars')" class="preset-btn">
                            ⭐ 星星
                        </button>
                        <button @click="loadPresetEffect('explosion')" class="preset-btn">
                            💥 爆炸
                        </button>
                    </div>
                </div>

                <!-- 纹理设置 -->
                <div class="control-section">
                    <h4>纹理设置</h4>
                    <div class="texture-controls">
                        <div class="setting-group">
                            <label>纹理路径</label>
                            <input
                                type="text"
                                v-model="textureSettings.path"
                                @change="updateTexture"
                                placeholder="/images/particle.png"
                                class="texture-input"
                            />
                        </div>

                        <div class="setting-group">
                            <label>纹理重复 X</label>
                            <input
                                type="range"
                                v-model.number="textureSettings.repeatX"
                                @input="updateTextureRepeat"
                                min="0.1"
                                max="5"
                                step="0.1"
                            />
                            <span>{{ textureSettings.repeatX.toFixed(1) }}</span>
                        </div>

                        <div class="setting-group">
                            <label>纹理重复 Y</label>
                            <input
                                type="range"
                                v-model.number="textureSettings.repeatY"
                                @input="updateTextureRepeat"
                                min="0.1"
                                max="5"
                                step="0.1"
                            />
                            <span>{{ textureSettings.repeatY.toFixed(1) }}</span>
                        </div>

                        <div class="texture-status" v-if="textureStatus">
                            <span :class="textureStatus.type">{{ textureStatus.message }}</span>
                        </div>
                    </div>
                </div>

                <!-- Shader 设置 -->
                <div class="control-section">
                    <h4>自定义 Shader</h4>
                    <div class="shader-controls">
                        <div class="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    v-model="shaderSettings.useCustomShader"
                                    @change="updateShaderMode"
                                />
                                启用自定义 Shader
                            </label>
                        </div>

                        <div v-if="shaderSettings.useCustomShader" class="shader-options">
                            <div class="setting-group">
                                <label>Shader 类型</label>
                                <select v-model="shaderSettings.type" @change="updateShaderType">
                                    <option value="glow">发光效果</option>
                                    <option value="sparkle">闪烁效果</option>
                                    <option value="fire">火焰效果</option>
                                    <option value="smoke">烟雾效果</option>
                                </select>
                            </div>

                            <div class="setting-group" v-if="shaderSettings.type === 'glow'">
                                <label>发光强度</label>
                                <input
                                    type="range"
                                    v-model.number="shaderSettings.glowIntensity"
                                    @input="updateShaderUniforms"
                                    min="0.1"
                                    max="3"
                                    step="0.1"
                                />
                                <span>{{ shaderSettings.glowIntensity.toFixed(1) }}</span>
                            </div>

                            <div class="setting-group" v-if="shaderSettings.type === 'sparkle'">
                                <label>闪烁频率</label>
                                <input
                                    type="range"
                                    v-model.number="shaderSettings.sparkleFrequency"
                                    @input="updateShaderUniforms"
                                    min="1"
                                    max="20"
                                    step="1"
                                />
                                <span>{{ shaderSettings.sparkleFrequency }}</span>
                            </div>

                            <div
                                class="setting-group"
                                v-if="
                                    shaderSettings.type === 'fire' ||
                                    shaderSettings.type === 'smoke'
                                "
                            >
                                <label>噪声缩放</label>
                                <input
                                    type="range"
                                    v-model.number="shaderSettings.noiseScale"
                                    @input="updateShaderUniforms"
                                    min="0.1"
                                    max="5"
                                    step="0.1"
                                />
                                <span>{{ shaderSettings.noiseScale.toFixed(1) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 控制按钮 -->
                <div class="control-section">
                    <h4>控制</h4>
                    <div class="control-buttons">
                        <button
                            @click="startParticles"
                            class="start-btn"
                            :disabled="!particleSystem"
                        >
                            {{ isEmitting ? '停止发射' : '开始发射' }}
                        </button>
                        <button
                            @click="clearParticles"
                            class="clear-btn"
                            :disabled="!particleSystem"
                        >
                            清除粒子
                        </button>
                        <button @click="resetSettings" class="reset-btn">重置设置</button>
                    </div>
                </div>

                <!-- 粒子信息 -->
                <div class="control-section" v-if="particleSystem">
                    <h4>粒子信息</h4>
                    <div class="particle-info">
                        <div class="info-item">
                            <span>活跃粒子：</span>
                            <span class="info-value">{{ activeParticleCount }}</span>
                        </div>
                        <div class="info-item">
                            <span>发射状态：</span>
                            <span class="info-value">{{ isEmitting ? '发射中' : '已停止' }}</span>
                        </div>
                        <div class="info-item">
                            <span>当前帧率：</span>
                            <span class="info-value">{{ currentFPS }} FPS</span>
                        </div>
                        <div class="info-item">
                            <span>渲染模式：</span>
                            <span class="info-value">{{ physicsSettings.blendMode }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </SplitLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { Scene } from '@w3d/core';
import { GridHelper, ParticleSystem } from '@w3d/components';
import SplitLayout from '../../components/SplitLayout.vue';

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
  texture: '/images/particle.png',  // 纹理路径
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

        // 启动渲染循环
        startRenderLoop();

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

        // 监听纹理加载事件
        particleSystem.on('textureLoadStart', (data) => {
            textureStatus.value = { type: 'loading', message: '正在加载纹理...' };
        });

        particleSystem.on('textureLoaded', (data) => {
            textureStatus.value = { type: 'success', message: '纹理加载成功' };
            setTimeout(() => {
                textureStatus.value = null;
            }, 3000);
        });

        particleSystem.on('textureLoadError', (data) => {
            textureStatus.value = { type: 'error', message: '纹理加载失败' };
            setTimeout(() => {
                textureStatus.value = null;
            }, 5000);
        });

        console.log('粒子系统创建成功:', particleSystem);
    } catch (error) {
        console.error('创建粒子系统失败:', error);
    }
};
// 启动渲染循环
const startRenderLoop = () => {
    let lastTime = performance.now();

    const animate = () => {
        if (!scene) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        // 更新FPS
        currentFPS.value = Math.round(1 / deltaTime);

        // 更新活跃粒子数量
        if (particleSystem) {
            const stats = particleSystem.getStats();
            activeParticleCount.value = stats.activeParticles;
            isEmitting.value = stats.isEmitting;
        }

        // 渲染场景
        scene.render();

        animationFrameId = requestAnimationFrame(animate);
    };

    animate();
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
        scene.remove(particleSystem);
        createParticleSystem();
    }
};

// 参数更新方法
const updateParticleCount = () => {
    if (!particleSystem) return;

    // 重新创建粒子系统
    scene.remove(particleSystem);
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
        scene.remove(particleSystem);
    }

    if (scene) {
        scene.destroy();
        scene = null;
    }

    particleSystem = null;
};
</script>

<style scoped>
/* 场景容器 */
.scene-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #1a1a1a;
    overflow: hidden;
}

/* 加载状态 */
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
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #00ff88;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

.loading-text {
    font-size: 16px;
    margin-bottom: 15px;
    color: #ffffff;
}

.loading-progress {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
}

.progress-bar {
    width: 200px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00ff88, #00cc6a);
    border-radius: 2px;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 14px;
    color: #00ff88;
    min-width: 40px;
}

/* 控制面板 */
.control-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 320px;
    max-height: calc(100vh - 40px);
    background: rgba(30, 30, 30, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    overflow-y: auto;
    z-index: 100;
}

.control-section {
    margin-bottom: 25px;
}

.control-section:last-child {
    margin-bottom: 0;
}

.control-section h4 {
    margin: 0 0 15px 0;
    color: #00ff88;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid rgba(0, 255, 136, 0.3);
    padding-bottom: 8px;
}

/* 粒子控制 */
.particle-controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.param-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.param-group label {
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    min-width: 80px;
}

.param-group input[type='range'] {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
}

.param-group input[type='range']::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #00ff88;
    border-radius: 50%;
    cursor: pointer;
}

.param-group input[type='range']::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #00ff88;
    border-radius: 50%;
    border: none;
    cursor: pointer;
}

.param-group span {
    color: #00ff88;
    font-size: 12px;
    min-width: 60px;
    text-align: right;
}

.color-control {
    display: flex;
    align-items: center;
    gap: 10px;
}

.color-control label {
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    min-width: 80px;
}

.color-control input[type='color'] {
    width: 40px;
    height: 30px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
}

/* 发射器控制 */
.emitter-controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.setting-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.position-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.position-inputs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.input-group label {
    color: #ffffff;
    font-size: 12px;
    text-align: center;
}

.input-group input[type='number'] {
    padding: 6px 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #ffffff;
    font-size: 12px;
    text-align: center;
}

.velocity-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.velocity-controls > label {
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
}

/* 物理控制 */
.physics-controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

/* 预设效果 */
.preset-effects {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.preset-btn {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: #ffffff;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
}

.preset-btn:hover {
    background: rgba(0, 255, 136, 0.2);
    border-color: #00ff88;
}

/* 控制按钮 */
.control-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.start-btn,
.clear-btn,
.reset-btn {
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.start-btn {
    background: linear-gradient(135deg, #00ff88, #00cc6a);
    color: #000000;
}

.start-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #00cc6a, #00aa55);
    transform: translateY(-1px);
}

.clear-btn,
.reset-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.clear-btn:hover:not(:disabled),
.reset-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}

.start-btn:disabled,
.clear-btn:disabled,
.reset-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

/* 粒子信息 */
.particle-info {
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

/* 滚动条样式 */
.control-panel::-webkit-scrollbar {
    width: 6px;
}

.control-panel::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 136, 0.5);
    border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 136, 0.7);
}

.setting-group label {
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
}

.setting-group select {
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: #ffffff;
    font-size: 14px;
}

/* 纹理控件样式 */
.texture-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.texture-input {
    width: 100%;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #ffffff;
    font-size: 12px;
    outline: none;
    transition: all 0.3s ease;
}

.texture-input:focus {
    border-color: #00ff88;
    background: rgba(255, 255, 255, 0.15);
}

.texture-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.texture-status {
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 11px;
    text-align: center;
}

.texture-status .loading {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
    border: 1px solid rgba(255, 193, 7, 0.3);
}

.texture-status .success {
    background: rgba(40, 167, 69, 0.2);
    color: #28a745;
    border: 1px solid rgba(40, 167, 69, 0.3);
}

.texture-status .error {
    background: rgba(220, 53, 69, 0.2);
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, 0.3);
}

/* Shader 控件样式 */
.shader-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.shader-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.setting-group label input[type='checkbox'] {
    margin-right: 8px;
    accent-color: #00ff88;
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

