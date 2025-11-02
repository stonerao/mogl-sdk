<template>
    <div id="editor-app" class="w-full h-full">
        <EditorLayout />
        <Toast ref="toastRef" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import EditorLayout from './components/layout/EditorLayout.vue';
import Toast from './components/ui/Toast.vue';
import { useKeyboard, SHORTCUTS } from './composables/useKeyboard';
import { useHistoryStore } from './stores/useHistoryStore';
import { useProjectStore } from './stores/useProjectStore';
import { useComponentStore } from './stores/useComponentStore';
import { useToast } from './composables/useToast';

const keyboard = useKeyboard();
const historyStore = useHistoryStore();
const projectStore = useProjectStore();
const componentStore = useComponentStore();
const toast = useToast();

// Toast 组件引用
const toastRef = ref(null);

// 注册快捷键
onMounted(() => {
    // 初始化 Toast
    if (toastRef.value) {
        toast.setToastInstance(toastRef.value);
    }
    // 撤回
    keyboard.register(SHORTCUTS.UNDO, async () => {
        if (historyStore.canUndo) {
            await historyStore.undo();
            toast.success('已撤回操作');
        }
    }, { description: '撤回上一步操作' });

    // 重做
    keyboard.register(SHORTCUTS.REDO, async () => {
        if (historyStore.canRedo) {
            await historyStore.redo();
            toast.success('已重做操作');
        }
    }, { description: '重做上一步操作' });

    // 保存
    keyboard.register(SHORTCUTS.SAVE, () => {
        projectStore.saveToLocalStorage();
        toast.success('项目已保存');
    }, { description: '保存项目' });

    // 删除选中组件
    keyboard.register(SHORTCUTS.DELETE, () => {
        if (componentStore.selectedComponentId) {
            const component = componentStore.selectedComponent;
            componentStore.removeComponent(componentStore.selectedComponentId);
            toast.success(`已删除组件: ${component?.name || '未命名'}`);
        }
    }, { description: '删除选中组件', preventDefault: true });

    console.log('[App] Keyboard shortcuts registered');
});
</script>

<style scoped>
#editor-app {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}
</style>

