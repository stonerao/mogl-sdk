<template>
    <div class="transform-editor">
        <!-- 位置 -->
        <div class="transform-group">
            <div class="group-label">位置 (Position)</div>
            <div class="vector3-inputs">
                <div class="input-group">
                    <label>X</label>
                    <Input
                        type="number"
                        :model-value="position[0]"
                        @update:model-value="updatePosition(0, $event)"
                        :step="0.1"
                    />
                </div>
                <div class="input-group">
                    <label>Y</label>
                    <Input
                        type="number"
                        :model-value="position[1]"
                        @update:model-value="updatePosition(1, $event)"
                        :step="0.1"
                    />
                </div>
                <div class="input-group">
                    <label>Z</label>
                    <Input
                        type="number"
                        :model-value="position[2]"
                        @update:model-value="updatePosition(2, $event)"
                        :step="0.1"
                    />
                </div>
            </div>
        </div>

        <!-- 旋转 -->
        <div class="transform-group">
            <div class="group-label">旋转 (Rotation)</div>
            <div class="vector3-inputs">
                <div class="input-group">
                    <label>X</label>
                    <Input
                        type="number"
                        :model-value="rotationDegrees[0]"
                        @update:model-value="updateRotation(0, $event)"
                        :step="1"
                    />
                </div>
                <div class="input-group">
                    <label>Y</label>
                    <Input
                        type="number"
                        :model-value="rotationDegrees[1]"
                        @update:model-value="updateRotation(1, $event)"
                        :step="1"
                    />
                </div>
                <div class="input-group">
                    <label>Z</label>
                    <Input
                        type="number"
                        :model-value="rotationDegrees[2]"
                        @update:model-value="updateRotation(2, $event)"
                        :step="1"
                    />
                </div>
            </div>
        </div>

        <!-- 缩放 -->
        <div class="transform-group">
            <div class="group-label">缩放 (Scale)</div>
            <div class="scale-inputs">
                <div class="input-group flex-1">
                    <label>统一缩放</label>
                    <Input
                        type="number"
                        :model-value="uniformScale"
                        @update:model-value="updateUniformScale"
                        :step="0.1"
                        :min="0.01"
                    />
                </div>
                <button
                    class="lock-btn"
                    :class="{ active: lockScale }"
                    @click="lockScale = !lockScale"
                    title="锁定比例"
                >
                    {{ lockScale ? '🔒' : '🔓' }}
                </button>
            </div>
            <div v-if="!lockScale" class="vector3-inputs mt-2">
                <div class="input-group">
                    <label>X</label>
                    <Input
                        type="number"
                        :model-value="scale[0]"
                        @update:model-value="updateScale(0, $event)"
                        :step="0.1"
                        :min="0.01"
                    />
                </div>
                <div class="input-group">
                    <label>Y</label>
                    <Input
                        type="number"
                        :model-value="scale[1]"
                        @update:model-value="updateScale(1, $event)"
                        :step="0.1"
                        :min="0.01"
                    />
                </div>
                <div class="input-group">
                    <label>Z</label>
                    <Input
                        type="number"
                        :model-value="scale[2]"
                        @update:model-value="updateScale(2, $event)"
                        :step="0.1"
                        :min="0.01"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Input from '@/components/ui/Input.vue';

const props = defineProps({
    position: {
        type: Array,
        default: () => [0, 0, 0]
    },
    rotation: {
        type: Array,
        default: () => [0, 0, 0]
    },
    scale: {
        type: [Number, Array],
        default: 1
    }
});

const emit = defineEmits(['update:position', 'update:rotation', 'update:scale']);

const lockScale = ref(true);

// 将旋转从弧度转换为角度
const rotationDegrees = computed(() => {
    return props.rotation.map((rad) => Math.round((rad * 180) / Math.PI));
});

// 统一缩放值
const uniformScale = computed(() => {
    if (typeof props.scale === 'number') {
        return props.scale;
    }
    return props.scale[0];
});

// 更新位置
const updatePosition = (index, value) => {
    const newPosition = [...props.position];
    newPosition[index] = parseFloat(value) || 0;
    emit('update:position', newPosition);
};

// 更新旋转（输入为角度，转换为弧度）
const updateRotation = (index, value) => {
    const newRotation = [...props.rotation];
    newRotation[index] = ((parseFloat(value) || 0) * Math.PI) / 180;
    emit('update:rotation', newRotation);
};

// 更新统一缩放
const updateUniformScale = (value) => {
    const scaleValue = parseFloat(value) || 0.01;
    if (lockScale.value) {
        emit('update:scale', scaleValue);
    } else {
        emit('update:scale', [scaleValue, scaleValue, scaleValue]);
    }
};

// 更新单个轴的缩放
const updateScale = (index, value) => {
    const scaleValue = parseFloat(value) || 0.01;
    const newScale = Array.isArray(props.scale) ? [...props.scale] : [props.scale, props.scale, props.scale];
    newScale[index] = scaleValue;
    emit('update:scale', newScale);
};

// 监听锁定状态变化
watch(lockScale, (locked) => {
    if (locked) {
        // 锁定时，使用当前的统一缩放值
        emit('update:scale', uniformScale.value);
    } else {
        // 解锁时，转换为数组形式
        const currentScale = uniformScale.value;
        emit('update:scale', [currentScale, currentScale, currentScale]);
    }
});
</script>

<style scoped>
.transform-editor {
    @apply space-y-4;
}

.transform-group {
    @apply space-y-2;
}

.group-label {
    @apply text-sm font-medium text-gray-700;
}

.vector3-inputs {
    @apply grid grid-cols-3 gap-2;
}

.scale-inputs {
    @apply flex items-end gap-2;
}

.input-group {
    @apply flex flex-col gap-1;
}

.input-group label {
    @apply text-xs text-gray-600;
}

.lock-btn {
    @apply w-8 h-8 rounded border border-gray-300;
    @apply flex items-center justify-center;
    @apply hover:bg-gray-100 transition-colors;
    @apply text-lg;
}

.lock-btn.active {
    @apply bg-primary-50 border-primary-300;
}
</style>

