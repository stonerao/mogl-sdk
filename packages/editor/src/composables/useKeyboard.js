import { onMounted, onUnmounted } from 'vue';

/**
 * 快捷键系统组合式函数
 */
export function useKeyboard() {
    // 快捷键注册表
    const shortcuts = new Map();

    /**
     * 注册快捷键
     * @param {String} key - 快捷键（如 'ctrl+z', 'ctrl+shift+s'）
     * @param {Function} handler - 处理函数
     * @param {Object} options - 选项
     */
    const register = (key, handler, options = {}) => {
        const normalizedKey = normalizeKey(key);
        shortcuts.set(normalizedKey, {
            handler,
            description: options.description || '',
            preventDefault: options.preventDefault !== false // 默认阻止默认行为
        });
        console.log(`[Keyboard] Registered shortcut: ${normalizedKey}`);
    };

    /**
     * 注销快捷键
     * @param {String} key - 快捷键
     */
    const unregister = (key) => {
        const normalizedKey = normalizeKey(key);
        shortcuts.delete(normalizedKey);
        console.log(`[Keyboard] Unregistered shortcut: ${normalizedKey}`);
    };

    /**
     * 标准化快捷键字符串
     * @param {String} key - 快捷键
     * @returns {String} 标准化后的快捷键
     */
    const normalizeKey = (key) => {
        return key
            .toLowerCase()
            .split('+')
            .map((k) => k.trim())
            .sort()
            .join('+');
    };

    /**
     * 从键盘事件生成快捷键字符串
     * @param {KeyboardEvent} event - 键盘事件
     * @returns {String} 快捷键字符串
     */
    const getKeyFromEvent = (event) => {
        const keys = [];

        if (event.ctrlKey || event.metaKey) keys.push('ctrl');
        if (event.shiftKey) keys.push('shift');
        if (event.altKey) keys.push('alt');

        // 获取主键
        const mainKey = event.key.toLowerCase();
        if (mainKey !== 'control' && mainKey !== 'shift' && mainKey !== 'alt' && mainKey !== 'meta') {
            keys.push(mainKey);
        }

        return keys.sort().join('+');
    };

    /**
     * 键盘事件处理器
     * @param {KeyboardEvent} event - 键盘事件
     */
    const handleKeyDown = (event) => {
        // 忽略在输入框中的快捷键
        const target = event.target;
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        ) {
            // 只允许 Ctrl+S 在输入框中工作
            const key = getKeyFromEvent(event);
            if (key !== 'ctrl+s') {
                return;
            }
        }

        const key = getKeyFromEvent(event);
        const shortcut = shortcuts.get(key);

        if (shortcut) {
            if (shortcut.preventDefault) {
                event.preventDefault();
            }
            shortcut.handler(event);
        }
    };

    /**
     * 启动快捷键监听
     */
    const start = () => {
        window.addEventListener('keydown', handleKeyDown);
        console.log('[Keyboard] Keyboard shortcuts started');
    };

    /**
     * 停止快捷键监听
     */
    const stop = () => {
        window.removeEventListener('keydown', handleKeyDown);
        console.log('[Keyboard] Keyboard shortcuts stopped');
    };

    /**
     * 获取所有已注册的快捷键
     * @returns {Array} 快捷键列表
     */
    const getShortcuts = () => {
        return Array.from(shortcuts.entries()).map(([key, value]) => ({
            key,
            description: value.description
        }));
    };

    // 自动启动和停止
    onMounted(() => {
        start();
    });

    onUnmounted(() => {
        stop();
    });

    return {
        register,
        unregister,
        start,
        stop,
        getShortcuts
    };
}

/**
 * 预定义的快捷键常量
 */
export const SHORTCUTS = {
    UNDO: 'ctrl+z',
    REDO: 'ctrl+y',
    SAVE: 'ctrl+s',
    DELETE: 'delete',
    COPY: 'ctrl+c',
    PASTE: 'ctrl+v',
    SELECT_ALL: 'ctrl+a',
    DESELECT: 'escape'
};

