/**
 * Mock API 使用示例
 * 
 * 本文件展示如何在项目中使用 Mock API
 * 
 * 使用前提：
 * 1. 在 .env 文件中设置 VITE_ENABLE_MOCK=true
 * 2. 启动开发服务器 npm run dev
 */

import axios from 'axios';

// ========== 配置 axios 实例 ==========

const api = axios.create({
  baseURL: '/api/mock',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 添加 token（如果有）
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    const { code, message, data } = response.data;
    
    if (code === 200) {
      return data;
    } else {
      console.error(`API Error: ${message}`);
      return Promise.reject(new Error(message));
    }
  },
  error => {
    console.error('Request failed:', error);
    return Promise.reject(error);
  }
);

// ========== 用户相关 API ==========

/**
 * 用户登录
 */
export async function login(username, password) {
  try {
    const data = await api.post('/user/login', {
      username,
      password
    });
    
    console.log('登录成功:', data);
    
    // 保存 token
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser() {
  try {
    const user = await api.get('/user/current');
    console.log('当前用户:', user);
    return user;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
}

/**
 * 获取用户列表
 */
export async function getUserList(params = {}) {
  try {
    const result = await api.get('/users', { params });
    console.log('用户列表:', result);
    return result;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw error;
  }
}

/**
 * 创建用户
 */
export async function createUser(userData) {
  try {
    const user = await api.post('/user', userData);
    console.log('用户创建成功:', user);
    return user;
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
}

/**
 * 更新用户
 */
export async function updateUser(userId, updates) {
  try {
    const user = await api.put(`/user/${userId}`, updates);
    console.log('用户更新成功:', user);
    return user;
  } catch (error) {
    console.error('更新用户失败:', error);
    throw error;
  }
}

/**
 * 删除用户
 */
export async function deleteUser(userId) {
  try {
    await api.delete(`/user/${userId}`);
    console.log('用户删除成功');
  } catch (error) {
    console.error('删除用户失败:', error);
    throw error;
  }
}

// ========== 项目相关 API ==========

/**
 * 获取项目列表
 */
export async function getProjectList(params = {}) {
  try {
    const result = await api.get('/projects', { params });
    console.log('项目列表:', result);
    return result;
  } catch (error) {
    console.error('获取项目列表失败:', error);
    throw error;
  }
}

/**
 * 获取项目详情
 */
export async function getProjectById(projectId) {
  try {
    const project = await api.get(`/project/${projectId}`);
    console.log('项目详情:', project);
    return project;
  } catch (error) {
    console.error('获取项目详情失败:', error);
    throw error;
  }
}

/**
 * 创建项目
 */
export async function createProject(projectData) {
  try {
    const project = await api.post('/project', projectData);
    console.log('项目创建成功:', project);
    return project;
  } catch (error) {
    console.error('创建项目失败:', error);
    throw error;
  }
}

/**
 * 更新项目
 */
export async function updateProject(projectId, updates) {
  try {
    const project = await api.put(`/project/${projectId}`, updates);
    console.log('项目更新成功:', project);
    return project;
  } catch (error) {
    console.error('更新项目失败:', error);
    throw error;
  }
}

/**
 * 删除项目
 */
export async function deleteProject(projectId) {
  try {
    await api.delete(`/project/${projectId}`);
    console.log('项目删除成功');
  } catch (error) {
    console.error('删除项目失败:', error);
    throw error;
  }
}

/**
 * 复制项目
 */
export async function duplicateProject(projectId) {
  try {
    const project = await api.post(`/project/${projectId}/duplicate`);
    console.log('项目复制成功:', project);
    return project;
  } catch (error) {
    console.error('复制项目失败:', error);
    throw error;
  }
}

/**
 * 获取项目模板
 */
export async function getProjectTemplates() {
  try {
    const templates = await api.get('/project/templates');
    console.log('项目模板:', templates);
    return templates;
  } catch (error) {
    console.error('获取项目模板失败:', error);
    throw error;
  }
}

/**
 * 获取项目统计
 */
export async function getProjectStats() {
  try {
    const stats = await api.get('/project/stats');
    console.log('项目统计:', stats);
    return stats;
  } catch (error) {
    console.error('获取项目统计失败:', error);
    throw error;
  }
}

// ========== 资源相关 API ==========

/**
 * 获取资源列表
 */
export async function getAssetList() {
  try {
    const result = await api.get('/assets');
    console.log('资源列表:', result);
    return result;
  } catch (error) {
    console.error('获取资源列表失败:', error);
    throw error;
  }
}

/**
 * 获取资源详情
 */
export async function getAssetById(assetId) {
  try {
    const asset = await api.get(`/asset/${assetId}`);
    console.log('资源详情:', asset);
    return asset;
  } catch (error) {
    console.error('获取资源详情失败:', error);
    throw error;
  }
}

// ========== 使用示例 ==========

/**
 * 示例 1: 用户登录流程
 */
export async function exampleLogin() {
  console.log('\n========== 示例 1: 用户登录 ==========\n');
  
  try {
    // 登录
    const loginResult = await login('admin', 'password123');
    console.log('Token:', loginResult.token);
    
    // 获取当前用户信息
    const currentUser = await getCurrentUser();
    console.log('用户名:', currentUser.username);
    console.log('角色:', currentUser.role);
  } catch (error) {
    console.error('登录流程失败:', error);
  }
}

/**
 * 示例 2: 获取项目列表
 */
export async function exampleGetProjects() {
  console.log('\n========== 示例 2: 获取项目列表 ==========\n');
  
  try {
    // 获取所有项目
    const allProjects = await getProjectList();
    console.log('总项目数:', allProjects.total);
    
    // 获取活动项目
    const activeProjects = await getProjectList({ status: 'active' });
    console.log('活动项目数:', activeProjects.total);
    
    // 搜索项目
    const searchResults = await getProjectList({ keyword: '工厂' });
    console.log('搜索结果:', searchResults.list.length);
  } catch (error) {
    console.error('获取项目列表失败:', error);
  }
}

/**
 * 示例 3: 创建和更新项目
 */
export async function exampleCreateProject() {
  console.log('\n========== 示例 3: 创建和更新项目 ==========\n');
  
  try {
    // 创建项目
    const newProject = await createProject({
      name: '测试项目',
      description: '这是一个测试项目',
      templateId: 'template-1'
    });
    console.log('新项目 ID:', newProject.id);
    
    // 更新项目
    const updatedProject = await updateProject(newProject.id, {
      description: '更新后的描述',
      tags: ['测试', '示例']
    });
    console.log('更新后的项目:', updatedProject);
    
    // 复制项目
    const duplicatedProject = await duplicateProject(newProject.id);
    console.log('复制的项目:', duplicatedProject.name);
  } catch (error) {
    console.error('项目操作失败:', error);
  }
}

/**
 * 示例 4: 获取资源列表
 */
export async function exampleGetAssets() {
  console.log('\n========== 示例 4: 获取资源列表 ==========\n');
  
  try {
    const assets = await getAssetList();
    console.log('资源总数:', assets.total);
    console.log('资源分类:', assets.categories);
    console.log('资源统计:', assets.stats);
    
    // 获取第一个资源的详情
    if (assets.list.length > 0) {
      const firstAsset = await getAssetById(assets.list[0].id);
      console.log('第一个资源:', firstAsset.name);
    }
  } catch (error) {
    console.error('获取资源失败:', error);
  }
}

// ========== 运行所有示例 ==========

export async function runAllExamples() {
  await exampleLogin();
  await exampleGetProjects();
  await exampleCreateProject();
  await exampleGetAssets();
}

// 如果直接运行此文件，执行所有示例
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

