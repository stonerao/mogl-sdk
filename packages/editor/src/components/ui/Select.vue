<template>
    <div class="select-wrapper">
        <label v-if="label" class="select-label">
            {{ label }}
        </label>
        <select
            :value="modelValue"
            :disabled="disabled"
            class="select"
            @change="handleChange"
        >
            <option v-if="placeholder" value="" disabled>
                {{ placeholder }}
            </option>
            <option
                v-for="option in options"
                :key="option.value"
                :value="option.value"
            >
                {{ option.label }}
            </option>
        </select>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue: {
        type: [String, Number, Boolean],
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    options: {
        type: Array,
        required: true,
        default: () => []
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const handleChange = (event) => {
    const value = event.target.value;
    emit('update:modelValue', value);
    emit('change', value);
};
</script>

<style scoped>
.select-wrapper {
    @apply w-full;
}

.select-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
}

.select {
    @apply w-full px-3 py-2 text-sm border border-gray-300 rounded;
    @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
    @apply disabled:bg-gray-100 disabled:cursor-not-allowed;
    @apply transition-colors;
    @apply bg-white;
}
</style>

