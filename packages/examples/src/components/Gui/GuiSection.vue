<template>
    <div class="control-section">
        <h4 v-if="title">{{ title }}</h4>
        <slot></slot>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        default: ''
    }
});
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
</style>

