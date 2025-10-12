/**
 * ColorUtils 颜色工具
 *
 * @description 颜色处理相关的工具函数
 */
export class ColorUtils {
    /**
     * 十六进制转 RGB
     *
     * @param {string} hex - 十六进制颜色
     * @returns {Object} RGB 对象 {r, g, b}
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
              }
            : null;
    }

    /**
     * RGB 转十六进制
     *
     * @param {number} r - 红色 (0-255)
     * @param {number} g - 绿色 (0-255)
     * @param {number} b - 蓝色 (0-255)
     * @returns {string} 十六进制颜色
     */
    static rgbToHex(r, g, b) {
        return (
            '#' +
            [r, g, b]
                .map((x) => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                })
                .join('')
        );
    }

    /**
     * 颜色插值
     *
     * @param {string} color1 - 颜色1
     * @param {string} color2 - 颜色2
     * @param {number} t - 插值系数 (0-1)
     * @returns {string} 插值后的颜色
     */
    static lerp(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);

        if (!c1 || !c2) return color1;

        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);

        return this.rgbToHex(r, g, b);
    }
}

export default ColorUtils;
