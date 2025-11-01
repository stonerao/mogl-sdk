/**
 * 用户相关 Mock 请求处理器
 */

import { users, currentUser, userSettings, userStats } from '../data/user.js';

/**
 * 模拟延迟
 * @param {number} ms - 延迟毫秒数
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
 * 用户登录
 */
export const login = async (req) => {
  await delay(500);
  
  const { username, password } = req.body;
  
  // 简单验证
  if (!username || !password) {
    return error('用户名和密码不能为空', 400);
  }
  
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return error('用户不存在', 404);
  }
  
  // 模拟密码验证（实际应该加密比对）
  if (password !== 'password123') {
    return error('密码错误', 401);
  }
  
  return success({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    },
    token: `mock_token_${user.id}_${Date.now()}`,
    expiresIn: 7200 // 2小时
  }, '登录成功');
};

/**
 * 用户登出
 */
export const logout = async () => {
  await delay(200);
  return success(null, '登出成功');
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async () => {
  await delay(300);
  return success(currentUser);
};

/**
 * 获取用户列表
 */
export const getUserList = async (req) => {
  await delay(400);
  
  const { page = 1, pageSize = 10, role, status } = req.query;
  
  let filteredUsers = [...users];
  
  // 按角色过滤
  if (role) {
    filteredUsers = filteredUsers.filter(u => u.role === role);
  }
  
  // 按状态过滤
  if (status) {
    filteredUsers = filteredUsers.filter(u => u.status === status);
  }
  
  // 分页
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedUsers = filteredUsers.slice(start, end);
  
  return success({
    list: paginatedUsers,
    total: filteredUsers.length,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  });
};

/**
 * 获取用户详情
 */
export const getUserById = async (req) => {
  await delay(300);
  
  const { id } = req.params;
  const user = users.find(u => u.id === parseInt(id));
  
  if (!user) {
    return error('用户不存在', 404);
  }
  
  return success(user);
};

/**
 * 创建用户
 */
export const createUser = async (req) => {
  await delay(500);
  
  const { username, name, email, role } = req.body;
  
  // 验证必填字段
  if (!username || !name || !email) {
    return error('用户名、姓名和邮箱不能为空', 400);
  }
  
  // 检查用户名是否已存在
  if (users.find(u => u.username === username)) {
    return error('用户名已存在', 409);
  }
  
  // 创建新用户
  const newUser = {
    id: users.length + 1,
    username,
    name,
    email,
    role: role || 'viewer',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    permissions: role === 'admin' ? ['*'] : ['project:read']
  };
  
  users.push(newUser);
  
  return success(newUser, '用户创建成功');
};

/**
 * 更新用户
 */
export const updateUser = async (req) => {
  await delay(500);
  
  const { id } = req.params;
  const updates = req.body;
  
  const userIndex = users.findIndex(u => u.id === parseInt(id));
  
  if (userIndex === -1) {
    return error('用户不存在', 404);
  }
  
  // 更新用户信息
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    id: users[userIndex].id, // 保持 ID 不变
    updatedAt: new Date().toISOString()
  };
  
  return success(users[userIndex], '用户更新成功');
};

/**
 * 删除用户
 */
export const deleteUser = async (req) => {
  await delay(500);
  
  const { id } = req.params;
  const userIndex = users.findIndex(u => u.id === parseInt(id));
  
  if (userIndex === -1) {
    return error('用户不存在', 404);
  }
  
  // 不允许删除管理员
  if (users[userIndex].role === 'admin') {
    return error('不允许删除管理员用户', 403);
  }
  
  users.splice(userIndex, 1);
  
  return success(null, '用户删除成功');
};

/**
 * 获取用户设置
 */
export const getUserSettings = async () => {
  await delay(200);
  return success(userSettings);
};

/**
 * 更新用户设置
 */
export const updateUserSettings = async (req) => {
  await delay(300);
  
  const updates = req.body;
  
  Object.assign(userSettings, updates);
  
  return success(userSettings, '设置更新成功');
};

/**
 * 获取用户统计信息
 */
export const getUserStats = async () => {
  await delay(300);
  return success(userStats);
};

/**
 * 修改密码
 */
export const changePassword = async (req) => {
  await delay(500);
  
  const { oldPassword, newPassword } = req.body;
  
  if (!oldPassword || !newPassword) {
    return error('旧密码和新密码不能为空', 400);
  }
  
  if (oldPassword !== 'password123') {
    return error('旧密码错误', 401);
  }
  
  if (newPassword.length < 6) {
    return error('新密码长度不能少于6位', 400);
  }
  
  return success(null, '密码修改成功');
};

