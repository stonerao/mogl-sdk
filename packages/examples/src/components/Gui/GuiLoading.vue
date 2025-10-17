<template>
    <div v-if="visible" class="loading-overlay">
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">{{ text }}</div>
            <div v-if="showProgress" class="loading-progress">
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
                </div>
                <span>{{ progress }}%</span>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    text: {
        type: String,
        default: '加载中...'
    },
    showProgress: {
        type: Boolean,
        default: false
    },
    progress: {
        type: Number,
        default: 0,
        validator: (value) => value >= 0 && value <= 100
    }
});
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
</style>

