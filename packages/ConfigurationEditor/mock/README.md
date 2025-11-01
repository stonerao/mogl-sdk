# Mock 数据服务文档

## 概述

Mock 数据服务为配置编辑器提供了开发环境下的模拟 API 接口，无需依赖真实后端即可进行前端开发和测试。

**版本**: 1.0.0  
**创建时间**: 2025-10-31

---

## 目录结构

```
mock/
├── index.js              # Mock 服务入口文件
├── data/                 # Mock 数据文件夹
│   ├── user.js          # 用户相关数据
│   ├── project.js       # 项目相关数据
│   └── assets.js        # 资源相关数据
├── handlers/            # Mock 请求处理器
│   ├── user.js         # 用户请求处理
│   └── project.js      # 项目请求处理
└── README.md           # 本文档
```

---

## 快速开始

### 1. 启用 Mock 服务

在 `.env` 文件中设置：

```env
VITE_ENABLE_MOCK=true
```

### 2. 启动开发服务器

```bash
npm run dev
```

启动后会看到 Mock 服务启用的提示：

```
🎭 Mock 服务已启用

📋 Mock API 列表:
  - GET    /api/mock/user/current       获取当前用户信息
  - POST   /api/mock/user/login         用户登录
  - GET    /api/mock/users              获取用户列表
  - GET    /api/mock/projects           获取项目列表
  - POST   /api/mock/project            创建项目
  - GET    /api/mock/assets             获取资源列表
  - 更多 API 请查看 mock/index.js
```

### 3. 调用 Mock API

在代码中使用 axios 或 fetch 调用：

```javascript
import axios from 'axios';

// 获取当前用户信息
const response = await axios.get('/api/mock/user/current');
console.log(response.data);

// 获取项目列表
const projects = await axios.get('/api/mock/projects', {
  params: {
    page: 1,
    pageSize: 10,
    status: 'active'
  }
});
console.log(projects.data);
```

---

## API 接口文档

### 用户相关 API

#### 1. 用户登录

**接口**: `POST /api/mock/user/login`

**请求参数**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "name": "管理员",
      "email": "admin@example.com",
      "role": "admin",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
    },
    "token": "mock_token_1_1234567890",
    "expiresIn": 7200
  },
  "timestamp": 1234567890
}
```

#### 2. 获取当前用户信息

**接口**: `GET /api/mock/user/current`

**响应**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "username": "admin",
    "name": "管理员",
    "email": "admin@example.com",
    "role": "admin",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-10-31T10:30:00.000Z",
    "permissions": ["*"]
  },
  "timestamp": 1234567890
}
```

#### 3. 获取用户列表

**接口**: `GET /api/mock/users`

**查询参数**:
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 10）
- `role`: 角色过滤（可选）
- `status`: 状态过滤（可选）

**响应**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [...],
    "total": 3,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1234567890
}
```

#### 4. 创建用户

**接口**: `POST /api/mock/user`

**请求参数**:
```json
{
  "username": "newuser",
  "name": "新用户",
  "email": "newuser@example.com",
  "role": "editor"
}
```

#### 5. 更新用户

**接口**: `PUT /api/mock/user/:id`

**请求参数**:
```json
{
  "name": "更新后的名称",
  "email": "newemail@example.com"
}
```

#### 6. 删除用户

**接口**: `DELETE /api/mock/user/:id`

#### 7. 获取用户设置

**接口**: `GET /api/mock/user/settings`

#### 8. 更新用户设置

**接口**: `PUT /api/mock/user/settings`

#### 9. 获取用户统计

**接口**: `GET /api/mock/user/stats`

#### 10. 修改密码

**接口**: `POST /api/mock/user/password`

---

### 项目相关 API

#### 1. 获取项目列表

**接口**: `GET /api/mock/projects`

**查询参数**:
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 10）
- `status`: 状态过滤（active/draft/archived）
- `keyword`: 关键词搜索
- `sortBy`: 排序字段（默认 updatedAt）
- `sortOrder`: 排序方向（asc/desc，默认 desc）

**响应**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "智能工厂监控系统",
        "description": "用于监控智能工厂的生产线状态、设备运行情况和能耗数据",
        "thumbnail": "data:image/svg+xml;base64,...",
        "status": "active",
        "version": "1.2.0",
        "createdAt": "2024-01-15T08:30:00.000Z",
        "updatedAt": "2024-10-30T14:20:00.000Z",
        "createdBy": 1,
        "tags": ["工厂", "监控", "生产线"],
        "nodeCount": 156,
        "size": 2.3,
        "isPublic": false,
        "collaborators": [1, 2]
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1234567890
}
```

#### 2. 获取项目详情

**接口**: `GET /api/mock/project/:id`

#### 3. 创建项目

**接口**: `POST /api/mock/project`

**请求参数**:
```json
{
  "name": "新项目",
  "description": "项目描述",
  "templateId": "template-1"
}
```

#### 4. 更新项目

**接口**: `PUT /api/mock/project/:id`

#### 5. 删除项目

**接口**: `DELETE /api/mock/project/:id`

#### 6. 复制项目

**接口**: `POST /api/mock/project/:id/duplicate`

#### 7. 获取项目模板

**接口**: `GET /api/mock/project/templates`

#### 8. 获取项目统计

**接口**: `GET /api/mock/project/stats`

#### 9. 获取项目活动日志

**接口**: `GET /api/mock/project/activities`

**查询参数**:
- `projectId`: 项目 ID（可选）
- `limit`: 限制数量（默认 10）

#### 10. 发布项目

**接口**: `POST /api/mock/project/:id/publish`

#### 11. 归档项目

**接口**: `POST /api/mock/project/:id/archive`

---

### 资源相关 API

#### 1. 获取资源列表

**接口**: `GET /api/mock/assets`

**响应**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [...],
    "total": 7,
    "categories": [...],
    "stats": {...}
  },
  "timestamp": 1234567890
}
```

#### 2. 获取资源详情

**接口**: `GET /api/mock/asset/:id`

---

## 配置说明

### 环境变量

在 `.env` 文件中配置：

```env
# 启用 Mock 服务
VITE_ENABLE_MOCK=true

# Mock 延迟时间（毫秒）
VITE_MOCK_DELAY=300

# 是否打印 Mock 日志
VITE_MOCK_LOG=true
```

### Mock 配置

在 `mock/index.js` 中修改配置：

```javascript
const mockConfig = {
  enabled: true,
  delay: 300,        // 默认延迟（毫秒）
  logRequests: true  // 是否打印请求日志
};
```

---

## 添加新的 Mock API

### 1. 添加 Mock 数据

在 `mock/data/` 目录下创建或修改数据文件：

```javascript
// mock/data/device.js
export const devices = [
  {
    id: 1,
    name: '设备1',
    type: 'pump',
    status: 'running'
  }
];
```

### 2. 创建请求处理器

在 `mock/handlers/` 目录下创建处理器文件：

```javascript
// mock/handlers/device.js
import { devices } from '../data/device.js';

export const getDeviceList = async (req) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    code: 200,
    message: 'Success',
    data: devices,
    timestamp: Date.now()
  };
};
```

### 3. 注册路由

在 `mock/index.js` 中添加路由：

```javascript
import * as deviceHandlers from './handlers/device.js';

const mockRoutes = [
  // ... 其他路由
  { 
    method: 'GET', 
    path: '/api/mock/devices', 
    handler: deviceHandlers.getDeviceList 
  }
];
```

---

## 最佳实践

### 1. 响应格式统一

所有 Mock API 响应应遵循统一格式：

```javascript
{
  code: 200,          // 状态码
  message: 'Success', // 消息
  data: {...},        // 数据
  timestamp: 1234567890 // 时间戳
}
```

### 2. 模拟真实延迟

使用 `delay()` 函数模拟网络延迟：

```javascript
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getData = async () => {
  await delay(500); // 模拟 500ms 延迟
  return success(data);
};
```

### 3. 错误场景模拟

提供成功和失败两种场景：

```javascript
export const createItem = async (req) => {
  const { name } = req.body;
  
  if (!name) {
    return error('名称不能为空', 400);
  }
  
  if (items.find(i => i.name === name)) {
    return error('名称已存在', 409);
  }
  
  // 创建成功
  return success(newItem, '创建成功');
};
```

### 4. 数据持久化（可选）

使用 localStorage 实现数据持久化：

```javascript
// 保存数据
localStorage.setItem('mock_projects', JSON.stringify(projects));

// 加载数据
const savedProjects = localStorage.getItem('mock_projects');
if (savedProjects) {
  projects = JSON.parse(savedProjects);
}
```

---

## 常见问题

### Q: Mock 服务不生效？

A: 检查以下几点：
1. `.env` 文件中 `VITE_ENABLE_MOCK=true`
2. 重启开发服务器
3. 检查控制台是否有 "Mock 服务已启用" 提示

### Q: 如何禁用 Mock 服务？

A: 在 `.env` 文件中设置 `VITE_ENABLE_MOCK=false`，然后重启服务器。

### Q: Mock 数据会持久化吗？

A: 默认不会持久化，每次刷新页面数据会重置。如需持久化，可以使用 localStorage。

### Q: 如何调整响应延迟？

A: 修改 `.env` 中的 `VITE_MOCK_DELAY` 或在处理器中使用自定义延迟。

### Q: 生产环境会包含 Mock 代码吗？

A: 不会。Mock 服务仅在开发环境启用，生产构建时不会包含 Mock 相关代码。

---

## 版本历史

- **v1.0.0** (2025-10-31)
  - 初始版本
  - 支持用户、项目、资源相关 API
  - 支持环境变量配置
  - 支持请求日志

---

**维护者**: ConfigurationEditor Team  
**最后更新**: 2025-10-31

