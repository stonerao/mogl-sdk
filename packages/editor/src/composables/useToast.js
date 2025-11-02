/**
 * Toast 通知系统
 * 用于显示成功、错误、警告、信息等提示消息
 */

let toastInstance = null;

export function useToast() {
    // 设置 Toast 实例（由 App.vue 调用）
    const setToastInstance = (instance) => {
        toastInstance = instance;
    };

    // 显示成功消息
    const success = (message, title = '成功') => {
        if (!toastInstance) {
            console.warn('[useToast] Toast instance not initialized');
            return;
        }
        return toastInstance.success(message, title);
    };

    // 显示错误消息
    const error = (message, title = '错误') => {
        if (!toastInstance) {
            console.warn('[useToast] Toast instance not initialized');
            return;
        }
        return toastInstance.error(message, title);
    };

    // 显示警告消息
    const warning = (message, title = '警告') => {
        if (!toastInstance) {
            console.warn('[useToast] Toast instance not initialized');
            return;
        }
        return toastInstance.warning(message, title);
    };

    // 显示信息消息
    const info = (message, title = '提示') => {
        if (!toastInstance) {
            console.warn('[useToast] Toast instance not initialized');
            return;
        }
        return toastInstance.info(message, title);
    };

    // 自定义消息
    const show = (options) => {
        if (!toastInstance) {
            console.warn('[useToast] Toast instance not initialized');
            return;
        }
        return toastInstance.addToast(options);
    };

    // 移除指定消息
    const remove = (id) => {
        if (!toastInstance) {
            console.warn('[useToast] Toast instance not initialized');
            return;
        }
        return toastInstance.removeToast(id);
    };

    // 清除所有消息
    const clearAll = () => {
        if (!toastInstance) {
            console.warn('[useToast] Toast instance not initialized');
            return;
        }
        return toastInstance.clearAll();
    };

    return {
        setToastInstance,
        success,
        error,
        warning,
        info,
        show,
        remove,
        clearAll
    };
}

