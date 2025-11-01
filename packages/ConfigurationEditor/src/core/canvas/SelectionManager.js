/**
 * SelectionManager 节点选择管理器
 *
 * @description 管理节点的选择、多选、框选等功能
 * @author W3D Team
 */

import * as THREE from 'three';

/**
 * 节点选择管理器类
 *
 * @class SelectionManager
 */
export class SelectionManager {
    /**
     * 创建选择管理器实例
     *
     * @param {CanvasManager} canvasManager - 画布管理器实例
     * @param {Object} options - 配置选项
     */
    constructor(canvasManager, options = {}) {
        this.canvasManager = canvasManager;
        this.scene = canvasManager.getScene();
        this.camera = canvasManager.getCamera();
        this.renderer = canvasManager.getRenderer();

        if (!this.scene || !this.camera || !this.renderer) {
            throw new Error('SelectionManager: scene, camera, or renderer not available');
        }

        // 配置选项
        this.options = {
            multiSelect: options.multiSelect !== false,  // 是否支持多选
            boxSelect: options.boxSelect !== false,      // 是否支持框选
            highlightColor: options.highlightColor || 0x409eff, // 高亮颜色
            ...options
        };

        // 射线拾取器
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 选中的节点列表
        this.selectedNodes = [];

        // 高亮辅助对象（边界框）
        this.highlightHelpers = new Map();

        // 框选相关
        this.isBoxSelecting = false;
        this.boxSelectStart = null;
        this.boxSelectEnd = null;
        this.selectionBox = null;

        // 可选择的对象列表
        this.selectableObjects = [];
    }

    /**
     * 注册可选择的对象
     *
     * @param {THREE.Object3D} object - 可选择的对象
     */
    registerSelectable(object) {
        if (!this.selectableObjects.includes(object)) {
            this.selectableObjects.push(object);
        }
    }

    /**
     * 取消注册可选择的对象
     *
     * @param {THREE.Object3D} object - 对象
     */
    unregisterSelectable(object) {
        const index = this.selectableObjects.indexOf(object);
        if (index > -1) {
            this.selectableObjects.splice(index, 1);
        }
    }

    /**
     * 更新鼠标位置
     *
     * @param {MouseEvent} event - 鼠标事件
     */
    updateMousePosition(event) {
        const rect = this.renderer.instance.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    /**
     * 射线拾取
     *
     * @param {MouseEvent} event - 鼠标事件
     * @returns {Array} 相交的对象数组
     */
    raycast(event) {
        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 只检测可选择的对象
        const intersects = this.raycaster.intersectObjects(this.selectableObjects, true);
        return intersects;
    }

    /**
     * 点击选择
     *
     * @param {MouseEvent} event - 鼠标事件
     * @param {boolean} multiSelect - 是否多选（Ctrl/Cmd 键）
     * @returns {THREE.Object3D|null} 选中的对象
     */
    selectByClick(event, multiSelect = false) {
        const intersects = this.raycast(event);

        if (intersects.length > 0) {
            // 获取最近的对象
            let selectedObject = intersects[0].object;

            // 向上查找，找到可选择的根对象
            while (selectedObject.parent && !this.selectableObjects.includes(selectedObject)) {
                selectedObject = selectedObject.parent;
            }

            if (multiSelect && this.options.multiSelect) {
                // 多选模式
                this.toggleSelection(selectedObject);
            } else {
                // 单选模式
                this.clearSelection();
                this.addSelection(selectedObject);
            }

            return selectedObject;
        } else {
            // 点击空白处，清空选择
            if (!multiSelect) {
                this.clearSelection();
            }
            return null;
        }
    }

    /**
     * 添加选中
     *
     * @param {THREE.Object3D} object - 要选中的对象
     */
    addSelection(object) {
        if (!object || this.selectedNodes.includes(object)) {
            return;
        }

        this.selectedNodes.push(object);
        this.addHighlight(object);
        this.emit('selection-changed', { selectedNodes: this.selectedNodes });
    }

    /**
     * 移除选中
     *
     * @param {THREE.Object3D} object - 要取消选中的对象
     */
    removeSelection(object) {
        const index = this.selectedNodes.indexOf(object);
        if (index > -1) {
            this.selectedNodes.splice(index, 1);
            this.removeHighlight(object);
            this.emit('selection-changed', { selectedNodes: this.selectedNodes });
        }
    }

    /**
     * 切换选中状态
     *
     * @param {THREE.Object3D} object - 对象
     */
    toggleSelection(object) {
        if (this.selectedNodes.includes(object)) {
            this.removeSelection(object);
        } else {
            this.addSelection(object);
        }
    }

    /**
     * 清空选择
     */
    clearSelection() {
        // 移除所有高亮
        this.selectedNodes.forEach(node => {
            this.removeHighlight(node);
        });

        this.selectedNodes = [];
        this.emit('selection-changed', { selectedNodes: [] });
    }

    /**
     * 添加高亮效果
     *
     * @param {THREE.Object3D} object - 对象
     */
    addHighlight(object) {
        if (this.highlightHelpers.has(object)) {
            return;
        }

        // 创建边界框辅助对象
        const box = new THREE.BoxHelper(object, this.options.highlightColor);
        box.name = 'SelectionBoxHelper';
        this.scene.scene.add(box);

        this.highlightHelpers.set(object, box);
    }

    /**
     * 移除高亮效果
     *
     * @param {THREE.Object3D} object - 对象
     */
    removeHighlight(object) {
        const helper = this.highlightHelpers.get(object);
        if (helper) {
            this.scene.scene.remove(helper);
            helper.geometry.dispose();
            helper.material.dispose();
            this.highlightHelpers.delete(object);
        }
    }

    /**
     * 更新高亮效果（每帧调用）
     */
    updateHighlights() {
        this.highlightHelpers.forEach((helper, object) => {
            helper.update();
        });
    }

    /**
     * 开始框选
     *
     * @param {MouseEvent} event - 鼠标事件
     */
    startBoxSelection(event) {
        if (!this.options.boxSelect) {
            return;
        }

        this.isBoxSelecting = true;
        this.updateMousePosition(event);
        this.boxSelectStart = this.mouse.clone();
        this.boxSelectEnd = this.mouse.clone();
    }

    /**
     * 更新框选
     *
     * @param {MouseEvent} event - 鼠标事件
     */
    updateBoxSelection(event) {
        if (!this.isBoxSelecting) {
            return;
        }

        this.updateMousePosition(event);
        this.boxSelectEnd = this.mouse.clone();

        // 触发框选更新事件
        this.emit('box-selection-update', {
            start: this.boxSelectStart,
            end: this.boxSelectEnd
        });
    }

    /**
     * 结束框选
     *
     * @param {boolean} multiSelect - 是否多选
     */
    endBoxSelection(multiSelect = false) {
        if (!this.isBoxSelecting) {
            return;
        }

        this.isBoxSelecting = false;

        // 计算框选范围内的对象
        const selectedObjects = this.getObjectsInBox(
            this.boxSelectStart,
            this.boxSelectEnd
        );

        // 更新选择
        if (!multiSelect) {
            this.clearSelection();
        }

        selectedObjects.forEach(obj => {
            this.addSelection(obj);
        });

        // 重置框选状态
        this.boxSelectStart = null;
        this.boxSelectEnd = null;

        this.emit('box-selection-end', { selectedNodes: this.selectedNodes });
    }

    /**
     * 获取框选范围内的对象
     *
     * @param {THREE.Vector2} start - 起始点（NDC 坐标）
     * @param {THREE.Vector2} end - 结束点（NDC 坐标）
     * @returns {Array<THREE.Object3D>} 范围内的对象
     */
    getObjectsInBox(start, end) {
        const selected = [];

        // 计算框选矩形
        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);

        // 检查每个可选择对象是否在框选范围内
        this.selectableObjects.forEach(object => {
            // 获取对象的屏幕坐标
            const position = new THREE.Vector3();
            object.getWorldPosition(position);
            position.project(this.camera);

            // 检查是否在框选范围内
            if (position.x >= minX && position.x <= maxX &&
                position.y >= minY && position.y <= maxY) {
                selected.push(object);
            }
        });

        return selected;
    }

    /**
     * 全选所有可选择对象
     */
    selectAll() {
        this.clearSelection();
        this.selectableObjects.forEach(object => {
            this.addSelection(object);
        });
    }

    /**
     * 反选
     */
    invertSelection() {
        const currentSelection = [...this.selectedNodes];
        this.clearSelection();

        this.selectableObjects.forEach(object => {
            if (!currentSelection.includes(object)) {
                this.addSelection(object);
            }
        });
    }

    /**
     * 批量选择
     *
     * @param {Array<THREE.Object3D>} objects - 要选择的对象数组
     * @param {Boolean} append - 是否追加到现有选择
     */
    selectMultiple(objects, append = false) {
        if (!append) {
            this.clearSelection();
        }

        objects.forEach(object => {
            if (this.selectableObjects.includes(object)) {
                this.addSelection(object);
            }
        });
    }

    /**
     * 获取选中的节点
     *
     * @returns {Array<THREE.Object3D>} 选中的节点数组
     */
    getSelectedNodes() {
        return [...this.selectedNodes];
    }

    /**
     * 获取选中节点数量
     *
     * @returns {Number} 选中节点数量
     */
    getSelectionCount() {
        return this.selectedNodes.length;
    }

    /**
     * 是否有选中的节点
     *
     * @returns {Boolean} 是否有选中
     */
    hasSelection() {
        return this.selectedNodes.length > 0;
    }

    /**
     * 是否为多选
     *
     * @returns {Boolean} 是否为多选
     */
    isMultiSelection() {
        return this.selectedNodes.length > 1;
    }

    /**
     * 触发自定义事件
     *
     * @param {string} eventName - 事件名称
     * @param {Object} data - 事件数据
     */
    emit(eventName, data) {
        // 可以在这里集成到 EventEmitter 或其他事件系统
        const event = new CustomEvent(eventName, { detail: data });
        if (this.renderer && this.renderer.instance) {
            this.renderer.instance.domElement.dispatchEvent(event);
        }
    }

    /**
     * 销毁选择管理器
     */
    dispose() {
        // 清空选择
        this.clearSelection();

        // 清空可选择对象列表
        this.selectableObjects = [];

        console.log('SelectionManager: disposed');
    }
}

