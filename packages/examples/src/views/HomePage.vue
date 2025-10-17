<template>
    <div class="home-page">
        <div class="home-container">
            <!-- 标题和语言切换 -->
            <div class="home-header">
                <div class="header-content">
                    <h1 class="title">{{ t('home.title') }}</h1>
                    <p class="subtitle">{{ t('home.subtitle') }}</p>
                    <p class="version">Vue 3 + Vite + Three.js</p>
                </div>
                <div class="language-switcher">
                    <button
                        v-for="lang in languages"
                        :key="lang.value"
                        :class="['lang-btn', { active: locale === lang.value }]"
                        @click="switchLanguage(lang.value)"
                    >
                        {{ lang.label }}
                    </button>
                </div>
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

            <!-- 示例卡片网格 -->
            <div class="examples-grid">
                <div
                    v-for="example in filteredExamples"
                    :key="example.id"
                    class="example-card"
                    @click="navigateToExample(example)"
                >
                    <div class="card-header">
                        <h3 class="card-title">{{ getExampleTitle(example.key) }}</h3>
                        <span class="card-badge" :class="`badge-${example.category}`">
                            {{ t(`home.categories.${example.category}`) }}
                        </span>
                    </div>
                    <p class="card-description">{{ getExampleDescription(example.key) }}</p>
                    <div class="card-footer">
                        <span class="card-arrow">→</span>
                    </div>
                </div>
            </div>

            <!-- 页脚 -->
            <div class="home-footer">
                <div class="footer-contact">
                    <span>Contact: </span>
                    <a href="mailto:stoneraoy@gmail.com" class="contact-email"
                        >stoneraoy@gmail.com</a
                    >
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
const { t, locale } = useI18n();

// 语言选项
const languages = [
    { label: '中文', value: 'zh-CN' },
    { label: 'English', value: 'en-US' }
];

// 分类选项
const categories = ['all', 'basic', 'advanced', 'effects', 'geometry'];
const selectedCategory = ref('all');

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
        route: '/examples/08-henglaji-baked-lighting'
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

// 切换语言
const switchLanguage = (lang) => {
    locale.value = lang;
    localStorage.setItem('w3d-locale', lang);
};

// 导航到示例
const navigateToExample = (example) => {
    router.push(example.route);
};
</script>

<style scoped>
.home-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 15px;
}

.home-container {
    width: 100%;
    max-width: 1400px;
}

.home-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    color: white;
}

.header-content {
    flex: 1;
}

.title {
    font-size: 42px;
    font-weight: bold;
    margin-bottom: 8px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.subtitle {
    font-size: 18px;
    opacity: 0.95;
    margin-bottom: 4px;
}

.version {
    font-size: 14px;
    opacity: 0.8;
}

/* 语言切换器 */
.language-switcher {
    display: flex;
    gap: 8px;
}

.lang-btn {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
}

.lang-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
}

.lang-btn.active {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
    font-weight: bold;
}

/* 分类过滤 */
.category-filter {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 25px;
}

.category-btn {
    padding: 8px 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
}

.category-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.category-btn.active {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
    font-weight: bold;
}

/* 示例卡片网格 - 更紧凑的布局 */
.examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 40px;
}

.example-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.example-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transform: scaleX(0);
    transition: transform 0.3s ease;
}

.example-card:hover::before {
    transform: scaleX(1);
}

.example-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
    gap: 10px;
}

.card-title {
    font-size: 16px;
    color: #333;
    font-weight: 600;
    line-height: 1.3;
    flex: 1;
}

.card-description {
    color: #666;
    line-height: 1.5;
    font-size: 13px;
    margin-bottom: 12px;
    flex: 1;
}

.card-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: auto;
}

.card-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    color: white;
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

.card-arrow {
    font-size: 20px;
    color: #667eea;
    transition: transform 0.3s ease;
}

.example-card:hover .card-arrow {
    transform: translateX(4px);
}

/* 页脚 */
.home-footer {
    text-align: center;
    color: white;
    opacity: 0.9;
    font-size: 13px;
    padding: 20px 0;
}

.footer-contact {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    opacity: 0.9;
}

.contact-email {
    color: #fff;
    text-decoration: none;
    padding: 4px 10px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.15);
    transition: all 0.3s ease;
}

.contact-email:hover {
    background: rgba(255, 255, 255, 0.25);
    text-decoration: underline;
}

/* 响应式 */
@media (max-width: 1024px) {
    .examples-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 14px;
    }
}

@media (max-width: 768px) {
    .home-page {
        padding: 15px 10px;
    }

    .home-header {
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 20px;
    }

    .title {
        font-size: 32px;
    }

    .subtitle {
        font-size: 16px;
    }

    .version {
        font-size: 13px;
    }

    .language-switcher {
        margin-top: 12px;
    }

    .category-filter {
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 20px;
    }

    .category-btn {
        padding: 6px 14px;
        font-size: 13px;
    }

    .examples-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .example-card {
        padding: 16px;
    }

    .card-title {
        font-size: 15px;
    }

    .card-description {
        font-size: 12px;
    }
}
</style>


