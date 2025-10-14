/**
 * @w3d/components - W3D 内置组件库
 *
 * @version 2.0.0
 * @author W3D Team
 * @license MIT
 */

// 加载器组件
export { ModelLoader } from './loaders/ModelLoader/index.js';
export { TextureLoader } from './loaders/TextureLoader/index.js';
export { HDRLoader } from './loaders/HDRLoader/index.js';

// 动画组件
export { PathAnimation } from './animation/PathAnimation/index.js';
export { CameraAnimation } from './animation/CameraAnimation/index.js';
export { ModelAnimation } from './animation/ModelAnimation/index.js';
export { MigrationLine } from './animation/MigrationLine/index.js';

// 标注组件
export { MarkPoint } from './markers/MarkPoint/index.js';
export { MarkLine } from './markers/MarkLine/index.js';
export { MarkArea } from './markers/MarkArea/index.js';
export { Label3D } from './markers/Label3D/index.js';

// 点位组件
export { ImageMarker } from './marker/ImageMarker/index.js';

// 区域组件
export { AreaBlock } from './area/AreaBlock/index.js';

// 特效组件
export { ParticleSystem } from './effects/ParticleSystem/index.js';
export { WaterEffect } from './effects/WaterEffect/index.js';
export { FireEffect } from './effects/FireEffect/index.js';

// 控制组件
export { FirstPersonControls } from './controls/FirstPersonControls/index.js';
export { FlyControls } from './controls/FlyControls/index.js';
export { TransformControls } from './controls/TransformControls/index.js';

// 辅助组件
export { GridHelper } from './helpers/GridHelper/index.js';
export { AxesHelper } from './helpers/AxesHelper/index.js';
export { BoundingBoxHelper } from './helpers/BoundingBoxHelper/index.js';
