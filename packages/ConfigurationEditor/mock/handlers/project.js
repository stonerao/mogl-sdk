/**
 * 项目相关 Mock 请求处理器
 */

import { projects, projectTemplates, projectStats, projectActivities } from '../data/project.js';

/**
 * 模拟延迟
 */
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 创建成功响应
 */
const success = (data, message = 'Success') => ({
  code: 200,
  message,
  data,
  timestamp: Date.now()
});

/**
 * 创建错误响应
 */
const error = (message = 'Error', code = 500) => ({
  code,
  message,
  data: null,
  timestamp: Date.now()
});

/**
 * 获取项目列表
 */
export const getProjectList = async (req) => {
  await delay(400);
  
  const { 
    page = 1, 
    pageSize = 10, 
    status, 
    keyword,
    sortBy = 'updatedAt',
    sortOrder = 'desc'
  } = req.query;
  
  let filteredProjects = [...projects];
  
  // 按状态过滤
  if (status) {
    filteredProjects = filteredProjects.filter(p => p.status === status);
  }
  
  // 按关键词搜索
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filteredProjects = filteredProjects.filter(p => 
      p.name.toLowerCase().includes(lowerKeyword) ||
      p.description.toLowerCase().includes(lowerKeyword) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    );
  }
  
  // 排序
  filteredProjects.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  // 分页
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedProjects = filteredProjects.slice(start, end);
  
  return success({
    list: paginatedProjects,
    total: filteredProjects.length,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  });
};

/**
 * 获取项目详情
 */
export const getProjectById = async (req) => {
  await delay(300);
  
  const { id } = req.params;
  const project = projects.find(p => p.id === parseInt(id));
  
  if (!project) {
    return error('项目不存在', 404);
  }
  
  return success(project);
};

/**
 * 创建项目
 */
export const createProject = async (req) => {
  await delay(600);
  
  const { name, description, templateId } = req.body;
  
  if (!name) {
    return error('项目名称不能为空', 400);
  }
  
  // 检查项目名是否已存在
  if (projects.find(p => p.name === name)) {
    return error('项目名称已存在', 409);
  }
  
  // 创建新项目
  const newProject = {
    id: projects.length + 1,
    name,
    description: description || '',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI0VFRUVFRSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5paw5bel56iLPC90ZXh0Pjwvc3ZnPg==',
    status: 'draft',
    version: '0.1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 1, // 当前用户 ID
    tags: [],
    nodeCount: 0,
    size: 0,
    isPublic: false,
    collaborators: [1]
  };
  
  // 如果使用模板，复制模板的节点数量
  if (templateId) {
    const template = projectTemplates.find(t => t.id === templateId);
    if (template) {
      newProject.nodeCount = template.nodeCount;
    }
  }
  
  projects.push(newProject);
  
  return success(newProject, '项目创建成功');
};

/**
 * 更新项目
 */
export const updateProject = async (req) => {
  await delay(500);
  
  const { id } = req.params;
  const updates = req.body;
  
  const projectIndex = projects.findIndex(p => p.id === parseInt(id));
  
  if (projectIndex === -1) {
    return error('项目不存在', 404);
  }
  
  // 更新项目信息
  projects[projectIndex] = {
    ...projects[projectIndex],
    ...updates,
    id: projects[projectIndex].id, // 保持 ID 不变
    updatedAt: new Date().toISOString()
  };
  
  return success(projects[projectIndex], '项目更新成功');
};

/**
 * 删除项目
 */
export const deleteProject = async (req) => {
  await delay(500);
  
  const { id } = req.params;
  const projectIndex = projects.findIndex(p => p.id === parseInt(id));
  
  if (projectIndex === -1) {
    return error('项目不存在', 404);
  }
  
  projects.splice(projectIndex, 1);
  
  return success(null, '项目删除成功');
};

/**
 * 复制项目
 */
export const duplicateProject = async (req) => {
  await delay(600);
  
  const { id } = req.params;
  const project = projects.find(p => p.id === parseInt(id));
  
  if (!project) {
    return error('项目不存在', 404);
  }
  
  // 创建副本
  const duplicatedProject = {
    ...project,
    id: projects.length + 1,
    name: `${project.name} (副本)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft'
  };
  
  projects.push(duplicatedProject);
  
  return success(duplicatedProject, '项目复制成功');
};

/**
 * 获取项目模板列表
 */
export const getProjectTemplates = async () => {
  await delay(300);
  return success(projectTemplates);
};

/**
 * 获取项目统计信息
 */
export const getProjectStats = async () => {
  await delay(300);
  return success(projectStats);
};

/**
 * 获取项目活动日志
 */
export const getProjectActivities = async (req) => {
  await delay(300);
  
  const { projectId, limit = 10 } = req.query;
  
  let activities = [...projectActivities];
  
  // 按项目过滤
  if (projectId) {
    activities = activities.filter(a => a.projectId === parseInt(projectId));
  }
  
  // 限制数量
  activities = activities.slice(0, limit);
  
  return success(activities);
};

/**
 * 发布项目
 */
export const publishProject = async (req) => {
  await delay(500);
  
  const { id } = req.params;
  const projectIndex = projects.findIndex(p => p.id === parseInt(id));
  
  if (projectIndex === -1) {
    return error('项目不存在', 404);
  }
  
  if (projects[projectIndex].status === 'draft') {
    return error('草稿项目不能发布，请先完成编辑', 400);
  }
  
  projects[projectIndex].isPublic = true;
  projects[projectIndex].updatedAt = new Date().toISOString();
  
  return success(projects[projectIndex], '项目发布成功');
};

/**
 * 归档项目
 */
export const archiveProject = async (req) => {
  await delay(500);
  
  const { id } = req.params;
  const projectIndex = projects.findIndex(p => p.id === parseInt(id));
  
  if (projectIndex === -1) {
    return error('项目不存在', 404);
  }
  
  projects[projectIndex].status = 'archived';
  projects[projectIndex].updatedAt = new Date().toISOString();
  
  return success(projects[projectIndex], '项目已归档');
};

