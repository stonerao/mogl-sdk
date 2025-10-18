<template>
    <div class="split-layout" :class="{ 'scene-only-mode': sceneOnly }">
        <!-- 代码面板 - sceneOnly 模式下隐藏 -->
        <div
            v-if="!sceneOnly"
            class="code-panel"
            :class="{ 'panel-hidden': !isCodePanelVisible }"
            :style="codePanelStyle"
        >
            <CodePanel :code="code" :language="language" :title="title" />
        </div>

        <!-- 分隔条 - sceneOnly 模式下隐藏 -->
        <div
            v-if="!sceneOnly"
            class="resizer"
            :class="{ vertical: isVertical, 'resizer-hidden': !isCodePanelVisible }"
            @mousedown="startResize"
        ></div>

        <!-- 场景面板 -->
        <div class="scene-panel" :style="scenePanelStyle">
            <ScenePanel :title="sceneOnly ? '' : title" :hideHeader="sceneOnly">
                <slot></slot>
            </ScenePanel>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import CodePanel from './CodePanel.vue';
import ScenePanel from './ScenePanel.vue';

const props = defineProps({
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'javascript'
    },
    title: {
        type: String,
        default: 'Example'
    },
    sceneOnly: {
        type: Boolean,
        default: false
    }
});

// 代码面板宽度（百分比）
const codePanelWidth = ref(40);

// 是否垂直布局（移动端）
const isVertical = ref(false);

// 代码面板是否可见
const isCodePanelVisible = ref(true);

// 调整大小相关
let isResizing = false;

// 切换代码面板显示/隐藏
const toggleCodePanel = () => {
    isCodePanelVisible.value = !isCodePanelVisible.value;
};

// 代码面板样式（计算属性）
const codePanelStyle = computed(() => {
    if (isVertical.value) {
        // 垂直布局
        return {
            width: '100%',
            height: isCodePanelVisible.value ? `${codePanelWidth.value}%` : '0%',
            minHeight: isCodePanelVisible.value ? '20%' : '0%',
            maxHeight: isCodePanelVisible.value ? `${codePanelWidth.value}%` : '0%'
        };
    } else {
        // 水平布局
        return {
            width: isCodePanelVisible.value ? `${codePanelWidth.value}%` : '0%',
            minWidth: isCodePanelVisible.value ? '200px' : '0px',
            maxWidth: isCodePanelVisible.value ? `${codePanelWidth.value}%` : '0%',
            height: '100%'
        };
    }
});

// 场景面板样式（计算属性）
const scenePanelStyle = computed(() => {
    // sceneOnly 模式下，场景面板占满整个容器
    if (props.sceneOnly) {
        return {
            width: '100%',
            height: '100%'
        };
    }

    if (isVertical.value) {
        // 垂直布局
        return {
            width: '100%',
            height: isCodePanelVisible.value ? `${100 - codePanelWidth.value}%` : '100%'
        };
    } else {
        // 水平布局
        return {
            width: isCodePanelVisible.value ? `${100 - codePanelWidth.value}%` : '100%',
            height: '100%'
        };
    }
});

const checkLayout = () => {
    isVertical.value = window.innerWidth < 768;
};

const startResize = () => {
    isResizing = true;
    document.body.style.cursor = isVertical.value ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
};

const handleResize = (e) => {
    if (!isResizing) return;

    if (isVertical.value) {
        // 垂直布局
        const containerHeight = window.innerHeight;
        const newHeight = (e.clientY / containerHeight) * 100;
        if (newHeight >= 20 && newHeight <= 80) {
            codePanelWidth.value = newHeight;
        }
    } else {
        // 水平布局
        const containerWidth = window.innerWidth;
        const newWidth = (e.clientX / containerWidth) * 100;
        if (newWidth >= 30 && newWidth <= 70) {
            codePanelWidth.value = newWidth;
        }
    }
};

const stopResize = () => {
    isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
};

onMounted(() => {
    checkLayout();
    window.addEventListener('resize', checkLayout);
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkLayout);
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
});
</script>

<style scoped>
.split-layout {
    display: flex;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    position: relative;
}

.toggle-button {
    position: absolute;
    bottom: 20px;
    z-index: 1000;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 8px;
    background: rgba(51, 51, 51, 0.9);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    left: 20px;
}

.toggle-button.button-hidden {
    left: 20px;
}

.toggle-button:hover {
    background: var(--primary-color, #4caf50);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.toggle-button:active {
    transform: scale(0.95);
}

.toggle-button svg {
    transition: transform 0.3s ease;
}

.code-panel {
    height: 100%;
    overflow: hidden;
    background: var(--code-bg);
    flex-shrink: 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 1;
}

.code-panel.panel-hidden {
    opacity: 0;
    pointer-events: none;
}

.resizer {
    width: 4px;
    height: 100%;
    background: #333;
    cursor: col-resize;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    opacity: 1;
}

.resizer:hover {
    background: var(--primary-color);
}

.resizer.vertical {
    width: 100%;
    height: 4px;
    cursor: row-resize;
}

.resizer.resizer-hidden {
    opacity: 0;
    pointer-events: none;
    width: 0;
}

.resizer.vertical.resizer-hidden {
    height: 0;
    width: 100%;
}

.scene-panel {
    height: 100%;
    overflow: hidden;
    background: #000;
    flex: 1;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* sceneOnly 模式样式 */
.split-layout.scene-only-mode {
    display: block;
}

.split-layout.scene-only-mode .scene-panel {
    width: 100%;
    height: 100%;
}

/* 响应式布局 */
@media (max-width: 768px) {
    .split-layout {
        flex-direction: column;
    }

    .toggle-button {
        top: 10px;
        left: 10px;
        width: 36px;
        height: 36px;
    }

    .toggle-button.button-hidden {
        left: 10px;
    }
}
</style>

