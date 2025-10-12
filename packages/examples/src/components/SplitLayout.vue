<template>
  <div class="split-layout">
    <!-- 代码面板 -->
    <div 
      class="code-panel" 
      :style="{ width: isVertical ? '100%' : `${codePanelWidth}%`, height: isVertical ? `${codePanelWidth}%` : '100%' }"
    >
      <CodePanel 
        :code="code" 
        :language="language"
        :title="title"
      />
    </div>

    <!-- 分隔条 -->
    <div 
      class="resizer"
      :class="{ vertical: isVertical }"
      @mousedown="startResize"
    ></div>

    <!-- 场景面板 -->
    <div 
      class="scene-panel"
      :style="{ width: isVertical ? '100%' : `${100 - codePanelWidth}%`, height: isVertical ? `${100 - codePanelWidth}%` : '100%' }"
    >
      <ScenePanel :title="title">
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
  }
});

// 代码面板宽度（百分比）
const codePanelWidth = ref(40);

// 是否垂直布局（移动端）
const isVertical = ref(false);

// 调整大小相关
let isResizing = false;

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
}

.code-panel {
  height: 100%;
  overflow: hidden;
  background: var(--code-bg);
}

.resizer {
  width: 4px;
  height: 100%;
  background: #333;
  cursor: col-resize;
  transition: background 0.2s;
  flex-shrink: 0;
}

.resizer:hover {
  background: var(--primary-color);
}

.resizer.vertical {
  width: 100%;
  height: 4px;
  cursor: row-resize;
}

.scene-panel {
  height: 100%;
  overflow: hidden;
  background: #000;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .split-layout {
    flex-direction: column;
  }
}
</style>

