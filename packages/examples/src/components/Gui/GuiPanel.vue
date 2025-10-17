<template>
    <div :class="panelClasses">
        <div v-if="title" class="panel-title">{{ title }}</div>
        <slot></slot>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    width: {
        type: String,
        default: 'normal', // narrow, normal, wide
        validator: (value) => ['narrow', 'normal', 'wide'].includes(value)
    }
});

const panelClasses = computed(() => {
    const classes = ['control-panel'];
    
    if (props.width !== 'normal') {
        classes.push(props.width);
    }
    
    return classes.join(' ');
});
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
</style>

