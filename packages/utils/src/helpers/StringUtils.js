/**
 * StringUtils 字符串工具
 *
 * @description 字符串操作相关的工具函数
 */
export class StringUtils {
    /**
     * 驼峰转短横线
     *
     * @param {string} str - 字符串
     * @returns {string} 转换后的字符串
     */
    static camelToKebab(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * 短横线转驼峰
     *
     * @param {string} str - 字符串
     * @returns {string} 转换后的字符串
     */
    static kebabToCamel(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }

    /**
     * 首字母大写
     *
     * @param {string} str - 字符串
     * @returns {string} 转换后的字符串
     */
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * 生成随机字符串
     *
     * @param {number} length - 长度
     * @returns {string} 随机字符串
     */
    static random(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

export default StringUtils;
