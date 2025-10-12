import { LogLevel } from './LogLevel.js';

/**
 * Logger 日志类
 *
 * @class Logger
 * @description 日志记录工具
 */
export class Logger {
    /**
     * 创建日志实例
     *
     * @param {string} name - 日志名称
     * @param {string} level - 日志级别
     */
    constructor(name = 'W3D', level = LogLevel.INFO) {
        this.name = name;
        this.level = level;
        this.enabled = true;
    }

    /**
     * 检查日志级别
     *
     * @param {string} level - 日志级别
     * @returns {boolean} 是否应该输出
     */
    shouldLog(level) {
        if (!this.enabled) return false;

        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }

    /**
     * 格式化日志消息
     *
     * @param {string} level - 日志级别
     * @param {*} args - 日志参数
     * @returns {Array} 格式化后的参数
     */
    format(level, ...args) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${this.name}] [${level}]`;
        return [prefix, ...args];
    }

    /**
     * 调试日志
     *
     * @param {*} args - 日志参数
     */
    debug(...args) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(...this.format(LogLevel.DEBUG, ...args));
        }
    }

    /**
     * 信息日志
     *
     * @param {*} args - 日志参数
     */
    info(...args) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(...this.format(LogLevel.INFO, ...args));
        }
    }

    /**
     * 警告日志
     *
     * @param {*} args - 日志参数
     */
    warn(...args) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(...this.format(LogLevel.WARN, ...args));
        }
    }

    /**
     * 错误日志
     *
     * @param {*} args - 日志参数
     */
    error(...args) {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(...this.format(LogLevel.ERROR, ...args));
        }
    }

    /**
     * 设置日志级别
     *
     * @param {string} level - 日志级别
     */
    setLevel(level) {
        this.level = level;
    }

    /**
     * 启用日志
     */
    enable() {
        this.enabled = true;
    }

    /**
     * 禁用日志
     */
    disable() {
        this.enabled = false;
    }
}
