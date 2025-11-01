/**
 * 画布状态管理
 *
 * @description 管理画布的状态，包括缩放、平移、尺寸等
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCanvasStore = defineStore('canvas', () => {
    // ========== 状态 ==========

    // 画布尺寸
    const canvasWidth = ref(1920);
    const canvasHeight = ref(1080);

    // 画布缩放级别（1.0 = 100%）
    const zoom = ref(1.0);

    // 最小和最大缩放级别
    const minZoom = ref(0.1);
    const maxZoom = ref(5.0);

    // 画布平移偏移量
    const panOffset = ref({ x: 0, y: 0 });

    // 画布背景颜色
    const backgroundColor = ref('#1e1e1e');

    // 是否显示网格
    const showGrid = ref(true);

    // 网格大小
    const gridSize = ref(20);

    // 网格颜色
    const gridColor = ref('#2a2a2a');
    const gridColorStrong = ref('#3a3a3a');

    // 是否正在平移画布
    const isPanning = ref(false);

    // 是否正在框选
    const isBoxSelecting = ref(false);

    // 框选区域
    const selectionBox = ref({
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0
    });

    // 画布容器尺寸（视口尺寸）
    const containerWidth = ref(0);
    const containerHeight = ref(0);

    // ========== 计算属性 ==========

    // 缩放百分比
    const zoomPercent = computed(() => Math.round(zoom.value * 100));

    // 是否可以放大
    const canZoomIn = computed(() => zoom.value < maxZoom.value);

    // 是否可以缩小
    const canZoomOut = computed(() => zoom.value > minZoom.value);

    // 画布实际显示尺寸（考虑缩放）
    const displayWidth = computed(() => canvasWidth.value * zoom.value);
    const displayHeight = computed(() => canvasHeight.value * zoom.value);

    // 画布中心点（用于居中显示）
    const centerX = computed(() => containerWidth.value / 2);
    const centerY = computed(() => containerHeight.value / 2);

    // ========== 方法 ==========

    /**
   * 设置画布尺寸
   * @param {Number} width - 宽度
   * @param {Number} height - 高度
   */
    function setCanvasSize(width, height) {
        canvasWidth.value = width;
        canvasHeight.value = height;
    }

    /**
   * 设置容器尺寸
   * @param {Number} width - 宽度
   * @param {Number} height - 高度
   */
    function setContainerSize(width, height) {
        containerWidth.value = width;
        containerHeight.value = height;
    }

    /**
   * 设置缩放级别
   * @param {Number} value - 缩放值
   * @param {Object} center - 缩放中心点 { x, y }
   */
    function setZoom(value, center = null) {
        const oldZoom = zoom.value;
        const newZoom = Math.max(minZoom.value, Math.min(maxZoom.value, value));

        if (center) {
            // 以指定点为中心缩放
            const zoomRatio = newZoom / oldZoom;
            panOffset.value.x = center.x - (center.x - panOffset.value.x) * zoomRatio;
            panOffset.value.y = center.y - (center.y - panOffset.value.y) * zoomRatio;
        }

        zoom.value = newZoom;
    }

    /**
   * 放大画布
   * @param {Number} step - 缩放步长（默认 0.1）
   */
    function zoomIn(step = 0.1) {
        setZoom(zoom.value + step);
    }

    /**
   * 缩小画布
   * @param {Number} step - 缩放步长（默认 0.1）
   */
    function zoomOut(step = 0.1) {
        setZoom(zoom.value - step);
    }

    /**
   * 重置缩放到 100%
   */
    function resetZoom() {
        setZoom(1.0);
    }

    /**
   * 适应画布到视口
   */
    function fitToView() {
        const scaleX = containerWidth.value / canvasWidth.value;
        const scaleY = containerHeight.value / canvasHeight.value;
        const scale = Math.min(scaleX, scaleY) * 0.9; // 留 10% 边距

        setZoom(scale);
        centerCanvas();
    }

    /**
   * 居中画布
   */
    function centerCanvas() {
        panOffset.value.x = (containerWidth.value - displayWidth.value) / 2;
        panOffset.value.y = (containerHeight.value - displayHeight.value) / 2;
    }

    /**
   * 设置平移偏移量
   * @param {Number} x - X 偏移
   * @param {Number} y - Y 偏移
   */
    function setPanOffset(x, y) {
        panOffset.value.x = x;
        panOffset.value.y = y;
    }

    /**
   * 平移画布
   * @param {Number} deltaX - X 方向移动距离
   * @param {Number} deltaY - Y 方向移动距离
   */
    function pan(deltaX, deltaY) {
        panOffset.value.x += deltaX;
        panOffset.value.y += deltaY;
    }

    /**
   * 开始平移
   */
    function startPanning() {
        isPanning.value = true;
    }

    /**
   * 结束平移
   */
    function endPanning() {
        isPanning.value = false;
    }

    /**
   * 设置背景颜色
   * @param {String} color - 颜色值
   */
    function setBackgroundColor(color) {
        backgroundColor.value = color;
    }

    /**
   * 切换网格显示
   */
    function toggleGrid() {
        showGrid.value = !showGrid.value;
    }

    /**
   * 设置网格大小
   * @param {Number} size - 网格大小
   */
    function setGridSize(size) {
        gridSize.value = size;
    }

    /**
   * 开始框选
   * @param {Number} x - 起始 X 坐标
   * @param {Number} y - 起始 Y 坐标
   */
    function startBoxSelection(x, y) {
        isBoxSelecting.value = true;
        selectionBox.value = {
            startX: x,
            startY: y,
            endX: x,
            endY: y
        };
    }

    /**
   * 更新框选区域
   * @param {Number} x - 当前 X 坐标
   * @param {Number} y - 当前 Y 坐标
   */
    function updateBoxSelection(x, y) {
        if (isBoxSelecting.value) {
            selectionBox.value.endX = x;
            selectionBox.value.endY = y;
        }
    }

    /**
   * 结束框选
   */
    function endBoxSelection() {
        isBoxSelecting.value = false;
    }

    /**
   * 屏幕坐标转画布坐标
   * @param {Number} screenX - 屏幕 X 坐标
   * @param {Number} screenY - 屏幕 Y 坐标
   * @returns {Object} 画布坐标 { x, y }
   */
    function screenToCanvas(screenX, screenY) {
        return {
            x: (screenX - panOffset.value.x) / zoom.value,
            y: (screenY - panOffset.value.y) / zoom.value
        };
    }

    /**
   * 画布坐标转屏幕坐标
   * @param {Number} canvasX - 画布 X 坐标
   * @param {Number} canvasY - 画布 Y 坐标
   * @returns {Object} 屏幕坐标 { x, y }
   */
    function canvasToScreen(canvasX, canvasY) {
        return {
            x: canvasX * zoom.value + panOffset.value.x,
            y: canvasY * zoom.value + panOffset.value.y
        };
    }

    // ========== 返回 ==========
    return {
    // 状态
        canvasWidth,
        canvasHeight,
        canvasSize: {
            width: canvasWidth,
            height: canvasHeight
        },
        zoom,
        minZoom,
        maxZoom,
        panOffset,
        backgroundColor,
        showGrid,
        gridSize,
        gridColor,
        gridColorStrong,
        isPanning,
        isBoxSelecting,
        selectionBox,
        containerWidth,
        containerHeight,

        // 计算属性
        zoomPercent,
        canZoomIn,
        canZoomOut,
        displayWidth,
        displayHeight,
        centerX,
        centerY,

        // 方法
        setCanvasSize,
        setContainerSize,
        setZoom,
        zoomIn,
        zoomOut,
        resetZoom,
        fitToView,
        centerCanvas,
        setPanOffset,
        pan,
        startPanning,
        endPanning,
        setBackgroundColor,
        toggleGrid,
        setGridSize,
        startBoxSelection,
        updateBoxSelection,
        endBoxSelection,
        screenToCanvas,
        canvasToScreen
    };
});

