/**
 * 用户相关 Mock 数据
 */

/**
 * 模拟用户列表
 */
export const users = [
  {
    id: 1,
    username: 'admin',
    name: '管理员',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLoginAt: '2024-10-31T10:30:00.000Z',
    permissions: ['*']
  },
  {
    id: 2,
    username: 'editor',
    name: '编辑员',
    email: 'editor@example.com',
    role: 'editor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor',
    status: 'active',
    createdAt: '2024-01-15T00:00:00.000Z',
    lastLoginAt: '2024-10-31T09:15:00.000Z',
    permissions: ['project:read', 'project:write', 'asset:read', 'asset:write']
  },
  {
    id: 3,
    username: 'viewer',
    name: '查看员',
    email: 'viewer@example.com',
    role: 'viewer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer',
    status: 'active',
    createdAt: '2024-02-01T00:00:00.000Z',
    lastLoginAt: '2024-10-30T16:45:00.000Z',
    permissions: ['project:read', 'asset:read']
  }
];

/**
 * 当前登录用户
 */
export const currentUser = users[0];

/**
 * 用户设置
 */
export const userSettings = {
  theme: 'dark',
  language: 'zh-CN',
  autoSave: true,
  autoSaveInterval: 300, // 秒
  gridEnabled: true,
  gridSize: 20,
  snapToGrid: true,
  showRuler: true,
  showMinimap: false,
  notifications: {
    email: true,
    browser: true,
    sound: false
  }
};

/**
 * 用户统计信息
 */
export const userStats = {
  totalProjects: 15,
  activeProjects: 8,
  totalAssets: 127,
  storageUsed: 45.6, // MB
  storageLimit: 1024, // MB
  lastActivity: '2024-10-31T10:30:00.000Z'
};

