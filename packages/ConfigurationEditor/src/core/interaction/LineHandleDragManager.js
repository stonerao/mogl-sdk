import * as THREE from 'three';
import { MoveLinePointCommand } from '../commands/MoveLinePointCommand.js';

/**
 * LineHandleDragManager - 线条编辑手柄拖动管理器
 *
 * @class LineHandleDragManager
 * @description 管理线条编辑手柄的拖动交互
 */
export class LineHandleDragManager {
    /**
     * 创建拖动管理器
     *
     * @param {Object} options - 配置选项
     * @param {THREE.Camera} options.camera - 相机
     * @param {HTMLElement} options.domElement - DOM 元素
     * @param {Object} options.commandManager - 命令管理器
     * @param {Object} options.editorStore - 编辑器 Store
     */
    constructor(options = {}) {
        this.camera = options.camera;
        this.domElement = options.domElement;
        this.commandManager = options.commandManager;
        this.editorStore = options.editorStore;

        // 拖动状态
        this.isDragging = false;
        this.draggedHandle = null;
        this.draggedLineNode = null;
        this.draggedPointIndex = -1;
        this.dragStartPosition = null;
        this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

        // Raycaster
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 绑定事件处理器
        this.handleMouseDown = this.onMouseDown.bind(this);
        this.handleMouseMove = this.onMouseMove.bind(this);
        this.handleMouseUp = this.onMouseUp.bind(this);
    }

    /**
     * 启用拖动管理器
     */
    enable() {
        if (this.domElement) {
            this.domElement.addEventListener('mousedown', this.handleMouseDown);
            this.domElement.addEventListener('mousemove', this.handleMouseMove);
            this.domElement.addEventListener('mouseup', this.handleMouseUp);
        }
    }

    /**
     * 禁用拖动管理器
     */
    disable() {
        if (this.domElement) {
            this.domElement.removeEventListener('mousedown', this.handleMouseDown);
            this.domElement.removeEventListener('mousemove', this.handleMouseMove);
            this.domElement.removeEventListener('mouseup', this.handleMouseUp);
        }
    }

    /**
     * 鼠标按下事件
     */
    onMouseDown(event) {
        // 只处理左键
        if (event.button !== 0) return;

        // 计算鼠标位置
        this.updateMousePosition(event);

        // 检测是否点击了编辑手柄
        const handle = this.getHandleUnderMouse();

        if (handle && handle.userData.isHandle) {
            event.stopPropagation();
            event.preventDefault();

            // 开始拖动
            this.startDrag(handle);
        }
    }

    /**
     * 鼠标移动事件
     */
    onMouseMove(event) {
        if (this.isDragging) {
            event.stopPropagation();
            event.preventDefault();

            // 更新拖动位置
            this.updateDrag(event);
        } else {
            // 更新鼠标位置
            this.updateMousePosition(event);

            // 检测悬停
            const handle = this.getHandleUnderMouse();
            this.updateCursor(handle);
        }
    }

    /**
     * 鼠标释放事件
     */
    onMouseUp(event) {
        if (this.isDragging) {
            event.stopPropagation();
            event.preventDefault();

            // 结束拖动
            this.endDrag();
        }
    }

    /**
     * 开始拖动
     */
    startDrag(handle) {
        this.isDragging = true;
        this.draggedHandle = handle;
        this.draggedLineNode = handle.userData.parentNode;
        this.draggedPointIndex = handle.userData.pointIndex;

        // 保存起始位置
        const points = this.draggedLineNode.properties.points;
        this.dragStartPosition = { ...points[this.draggedPointIndex] };

        // 选中控制点
        this.draggedLineNode.selectPoint(this.draggedPointIndex);

        // 更新光标
        this.domElement.style.cursor = 'grabbing';
    }

    /**
     * 更新拖动
     */
    updateDrag(event) {
        if (!this.isDragging || !this.draggedLineNode) return;

        // 计算鼠标位置
        this.updateMousePosition(event);

        // 计算世界坐标
        const worldPosition = this.getWorldPosition();

        if (worldPosition) {
            // 应用网格吸附
            if (this.editorStore && this.editorStore.snapToGrid) {
                const gridSize = this.editorStore.gridSize || 10;
                worldPosition.x = Math.round(worldPosition.x / gridSize) * gridSize;
                worldPosition.y = Math.round(worldPosition.y / gridSize) * gridSize;
            }

            // 更新控制点位置
            this.draggedLineNode.updatePoint(this.draggedPointIndex, {
                x: worldPosition.x,
                y: worldPosition.y,
                z: worldPosition.z || 0
            });
        }
    }

    /**
     * 结束拖动
     */
    endDrag() {
        if (!this.isDragging || !this.draggedLineNode) return;

        // 获取最终位置
        const points = this.draggedLineNode.properties.points;
        const finalPosition = { ...points[this.draggedPointIndex] };

        // 检查位置是否改变
        const hasChanged =
            this.dragStartPosition.x !== finalPosition.x ||
            this.dragStartPosition.y !== finalPosition.y ||
            this.dragStartPosition.z !== finalPosition.z;

        if (hasChanged && this.commandManager) {
            // 创建移动命令
            const command = new MoveLinePointCommand(
                this.draggedLineNode,
                this.draggedPointIndex,
                finalPosition,
                this.dragStartPosition
            );

            // 执行命令（已经移动过了，所以不需要再执行）
            // 直接添加到历史记录
            this.commandManager.addCommand(command, false); // false 表示不执行
        }

        // 重置状态
        this.isDragging = false;
        this.draggedHandle = null;
        this.draggedLineNode = null;
        this.draggedPointIndex = -1;
        this.dragStartPosition = null;

        // 恢复光标
        this.domElement.style.cursor = 'default';
    }

    /**
     * 更新鼠标位置
     */
    updateMousePosition(event) {
        const rect = this.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    /**
     * 获取鼠标下的编辑手柄
     */
    getHandleUnderMouse() {
        // 更新 Raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 获取所有可能的编辑手柄
        const handles = this.getAllHandles();

        // 检测相交
        const intersects = this.raycaster.intersectObjects(handles, true);

        if (intersects.length > 0) {
            // 找到最近的手柄
            let handle = intersects[0].object;
            while (handle && !handle.userData.isHandle) {
                handle = handle.parent;
            }
            return handle;
        }

        return null;
    }

    /**
     * 获取所有编辑手柄
     */
    getAllHandles() {
        const handles = [];

        // 遍历场景中的所有线条节点
        if (this.editorStore && this.editorStore.scene) {
            this.editorStore.scene.traverse(obj => {
                if (obj.userData.isHandle) {
                    handles.push(obj);
                }
            });
        }

        return handles;
    }

    /**
     * 获取世界坐标位置
     */
    getWorldPosition() {
        // 更新 Raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 与拖动平面相交
        const intersection = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.dragPlane, intersection);

        return intersection;
    }

    /**
     * 更新光标样式
     */
    updateCursor(handle) {
        if (handle && handle.userData.isHandle) {
            this.domElement.style.cursor = 'grab';
        } else if (!this.isDragging) {
            this.domElement.style.cursor = 'default';
        }
    }

    /**
     * 销毁管理器
     */
    dispose() {
        this.disable();
        this.camera = null;
        this.domElement = null;
        this.commandManager = null;
        this.editorStore = null;
    }
}

