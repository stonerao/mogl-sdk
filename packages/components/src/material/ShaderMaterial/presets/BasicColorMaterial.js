import * as THREE from 'three';

/**
 * 基础颜色材质预设
 * 
 * 特性：
 * - 单色着色
 * - 简单的漫反射光照
 * - 支持自定义颜色
 * 
 * @param {Object} params - 材质参数
 * @param {string|number} params.color - 材质颜色，默认 '#00ff00'
 * @returns {Object} 材质配置对象
 * 
 * @example
 * const config = createBasicColorMaterial({ color: '#ff0000' });
 */
export function createBasicColorMaterial(params = {}) {
    const {
        color = '#00ff00'
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
            uniform vec3 color;
            varying vec2 vUv;
            varying vec3 vNormal;
            
            void main() {
                // 简单的漫反射光照
                vec3 light = normalize(vec3(1.0, 1.0, 1.0));
                float dProd = max(0.0, dot(vNormal, light));
                
                // 环境光 + 漫反射光
                vec3 finalColor = color * (0.3 + 0.7 * dProd);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        uniforms: {
            color: { value: new THREE.Color(color) }
        },
        side: THREE.DoubleSide
    };
}

/**
 * 获取材质的默认参数
 * @returns {Object} 默认参数对象
 */
export function getBasicColorMaterialDefaults() {
    return {
        color: '#00ff00'
    };
}

/**
 * 材质元数据
 */
export const BasicColorMaterialMeta = {
    name: 'basicColor',
    displayName: '基础颜色材质',
    description: '单色着色材质，带有简单的漫反射光照效果',
    params: {
        color: {
            type: 'color',
            default: '#00ff00',
            description: '材质颜色'
        }
    }
};

