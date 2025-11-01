/**
 * 项目相关 Mock 数据
 */

/**
 * 模拟项目列表
 */
export const projects = [
  {
    id: 1,
    name: '智能工厂监控系统',
    description: '用于监控智能工厂的生产线状态、设备运行情况和能耗数据',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzQwOUVGRiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaZuuiDveW3peWOgjwvdGV4dD48L3N2Zz4=',
    status: 'active',
    version: '1.2.0',
    createdAt: '2024-01-15T08:30:00.000Z',
    updatedAt: '2024-10-30T14:20:00.000Z',
    createdBy: 1,
    tags: ['工厂', '监控', '生产线'],
    nodeCount: 156,
    size: 2.3, // MB
    isPublic: false,
    collaborators: [1, 2]
  },
  {
    id: 2,
    name: '电力配电系统',
    description: '电力配电网络的可视化监控和管理系统',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI0Y1NkMyRCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPueUteWKm+ezu+e7rzwvdGV4dD48L3N2Zz4=',
    status: 'active',
    version: '2.0.1',
    createdAt: '2024-02-20T10:15:00.000Z',
    updatedAt: '2024-10-31T09:45:00.000Z',
    createdBy: 1,
    tags: ['电力', '配电', '能源'],
    nodeCount: 89,
    size: 1.8,
    isPublic: false,
    collaborators: [1, 2, 3]
  },
  {
    id: 3,
    name: '水处理监控平台',
    description: '污水处理厂的实时监控和数据分析平台',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzY3QzIzQSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuawtOWkhOeQhjwvdGV4dD48L3N2Zz4=',
    status: 'draft',
    version: '0.5.0',
    createdAt: '2024-03-10T14:00:00.000Z',
    updatedAt: '2024-10-28T16:30:00.000Z',
    createdBy: 2,
    tags: ['水处理', '环保', '监控'],
    nodeCount: 45,
    size: 0.9,
    isPublic: false,
    collaborators: [2]
  },
  {
    id: 4,
    name: '智能楼宇管理',
    description: '智能楼宇的照明、空调、安防等系统的集成管理',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzkwNTVBMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPualvOWuh+euoeeQhjwvdGV4dD48L3N2Zz4=',
    status: 'active',
    version: '1.5.2',
    createdAt: '2024-04-05T09:20:00.000Z',
    updatedAt: '2024-10-29T11:10:00.000Z',
    createdBy: 1,
    tags: ['楼宇', '智能', 'BMS'],
    nodeCount: 203,
    size: 3.1,
    isPublic: true,
    collaborators: [1, 2, 3]
  },
  {
    id: 5,
    name: '仓储物流系统',
    description: '智能仓储的货物追踪、库存管理和物流调度系统',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI0ZGOTgwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuS7k+WCqOeJqea1gTwvdGV4dD48L3N2Zz4=',
    status: 'archived',
    version: '1.0.0',
    createdAt: '2024-01-20T13:45:00.000Z',
    updatedAt: '2024-08-15T10:00:00.000Z',
    createdBy: 2,
    tags: ['仓储', '物流', 'WMS'],
    nodeCount: 78,
    size: 1.5,
    isPublic: false,
    collaborators: [2, 3]
  }
];

/**
 * 项目模板
 */
export const projectTemplates = [
  {
    id: 'template-1',
    name: '空白项目',
    description: '从零开始创建项目',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI0VFRUVFRSIgc3Ryb2tlPSIjQ0NDQ0NDIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuepuueggeS4reaWh+S7tjwvdGV4dD48L3N2Zz4=',
    category: 'basic',
    nodeCount: 0
  },
  {
    id: 'template-2',
    name: '工厂监控模板',
    description: '包含常用的工厂监控组件和布局',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzQwOUVGRiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuW3peWOguaooeadrzwvdGV4dD48L3N2Zz4=',
    category: 'industry',
    nodeCount: 25
  },
  {
    id: 'template-3',
    name: '能源管理模板',
    description: '电力、水、气等能源监控模板',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI0Y1NkMyRCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuiDvea6kOaooeadrzwvdGV4dD48L3N2Zz4=',
    category: 'energy',
    nodeCount: 18
  }
];

/**
 * 项目统计信息
 */
export const projectStats = {
  total: projects.length,
  active: projects.filter(p => p.status === 'active').length,
  draft: projects.filter(p => p.status === 'draft').length,
  archived: projects.filter(p => p.status === 'archived').length,
  totalSize: projects.reduce((sum, p) => sum + p.size, 0),
  totalNodes: projects.reduce((sum, p) => sum + p.nodeCount, 0)
};

/**
 * 项目活动日志
 */
export const projectActivities = [
  {
    id: 1,
    projectId: 1,
    userId: 1,
    action: 'update',
    description: '更新了节点配置',
    timestamp: '2024-10-31T10:30:00.000Z'
  },
  {
    id: 2,
    projectId: 2,
    userId: 2,
    action: 'create',
    description: '添加了新的设备节点',
    timestamp: '2024-10-31T09:15:00.000Z'
  },
  {
    id: 3,
    projectId: 1,
    userId: 1,
    action: 'save',
    description: '保存了项目',
    timestamp: '2024-10-30T16:45:00.000Z'
  }
];

