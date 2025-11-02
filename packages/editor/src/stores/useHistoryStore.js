import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * 历史记录 Store
 * 实现撤回/重做功能
 */
export const useHistoryStore = defineStore('history', () => {
    // ==================== 状态 ====================

    // 历史记录栈（存储已执行的命令）
    const undoStack = ref([]);

    // 重做栈（存储已撤销的命令）
    const redoStack = ref([]);

    // 最大历史记录数量
    const maxHistorySize = ref(50);

    // 是否正在执行命令（防止递归记录）
    const isExecuting = ref(false);

    // ==================== 计算属性 ====================

    // 是否可以撤回
    const canUndo = computed(() => undoStack.value.length > 0);

    // 是否可以重做
    const canRedo = computed(() => redoStack.value.length > 0);

    // 历史记录数量
    const historyCount = computed(() => undoStack.value.length);

    // ==================== 方法 ====================

    /**
     * 执行命令并记录到历史
     * @param {Object} command - 命令对象
     * @param {Function} command.execute - 执行函数
     * @param {Function} command.undo - 撤销函数
     * @param {String} command.name - 命令名称
     * @param {Object} command.data - 命令数据
     */
    const executeCommand = async (command) => {
        if (isExecuting.value) return;

        try {
            isExecuting.value = true;

            // 执行命令
            await command.execute();

            // 添加到撤回栈
            undoStack.value.push(command);

            // 限制历史记录数量
            if (undoStack.value.length > maxHistorySize.value) {
                undoStack.value.shift();
            }

            // 清空重做栈
            redoStack.value = [];

            console.log(`[History] Command executed: ${command.name}`);
        } catch (error) {
            console.error('[History] Failed to execute command:', error);
            throw error;
        } finally {
            isExecuting.value = false;
        }
    };

    /**
     * 撤回上一个操作
     */
    const undo = async () => {
        if (!canUndo.value || isExecuting.value) return;

        try {
            isExecuting.value = true;

            // 从撤回栈中取出最后一个命令
            const command = undoStack.value.pop();

            // 执行撤销
            await command.undo();

            // 添加到重做栈
            redoStack.value.push(command);

            console.log(`[History] Undo: ${command.name}`);
        } catch (error) {
            console.error('[History] Failed to undo:', error);
            throw error;
        } finally {
            isExecuting.value = false;
        }
    };

    /**
     * 重做上一个撤销的操作
     */
    const redo = async () => {
        if (!canRedo.value || isExecuting.value) return;

        try {
            isExecuting.value = true;

            // 从重做栈中取出最后一个命令
            const command = redoStack.value.pop();

            // 重新执行
            await command.execute();

            // 添加回撤回栈
            undoStack.value.push(command);

            console.log(`[History] Redo: ${command.name}`);
        } catch (error) {
            console.error('[History] Failed to redo:', error);
            throw error;
        } finally {
            isExecuting.value = false;
        }
    };

    /**
     * 清空历史记录
     */
    const clear = () => {
        undoStack.value = [];
        redoStack.value = [];
        console.log('[History] History cleared');
    };

    /**
     * 获取历史记录列表（用于调试）
     */
    const getHistory = () => {
        return {
            undo: undoStack.value.map((cmd) => cmd.name),
            redo: redoStack.value.map((cmd) => cmd.name)
        };
    };

    // ==================== 返回 ====================

    return {
        // 状态
        undoStack,
        redoStack,
        maxHistorySize,
        isExecuting,

        // 计算属性
        canUndo,
        canRedo,
        historyCount,

        // 方法
        executeCommand,
        undo,
        redo,
        clear,
        getHistory
    };
});

