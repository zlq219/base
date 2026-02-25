# 基础应用脚手架

一个模块化的基础应用脚手架，包含用户认证、角色管理、菜单配置和核心功能模块，可作为其他项目的底座进行扩展。

## 功能特性

- ✅ **用户认证系统**：邮箱+密码登录，支持注册和密码重置
- ✅ **角色管理**：普通用户和管理员两种角色
- ✅ **菜单配置**：支持一级/二级菜单，可通过配置文件动态调整
- ✅ **核心功能**：公告管理、消息中心、个人中心、密码修改
- ✅ **管理员功能**：查看和清除未验证用户，删除用户（测试环境）
- ✅ **模块化设计**：新增功能不修改基础代码，通过配置扩展
- ✅ **响应式布局**：左侧导航+右侧工作区，适配不同屏幕尺寸
- ✅ **免费部署**：支持部署到Vercel、Netlify等免费平台

## 技术栈

### 前端
- **框架**: Vue 3 + Vite
- **语言**: TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router
- **UI库**: Element Plus
- **HTTP客户端**: Axios
- **样式预处理器**: SCSS

### 后端
- **框架**: Node.js + Express
- **数据库**: MongoDB
- **认证**: JWT
- **ORM**: Mongoose
- **验证**: Express Validator
- **日志**: Winston

## 目录结构

```
├── client/                 # 前端项目
│   ├── src/                # 源代码
│   │   ├── assets/         # 静态资源
│   │   ├── components/     # 通用组件
│   │   ├── core/           # 核心模块
│   │   ├── layout/         # 布局组件
│   │   ├── modules/        # 功能模块
│   │   └── config/         # 配置文件
│   ├── public/             # 公共文件
│   ├── index.html          # HTML模板
│   ├── vite.config.ts      # Vite配置
│   ├── tsconfig.json       # TypeScript配置
│   └── package.json        # 前端依赖
├── server/                 # 后端项目
│   ├── src/                # 源代码
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── services/       # 服务层
│   │   └── utils/          # 工具函数
│   ├── package.json        # 后端依赖
│   └── tsconfig.json       # TypeScript配置
├── .env.example            # 环境变量示例
└── README.md               # 项目说明
```

## 快速开始

### 1. 环境准备

- **Node.js**: v16.0.0 或更高版本
- **MongoDB**: 本地安装或使用MongoDB Atlas免费版

### 2. 项目初始化

```bash
# 克隆项目
git clone <repository-url>
cd base-app

# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

### 3. 配置环境变量

复制 `.env.example` 文件为 `.env`，并根据实际情况修改配置：

```bash
# 数据库配置
MONGO_URI=mongodb://localhost:27017/base-app

# 认证配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=4000
NODE_ENV=development

# CORS配置
CORS_ORIGIN=http://localhost:3000
```

### 4. 启动项目

```bash
# 启动前端开发服务器
cd client
npm run dev

# 启动后端开发服务器
cd ../server
npm run dev
```

前端服务器运行在 `http://localhost:3000`，后端服务器运行在 `http://localhost:4000`。

### 5. 构建部署

```bash
# 构建前端
cd client
npm run build

# 构建后端
cd ../server
npm run build

# 启动生产服务器
npm start
```

## 免费部署指南

### 前端部署

#### Vercel
1. 登录 [Vercel](https://vercel.com/)
2. 点击 "New Project"
3. 选择前端代码仓库
4. 配置构建命令：`npm run build`
5. 配置输出目录：`dist`
6. 点击 "Deploy"

#### Netlify
1. 登录 [Netlify](https://www.netlify.com/)
2. 点击 "Add new site" → "Import an existing project"
3. 选择前端代码仓库
4. 配置构建命令：`npm run build`
5. 配置发布目录：`dist`
6. 点击 "Deploy site"

### 后端部署

#### Railway
1. 登录 [Railway](https://railway.app/)
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择后端代码仓库
4. 在 "Variables" 标签页添加环境变量
5. 点击 "Deploy"

#### Render
1. 登录 [Render](https://render.com/)
2. 点击 "New" → "Web Service"
3. 选择后端代码仓库
4. 配置构建命令：`npm install && npm run build`
5. 配置启动命令：`npm start`
6. 在 "Environment" 标签页添加环境变量
7. 点击 "Create Web Service"

### 数据库

#### MongoDB Atlas
1. 注册 [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. 创建免费集群
3. 创建数据库用户
4. 获取连接字符串
5. 在部署平台的环境变量中设置 `MONGO_URI`

## 模块扩展

### 1. 添加新页面

1. 在 `client/src/modules` 目录下创建新模块
2. 在 `client/src/core/router/index.ts` 中添加路由配置
3. 在 `client/src/config/menu.ts` 中添加菜单配置

### 2. 添加新API

1. 在 `server/src/controllers` 目录下创建新控制器
2. 在 `server/src/routes` 目录下创建新路由
3. 在 `server/src/app.ts` 中注册路由

### 3. 添加新组件

1. 在 `client/src/components` 目录下创建新组件
2. 在需要的页面中导入使用

## 核心功能使用

### 用户认证
- **登录**: `/login`
- **注册**: `/register`
- **密码重置**: 登录页点击 "忘记密码"

### 管理员功能
- **用户管理**: `/admin/users`
- **未验证用户**: `/admin/unverified`
- **菜单配置**: `/admin/menu`

### 普通用户功能
- **首页**: `/dashboard`
- **公告管理**: `/announcement/list`
- **消息中心**: `/message/list`
- **个人中心**: `/profile`
- **修改密码**: `/profile/password`

## 配置说明

### 菜单配置

修改 `client/src/config/menu.ts` 文件，可添加、删除或修改菜单：

```typescript
export const menuConfig = [
  {
    path: '/dashboard',
    label: '首页',
    icon: 'el-icon-s-home'
  },
  // 更多菜单...
]
```

### 环境配置

修改 `.env` 文件，配置数据库连接、JWT密钥等：

```env
# 数据库配置
MONGO_URI=mongodb://localhost:27017/base-app

# 认证配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## 注意事项

1. **安全警告**: 生产环境中请使用强JWT密钥，并定期更换
2. **邮箱验证**: 本项目包含邮箱验证功能，但默认未配置SMTP服务，需要自行配置
3. **删除用户**: 管理员删除用户功能仅用于测试环境，生产环境建议谨慎使用
4. **数据库**: 首次运行时会自动创建数据库和集合
5. **性能优化**: 生产环境建议启用Gzip压缩和缓存策略

## 开发指南

### 代码规范
- 使用ESLint和Prettier保持代码风格一致
- 遵循TypeScript类型规范
- 组件命名使用PascalCase，文件命名使用kebab-case

### 提交规范
- 使用Conventional Commits规范
- 提交信息格式: `type(scope): subject`

### 测试建议
- 前端: 使用Vue Test Utils和Jest
- 后端: 使用Supertest和Jest

## 常见问题

### 1. 登录失败
- 检查邮箱和密码是否正确
- 检查用户是否已验证邮箱
- 检查后端服务是否运行

### 2. 注册失败
- 检查邮箱是否已被注册
- 检查用户名是否已被使用
- 检查密码长度是否符合要求

### 3. 数据库连接失败
- 检查MongoDB服务是否运行
- 检查MONGO_URI配置是否正确
- 检查网络连接是否正常

### 4. 菜单不显示
- 检查菜单配置是否正确
- 检查用户角色是否有权限查看

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request，一起完善这个基础应用脚手架！

## 联系

如有问题或建议，欢迎联系我们。
