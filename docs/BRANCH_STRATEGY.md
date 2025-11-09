# 🌳 Git 分支管理策略

## 分支模型：Git Flow

本项目采用 **Git Flow** 分支管理策略，适合有明确发布周期的项目。

---

## 📋 分支类型

### 🔴 **永久分支**

#### 1. `main` 分支
- **用途**：生产环境代码，始终保持稳定可发布状态
- **保护规则**：
  - ✅ 禁止直接 push
  - ✅ 只能通过 Pull Request 合并
  - ✅ 需要至少 1 人 Code Review
  - ✅ 必须通过 CI/CD 测试
- **对应环境**：生产环境（Production）
- **版本标签**：每次合并都需要打 tag

```bash
# 查看 main 分支
git checkout main
git pull origin main

# 禁止直接在 main 分支开发！
```

#### 2. `develop` 分支
- **用途**：开发主分支，集成所有已完成的功能
- **保护规则**：
  - ✅ 禁止直接 push（建议）
  - ✅ 通过 Pull Request 合并
- **对应环境**：开发环境/测试环境
- **特点**：代码可能不稳定，但是最新的

```bash
# 日常开发基于这个分支
git checkout develop
git pull origin develop
```

---

### 🟢 **临时分支（用完即删）**

#### 3. `feature/*` 功能开发分支

**命名规范：**
```
feature/功能描述
feature/模块-功能描述
feature/JIRA-123-功能描述
```

**示例：**
```
feature/user-login
feature/booking-create
feature/payment-integration
feature/HOTEL-001-room-management
```

**工作流：**

```bash
# 1. 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/user-login

# 2. 开发中...提交代码
git add .
git commit -m "feat(user): 实现用户登录功能"
git commit -m "feat(user): 添加密码加密"

# 3. 推送到远程
git push origin feature/user-login

# 4. 在 GitHub/GitLab 创建 Pull Request
#    从 feature/user-login → develop

# 5. Code Review 通过后合并

# 6. 删除功能分支（本地 + 远程）
git checkout develop
git pull origin develop
git branch -d feature/user-login
git push origin --delete feature/user-login
```

**规则：**
- ✅ 从 `develop` 创建
- ✅ 合并回 `develop`
- ✅ 功能开发完成后删除
- ✅ 保持分支小而专注
- ❌ 不要从其他 feature 分支创建

---

#### 4. `release/*` 发布准备分支

**命名规范：**
```
release/v主版本号.次版本号.修订号
```

**示例：**
```
release/v1.0.0
release/v1.2.0
release/v2.0.0
```

**用途：**
- 准备发布新版本
- 只做 bug 修复和版本号更新
- 不添加新功能

**工作流：**

```bash
# 1. 从 develop 创建发布分支
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. 更新版本号（如果有）
# 修改 version.go 或 package.json

# 3. 修复测试中发现的 bug
git commit -m "fix(booking): 修复预订日期验证"
git commit -m "fix(ui): 修复页面显示问题"

# 4. 测试通过后，合并到 main
git checkout main
git pull origin main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0

新增功能：
- 用户注册登录
- 房间预订管理
- 支付集成

Bug 修复：
- 修复日期验证问题
- 修复页面显示 bug
"
git push origin main --tags

# 5. 同步到 develop
git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop

# 6. 删除发布分支
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

**规则：**
- ✅ 从 `develop` 创建
- ✅ 合并到 `main` 和 `develop`
- ✅ 在 `main` 上打版本标签
- ❌ 不添加新功能
- ❌ 只做 bug 修复

---

#### 5. `hotfix/*` 紧急修复分支

**命名规范：**
```
hotfix/v主版本号.次版本号.修订号
hotfix/bug描述
```

**示例：**
```
hotfix/v1.2.1
hotfix/payment-timeout
hotfix/critical-security-fix
```

**用途：**
- 修复生产环境的紧急 bug
- 不能等到下个版本发布

**工作流：**

```bash
# 1. 从 main 创建热修复分支
git checkout main
git pull origin main
git checkout -b hotfix/v1.2.1

# 2. 修复 bug
git commit -m "fix(payment): 修复支付接口超时问题"

# 3. 测试通过后，合并到 main
git checkout main
git merge --no-ff hotfix/v1.2.1
git tag -a v1.2.1 -m "Hotfix v1.2.1: 修复支付超时"
git push origin main --tags

# 4. 同步到 develop
git checkout develop
git merge --no-ff hotfix/v1.2.1
git push origin develop

# 5. 删除热修复分支
git branch -d hotfix/v1.2.1
git push origin --delete hotfix/v1.2.1
```

**规则：**
- ✅ 从 `main` 创建
- ✅ 合并到 `main` 和 `develop`
- ✅ 在 `main` 上打版本标签
- ✅ 修复完成立即合并
- ❌ 不做功能开发

---

## 🏷️ 版本标签规范

### 语义化版本号（Semantic Versioning）

**格式：** `v主版本号.次版本号.修订号`

```
v1.2.3
│ │ │
│ │ └─ PATCH：修复 bug，向下兼容
│ └─── MINOR：新增功能，向下兼容
└───── MAJOR：重大更新，可能不兼容
```

### 版本号递增规则

```bash
v0.1.0  # 初始开发版本
v0.2.0  # 开发中，添加新功能
v1.0.0  # 第一个正式发布版本

v1.1.0  # 新增功能（向下兼容）
v1.1.1  # 修复 bug
v1.2.0  # 新增更多功能

v2.0.0  # 重大更新（API 不兼容）
```

### 预发布版本

```bash
v1.0.0-alpha    # 内部测试版
v1.0.0-alpha.1  # 内部测试版修订 1
v1.0.0-beta     # 公开测试版
v1.0.0-beta.1   # 公开测试版修订 1
v1.0.0-rc.1     # Release Candidate（候选发布版）
v1.0.0          # 正式版
```

### 创建标签

```bash
# 1. 轻量标签（不推荐）
git tag v1.0.0

# 2. 附注标签（推荐）
git tag -a v1.0.0 -m "Release version 1.0.0

新增功能：
- 用户注册登录
- 房间预订管理
- 支付系统集成

Bug 修复：
- 修复登录超时问题
- 修复预订日期验证

性能优化：
- 数据库查询优化
- 缓存机制
"

# 3. 推送标签到远程
git push origin v1.0.0

# 4. 推送所有标签
git push origin --tags

# 5. 删除标签
git tag -d v1.0.0                    # 删除本地
git push origin :refs/tags/v1.0.0    # 删除远程

# 6. 查看标签
git tag -l
git show v1.0.0
```

---

## 📊 分支结构图

```
main (生产环境，v1.0.0, v1.1.0, v2.0.0)
  │
  ├─ hotfix/v1.0.1 (紧急修复)
  │   └─> 合并回 main 和 develop
  │
  ├─ release/v1.1.0 (发布准备)
  │   └─> 合并到 main 和 develop
  │
develop (开发环境)
  │
  ├─ feature/user-login (功能1)
  │   └─> 合并回 develop
  │
  ├─ feature/booking-create (功能2)
  │   └─> 合并回 develop
  │
  └─ feature/payment-integration (功能3)
      └─> 合并回 develop
```

---

## 🎯 实战场景

### 场景 1：开发新功能

```bash
# 团队成员 A 开发用户登录功能
git checkout develop
git pull origin develop
git checkout -b feature/user-login

# 开发中...
git add .
git commit -m "feat(user): 实现用户登录接口"
git commit -m "feat(user): 添加 JWT 认证"

# 推送并创建 Pull Request
git push origin feature/user-login
# 在 GitHub 创建 PR: feature/user-login → develop
```

### 场景 2：准备发布 v1.2.0

```bash
# 1. 创建发布分支
git checkout develop
git checkout -b release/v1.2.0

# 2. 修复测试发现的 bug
git commit -m "fix(ui): 修复页面显示问题"

# 3. 合并到 main 并打标签
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags

# 4. 同步到 develop
git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop

# 5. 删除发布分支
git branch -d release/v1.2.0
```

### 场景 3：修复生产环境紧急 bug

```bash
# 1. 创建热修复分支
git checkout main
git checkout -b hotfix/v1.2.1

# 2. 修复 bug
git commit -m "fix(payment): 修复支付超时"

# 3. 合并到 main
git checkout main
git merge --no-ff hotfix/v1.2.1
git tag -a v1.2.1 -m "Hotfix: 支付超时"
git push origin main --tags

# 4. 同步到 develop
git checkout develop
git merge --no-ff hotfix/v1.2.1
git push origin develop

# 5. 清理
git branch -d hotfix/v1.2.1
```

---

## ✅ 最佳实践

### 1. 分支命名
- ✅ 使用小写字母和连字符
- ✅ 描述性强，一目了然
- ✅ 包含模块或功能名称
- ❌ 不要用个人名字

### 2. 提交频率
- ✅ 每完成一个小功能就提交
- ✅ 提交信息清晰明了
- ❌ 不要一次提交太多修改

### 3. 分支生命周期
- ✅ 功能分支尽快合并，不要拖太久
- ✅ 合并后立即删除
- ✅ 定期从 develop 更新

### 4. Code Review
- ✅ 所有代码必须经过 Review
- ✅ 至少 1 人 approve
- ✅ 通过 CI/CD 测试

### 5. 冲突解决
```bash
# 更新本地分支
git checkout feature/user-login
git fetch origin
git rebase origin/develop

# 解决冲突...
git add .
git rebase --continue
git push origin feature/user-login --force-with-lease
```

---

## 🔒 分支保护规则（GitHub/GitLab）

### main 分支
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Include administrators
- ✅ Restrict who can push to matching branches
- ❌ Allow force pushes

### develop 分支
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ❌ Allow force pushes

---

## 📚 快速参考

```bash
# 查看所有分支
git branch -a

# 查看分支图
git log --oneline --graph --all

# 清理已删除的远程分支
git fetch --prune

# 查看当前分支
git branch --show-current

# 切换分支
git checkout <branch-name>

# 创建并切换分支
git checkout -b <branch-name>

# 删除本地分支
git branch -d <branch-name>

# 删除远程分支
git push origin --delete <branch-name>
```

