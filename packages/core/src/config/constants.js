/**
 * 常量定义
 *
 * @description 定义 SDK 中使用的常量
 */

// 版本信息
export const VERSION = '2.0.0';

// 构建信息
export const BUILD_DATE = '2025-10-09';

// 渲染模式
export const RenderMode = {
    NORMAL: 'normal',
    WIREFRAME: 'wireframe',
    POINTS: 'points'
};

// 阴影类型
export const ShadowType = {
    BASIC: 'BasicShadowMap',
    PCF: 'PCFShadowMap',
    PCF_SOFT: 'PCFSoftShadowMap',
    VSM: 'VSMShadowMap'
};

// 纹理过滤
export const TextureFilter = {
    NEAREST: 'NearestFilter',
    LINEAR: 'LinearFilter',
    NEAREST_MIPMAP_NEAREST: 'NearestMipmapNearestFilter',
    NEAREST_MIPMAP_LINEAR: 'NearestMipmapLinearFilter',
    LINEAR_MIPMAP_NEAREST: 'LinearMipmapNearestFilter',
    LINEAR_MIPMAP_LINEAR: 'LinearMipmapLinearFilter'
};

// 纹理包裹
export const TextureWrap = {
    REPEAT: 'RepeatWrapping',
    CLAMP: 'ClampToEdgeWrapping',
    MIRROR: 'MirroredRepeatWrapping'
};

// 混合模式
export const BlendMode = {
    NORMAL: 'NormalBlending',
    ADDITIVE: 'AdditiveBlending',
    SUBTRACTIVE: 'SubtractiveBlending',
    MULTIPLY: 'MultiplyBlending'
};

// 组件状态
export const ComponentState = {
    CREATED: 'created',
    MOUNTED: 'mounted',
    UPDATED: 'updated',
    DISPOSED: 'disposed'
};

// 资源类型
export const ResourceType = {
    TEXTURE: 'texture',
    MODEL: 'model',
    AUDIO: 'audio',
    VIDEO: 'video',
    JSON: 'json'
};

// 动画循环模式
export const LoopMode = {
    ONCE: 'LoopOnce',
    REPEAT: 'LoopRepeat',
    PING_PONG: 'LoopPingPong'
};

export default {
    VERSION,
    BUILD_DATE,
    RenderMode,
    ShadowType,
    TextureFilter,
    TextureWrap,
    BlendMode,
    ComponentState,
    ResourceType,
    LoopMode
};
