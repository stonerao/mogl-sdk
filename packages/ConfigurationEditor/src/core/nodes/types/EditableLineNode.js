import { BaseNode } from '../BaseNode.js';
import * as THREE from 'three';

/**
 * EditableLineNode - 可编辑的线条节点
 *
 * @class EditableLineNode
 * @extends BaseNode
 * @description 支持多段折线绘制和编辑的线条组件，包含可视化编辑手柄
 *
 * @example
 * const lineNode = new EditableLineNode(scene, {
 *   name: '连接线',
 *   properties: {
 *     points: [
 *       { x: 0, y: 0, z: 0 },
 *       { x: 100, y: 50, z: 0 },
 *       { x: 200, y: 100, z: 0 }
 *     ],
 *     color: '#409EFF',
 *     lineWidth: 2,
 *     lineStyle: 'solid'
 *   }
 * });
 */
export class EditableLineNode extends BaseNode {
    /**
     * 节点类型
     */
    static nodeType = 'editable-line';

    /**
     * 默认属性
     */
    static defaultProperties = {
        ...BaseNode.defaultProperties,

        // 线条控制点
        points: [
            { x: 0, y: 0, z: 0 },
            { x: 100, y: 0, z: 0 }
        ],

        // 线条样式
        color: '#409EFF',
        lineWidth: 2,
        lineStyle: 'solid', // 'solid' | 'dashed'
        dashSize: 5,
        gapSize: 3,

        // 编辑手柄样式
        handleSize: 10,
        handleColor: '#ffffff',
        handleBorderColor: '#409EFF',
        handleSelectedColor: '#FFD700',

        // 编辑模式
        editMode: false
    };

    /**
     * 创建线条节点
     */
    constructor(scene, config = {}) {
        super(scene, config);

        // 线条对象
        this.line = null;

        // 编辑手柄数组
        this.handles = [];

        // 当前选中的控制点索引
        this.selectedPointIndex = -1;

        // 拖动状态
        this.isDraggingHandle = false;
        this.dragStartPosition = null;
        this.dragPlane = null;
    }

    /**
     * 创建节点
     */
    onCreate() {
        super.onCreate();

        // 创建拖动平面（用于计算拖动位置）
        this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

        // 创建线条
        this.createLine();

        // 创建编辑手柄
        this.createHandles();

        // 应用初始属性
        this.applyProperties();
    }

    /**
     * 创建线条
     */
    createLine() {
        const points = this.properties.points || [];

        // 创建几何体
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(points.length * 3);

        points.forEach((point, index) => {
            positions[index * 3] = point.x;
            positions[index * 3 + 1] = point.y;
            positions[index * 3 + 2] = point.z || 0;
        });

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // 创建材质
        let material;
        if (this.properties.lineStyle === 'dashed') {
            material = new THREE.LineDashedMaterial({
                color: this.properties.color,
                linewidth: this.properties.lineWidth,
                dashSize: this.properties.dashSize,
                gapSize: this.properties.gapSize
            });
        } else {
            material = new THREE.LineBasicMaterial({
                color: this.properties.color,
                linewidth: this.properties.lineWidth
            });
        }

        // 创建线条
        this.line = new THREE.Line(geometry, material);

        // 如果是虚线，需要计算线段距离
        if (this.properties.lineStyle === 'dashed') {
            this.line.computeLineDistances();
        }

        this.add(this.line);
    }

    /**
     * 创建编辑手柄
     */
    createHandles() {
        const points = this.properties.points || [];
        if (!this.handles ) {
            this.handles  = [];
        }
        // 清除旧手柄
        this.handles.forEach(handle => {
            this.remove(handle);
            handle.geometry.dispose();
            handle.material.dispose();
        });
        this.handles = [];

        // 为每个控制点创建手柄
        points.forEach((point, index) => {
            const handle = this.createHandle(point, index);
            this.handles.push(handle);
            this.add(handle);
        });

        // 根据编辑模式显示/隐藏手柄
        this.updateHandlesVisibility();
    }

    /**
     * 创建单个编辑手柄
     */
    createHandle(point, index) {
        const size = this.properties.handleSize / 100; // 转换为世界坐标单位

        // 创建矩形几何体
        const geometry = new THREE.PlaneGeometry(size, size);

        // 创建材质（双面渲染）
        const material = new THREE.MeshBasicMaterial({
            color: this.properties.handleColor,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false
        });

        // 创建边框
        const borderGeometry = new THREE.EdgesGeometry(geometry);
        const borderMaterial = new THREE.LineBasicMaterial({
            color: this.properties.handleBorderColor,
            linewidth: 2,
            depthTest: false,
            depthWrite: false
        });
        const border = new THREE.LineSegments(borderGeometry, borderMaterial);

        // 创建手柄组
        const handleGroup = new THREE.Group();
        const handleMesh = new THREE.Mesh(geometry, material);
        handleGroup.add(handleMesh);
        handleGroup.add(border);

        // 设置位置
        handleGroup.position.set(point.x, point.y, point.z || 0);

        // 存储索引
        handleGroup.userData.pointIndex = index;
        handleGroup.userData.isHandle = true;
        handleGroup.userData.parentNode = this;

        // 设置渲染顺序（确保手柄在最上层）
        handleGroup.renderOrder = 1000;

        return handleGroup;
    }

    /**
     * 更新线条几何体
     */
    updateLineGeometry() {
        if (!this.line) return;

        const points = this.properties.points || [];
        const positions = new Float32Array(points.length * 3);

        points.forEach((point, index) => {
            positions[index * 3] = point.x;
            positions[index * 3 + 1] = point.y;
            positions[index * 3 + 2] = point.z || 0;
        });

        this.line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.line.geometry.attributes.position.needsUpdate = true;

        // 如果是虚线，重新计算距离
        if (this.properties.lineStyle === 'dashed') {
            this.line.computeLineDistances();
        }
    }

    /**
     * 更新手柄位置
     */
    updateHandlesPosition() {
        const points = this.properties.points || [];

        this.handles.forEach((handle, index) => {
            if (points[index]) {
                handle.position.set(
                    points[index].x,
                    points[index].y,
                    points[index].z || 0
                );
            }
        });
    }

    /**
     * 更新手柄可见性
     */
    updateHandlesVisibility() {
        const visible = this.properties.editMode;
        this.handles.forEach(handle => {
            handle.visible = visible;
        });
    }

    /**
     * 添加控制点
     */
    addPoint(position, index = -1) {
        const points = [...this.properties.points];

        if (index === -1 || index >= points.length) {
            // 添加到末尾
            points.push({ ...position });
        } else {
            // 插入到指定位置
            points.splice(index, 0, { ...position });
        }

        this.setProperty('points', points);
        this.recreateHandles();
        this.updateLineGeometry();

        return points.length - 1;
    }

    /**
     * 删除控制点
     */
    removePoint(index) {
        const points = [...this.properties.points];

        // 至少保留两个点
        if (points.length <= 2) {
            console.warn('线条至少需要两个控制点');
            return false;
        }

        if (index >= 0 && index < points.length) {
            points.splice(index, 1);
            this.setProperty('points', points);
            this.recreateHandles();
            this.updateLineGeometry();
            return true;
        }

        return false;
    }

    /**
     * 更新控制点位置
     */
    updatePoint(index, position) {
        const points = [...this.properties.points];

        if (index >= 0 && index < points.length) {
            points[index] = { ...points[index], ...position };
            this.setProperty('points', points);
            this.updateLineGeometry();
            this.updateHandlesPosition();
            return true;
        }

        return false;
    }

    /**
     * 重新创建手柄
     */
    recreateHandles() {
        this.createHandles();
    }

    /**
     * 设置编辑模式
     */
    setEditMode(enabled) {
        this.setProperty('editMode', enabled);
        this.updateHandlesVisibility();
    }

    /**
     * 选中控制点
     */
    selectPoint(index) {
        // 取消之前的选中
        if (this.selectedPointIndex >= 0 && this.handles[this.selectedPointIndex]) {
            const prevHandle = this.handles[this.selectedPointIndex];
            const borderMaterial = prevHandle.children[1].material;
            borderMaterial.color.set(this.properties.handleBorderColor);
        }

        // 选中新的控制点
        this.selectedPointIndex = index;

        if (index >= 0 && this.handles[index]) {
            const handle = this.handles[index];
            const borderMaterial = handle.children[1].material;
            borderMaterial.color.set(this.properties.handleSelectedColor);
        }
    }

    /**
     * 应用属性
     */
    applyProperties() {
        super.applyProperties();

        // 更新线条颜色
        if (this.line && this.line.material) {
            this.line.material.color.set(this.properties.color);
        }

        // 更新线条样式
        if (this.line && this.properties.lineStyle === 'dashed') {
            if (!(this.line.material instanceof THREE.LineDashedMaterial)) {
                // 切换到虚线材质
                const oldMaterial = this.line.material;
                this.line.material = new THREE.LineDashedMaterial({
                    color: this.properties.color,
                    linewidth: this.properties.lineWidth,
                    dashSize: this.properties.dashSize,
                    gapSize: this.properties.gapSize
                });
                oldMaterial.dispose();
                this.line.computeLineDistances();
            }
        } else if (this.line && this.properties.lineStyle === 'solid') {
            if (this.line.material instanceof THREE.LineDashedMaterial) {
                // 切换到实线材质
                const oldMaterial = this.line.material;
                this.line.material = new THREE.LineBasicMaterial({
                    color: this.properties.color,
                    linewidth: this.properties.lineWidth
                });
                oldMaterial.dispose();
            }
        }
    }

    /**
     * 序列化
     */
    serialize() {
        const data = super.serialize();

        // 添加线条特有数据
        data.points = this.properties.points;

        return data;
    }

    /**
     * 反序列化
     */
    deserialize(data) {
        super.deserialize(data);

        // 恢复线条
        if (data.points) {
            this.setProperty('points', data.points);
            this.recreateHandles();
            this.updateLineGeometry();
        }
    }

    /**
     * 销毁节点
     */
    onDispose() {
        // 清理手柄
        this.handles.forEach(handle => {
            handle.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });
        this.handles = [];

        // 清理线条
        if (this.line) {
            if (this.line.geometry) this.line.geometry.dispose();
            if (this.line.material) this.line.material.dispose();
        }

        super.onDispose();
    }
}

