/**
 * EventTypes.js - 事件类型定义
 * 
 * @description 定义所有支持的事件类型和动作类型
 * @author W3D Team
 * @date 2025-10-30
 */

/**
 * 事件类型枚举
 */
export const EventType = {
  // 用户交互事件
  CLICK: 'click',                    // 点击
  DOUBLE_CLICK: 'doubleClick',       // 双击
  MOUSE_ENTER: 'mouseEnter',         // 鼠标进入
  MOUSE_LEAVE: 'mouseLeave',         // 鼠标离开
  MOUSE_DOWN: 'mouseDown',           // 鼠标按下
  MOUSE_UP: 'mouseUp',               // 鼠标释放
  MOUSE_MOVE: 'mouseMove',           // 鼠标移动
  
  // 数据变化事件
  DATA_CHANGE: 'dataChange',         // 数据变化
  PROPERTY_CHANGE: 'propertyChange', // 属性变化
  VALUE_CHANGE: 'valueChange',       // 值变化
  THRESHOLD_TRIGGER: 'thresholdTrigger', // 阈值触发
  
  // 定时事件
  TIMER: 'timer',                    // 定时器
  INTERVAL: 'interval',              // 周期性任务
  
  // 生命周期事件
  INIT: 'init',                      // 初始化
  MOUNTED: 'mounted',                // 挂载完成
  UPDATED: 'updated',                // 更新完成
  DESTROYED: 'destroyed',            // 销毁
  
  // 自定义事件
  CUSTOM: 'custom'                   // 自定义事件
};

/**
 * 动作类型枚举
 */
export const ActionType = {
  // 属性变更动作
  SET_PROPERTY: 'setProperty',       // 设置属性
  UPDATE_STYLE: 'updateStyle',       // 更新样式
  SET_POSITION: 'setPosition',       // 设置位置
  SET_ROTATION: 'setRotation',       // 设置旋转
  SET_SCALE: 'setScale',             // 设置缩放
  
  // 显示控制动作
  SHOW: 'show',                      // 显示
  HIDE: 'hide',                      // 隐藏
  TOGGLE_VISIBILITY: 'toggleVisibility', // 切换可见性
  
  // 数据请求动作
  REFRESH_DATA: 'refreshData',       // 刷新数据
  SEND_REQUEST: 'sendRequest',       // 发送请求
  UPDATE_DATA_SOURCE: 'updateDataSource', // 更新数据源
  
  // 动画动作
  ANIMATE_MOVE: 'animateMove',       // 移动动画
  ANIMATE_SCALE: 'animateScale',     // 缩放动画
  ANIMATE_ROTATE: 'animateRotate',   // 旋转动画
  ANIMATE_FADE: 'animateFade',       // 淡入淡出动画
  
  // 脚本执行动作
  EXECUTE_SCRIPT: 'executeScript',   // 执行脚本
  
  // 页面跳转动作
  NAVIGATE: 'navigate',              // 页面跳转
  OPEN_URL: 'openUrl',               // 打开 URL
  
  // 事件触发动作
  TRIGGER_EVENT: 'triggerEvent',     // 触发其他事件
  
  // 日志动作
  LOG: 'log',                        // 输出日志
  ALERT: 'alert',                    // 弹出警告
  
  // 自定义动作
  CUSTOM: 'custom'                   // 自定义动作
};

/**
 * 事件优先级
 */
export const EventPriority = {
  HIGHEST: 100,   // 最高优先级
  HIGH: 75,       // 高优先级
  NORMAL: 50,     // 普通优先级
  LOW: 25,        // 低优先级
  LOWEST: 0       // 最低优先级
};

/**
 * 事件传播模式
 */
export const EventPropagation = {
  BUBBLE: 'bubble',     // 冒泡
  CAPTURE: 'capture',   // 捕获
  NONE: 'none'          // 不传播
};

/**
 * 条件运算符
 */
export const ConditionOperator = {
  // 比较运算符
  EQUAL: '==',              // 等于
  NOT_EQUAL: '!=',          // 不等于
  GREATER_THAN: '>',        // 大于
  GREATER_EQUAL: '>=',      // 大于等于
  LESS_THAN: '<',           // 小于
  LESS_EQUAL: '<=',         // 小于等于
  
  // 逻辑运算符
  AND: '&&',                // 与
  OR: '||',                 // 或
  NOT: '!',                 // 非
  
  // 字符串运算符
  CONTAINS: 'contains',     // 包含
  STARTS_WITH: 'startsWith', // 以...开始
  ENDS_WITH: 'endsWith',    // 以...结束
  MATCHES: 'matches',       // 正则匹配
  
  // 其他运算符
  IN: 'in',                 // 在...中
  EXISTS: 'exists'          // 存在
};

/**
 * 动作执行模式
 */
export const ActionExecutionMode = {
  SERIAL: 'serial',         // 串行执行
  PARALLEL: 'parallel'      // 并行执行
};

/**
 * 事件状态
 */
export const EventStatus = {
  ENABLED: 'enabled',       // 启用
  DISABLED: 'disabled',     // 禁用
  PAUSED: 'paused'          // 暂停
};

/**
 * 获取事件类型的显示名称
 */
export function getEventTypeLabel(type) {
  const labels = {
    [EventType.CLICK]: '点击',
    [EventType.DOUBLE_CLICK]: '双击',
    [EventType.MOUSE_ENTER]: '鼠标进入',
    [EventType.MOUSE_LEAVE]: '鼠标离开',
    [EventType.MOUSE_DOWN]: '鼠标按下',
    [EventType.MOUSE_UP]: '鼠标释放',
    [EventType.MOUSE_MOVE]: '鼠标移动',
    [EventType.DATA_CHANGE]: '数据变化',
    [EventType.PROPERTY_CHANGE]: '属性变化',
    [EventType.VALUE_CHANGE]: '值变化',
    [EventType.THRESHOLD_TRIGGER]: '阈值触发',
    [EventType.TIMER]: '定时器',
    [EventType.INTERVAL]: '周期性任务',
    [EventType.INIT]: '初始化',
    [EventType.MOUNTED]: '挂载完成',
    [EventType.UPDATED]: '更新完成',
    [EventType.DESTROYED]: '销毁',
    [EventType.CUSTOM]: '自定义事件'
  };
  return labels[type] || type;
}

/**
 * 获取动作类型的显示名称
 */
export function getActionTypeLabel(type) {
  const labels = {
    [ActionType.SET_PROPERTY]: '设置属性',
    [ActionType.UPDATE_STYLE]: '更新样式',
    [ActionType.SET_POSITION]: '设置位置',
    [ActionType.SET_ROTATION]: '设置旋转',
    [ActionType.SET_SCALE]: '设置缩放',
    [ActionType.SHOW]: '显示',
    [ActionType.HIDE]: '隐藏',
    [ActionType.TOGGLE_VISIBILITY]: '切换可见性',
    [ActionType.REFRESH_DATA]: '刷新数据',
    [ActionType.SEND_REQUEST]: '发送请求',
    [ActionType.UPDATE_DATA_SOURCE]: '更新数据源',
    [ActionType.ANIMATE_MOVE]: '移动动画',
    [ActionType.ANIMATE_SCALE]: '缩放动画',
    [ActionType.ANIMATE_ROTATE]: '旋转动画',
    [ActionType.ANIMATE_FADE]: '淡入淡出动画',
    [ActionType.EXECUTE_SCRIPT]: '执行脚本',
    [ActionType.NAVIGATE]: '页面跳转',
    [ActionType.OPEN_URL]: '打开 URL',
    [ActionType.TRIGGER_EVENT]: '触发事件',
    [ActionType.LOG]: '输出日志',
    [ActionType.ALERT]: '弹出警告',
    [ActionType.CUSTOM]: '自定义动作'
  };
  return labels[type] || type;
}

/**
 * 获取条件运算符的显示名称
 */
export function getConditionOperatorLabel(operator) {
  const labels = {
    [ConditionOperator.EQUAL]: '等于',
    [ConditionOperator.NOT_EQUAL]: '不等于',
    [ConditionOperator.GREATER_THAN]: '大于',
    [ConditionOperator.GREATER_EQUAL]: '大于等于',
    [ConditionOperator.LESS_THAN]: '小于',
    [ConditionOperator.LESS_EQUAL]: '小于等于',
    [ConditionOperator.AND]: '与',
    [ConditionOperator.OR]: '或',
    [ConditionOperator.NOT]: '非',
    [ConditionOperator.CONTAINS]: '包含',
    [ConditionOperator.STARTS_WITH]: '以...开始',
    [ConditionOperator.ENDS_WITH]: '以...结束',
    [ConditionOperator.MATCHES]: '正则匹配',
    [ConditionOperator.IN]: '在...中',
    [ConditionOperator.EXISTS]: '存在'
  };
  return labels[operator] || operator;
}

/**
 * 获取所有事件类型
 */
export function getAllEventTypes() {
  return Object.values(EventType);
}

/**
 * 获取所有动作类型
 */
export function getAllActionTypes() {
  return Object.values(ActionType);
}

/**
 * 获取所有条件运算符
 */
export function getAllConditionOperators() {
  return Object.values(ConditionOperator);
}

