/**
 * 常量定义
 * 
 * @description 定义应用中使用的常量
 */

// 编辑模式
export const EDIT_MODES = {
  SELECT: 'select',
  PAN: 'pan',
  DRAW: 'draw'
};

// 工具类型
export const TOOLS = {
  MOVE: 'move',
  ROTATE: 'rotate',
  SCALE: 'scale'
};

// 节点类型
export const NODE_TYPES = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  POLYGON: 'polygon',
  LINE: 'line',
  TEXT: 'text',
  IMAGE: 'image',
  GAUGE: 'gauge',
  CHART: 'chart'
};

// 事件类型
export const EVENT_TYPES = {
  CLICK: 'click',
  DOUBLE_CLICK: 'dblclick',
  MOUSE_ENTER: 'mouseenter',
  MOUSE_LEAVE: 'mouseleave',
  DATA_CHANGE: 'datachange'
};

// 数据源类型
export const DATA_SOURCE_TYPES = {
  HTTP: 'http',
  WEBSOCKET: 'websocket',
  MQTT: 'mqtt'
};

// 默认画布配置
export const DEFAULT_CANVAS_CONFIG = {
  width: 1920,
  height: 1080,
  backgroundColor: '#1e1e1e',
  gridSize: 20,
  gridColor: '#2a2a2a'
};

// 缩放限制
export const ZOOM_LIMITS = {
  MIN: 0.1,
  MAX: 5.0,
  STEP: 0.1
};

// 网格配置
export const GRID_CONFIG = {
  SIZE: 20,
  COLOR: '#2a2a2a',
  COLOR_STRONG: '#3a3a3a',
  STRONG_INTERVAL: 5
};

// 快捷键
export const SHORTCUTS = {
  UNDO: 'ctrl+z',
  REDO: 'ctrl+y',
  SAVE: 'ctrl+s',
  DELETE: 'delete',
  COPY: 'ctrl+c',
  PASTE: 'ctrl+v',
  SELECT_ALL: 'ctrl+a'
};

