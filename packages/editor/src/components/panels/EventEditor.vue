<template>
    <div class="event-editor">
        <!-- 未选中组件 -->
        <div v-if="!selectedComponent" class="empty-state">
            <div class="empty-icon">⚡</div>
            <div class="empty-text">请选择一个组件以管理事件</div>
        </div>

        <!-- 已选中组件 -->
        <div v-else class="event-content">
            <!-- 组件信息 -->
            <div class="component-info">
                <div class="info-row">
                    <span class="info-label">组件:</span>
                    <span class="info-value">{{ selectedComponent.name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">事件数:</span>
                    <span class="info-value">{{ componentEvents.length }}</span>
                </div>
            </div>

            <!-- 添加事件按钮 -->
            <div class="add-event-section">
                <Select
                    v-model="selectedEventType"
                    :options="eventTypeOptions"
                    placeholder="选择事件类型"
                />
                <Button @click="handleAddEvent" :disabled="!selectedEventType">
                    添加事件
                </Button>
            </div>

            <!-- 事件列表 -->
            <div class="events-list">
                <div v-if="componentEvents.length === 0" class="no-events">
                    暂无事件，点击上方按钮添加事件
                </div>

                <Accordion
                    v-else
                    :items="eventAccordionItems"
                    :default-open="openEventIds"
                >
                    <template v-for="event in componentEvents" :key="event.id" #[event.id]>
                        <div class="event-item">
                            <!-- 事件头部 -->
                            <div class="event-header">
                                <div class="event-info">
                                    <span class="event-icon">{{ getEventIcon(event.type) }}</span>
                                    <div class="event-details">
                                        <div class="event-name">{{ getEventDisplayName(event.type) }}</div>
                                        <div class="event-description">{{ getEventDescription(event.type) }}</div>
                                    </div>
                                </div>
                                <div class="event-actions">
                                    <label class="toggle-label">
                                        <input
                                            type="checkbox"
                                            :checked="event.enabled"
                                            @change="handleToggleEvent(event.id)"
                                            class="checkbox"
                                        />
                                        <span>启用</span>
                                    </label>
                                    <button @click="handleDeleteEvent(event.id)" class="delete-btn">
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            <!-- 事件参数说明 -->
                            <div class="event-params">
                                <div class="params-title">参数说明:</div>
                                <div class="params-list">
                                    <div
                                        v-for="param in getEventParameters(event.type)"
                                        :key="param.name"
                                        class="param-item"
                                    >
                                        <span class="param-name">{{ param.name }}</span>
                                        <span class="param-type">{{ param.type }}</span>
                                        <span class="param-desc">{{ param.description }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 事件处理器编辑 -->
                            <div class="event-handler">
                                <div class="handler-title">事件处理器:</div>
                                <textarea
                                    :value="event.handler"
                                    @input="handleUpdateHandler(event.id, $event.target.value)"
                                    class="code-editor"
                                    spellcheck="false"
                                    placeholder="输入事件处理代码..."
                                />
                                <div class="handler-hint">
                                    提示: 使用 JavaScript 函数语法编写事件处理逻辑
                                </div>
                            </div>

                            <!-- 示例代码 -->
                            <div class="event-example">
                                <button
                                    @click="handleLoadExample(event.id, event.type)"
                                    class="example-btn"
                                >
                                    加载示例代码
                                </button>
                            </div>
                        </div>
                    </template>
                </Accordion>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useComponentStore } from '@/stores/useComponentStore';
import { useEventSystem } from '@/composables/useEventSystem';
import {
    getEventMetadata,
    getAllEventTypes,
    EventCategory,
    getEventTypesByCategory
} from '@/config/eventTypes';
import Button from '@/components/ui/Button.vue';
import Select from '@/components/ui/Select.vue';
import Accordion from '@/components/ui/Accordion.vue';

const componentStore = useComponentStore();
const { bindEvent, unbindEvent, updateEvent, toggleEvent } = useEventSystem();

const selectedComponent = computed(() => componentStore.selectedComponent);
const componentEvents = computed(() => selectedComponent.value?.events || []);

const selectedEventType = ref('');
const openEventIds = ref([]);

// 事件类型选项（按分类分组）
const eventTypeOptions = computed(() => {
    const options = [];

    // 生命周期事件
    const lifecycleEvents = getEventTypesByCategory(EventCategory.LIFECYCLE);
    if (lifecycleEvents.length > 0) {
        options.push({ value: '', label: '--- 生命周期事件 ---', disabled: true });
        lifecycleEvents.forEach((type) => {
            const meta = getEventMetadata(type);
            options.push({ value: type, label: `${meta.icon} ${meta.displayName}` });
        });
    }

    // 交互事件
    const interactionEvents = getEventTypesByCategory(EventCategory.INTERACTION);
    if (interactionEvents.length > 0) {
        options.push({ value: '', label: '--- 交互事件 ---', disabled: true });
        interactionEvents.forEach((type) => {
            const meta = getEventMetadata(type);
            options.push({ value: type, label: `${meta.icon} ${meta.displayName}` });
        });
    }

    // 数据事件
    const dataEvents = getEventTypesByCategory(EventCategory.DATA);
    if (dataEvents.length > 0) {
        options.push({ value: '', label: '--- 数据事件 ---', disabled: true });
        dataEvents.forEach((type) => {
            const meta = getEventMetadata(type);
            options.push({ value: type, label: `${meta.icon} ${meta.displayName}` });
        });
    }

    // 动画事件
    const animationEvents = getEventTypesByCategory(EventCategory.ANIMATION);
    if (animationEvents.length > 0) {
        options.push({ value: '', label: '--- 动画事件 ---', disabled: true });
        animationEvents.forEach((type) => {
            const meta = getEventMetadata(type);
            options.push({ value: type, label: `${meta.icon} ${meta.displayName}` });
        });
    }

    return options;
});

// Accordion 配置
const eventAccordionItems = computed(() => {
    return componentEvents.value.map((event) => {
        const meta = getEventMetadata(event.type);
        return {
            key: event.id,
            label: `${meta?.icon || '⚡'} ${meta?.displayName || event.type}`,
            icon: event.enabled ? '✅' : '⏸️'
        };
    });
});

// 获取事件图标
const getEventIcon = (eventType) => {
    const meta = getEventMetadata(eventType);
    return meta?.icon || '⚡';
};

// 获取事件显示名称
const getEventDisplayName = (eventType) => {
    const meta = getEventMetadata(eventType);
    return meta?.displayName || eventType;
};

// 获取事件描述
const getEventDescription = (eventType) => {
    const meta = getEventMetadata(eventType);
    return meta?.description || '';
};

// 获取事件参数
const getEventParameters = (eventType) => {
    const meta = getEventMetadata(eventType);
    return meta?.parameters || [];
};

// 添加事件
const handleAddEvent = () => {
    if (!selectedComponent.value || !selectedEventType.value) return;

    try {
        const event = bindEvent(selectedComponent.value.id, selectedEventType.value);
        // 自动展开新添加的事件
        openEventIds.value.push(event.id);
        // 重置选择
        selectedEventType.value = '';
    } catch (error) {
        console.error('Failed to add event:', error);
        alert('添加事件失败: ' + error.message);
    }
};

// 删除事件
const handleDeleteEvent = (eventId) => {
    if (!selectedComponent.value) return;

    if (confirm('确定要删除此事件吗？')) {
        try {
            unbindEvent(selectedComponent.value.id, eventId);
            // 从展开列表中移除
            const index = openEventIds.value.indexOf(eventId);
            if (index > -1) {
                openEventIds.value.splice(index, 1);
            }
        } catch (error) {
            console.error('Failed to delete event:', error);
            alert('删除事件失败: ' + error.message);
        }
    }
};

// 切换事件启用状态
const handleToggleEvent = (eventId) => {
    if (!selectedComponent.value) return;

    try {
        toggleEvent(selectedComponent.value.id, eventId);
    } catch (error) {
        console.error('Failed to toggle event:', error);
    }
};

// 更新事件处理器
const handleUpdateHandler = (eventId, handler) => {
    if (!selectedComponent.value) return;

    try {
        updateEvent(selectedComponent.value.id, eventId, { handler });
    } catch (error) {
        console.error('Failed to update handler:', error);
    }
};

// 加载示例代码
const handleLoadExample = (eventId, eventType) => {
    const meta = getEventMetadata(eventType);
    if (meta?.example) {
        handleUpdateHandler(eventId, meta.example);
    }
};

// 监听选中组件变化，重置状态
watch(selectedComponent, () => {
    selectedEventType.value = '';
    openEventIds.value = [];
});
</script>

<style scoped>
.event-editor {
    @apply h-full overflow-y-auto;
}

.empty-state {
    @apply flex flex-col items-center justify-center h-full text-gray-400;
}

.empty-icon {
    @apply text-6xl mb-4;
}

.empty-text {
    @apply text-sm;
}

.event-content {
    @apply p-4 space-y-4;
}

.component-info {
    @apply bg-gray-50 rounded p-1 space-y-2 text-sm;
}

.info-row {
    @apply flex items-center gap-2;
}

.info-label {
    @apply font-medium text-gray-600 min-w-[60px];
}

.info-value {
    @apply text-gray-800;
}

.add-event-section {
    /* 换行 */
    @apply flex flex-wrap gap-2;
}

.events-list {
    @apply space-y-2;
}

.no-events {
    @apply text-center text-gray-400 py-8;
}

.event-item {
    @apply space-y-3;
}

.event-header {
    @apply flex items-start justify-between gap-2;
}

.event-info {
    @apply flex items-start gap-2 flex-1;
}

.event-icon {
    @apply text-2xl;
}

.event-details {
    @apply flex-1;
}

.event-name {
    @apply font-medium text-gray-800;
}

.event-description {
    @apply text-xs text-gray-500 mt-1;
}

.event-actions {
    @apply flex items-center gap-2;
}

.toggle-label {
    @apply flex items-center gap-1 text-sm cursor-pointer;
}

.checkbox {
    @apply w-4 h-4 rounded border-gray-300;
}

.delete-btn {
    @apply p-1 hover:bg-red-50 rounded transition-colors;
}

.event-params {
    @apply bg-gray-50 rounded p-3 text-xs;
}

.params-title {
    @apply font-medium text-gray-700 mb-2;
}

.params-list {
    @apply space-y-1;
}

.param-item {
    @apply flex gap-2;
}

.param-name {
    @apply font-mono text-blue-600 min-w-[80px];
}

.param-type {
    @apply font-mono text-purple-600 min-w-[60px];
}

.param-desc {
    @apply text-gray-600;
}

.event-handler {
    @apply space-y-2;
}

.handler-title {
    @apply font-medium text-gray-700 text-sm;
}

.code-editor {
    @apply w-full h-32 p-3 border border-gray-300 rounded font-mono text-sm resize-y;
    @apply focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.handler-hint {
    @apply text-xs text-gray-500;
}

.event-example {
    @apply flex justify-end;
}

.example-btn {
    @apply px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors;
}
</style>

