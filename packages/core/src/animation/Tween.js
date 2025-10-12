/**
 * Tween 补间动画
 *
 * @class Tween
 * @description 简单的补间动画实现
 */
export class Tween {
    /**
     * 创建补间动画实例
     *
     * @param {Object} target - 目标对象
     * @param {Object} to - 目标属性
     * @param {number} duration - 持续时间（毫秒）
     * @param {Object} options - 选项
     */
    constructor(target, to, duration, options = {}) {
        this.target = target;
        this.to = to;
        this.duration = duration;
        this.options = {
            easing: 'linear',
            onUpdate: null,
            onComplete: null,
            ...options
        };

        // 起始值
        this.from = {};
        Object.keys(to).forEach((key) => {
            this.from[key] = target[key];
        });

        // 状态
        this.isPlaying = false;
        this.startTime = 0;
        this.elapsed = 0;
    }

    /**
     * 开始动画
     */
    start() {
        this.isPlaying = true;
        this.startTime = Date.now();
        this.update();
    }

    /**
     * 停止动画
     */
    stop() {
        this.isPlaying = false;
    }

    /**
     * 更新动画
     */
    update() {
        if (!this.isPlaying) return;

        this.elapsed = Date.now() - this.startTime;
        const progress = Math.min(this.elapsed / this.duration, 1);

        // 应用缓动函数
        const easedProgress = this.ease(progress);

        // 更新目标属性
        Object.keys(this.to).forEach((key) => {
            const from = this.from[key];
            const to = this.to[key];
            this.target[key] = from + (to - from) * easedProgress;
        });

        // 调用更新回调
        if (this.options.onUpdate) {
            this.options.onUpdate(this.target, progress);
        }

        // 检查是否完成
        if (progress >= 1) {
            this.isPlaying = false;
            if (this.options.onComplete) {
                this.options.onComplete(this.target);
            }
        } else {
            requestAnimationFrame(() => this.update());
        }
    }

    /**
     * 缓动函数
     *
     * @param {number} t - 进度（0-1）
     * @returns {number} 缓动后的进度
     */
    ease(t) {
        const easing = this.options.easing;

        switch (easing) {
            case 'linear':
                return t;
            case 'easeInQuad':
                return t * t;
            case 'easeOutQuad':
                return t * (2 - t);
            case 'easeInOutQuad':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            case 'easeInCubic':
                return t * t * t;
            case 'easeOutCubic':
                return --t * t * t + 1;
            case 'easeInOutCubic':
                return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
            default:
                return t;
        }
    }

    /**
     * 创建补间动画（静态方法）
     *
     * @param {Object} target - 目标对象
     * @param {Object} to - 目标属性
     * @param {number} duration - 持续时间
     * @param {Object} options - 选项
     * @returns {Tween} 补间动画实例
     */
    static to(target, to, duration, options) {
        const tween = new Tween(target, to, duration, options);
        tween.start();
        return tween;
    }
}
