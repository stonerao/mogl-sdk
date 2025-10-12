import { Raycaster } from './Raycaster.js';
import { EventTypes } from './EventTypes.js';

/**
 * EventSystem 事件系统
 *
 * @class EventSystem
 * @description 事件分发和射线拾取
 */
export class EventSystem {
    /**
     * 创建事件系统实例
     *
     * @param {Scene} scene - 场景实例
     */
    constructor(scene) {
        this.scene = scene;

        // 射线拾取器
        this.raycaster = new Raycaster(scene);

        // 事件监听器
        this.listeners = new Map();

        // 当前悬停的对象
        this.hoveredObject = null;

        // 初始化状态
        this.isInitialized = false;

        // 绑定事件处理函数
        this.handleClick = this.onClick.bind(this);
        this.handleMouseMove = this.onMouseMove.bind(this);
        this.handleMouseDown = this.onMouseDown.bind(this);
        this.handleMouseUp = this.onMouseUp.bind(this);
        this.handleDoubleClick = this.onDoubleClick.bind(this);

        // 注意：不在构造函数中调用 init()，等待 renderer 创建后再调用
    }

    /**
     * 初始化事件监听
     */
    init() {
        // 检查是否已经初始化
        if (this.isInitialized) {
            return;
        }

        // 检查 renderer 是否可用
        if (!this.scene.renderer || !this.scene.renderer.instance) {
            console.warn('EventSystem: Renderer not available, skipping initialization');
            return;
        }

        const canvas = this.scene.renderer.instance.domElement;

        canvas.addEventListener('click', this.handleClick);
        canvas.addEventListener('mousemove', this.handleMouseMove);
        canvas.addEventListener('mousedown', this.handleMouseDown);
        canvas.addEventListener('mouseup', this.handleMouseUp);
        canvas.addEventListener('dblclick', this.handleDoubleClick);

        this.isInitialized = true;
    }

    /**
     * 收集所有可交互的对象
     *
     * @returns {Array<THREE.Object3D>} 可交互的对象数组
     */
    getInteractiveObjects() {
        const interactiveObjects = [];

        // 遍历场景中的所有组件
        this.scene.componentManager.components.forEach((component) => {
            if (component.getInteractiveObjects) {
                const objects = component.getInteractiveObjects();
                interactiveObjects.push(...objects);
            }
        });

        return interactiveObjects;
    }

    /**
     * 点击事件处理
     *
     * @param {MouseEvent} event - 鼠标事件
     */
    onClick(event) {
        const interactiveObjects = this.getInteractiveObjects();
        const intersects = this.raycaster.raycast(event, interactiveObjects);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.emit(EventTypes.CLICK, {
                type: EventTypes.CLICK,
                object,
                point: intersects[0].point,
                event
            });
        }
    }

    /**
     * 鼠标移动事件处理
     *
     * @param {MouseEvent} event - 鼠标事件
     */
    onMouseMove(event) {
        const interactiveObjects = this.getInteractiveObjects();
        const intersects = this.raycaster.raycast(event, interactiveObjects);

        if (intersects.length > 0) {
            const object = intersects[0].object;

            // 处理悬停进入
            if (this.hoveredObject !== object) {
                // 悬停离开
                if (this.hoveredObject) {
                    this.emit(EventTypes.MOUSE_LEAVE, {
                        type: EventTypes.MOUSE_LEAVE,
                        object: this.hoveredObject,
                        event
                    });
                }

                // 悬停进入
                this.hoveredObject = object;
                this.emit(EventTypes.MOUSE_ENTER, {
                    type: EventTypes.MOUSE_ENTER,
                    object,
                    point: intersects[0].point,
                    event
                });
            }

            // 悬停移动
            this.emit(EventTypes.MOUSE_MOVE, {
                type: EventTypes.MOUSE_MOVE,
                object,
                point: intersects[0].point,
                event
            });
        } else {
            // 鼠标离开所有对象
            if (this.hoveredObject) {
                this.emit(EventTypes.MOUSE_LEAVE, {
                    type: EventTypes.MOUSE_LEAVE,
                    object: this.hoveredObject,
                    event
                });
                this.hoveredObject = null;
            }
        }
    }

    /**
     * 鼠标按下事件处理
     *
     * @param {MouseEvent} event - 鼠标事件
     */
    onMouseDown(event) {
        const interactiveObjects = this.getInteractiveObjects();
        const intersects = this.raycaster.raycast(event, interactiveObjects);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.emit(EventTypes.MOUSE_DOWN, {
                type: EventTypes.MOUSE_DOWN,
                object,
                point: intersects[0].point,
                event
            });
        }
    }

    /**
     * 鼠标抬起事件处理
     *
     * @param {MouseEvent} event - 鼠标事件
     */
    onMouseUp(event) {
        const interactiveObjects = this.getInteractiveObjects();
        const intersects = this.raycaster.raycast(event, interactiveObjects);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.emit(EventTypes.MOUSE_UP, {
                type: EventTypes.MOUSE_UP,
                object,
                point: intersects[0].point,
                event
            });
        }
    }

    /**
     * 双击事件处理
     *
     * @param {MouseEvent} event - 鼠标事件
     */
    onDoubleClick(event) {
        const interactiveObjects = this.getInteractiveObjects();
        const intersects = this.raycaster.raycast(event, interactiveObjects);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.emit(EventTypes.DOUBLE_CLICK, {
                type: EventTypes.DOUBLE_CLICK,
                object,
                point: intersects[0].point,
                event
            });
        }
    }

    /**
     * 触发事件
     *
     * @param {string} eventType - 事件类型
     * @param {Object} eventData - 事件数据
     */
    emit(eventType, eventData) {
        // 触发全局事件
        const globalListeners = this.listeners.get(eventType) || [];
        globalListeners.forEach((listener) => {
            listener(eventData);
        });

        // 触发对象事件
        if (eventData.object && eventData.object.userData.eventEmitter) {
            eventData.object.userData.eventEmitter.emit(eventType, eventData);
        }
    }

    /**
     * 监听事件
     *
     * @param {string} eventType - 事件类型
     * @param {Function} listener - 事件监听器
     */
    on(eventType, listener) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }

        this.listeners.get(eventType).push(listener);
    }

    /**
     * 移除事件监听
     *
     * @param {string} eventType - 事件类型
     * @param {Function} listener - 事件监听器
     */
    off(eventType, listener) {
        const listeners = this.listeners.get(eventType);

        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 销毁事件系统
     */
    dispose() {
        // 只有在已初始化且 renderer 存在时才移除事件监听器
        if (this.isInitialized && this.scene.renderer && this.scene.renderer.instance) {
            const canvas = this.scene.renderer.instance.domElement;

            canvas.removeEventListener('click', this.handleClick);
            canvas.removeEventListener('mousemove', this.handleMouseMove);
            canvas.removeEventListener('mousedown', this.handleMouseDown);
            canvas.removeEventListener('mouseup', this.handleMouseUp);
            canvas.removeEventListener('dblclick', this.handleDoubleClick);
        }

        this.listeners.clear();
        this.hoveredObject = null;
        this.isInitialized = false;
    }
}
