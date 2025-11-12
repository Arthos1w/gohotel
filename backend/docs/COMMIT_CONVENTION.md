# 📝 Git 提交信息规范（Conventional Commits）

## 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

---

## 🏷️ Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| **feat** | 新功能 | `feat(booking): 添加房间预订功能` |
| **fix** | 修复 bug | `fix(payment): 修复支付超时问题` |
| **docs** | 文档更新 | `docs(api): 更新 API 文档` |
| **style** | 代码格式（不影响代码运行） | `style: 格式化代码` |
| **refactor** | 重构 | `refactor(user): 重构用户服务层` |
| **perf** | 性能优化 | `perf(db): 优化数据库查询` |
| **test** | 测试 | `test(booking): 添加预订单元测试` |
| **build** | 构建系统 | `build: 升级依赖包版本` |
| **ci** | CI/CD 配置 | `ci: 配置 GitHub Actions` |
| **chore** | 其他修改 | `chore: 更新 .gitignore` |
| **revert** | 回滚 | `revert: 回滚到 v1.2.0` |

---

## 📦 Scope 范围（可选）

指定提交影响的模块或功能：

- `user` - 用户模块
- `room` - 房间模块
- `booking` - 预订模块
- `payment` - 支付模块
- `auth` - 认证模块
- `api` - API 接口
- `db` - 数据库
- `config` - 配置
- `utils` - 工具函数

---

## 💡 Subject 主题

- 使用祈使句，现在时态："添加"而不是"添加了"
- 不要大写首字母
- 结尾不加句号
- 简洁明了，不超过 50 个字符

**✅ 好的示例：**
```
feat(user): 添加用户注册功能
fix(booking): 修复预订日期验证逻辑
```

**❌ 不好的示例：**
```
添加了用户功能。
Fix bug
更新
```

---

## 📄 Body 正文（可选）

- 详细说明提交的内容
- 解释"为什么"而不是"做了什么"
- 可以分多行
- 与 subject 空一行

---

## 🔗 Footer 页脚（可选）

- 关联 Issue：`Closes #123` 或 `Fixes #456`
- 不兼容变更：`BREAKING CHANGE: 说明`

---

## 📝 完整示例

### 示例 1：新功能

```
feat(booking): 实现酒店房间预订功能

- 添加预订创建接口
- 实现房间可用性检查
- 支持多日期范围查询
- 添加预订状态管理

Closes #123
```

### 示例 2：Bug 修复

```
fix(payment): 修复支付接口超时问题

支付接口在高并发场景下会出现超时，原因是：
1. 数据库连接池设置过小
2. 未使用缓存

解决方案：
- 增加连接池大小到 100
- 添加 Redis 缓存层

Fixes #456
```

### 示例 3：重构

```
refactor(user): 重构用户服务层代码

将原来的单体服务拆分为：
- UserService（业务逻辑）
- UserRepository（数据访问）

提高代码可测试性和可维护性
```

### 示例 4：性能优化

```
perf(db): 优化数据库查询性能

- 为 booking 表添加复合索引
- 优化 N+1 查询问题
- 使用 GORM Preload 预加载

查询性能提升 80%
```

### 示例 5：破坏性变更

```
feat(api): 重构 API 响应格式

BREAKING CHANGE: API 响应格式已更改

旧格式：
{
  "code": 200,
  "data": {...}
}

新格式：
{
  "success": true,
  "data": {...}
}

迁移指南：前端需要更新响应处理逻辑
```

---

## 🎯 提交频率建议

- **功能开发中**：每完成一个小功能就提交
- **Bug 修复**：每修复一个 bug 提交一次
- **重构**：按模块或文件提交
- **不要**：一次提交太多修改

---

## ⚙️ 配置提交检查（可选）

### 使用 commitlint

```bash
# 安装
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# 配置 commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional']
}

# 配置 husky
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
```

---

## 📊 提交统计示例

```bash
# 查看提交统计
git log --oneline --all --graph

# 按类型统计
git log --oneline | grep "^feat" | wc -l
git log --oneline | grep "^fix" | wc -l

# 生成 CHANGELOG
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

---

## 🔍 快速参考

```bash
# 新功能
git commit -m "feat(booking): 添加预订功能"

# Bug 修复
git commit -m "fix(auth): 修复 token 过期问题"

# 文档
git commit -m "docs: 更新 API 文档"

# 重构
git commit -m "refactor(service): 重构服务层代码"

# 性能
git commit -m "perf(db): 优化查询性能"

# 测试
git commit -m "test(booking): 添加单元测试"
```





