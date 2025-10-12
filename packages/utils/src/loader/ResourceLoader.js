/**
 * ResourceLoader 资源加载器
 *
 * @class ResourceLoader
 * @description 通用资源加载器
 */
export class ResourceLoader {
    /**
     * 加载 JSON
     *
     * @param {string} url - URL
     * @returns {Promise<Object>} JSON 对象
     */
    static async loadJSON(url) {
        const response = await fetch(url);
        return response.json();
    }

    /**
     * 加载文本
     *
     * @param {string} url - URL
     * @returns {Promise<string>} 文本内容
     */
    static async loadText(url) {
        const response = await fetch(url);
        return response.text();
    }

    /**
     * 加载图片
     *
     * @param {string} url - URL
     * @returns {Promise<HTMLImageElement>} 图片元素
     */
    static loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
}

export default ResourceLoader;
