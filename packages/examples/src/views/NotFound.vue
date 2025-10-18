<template>
    <div class="not-found-page">
        <div class="not-found-container">
            <div class="error-code">404</div>
            <h1 class="error-title">页面未找到</h1>
            <p class="error-message">抱歉，您访问的页面不存在</p>
            <button class="btn btn-primary" @click="goHome">返回首页</button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
    router.push('/');
};
</script>

<style scoped>
.not-found-page {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    color: #333;
    text-align: center;
    padding: 20px;
}

.not-found-container {
    max-width: 600px;
}

.error-code {
    font-size: 120px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #667eea;
    text-shadow: 0 2px 10px rgba(102, 126, 234, 0.2);
}

.error-title {
    font-size: 36px;
    margin-bottom: 10px;
    color: #333;
}

.error-message {
    font-size: 18px;
    color: #666;
    margin-bottom: 30px;
}

.btn {
    padding: 12px 24px;
    font-size: 16px;
    font-weight: bold;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
</style>

