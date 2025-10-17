import { Component } from '@w3d/core';
import * as THREE from 'three';
import { ModelLoader as CoreModelLoader } from '@w3d/core';

export class InstancedModel extends Component {
    static defaultConfig = {
        modelUrl: '/models/kache.glb',
        instanceCount: 1000,
        positions: [],
        rotations: [],
        scales: [],
        instancesData: null, // 实例数据数组，格式：[{ position, rotation, scale }, ...]
        normalColor: 0x00ff00,
        hoverColor: 0xffff00,
        clickedColor: 0xff0000,
        layout: 'grid',
        gridSize: { x: 100, z: 100 },
        spacing: { x: 10, z: 10 },
        enableInteraction: true
    };

    constructor(scene, config = {}) {
        super(scene, config);

        this.coreLoader = new CoreModelLoader();
        this.loadedModel = null;
        this.instancedMeshes = [];
        this.instanceStates = [];
        this.hoveredInstanceIndex = -1;
        this.clickedInstances = new Set();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.onMouseMoveBound = this.onMouseMove.bind(this);
        this.onClickBound = this.onClick.bind(this);
        this.isLoading = false;
        this.isLoaded = false;
        this.dummy = new THREE.Object3D();
        this._color = new THREE.Color();
    }

    async onMounted() {
        await this.loadModel();
        if (this.config.enableInteraction) {
            this.setupMouseEvents();
        }
        this.emit('loadComplete', {
            instanceCount: this.config.instanceCount,
            modelUrl: this.config.modelUrl
        });
    }

    async loadModel() {
        if (!this.config.modelUrl) {
            return;
        }

        this.isLoading = true;
        this.emit('loadStart', { url: this.config.modelUrl });

        try {
            const modelData = await this.coreLoader.load(this.config.modelUrl, (progress) => {
                this.emit('loadProgress', { progress });
            });

            this.loadedModel = modelData.scene;
            await this.createInstances();
            this.isLoading = false;
            this.isLoaded = true;
        } catch (error) {
            this.isLoading = false;
            this.emit('loadError', { error, url: this.config.modelUrl });
        }
    }

    async createInstances() {
        if (!this.loadedModel) {
            return;
        }

        // 如果提供了 instancesData，使用它来设置实例数据
        if (this.config.instancesData && Array.isArray(this.config.instancesData)) {
            this.setInstancesData(this.config.instancesData);
        }

        this.instanceStates = new Array(this.config.instanceCount).fill('normal');
        this.generateInstancePositions();

        const count = this.config.instanceCount;
        const meshesToInstance = [];

        this.loadedModel.traverse((child) => {
            if (child.isMesh) {
                meshesToInstance.push({
                    geometry: child.geometry,
                    material: child.material
                });
            }
        });

        this.loadedModel.clear();

        meshesToInstance.forEach(({ geometry, material }) => {
            const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

            instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            instancedMesh.frustumCulled = false;

            this._color.setHex(this.config.normalColor);

            for (let i = 0; i < count; i++) {
                const pos = this.config.positions[i] || { x: 0, y: 0, z: 0 };
                const rot = this.config.rotations[i] || { x: 0, y: 0, z: 0 };
                const scl = this.config.scales[i] || { x: 1, y: 1, z: 1 };

                this.dummy.position.set(pos.x, pos.y, pos.z);
                this.dummy.rotation.set(rot.x, rot.y, rot.z);
                this.dummy.scale.set(scl.x, scl.y, scl.z);
                this.dummy.updateMatrix();

                instancedMesh.setMatrixAt(i, this.dummy.matrix);
                instancedMesh.setColorAt(i, this._color);
            }

            instancedMesh.instanceMatrix.needsUpdate = true;
            if (instancedMesh.instanceColor) {
                instancedMesh.instanceColor.needsUpdate = true;
            }

            this.instancedMeshes.push(instancedMesh);
            this.loadedModel.add(instancedMesh);
        });

        this.add(this.loadedModel);
    }

    generateInstancePositions() {
        const { layout, instanceCount, gridSize, spacing, positions } = this.config;

        // 如果是自定义布局且已经提供了位置数据，则不生成
        if (layout === 'custom' && positions.length > 0) {
            // 确保旋转和缩放数组也有默认值
            this.ensureTransformArrays();
            return;
        }

        // 重置变换数组
        this.config.positions = [];
        this.config.rotations = [];
        this.config.scales = [];

        if (layout === 'grid') {
            const cols = Math.ceil(Math.sqrt(instanceCount));
            const rows = Math.ceil(instanceCount / cols);

            for (let i = 0; i < instanceCount; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = (col - cols / 2) * spacing.x;
                const z = (row - rows / 2) * spacing.z;

                // 添加位置
                this.config.positions.push({ x, y: 0, z });

                // 添加默认旋转
                this.config.rotations.push({ x: 0, y: 0, z: 0 });

                // 添加默认缩放
                this.config.scales.push({ x: 1, y: 1, z: 1 });
            }
        } else if (layout === 'random') {
            for (let i = 0; i < instanceCount; i++) {
                const x = (Math.random() - 0.5) * gridSize.x;
                const z = (Math.random() - 0.5) * gridSize.z;

                // 添加位置
                this.config.positions.push({ x, y: 0, z });

                // 添加随机旋转（可选）
                this.config.rotations.push({
                    x: 0,
                    y: Math.random() * Math.PI * 2,
                    z: 0
                });

                // 添加随机缩放（可选，范围 0.8 - 1.2）
                const randomScale = 0.8 + Math.random() * 0.4;
                this.config.scales.push({
                    x: randomScale,
                    y: randomScale,
                    z: randomScale
                });
            }
        }
    }

    /**
     * 确保变换数组（位置、旋转、缩放）都有足够的元素
     * 如果某些数组长度不足，用默认值填充
     */
    ensureTransformArrays() {
        const { instanceCount } = this.config;

        // 确保位置数组
        while (this.config.positions.length < instanceCount) {
            this.config.positions.push({ x: 0, y: 0, z: 0 });
        }

        // 确保旋转数组
        while (this.config.rotations.length < instanceCount) {
            this.config.rotations.push({ x: 0, y: 0, z: 0 });
        }

        // 确保缩放数组
        while (this.config.scales.length < instanceCount) {
            this.config.scales.push({ x: 1, y: 1, z: 1 });
        }
    }

    /**
     * 从实例数据数组设置变换
     * @param {Array} instancesData - 实例数据数组，每个元素包含 { position, rotation, scale }
     * 示例：[
     *   { position: {x:0, y:0, z:0}, rotation: {x:0, y:0, z:0}, scale: {x:1, y:1, z:1} },
     *   { position: {x:10, y:0, z:0}, rotation: {x:0, y:Math.PI/4, z:0}, scale: {x:1.5, y:1.5, z:1.5} }
     * ]
     */
    setInstancesData(instancesData) {
        if (!Array.isArray(instancesData) || instancesData.length === 0) {
            return;
        }

        // 更新实例数量
        this.config.instanceCount = instancesData.length;

        // 重置数组
        this.config.positions = [];
        this.config.rotations = [];
        this.config.scales = [];

        // 从数据中提取位置、旋转、缩放
        instancesData.forEach((data) => {
            // 位置
            const pos = data.position || { x: 0, y: 0, z: 0 };
            this.config.positions.push({
                x: pos.x || 0,
                y: pos.y || 0,
                z: pos.z || 0
            });

            // 旋转
            const rot = data.rotation || { x: 0, y: 0, z: 0 };
            this.config.rotations.push({
                x: rot.x || 0,
                y: rot.y || 0,
                z: rot.z || 0
            });

            // 缩放（支持统一缩放或分量缩放）
            let scl;
            if (data.scale !== undefined) {
                if (typeof data.scale === 'number') {
                    // 统一缩放
                    scl = { x: data.scale, y: data.scale, z: data.scale };
                } else {
                    // 分量缩放
                    scl = {
                        x: data.scale.x || 1,
                        y: data.scale.y || 1,
                        z: data.scale.z || 1
                    };
                }
            } else {
                scl = { x: 1, y: 1, z: 1 };
            }
            this.config.scales.push(scl);
        });

        // 设置为自定义布局
        this.config.layout = 'custom';
    }

    updateAllInstances() {
        if (!this.instancedMeshes.length) return;

        this._color.setHex(this.config.normalColor);

        this.instancedMeshes.forEach((mesh) => {
            for (let i = 0; i < this.config.instanceCount; i++) {
                const pos = this.config.positions[i] || { x: 0, y: 0, z: 0 };
                const rot = this.config.rotations[i] || { x: 0, y: 0, z: 0 };
                const scl = this.config.scales[i] || { x: 1, y: 1, z: 1 };

                this.dummy.position.set(pos.x, pos.y, pos.z);
                this.dummy.rotation.set(rot.x, rot.y, rot.z);
                this.dummy.scale.set(scl.x, scl.y, scl.z);
                this.dummy.updateMatrix();

                mesh.setMatrixAt(i, this.dummy.matrix);
                mesh.setColorAt(i, this._color);
            }

            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) {
                mesh.instanceColor.needsUpdate = true;
            }
        });
    }

    updateInstanceTransform(index, position, rotation, scale) {
        if (!this.instancedMeshes.length || index < 0 || index >= this.config.instanceCount) {
            return;
        }

        this.dummy.position.set(position.x, position.y, position.z);
        this.dummy.rotation.set(rotation.x, rotation.y, rotation.z);
        this.dummy.scale.set(scale.x, scale.y, scale.z);
        this.dummy.updateMatrix();

        this.instancedMeshes.forEach((mesh) => {
            mesh.setMatrixAt(index, this.dummy.matrix);
            mesh.instanceMatrix.needsUpdate = true;
        });
    }

    updateInstanceColor(index, color) {
        if (!this.instancedMeshes.length || index < 0 || index >= this.config.instanceCount) {
            return;
        }

        this._color.setHex(color);
        this.instancedMeshes.forEach((mesh) => {
            mesh.setColorAt(index, this._color);
            if (mesh.instanceColor) {
                mesh.instanceColor.needsUpdate = true;
            }
        });
    }

    resetInstanceColor(index) {
        if (!this.instancedMeshes.length || index < 0 || index >= this.config.instanceCount) {
            return;
        }

        const color = this.clickedInstances.has(index)
            ? this.config.clickedColor
            : this.config.normalColor;

        this.updateInstanceColor(index, color);
        this.instanceStates[index] = this.clickedInstances.has(index) ? 'clicked' : 'normal';
    }

    resetAllColors() {
        if (!this.instancedMeshes.length) return;

        this.clickedInstances.clear();
        this.hoveredInstanceIndex = -1;
        this._color.setHex(this.config.normalColor);

        this.instancedMeshes.forEach((mesh) => {
            for (let i = 0; i < this.config.instanceCount; i++) {
                mesh.setColorAt(i, this._color);
                this.instanceStates[i] = 'normal';
            }
            if (mesh.instanceColor) {
                mesh.instanceColor.needsUpdate = true;
            }
        });

        this.emit('resetColors', { instanceCount: this.config.instanceCount });
    }

    setupMouseEvents() {
        const canvas = this.scene.renderer.instance.domElement;
        canvas.addEventListener('mousemove', this.onMouseMoveBound);
        canvas.addEventListener('click', this.onClickBound);
    }

    removeMouseEvents() {
        const canvas = this.scene.renderer.instance.domElement;
        canvas.removeEventListener('mousemove', this.onMouseMoveBound);
        canvas.removeEventListener('click', this.onClickBound);
    }

    onMouseMove(event) {
        if (!this.instancedMeshes.length || !this.config.enableInteraction) return;

        const canvas = this.scene.renderer.instance.domElement;
        const rect = canvas.getBoundingClientRect();

        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.scene.camera.instance);
        const intersects = this.raycaster.intersectObjects(this.instancedMeshes, false);

        if (intersects.length > 0) {
            const instanceId = intersects[0].instanceId;

            if (instanceId !== this.hoveredInstanceIndex) {
                if (this.hoveredInstanceIndex !== -1) {
                    this.resetInstanceColor(this.hoveredInstanceIndex);
                }

                this.hoveredInstanceIndex = instanceId;
                this.instanceStates[instanceId] = 'hovered';
                this.updateInstanceColor(instanceId, this.config.hoverColor);

                this.emit('instanceMouseEnter', {
                    index: instanceId,
                    position: this.config.positions[instanceId]
                });
            }
        } else {
            if (this.hoveredInstanceIndex !== -1) {
                this.resetInstanceColor(this.hoveredInstanceIndex);
                this.emit('instanceMouseLeave', { index: this.hoveredInstanceIndex });
                this.hoveredInstanceIndex = -1;
            }
        }
    }

    onClick(event) {
        if (!this.instancedMeshes.length || !this.config.enableInteraction) return;

        const canvas = this.scene.renderer.instance.domElement;
        const rect = canvas.getBoundingClientRect();

        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.scene.camera.instance);
        const intersects = this.raycaster.intersectObjects(this.instancedMeshes, false);

        if (intersects.length > 0) {
            const instanceId = intersects[0].instanceId;

            this.clickedInstances.add(instanceId);
            this.instanceStates[instanceId] = 'clicked';
            this.updateInstanceColor(instanceId, this.config.clickedColor);

            this.emit('instanceClick', {
                index: instanceId,
                position: this.config.positions[instanceId],
                clickedCount: this.clickedInstances.size
            });
        }
    }

    async updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };

        const needsRecreate =
            newConfig.instanceCount !== undefined ||
            newConfig.layout !== undefined ||
            newConfig.gridSize !== undefined ||
            newConfig.spacing !== undefined;

        if (needsRecreate) {
            this.disposeInstances();
            if (this.loadedModel) {
                this.componentScene.remove(this.loadedModel);
            }
            this.generateInstancePositions();
            await this.createInstances();
        } else if (newConfig.normalColor !== undefined) {
            this.resetAllColors();
        }
    }

    disposeInstances() {
        if (this.instancedMeshes.length > 0) {
            this.instancedMeshes.forEach((mesh) => {
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach((mat) => mat.dispose());
                    } else {
                        mesh.material.dispose();
                    }
                }
            });
            this.instancedMeshes = [];
        }
    }

    onDispose() {
        this.removeMouseEvents();
        this.disposeInstances();

        if (this.loadedModel) {
            this.remove(this.loadedModel);
            this.loadedModel = null;
        }

        this.instanceStates = [];
        this.clickedInstances.clear();
        this.hoveredInstanceIndex = -1;
    }
}
