<template>
    <Teleport to="body">
        <div class="toast-container">
            <TransitionGroup name="toast">
                <div
                    v-for="toast in toasts"
                    :key="toast.id"
                    class="toast-item"
                    :class="[`toast-${toast.type}`]"
                    @click="removeToast(toast.id)"
                >
                    <div class="toast-icon">{{ getIcon(toast.type) }}</div>
                    <div class="toast-content">
                        <div v-if="toast.title" class="toast-title">{{ toast.title }}</div>
                        <div class="toast-message">{{ toast.message }}</div>
                    </div>
                    <button class="toast-close" @click.stop="removeToast(toast.id)">×</button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const toasts = ref([]);
let nextId = 1;

const getIcon = (type) => {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
};

const addToast = (options) => {
    const toast = {
        id: nextId++,
        type: options.type || 'info',
        title: options.title || '',
        message: options.message || '',
        duration: options.duration || 3000
    };

    toasts.value.push(toast);

    if (toast.duration > 0) {
        setTimeout(() => {
            removeToast(toast.id);
        }, toast.duration);
    }

    return toast.id;
};

const removeToast = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index > -1) {
        toasts.value.splice(index, 1);
    }
};

const clearAll = () => {
    toasts.value = [];
};

// 暴露方法供外部调用
defineExpose({
    addToast,
    removeToast,
    clearAll,
    success: (message, title) => addToast({ type: 'success', message, title }),
    error: (message, title) => addToast({ type: 'error', message, title }),
    warning: (message, title) => addToast({ type: 'warning', message, title }),
    info: (message, title) => addToast({ type: 'info', message, title })
});
</script>

<style scoped>
.toast-container {
    @apply fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none;
}

.toast-item {
    @apply flex items-start gap-3 min-w-[300px] max-w-[400px] p-4 rounded-lg shadow-lg pointer-events-auto cursor-pointer;
    @apply bg-white border-l-4;
}

.toast-success {
    @apply border-green-500;
}

.toast-error {
    @apply border-red-500;
}

.toast-warning {
    @apply border-yellow-500;
}

.toast-info {
    @apply border-blue-500;
}

.toast-icon {
    @apply flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-white font-bold;
}

.toast-success .toast-icon {
    @apply bg-green-500;
}

.toast-error .toast-icon {
    @apply bg-red-500;
}

.toast-warning .toast-icon {
    @apply bg-yellow-500;
}

.toast-info .toast-icon {
    @apply bg-blue-500;
}

.toast-content {
    @apply flex-1;
}

.toast-title {
    @apply font-semibold text-gray-900 mb-1;
}

.toast-message {
    @apply text-sm text-gray-600;
}

.toast-close {
    @apply flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xl font-bold;
}

/* 过渡动画 */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
}
</style>

