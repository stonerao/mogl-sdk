import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * MigrationLine 迁移线动画组件
 *
 * @class MigrationLine
 * @extends Component
 * @description 在三维空间中展示从一个点到另一个点（或多个点）的动态迁移效果
 */
export class MigrationLine extends Component {
    static defaultConfig = {
        lines: [], // 迁移线数据数组
        globalConfig: {
            // 全局默认配置
            type: 'shader', // 'shader' | 'particle'
            color: '#00ff00',
            size: 2,
            speed: 1,
            duration: 3000, // 毫秒
            loop: true,
            delay: 0,
            autoStart: true,
            // Shader 特定配置
            glowIntensity: 1.5,
            flowSpeed: 1.0,
            // Particle 特定配置
            particleCount: 20,
            particleSize: 5.0, // 增大粒子大小
            trailLength: 0.3
        }
    };

    constructor(scene, config = {}) {
        super(scene, config);

        // 迁移线对象映射表 (id -> lineObject)
        this.migrationLines = new Map();

        // 迁移线数据映射表 (id -> lineData)
        this.lineDataMap = new Map();

        // 动画状态映射表 (id -> animationState)
        this.animationStates = new Map();

        // 时钟
        this.clock = new THREE.Clock();
    }

    /**
     * 组件挂载完成
     */
    async onMounted() {
        // 合并全局配置
        this.globalConfig = {
            ...this.constructor.defaultConfig.globalConfig,
            ...this.config.globalConfig
        };

        // 创建所有迁移线
        if (this.config.lines && this.config.lines.length > 0) {
            for (const lineData of this.config.lines) {
                await this.createLine(lineData);
            }
        }
    }

    /**
     * 创建单条迁移线
     * @param {Object} lineData - 迁移线数据
     */
    async createLine(lineData) {
        const { id, points, type, userData } = lineData;

        if (!id || !points || points.length < 2) {
            console.warn('MigrationLine: id and at least 2 points are required');
            return;
        }

        // 合并配置
        const lineConfig = {
            ...this.globalConfig,
            ...lineData
        };

        // 创建路径曲线
        const curve = this.createCurve(points);

        // 根据类型创建不同的渲染对象
        let lineObject;
        const renderType = type || lineConfig.type;

        switch (renderType) {
            case 'shader':
                lineObject = this.createShaderLine(curve, lineConfig);
                break;
            case 'particle':
                lineObject = this.createParticleLine(curve, lineConfig);
                break;
            default:
                console.warn(`MigrationLine: Unknown type "${renderType}", using shader`);
                lineObject = this.createShaderLine(curve, lineConfig);
        }

        // 设置 userData
        lineObject.userData = {
            lineId: id,
            customData: userData,
            curve: curve,
            config: lineConfig,
            type: renderType
        };

        // 添加到场景
        this.add(lineObject);

        console.log('[MigrationLine] Line added to scene:', {
            id,
            type: renderType,
            visible: lineObject.visible,
            objectType: lineObject.type,
            childrenCount: this.children.length
        });

        // 保存到映射表
        this.migrationLines.set(id, lineObject);
        this.lineDataMap.set(id, lineData);

        // 初始化动画状态
        const animationState = {
            isPlaying: lineConfig.autoStart,
            isPaused: false,
            progress: 0,
            startTime: lineConfig.autoStart ? Date.now() + lineConfig.delay : 0,
            delay: lineConfig.delay,
            hasStarted: false
        };
        this.animationStates.set(id, animationState);

        // 粒子位置已在 createParticleLine() 中初始化完成，无需额外处理

        // 如果自动开始，触发 start 事件
        if (lineConfig.autoStart && lineConfig.delay === 0) {
            this.emit('start', { lineId: id, userData });
            animationState.hasStarted = true;
        }
    }

    /**
     * 创建路径曲线
     * @param {Array} points - 路径点数组
     * @returns {THREE.CatmullRomCurve3}
     */
    createCurve(points) {
        const vectors = points.map((p) => new THREE.Vector3(p.x || 0, p.y || 0, p.z || 0));
        return new THREE.CatmullRomCurve3(vectors, false);
    }

    /**
     * 创建 Shader 效果的迁移线
     * @param {THREE.CatmullRomCurve3} curve - 路径曲线
     * @param {Object} config - 配置
     * @returns {THREE.Line}
     */
    createShaderLine(curve, config) {
        const points = curve.getPoints(100);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // 添加顶点索引属性（用于 shader 动画）
        const indices = new Float32Array(points.length);
        for (let i = 0; i < points.length; i++) {
            indices[i] = i / (points.length - 1);
        }
        geometry.setAttribute('aIndex', new THREE.BufferAttribute(indices, 1));

        // 创建 Shader 材质
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(config.color) },
                uProgress: { value: 0 },
                uGlowIntensity: { value: config.glowIntensity },
                uFlowSpeed: { value: config.flowSpeed }
            },
            vertexShader: `
                attribute float aIndex;
                varying float vIndex;
                varying vec3 vPosition;

                void main() {
                    vIndex = aIndex;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uColor;
                uniform float uProgress;
                uniform float uGlowIntensity;
                uniform float uFlowSpeed;

                varying float vIndex;
                varying vec3 vPosition;

                void main() {
                    // 流动效果
                    float flow = mod(vIndex - uTime * uFlowSpeed, 1.0);

                    // 渐变透明度
                    float alpha = smoothstep(0.0, 0.1, flow) * smoothstep(1.0, 0.9, flow);

                    // 发光效果
                    float glow = pow(alpha, 0.5) * uGlowIntensity;

                    // 根据进度显示
                    if (vIndex > uProgress) {
                        discard;
                    }

                    vec3 finalColor = uColor * (1.0 + glow);
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        return new THREE.Line(geometry, material);
    }

    /**
     * 创建粒子效果的迁移线
     * @param {THREE.CatmullRomCurve3} curve - 路径曲线
     * @param {Object} config - 配置
     * @returns {THREE.Points}
     */
    createParticleLine(curve, config) {
        // 注意：实际粒子数量可能与配置不同（如果被手动修改）
        const particleCount = config.particleCount;
        const geometry = new THREE.BufferGeometry();

        console.log('[MigrationLine] Creating particle line:', {
            configParticleCount: config.particleCount,
            actualParticleCount: particleCount,
            particleSize: config.particleSize,
            trailLength: config.trailLength,
            color: config.color,
            curveLength: curve.getLength()
        });

        // 初始化粒子属性数组
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const alphas = new Float32Array(particleCount);

        // 将粒子均匀分布在曲线路径上
        console.log('[MigrationLine] Distributing particles along curve...');
        for (let i = 0; i < particleCount; i++) {
            // 计算粒子在曲线上的位置参数（0 到 1）
            const t = i / (particleCount - 1);

            // 获取曲线上该位置的坐标
            const point = curve.getPoint(t);

            // 设置粒子位置
            positions[i * 3] = point.x;
            positions[i * 3 + 1] = point.y;
            positions[i * 3 + 2] = point.z;

            // 设置粒子大小
            sizes[i] = config.particleSize;

            // 初始透明度设为 0（通过 update 方法控制显示）
            alphas[i] = 0;

            // 输出前 3 个粒子的位置用于调试
            if (i < 3) {
                console.log(
                    `  Particle ${i} (t=${t.toFixed(3)}): (${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`
                );
            }
        }

        console.log('[MigrationLine] Particles distributed:', {
            firstPosition: [
                positions[0].toFixed(2),
                positions[1].toFixed(2),
                positions[2].toFixed(2)
            ],
            lastPosition: [
                positions[(particleCount - 1) * 3].toFixed(2),
                positions[(particleCount - 1) * 3 + 1].toFixed(2),
                positions[(particleCount - 1) * 3 + 2].toFixed(2)
            ]
        });

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

        // 创建粒子材质
        // 粒子动画结合两种方式：
        // 1. 通过修改 alpha 属性实现拖尾效果（光波移动）
        // 2. 通过 uTime uniform 实现粒子大小的脉动效果（呼吸动画）
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: new THREE.Color(config.color) },
                uTime: { value: 0 } // 用于基于时间的动画效果
            },
            vertexShader: `
                uniform float uTime;
                attribute float size;
                attribute float alpha;
                varying float vAlpha;

                void main() {
                    vAlpha = alpha;  // 使用 alpha 属性控制透明度
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

                    // 添加基于时间的大小脉动效果（呼吸动画）
                    // sin 函数产生 -1 到 1 的值，转换为 0 到 1 的范围
                    float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
                    // 粒子大小在基础大小的 80% 到 120% 之间变化
                    float sizeMultiplier = 0.8 + pulse * 0.4;

                    gl_PointSize = size * 10.0 * sizeMultiplier;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uTime;
                varying float vAlpha;

                void main() {
                    // 创建圆形粒子
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    if (dist > 0.5) discard;

                    // 添加基于时间的颜色高亮效果
                    // 粒子在原色和更亮的颜色之间渐变
                    float brightness = sin(uTime * 3.0) * 0.2 + 1.0; // 1.0 到 1.2 之间
                    vec3 color = uColor * brightness;

                    // 从中心到边缘渐变，并应用 alpha 控制
                    float alpha = (1.0 - dist * 2.0) * vAlpha;
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true
        });

        const points = new THREE.Points(geometry, material);
        points.userData.particleCount = particleCount;
        points.userData.trailLength = config.trailLength;

        console.log('[MigrationLine] Particle line created:', {
            particleCount: points.userData.particleCount,
            trailLength: points.userData.trailLength,
            visible: points.visible,
            materialType: material.type
        });

        return points;
    }

    /**
     * 更新动画
     * @param {number} delta - 时间增量
     */
    onUpdate(delta) {
        const currentTime = Date.now();

        this.migrationLines.forEach((lineObject, id) => {
            const state = this.animationStates.get(id);
            const config = lineObject.userData.config;
            const type = lineObject.userData.type;

            if (!state || !state.isPlaying) return;

            // 处理延迟
            if (!state.hasStarted) {
                if (currentTime >= state.startTime) {
                    state.hasStarted = true;
                    this.emit('start', {
                        lineId: id,
                        userData: lineObject.userData.customData
                    });
                } else {
                    return;
                }
            }

            // 计算进度
            const elapsed = currentTime - state.startTime;
            let progress = elapsed / config.duration;

            // 处理循环
            if (progress >= 1) {
                if (config.loop) {
                    state.startTime = currentTime;
                    progress = 0;
                    this.emit('loop', {
                        lineId: id,
                        userData: lineObject.userData.customData
                    });
                } else {
                    progress = 1;
                    state.isPlaying = false;
                    this.emit('complete', {
                        lineId: id,
                        userData: lineObject.userData.customData
                    });
                }
            }

            state.progress = progress;

            // 根据类型更新动画
            switch (type) {
                case 'shader':
                    this.updateShaderLine(lineObject, progress, delta);
                    break;
                case 'particle':
                    this.updateParticleLine(lineObject, progress, delta);
                    break;
            }

            // 触发更新事件
            this.emit('update', {
                lineId: id,
                progress: progress,
                userData: lineObject.userData.customData
            });
        });
    }

    /**
     * 更新 Shader 线条动画
     */
    updateShaderLine(lineObject, progress, delta) {
        const material = lineObject.material;
        material.uniforms.uTime.value += delta;
        material.uniforms.uProgress.value = progress;
    }

    /**
     * 初始化粒子位置（固定位置，只设置一次）
     */
    initializeParticles(lineObject) {
        const geometry = lineObject.geometry;
        const positions = geometry.attributes.position.array;
        const alphas = geometry.attributes.alpha.array;
        const curve = lineObject.userData.curve;
        const particleCount = lineObject.userData.particleCount;

        console.log('[MigrationLine] Initializing particles (fixed positions):', {
            particleCount,
            curveLength: curve.getLength(),
            curvePoints: curve.points.length
        });

        // 将粒子均匀分布在整条曲线上（固定位置）
        for (let i = 0; i < particleCount; i++) {
            // 计算粒子在曲线上的位置（0 到 1）
            const t = i / (particleCount - 1);

            // 获取粒子在曲线上的固定位置
            const point = curve.getPoint(t);

            positions[i * 3] = point.x;
            positions[i * 3 + 1] = point.y;
            positions[i * 3 + 2] = point.z;

            // 调试：输出前 3 个粒子的位置
            if (i < 3) {
                console.log(`  Particle ${i} (t=${t.toFixed(3)}):`, {
                    x: point.x.toFixed(2),
                    y: point.y.toFixed(2),
                    z: point.z.toFixed(2)
                });
            }

            // 初始透明度设为 0（通过 update 方法控制显示）
            alphas[i] = 0;
        }

        // 标记 position 需要更新（仅此一次）
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.alpha.needsUpdate = true;

        console.log('[MigrationLine] Particles initialized:', {
            firstPosition: [positions[0], positions[1], positions[2]],
            lastPosition: [
                positions[(particleCount - 1) * 3],
                positions[(particleCount - 1) * 3 + 1],
                positions[(particleCount - 1) * 3 + 2]
            ],
            totalParticles: particleCount
        });
    }

    /**
     * 更新粒子线条动画
     * 实现原理：
     * - 粒子位置固定在曲线上（0 到 1 均匀分布）
     * - 通过透明度控制显示：只显示进度点附近的粒子（拖尾效果）
     * - 通过 uTime 控制粒子大小和亮度的脉动效果（呼吸动画）
     */
    updateParticleLine(lineObject, progress, delta) {
        const geometry = lineObject.geometry;
        const material = lineObject.material;
        const alphas = geometry.attributes.alpha.array;
        const particleCount = lineObject.userData.particleCount;
        const trailLength = lineObject.userData.trailLength;

        // 更新基于时间的动画效果
        material.uniforms.uTime.value += delta;

        // 首次调用时输出详细信息
        if (!this._particleUpdateInitialized) {
            this._particleUpdateInitialized = true;
            console.log('[MigrationLine] First particle update:', {
                particleCount,
                alphasArrayLength: alphas.length,
                trailLength,
                geometryParticleCount: geometry.attributes.position.count,
                match: particleCount === alphas.length
            });
        }

        let visibleCount = 0;
        let maxAlpha = 0;
        let minVisibleIndex = -1;
        let maxVisibleIndex = -1;

        // 遍历所有粒子，根据当前进度计算透明度
        for (let i = 0; i < particleCount; i++) {
            // 计算粒子在曲线上的位置（0 到 1）
            const particleT = i / (particleCount - 1);

            // 计算粒子与当前进度的距离（负值表示在进度点之前）
            let distance = progress - particleT;

            // 处理循环：如果启用循环，考虑环形距离
            const config = lineObject.userData.config;
            if (config.loop && distance < -0.5) {
                distance += 1; // 循环到下一轮
            }

            // 计算透明度：
            // - 如果粒子在进度点之后的 trailLength 范围内（拖尾），显示并渐变
            // - 否则完全透明
            if (distance >= 0 && distance <= trailLength) {
                // 在拖尾范围内，从 1（进度点）到 0（拖尾末端）渐变
                const fadeRatio = 1 - distance / trailLength;
                alphas[i] = fadeRatio;
                visibleCount++;
                maxAlpha = Math.max(maxAlpha, fadeRatio);

                if (minVisibleIndex === -1) minVisibleIndex = i;
                maxVisibleIndex = i;
            } else {
                // 不在拖尾范围内，完全透明
                alphas[i] = 0;
            }
        }

        // 调试：每 60 帧输出一次状态（约 1 秒）
        if (!this._particleDebugCounter) this._particleDebugCounter = 0;
        this._particleDebugCounter++;
        if (this._particleDebugCounter % 60 === 0) {
            console.log('[MigrationLine] Particle update:', {
                progress: progress.toFixed(3),
                particleCount,
                visibleCount,
                visibleRange:
                    minVisibleIndex >= 0 ? `[${minVisibleIndex}, ${maxVisibleIndex}]` : 'none',
                maxAlpha: maxAlpha.toFixed(3),
                trailLength,
                uTime: material.uniforms.uTime.value.toFixed(2),
                visible: lineObject.visible
            });
        }

        // 更新 GPU 缓冲区
        geometry.attributes.alpha.needsUpdate = true;
    }

    /**
     * 添加迁移线
     * @param {Object} lineData - 迁移线数据
     */
    async addLine(lineData) {
        await this.createLine(lineData);
    }

    /**
     * 移除迁移线
     * @param {string} id - 迁移线 ID
     */
    removeLine(id) {
        const lineObject = this.migrationLines.get(id);

        if (!lineObject) {
            console.warn(`MigrationLine: Line with id "${id}" not found`);
            return;
        }

        // 清理资源
        if (lineObject.geometry) {
            lineObject.geometry.dispose();
        }
        if (lineObject.material) {
            lineObject.material.dispose();
        }

        // 清理 Line2 的 resize 监听
        if (lineObject.userData.onResize) {
            window.removeEventListener('resize', lineObject.userData.onResize);
        }

        // 从场景移除
        this.remove(lineObject);

        // 从映射表移除
        this.migrationLines.delete(id);
        this.lineDataMap.delete(id);
        this.animationStates.delete(id);
    }

    /**
     * 开始播放指定迁移线动画
     * @param {string} id - 迁移线 ID
     */
    startLine(id) {
        const state = this.animationStates.get(id);
        if (!state) {
            console.warn(`MigrationLine: Line with id "${id}" not found`);
            return;
        }

        if (!state.isPlaying) {
            state.isPlaying = true;
            state.isPaused = false;
            state.startTime =
                Date.now() - (state.progress * this.lineDataMap.get(id).duration || 0);
        }
    }

    /**
     * 暂停指定迁移线动画
     * @param {string} id - 迁移线 ID
     */
    pauseLine(id) {
        const state = this.animationStates.get(id);
        if (!state) {
            console.warn(`MigrationLine: Line with id "${id}" not found`);
            return;
        }

        if (state.isPlaying) {
            state.isPlaying = false;
            state.isPaused = true;
        }
    }

    /**
     * 停止指定迁移线动画
     * @param {string} id - 迁移线 ID
     */
    stopLine(id) {
        const state = this.animationStates.get(id);
        if (!state) {
            console.warn(`MigrationLine: Line with id "${id}" not found`);
            return;
        }

        state.isPlaying = false;
        state.isPaused = false;
        state.progress = 0;
        state.startTime = Date.now();
        state.hasStarted = false;
    }

    /**
     * 更新迁移线配置
     * @param {string} id - 迁移线 ID
     * @param {Object} updates - 更新数据
     */
    async updateLine(id, updates) {
        const lineObject = this.migrationLines.get(id);
        const lineData = this.lineDataMap.get(id);

        if (!lineObject || !lineData) {
            console.warn(`MigrationLine: Line with id "${id}" not found`);
            return;
        }

        // 更新数据
        Object.assign(lineData, updates);

        // 如果更新了关键属性，需要重新创建
        if (updates.points || updates.type) {
            // 保存当前状态
            const currentState = this.animationStates.get(id);

            // 移除旧的
            this.removeLine(id);

            // 创建新的
            await this.createLine(lineData);

            // 恢复状态
            if (currentState) {
                this.animationStates.set(id, currentState);
            }
        } else {
            // 只更新配置
            Object.assign(lineObject.userData.config, updates);

            // 更新材质颜色
            if (updates.color) {
                const color = new THREE.Color(updates.color);
                if (lineObject.material.uniforms) {
                    lineObject.material.uniforms.uColor.value = color;
                } else if (lineObject.material.color) {
                    lineObject.material.color = color;
                }
            }
        }
    }

    /**
     * 开始所有迁移线动画
     */
    startAll() {
        this.animationStates.forEach((state, id) => {
            this.startLine(id);
        });
    }

    /**
     * 停止所有迁移线动画
     */
    stopAll() {
        this.animationStates.forEach((state, id) => {
            this.stopLine(id);
        });
    }

    /**
     * 暂停所有迁移线动画
     */
    pauseAll() {
        this.animationStates.forEach((state, id) => {
            this.pauseLine(id);
        });
    }

    /**
     * 获取迁移线数据
     * @param {string} id - 迁移线 ID
     * @returns {Object}
     */
    getLine(id) {
        return this.lineDataMap.get(id);
    }

    /**
     * 获取所有迁移线数据
     * @returns {Array}
     */
    getAllLines() {
        return Array.from(this.lineDataMap.values());
    }

    /**
     * 获取迁移线状态
     * @param {string} id - 迁移线 ID
     * @returns {Object}
     */
    getLineState(id) {
        return this.animationStates.get(id);
    }

    /**
     * 清除所有迁移线
     */
    clearLines() {
        const ids = Array.from(this.migrationLines.keys());
        ids.forEach((id) => this.removeLine(id));
    }

    /**
     * 组件销毁
     */
    onDispose() {
        // 清除所有迁移线
        this.clearLines();
    }
}

export default MigrationLine;
