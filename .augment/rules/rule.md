---
type: "agent_requested"
description: "为 W3D SDK（Three.js + React 编辑器，Monorepo）定制的 Augment 协作规则。遵循中文优先与组件化最佳实践，帮助智能助手在后续开发中提供更符合项目规范的建议与改动。"
---

# W3D SDK Augment 规则



## 0. 助手行为与沟通偏好


- 语言：默认使用中文回复；必要时可在中文后补充少量英文术语
- 表达：结构化、层次清晰（使用二/三级标题与要点列表），先结论后细节
- 代码展示：任何多行代码必须使用 <augment_code_snippet> 包裹，并标注 path 与语言；示例尽量精简（<10 行）
- 工具使用：优先并行只读查询；编辑前确认文件与符号存在；多文件变更开启任务清单（Tasklist）
- 安全：无明确许可不得安装依赖、提交/推送、合并、发布；完成改动后尽量运行安全的本地校验（构建/测试/静态检查）

## 1. 项目概览与技术栈


- Monorepo：pnpm workspaces（packages/*），包名以 @w3d/* 命名
- 运行时：ES Modules（type: module），Node ≥ 16，Vite 构建
- 引擎与前端：Three.js（^0.180），React 18（编辑器）
- 测试与质量：Vitest + jsdom，ESLint + Prettier
- 包内角色：
  - @w3d/utils：基础工具（事件、日志、数学、缓存等）
  - @w3d/core：核心引擎（Scene/Component/事件/资源/动画等）
  - @w3d/components：内置 3D 组件库（Loader/动画/标注/特效/控制等）
  - @w3d/editor：React 编辑器应用（Redux 状态、UI 面板、场景集成）

## 2. 代码风格与命名规范


- 语法与模块：
  - 全面使用 ES Modules，内部相对导入需显式 .js 扩展名
  - 尽量使用具名导出（named export），避免默认导出
- 命名：
  - 类、React 组件：PascalCase（如 ModelLoader, PropertiesPanel）
  - 变量、函数、对象属性：camelCase（如 getInteractiveObjects）
  - 常量/枚举：UPPER_SNAKE_CASE（如 EVENT_TYPES, DEFAULT_CONFIG）
  - Redux：slice 文件名 xxxSlice.js；action 以动词短语命名（setXxx、updateXxx）；selector 以 select 前缀
- 文件与目录：
  - 单一职责，小文件优先；按功能分层（core/component/event/resource/...）
  - 包入口 index.js 只做聚合导出
- 代码样式（与 Prettier/ESLint 一致）：
  - 2 空格缩进；分号必加；单引号优先；尽量使用 const/let 替代 var
  - 避免未使用的变量与死代码，必要时加 ESLint 忽略并注释原因



## 3. 文档与注释（中文优先）


- 所有公开类、导出函数、复杂模块必须包含 JSDoc（中文为主，关键术语可中英对照）
- 复杂逻辑、关键架构点、性能敏感代码需在实现处加入块注释说明设计动机与取舍
- 示例均提供最小可运行片段，并用中文注解
- 变更时若改动对外 API 或行为，需同步更新相关 README/文档

示例（JSDoc 简例）：
<augment_code_snippet mode="EXCERPT">
````javascript
/**
 * ModelLoader 模型加载器组件
 * @param {Object} config - 组件配置
 */
````
</augment_code_snippet>



## 4. 组件开发规范（@w3d/core / @w3d/components）


- 基类与生命周期：所有 3D 组件必须继承 @w3d/core 的 Component，并实现必要生命周期：
  - onCreate → onBeforeMount → onMounted → onUpdate(delta) → onBeforeDispose → onDispose
- 默认配置：使用静态属性 static defaultConfig 合并用户配置
- 场景挂载：仅向 this.componentScene 添加子对象，不直接挂载到全局 scene.scene
- 交互：实现 getInteractiveObjects()，按需返回可拾取对象；对象可设置 userData.eventEmitter 以接收对象级事件
- 资源：通过 scene.resourceManager / IndexedDBCache 进行加载与缓存，避免重复请求
- 配置更新：提供 onConfigUpdate(newConfig) 钩子处理热更新
- 销毁：onDispose 中移除事件监听、停止动画、释放贴图/几何体/材质

组件骨架示例：
<augment_code_snippet mode="EXCERPT">
````javascript
export class MyComp extends Component {
  static defaultConfig = { enabled: true };
  onMounted(){ /* 初始化 */ }
  onUpdate(dt){ /* 帧更新 */ }
  getInteractiveObjects(){ return []; }
}
````
</augment_code_snippet>



## 5. 事件系统与交互（@w3d/core）


- 统一通过 EventSystem（Raycaster）进行拾取：全局监听 + 对象级 eventEmitter 双通道
- 常用事件：click、dblclick、mousemove、mousedown、mouseup、enter、leave
- 组件应避免在构造/挂载期间阻塞；异步加载（如模型）完成后再注册交互对象
- 命名与语义：事件名使用小写动词；事件数据包含 { type, object, point, event }



## 6. 状态管理规范（@w3d/editor / Redux Toolkit）


- 分层与可序列化：
  - items：可序列化组件元数据（用于保存/回放）
  - instances：Three.js 对象引用（不序列化，store 配置中 ignoredPaths 忽略）
  - configs：组件配置对象（可与 items 分离，便于热更新）
- Slice 约定：
  - actions：setXxx / updateXxx / removeXxx / toggleXxx
  - selectors：统一以 selectXxx 命名并集中导出
- 中间件/校验：关闭对非序列化对象的严格校验；在 store 中对相关 actions 与 paths 忽略序列化检查
- 与 3D 同步：UI 改动 → dispatch 更新 configs/items → 通过实例引用调度组件 updateConfig/方法



## 7. 性能优化建议（Three.js / 编辑器）


- 渲染与几何：
  - 合并/实例化（InstancedMesh）降低 draw calls，使用 three-mesh-bvh 做射线与包围体加速
  - 合理的阴影策略：开启/关闭按需、shadowMap 尺寸可配置
- 资源与纹理：
  - 优先使用 KTX2 压缩纹理；模型使用 Draco；大资源启用 IndexedDB 持久化缓存（版本变化自动失效）
- 更新与动画：
  - 只在需要时启动渲染循环；暂停/隐藏时降低更新频率；AnimationManager 统一驱动
- 事件与交互：
  - 指针事件节流/去抖；限流射线检测对象集合（组件按需暴露 getInteractiveObjects()）



## 8. 测试要求（Vitest）


- 测试范围：
  - utils：函数级单元测试，覆盖常见边界与异常
  - core：ResourceManager、EventSystem、Component 生命周期的关键路径测试（可用 jsdom/轻量 three 场景）
  - components：至少提供创建-挂载-销毁的冒烟测试
  - editor：Redux slice 与关键选择器测试；React 组件可选用 @testing-library/react（如未安装需征求许可）
- 质量门槛：新增/修改模块建议 ≥80% 语句覆盖，核心模块 ≥90%
- 运行命令：pnpm test / pnpm test:watch（如需 UI：pnpm test:ui）

Vitest 简例：
<augment_code_snippet mode="EXCERPT">
````javascript
import { describe,it,expect } from 'vitest';
describe('MathUtils',()=>{
  it('degToRad',()=>{ expect(true).toBe(true); });
});
````
</augment_code_snippet>



## 9. 依赖与包管理


- 统一使用 pnpm；Monorepo 内部依赖使用 workspace:*；不要手改 package.json 的版本解析
- 新增/删除依赖需获得明确许可；使用 pnpm add/remove，并更新对等依赖（peerDependencies）约束（如 three）
- 各包保持 exports 字段正确，ESM/UMD 产物由 Vite 构建



## 10. 文件组织与导入约定


- 内部相对路径导入必须包含 .js 扩展名（ESM 规范）
- 跨包导入优先使用 @w3d/* 包名，不使用相对路径穿越包边界
- 包入口（src/index.js）仅聚合导出，避免复杂逻辑



## 11. 提交与自动化（建议）


- 使用 Changesets 管理版本与发布；多包协同变更写清 Changelog（中文）
- 提交信息建议遵循 Conventional Commits（feat/fix/docs/perf/refactor/test/chore）



## 12. 安全与资源释放


- 组件销毁时：移除事件监听、停止动画、释放几何/材质/纹理、从场景与管理器注销
- 避免全局单例泄漏；EventEmitter 使用 off/removeAllListeners 清理



## 13. 面向 AI 助手的实施要点


- 在进行多文件或跨层改动时：
  1) 创建 Tasklist 并将“调研/分析”置为进行中
  2) 并行读取必要文件，确认符号/接口后再编辑
  3) 单文件多个改动合并一次提交；跨文件改动分步进行
- 编辑器行为：
  - 使用 str-replace-editor 精准变更，避免整文件重写；必要时分块（≤150 行/次）
  - 变更后尽量运行 pnpm lint 与 pnpm test（安全检查）；失败则最小化修复并复验
- 沟通期望：
  - 先给摘要结论与影响面，再给落地修改方案与验证步骤

以上规则旨在在不牺牲可维护性的前提下，保持统一风格、稳定性能与良好扩展性，帮助智能助手与人类协作者在 W3D SDK 项目中高效协作。

## 14. 文档与测试生成策略（补充规则）

- 文档生成限制：
  - 除非用户明确要求，否则不主动创建或更新 Markdown 文档文件（.md）
  - 代码内的 JSDoc 注释仍需按规范编写（见第 3 节）
  - 仅在以下情况下创建/更新文档：
    - 用户明确请求创建文档
    - 修改了公开 API 且用户要求同步更新文档
    - 创建新包或重大功能模块时，用户明确要求提供 README

- 测试代码生成限制：
  - 不主动生成测试文件或测试代码，除非用户明确要求
  - 当用户要求实现功能时，默认只实现核心功能代码
  - 如果认为测试对功能至关重要，可以建议用户添加测试，但不自动生成

- 调试代码限制：
  - 不在生产代码中主动添加 console.log、debugger 等调试语句
  - 不添加仅用于调试目的的临时代码
  - 如需调试信息，使用项目的 Logger 工具（@w3d/utils）并在完成后移除

- 设计模式应用：
  - 代码实现以功能实现为主要目标，保持简洁实用
  - 不为了展示设计模式而过度设计
  - 仅在确实能提升代码质量、可维护性或符合现有架构时才应用设计模式
  - 优先遵循项目现有的代码风格和架构模式

- 代码生成原则：
  - 聚焦于用户明确要求的功能实现
  - 保持代码简洁、直接、易于理解
  - 避免"过度工程化"（over-engineering）
  - 完成功能后，可以建议用户考虑添加测试或文档，但不强制生成
