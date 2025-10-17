import * as THREE from 'three';

/**
 * 渐变材质预设
 * 
 * 特性：
 * - 双色渐变效果
 * - 基于 UV 坐标的颜色混合
 * - 简单的漫反射光照
 * - 支持自定义两种颜色
 * 
 * @param {Object} params - 材质参数
 * @param {string|number} params.color1 - 渐变起始颜色，默认 '#ff0000'
 * @param {string|number} params.color2 - 渐变结束颜色，默认 '#0000ff'
 * @returns {Object} 材质配置对象
 * 
 * @example
 * const config = createGradientMaterial({
 *     color1: '#ff0000',
 *     color2: '#0000ff'
 * });
 */
export function createGradientMaterial(params = {}) {
    const {
        color1 = '#ff0000',
        color2 = '#0000ff'
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
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            varying vec3 vNormal;
            
            void main() {
                // 基于 UV 坐标的颜色混合
                vec3 color = mix(color1, color2, vUv.y);
                
                // 简单的漫反射光照
                vec3 light = normalize(vec3(1.0, 1.0, 1.0));
                float dProd = max(0.0, dot(vNormal, light));
                
                // 环境光 + 漫反射光
                vec3 finalColor = color * (0.3 + 0.7 * dProd);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        uniforms: {
            color1: { value: new THREE.Color(color1) },
            color2: { value: new THREE.Color(color2) }
        },
        side: THREE.DoubleSide
    };
}

/**
 * 获取材质的默认参数
 * @returns {Object} 默认参数对象
 */
export function getGradientMaterialDefaults() {
    return {
        color1: '#ff0000',
        color2: '#0000ff'
    };
}

/**
 * 材质元数据
 */
export const GradientMaterialMeta = {
    name: 'gradient',
    displayName: '渐变材质',
    description: '双色渐变材质，基于 UV 坐标混合颜色，带有简单的漫反射光照效果',
    params: {
        color1: {
            type: 'color',
            default: '#ff0000',
            description: '渐变起始颜色'
        },
        color2: {
            type: 'color',
            default: '#0000ff',
            description: '渐变结束颜色'
        }
    }
};

