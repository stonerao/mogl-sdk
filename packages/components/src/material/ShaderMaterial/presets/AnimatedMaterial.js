import * as THREE from 'three';

/**
 * 动画材质预设
 * 
 * 特性：
 * - 波浪动画效果
 * - 使用 time uniform 实现动画
 * - 简单的漫反射光照
 * - 支持自定义颜色和动画速度
 * 
 * @param {Object} params - 材质参数
 * @param {string|number} params.color - 材质颜色，默认 '#00ff00'
 * @param {number} params.speed - 动画速度，默认 1.0
 * @returns {Object} 材质配置对象
 * 
 * @example
 * const config = createAnimatedMaterial({
 *     color: '#00ff00',
 *     speed: 2.0
 * });
 */
export function createAnimatedMaterial(params = {}) {
    const {
        color = '#00ff00',
        speed = 1.0
    } = params;

    return {
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            uniform float speed;
            varying vec2 vUv;
            varying vec3 vNormal;
            
            void main() {
                // 波浪动画效果
                float wave = sin(vUv.x * 10.0 + time * speed) * 0.5 + 0.5;
                vec3 animatedColor = color * wave;
                
                // 简单的漫反射光照
                vec3 light = normalize(vec3(1.0, 1.0, 1.0));
                float dProd = max(0.0, dot(vNormal, light));
                
                // 环境光 + 漫反射光
                vec3 finalColor = animatedColor * (0.3 + 0.7 * dProd);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        uniforms: {
            time: { value: 0.0 },  // 自动更新
            color: { value: new THREE.Color(color) },
            speed: { value: speed }
        },
        side: THREE.DoubleSide
    };
}

/**
 * 获取材质的默认参数
 * @returns {Object} 默认参数对象
 */
export function getAnimatedMaterialDefaults() {
    return {
        color: '#00ff00',
        speed: 1.0
    };
}

/**
 * 材质元数据
 */
export const AnimatedMaterialMeta = {
    name: 'animated',
    displayName: '动画材质',
    description: '波浪动画材质，使用 time uniform 实现动画效果，带有简单的漫反射光照',
    params: {
        color: {
            type: 'color',
            default: '#00ff00',
            description: '材质颜色'
        },
        speed: {
            type: 'number',
            default: 1.0,
            min: 0.1,
            max: 5.0,
            step: 0.1,
            description: '动画速度'
        }
    }
};

