import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * Pipeline 管道效果组件
 *
 * @class Pipeline
 * @extends Component
 * @description 根据路径点生成 3D 管道，支持进度控制和流光效果
 */
export class Pipeline extends Component {
    static defaultConfig = {
        pipelines: [], // 管道数据数组
        globalConfig: {
            // 全局默认配置
            radius: 0.5, // 管道半径
            color: '#00ff00', // 管道颜色
            opacity: 0.8, // 透明度
            segments: 64, // 管道分段数（影响平滑度）
            radialSegments: 8, // 径向分段数
            materialType: 'standard', // 材质类型: 'basic', 'standard', 'phong'
            progress: 100, // 显示进度 (0-100)
            flow: {
                enabled: false, // 是否启用流光效果
                speed: 1.0, // 流光速度
                color: '#ffffff', // 流光颜色
                width: 0.2, // 流光宽度 (0-1)
                intensity: 1.5 // 流光强度
            }
        }
    };

    constructor(scene, config = {}) {
        super(scene, config);

        // 管道对象映射表 (id -> pipelineObject)
        this.pipelines = new Map();

        // 管道数据映射表 (id -> pipelineData)
        this.pipelineDataMap = new Map();

        // 流光动画时间
        this.flowTime = 0;
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

        // 创建所有管道
        if (this.config.pipelines && this.config.pipelines.length > 0) {
            for (const pipelineData of this.config.pipelines) {
                await this.addPipeline(pipelineData);
            }
        }
    }

    // ==================== 管道创建相关方法 ====================

    /**
     * 创建管道
     * @param {Object} pipelineData - 管道数据
     * @returns {THREE.Mesh|null}
     */
    createPipeline(pipelineData) {
        const {
            id,
            points,
            radius,
            color,
            opacity,
            segments,
            radialSegments,
            materialType,
            progress,
            flow
        } = pipelineData;

        // 验证必需参数
        if (!id || !points || points.length < 2) {
            console.warn('Pipeline: id and at least 2 points are required');
            return null;
        }

        // 创建路径曲线
        const pathPoints = points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
        const curve = new THREE.CatmullRomCurve3(pathPoints);

        // 创建管道几何体
        const geometry = new THREE.TubeGeometry(
            curve,
            segments || this.globalConfig.segments,
            radius || this.globalConfig.radius,
            radialSegments || this.globalConfig.radialSegments,
            false // 不闭合
        );

        // 创建材质
        const material = this.createMaterial(pipelineData);

        // 创建网格
        const mesh = new THREE.Mesh(geometry, material);

        // 设置 userData
        mesh.userData = {
            pipelineId: id,
            isPipeline: true,
            curve,
            progress: progress !== undefined ? progress : this.globalConfig.progress,
            flow: flow || this.globalConfig.flow
        };

        // 应用进度
        this.applyProgress(mesh, mesh.userData.progress);

        return mesh;
    }

    /**
     * 创建材质
     * @param {Object} pipelineData - 管道数据
     * @returns {THREE.Material}
     */
    createMaterial(pipelineData) {
        const { color, opacity, materialType, flow } = pipelineData;

        const finalColor = color || this.globalConfig.color;
        const finalOpacity = opacity !== undefined ? opacity : this.globalConfig.opacity;
        const finalMaterialType = materialType || this.globalConfig.materialType;
        const finalFlow = flow || this.globalConfig.flow;

        // 如果启用流光效果，使用 ShaderMaterial
        if (finalFlow.enabled) {
            return this.createFlowMaterial(finalColor, finalOpacity, finalFlow);
        }

        // 否则使用标准材质
        const materialConfig = {
            color: new THREE.Color(finalColor),
            transparent: finalOpacity < 1,
            opacity: finalOpacity,
            side: THREE.DoubleSide
        };

        switch (finalMaterialType) {
            case 'basic':
                return new THREE.MeshBasicMaterial(materialConfig);
            case 'phong':
                return new THREE.MeshPhongMaterial(materialConfig);
            case 'standard':
            default:
                return new THREE.MeshStandardMaterial({
                    ...materialConfig,
                    metalness: 0.3,
                    roughness: 0.7
                });
        }
    }

    /**
     * 创建流光材质
     * @param {string} color - 基础颜色
     * @param {number} opacity - 透明度
     * @param {Object} flowConfig - 流光配置
     * @returns {THREE.ShaderMaterial}
     */
    createFlowMaterial(color, opacity, flowConfig) {
        const { speed, color: flowColor, width, intensity } = flowConfig;

        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                baseColor: { value: new THREE.Color(color) },
                flowColor: { value: new THREE.Color(flowColor || '#ffffff') },
                opacity: { value: opacity },
                flowSpeed: { value: speed || 1.0 },
                flowWidth: { value: width || 0.2 },
                flowIntensity: { value: intensity || 1.5 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 baseColor;
                uniform vec3 flowColor;
                uniform float opacity;
                uniform float flowSpeed;
                uniform float flowWidth;
                uniform float flowIntensity;

                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    // 基础颜色
                    vec3 color = baseColor;

                    // 计算流光位置（沿 U 方向移动）
                    float flowPos = mod(vUv.x + time * flowSpeed * 0.1, 1.0);

                    // 计算流光强度（使用平滑的脉冲函数）
                    float flowMask = smoothstep(0.0, flowWidth * 0.5, flowPos) *
                                     smoothstep(flowWidth, flowWidth * 0.5, flowPos);

                    // 混合流光颜色
                    color = mix(color, flowColor, flowMask * flowIntensity);

                    // 添加边缘光效
                    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
                    color += flowColor * fresnel * 0.3;

                    gl_FragColor = vec4(color, opacity);
                }
            `,
            transparent: opacity < 1,
            side: THREE.DoubleSide,
            depthWrite: false
        });
    }

    /**
     * 应用进度
     * @param {THREE.Mesh} mesh - 管道网格
     * @param {number} progress - 进度 (0-100)
     */
    applyProgress(mesh, progress) {
        const geometry = mesh.geometry;
        const totalVertices = geometry.attributes.position.count;

        // 计算要显示的顶点数量
        const visibleVertices = Math.floor((totalVertices * progress) / 100);

        // 设置绘制范围
        geometry.setDrawRange(0, visibleVertices);
    }

    // ==================== 管道管理相关方法 ====================

    /**
     * 添加管道
     * @param {Object} pipelineData - 管道数据
     */
    async addPipeline(pipelineData) {
        const { id } = pipelineData;

        if (!id) {
            console.warn('Pipeline: id is required');
            return;
        }

        // 检查是否已存在
        if (this.pipelines.has(id)) {
            console.warn(`Pipeline: Pipeline with id "${id}" already exists`);
            return;
        }

        // 合并配置
        const finalData = {
            ...this.globalConfig,
            ...pipelineData,
            id
        };

        // 创建管道对象
        const pipelineObject = this.createPipeline(finalData);

        if (!pipelineObject) {
            return;
        }

        // 添加到场景
        this.add(pipelineObject);

        // 保存到映射表
        this.pipelines.set(id, pipelineObject);
        this.pipelineDataMap.set(id, finalData);

        // 触发事件
        this.emit('pipelineAdded', { pipelineId: id, pipelineData: finalData });
    }

    /**
     * 移除管道
     * @param {string} id - 管道 ID
     */
    removePipeline(id) {
        const pipelineObject = this.pipelines.get(id);

        if (!pipelineObject) {
            console.warn(`Pipeline: Pipeline "${id}" not found`);
            return;
        }

        // 从场景中移除
        this.remove(pipelineObject);

        // 释放资源
        if (pipelineObject.geometry) {
            pipelineObject.geometry.dispose();
        }
        if (pipelineObject.material) {
            pipelineObject.material.dispose();
        }

        // 从映射表中移除
        this.pipelines.delete(id);
        this.pipelineDataMap.delete(id);

        // 触发事件
        this.emit('pipelineRemoved', { pipelineId: id });
    }

    /**
     * 更新管道进度
     * @param {string} id - 管道 ID
     * @param {number} progress - 进度 (0-100)
     */
    updateProgress(id, progress) {
        const pipelineObject = this.pipelines.get(id);
        const pipelineData = this.pipelineDataMap.get(id);

        if (!pipelineObject || !pipelineData) {
            console.warn(`Pipeline: Pipeline "${id}" not found`);
            return;
        }

        // 限制进度范围
        const clampedProgress = Math.max(0, Math.min(100, progress));

        // 应用进度
        this.applyProgress(pipelineObject, clampedProgress);

        // 更新数据
        pipelineObject.userData.progress = clampedProgress;
        pipelineData.progress = clampedProgress;

        // 触发事件
        this.emit('progressUpdated', {
            pipelineId: id,
            progress: clampedProgress
        });
    }

    /**
     * 更新流光效果
     * @param {string} id - 管道 ID
     * @param {Object} flowConfig - 流光配置
     */
    updateFlow(id, flowConfig) {
        const pipelineObject = this.pipelines.get(id);
        const pipelineData = this.pipelineDataMap.get(id);

        if (!pipelineObject || !pipelineData) {
            console.warn(`Pipeline: Pipeline "${id}" not found`);
            return;
        }

        // 更新流光配置
        const newFlowConfig = {
            ...pipelineObject.userData.flow,
            ...flowConfig
        };

        pipelineObject.userData.flow = newFlowConfig;
        pipelineData.flow = newFlowConfig;

        // 如果材质是 ShaderMaterial，更新 uniforms
        if (pipelineObject.material.uniforms) {
            const { speed, color, width, intensity } = newFlowConfig;

            if (speed !== undefined) {
                pipelineObject.material.uniforms.flowSpeed.value = speed;
            }
            if (color !== undefined) {
                pipelineObject.material.uniforms.flowColor.value = new THREE.Color(color);
            }
            if (width !== undefined) {
                pipelineObject.material.uniforms.flowWidth.value = width;
            }
            if (intensity !== undefined) {
                pipelineObject.material.uniforms.flowIntensity.value = intensity;
            }
        }

        // 触发事件
        this.emit('flowUpdated', {
            pipelineId: id,
            flowConfig: newFlowConfig
        });
    }

    /**
     * 更新管道配置
     * @param {string} id - 管道 ID
     * @param {Object} updates - 更新内容
     */
    updatePipeline(id, updates) {
        const pipelineData = this.pipelineDataMap.get(id);

        if (!pipelineData) {
            console.warn(`Pipeline: Pipeline "${id}" not found`);
            return;
        }

        // 移除旧管道
        this.removePipeline(id);

        // 创建新管道
        const newData = {
            ...pipelineData,
            ...updates,
            id
        };

        this.addPipeline(newData);
    }

    /**
     * 获取管道数据
     * @param {string} id - 管道 ID
     * @returns {Object|null}
     */
    getPipeline(id) {
        return this.pipelineDataMap.get(id) || null;
    }

    /**
     * 获取所有管道数据
     * @returns {Array}
     */
    getAllPipelines() {
        return Array.from(this.pipelineDataMap.values());
    }

    /**
     * 清除所有管道
     */
    clearPipelines() {
        const ids = Array.from(this.pipelines.keys());
        ids.forEach((id) => this.removePipeline(id));

        this.emit('pipelinesCleared');
    }

    // ==================== 生命周期方法 ====================

    /**
     * 每帧更新
     * @param {number} delta - 时间增量（秒）
     */
    onUpdate(delta) {
        // 更新流光动画时间
        this.flowTime += delta;

        // 更新所有启用流光效果的管道
        this.pipelines.forEach((pipelineObject) => {
            if (pipelineObject.userData.flow?.enabled && pipelineObject.material.uniforms) {
                pipelineObject.material.uniforms.time.value = this.flowTime;
            }
        });
    }

    /**
     * 组件销毁
     */
    onDispose() {
        // 清除所有管道
        this.clearPipelines();
    }
}
