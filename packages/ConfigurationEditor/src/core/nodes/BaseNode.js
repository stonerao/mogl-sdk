import { Component } from '@w3d/core';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

/**
 * BaseNode 节点基类
 *
 * @class BaseNode
 * @extends Component
 * @description 所有组态节点的基类，提供统一的属性系统、序列化和事件处理
 *
 * @example
 * class RectNode extends BaseNode {
 *     static nodeType = 'rect';
 *     static defaultProperties = {
 *         width: 100,
 *         height: 100,
 *         borderRadius: 0
 *     };
 *
 *     onCreate() {
 *         super.onCreate();
 *         this.createGeometry();
 *     }
 * }
 */
export class BaseNode extends Component {
    /**
     * 节点类型（子类必须覆盖）
     */
    static nodeType = 'base';

    /**
     * 默认属性（子类可以扩展）
     */
    static defaultProperties = {
        // 基础属性
        x: 0,
        y: 0,
        z: 0,
        width: 100,
        height: 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,

        // 样式属性
        color: '#409EFF',
        opacity: 1,
        borderColor: '#ffffff',
        borderWidth: 0,

        // 显示属性
        visible: true,
        locked: false,

        // 数据绑定
        dataSource: null,
        dataKey: null,

        // 状态管理
        currentState: 0,  // 当前状态 ID
        stateDataKey: null  // 状态数据绑定键
    };

    /**
     * 创建节点实例
     *
     * @param {Scene} scene - W3D Scene 实例
     * @param {Object} config - 节点配置
     */
    constructor(scene, config = {}) {
        super(scene, config);

        // 生成唯一 UUID
        this.uuid = config.uuid || uuidv4();

        // 节点类型
        this.nodeType = this.constructor.nodeType;

        // 节点名称
        this.nodeName = config.name || `${this.nodeType}_${Date.now()}`;

        // 合并属性
        this.properties = {
            ...this.constructor.defaultProperties,
            ...config.properties
        };

        // 属性监听器
        this.propertyWatchers = new Map();

        // 数据绑定
        this.boundData = null;

        // 交互状态
        this.isHovered = false;
        this.isSelected = false;
        this.isDragging = false;

        // 状态管理
        this.states = config.states || [];  // 状态配置数组
        this.currentStateId = this.properties.currentState || 0;  // 当前状态 ID

        // 调用创建钩子
        this.onCreate();
    }

    /**
     * 生命周期：节点创建
     * 子类应该在这里创建几何体和材质
     */
    onCreate() {
        // 应用初始属性
        this.applyProperties();

        // 设置名称
        this.name = this.nodeName;
    }

    /**
     * 生命周期：节点挂载
     */
    onMounted() {
        super.onMounted();
        this.isMounted = true;
        this.emit('mounted', { node: this });

        // 触发加载完成事件
        this.onLoad();
    }

    /**
     * 生命周期：节点加载完成
     * 在节点挂载后触发，可用于初始化数据、绑定事件等
     */
    onLoad() {
        this.emit('loaded', { node: this });
    }

    /**
     * 生命周期：节点更新
     *
     * @param {number} delta - 时间增量
     */
    onUpdate(delta) {
        super.onUpdate(delta);

        // 更新数据绑定
        if (this.boundData) {
            this.updateDataBinding();
        }
    }

    /**
     * 生命周期：节点销毁
     */
    onDispose() {
        super.onDispose();

        // 触发销毁事件
        this.onDestroy();

        // 清理属性监听器
        this.propertyWatchers.clear();

        // 清理几何体和材质
        this.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        this.emit('disposed', { node: this });
    }

    /**
     * 生命周期：节点销毁前
     * 在节点销毁前触发，可用于清理资源、解绑事件等
     */
    onDestroy() {
        this.emit('destroyed', { node: this });
    }

    /**
     * 应用属性到 Three.js 对象
     */
    applyProperties() {
        const props = this.properties;

        // 位置
        this.position.set(props.x, props.y, props.z);

        // 旋转（2D 只需要 Z 轴旋转）
        this.rotation.z = THREE.MathUtils.degToRad(props.rotation);

        // 缩放
        this.scale.set(props.scaleX, props.scaleY, 1);

        // 可见性
        this.visible = props.visible;
    }

    /**
     * 设置属性
     *
     * @param {string} key - 属性名
     * @param {*} value - 属性值
     * @param {boolean} silent - 是否静默更新（不触发事件）
     */
    setProperty(key, value, silent = false) {
        const oldValue = this.properties[key];

        // 更新属性
        this.properties[key] = value;

        // 应用属性变化
        this.onPropertyChange(key, value, oldValue);

        // 触发属性变化事件
        if (!silent) {
            this.emit('property-changed', { key, value, oldValue });

            // 触发特定属性的监听器
            const watchers = this.propertyWatchers.get(key);
            if (watchers) {
                watchers.forEach(watcher => watcher(value, oldValue));
            }
        }
    }

    /**
     * 批量设置属性
     *
     * @param {Object} properties - 属性对象
     * @param {boolean} silent - 是否静默更新
     */
    setProperties(properties, silent = false) {
        Object.entries(properties).forEach(([key, value]) => {
            this.setProperty(key, value, silent);
        });
    }

    /**
     * 获取属性
     *
     * @param {string} key - 属性名
     * @returns {*} 属性值
     */
    getProperty(key) {
        return this.properties[key];
    }

    /**
     * 获取所有属性
     *
     * @returns {Object} 属性对象
     */
    getProperties() {
        return { ...this.properties };
    }

    /**
     * 监听属性变化
     *
     * @param {string} key - 属性名
     * @param {Function} callback - 回调函数
     */
    watchProperty(key, callback) {
        if (!this.propertyWatchers.has(key)) {
            this.propertyWatchers.set(key, []);
        }
        this.propertyWatchers.get(key).push(callback);
    }

    /**
     * 属性变化处理（子类可以覆盖）
     *
     * @param {string} key - 属性名
     * @param {*} newValue - 新值
     * @param {*} oldValue - 旧值
     */
    onPropertyChange(key, newValue, oldValue) {
        // 根据属性类型应用变化
        switch (key) {
            case 'x':
            case 'y':
            case 'z':
                this.position.set(
                    this.properties.x,
                    this.properties.y,
                    this.properties.z
                );
                break;

            case 'rotation':
                this.rotation.z = THREE.MathUtils.degToRad(newValue);
                break;

            case 'scaleX':
            case 'scaleY':
                this.scale.set(this.properties.scaleX, this.properties.scaleY, 1);
                break;

            case 'visible':
                this.setVisible(newValue);
                break;

            case 'opacity':
                this.updateOpacity(newValue);
                break;

            case 'color':
                this.updateColor(newValue);
                break;
        }
    }

    /**
     * 更新透明度（子类可以覆盖）
     *
     * @param {number} opacity - 透明度值 (0-1)
     */
    updateOpacity(opacity) {
        this.traverse((child) => {
            if (child.material) {
                child.material.opacity = opacity;
                child.material.transparent = opacity < 1;
            }
        });
    }

    /**
     * 更新颜色（子类可以覆盖）
     *
     * @param {string} color - 颜色值
     */
    updateColor(color) {
        this.traverse((child) => {
            if (child.material && child.material.color) {
                child.material.color.set(color);
            }
        });
    }

    /**
     * 序列化节点为 JSON
     *
     * @returns {Object} JSON 对象
     */
    toJSON() {
        return {
            uuid: this.uuid,
            nodeType: this.nodeType,
            name: this.nodeName,
            properties: { ...this.properties },
            transform: {
                position: this.position.toArray(),
                rotation: this.rotation.toArray(),
                scale: this.scale.toArray()
            }
        };
    }

    /**
     * 从 JSON 反序列化节点
     *
     * @param {Object} json - JSON 对象
     */
    fromJSON(json) {
        this.uuid = json.uuid;
        this.nodeName = json.name;
        this.properties = { ...json.properties };

        // 应用变换
        if (json.transform) {
            this.position.fromArray(json.transform.position);
            this.rotation.fromArray(json.transform.rotation);
            this.scale.fromArray(json.transform.scale);
        }

        // 应用属性
        this.applyProperties();
    }

    /**
     * 克隆节点
     *
     * @returns {BaseNode} 克隆的节点
     */
    clone() {
        const json = this.toJSON();
        // 生成新的 UUID
        delete json.uuid;
        json.name = `${json.name}_copy`;

        // 创建新节点（需要通过工厂方法）
        return json;
    }

    /**
     * 绑定数据源
     *
     * @param {Object} data - 数据对象
     * @param {string} key - 数据键
     */
    bindData(data, key) {
        this.boundData = data;
        this.properties.dataSource = data;
        this.properties.dataKey = key;
        this.updateDataBinding();
    }

    /**
     * 更新数据绑定（子类可以覆盖）
     */
    updateDataBinding() {
        if (!this.boundData || !this.properties.dataKey) return;

        const value = this.boundData[this.properties.dataKey];
        if (value !== undefined) {
            this.onDataUpdate(value);
        }
    }

    /**
     * 数据更新回调（子类可以覆盖）
     *
     * @param {*} value - 数据值
     */
    onDataUpdate(value) {
        // 子类实现具体的数据更新逻辑
        this.emit('data-updated', { value });
    }

    /**
     * 获取可交互的对象列表
     *
     * @returns {Array<THREE.Object3D>} 可交互的对象数组
     */
    getInteractiveObjects() {
        return [this];
    }

    /**
     * 设置选中状态
     *
     * @param {boolean} selected - 是否选中
     */
    setSelected(selected) {
        this.isSelected = selected;
        this.emit('selection-changed', { selected });
    }

    /**
     * 设置悬停状态
     *
     * @param {boolean} hovered - 是否悬停
     */
    setHovered(hovered) {
        this.isHovered = hovered;
        this.emit('hover-changed', { hovered });
    }

    /**
     * 设置可见性
     *
     * @param {boolean} visible - 是否可见
     */
    setVisible(visible) {
        const oldVisible = this.visible;
        this.visible = visible;

        // 触发显示/隐藏事件
        if (visible && !oldVisible) {
            this.onShow();
        } else if (!visible && oldVisible) {
            this.onHide();
        }
    }

    /**
     * 生命周期：节点显示
     * 当节点从隐藏变为显示时触发
     */
    onShow() {
        this.emit('shown', { node: this });
    }

    /**
     * 生命周期：节点隐藏
     * 当节点从显示变为隐藏时触发
     */
    onHide() {
        this.emit('hidden', { node: this });
    }

    // ==================== 状态管理方法 ====================

    /**
     * 获取所有状态配置
     *
     * @returns {Array} 状态配置数组
     */
    getStates() {
        return this.states || [];
    }

    /**
     * 获取当前状态 ID
     *
     * @returns {number} 当前状态 ID
     */
    getCurrentStateId() {
        return this.currentStateId;
    }

    /**
     * 获取当前状态配置
     *
     * @returns {Object|null} 当前状态配置对象
     */
    getCurrentState() {
        if (!this.states || this.states.length === 0) {
            return null;
        }
        return this.states.find(state => state.stateId === this.currentStateId) || this.states[0];
    }

    /**
     * 根据状态 ID 获取状态配置
     *
     * @param {number} stateId - 状态 ID
     * @returns {Object|null} 状态配置对象
     */
    getStateById(stateId) {
        if (!this.states || this.states.length === 0) {
            return null;
        }
        return this.states.find(state => state.stateId === stateId) || null;
    }

    /**
     * 设置节点状态
     *
     * @param {number} stateId - 状态 ID
     * @param {boolean} silent - 是否静默更新（不触发事件）
     * @returns {boolean} 是否成功设置状态
     */
    setState(stateId, silent = false) {
        // 检查状态是否存在
        const state = this.getStateById(stateId);
        if (!state) {
            console.warn(`[BaseNode] State ${stateId} not found for node ${this.nodeName}`);
            return false;
        }

        // 保存旧状态
        const oldStateId = this.currentStateId;
        const oldState = this.getCurrentState();

        // 更新状态 ID
        this.currentStateId = stateId;
        this.properties.currentState = stateId;

        // 应用状态样式
        this.applyStateStyle(state);

        // 触发状态变化事件
        if (!silent) {
            this.emit('state-changed', {
                node: this,
                oldStateId,
                newStateId: stateId,
                oldState,
                newState: state
            });
        }

        return true;
    }

    /**
     * 应用状态样式
     *
     * @param {Object} state - 状态配置对象
     */
    applyStateStyle(state) {
        if (!state || !state.style) {
            return;
        }

        // 应用样式到属性
        const style = state.style;

        if (style.backgroundColor !== undefined) {
            this.setProperty('color', style.backgroundColor, true);
        }

        if (style.borderColor !== undefined) {
            this.setProperty('borderColor', style.borderColor, true);
        }

        if (style.opacity !== undefined) {
            this.setProperty('opacity', style.opacity, true);
        }

        // 如果状态有图标，更新图标（子类实现）
        if (state.icon) {
            this.onStateIconChange(state.icon);
        }

        // 调用子类的状态样式应用方法
        this.onStateStyleApplied(state);
    }

    /**
     * 状态图标变化回调（子类可以覆盖）
     *
     * @param {string} iconPath - 图标路径
     */
    onStateIconChange(iconPath) {
        // 子类实现具体的图标更新逻辑
        this.emit('state-icon-changed', { iconPath });
    }

    /**
     * 状态样式应用回调（子类可以覆盖）
     *
     * @param {Object} state - 状态配置对象
     */
    onStateStyleApplied(state) {
        // 子类可以在这里实现额外的样式应用逻辑
    }

    /**
     * 切换到下一个状态
     *
     * @returns {boolean} 是否成功切换
     */
    nextState() {
        if (!this.states || this.states.length === 0) {
            return false;
        }

        const currentIndex = this.states.findIndex(state => state.stateId === this.currentStateId);
        const nextIndex = (currentIndex + 1) % this.states.length;
        const nextState = this.states[nextIndex];

        return this.setState(nextState.stateId);
    }

    /**
     * 切换到上一个状态
     *
     * @returns {boolean} 是否成功切换
     */
    previousState() {
        if (!this.states || this.states.length === 0) {
            return false;
        }

        const currentIndex = this.states.findIndex(state => state.stateId === this.currentStateId);
        const previousIndex = (currentIndex - 1 + this.states.length) % this.states.length;
        const previousState = this.states[previousIndex];

        return this.setState(previousState.stateId);
    }
}

