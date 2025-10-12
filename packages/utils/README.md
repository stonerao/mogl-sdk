# @w3d/utils

> W3D 工具函数库

## 📦 安装

```bash
npm install @w3d/utils
```

## 🚀 使用

```javascript
import { EventEmitter, Logger, MathUtils } from '@w3d/utils';

// 事件发射器
const emitter = new EventEmitter();
emitter.on('test', (data) => console.log(data));
emitter.emit('test', 'Hello World');

// 日志工具
const logger = new Logger('MyApp');
logger.info('Application started');

// 数学工具
const angle = MathUtils.degToRad(90);
```

## 📚 工具分类

- **event/** - 事件工具（EventEmitter, EventBus）
- **logger/** - 日志工具（Logger, LogLevel）
- **performance/** - 性能工具（Performance, Stats）
- **math/** - 数学工具（MathUtils, Vector, Transform）
- **geometry/** - 几何工具（GeometryUtils, PathUtils）
- **color/** - 颜色工具（ColorUtils）
- **loader/** - 加载工具（ResourceLoader, ProgressTracker）
- **cache/** - 缓存工具（IndexedDBCache, MemoryCache）
- **helpers/** - 辅助工具（ObjectUtils, ArrayUtils, StringUtils）

## 📄 许可证

MIT License

