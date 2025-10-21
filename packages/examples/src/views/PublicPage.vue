<template>
  <div class="public-page">
    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <button class="back-button" @click="navigateToHome">
        <span class="back-arrow">←</span>
        {{ t('common.backToHome') }}
      </button>
      <h1 class="page-title">{{ t('public.title') }}</h1>
      <div class="navbar-spacer"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <p class="subtitle">{{ t('public.subtitle') }}</p>

      <div v-if="projects.length === 0" class="empty-state">
        <div class="empty-icon">📁</div>
        <h3 class="empty-title">{{ t('public.empty') }}</h3>
      </div>

      <div v-else class="cards-grid">
        <div
          v-for="proj in projects"
          :key="proj.name"
          class="project-card"
          @click="openProject(proj)"
          role="button"
          tabindex="0"
        >
          <div class="card-icon">🏷️</div>
          <div class="card-content">
            <h3 class="card-title">{{ proj.name }}</h3>
            <p class="card-desc">/public/{{ proj.name }}</p>
          </div>
          <button class="open-btn" @click.stop="openProject(proj)">{{ t('public.open') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

// 自动扫描 views/public 下的所有子目录的 index.vue
// 例如: './public/DigitalFactory/index.vue' -> 项目名: 'DigitalFactory'
const modules = import.meta.glob('./public/**/index.vue')

const projects = computed(() => {
  return Object.keys(modules)
    .map((path) => {
      const match = path.match(/\.\/public\/(.*?)\/index\.vue$/)
      return match ? { name: match[1], route: `/public/${match[1]}` } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name))
})

const openProject = (proj) => {
  router.push(proj.route)
}

const navigateToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.public-page {
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
  background: #f8f9fb;
  border-color: #d0d0d0;
}
.back-arrow {
  font-size: 16px;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.navbar-spacer { width: 120px; }

/* 内容区域 */
.content {
  flex: 1;
  padding: 16px 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.subtitle {
  color: #666;
  margin: 8px 0 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #999;
}
.empty-icon { font-size: 40px; margin-bottom: 12px; }
.empty-title { font-size: 16px; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.project-card:hover {
  transform: translateY(-2px);
  border-color: #667eea;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
}
.card-icon { font-size: 24px; }
.card-content { flex: 1; }
.card-title { font-size: 16px; font-weight: 600; color: #333; }
.card-desc { font-size: 12px; color: #999; }
.open-btn {
  align-self: flex-end;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: #667eea;
  color: white;
  cursor: pointer;
}
.open-btn:hover { opacity: 0.9; }

@media (max-width: 768px) {
  .page-title { font-size: 16px; }
}
</style>
