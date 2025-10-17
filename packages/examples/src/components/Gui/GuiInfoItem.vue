<template>
    <div class="info-item">
        <span>{{ label }}</span>
        <span v-if="badge" :class="['badge', badgeType]">{{ value }}</span>
        <span v-else class="value">{{ value }}</span>
    </div>
</template>

<script setup>
defineProps({
    label: {
        type: String,
        required: true
    },
    value: {
        type: [String, Number],
        required: true
    },
    badge: {
        type: Boolean,
        default: false
    },
    badgeType: {
        type: String,
        default: 'success', // success, warning, error
        validator: (value) => ['success', 'warning', 'error'].includes(value)
    }
});
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
</style>

