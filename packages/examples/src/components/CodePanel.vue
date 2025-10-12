<template>
  <div class="code-panel-container">
    <!-- 头部工具栏 -->
    <div class="code-header">
      <div class="code-title">
        <span class="icon">📝</span>
        <span>{{ title }}</span>
      </div>
      <div class="code-actions">
        <button 
          class="btn-icon" 
          @click="copyCode"
          :title="copied ? '已复制!' : '复制代码'"
        >
          {{ copied ? '✓' : '📋' }}
        </button>
      </div>
    </div>

    <!-- 代码内容 -->
    <div class="code-content" ref="codeContainer">
      <pre class="line-numbers"><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

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
    default: 'Source Code'
  }
});

const codeContainer = ref(null);
const copied = ref(false);

// 高亮代码
const highlightedCode = computed(() => {
  try {
    return Prism.highlight(
      props.code,
      Prism.languages[props.language] || Prism.languages.javascript,
      props.language
    );
  } catch (error) {
    console.error('Code highlighting error:', error);
    return props.code;
  }
});

// 复制代码
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Copy failed:', error);
  }
};

onMounted(() => {
  // 确保 Prism 样式正确应用
  if (codeContainer.value) {
    Prism.highlightAllUnder(codeContainer.value);
  }
});
</script>

<style scoped>
.code-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--code-bg);
  color: #d4d4d4;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--code-header-bg);
  border-bottom: 1px solid var(--code-border);
  flex-shrink: 0;
}

.code-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.icon {
  font-size: 16px;
}

.code-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  color: #d4d4d4;
  border-color: var(--code-border);
}

.btn-icon:hover {
  background: var(--code-border);
}

.code-content {
  flex: 1;
  overflow: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.code-content pre {
  margin: 0;
  padding: 16px;
}

.code-content code {
  display: block;
  white-space: pre;
  word-wrap: normal;
}

/* 行号样式 */
.code-content :deep(.line-numbers-rows) {
  border-right: 1px solid var(--code-border);
}

/* 滚动条样式 */
.code-content::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.code-content::-webkit-scrollbar-track {
  background: var(--code-bg);
}

.code-content::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 5px;
}

.code-content::-webkit-scrollbar-thumb:hover {
  background: #4e4e4e;
}
</style>

