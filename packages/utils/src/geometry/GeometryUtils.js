/**
 * GeometryUtils 几何工具
 *
 * @description 几何计算相关的工具函数
 */
export class GeometryUtils {
    /**
     * 计算三角形面积
     *
     * @param {Object} p1 - 点1
     * @param {Object} p2 - 点2
     * @param {Object} p3 - 点3
     * @returns {number} 面积
     */
    static triangleArea(p1, p2, p3) {
        const a = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const b = Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));
        const c = Math.sqrt(Math.pow(p1.x - p3.x, 2) + Math.pow(p1.y - p3.y, 2));
        const s = (a + b + c) / 2;
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    }

    /**
     * 判断点是否在多边形内
     *
     * @param {Object} point - 点 {x, y}
     * @param {Array} polygon - 多边形顶点数组
     * @returns {boolean} 是否在内部
     */
    static isPointInPolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x,
                yi = polygon[i].y;
            const xj = polygon[j].x,
                yj = polygon[j].y;

            const intersect =
                yi > point.y !== yj > point.y &&
                point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
            if (intersect) inside = !inside;
        }
        return inside;
    }
}

export default GeometryUtils;
