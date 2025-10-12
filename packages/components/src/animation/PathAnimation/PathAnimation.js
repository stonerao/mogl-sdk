import { Component } from '@w3d/core';
import * as THREE from 'three';

/**
 * PathAnimation 路径动画组件
 *
 * @class PathAnimation
 * @extends Component
 * @description 沿路径移动的动画
 */
export class PathAnimation extends Component {
    static defaultConfig = {
        path: [],
        speed: 1.0, // 移动速度 (单位/秒)
        loop: true, // 是否循环
        pingPong: false, // 往返模式
        autoStart: false, // 自动开始
        lookAtDirection: 'forward', // 朝向模式: 'forward', 'backward', 'up', 'down', 'fixed', 'custom'
        customRotation: [0, 0, 0], // 自定义旋转角度 (弧度)
        easing: 'linear', // 缓动函数: 'linear', 'easeIn', 'easeOut', 'easeInOut'
        showPath: true, // 显示路径轨迹
        pathColor: '#00ff88', // 路径颜色
        pathWidth: 2 // 路径线宽
    };

    onMounted() {
        if (this.config.path.length < 2) {
            console.warn('PathAnimation: path must have at least 2 points');
            return;
        }

        // 创建路径曲线
        this.createPath();

        // 创建路径可视化
        if (this.config.showPath) {
            this.createPathVisualization();
        }

        // 初始化动画状态
        this.isPlaying = false;
        this.isPaused = false;
        this.progress = 0;
        this.totalDistance = 0;
        this.currentDistance = 0;
        this.direction = 1; // 1: 正向, -1: 反向 (用于往返模式)
        this.startTime = 0;
        this.pausedTime = 0;

        // 计算路径总长度
        this.calculateTotalDistance();

        // 设置初始位置
        this.setPositionAtProgress(0);

        if (this.config.autoStart) {
            this.play();
        }
    }

    createPath() {
        const points = this.config.path.map(
            (p) => new THREE.Vector3(p.x || p[0], p.y || p[1], p.z || p[2])
        );
        this.curve = new THREE.CatmullRomCurve3(points, false); // false = 不闭合
        this.pathPoints = points;
    }

    createPathVisualization() {
        if (this.pathLine) {
            // 从场景中移除旧的路径线条
            this.scene.scene.remove(this.pathLine);
        }

        // 创建路径线条
        const points = this.curve.getPoints(100);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: this.config.pathColor,
            linewidth: this.config.pathWidth
        });

        this.pathLine = new THREE.Line(geometry, material);
        // 直接添加到场景中，而不是添加到组件中
        this.scene.scene.add(this.pathLine);

        // 创建路径点标记
        this.createPathMarkers();
    }

    createPathMarkers() {
        if (this.pathMarkers) {
            // 从场景中移除旧的标记点
            this.pathMarkers.forEach((marker) => this.scene.scene.remove(marker));
        }

        this.pathMarkers = [];
        const markerGeometry = new THREE.SphereGeometry(0.2, 8, 6);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: this.config.pathColor });

        this.pathPoints.forEach((point, index) => {
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.copy(point);
            // 直接添加到场景中，而不是添加到组件中
            this.scene.scene.add(marker);
            this.pathMarkers.push(marker);
        });
    }

    calculateTotalDistance() {
        this.totalDistance = this.curve.getLength();
    }

    play() {
        if (this.isPaused) {
            // 从暂停状态恢复
            this.startTime = Date.now() - this.pausedTime;
            this.isPaused = false;
        } else {
            // 重新开始
            this.startTime = Date.now();
        }
        this.isPlaying = true;
        this.emit('play');
    }

    pause() {
        if (this.isPlaying) {
            this.isPlaying = false;
            this.isPaused = true;
            this.pausedTime = Date.now() - this.startTime;
            this.emit('pause');
        }
    }

    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        this.progress = 0;
        this.currentDistance = 0;
        this.direction = 1;
        this.setPositionAtProgress(0);
        this.emit('stop');
    }

    reset() {
        this.stop();
        this.emit('reset');
    }

    // 缓动函数
    applyEasing(t) {
        switch (this.config.easing) {
            case 'easeIn':
                return t * t;
            case 'easeOut':
                return 1 - (1 - t) * (1 - t);
            case 'easeInOut':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            case 'linear':
            default:
                return t;
        }
    }

    setPositionAtProgress(progress) {
        if (!this.curve) return;

        const easedProgress = this.applyEasing(progress);
        const point = this.curve.getPoint(easedProgress);
        this.position.copy(point);

        // 设置朝向
        this.updateLookAt(easedProgress);

        this.emit('update', {
            progress: progress,
            easedProgress: easedProgress,
            point: point.clone(),
            currentDistance: this.currentDistance,
            totalDistance: this.totalDistance
        });
    }

    updateLookAt(progress) {
        const direction = this.config.lookAtDirection;

        if (direction === 'fixed') {
            // 保持固定朝向，不改变旋转
            return;
        }

        if (direction === 'custom') {
            // 使用自定义旋转角度
            this.rotation.set(
                this.config.customRotation[0],
                this.config.customRotation[1],
                this.config.customRotation[2]
            );
            return;
        }

        // 计算运动方向
        let lookAtPoint;
        const currentPoint = this.curve.getPoint(progress);

        if (direction === 'forward') {
            const nextProgress = Math.min(progress + 0.01, 1);
            lookAtPoint = this.curve.getPoint(nextProgress);
        } else if (direction === 'backward') {
            const prevProgress = Math.max(progress - 0.01, 0);
            lookAtPoint = this.curve.getPoint(prevProgress);
        } else if (direction === 'up') {
            lookAtPoint = currentPoint.clone().add(new THREE.Vector3(0, 1, 0));
        } else if (direction === 'down') {
            lookAtPoint = currentPoint.clone().add(new THREE.Vector3(0, -1, 0));
        }

        if (lookAtPoint && !lookAtPoint.equals(currentPoint)) {
            this.lookAt(lookAtPoint);
        }
    }

    onUpdate(deltaTime) {
        if (!this.isPlaying || !this.curve) return;

        // 计算移动距离
        const moveDistance = this.config.speed * deltaTime;
        this.currentDistance += moveDistance * this.direction;

        // 计算进度
        let newProgress = this.currentDistance / this.totalDistance;

        // 处理循环和往返模式
        if (this.config.pingPong) {
            // 往返模式
            if (newProgress >= 1) {
                newProgress = 1;
                this.direction = -1;
                this.emit('reachEnd');
            } else if (newProgress <= 0) {
                newProgress = 0;
                this.direction = 1;
                this.emit('reachStart');
            }
        } else if (this.config.loop) {
            // 循环模式
            if (newProgress >= 1) {
                newProgress = 0;
                this.currentDistance = 0;
                this.emit('complete');
            }
        } else {
            // 单次播放
            if (newProgress >= 1) {
                newProgress = 1;
                this.stop();
                this.emit('complete');
                return;
            }
        }

        this.progress = newProgress;
        this.setPositionAtProgress(this.progress);
    }

    // 跳转到指定进度
    jumpToProgress(progress) {
        progress = Math.max(0, Math.min(1, progress));
        this.progress = progress;
        this.currentDistance = progress * this.totalDistance;
        this.setPositionAtProgress(progress);
        this.emit('jump', { progress });
    }

    // 跳转到指定路径点
    jumpToPoint(pointIndex) {
        if (pointIndex < 0 || pointIndex >= this.pathPoints.length) {
            console.warn('PathAnimation: Invalid point index');
            return;
        }

        const progress = pointIndex / (this.pathPoints.length - 1);
        this.jumpToProgress(progress);
    }

    // 更新路径
    updatePath(newPath) {
        this.config.path = newPath;
        this.createPath();
        this.calculateTotalDistance();

        if (this.config.showPath) {
            this.createPathVisualization();
        }

        // 重置到起始位置
        this.reset();
        this.emit('pathUpdated');
    }

    // 添加路径点
    addPathPoint(point, index = -1) {
        if (index === -1) {
            this.config.path.push(point);
        } else {
            this.config.path.splice(index, 0, point);
        }
        this.updatePath(this.config.path);
    }

    // 删除路径点
    removePathPoint(index) {
        if (this.config.path.length <= 2) {
            console.warn('PathAnimation: Cannot remove point, minimum 2 points required');
            return;
        }

        this.config.path.splice(index, 1);
        this.updatePath(this.config.path);
    }

    // 更新配置
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);

        if (newConfig.path) {
            this.updatePath(newConfig.path);
        }

        if (newConfig.showPath !== undefined) {
            if (newConfig.showPath && !this.pathLine) {
                this.createPathVisualization();
            } else if (!newConfig.showPath && this.pathLine) {
                // 从场景中移除路径可视化
                this.scene.scene.remove(this.pathLine);
                this.pathMarkers?.forEach((marker) => this.scene.scene.remove(marker));
                this.pathLine = null;
                this.pathMarkers = null;
            }
        }

        this.emit('configUpdated', newConfig);
    }

    // 获取状态信息
    getStatus() {
        return {
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            progress: this.progress,
            currentDistance: this.currentDistance,
            totalDistance: this.totalDistance,
            direction: this.direction,
            pathPointCount: this.pathPoints?.length || 0
        };
    }

    onDispose() {
        this.stop();

        // 清理可视化对象 - 从场景中移除
        if (this.pathLine) {
            this.scene.scene.remove(this.pathLine);
            this.pathLine = null;
        }
        if (this.pathMarkers) {
            this.pathMarkers.forEach((marker) => this.scene.scene.remove(marker));
            this.pathMarkers = null;
        }
    }
}

export default PathAnimation;
