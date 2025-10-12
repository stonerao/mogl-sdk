/**
 * EventTypes 事件类型定义
 *
 * @description 定义所有支持的事件类型
 */
export const EventTypes = {
    // 鼠标事件
    CLICK: 'click',
    DOUBLE_CLICK: 'dblclick',
    MOUSE_DOWN: 'mousedown',
    MOUSE_UP: 'mouseup',
    MOUSE_MOVE: 'mousemove',
    MOUSE_ENTER: 'mouseenter',
    MOUSE_LEAVE: 'mouseleave',

    // 触摸事件
    TOUCH_START: 'touchstart',
    TOUCH_END: 'touchend',
    TOUCH_MOVE: 'touchmove',

    // 组件事件
    COMPONENT_ADDED: 'component:added',
    COMPONENT_REMOVED: 'component:removed',
    COMPONENT_UPDATED: 'component:updated',

    // 资源事件
    RESOURCE_LOAD_START: 'resource:load:start',
    RESOURCE_LOAD_PROGRESS: 'resource:load:progress',
    RESOURCE_LOAD_COMPLETE: 'resource:load:complete',
    RESOURCE_LOAD_ERROR: 'resource:load:error',

    // 动画事件
    ANIMATION_START: 'animation:start',
    ANIMATION_UPDATE: 'animation:update',
    ANIMATION_COMPLETE: 'animation:complete',
    ANIMATION_STOP: 'animation:stop',

    // 场景事件
    SCENE_READY: 'scene:ready',
    SCENE_RESIZE: 'scene:resize',
    SCENE_DISPOSE: 'scene:dispose'
};

/**
 * 导出事件类型常量
 */
export default EventTypes;
