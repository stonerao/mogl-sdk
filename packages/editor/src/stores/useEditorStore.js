import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useEditorStore = defineStore('editor', () => {
    // 编辑器模式：edit | preview
    const mode = ref('edit');

    // UI 显示状态
    const showLeftPanel = ref(true);
    const showRightPanel = ref(true);

    // 切换编辑模式
    const setMode = (newMode) => {
        mode.value = newMode;
    };

    // 切换面板显示
    const toggleLeftPanel = () => {
        showLeftPanel.value = !showLeftPanel.value;
    };

    const toggleRightPanel = () => {
        showRightPanel.value = !showRightPanel.value;
    };

    return {
        mode,
        showLeftPanel,
        showRightPanel,
        setMode,
        toggleLeftPanel,
        toggleRightPanel
    };
});

