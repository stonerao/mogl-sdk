/**
 * 事件类型配置
 * 定义编辑器支持的所有事件类型及其元数据
 */

/**
 * 事件类型枚举
 */
export const EventType = {
    // 生命周期事件
    ON_LOADED: 'onLoaded',
    ON_MOUNTED: 'onMounted',
    ON_UNMOUNT: 'onUnmount',
    ON_UPDATE: 'onUpdate',

    // 交互事件
    ON_CLICK: 'onClick',
    ON_DOUBLE_CLICK: 'onDoubleClick',
    ON_HOVER: 'onHover',
    ON_HOVER_OUT: 'onHoverOut',

    // 数据事件
    ON_DATA_UPDATE: 'onDataUpdate',
    ON_CONFIG_CHANGE: 'onConfigChange',

    // 动画事件
    ON_ANIMATION_START: 'onAnimationStart',
    ON_ANIMATION_END: 'onAnimationEnd',
    ON_ANIMATION_LOOP: 'onAnimationLoop'
};

/**
 * 事件分类
 */
export const EventCategory = {
    LIFECYCLE: 'lifecycle',
    INTERACTION: 'interaction',
    DATA: 'data',
    ANIMATION: 'animation'
};

/**
 * 事件元数据配置
 */
export const eventMetadata = {
    // ========== 生命周期事件 ==========
    [EventType.ON_LOADED]: {
        displayName: '加载完成',
        description: '组件资源加载完成时触发',
        category: EventCategory.LIFECYCLE,
        icon: '✅',
        parameters: [
            {
                name: 'component',
                type: 'object',
                description: '组件实例'
            }
        ],
        example: `function onLoaded(component) {
    console.log('组件加载完成:', component);
    // 在这里编写加载完成后的逻辑
}`
    },

    [EventType.ON_MOUNTED]: {
        displayName: '挂载完成',
        description: '组件挂载到场景后触发',
        category: EventCategory.LIFECYCLE,
        icon: '🔗',
        parameters: [
            {
                name: 'component',
                type: 'object',
                description: '组件实例'
            }
        ],
        example: `function onMounted(component) {
    console.log('组件已挂载:', component);
}`
    },

    [EventType.ON_UNMOUNT]: {
        displayName: '卸载',
        description: '组件从场景卸载时触发',
        category: EventCategory.LIFECYCLE,
        icon: '🔌',
        parameters: [
            {
                name: 'component',
                type: 'object',
                description: '组件实例'
            }
        ],
        example: `function onUnmount(component) {
    console.log('组件已卸载:', component);
    // 清理资源
}`
    },

    [EventType.ON_UPDATE]: {
        displayName: '更新',
        description: '每帧更新时触发',
        category: EventCategory.LIFECYCLE,
        icon: '🔄',
        parameters: [
            {
                name: 'delta',
                type: 'number',
                description: '距离上一帧的时间差（秒）'
            },
            {
                name: 'component',
                type: 'object',
                description: '组件实例'
            }
        ],
        example: `function onUpdate(delta, component) {
    // 每帧执行的逻辑
    // component.rotation.y += delta;
}`
    },

    // ========== 交互事件 ==========
    [EventType.ON_CLICK]: {
        displayName: '点击',
        description: '组件被点击时触发',
        category: EventCategory.INTERACTION,
        icon: '👆',
        parameters: [
            {
                name: 'event',
                type: 'object',
                description: '鼠标事件对象'
            },
            {
                name: 'component',
                type: 'object',
                description: '组件实例'
            }
        ],
        example: `function onClick(event, component) {
    console.log('组件被点击:', event, component);
    // 处理点击逻辑
}`
    },

    [EventType.ON_DOUBLE_CLICK]: {
        displayName: '双击',
        description: '组件被双击时触发',
        category: EventCategory.INTERACTION,
        icon: '👆👆',
        parameters: [
            {
                name: 'event',
                type: 'object',
                description: '鼠标事件对象'
            },
            {
                name: 'component',
                type: 'object',
                description: '组件实例'
            }
        ],
        example: `function onDoubleClick(event, component) {
    console.log('组件被双击:', event, component);
}`
    },

    [EventType.ON_HOVER]: {
        displayName: '鼠标悬停',
        description: '鼠标悬停在组件上时触发',
        category: EventCategory.INTERACTION,
        icon: '🖱️',
        parameters: [
            {
                name: 'event',
                type: 'object',
                description: '鼠标事件对象'
            },
            {
                name: 'component',
                type: 'object',
                description: '组件实例'
            }
        ],
        example: `function onHover(event, component) {
    // 高亮显示
}`
    },

    [EventType.ON_HOVER_OUT]: {
        displayName: '鼠标移出',
        description: '鼠标从组件上移出时触发',
        category: EventCategory.INTERACTION,
        icon: '🖱️',
        parameters: [
            {
                name: 'event',
                type: 'object',
                description: '鼠标事件对象'
            },
            {
                name: 'component',
                type: 'object',
                description: '组件实例'
            }
        ],
        example: `function onHoverOut(event, component) {
    // 取消高亮
}`
    },

    // ========== 数据事件 ==========
    [EventType.ON_DATA_UPDATE]: {
        displayName: '数据更新',
        description: '组件数据更新时触发',
        category: EventCategory.DATA,
        icon: '📊',
        parameters: [
            {
                name: 'newData',
                type: 'any',
                description: '新数据'
            },
            {
                name: 'oldData',
                type: 'any',
                description: '旧数据'
            },
            {
                name: 'component',
                type: 'object',
                description: '组件实例'
            }
        ],
        example: `function onDataUpdate(newData, oldData, component) {
    console.log('数据更新:', newData, oldData);
}`
    },

    [EventType.ON_CONFIG_CHANGE]: {
        displayName: '配置变更',
        description: '组件配置变更时触发',
        category: EventCategory.DATA,
        icon: '⚙️',
        parameters: [
            {
                name: 'newConfig',
                type: 'object',
                description: '新配置'
            },
            {
                name: 'oldConfig',
                type: 'object',
                description: '旧配置'
            },
            {
                name: 'component',
                type: 'object',
                description: '组件实例'
            }
        ],
        example: `function onConfigChange(newConfig, oldConfig, component) {
    console.log('配置变更:', newConfig, oldConfig);
}`
    },

    // ========== 动画事件 ==========
    [EventType.ON_ANIMATION_START]: {
        displayName: '动画开始',
        description: '动画开始播放时触发',
        category: EventCategory.ANIMATION,
        icon: '▶️',
        parameters: [
            {
                name: 'animationName',
                type: 'string',
                description: '动画名称'
            },
            {
                name: 'component',
                type: 'object',
                description: '组件实例'
            }
        ],
        example: `function onAnimationStart(animationName, component) {
    console.log('动画开始:', animationName);
}`
    },

    [EventType.ON_ANIMATION_END]: {
        displayName: '动画结束',
        description: '动画播放结束时触发',
        category: EventCategory.ANIMATION,
        icon: '⏹️',
        parameters: [
            {
                name: 'animationName',
                type: 'string',
                description: '动画名称'
            },
            {
                name: 'component',
                type: 'object',
                description: '组件实例'
            }
        ],
        example: `function onAnimationEnd(animationName, component) {
    console.log('动画结束:', animationName);
}`
    },

    [EventType.ON_ANIMATION_LOOP]: {
        displayName: '动画循环',
        description: '动画循环播放时触发',
        category: EventCategory.ANIMATION,
        icon: '🔁',
        parameters: [
            {
                name: 'animationName',
                type: 'string',
                description: '动画名称'
            },
            {
                name: 'loopCount',
                type: 'number',
                description: '循环次数'
            },
            {
                name: 'component',
                type: 'object',
                description: '组件实例'
            }
        ],
        example: `function onAnimationLoop(animationName, loopCount, component) {
    console.log('动画循环:', animationName, loopCount);
}`
    }
};

/**
 * 获取事件元数据
 * @param {string} eventType - 事件类型
 * @returns {Object|null} 事件元数据
 */
export function getEventMetadata(eventType) {
    return eventMetadata[eventType] || null;
}

/**
 * 获取所有事件类型
 * @returns {Array} 事件类型数组
 */
export function getAllEventTypes() {
    return Object.values(EventType);
}

/**
 * 根据分类获取事件类型
 * @param {string} category - 事件分类
 * @returns {Array} 事件类型数组
 */
export function getEventTypesByCategory(category) {
    return Object.entries(eventMetadata)
        .filter(([, meta]) => meta.category === category)
        .map(([type]) => type);
}

/**
 * 获取所有事件分类
 * @returns {Array} 分类数组
 */
export function getAllCategories() {
    return Object.values(EventCategory);
}

