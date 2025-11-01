/**
 * Mock 服务入口文件
 * 
 * 提供开发环境下的 Mock API 服务
 * 仅在 VITE_ENABLE_MOCK=true 时启用
 */

import * as userHandlers from './handlers/user.js';
import * as projectHandlers from './handlers/project.js';
import { imageAssets, assetCategories, assetStats } from './data/assets.js';

/**
 * Mock 配置
 */
const mockConfig = {
  enabled: true,
  delay: 300, // 默认延迟（毫秒）
  logRequests: true // 是否打印请求日志
};

/**
 * 日志工具
 */
const logger = {
  info: (message, ...args) => {
    if (mockConfig.logRequests) {
      console.log(`[Mock] ${message}`, ...args);
    }
  },
  success: (message, ...args) => {
    if (mockConfig.logRequests) {
      console.log(`[Mock] ✅ ${message}`, ...args);
    }
  },
  error: (message, ...args) => {
    if (mockConfig.logRequests) {
      console.error(`[Mock] ❌ ${message}`, ...args);
    }
  }
};

/**
 * 解析请求体
 */
const parseBody = async (req) => {
  if (req.method === 'GET' || req.method === 'DELETE') {
    return null;
  }
  
  try {
    const text = await new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        resolve(body);
      });
    });
    
    return text ? JSON.parse(text) : null;
  } catch (error) {
    logger.error('解析请求体失败:', error);
    return null;
  }
};

/**
 * 解析查询参数
 */
const parseQuery = (url) => {
  const queryString = url.split('?')[1];
  if (!queryString) return {};
  
  const params = new URLSearchParams(queryString);
  const query = {};
  
  for (const [key, value] of params) {
    query[key] = value;
  }
  
  return query;
};

/**
 * 解析路径参数
 */
const parseParams = (pattern, path) => {
  const patternParts = pattern.split('/');
  const pathParts = path.split('?')[0].split('/');
  
  const params = {};
  
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      const paramName = patternParts[i].slice(1);
      params[paramName] = pathParts[i];
    }
  }
  
  return params;
};

/**
 * Mock 路由定义
 */
const mockRoutes = [
  // ========== 用户相关 API ==========
  { method: 'POST', path: '/api/mock/user/login', handler: userHandlers.login },
  { method: 'POST', path: '/api/mock/user/logout', handler: userHandlers.logout },
  { method: 'GET', path: '/api/mock/user/current', handler: userHandlers.getCurrentUser },
  { method: 'GET', path: '/api/mock/users', handler: userHandlers.getUserList },
  { method: 'GET', path: '/api/mock/user/:id', handler: userHandlers.getUserById },
  { method: 'POST', path: '/api/mock/user', handler: userHandlers.createUser },
  { method: 'PUT', path: '/api/mock/user/:id', handler: userHandlers.updateUser },
  { method: 'DELETE', path: '/api/mock/user/:id', handler: userHandlers.deleteUser },
  { method: 'GET', path: '/api/mock/user/settings', handler: userHandlers.getUserSettings },
  { method: 'PUT', path: '/api/mock/user/settings', handler: userHandlers.updateUserSettings },
  { method: 'GET', path: '/api/mock/user/stats', handler: userHandlers.getUserStats },
  { method: 'POST', path: '/api/mock/user/password', handler: userHandlers.changePassword },
  
  // ========== 项目相关 API ==========
  { method: 'GET', path: '/api/mock/projects', handler: projectHandlers.getProjectList },
  { method: 'GET', path: '/api/mock/project/:id', handler: projectHandlers.getProjectById },
  { method: 'POST', path: '/api/mock/project', handler: projectHandlers.createProject },
  { method: 'PUT', path: '/api/mock/project/:id', handler: projectHandlers.updateProject },
  { method: 'DELETE', path: '/api/mock/project/:id', handler: projectHandlers.deleteProject },
  { method: 'POST', path: '/api/mock/project/:id/duplicate', handler: projectHandlers.duplicateProject },
  { method: 'GET', path: '/api/mock/project/templates', handler: projectHandlers.getProjectTemplates },
  { method: 'GET', path: '/api/mock/project/stats', handler: projectHandlers.getProjectStats },
  { method: 'GET', path: '/api/mock/project/activities', handler: projectHandlers.getProjectActivities },
  { method: 'POST', path: '/api/mock/project/:id/publish', handler: projectHandlers.publishProject },
  { method: 'POST', path: '/api/mock/project/:id/archive', handler: projectHandlers.archiveProject },
  
  // ========== 资源相关 API ==========
  { 
    method: 'GET', 
    path: '/api/mock/assets', 
    handler: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        code: 200,
        message: 'Success',
        data: {
          list: imageAssets,
          total: imageAssets.length,
          categories: assetCategories,
          stats: assetStats
        },
        timestamp: Date.now()
      };
    }
  },
  { 
    method: 'GET', 
    path: '/api/mock/asset/:id', 
    handler: async (req) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const { id } = req.params;
      const asset = imageAssets.find(a => a.id === id);
      
      if (!asset) {
        return {
          code: 404,
          message: '资源不存在',
          data: null,
          timestamp: Date.now()
        };
      }
      
      return {
        code: 200,
        message: 'Success',
        data: asset,
        timestamp: Date.now()
      };
    }
  }
];

/**
 * 匹配路由
 */
const matchRoute = (method, path) => {
  for (const route of mockRoutes) {
    if (route.method !== method) continue;
    
    const routePattern = route.path;
    const routeParts = routePattern.split('/');
    const pathParts = path.split('?')[0].split('/');
    
    if (routeParts.length !== pathParts.length) continue;
    
    let matched = true;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) continue;
      if (routeParts[i] !== pathParts[i]) {
        matched = false;
        break;
      }
    }
    
    if (matched) {
      return route;
    }
  }
  
  return null;
};

/**
 * Mock 中间件
 */
export const createMockMiddleware = () => {
  return async (req, res, next) => {
    const { method, url } = req;
    
    // 只处理 /api/mock 开头的请求
    if (!url.startsWith('/api/mock')) {
      return next();
    }
    
    logger.info(`${method} ${url}`);
    
    try {
      // 匹配路由
      const route = matchRoute(method, url);
      
      if (!route) {
        logger.error(`未找到匹配的路由: ${method} ${url}`);
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          code: 404,
          message: 'Mock API not found',
          data: null,
          timestamp: Date.now()
        }));
        return;
      }
      
      // 解析请求参数
      const body = await parseBody(req);
      const query = parseQuery(url);
      const params = parseParams(route.path, url);
      
      // 构造请求对象
      const mockReq = {
        method,
        url,
        body,
        query,
        params
      };
      
      // 调用处理器
      const result = await route.handler(mockReq);
      
      // 返回响应
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.end(JSON.stringify(result));
      
      logger.success(`${method} ${url} - ${result.code} ${result.message}`);
    } catch (error) {
      logger.error(`处理请求失败: ${method} ${url}`, error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        code: 500,
        message: error.message || 'Internal Server Error',
        data: null,
        timestamp: Date.now()
      }));
    }
  };
};

/**
 * 导出 Mock 配置
 */
export default {
  config: mockConfig,
  routes: mockRoutes,
  createMiddleware: createMockMiddleware
};

