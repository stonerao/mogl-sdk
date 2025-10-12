import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * ParticleSystem 粒子系统组件
 *
 * @class ParticleSystem
 * @extends Component
 * @description 高级粒子系统，支持动态发射、物理效果、多种发射器形状
 *
 * @example
 * const particles = await scene.add('ParticleSystem', {
 *     name: 'fire',
 *     count: 1000,
 *     size: 1.5,
 *     color: '#ff4500',
 *     emitter: {
 *         shape: 'point',
 *         position: [0, 0, 0],
 *         rate: 100
 *     },
 *     physics: {
 *         gravity: -9.8,
 *         velocity: { min: 2, max: 8 }
 *     }
 * });
 */
export class ParticleSystem extends Component {
    /**
     * 默认配置
     */
    static defaultConfig = {
        // 粒子基础设置
        count: 1000,
        size: 1.0,
        color: '#ffffff',
        opacity: 0.8,
        lifetime: 5.0,

        // 发射器设置
        emitter: {
            shape: 'point', // 'point', 'sphere', 'box', 'cone'
            position: [0, 0, 0], // 发射器位置
            range: 1.0, // 发射范围
            rate: 100, // 发射速率 (粒子/秒)
            autoStart: true // 自动开始发射
        },

        // 物理设置
        physics: {
            gravity: -9.8, // 重力
            damping: 0.98, // 阻力
            velocity: {
                // 初始速度范围
                min: 2,
                max: 8
            }
        },

        // 渲染设置
        blending: 'additive', // 'normal', 'additive', 'multiply', 'screen'
        transparent: true,
        sizeAttenuation: true,

        // 纹理设置
        texture: null, // 纹理路径，例如：'/images/particle.png'
        textureRepeat: [1, 1], // 纹理重复
        textureOffset: [0, 0], // 纹理偏移

        // 自定义 Shader 设置
        useCustomShader: false, // 是否使用自定义 Shader
        shaderType: 'glow', // Shader 类型：'glow', 'sparkle', 'fire', 'smoke'
        depthWrite: false, // 深度写入

        // Shader 参数
        shaderUniforms: {
            uTime: 0.0,
            uGlowIntensity: 1.0,
            uSparkleFrequency: 10.0,
            uNoiseScale: 1.0
        }
    };

    /**
     * 组件挂载完成
     */
    onMounted() {
        // 纹理加载器
        this.textureLoader = new THREE.TextureLoader();
        this.loadedTexture = null;
        this.isTextureLoading = false;

        // 初始化粒子系统
        this.initializeParticleSystem();

        // 创建时钟
        this.clock = new THREE.Clock();

        // 发射状态
        this.isEmitting = this.config.emitter.autoStart;

        // 统计信息
        this.stats = {
            activeParticles: 0,
            totalEmitted: 0
        };

        // 加载纹理（如果配置了）
        if (this.config.texture) {
            this.loadTexture(this.config.texture);
        }
    }

    /**
     * 初始化粒子系统
     */
    initializeParticleSystem() {
        const count = this.config.count;

        // 创建粒子数据
        this.particles = [];
        this.emissionAccumulator = 0;

        // 创建几何体
        this.geometry = new THREE.BufferGeometry();

        // 创建属性数组
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        // 初始化粒子对象
        for (let i = 0; i < count; i++) {
            const particle = {
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                life: 0,
                maxLife: this.config.lifetime,
                size: this.config.size,
                active: false
            };
            this.particles.push(particle);

            // 初始化属性数组
            const i3 = i * 3;
            positions[i3] = 0;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = 0;

            const color = new THREE.Color(this.config.color);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            sizes[i] = particle.size;
        }

        // 设置几何体属性
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // 创建材质
        this.createMaterial();

        // 创建粒子系统
        this.particlePoints = new THREE.Points(this.geometry, this.material);
        this.add(this.particlePoints);
    }

    /**
     * 获取混合模式
     */
    getBlendingMode(mode) {
        switch (mode) {
            case 'additive':
                return THREE.AdditiveBlending;
            case 'multiply':
                return THREE.MultiplyBlending;
            case 'screen':
                return THREE.CustomBlending;
            default:
                return THREE.NormalBlending;
        }
    }

    /**
     * 创建材质
     */
    createMaterial() {
        if (this.config.useCustomShader) {
            this.material = this.createShaderMaterial();
        } else {
            this.material = this.createPointsMaterial();
        }
    }

    /**
     * 创建标准点材质
     */
    createPointsMaterial() {
        const materialConfig = {
            size: this.config.size,
            color: new THREE.Color(this.config.color),
            transparent: this.config.transparent,
            opacity: this.config.opacity,
            blending: this.getBlendingMode(this.config.blending),
            vertexColors: true,
            sizeAttenuation: this.config.sizeAttenuation,
            depthWrite: this.config.depthWrite
        };

        // 添加纹理（如果已加载）
        if (this.loadedTexture) {
            materialConfig.map = this.loadedTexture;
            materialConfig.alphaMap = this.loadedTexture;
        }

        return new THREE.PointsMaterial(materialConfig);
    }

    /**
     * 创建自定义 Shader 材质
     */
    createShaderMaterial() {
        const shaderConfig = this.getShaderConfig(this.config.shaderType);

        // 基础 uniforms
        const uniforms = {
            uTime: { value: this.config.shaderUniforms.uTime },
            uTexture: { value: this.loadedTexture },
            uColor: { value: new THREE.Color(this.config.color) },
            uOpacity: { value: this.config.opacity },
            uSize: { value: this.config.size },
            ...shaderConfig.uniforms
        };

        return new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: shaderConfig.vertexShader,
            fragmentShader: shaderConfig.fragmentShader,
            transparent: this.config.transparent,
            blending: this.getBlendingMode(this.config.blending),
            depthWrite: this.config.depthWrite,
            vertexColors: true
        });
    }

    /**
     * 获取 Shader 配置
     */
    getShaderConfig(shaderType) {
        const configs = {
            glow: {
                uniforms: {
                    uGlowIntensity: { value: this.config.shaderUniforms.uGlowIntensity }
                },
                vertexShader: this.getGlowVertexShader(),
                fragmentShader: this.getGlowFragmentShader()
            },
            sparkle: {
                uniforms: {
                    uSparkleFrequency: { value: this.config.shaderUniforms.uSparkleFrequency }
                },
                vertexShader: this.getSparkleVertexShader(),
                fragmentShader: this.getSparkleFragmentShader()
            },
            fire: {
                uniforms: {
                    uNoiseScale: { value: this.config.shaderUniforms.uNoiseScale }
                },
                vertexShader: this.getFireVertexShader(),
                fragmentShader: this.getFireFragmentShader()
            },
            smoke: {
                uniforms: {
                    uNoiseScale: { value: this.config.shaderUniforms.uNoiseScale }
                },
                vertexShader: this.getSmokeVertexShader(),
                fragmentShader: this.getSmokeFragmentShader()
            }
        };

        return configs[shaderType] || configs.glow;
    }

    /**
     * 加载纹理
     */
    loadTexture(texturePath) {
        if (this.isTextureLoading) return;

        this.isTextureLoading = true;
        this.emit('textureLoadStart', { path: texturePath });

        this.textureLoader.load(
            texturePath,
            // 加载成功
            (texture) => {
                this.loadedTexture = texture;
                this.loadedTexture.wrapS = THREE.RepeatWrapping;
                this.loadedTexture.wrapT = THREE.RepeatWrapping;
                this.loadedTexture.repeat.set(...this.config.textureRepeat);
                this.loadedTexture.offset.set(...this.config.textureOffset);

                // 重新创建材质以应用纹理
                this.updateMaterialTexture();

                this.isTextureLoading = false;
                this.emit('textureLoaded', { texture: this.loadedTexture, path: texturePath });
            },
            // 加载进度
            (progress) => {
                this.emit('textureLoadProgress', {
                    progress: (progress.loaded / progress.total) * 100,
                    path: texturePath
                });
            },
            // 加载失败
            (error) => {
                console.error('纹理加载失败:', error);
                this.isTextureLoading = false;
                this.emit('textureLoadError', { error, path: texturePath });
            }
        );
    }

    /**
     * 更新材质纹理
     */
    updateMaterialTexture() {
        if (!this.material) return;

        if (this.material.isShaderMaterial) {
            // Shader 材质
            this.material.uniforms.uTexture.value = this.loadedTexture;
        } else {
            // Points 材质
            this.material.map = this.loadedTexture;
            this.material.alphaMap = this.loadedTexture;
            this.material.needsUpdate = true;
        }
    }

    /**
     * Glow Vertex Shader
     */
    getGlowVertexShader() {
        return `
            attribute float size;
            attribute vec3 color;

            uniform float uTime;
            uniform float uSize;

            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vColor = color;

                // 基于生命周期的透明度变化
                float life = 1.0 - (uTime * 0.1);
                vAlpha = smoothstep(0.0, 0.3, life) * smoothstep(1.0, 0.7, life);

                // 计算粒子大小
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * uSize * (300.0 / -mvPosition.z);

                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    /**
     * Glow Fragment Shader
     */
    getGlowFragmentShader() {
        return `
            uniform sampler2D uTexture;
            uniform vec3 uColor;
            uniform float uOpacity;
            uniform float uGlowIntensity;

            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                // 计算距离中心的距离
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);

                // 创建发光效果
                float glow = 1.0 - smoothstep(0.0, 0.5, dist);
                glow = pow(glow, 2.0) * uGlowIntensity;

                // 纹理采样
                vec4 texColor = vec4(1.0);
                if (uTexture != null) {
                    texColor = texture2D(uTexture, gl_PointCoord);
                }

                // 最终颜色
                vec3 finalColor = vColor * uColor * glow;
                float finalAlpha = vAlpha * uOpacity * texColor.a * glow;

                gl_FragColor = vec4(finalColor, finalAlpha);
            }
        `;
    }

    /**
     * Sparkle Vertex Shader
     */
    getSparkleVertexShader() {
        return `
            attribute float size;
            attribute vec3 color;

            uniform float uTime;
            uniform float uSize;
            uniform float uSparkleFrequency;

            varying vec3 vColor;
            varying float vAlpha;
            varying float vSparkle;

            void main() {
                vColor = color;

                // 闪烁效果
                float sparkle = sin(uTime * uSparkleFrequency + position.x * 10.0) * 0.5 + 0.5;
                vSparkle = sparkle;
                vAlpha = sparkle;

                // 计算粒子大小
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * uSize * (300.0 / -mvPosition.z) * (0.5 + sparkle * 0.5);

                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    /**
     * Sparkle Fragment Shader
     */
    getSparkleFragmentShader() {
        return `
            uniform sampler2D uTexture;
            uniform vec3 uColor;
            uniform float uOpacity;

            varying vec3 vColor;
            varying float vAlpha;
            varying float vSparkle;

            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);

                // 星形闪烁效果
                float angle = atan(center.y, center.x);
                float star = abs(sin(angle * 4.0)) * 0.5 + 0.5;
                float sparkle = (1.0 - smoothstep(0.0, 0.4, dist)) * star * vSparkle;

                // 纹理采样
                vec4 texColor = vec4(1.0);
                if (uTexture != null) {
                    texColor = texture2D(uTexture, gl_PointCoord);
                }

                vec3 finalColor = vColor * uColor * sparkle;
                float finalAlpha = vAlpha * uOpacity * texColor.a * sparkle;

                gl_FragColor = vec4(finalColor, finalAlpha);
            }
        `;
    }

    /**
     * Fire Vertex Shader
     */
    getFireVertexShader() {
        return `
            attribute float size;
            attribute vec3 color;

            uniform float uTime;
            uniform float uSize;
            uniform float uNoiseScale;

            varying vec3 vColor;
            varying float vAlpha;
            varying vec2 vUv;

            // 简单噪声函数
            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void main() {
                vColor = color;
                vUv = uv;

                // 火焰向上飘动效果
                vec3 pos = position;
                float n = noise(pos.xz * uNoiseScale + uTime * 0.5);
                pos.x += sin(uTime * 2.0 + n * 10.0) * 0.5;
                pos.y += uTime * 2.0;

                // 基于高度的透明度
                float heightFade = 1.0 - smoothstep(0.0, 10.0, pos.y);
                vAlpha = heightFade;

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * uSize * (300.0 / -mvPosition.z);

                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    /**
     * Fire Fragment Shader
     */
    getFireFragmentShader() {
        return `
            uniform sampler2D uTexture;
            uniform vec3 uColor;
            uniform float uOpacity;
            uniform float uTime;

            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);

                // 火焰形状
                float flame = 1.0 - smoothstep(0.0, 0.5, dist);
                flame *= (sin(uTime * 5.0) * 0.1 + 0.9);

                // 火焰颜色渐变（红->橙->黄）
                vec3 fireColor = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0), flame);
                fireColor = mix(fireColor, vColor, 0.5);

                // 纹理采样
                vec4 texColor = vec4(1.0);
                if (uTexture != null) {
                    texColor = texture2D(uTexture, gl_PointCoord);
                }

                vec3 finalColor = fireColor * uColor * flame;
                float finalAlpha = vAlpha * uOpacity * texColor.a * flame;

                gl_FragColor = vec4(finalColor, finalAlpha);
            }
        `;
    }

    /**
     * Smoke Vertex Shader
     */
    getSmokeVertexShader() {
        return `
            attribute float size;
            attribute vec3 color;

            uniform float uTime;
            uniform float uSize;
            uniform float uNoiseScale;

            varying vec3 vColor;
            varying float vAlpha;

            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void main() {
                vColor = color;

                // 烟雾飘散效果
                vec3 pos = position;
                float n1 = noise(pos.xz * uNoiseScale + uTime * 0.3);
                float n2 = noise(pos.xz * uNoiseScale * 2.0 + uTime * 0.2);

                pos.x += (n1 - 0.5) * 2.0;
                pos.z += (n2 - 0.5) * 2.0;
                pos.y += uTime * 1.0;

                // 基于高度的透明度衰减
                float heightFade = 1.0 - smoothstep(0.0, 15.0, pos.y);
                vAlpha = heightFade * 0.6;

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * uSize * (300.0 / -mvPosition.z) * (1.0 + pos.y * 0.1);

                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    /**
     * Smoke Fragment Shader
     */
    getSmokeFragmentShader() {
        return `
            uniform sampler2D uTexture;
            uniform vec3 uColor;
            uniform float uOpacity;

            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);

                // 柔和的烟雾形状
                float smoke = 1.0 - smoothstep(0.0, 0.5, dist);
                smoke = pow(smoke, 0.5);

                // 烟雾颜色（灰色调）
                vec3 smokeColor = mix(vec3(0.3, 0.3, 0.3), vec3(0.8, 0.8, 0.8), smoke);
                smokeColor = mix(smokeColor, vColor, 0.3);

                // 纹理采样
                vec4 texColor = vec4(1.0);
                if (uTexture != null) {
                    texColor = texture2D(uTexture, gl_PointCoord);
                }

                vec3 finalColor = smokeColor * uColor;
                float finalAlpha = vAlpha * uOpacity * texColor.a * smoke;

                gl_FragColor = vec4(finalColor, finalAlpha);
            }
        `;
    }

    /**
     * 更新循环
     */
    onUpdate(deltaTime) {
        if (!this.particles || !this.geometry) return;

        // 更新 Shader uniforms（如果使用自定义 Shader）
        if (this.material && this.material.isShaderMaterial) {
            this.material.uniforms.uTime.value += deltaTime;
        }

        // 更新粒子
        this.updateParticles(deltaTime);

        // 发射新粒子
        if (this.isEmitting) {
            this.emitParticles(deltaTime);
        }

        // 更新几何体属性
        this.updateGeometry();
    }

    /**
     * 更新粒子
     */
    updateParticles(deltaTime) {
        let activeCount = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];

            if (!particle.active) continue;

            // 更新生命周期
            particle.life += deltaTime;

            if (particle.life >= particle.maxLife) {
                particle.active = false;
                continue;
            }

            activeCount++;

            // 更新位置
            particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));

            // 应用重力
            particle.velocity.y += this.config.physics.gravity * deltaTime;

            // 应用阻力
            particle.velocity.multiplyScalar(this.config.physics.damping);
        }

        this.stats.activeParticles = activeCount;
    }

    /**
     * 发射粒子
     */
    emitParticles(deltaTime) {
        // 累积发射数量
        this.emissionAccumulator += this.config.emitter.rate * deltaTime;

        // 发射整数个粒子
        const emitCount = Math.floor(this.emissionAccumulator);
        this.emissionAccumulator -= emitCount;

        for (let i = 0; i < emitCount; i++) {
            this.emitSingleParticle();
        }
    }

    /**
     * 发射单个粒子
     */
    emitSingleParticle() {
        // 找到未激活的粒子
        const particle = this.particles.find((p) => !p.active);
        if (!particle) return;

        // 激活粒子
        particle.active = true;
        particle.life = 0;
        particle.maxLife = this.config.lifetime * (0.8 + Math.random() * 0.4);

        // 设置初始位置
        this.setParticlePosition(particle);

        // 设置初始速度
        this.setParticleVelocity(particle);

        // 设置大小
        particle.size = this.config.size * (0.5 + Math.random() * 0.5);

        this.stats.totalEmitted++;
    }

    /**
     * 设置粒子位置
     */
    setParticlePosition(particle) {
        const emitter = this.config.emitter;
        const pos = emitter.position;
        const range = emitter.range;

        switch (emitter.shape) {
            case 'point':
                particle.position.set(pos[0], pos[1], pos[2]);
                break;

            case 'sphere':
                const phi = Math.random() * Math.PI * 2;
                const theta = Math.random() * Math.PI;
                const radius = Math.random() * range;
                particle.position.set(
                    pos[0] + radius * Math.sin(theta) * Math.cos(phi),
                    pos[1] + radius * Math.cos(theta),
                    pos[2] + radius * Math.sin(theta) * Math.sin(phi)
                );
                break;

            case 'box':
                particle.position.set(
                    pos[0] + (Math.random() - 0.5) * range * 2,
                    pos[1] + (Math.random() - 0.5) * range * 2,
                    pos[2] + (Math.random() - 0.5) * range * 2
                );
                break;

            case 'cone':
                const angle = Math.random() * Math.PI * 2;
                const radius2 = Math.random() * range;
                particle.position.set(
                    pos[0] + radius2 * Math.cos(angle),
                    pos[1],
                    pos[2] + radius2 * Math.sin(angle)
                );
                break;
        }
    }

    /**
     * 设置粒子速度
     */
    setParticleVelocity(particle) {
        const velocity = this.config.physics.velocity;
        const speed = velocity.min + Math.random() * (velocity.max - velocity.min);

        // 随机方向，偏向上方
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI * 0.5;

        particle.velocity.set(
            speed * Math.sin(theta) * Math.cos(phi),
            speed * Math.cos(theta),
            speed * Math.sin(theta) * Math.sin(phi)
        );
    }

    /**
     * 更新几何体属性
     */
    updateGeometry() {
        const positions = this.geometry.attributes.position.array;
        const colors = this.geometry.attributes.color.array;
        const sizes = this.geometry.attributes.size.array;

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const i3 = i * 3;

            if (particle.active) {
                // 更新位置
                positions[i3] = particle.position.x;
                positions[i3 + 1] = particle.position.y;
                positions[i3 + 2] = particle.position.z;

                // 更新大小（基于生命周期）
                const lifeRatio = particle.life / particle.maxLife;
                const alpha = 1 - lifeRatio;
                sizes[i] = particle.size * alpha;

                // 更新颜色（基于生命周期的透明度）
                const color = new THREE.Color(this.config.color);
                colors[i3] = color.r * alpha;
                colors[i3 + 1] = color.g * alpha;
                colors[i3 + 2] = color.b * alpha;
            } else {
                // 隐藏未激活的粒子
                sizes[i] = 0;
                colors[i3] = 0;
                colors[i3 + 1] = 0;
                colors[i3 + 2] = 0;
            }
        }

        // 标记属性需要更新
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
    }
    /**
     * 开始发射粒子
     */
    startEmission() {
        this.isEmitting = true;
    }

    /**
     * 停止发射粒子
     */
    stopEmission() {
        this.isEmitting = false;
    }

    /**
     * 切换发射状态
     */
    toggleEmission() {
        this.isEmitting = !this.isEmitting;
        return this.isEmitting;
    }

    /**
     * 清除所有粒子
     */
    clearParticles() {
        this.particles.forEach((particle) => {
            particle.active = false;
            particle.life = 0;
        });
        this.stats.activeParticles = 0;
    }

    /**
     * 重置粒子系统
     */
    reset() {
        this.clearParticles();
        this.stats.totalEmitted = 0;
        this.emissionAccumulator = 0;
        this.isEmitting = this.config.emitter.autoStart;
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        // 合并配置
        this.config = this.mergeConfig(this.config, newConfig);

        // 检查是否需要重新创建材质
        const needsRecreate =
            newConfig.useCustomShader !== undefined || newConfig.shaderType !== undefined;

        if (needsRecreate) {
            // 重新创建材质
            if (this.material) {
                this.material.dispose();
            }
            this.createMaterial();

            // 更新粒子系统材质
            if (this.particlePoints) {
                this.particlePoints.material = this.material;
            }
        } else {
            // 更新现有材质属性
            if (this.material) {
                if (this.material.isShaderMaterial) {
                    // Shader 材质更新
                    if (newConfig.color) {
                        this.material.uniforms.uColor.value.setStyle(newConfig.color);
                    }
                    if (newConfig.opacity !== undefined) {
                        this.material.uniforms.uOpacity.value = newConfig.opacity;
                    }
                    if (newConfig.size !== undefined) {
                        this.material.uniforms.uSize.value = newConfig.size;
                    }
                    // 更新 Shader uniforms
                    if (newConfig.shaderUniforms) {
                        Object.keys(newConfig.shaderUniforms).forEach((key) => {
                            if (this.material.uniforms[key]) {
                                this.material.uniforms[key].value = newConfig.shaderUniforms[key];
                            }
                        });
                    }
                } else {
                    // Points 材质更新
                    if (newConfig.color) {
                        this.material.color.setStyle(newConfig.color);
                    }
                    if (newConfig.size !== undefined) {
                        this.material.size = newConfig.size;
                    }
                    if (newConfig.opacity !== undefined) {
                        this.material.opacity = newConfig.opacity;
                    }
                    if (newConfig.blending) {
                        this.material.blending = this.getBlendingMode(newConfig.blending);
                    }
                }
            }
        }

        // 处理纹理更新
        if (newConfig.texture !== undefined) {
            if (newConfig.texture && newConfig.texture !== this.config.texture) {
                this.loadTexture(newConfig.texture);
            } else if (!newConfig.texture && this.loadedTexture) {
                // 移除纹理
                this.loadedTexture = null;
                this.updateMaterialTexture();
            }
        }

        // 更新纹理设置
        if (this.loadedTexture && (newConfig.textureRepeat || newConfig.textureOffset)) {
            if (newConfig.textureRepeat) {
                this.loadedTexture.repeat.set(...newConfig.textureRepeat);
            }
            if (newConfig.textureOffset) {
                this.loadedTexture.offset.set(...newConfig.textureOffset);
            }
        }
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            ...this.stats,
            isEmitting: this.isEmitting,
            totalParticles: this.particles.length
        };
    }

    /**
     * 设置预设效果
     */
    setPreset(presetName) {
        const presets = {
            fire: {
                color: '#ff4500',
                size: 1.5,
                lifetime: 3.0,
                emitter: {
                    shape: 'point',
                    rate: 200
                },
                physics: {
                    gravity: -2,
                    velocity: { min: 3, max: 8 }
                },
                blending: 'additive'
            },
            smoke: {
                color: '#888888',
                size: 2.0,
                lifetime: 8.0,
                emitter: {
                    shape: 'sphere',
                    range: 0.5,
                    rate: 50
                },
                physics: {
                    gravity: -1,
                    velocity: { min: 1, max: 3 }
                },
                blending: 'normal'
            },
            rain: {
                color: '#4169e1',
                size: 0.5,
                lifetime: 4.0,
                emitter: {
                    shape: 'box',
                    range: 10,
                    position: [0, 10, 0],
                    rate: 500
                },
                physics: {
                    gravity: -20,
                    velocity: { min: 8, max: 12 }
                },
                blending: 'normal'
            },
            snow: {
                color: '#ffffff',
                size: 1.0,
                lifetime: 10.0,
                emitter: {
                    shape: 'box',
                    range: 8,
                    position: [0, 8, 0],
                    rate: 100
                },
                physics: {
                    gravity: -2,
                    velocity: { min: 0.5, max: 2 }
                },
                blending: 'normal'
            },
            stars: {
                color: '#ffff00',
                size: 2.0,
                lifetime: 6.0,
                emitter: {
                    shape: 'sphere',
                    range: 5,
                    rate: 30
                },
                physics: {
                    gravity: 0,
                    velocity: { min: 0.1, max: 0.5 }
                },
                blending: 'additive'
            },
            explosion: {
                color: '#ff6600',
                size: 1.5,
                lifetime: 2.0,
                emitter: {
                    shape: 'point',
                    rate: 1000
                },
                physics: {
                    gravity: -5,
                    velocity: { min: 10, max: 20 }
                },
                blending: 'additive'
            }
        };

        const preset = presets[presetName];
        if (preset) {
            this.updateConfig(preset);

            // 特殊处理爆炸效果
            if (presetName === 'explosion') {
                this.startEmission();
                setTimeout(() => {
                    this.stopEmission();
                }, 200);
            }
        }
    }

    /**
     * 深度合并配置对象
     */
    mergeConfig(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeConfig(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }

    /**
     * 组件销毁
     */
    onDispose() {
        if (this.geometry) {
            this.geometry.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
        if (this.particlePoints) {
            this.remove(this.particlePoints);
        }

        // 清理纹理资源
        if (this.loadedTexture) {
            this.loadedTexture.dispose();
        }

        this.particles = null;
        this.geometry = null;
        this.material = null;
        this.particlePoints = null;
        this.clock = null;
        this.textureLoader = null;
        this.loadedTexture = null;
    }
}

export default ParticleSystem;
