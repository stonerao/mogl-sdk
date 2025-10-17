import * as THREE from 'three';

/**
 * 扩散材质预设
 *
 * 基于 Shadertoy "Noise animation - Electric" by nimitz
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
 *
 * 特性：
 * - 电流扩散效果
 * - 使用噪声纹理生成复杂的动画
 * - 双重分形布朗运动 (Dual FBM) 算法
 * - 圆形扭曲效果
 * - 支持自定义速度、强度和颜色
 *
 * 工作原理：
 * 1. 使用噪声纹理作为基础随机源
 * 2. 通过分形布朗运动 (FBM) 生成多层次的噪声
 * 3. 使用双重 FBM 创建更复杂的扭曲效果
 * 4. 应用圆形扭曲和时间动画
 * 5. 通过颜色除法创建明亮的电流效果
 *
 * @param {Object} params - 材质参数
 * @param {number} params.speed - 动画速度，默认 1.0
 * @param {number} params.intensity - 强度，默认 1.0
 * @param {string|number} params.baseColor - 基础颜色，默认 '#3319cc' (对应 vec3(0.2, 0.1, 0.4))
 * @param {string} params.noiseTexture - 噪声纹理路径，默认 '/images/n_3.png'
 * @returns {Object} 材质配置对象
 *
 * @example
 * const config = createDiffusionMaterial({
 *     speed: 2.0,
 *     intensity: 1.5,
 *     baseColor: '#ff00ff'
 * });
 */
export function createDiffusionMaterial(params = {}) {
    const {
        speed = 1.0,
        intensity = 1.0,
        baseColor = '#3319cc', // vec3(0.2, 0.1, 0.4) 的十六进制近似值
        noiseTexture = '/images/n_3.png'
    } = params;

    // 加载噪声纹理
    const textureLoader = new THREE.TextureLoader();
    const noiseTextureObj = textureLoader.load(noiseTexture);
    noiseTextureObj.wrapS = THREE.RepeatWrapping;
    noiseTextureObj.wrapT = THREE.RepeatWrapping;

    return {
        vertexShader: `
            varying vec2 vUv;
            varying vec2 vPosition;

            void main() {
                vUv = uv;
                // 传递屏幕空间位置用于 fragment shader
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vPosition = mvPosition.xy;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec2 uResolution;
            uniform sampler2D uNoiseTexture;
            uniform float uSpeed;
            uniform float uIntensity;
            uniform vec3 uBaseColor;

            varying vec2 vUv;
            varying vec2 vPosition;

            #define tau 6.2831853

            // 创建 2D 旋转矩阵
            mat2 makem2(in float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat2(c, -s, s, c);
            }

            // 噪声函数 - 从纹理采样
            float noise(in vec2 x) {
                return texture2D(uNoiseTexture, x * 0.01).x;
            }

            // 分形布朗运动 (Fractal Brownian Motion)
            // 通过叠加多个不同频率的噪声层来创建复杂的图案
            float fbm(in vec2 p) {
                float z = 2.0;
                float rz = 0.0;
                vec2 bp = p;

                // 叠加 5 层噪声
                for (float i = 1.0; i < 6.0; i++) {
                    // 累加噪声值，每层的振幅递减
                    rz += abs((noise(p) - 0.5) * 2.0) / z;
                    z = z * 2.0;
                    p = p * 2.0;
                }
                return rz;
            }

            // 双重分形布朗运动
            // 使用两个 FBM 的结果作为扭曲基础，创建更复杂的动画效果
            float dualfbm(in vec2 p, float time) {
                // 创建扭曲基础
                vec2 p2 = p * 0.7;
                vec2 basis = vec2(
                    fbm(p2 - time * 1.6),
                    fbm(p2 + time * 1.7)
                );
                basis = (basis - 0.5) * 0.2;
                p += basis;

                // 应用旋转并返回最终的 FBM 值
                return fbm(p * makem2(time * 0.2));
            }

            // 圆形扭曲函数
            // 创建从中心向外扩散的圆形图案
            float circ(vec2 p) {
                float r = length(p);
                r = log(sqrt(r));
                return abs(mod(r * 4.0, tau) - 3.14) * 3.0 + 0.2;
            }

            void main() {
                // 计算时间（应用速度参数）
                float uTime = time * 0.15 * uSpeed;

                // 将 UV 坐标转换为中心对称的坐标系统
                vec2 p = vUv - 0.5;

                // 如果有分辨率信息，应用宽高比修正
                // 否则使用默认的正方形比例
                if (uResolution.x > 0.0 && uResolution.y > 0.0) {
                    p.x *= uResolution.x / uResolution.y;
                }

                // 缩放坐标
                p *= 4.0;

                // 计算双重 FBM 值
                float rz = dualfbm(p, uTime);

                // 应用周期性缩放动画
                p /= exp(mod(uTime * 10.0, 3.14159));

                // 应用圆形扭曲效果
                rz *= pow(abs(0.1 - circ(p)), 0.9);

                // 通过颜色除法创建明亮的电流效果
                // 较小的 rz 值会产生更亮的颜色
                vec3 col = (uBaseColor * uIntensity) / rz;

                // 应用颜色校正
                col = pow(abs(col), vec3(0.99));

                gl_FragColor = vec4(col, 1.0);
            }
        `,
        uniforms: {
            time: { value: 0.0 }, // 自动更新
            uResolution: { value: new THREE.Vector2(512, 512) },
            uNoiseTexture: { value: noiseTextureObj },
            uSpeed: { value: speed },
            uIntensity: { value: intensity },
            uBaseColor: { value: new THREE.Color(baseColor) }
        },
        side: THREE.DoubleSide,
        // 添加混合模式以获得更好的视觉效果
        transparent: false,
        depthWrite: true
    };
}

/**
 * 获取材质的默认参数
 * @returns {Object} 默认参数对象
 */
export function getDiffusionMaterialDefaults() {
    return {
        speed: 1.0,
        intensity: 1.0,
        baseColor: '#3319cc',
        noiseTexture: '/images/n_3.png'
    };
}

/**
 * 材质元数据
 */
export const DiffusionMaterialMeta = {
    name: 'diffusion',
    displayName: '扩散材质',
    description: '电流扩散效果材质，使用双重分形布朗运动和噪声纹理创建复杂的动画效果',
    author: 'Based on "Noise animation - Electric" by nimitz (stormoid.com)',
    license: 'CC BY-NC-SA 3.0',
    params: {
        speed: {
            type: 'number',
            default: 1.0,
            min: 0.1,
            max: 5.0,
            step: 0.1,
            description: '动画速度'
        },
        intensity: {
            type: 'number',
            default: 1.0,
            min: 0.1,
            max: 3.0,
            step: 0.1,
            description: '效果强度'
        },
        baseColor: {
            type: 'color',
            default: '#3319cc',
            description: '基础颜色'
        },
        noiseTexture: {
            type: 'string',
            default: '/images/n_3.png',
            description: '噪声纹理路径'
        }
    }
};
