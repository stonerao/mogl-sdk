/**
 * DragManager 拖拽管理器
 * 
 * @description 管理节点的拖拽移动功能，支持网格吸附、边界限制、多选拖拽
 * @author W3D Team
 */

import * as THREE from 'three';

/**
 * 拖拽管理器类
 * 
 * @class DragManager
 */
export class DragManager {
    /**
     * 创建拖拽管理器实例
     * 
     * @param {CanvasManager} canvasManager - 画布管理器实例
     * @param {SelectionManager} selectionManager - 选择管理器实例
     * @param {Object} options - 配置选项
     */
    constructor(canvasManager, selectionManager, options = {}) {
        this.canvasManager = canvasManager;
        this.selectionManager = selectionManager;
        this.scene = canvasManager.getScene();
        this.camera = canvasManager.getCamera();
        this.renderer = canvasManager.getRenderer();

        if (!this.scene || !this.camera || !this.renderer) {
            throw new Error('DragManager: scene, camera, or renderer not available');
        }

        // 配置选项
        this.options = {
            enabled: options.enabled !== false,           // 是否启用拖拽
            gridSnap: options.gridSnap !== false,         // 是否启用网格吸附
            gridSize: options.gridSize || 20,             // 网格大小
            boundaryCheck: options.boundaryCheck !== false, // 是否启用边界检查
            minX: options.minX ?? -10000,                 // 最小 X 坐标
            maxX: options.maxX ?? 10000,                  // 最大 X 坐标
            minY: options.minY ?? -10000,                 // 最小 Y 坐标
            maxY: options.maxY ?? 10000,                  // 最大 Y 坐标
            ...options
        };

        // 拖拽状态
        this.isDragging = false;
        this.dragStartPosition = null;
        this.dragCurrentPosition = null;
        this.dragOffset = new THREE.Vector2();

        // 拖拽的节点列表（支持多选拖拽）
        this.draggingNodes = [];
        this.nodeStartPositions = new Map();

        // 射线拾取器
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        this.intersection = new THREE.Vector3();

        // 回调函数
        this.onDragStartCallback = null;
        this.onDragMoveCallback = null;
        this.onDragEndCallback = null;

        // 绑定事件
        this.boundHandleMouseDown = this.handleMouseDown.bind(this);
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    }

    /**
     * 启用拖拽管理器
     */
    enable() {
        this.options.enabled = true;
        const domElement = this.renderer.instance.domElement;
        domElement.addEventListener('mousedown', this.boundHandleMouseDown);
        domElement.addEventListener('mousemove', this.boundHandleMouseMove);
        domElement.addEventListener('mouseup', this.boundHandleMouseUp);
        domElement.addEventListener('mouseleave', this.boundHandleMouseUp);
    }

    /**
     * 禁用拖拽管理器
     */
    disable() {
        this.options.enabled = false;
        const domElement = this.renderer.instance.domElement;
        domElement.removeEventListener('mousedown', this.boundHandleMouseDown);
        domElement.removeEventListener('mousemove', this.boundHandleMouseMove);
        domElement.removeEventListener('mouseup', this.boundHandleMouseUp);
        domElement.removeEventListener('mouseleave', this.boundHandleMouseUp);
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
     * 获取鼠标在平面上的交点
     * 
     * @returns {THREE.Vector3|null} 交点坐标
     */
    getMouseIntersection() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
            return this.intersection.clone();
        }
        
        return null;
    }

    /**
     * 应用网格吸附
     * 
     * @param {Number} value - 原始值
     * @returns {Number} 吸附后的值
     */
    snapToGrid(value) {
        if (!this.options.gridSnap) {
            return value;
        }
        
        const gridSize = this.options.gridSize;
        return Math.round(value / gridSize) * gridSize;
    }

    /**
     * 应用边界限制
     * 
     * @param {Number} x - X 坐标
     * @param {Number} y - Y 坐标
     * @returns {Object} 限制后的坐标 { x, y }
     */
    applyBoundary(x, y) {
        if (!this.options.boundaryCheck) {
            return { x, y };
        }

        return {
            x: Math.max(this.options.minX, Math.min(this.options.maxX, x)),
            y: Math.max(this.options.minY, Math.min(this.options.maxY, y))
        };
    }

    /**
     * 处理鼠标按下事件
     * 
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseDown(event) {
        if (!this.options.enabled || event.button !== 0) {
            return;
        }

        // 更新鼠标位置
        this.updateMousePosition(event);

        // 获取鼠标交点
        const intersection = this.getMouseIntersection();
        if (!intersection) {
            return;
        }

        // 检查是否点击了选中的节点
        const selectedNodes = this.selectionManager.getSelectedNodes();
        if (selectedNodes.length === 0) {
            return;
        }

        // 射线检测是否点击了选中的节点
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(selectedNodes, true);

        if (intersects.length > 0) {
            // 找到根节点
            let clickedNode = intersects[0].object;
            while (clickedNode.parent && !selectedNodes.includes(clickedNode)) {
                clickedNode = clickedNode.parent;
            }

            if (selectedNodes.includes(clickedNode)) {
                // 开始拖拽
                this.startDrag(intersection, selectedNodes);
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }

    /**
     * 开始拖拽
     * 
     * @param {THREE.Vector3} startPosition - 起始位置
     * @param {Array} nodes - 要拖拽的节点列表
     */
    startDrag(startPosition, nodes) {
        this.isDragging = true;
        this.dragStartPosition = startPosition.clone();
        this.dragCurrentPosition = startPosition.clone();
        this.draggingNodes = nodes;

        // 保存所有节点的初始位置
        this.nodeStartPositions.clear();
        nodes.forEach(node => {
            this.nodeStartPositions.set(node, {
                x: node.position.x,
                y: node.position.y,
                z: node.position.z
            });
        });

        // 触发拖拽开始回调
        if (this.onDragStartCallback) {
            this.onDragStartCallback({
                nodes: this.draggingNodes,
                startPosition: this.dragStartPosition
            });
        }
    }

    /**
     * 处理鼠标移动事件
     * 
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseMove(event) {
        if (!this.isDragging) {
            return;
        }

        // 更新鼠标位置
        this.updateMousePosition(event);

        // 获取鼠标交点
        const intersection = this.getMouseIntersection();
        if (!intersection) {
            return;
        }

        this.dragCurrentPosition = intersection.clone();

        // 计算拖拽偏移量
        const deltaX = this.dragCurrentPosition.x - this.dragStartPosition.x;
        const deltaY = this.dragCurrentPosition.y - this.dragStartPosition.y;

        // 更新所有拖拽节点的位置
        this.draggingNodes.forEach(node => {
            const startPos = this.nodeStartPositions.get(node);
            if (startPos) {
                let newX = startPos.x + deltaX;
                let newY = startPos.y + deltaY;

                // 应用网格吸附
                newX = this.snapToGrid(newX);
                newY = this.snapToGrid(newY);

                // 应用边界限制
                const bounded = this.applyBoundary(newX, newY);
                newX = bounded.x;
                newY = bounded.y;

                // 更新节点位置
                node.position.x = newX;
                node.position.y = newY;

                // 如果节点有 setProperty 方法，同步更新属性
                if (node.setProperty) {
                    node.setProperty('x', newX, true);
                    node.setProperty('y', newY, true);
                }
            }
        });

        // 触发拖拽移动回调
        if (this.onDragMoveCallback) {
            this.onDragMoveCallback({
                nodes: this.draggingNodes,
                delta: { x: deltaX, y: deltaY },
                currentPosition: this.dragCurrentPosition
            });
        }

        event.preventDefault();
    }

    /**
     * 处理鼠标释放事件
     * 
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseUp(event) {
        if (!this.isDragging) {
            return;
        }

        // 触发拖拽结束回调
        if (this.onDragEndCallback) {
            this.onDragEndCallback({
                nodes: this.draggingNodes,
                startPosition: this.dragStartPosition,
                endPosition: this.dragCurrentPosition
            });
        }

        // 重置拖拽状态
        this.isDragging = false;
        this.dragStartPosition = null;
        this.dragCurrentPosition = null;
        this.draggingNodes = [];
        this.nodeStartPositions.clear();
    }

    /**
     * 设置网格吸附
     * 
     * @param {Boolean} enabled - 是否启用
     */
    setGridSnap(enabled) {
        this.options.gridSnap = enabled;
    }

    /**
     * 设置网格大小
     * 
     * @param {Number} size - 网格大小
     */
    setGridSize(size) {
        this.options.gridSize = size;
    }

    /**
     * 设置拖拽开始回调
     * 
     * @param {Function} callback - 回调函数
     */
    onDragStart(callback) {
        this.onDragStartCallback = callback;
    }

    /**
     * 设置拖拽移动回调
     * 
     * @param {Function} callback - 回调函数
     */
    onDragMove(callback) {
        this.onDragMoveCallback = callback;
    }

    /**
     * 设置拖拽结束回调
     * 
     * @param {Function} callback - 回调函数
     */
    onDragEnd(callback) {
        this.onDragEndCallback = callback;
    }

    /**
     * 销毁拖拽管理器
     */
    dispose() {
        this.disable();
        this.draggingNodes = [];
        this.nodeStartPositions.clear();
    }
}

