<template>
    <div class="tabs-container">
        <div class="tabs-header flex border-b border-gray-200">
            <button
                v-for="tab in tabs"
                :key="tab.key"
                class="tab-item"
                :class="{ active: modelValue === tab.key }"
                @click="handleTabClick(tab.key)"
            >
                {{ tab.label }}
            </button>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue: {
        type: String,
        required: true
    },
    tabs: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['update:modelValue']);

const handleTabClick = (key) => {
    emit('update:modelValue', key);
};
</script>

<style scoped>
.tabs-container {
    background-color: white;
}

.tab-item {
    @apply px-4 py-3 text-sm font-medium text-gray-600 transition-colors;
    @apply hover:text-gray-900 hover:bg-gray-50;
    @apply border-b-2 border-transparent;
}

.tab-item.active {
    @apply text-primary-600 border-primary-600 bg-primary-50;
}
</style>

