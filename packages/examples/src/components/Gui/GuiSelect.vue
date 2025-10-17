<template>
    <div class="input-group">
        <label v-if="label">{{ label }}</label>
        <select :value="modelValue" @change="handleChange">
            <option
                v-for="option in options"
                :key="getOptionValue(option)"
                :value="getOptionValue(option)"
            >
                {{ getOptionLabel(option) }}
            </option>
        </select>
    </div>
</template>

<script setup>
const props = defineProps({
    label: {
        type: String,
        default: ''
    },
    modelValue: {
        type: [String, Number],
        required: true
    },
    options: {
        type: Array,
        required: true
    },
    valueKey: {
        type: String,
        default: 'value'
    },
    labelKey: {
        type: String,
        default: 'label'
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const getOptionValue = (option) => {
    return typeof option === 'object' ? option[props.valueKey] : option;
};

const getOptionLabel = (option) => {
    return typeof option === 'object' ? option[props.labelKey] : option;
};

const handleChange = (event) => {
    const value = event.target.value;
    // 尝试转换为数字（如果原值是数字）
    const parsedValue = isNaN(value) ? value : Number(value);
    emit('update:modelValue', parsedValue);
    emit('change', parsedValue);
};
</script>

<style scoped lang="less">
@import '@/styles/gui.less';
</style>

