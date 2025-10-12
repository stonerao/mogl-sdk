/**
 * ProgressTracker 进度跟踪器
 *
 * @class ProgressTracker
 * @description 资源加载进度跟踪
 */
export class ProgressTracker {
    constructor() {
        this.total = 0;
        this.loaded = 0;
        this.items = new Map();
    }

    /**
     * 添加项目
     *
     * @param {string} id - 项目 ID
     * @param {number} size - 大小
     */
    addItem(id, size = 1) {
        this.items.set(id, { size, loaded: 0 });
        this.total += size;
    }

    /**
     * 更新进度
     *
     * @param {string} id - 项目 ID
     * @param {number} loaded - 已加载大小
     */
    updateProgress(id, loaded) {
        const item = this.items.get(id);
        if (item) {
            const delta = loaded - item.loaded;
            item.loaded = loaded;
            this.loaded += delta;
        }
    }

    /**
     * 获取总进度
     *
     * @returns {number} 进度 (0-1)
     */
    getProgress() {
        return this.total > 0 ? this.loaded / this.total : 0;
    }

    /**
     * 重置
     */
    reset() {
        this.total = 0;
        this.loaded = 0;
        this.items.clear();
    }
}

export default ProgressTracker;
