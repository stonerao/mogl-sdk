/**
 * Stats 统计信息
 *
 * @class Stats
 * @description FPS 和性能统计
 */
export class Stats {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
    }

    /**
     * 更新统计
     */
    update() {
        this.frameCount++;
        const currentTime = performance.now();
        const delta = currentTime - this.lastTime;

        if (delta >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / delta);
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    /**
     * 获取 FPS
     *
     * @returns {number} FPS
     */
    getFPS() {
        return this.fps;
    }
}

export default Stats;
