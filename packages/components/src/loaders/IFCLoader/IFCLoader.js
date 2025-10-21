import { Component } from '@w3d/core';
import * as THREE from 'three';
import { IFCLoader as ThreeIFCLoader } from 'web-ifc-three';
import { IFCSPACE } from 'web-ifc';

/**
 * IFCLoader IFC 文件加载器组件（基于 web-ifc-three）
 *
 * 加载并渲染 IFC (BIM) 模型，支持基础交互与属性查询。
 */
export class IFCLoader extends Component {
    static defaultConfig = {
        url: '',
        // 变换
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1,
        // IFC 配置
        wasmPath: 'https://cdn.jsdelivr.net/npm/web-ifc@0.0.72/',
        useFastBools: true,
        excludeSpaces: true,
        centerModel: true,
        // 交互
        enableInteraction: true
    };

    async onMounted() {
        this.interactiveObjects = [];
        this.ifcLoader = new ThreeIFCLoader();
        await this.setupIFCManager();
        if (this.config.url) {
            await this.loadIFC();
        } else {
            // eslint-disable-next-line no-console
            console.warn('IFCLoader: url is required');
        }
    }

    async setupIFCManager() {
        const mgr = this.ifcLoader.ifcManager;
        // WASM 路径
        await mgr.setWasmPath(this.config.wasmPath, true);
        // 可选分类（排除空间）
        await mgr.parser.setupOptionalCategories({
            [IFCSPACE]: !this.config.excludeSpaces ? true : false
        });
        // 性能配置
        await mgr.applyWebIfcConfig({ USE_FAST_BOOLS: !!this.config.useFastBools });
    }

    async loadIFC() {
        try {
            this.emit('loadStart', { url: this.config.url });

            this.ifcModel = await new Promise((resolve, reject) => {
                this.ifcLoader.load(
                    this.config.url,
                    (model) => resolve(model),
                    (evt) => {
                        let progress = 0;
                        if (evt && evt.total) progress = evt.loaded / evt.total;
                        this.emit('loadProgress', { progress });
                    },
                    (error) => reject(error)
                );
            });

            this.model = this.ifcModel.mesh;
            // 可选：模型居中到原点
            if (this.config.centerModel && this.model) {
                const box = new THREE.Box3().setFromObject(this.model);
                const center = box.getCenter(new THREE.Vector3());
                this.model.position.sub(center);
            }

            // 应用变换
            this.applyTransform();

            // 添加到场景
            if (this.model) this.add(this.model);

            // 交互对象
            if (this.config.enableInteraction && this.model) {
                this.interactiveObjects = [this.model];
                this.model.userData.eventEmitter = this.eventEmitter;
            }

            // 计算信息并发出完成事件
            const info = this.getModelInfo();
            this.emit('loadComplete', {
                model: this.model,
                ifcModel: this.ifcModel,
                bbox: info?.bbox,
                center: info?.center,
                size: info?.size
            });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('IFCLoader: Failed to load IFC', error);
            this.emit('error', { error, url: this.config.url });
        }
    }

    applyTransform() {
        if (!this.model) return;
        // 缩放
        const s = this.config.scale;
        if (Array.isArray(s)) this.model.scale.set(s[0], s[1], s[2]);
        else this.model.scale.set(s, s, s);
        // 位置
        const [px, py, pz] = this.config.position;
        this.model.position.add(new THREE.Vector3(px, py, pz));
        // 旋转（弧度）
        const [rx, ry, rz] = this.config.rotation;
        this.model.rotation.set(rx, ry, rz);
    }

    getModelInfo() {
        if (!this.model) return null;
        this.model.updateMatrixWorld();
        const bbox = new THREE.Box3().setFromObject(this.model);
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());
        // 统计网格数量
        let meshCount = 0;
        this.model.traverse((c) => c.isMesh && meshCount++);
        return {
            modelID: this.ifcModel?.modelID,
            bbox,
            center,
            size,
            meshCount
        };
    }

    async getProperties(expressID) {
        try {
            if (!this.ifcModel) return null;
            return await this.ifcLoader.ifcManager.getItemProperties(
                this.ifcModel.modelID,
                expressID,
                true
            );
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('IFCLoader: getProperties failed', e);
            return null;
        }
    }

    getInteractiveObjects() {
        return this.interactiveObjects || [];
    }

    onDispose() {
        try {
            if (this.ifcLoader?.ifcManager) this.ifcLoader.ifcManager.dispose();
        } catch (e) {
            /* noop */
        }
        if (this.model) {
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.geometry?.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
                        else child.material.dispose();
                    }
                }
            });
        }
        this.interactiveObjects = [];
        this.ifcModel = null;
        this.ifcLoader = null;
    }
}

export default IFCLoader;
