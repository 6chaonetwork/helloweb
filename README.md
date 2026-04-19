# HelloClaw Web

HelloClaw Web 是一个基于 `Next.js 16 App Router` 的官方站点与控制台一体项目。

当前版本的目标很明确：

- 把 HelloClaw 官网从临时说明页重构成正式产品站
- 把后台控制台从内部工具页集合提升为统一设计语言的正式工作区
- 为后续接入独立运行的 HelloAPI admin API 预留清晰入口

## 当前结构

### 官网层

- `app/page.tsx`
  官网首页，负责产品定位、能力总览、场景说明、截图展示和部署路径入口
- `app/product/page.tsx`
  产品能力页，拆解桌面工作区、多模型接入、渠道链路与控制台能力
- `app/deployment/page.tsx`
  部署与演进页，说明 HelloClaw 官网/控制台/HelloAPI 的推荐关系
- `app/contact/page.tsx`
  合作与接入页，承接企业部署、系统打通和商业化后台方向

### 控制台层

- `app/login/page.tsx`
  后台登录入口
- `app/dashboard/layout.tsx`
  控制台共享壳层、侧栏与移动端导航
- `app/dashboard/page.tsx`
  控制台总览页
- `app/dashboard/admin/*`
  后台业务模块页

### 共享组件

- `components/site/*`
  官网层共享布局与 section 组件
- `components/ui/*`
  基础 UI 组件，统一为深色正式产品风格

## 当前设计方向

- 官网与后台统一为开发者产品风格的深色设计系统
- 重点强调：
  - AI Agent 桌面工作区
  - 多模型与多账号接入
  - 渠道与扫码身份链路
  - 运营控制台与后续商业化承接

## 后续推荐路线

1. 完成官网与后台正式版
2. 保持 HelloAPI 独立部署
3. 通过 HelloClaw 服务端代理接入 HelloAPI admin API
4. 在控制台中承接：
   - 账户同步
   - API Key
   - 余额
   - 充值订单
   - 销售统计

## 技术栈

- Next.js 16
- React 19
- Tailwind CSS 4
- Prisma

## 开发

推荐使用仓库锁文件对应的依赖安装方式。

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 常用命令

```bash
pnpm dev
pnpm build
pnpm lint
pnpm prisma:generate
```

## 注意事项

- 生产构建依赖 Prisma Client，首次拉起后建议执行一次 `pnpm prisma:generate`
- 当前站点同时包含公开页面与动态后台路由，控制台相关页面依赖管理员会话
- 官网当前已完成第一阶段重构，后续会继续推进 HelloAPI 管理接口接入
