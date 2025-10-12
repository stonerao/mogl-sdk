/**
 * Performance 性能监控
 *
 * @class Performance
 * @description 性能监控工具
 */
export class Performance {
    constructor() {
        this.marks = new Map();
        this.measures = new Map();
    }

    /**
     * 标记时间点
     *
     * @param {string} name - 标记名称
     */
    mark(name) {
        this.marks.set(name, performance.now());
    }

    /**
     * 测量时间差
     *
     * @param {string} name - 测量名称
     * @param {string} startMark - 开始标记
     * @param {string} endMark - 结束标记
     * @returns {number} 时间差（毫秒）
     */
    measure(name, startMark, endMark) {
        const start = this.marks.get(startMark);
        const end = this.marks.get(endMark);

        if (start && end) {
            const duration = end - start;
            this.measures.set(name, duration);
            return duration;
        }

        return 0;
    }

    /**
     * 获取测量结果
     *
     * @param {string} name - 测量名称
     * @returns {number} 时间（毫秒）
     */
    getMeasure(name) {
        return this.measures.get(name) || 0;
    }

    /**
     * 清除所有标记和测量
     */
    clear() {
        this.marks.clear();
        this.measures.clear();
    }
}

export default Performance;
