<template>
    <div class="scene-panel-container">
        <!-- 头部工具栏 - hideHeader 为 true 时隐藏 -->
        <div v-if="!hideHeader" class="scene-header">
            <div class="scene-title">
                <span class="icon">🎨</span>
                <span>{{ title }}</span>
            </div>
            <div class="scene-actions">
                <button class="btn-icon" @click="goHome" title="返回首页">🏠</button>
            </div>
        </div>

        <!-- 场景内容 -->
        <div class="scene-content">
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

defineProps({
    title: {
        type: String,
        default: '3D Scene'
    },
    hideHeader: {
        type: Boolean,
        default: false
    }
});

const router = useRouter();

const goHome = () => {
    router.push('/');
};
</script>

<style scoped>
.scene-panel-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #000;
}

.scene-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    flex-shrink: 0;
}

.scene-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
}

.icon {
    font-size: 16px;
}

.scene-actions {
    display: flex;
    gap: 8px;
}

.btn-icon {
    color: white;
}

.scene-content {
    flex: 1;
    position: relative;
    overflow: hidden;
}
</style>

