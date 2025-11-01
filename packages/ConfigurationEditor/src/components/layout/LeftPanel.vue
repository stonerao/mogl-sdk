<template>
  <aside class="left-panel" :class="{ collapsed: isCollapsed }">
    <!-- 面板头部 -->
    <div class="panel-header">
      <span v-if="!isCollapsed" class="panel-title">{{ getPanelTitle() }}</span>
      <button class="collapse-btn" @click="toggleCollapse">
        <span class="icon">{{ isCollapsed ? '▶' : '◀' }}</span>
      </button>
    </div>

    <!-- 面板内容 -->
    <div v-if="!isCollapsed" class="panel-content-wrapper">
      <!-- 选项卡 -->
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <!-- <span class="tab-icon">{{ tab.icon }}</span> -->
          <span class="tab-label">{{ tab.label }}</span>
        </div>
      </div>

      <!-- 选项卡内容 -->
      <div class="tab-content-area">
        <!-- 组件库标签页 -->
        <div v-if="activeTab === 'components'" class="panel-content custom-scrollbar">
          <!-- 搜索框 -->
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索组件..."
              class="search-input"
            />
          </div>

          <!-- 组件分类 -->
          <div class="component-categories">
            <div v-for="category in filteredCategories" :key="category.name" class="category">
              <div class="category-header" @click="toggleCategory(category.name)">
                <span class="category-icon">{{ category.expanded ? '▼' : '▶' }}</span>
                <span class="category-name">{{ category.label }}</span>
                <span class="category-count">{{ category.items.length }}</span>
              </div>

              <div v-if="category.expanded" class="category-items">
                <div
                  v-for="item in category.items"
                  :key="item.type"
                  class="component-item"
                  draggable="true"
                  @dragstart="handleDragStart($event, item)"
                  @dragend="handleDragEnd"
                >
                  <!-- <span class="component-icon">{{ item.icon }}</span> -->
                  <span class="component-name">{{ item.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 节点列表标签页 -->
        <div v-if="activeTab === 'nodes'" class="nodes-panel">
          <NodeListPanel />
        </div>

        <!-- 全局事件标签页 -->
        <div v-if="activeTab === 'globalEvents'" class="global-events-panel">
          <GlobalEventPanel />
        </div>

        <!-- 数据源标签页 -->
        <div v-if="activeTab === 'datasources'" class="datasources-panel">
          <DataSourcePanel />
        </div>

        <!-- 图片资源标签页 -->
        <div v-if="activeTab === 'imageAssets'" class="image-assets-panel-wrapper">
          <ImageAssetsPanel />
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '@/store';
import NodeListPanel from '../editor/NodeListPanel.vue';
import GlobalEventPanel from '../editor/GlobalEventPanel.vue';
import DataSourcePanel from '../editor/DataSourcePanel.vue';
import ImageAssetsPanel from '../editor/ImageAssetsPanel.vue';

// Store
const editorStore = useEditorStore();

// 状态
const isCollapsed = ref(false);
const activeTab = ref('nodes'); // 默认显示节点列表
const searchQuery = ref('');

// 监听打开全局事件面板的事件
const handleOpenGlobalEventsPanel = () => {
  activeTab.value = 'globalEvents';
};

// 监听打开图片资源面板的事件
const handleOpenImageAssetsPanel = () => {
  activeTab.value = 'imageAssets';
};

onMounted(() => {
  window.addEventListener('open-global-events-panel', handleOpenGlobalEventsPanel);
  window.addEventListener('open-image-assets-panel', handleOpenImageAssetsPanel);
});

onUnmounted(() => {
  window.removeEventListener('open-global-events-panel', handleOpenGlobalEventsPanel);
  window.removeEventListener('open-image-assets-panel', handleOpenImageAssetsPanel);
});

// 选项卡配置
const tabs = [
  { key: 'nodes', label: '节点', icon: '📋' },
  { key: 'components', label: '组件', icon: '🧩' },
  { key: 'imageAssets', label: '资源', icon: '🖼️' },
  { key: 'globalEvents', label: '事件', icon: '⚡' },
  { key: 'datasources', label: '数据源', icon: '🗄️' }
];

// 组件分类数据
const categories = ref([
  {
    name: 'basic',
    label: '基础形状',
    expanded: true,
    items: [
      { type: 'rect', name: '矩形', icon: '▭', description: '矩形节点，支持圆角和边框' },
      { type: 'circle', name: '圆形', icon: '○', description: '圆形节点，支持圆弧' },
      { type: 'editable-line', name: '线条', icon: '📏', description: '可编辑线条，支持多段折线' },
      { type: 'network-element', name: '网关', icon: '📏', description: '网关' },
      {
        type: 'devices',
        name: '手机',
        icon: '📏',
        description: '网关',
        option: {
          state: 0,
          width: 100,
          height: 100,
          states: [
            {
              stateId: 0,
              stateName: '正常',
              icon: '/icons/多模态网元.png',
              style: { opacity: 1.0 }
            }
          ]
        }
      }
    ]
  },
  {
    name: 'text',
    label: '文本',
    expanded: true,
    items: [{ type: 'text', name: '文本', icon: 'T', description: '文本节点，支持字体样式' }]
  },
  {
    name: 'media',
    label: '媒体',
    expanded: false,
    items: [{ type: 'image', name: '图片', icon: '🖼️', description: '图片节点，支持多种适应方式' }]
  },
  {
    name: 'container',
    label: '容器',
    expanded: true,
    items: [{ type: 'group', name: '分组', icon: '📁', description: '分组容器，可包含多个子节点' }]
  } /* ,
  {
    name: 'chart',
    label: '图表',
    expanded: false,
    items: [
      { type: 'line-chart', name: '折线图', icon: '📈', description: '折线图（待实现）' },
      { type: 'bar-chart', name: '柱状图', icon: '📊', description: '柱状图（待实现）' },
      { type: 'pie-chart', name: '饼图', icon: '🥧', description: '饼图（待实现）' },
      { type: 'gauge', name: '仪表盘', icon: '⏲️', description: '仪表盘（待实现）' }
    ]
  },
  {
    name: 'control',
    label: '控件',
    expanded: false,
    items: [
      { type: 'button', name: '按钮', icon: '🔘', description: '按钮（待实现）' },
      { type: 'switch', name: '开关', icon: '🔀', description: '开关（待实现）' },
      { type: 'slider', name: '滑块', icon: '🎚️', description: '滑块（待实现）' },
      { type: 'input', name: '输入框', icon: '📝', description: '输入框（待实现）' }
    ]
  } */
]);

// 计算属性：过滤后的分类
const filteredCategories = computed(() => {
  if (!searchQuery.value) {
    return categories.value;
  }

  const query = searchQuery.value.toLowerCase();
  return categories.value
    .map(category => ({
      ...category,
      items: category.items.filter(
        item => item.name.toLowerCase().includes(query) || item.type.toLowerCase().includes(query)
      )
    }))
    .filter(category => category.items.length > 0);
});

// 方法
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const toggleCategory = categoryName => {
  const category = categories.value.find(c => c.name === categoryName);
  if (category) {
    category.expanded = !category.expanded;
  }
};

const handleDragStart = (event, item) => {
  // 设置拖拽数据
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('component-type', item.type);
  event.dataTransfer.setData('component-option', JSON.stringify(item.option || '{}'));

  // 通知 store 开始拖拽
  editorStore.startDraggingComponent(item.type);

  console.log('开始拖拽组件:', item.name);
};

const handleDragEnd = () => {
  // 通知 store 结束拖拽
  editorStore.endDraggingComponent();

  console.log('结束拖拽');
};

/**
 * 获取面板标题
 */
const getPanelTitle = () => {
  const titleMap = {
    nodes: '节点列表',
    components: '组件库',
    globalEvents: '全局事件',
    datasources: '数据源'
  };
  return titleMap[activeTab.value] || '左侧面板';
};
</script>

<style scoped>
.left-panel {
  width: var(--left-panel-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
}

.left-panel.collapsed {
  width: var(--panel-collapsed-width);
}

/* 面板头部 */
.panel-header {
  height: 40px;
  padding: 0 var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
}

.collapse-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.collapse-btn:hover {
  background: var(--bg-hover);
}

.collapse-btn .icon {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 面板内容包装器 */
.panel-content-wrapper {
  flex: 1;
  display: flex;
  /* flex-direction: column; */
  overflow: hidden;
}

/* 选项卡 */
.tabs {
  width: 40px;
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  flex-direction: column;
}

.tab-item {
  /* flex: 1; */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  cursor: pointer;
  /* border-bottom: 2px solid transparent; */
  transition: all var(--transition-fast);
  padding-top: 15px;
  padding-bottom: 15px;
  text-align: center;
}

.tab-item:hover {
  background: var(--bg-hover);
}

.tab-item.active {
  border-bottom-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--bg-hover);
}

.tab-icon {
  font-size: 16px;
}

.tab-label {
  font-size: var(--font-size-sm);
}

/* 选项卡内容区域 */
.tab-content-area {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 面板内容 */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

/* 节点列表面板不需要 padding */
.nodes-panel,
.global-events-panel,
.datasources-panel {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 搜索框 */
.search-box {
  margin-bottom: var(--spacing-md);
}

.search-input {
  width: 100%;
  height: 32px;
  padding: 0 var(--spacing-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-fast);
}

.search-input:focus {
  border-color: var(--primary-color);
}

.search-input::placeholder {
  color: var(--text-disabled);
}

/* 组件分类 */
.component-categories {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.category {
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: var(--bg-tertiary);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.category-header:hover {
  background: var(--bg-hover);
}

.category-icon {
  font-size: 10px;
  color: var(--text-secondary);
}

.category-name {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.category-count {
  font-size: var(--font-size-xs);
  color: var(--text-disabled);
}

/* 组件项 */
.category-items {
  display: grid;
  /* 2x */
  grid-template-columns: repeat(2, 1fr);
  flex-direction: column;
  gap: 2px;
  padding: var(--spacing-xs);
  background: var(--bg-primary);
}

.component-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: grab;
  transition: all var(--transition-fast);
}

.component-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-light);
}

.component-item:active {
  cursor: grabbing;
}

.component-icon {
  font-size: 18px;
}

.component-name {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

/* 图片资源面板包装器 */
.image-assets-panel-wrapper {
  height: 100%;
  overflow: hidden;
}
</style>

