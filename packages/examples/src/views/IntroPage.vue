<template>
    <div class="intro-page">
        <!-- 语言切换器 - 移到最顶部 -->
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

        <div class="intro-container">
            <!-- 主要内容区域 -->
            <div class="intro-content">
                <!-- Logo 和标题 -->
                <div class="intro-header">
                    <h1 class="intro-title">{{ t('intro.title') }}</h1>
                    <p class="intro-subtitle">{{ t('intro.subtitle') }}</p>
                </div>

                <!-- 特性展示 -->
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">⚡</div>
                        <h3 class="feature-title">{{ t('intro.features.fast') }}</h3>
                        <p class="feature-desc">{{ t('intro.features.fastDesc') }}</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🚀</div>
                        <h3 class="feature-title">{{ t('intro.features.powerful') }}</h3>
                        <p class="feature-desc">{{ t('intro.features.powerfulDesc') }}</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🔧</div>
                        <h3 class="feature-title">{{ t('intro.features.flexible') }}</h3>
                        <p class="feature-desc">{{ t('intro.features.flexibleDesc') }}</p>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="intro-actions">
                    <a
                        href="https://github.com/stonerao/mogl-sdk"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn-github"
                    >
                        <svg class="github-icon" viewBox="0 0 16 16" width="20" height="20">
                            <path
                                fill="currentColor"
                                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                            ></path>
                        </svg>
                        {{ t('intro.githubLabel') }}
                    </a>
                    <button class="btn btn-primary" @click="navigateToExamples">
                        {{ t('intro.viewExamples') }}
                        <span class="btn-arrow">→</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 页脚 - 移到最底部 -->
        <div class="intro-footer">
            <div class="footer-content">
                <p class="footer-contact">
                    Contact:
                    <a href="mailto:stoneraoy@gmail.com" class="contact-link"
                        >stoneraoy@gmail.com</a
                    >
                </p>
                <div class="footer-info">
                    <span class="footer-item">备案号</span>
                    <span class="footer-separator">|</span>
                    <span class="footer-item">正在申请中...</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t, locale } = useI18n();

// 语言选项
const languages = [
    { label: '中文', value: 'zh-CN' },
    { label: 'English', value: 'en-US' }
];

// 切换语言
const switchLanguage = (lang) => {
    locale.value = lang;
    localStorage.setItem('w3d-locale', lang);
};

// 导航到案例列表
const navigateToExamples = () => {
    router.push('/examples');
};
</script>

<style scoped>
.intro-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    position: relative;
}

.intro-container {
    flex: 1;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

/* 语言切换器 - 移到顶部 */
.language-switcher {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 20px 40px;
    z-index: 10;
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

/* 主要内容 - 移除白色背景 */
.intro-content {
    width: 100%;
    padding: 40px 20px;
}

/* 头部 */
.intro-header {
    text-align: center;
    margin-bottom: 50px;
}

.intro-title {
    font-size: 56px;
    font-weight: bold;
    color: white;
    margin-bottom: 20px;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.intro-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.8;
    max-width: 700px;
    margin: 0 auto;
    text-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);
}

/* 特性网格 */
.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    margin-bottom: 50px;
}

.feature-card {
    text-align: center;
    padding: 30px 20px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.feature-icon {
    font-size: 48px;
    margin-bottom: 15px;
}

.feature-title {
    font-size: 20px;
    font-weight: 600;
    color: white;
    margin-bottom: 10px;
    text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}

.feature-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 操作按钮 */
.intro-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 32px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    border: none;
}

.btn-github {
    background: #24292e;
    color: white;
}

.btn-github:hover {
    background: #1a1e22;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(36, 41, 46, 0.3);
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.github-icon {
    flex-shrink: 0;
}

.btn-arrow {
    font-size: 20px;
    transition: transform 0.3s ease;
}

.btn-primary:hover .btn-arrow {
    transform: translateX(4px);
}

/* 页脚 - 固定在底部 */
.intro-footer {
    width: 100%;
    padding: 30px 20px;
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
    max-width: 1000px;
    margin: 0 auto;
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
}

.footer-contact {
    margin-bottom: 12px;
}

.contact-link {
    color: white;
    text-decoration: none;
    padding: 4px 10px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.15);
    transition: all 0.3s ease;
}

.contact-link:hover {
    background: rgba(255, 255, 255, 0.25);
    text-decoration: underline;
}

.footer-info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
}

.footer-item {
    white-space: nowrap;
}

.footer-separator {
    color: rgba(255, 255, 255, 0.5);
}

/* 响应式 */
@media (max-width: 768px) {
    .language-switcher {
        justify-content: center;
        padding: 15px 20px;
    }

    .intro-container {
        padding: 15px;
    }

    .intro-content {
        padding: 20px 15px;
    }

    .intro-title {
        font-size: 40px;
    }

    .intro-subtitle {
        font-size: 16px;
    }

    .features-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .intro-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }

    .footer-content {
        padding: 0 10px;
    }

    .footer-info {
        font-size: 12px;
        gap: 8px;
    }

    .footer-separator {
        display: none;
    }

    .footer-info {
        flex-direction: column;
        gap: 5px;
    }
}
</style>

