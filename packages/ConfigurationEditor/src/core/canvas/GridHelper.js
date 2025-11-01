/**
 * GridHelper 网格辅助线系统
 *
 * @description 绘制网格背景，支持网格吸附功能
 * @author W3D Team
 */

import * as THREE from 'three';

/**
 * 网格辅助线类
 *
 * @class GridHelper
 */
export class GridHelper {
    /**
     * 创建网格辅助线实例
     *
     * @param {CanvasManager} canvasManager - 画布管理器实例
     * @param {Object} options - 配置选项
     */
    constructor(canvasManager, options = {}) {
        this.canvasManager = canvasManager;
        this.scene = canvasManager.getScene();

        // 配置选项
        this.options = {
            size: options.size || 2000,           // 网格总大小
            divisions: options.divisions || 100,   // 网格分割数
            gridSize: options.gridSize || 20,      // 单个网格大小
            color: options.color || '#2a2a2a',     // 网格颜色
            colorStrong: options.colorStrong || '#3a3a3a', // 强网格线颜色
            strongInterval: options.strongInterval || 5,    // 强网格线间隔
            visible: options.visible !== false     // 是否可见
        };

        // 网格对象
        this.gridGroup = new THREE.Group();
        this.gridGroup.name = 'GridHelper';

        // 创建网格
        this.createGrid();

        // 添加到场景
        if (this.scene) {
            this.scene.scene.add(this.gridGroup);
        }
    }

    /**
     * 创建网格
     */
    createGrid() {
        // 清空现有网格
        this.gridGroup.clear();

        const { size, gridSize, color, colorStrong, strongInterval } = this.options;

        // 计算网格数量
        const divisions = Math.floor(size / gridSize);
        const halfSize = size / 2;

        // 创建材质
        const materialNormal = new THREE.LineBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.3
        });

        const materialStrong = new THREE.LineBasicMaterial({
            color: new THREE.Color(colorStrong),
            transparent: true,
            opacity: 0.5
        });

        const z = -1;
        // 绘制垂直线
        for (let i = 0; i <= divisions; i++) {
            const x = -halfSize + i * gridSize;
            const isStrong = i % strongInterval === 0;

            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                x, -halfSize, z,
                x, halfSize, z
            ]);
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

            const line = new THREE.Line(
                geometry,
                isStrong ? materialStrong : materialNormal
            );
            this.gridGroup.add(line);
        }

        // 绘制水平线
        for (let i = 0; i <= divisions; i++) {
            const y = -halfSize + i * gridSize;
            const isStrong = i % strongInterval === 0;

            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                -halfSize, y, z,
                halfSize, y, z
            ]);
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

            const line = new THREE.Line(
                geometry,
                isStrong ? materialStrong : materialNormal
            );
            this.gridGroup.add(line);
        }

        // 设置可见性
        this.gridGroup.visible = this.options.visible;
    }

    /**
     * 显示网格
     */
    show() {
        this.gridGroup.visible = true;
        this.options.visible = true;
    }

    /**
     * 隐藏网格
     */
    hide() {
        this.gridGroup.visible = false;
        this.options.visible = false;
    }

    /**
     * 切换网格显示
     */
    toggle() {
        if (this.gridGroup.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 设置网格大小
     *
     * @param {number} gridSize - 单个网格大小
     */
    setGridSize(gridSize) {
        this.options.gridSize = gridSize;
        this.options.divisions = Math.floor(this.options.size / gridSize);
        this.createGrid();
    }

    /**
     * 设置网格颜色
     *
     * @param {string} color - 网格颜色
     * @param {string} colorStrong - 强网格线颜色（可选）
     */
    setColor(color, colorStrong = null) {
        this.options.color = color;
        if (colorStrong) {
            this.options.colorStrong = colorStrong;
        }
        this.createGrid();
    }

    /**
     * 网格吸附功能
     *
     * @description 将坐标吸附到最近的网格点
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {boolean} enabled - 是否启用吸附（默认 true）
     * @returns {Object} 吸附后的坐标 { x, y }
     */
    snapToGrid(x, y, enabled = true) {
        if (!enabled) {
            return { x, y };
        }

        const { gridSize } = this.options;

        // 计算最近的网格点
        const snappedX = Math.round(x / gridSize) * gridSize;
        const snappedY = Math.round(y / gridSize) * gridSize;

        return {
            x: snappedX,
            y: snappedY
        };
    }

    /**
     * 批量吸附坐标
     *
     * @param {Array<Object>} positions - 坐标数组 [{ x, y }, ...]
     * @param {boolean} enabled - 是否启用吸附
     * @returns {Array<Object>} 吸附后的坐标数组
     */
    snapPositions(positions, enabled = true) {
        return positions.map(pos => this.snapToGrid(pos.x, pos.y, enabled));
    }

    /**
     * 获取网格信息
     *
     * @returns {Object} 网格信息
     */
    getGridInfo() {
        return {
            size: this.options.size,
            gridSize: this.options.gridSize,
            divisions: this.options.divisions,
            visible: this.gridGroup.visible
        };
    }

    /**
     * 更新网格配置
     *
     * @param {Object} options - 新的配置选项
     */
    updateOptions(options) {
        Object.assign(this.options, options);
        this.createGrid();
    }

    /**
     * 销毁网格
     */
    dispose() {
        // 清空网格组
        this.gridGroup.clear();

        // 从场景中移除
        if (this.scene && this.scene.scene) {
            this.scene.scene.remove(this.gridGroup);
        }

        console.log('GridHelper: disposed');
    }
}

