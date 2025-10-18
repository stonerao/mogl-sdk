<template>
    <div class="examples-page">
        <!-- 顶部导航栏 -->
        <div class="top-navbar">
            <button class="back-button" @click="navigateToHome">
                <span class="back-arrow">←</span>
                {{ t('common.backToHome') }}
            </button>
            <h1 class="page-title">{{ t('home.title') }}</h1>
            <div class="navbar-spacer"></div>
        </div>

        <!-- 左右分栏布局 -->
        <div class="split-container">
            <!-- 左侧：案例列表 -->
            <div class="sidebar">
                <div class="sidebar-header">
                    <h2 class="sidebar-title">{{ t('home.subtitle') }}</h2>
                    <p class="sidebar-version">Vue 3 + Vite + Three.js</p>
                </div>

                <!-- 分类过滤 -->
                <div class="category-filter">
                    <button
                        v-for="cat in categories"
                        :key="cat"
                        :class="['category-btn', { active: selectedCategory === cat }]"
                        @click="selectedCategory = cat"
                    >
                        {{ t(`home.categories.${cat}`) }}
                    </button>
                </div>

                <!-- 示例列表 -->
                <div class="examples-list">
                    <div
                        v-for="example in filteredExamples"
                        :key="example.id"
                        :class="['example-item', { active: selectedExample?.id === example.id }]"
                        @click="selectExample(example)"
                    >
                        <div class="item-header">
                            <h3 class="item-title">{{ getExampleTitle(example.key) }}</h3>
                            <span class="item-badge" :class="`badge-${example.category}`">
                                {{ t(`home.categories.${example.category}`) }}
                            </span>
                        </div>
                        <p class="item-description">{{ getExampleDescription(example.key) }}</p>
                    </div>
                </div>

                <!-- 页脚 -->
                <div class="sidebar-footer">
                    <div class="footer-contact">
                        <span>Contact: </span>
                        <a href="mailto:stoneraoy@gmail.com" class="contact-email"
                            >stoneraoy@gmail.com</a
                        >
                    </div>
                </div>
            </div>

            <!-- 右侧：案例展示区域 -->
            <div class="content-area">
                <div v-if="!selectedExample" class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3 class="empty-title">请从左侧选择一个案例</h3>
                    <p class="empty-desc">点击左侧列表中的任意案例，在此处查看效果</p>
                </div>
                <div v-else class="iframe-container">
                    <div class="iframe-header">
                        <h2 class="iframe-title">{{ getExampleTitle(selectedExample.key) }}</h2>
                        <button
                            class="open-new-tab-btn"
                            @click="openInNewTab"
                            title="在新标签页打开"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M14 9V13C14 13.5304 13.7893 14.0391 13.4142 14.4142C13.0391 14.7893 12.5304 15 12 15H3C2.46957 15 1.96086 14.7893 1.58579 14.4142C1.21071 14.0391 1 13.5304 1 13V4C1 3.46957 1.21071 2.96086 1.58579 2.58579C1.96086 2.21071 2.46957 2 3 2H7M11 1H15M15 1V5M15 1L7 9"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                            <span>在新窗口打开</span>
                        </button>
                    </div>
                    <iframe
                        :key="selectedExample.id"
                        :src="getIframeSrc(selectedExample.route)"
                        class="example-iframe"
                        frameborder="0"
                    ></iframe>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

// 分类选项
const categories = ['all', 'basic', 'advanced', 'effects', 'geometry'];
const selectedCategory = ref('all');

// 当前选中的案例
const selectedExample = ref(null);

// 示例数据（使用 key 来映射 i18n）
const examples = ref([
    {
        id: 1,
        key: '01-hello-world',
        category: 'basic',
        route: '/examples/01-hello-world'
    },
    {
        id: 2,
        key: '02-camera-controls',
        category: 'basic',
        route: '/examples/02-camera-controls'
    },
    {
        id: 3,
        key: '03-lighting',
        category: 'basic',
        route: '/examples/03-lighting'
    },
    {
        id: 4,
        key: '04-model-loader',
        category: 'basic',
        route: '/examples/04-model-loader'
    },
    {
        id: 5,
        key: '05-animations',
        category: 'basic',
        route: '/examples/05-animations'
    },
    {
        id: 6,
        key: '06-particle-system',
        category: 'effects',
        route: '/examples/06-particle-system'
    },
    {
        id: 7,
        key: '07-advanced-model-loader',
        category: 'advanced',
        route: '/examples/07-advanced-model-loader'
    },
    {
        id: 8,
        key: '08-model-bake',
        category: 'advanced',
        route: '/examples/08-model-bake'
    },
    {
        id: 9,
        key: '09-label-3d',
        category: 'advanced',
        route: '/examples/09-label3d'
    },
    {
        id: 10,
        key: '10-migration-line',
        category: 'advanced',
        route: '/examples/10-migration-line'
    },
    {
        id: 11,
        key: '11-area-block',
        category: 'advanced',
        route: '/examples/11-area-block'
    },
    {
        id: 12,
        key: '12-image-marker',
        category: 'advanced',
        route: '/examples/12-image-marker'
    },
    {
        id: 13,
        key: '13-pipeline',
        category: 'effects',
        route: '/examples/13-pipeline'
    },
    {
        id: 14,
        key: '14-bvh-query',
        category: 'advanced',
        route: '/examples/14-bvh-query'
    },
    {
        id: 15,
        key: '15-extruded-polygon',
        category: 'geometry',
        route: '/examples/15-extruded-polygon'
    },
    {
        id: 16,
        key: '16-instanced-model',
        category: 'advanced',
        route: '/examples/16-instanced-model'
    },
    {
        id: 17,
        key: '17-shader-material',
        category: 'advanced',
        route: '/examples/17-shader-material'
    },
    {
        id: 18,
        key: '18-path-tracer',
        category: 'expert',
        route: '/examples/18-path-tracer'
    },
    {
        id: 19,
        key: '19-skeletal-animation',
        category: 'advanced',
        route: '/examples/19-skeletal-animation'
    },
    {
        id: 20,
        key: '20-post-processing',
        category: 'effects',
        route: '/examples/20-post-processing'
    }
]);

// 过滤示例
const filteredExamples = computed(() => {
    if (selectedCategory.value === 'all') {
        return examples.value;
    }
    return examples.value.filter((ex) => ex.category === selectedCategory.value);
});

// 获取示例标题
const getExampleTitle = (key) => {
    return t(`home.examples.${key}.title`);
};

// 获取示例描述
const getExampleDescription = (key) => {
    return t(`home.examples.${key}.description`);
};

// 选择案例（在 iframe 中显示）
const selectExample = (example) => {
    selectedExample.value = example;
};

// 获取 iframe 的 src（添加 sceneOnly 参数）
const getIframeSrc = (route) => {
    return `${route}?sceneOnly=true`;
};

// 在新标签页打开当前案例（不带 sceneOnly 参数，显示完整布局）
const openInNewTab = () => {
    if (selectedExample.value) {
        window.open(selectedExample.value.route, '_blank');
    }
};

// 返回首页
const navigateToHome = () => {
    router.push('/');
};
</script>

<style scoped>
.examples-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
}

/* 顶部导航栏 */
.top-navbar {
    display: flex;
    align-items: center;
    padding: 16px 24px;
    background: white;
    border-bottom: 1px solid #e0e0e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.back-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: white;
    border: 1px solid #e0e0e0;
    color: #333;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.back-button:hover {
    background: #f5f7fa;
    border-color: #667eea;
    color: #667eea;
}

.back-arrow {
    font-size: 16px;
    transition: transform 0.3s ease;
}

.back-button:hover .back-arrow {
    transform: translateX(-3px);
}

.page-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0 auto;
}

.navbar-spacer {
    width: 100px;
}

/* 左右分栏容器 */
.split-container {
    flex: 1;
    display: flex;
    overflow: hidden;
}

/* 左侧边栏 */
.sidebar {
    width: 380px;
    background: white;
    border-right: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.sidebar-header {
    padding: 24px 20px 16px;
    border-bottom: 1px solid #e0e0e0;
}

.sidebar-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
}

.sidebar-version {
    font-size: 13px;
    color: #999;
}

/* 分类过滤 */
.category-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 16px 20px;
    border-bottom: 1px solid #e0e0e0;
}

.category-btn {
    padding: 6px 14px;
    background: white;
    border: 1px solid #e0e0e0;
    color: #666;
    border-radius: 16px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.3s;
}

.category-btn:hover {
    background: #f5f7fa;
    border-color: #667eea;
    color: #667eea;
}

.category-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;
    color: white;
    font-weight: 600;
}

/* 示例列表 */
.examples-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
}

.example-item {
    padding: 16px;
    margin-bottom: 8px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.example-item:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
    transform: translateX(4px);
}

.example-item.active {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    gap: 8px;
}

.item-title {
    font-size: 15px;
    color: #333;
    font-weight: 600;
    line-height: 1.4;
    flex: 1;
}

.item-description {
    color: #666;
    line-height: 1.5;
    font-size: 13px;
}

.item-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    color: white;
    flex-shrink: 0;
}

.badge-basic {
    background: linear-gradient(135deg, #667eea, #764ba2);
}

.badge-advanced {
    background: linear-gradient(135deg, #f093fb, #f5576c);
}

.badge-effects {
    background: linear-gradient(135deg, #fa709a, #fee140);
}

.badge-geometry {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.badge-expert {
    background: linear-gradient(135deg, #fa709a, #fee140);
}

/* 侧边栏页脚 */
.sidebar-footer {
    padding: 16px 20px;
    border-top: 1px solid #e0e0e0;
    background: #fafafa;
}

.footer-contact {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #666;
}

.contact-email {
    color: #667eea;
    text-decoration: none;
    padding: 2px 8px;
    border-radius: 4px;
    background: #f0f0f0;
    transition: all 0.3s ease;
}

.contact-email:hover {
    background: #e0e0e0;
    text-decoration: underline;
}

/* 右侧内容区域 */
.content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fafafa;
    overflow: hidden;
}

/* 空状态 */
.empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
}

.empty-title {
    font-size: 20px;
    color: #666;
    margin-bottom: 8px;
}

.empty-desc {
    font-size: 14px;
    color: #999;
}

/* iframe 容器 */
.iframe-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.iframe-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: white;
    border-bottom: 1px solid #e0e0e0;
}

.iframe-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.open-new-tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: white;
    border: 1px solid #e0e0e0;
    color: #667eea;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.open-new-tab-btn:hover {
    background: #f5f7fa;
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.example-iframe {
    flex: 1;
    width: 100%;
    border: none;
    background: white;
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .sidebar {
        width: 320px;
    }

    .page-title {
        font-size: 18px;
    }
}

@media (max-width: 768px) {
    .split-container {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
        max-height: 40vh;
        border-right: none;
        border-bottom: 1px solid #e0e0e0;
    }

    .content-area {
        flex: 1;
    }

    .top-navbar {
        padding: 12px 16px;
    }

    .page-title {
        font-size: 16px;
    }

    .navbar-spacer {
        width: 80px;
    }

    .back-button {
        padding: 6px 12px;
        font-size: 13px;
    }

    .sidebar-header {
        padding: 16px;
    }

    .sidebar-title {
        font-size: 16px;
    }

    .category-filter {
        padding: 12px 16px;
    }

    .examples-list {
        padding: 8px;
    }

    .example-item {
        padding: 12px;
    }

    .item-title {
        font-size: 14px;
    }

    .item-description {
        font-size: 12px;
    }

    .iframe-header {
        padding: 12px 16px;
    }

    .iframe-title {
        font-size: 16px;
    }

    .open-new-tab-btn {
        padding: 6px 12px;
        font-size: 12px;
    }

    .open-new-tab-btn span {
        display: none;
    }
}
</style>


