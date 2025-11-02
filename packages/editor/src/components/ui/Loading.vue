<template>
    <div v-if="visible" class="loading-overlay" :class="{ 'fullscreen': fullscreen }">
        <div class="loading-content">
            <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
            </div>
            <div v-if="message" class="loading-message">{{ message }}</div>
            <div v-if="progress !== null" class="loading-progress">
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: progress * 100 + '%' }"></div>
                </div>
                <div class="progress-text">{{ Math.round(progress * 100) }}%</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        default: ''
    },
    progress: {
        type: Number,
        default: null
    },
    fullscreen: {
        type: Boolean,
        default: false
    }
});
</script>

<style scoped>
.loading-overlay {
    @apply absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50;
}

.loading-overlay.fullscreen {
    @apply fixed;
}

.loading-content {
    @apply flex flex-col items-center gap-4 bg-white rounded-lg p-6 shadow-xl;
}

.loading-spinner {
    @apply relative w-16 h-16;
}

.spinner-ring {
    @apply absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full;
    animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
    animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
    animation-delay: -0.3s;
}

.spinner-ring:nth-child(3) {
    animation-delay: -0.15s;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.loading-message {
    @apply text-sm text-gray-700 font-medium;
}

.loading-progress {
    @apply w-64;
}

.progress-bar {
    @apply w-full h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
    @apply h-full bg-primary-500 transition-all duration-300;
}

.progress-text {
    @apply text-xs text-gray-500 mt-1 text-center;
}
</style>

