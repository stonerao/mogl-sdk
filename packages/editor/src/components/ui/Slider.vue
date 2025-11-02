<template>
    <div class="slider-wrapper">
        <div class="slider-header">
            <label v-if="label" class="slider-label">
                {{ label }}
            </label>
            <span v-if="showValue" class="slider-value">
                {{ modelValue }}
            </span>
        </div>
        <div class="slider-container">
            <input
                type="range"
                :value="modelValue"
                :min="min"
                :max="max"
                :step="step"
                :disabled="disabled"
                class="slider"
                @input="handleInput"
                @change="handleChange"
            />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue: {
        type: Number,
        default: 0
    },
    label: {
        type: String,
        default: ''
    },
    min: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 100
    },
    step: {
        type: Number,
        default: 1
    },
    showValue: {
        type: Boolean,
        default: true
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const handleInput = (event) => {
    emit('update:modelValue', Number(event.target.value));
};

const handleChange = (event) => {
    emit('change', Number(event.target.value));
};
</script>

<style scoped>
.slider-wrapper {
    @apply w-full;
}

.slider-header {
    @apply flex items-center justify-between mb-2;
}

.slider-label {
    @apply text-sm font-medium text-gray-700;
}

.slider-value {
    @apply text-sm text-gray-600 font-mono;
}

.slider-container {
    @apply w-full;
}

.slider {
    @apply w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.slider::-webkit-slider-thumb {
    @apply appearance-none w-4 h-4 bg-primary-600 rounded-full cursor-pointer;
    @apply hover:bg-primary-700;
}

.slider::-moz-range-thumb {
    @apply w-4 h-4 bg-primary-600 rounded-full cursor-pointer border-0;
    @apply hover:bg-primary-700;
}

.slider:focus {
    @apply outline-none;
}

.slider:focus::-webkit-slider-thumb {
    @apply ring-2 ring-primary-500 ring-offset-2;
}

.slider:focus::-moz-range-thumb {
    @apply ring-2 ring-primary-500 ring-offset-2;
}
</style>

