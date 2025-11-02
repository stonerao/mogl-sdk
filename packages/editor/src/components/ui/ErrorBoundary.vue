<template>
    <div v-if="hasError" class="error-boundary">
        <div class="error-content">
            <div class="error-icon">⚠️</div>
            <div class="error-title">出错了</div>
            <div class="error-message">{{ errorMessage }}</div>
            <div class="error-actions">
                <button class="btn-retry" @click="retry">重试</button>
                <button class="btn-reset" @click="reset">重置</button>
            </div>
            <details v-if="errorStack" class="error-details">
                <summary>错误详情</summary>
                <pre class="error-stack">{{ errorStack }}</pre>
            </details>
        </div>
    </div>
    <slot v-else></slot>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';
import { useToast } from '@/composables/useToast';

const toast = useToast();

const hasError = ref(false);
const errorMessage = ref('');
const errorStack = ref('');

// 捕获子组件错误
onErrorCaptured((err, instance, info) => {
    hasError.value = true;
    errorMessage.value = err.message || '未知错误';
    errorStack.value = err.stack || '';

    console.error('[ErrorBoundary] Caught error:', err);
    console.error('[ErrorBoundary] Component:', instance);
    console.error('[ErrorBoundary] Info:', info);

    toast.error(`组件错误: ${err.message}`);

    // 返回 false 阻止错误继续向上传播
    return false;
});

// 重试
const retry = () => {
    hasError.value = false;
    errorMessage.value = '';
    errorStack.value = '';
};

// 重置（刷新页面）
const reset = () => {
    if (confirm('确定要重置编辑器吗？未保存的更改将丢失。')) {
        window.location.reload();
    }
};
</script>

<style scoped>
.error-boundary {
    @apply flex items-center justify-center h-full bg-gray-50;
}

.error-content {
    @apply max-w-md p-8 bg-white rounded-lg shadow-lg text-center;
}

.error-icon {
    @apply text-6xl mb-4;
}

.error-title {
    @apply text-2xl font-bold text-gray-900 mb-2;
}

.error-message {
    @apply text-gray-600 mb-6;
}

.error-actions {
    @apply flex gap-4 justify-center mb-4;
}

.btn-retry,
.btn-reset {
    @apply px-4 py-2 rounded transition-colors;
}

.btn-retry {
    @apply bg-primary-500 text-white hover:bg-primary-600;
}

.btn-reset {
    @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}

.error-details {
    @apply mt-4 text-left;
}

.error-details summary {
    @apply cursor-pointer text-sm text-gray-500 hover:text-gray-700;
}

.error-stack {
    @apply mt-2 p-4 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-48;
}
</style>

