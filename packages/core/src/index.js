/**
 * @w3d/core - W3D WebGL 3D 渲染引擎核心包
 *
 * @version 2.0.0
 * @author W3D Team
 * @license MIT
 */

// 核心模块
export { Scene } from './core/Scene.js';
export { Renderer } from './core/Renderer.js';
export { Camera } from './core/Camera.js';
export { Controls } from './core/Controls.js';
export { Light } from './core/Light.js';

// 组件系统
export { Component } from './component/Component.js';
export { ComponentManager } from './component/ComponentManager.js';
export { LifecycleManager } from './component/LifecycleManager.js';

// 事件系统
export { EventSystem } from './event/EventSystem.js';
export { Raycaster } from './event/Raycaster.js';
export { EventTypes } from './event/EventTypes.js';

// 资源管理
export { ResourceManager } from './resource/ResourceManager.js';
export { TextureLoader } from './resource/TextureLoader.js';
export { ModelLoader } from './resource/ModelLoader.js';
export { CacheManager } from './resource/CacheManager.js';

// 动画系统
export { AnimationManager } from './animation/AnimationManager.js';
export { Tween } from './animation/Tween.js';

// 配置
export { defaultConfig } from './config/defaultConfig.js';
export * from './config/constants.js';

// 默认导出
export { Scene as default } from './core/Scene.js';
