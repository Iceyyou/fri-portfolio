# fri-portfolio 架构说明文档

> **更新时间**: 2026-04-16  
> **适用对象**: 未来的自己、协作者、想 fork 这个项目的人

---

## 📚 目录

- [核心架构理念](#核心架构理念)
- [仓库结构](#仓库结构)
- [完整工作流程](#完整工作流程)
- [关键组件说明](#关键组件说明)
- [常见问题解答](#常见问题解答)
- [故障排查指南](#故障排查指南)

---

## 🎯 核心架构理念

### **代码与内容分离**

这个项目采用了"代码公开、内容私密"的设计理念：

```
fri-portfolio（公开仓库）
  - 网站源代码
  - 构建脚本
  - 任何人可以 fork 和学习

fri-content（私有仓库）
  - 个人日记、周报、日报
  - 私密内容，只有我能访问
  - Vercel 通过 TOKEN 授权访问
```

**为什么这样设计？**

1. ✅ **保护隐私**：别人能看到你的代码，但看不到你的内容
2. ✅ **代码共享**：其他开发者可以 fork 你的项目，用同样的代码搭建自己的网站
3. ✅ **内容独立**：他们只需要创建自己的 fri-content 仓库，写自己的内容
4. ✅ **灵活管理**：内容更新不需要改代码，代码优化不影响内容

---

## 📂 仓库结构

### **fri-portfolio（代码仓库）**

```
fri-portfolio/
├── src/                    # Next.js 源代码
│   ├── app/               # 页面组件
│   ├── components/        # 可复用组件
│   └── lib/               # 工具函数
│       └── content.ts     # 内容读取逻辑（关键文件）
├── scripts/               # 构建脚本
│   ├── fetch-content.sh   # 从 fri-content 拉取内容（核心脚本）
│   └── run-fetch-content.js  # Node.js 包装器
├── content/               # 临时内容目录（.gitignore 忽略）
│   ├── diary/            # 日记文件（构建时拉取）
│   ├── weekly/           # 周报文件（构建时拉取）
│   └── daily/            # 日报文件（构建时拉取）
├── .gitignore            # 明确忽略 content/
└── package.json          # build 命令: node scripts/run-fetch-content.js && next build
```

**关键点**：
- ⚠️ `content/` 目录被 `.gitignore` 忽略，**不会推送到 GitHub**
- ⚠️ 本地开发时，`content/` 可以手动复制一些文件用于预览
- ⚠️ Vercel 构建时，`content/` 是空的，由脚本动态填充

### **fri-content（内容仓库）**

```
fri-content/
├── diary/                 # 个人日记
│   └── 2026-04-16.md
├── weekly/                # 每周总结
│   └── 2026-W16.md
└── daily/                 # 每日摘要
    └── 2026-04-16.md
```

**关键点**：
- ✅ 私有仓库，只有我能访问
- ✅ 存储所有 markdown 格式的原始内容
- ✅ Vercel 通过 TOKEN 授权访问

---

## 🔄 完整工作流程

### **场景 1：本地开发**

```
1. 在 fri-content/ 仓库编写内容
   └─ 例如：fri-content/daily/2026-04-16.md

2. (可选) 手动复制到 fri-portfolio/content/daily/ 用于本地预览
   └─ cp ../fri-content/daily/2026-04-16.md content/daily/

3. 运行本地开发服务器
   └─ npm run dev
   └─ Next.js 从 content/daily/ 读取文件

4. 推送内容到 fri-content 仓库
   └─ cd ../fri-content
   └─ git add . && git commit -m "add daily digest" && git push
```

**注意**：
- 本地的 `content/` 目录不会被提交（.gitignore）
- 本地开发时可以随意修改 `content/` 里的文件进行测试

---

### **场景 2：Vercel 自动部署**

#### **步骤详解**

```
1️⃣ 代码更新触发
   你修改了 fri-portfolio 的代码 → git push origin master
   ↓
   GitHub fri-portfolio 仓库更新
   ↓
   GitHub 通过 webhook 通知 Vercel："有新 commit 了！"

2️⃣ Vercel 开始构建
   Vercel 启动一个全新的构建服务器（临时环境）
   ↓
   从 GitHub 克隆 fri-portfolio 仓库
   ├── src/          ← 代码已下载
   ├── scripts/      ← 脚本已下载
   └── content/      ← 空目录（.gitignore 导致的）

3️⃣ 执行构建命令（package.json 定义）
   命令：node scripts/run-fetch-content.js && next build
   ↓
   第一步：run-fetch-content.js 调用 fetch-content.sh

4️⃣ fetch-content.sh 脚本工作流程
   a. 检查环境变量 CONTENT_GITHUB_TOKEN
      └─ 如果没有 → 报错退出（构建失败）
      └─ 如果有 → 继续

   b. 获取当前分支（VERCEL_GIT_COMMIT_REF）
      └─ 例如：master 或 dev

   c. 从 GitHub 克隆 fri-content 仓库
      └─ git clone https://$TOKEN@github.com/Iceyyou/fri-content.git
      └─ 克隆到临时目录：/tmp/fri-content-clone
      └─ 使用 TOKEN 认证（这是关键！）

   d. 复制内容文件到 content/ 目录
      └─ cp -r /tmp/fri-content-clone/diary/* content/diary/
      └─ cp -r /tmp/fri-content-clone/weekly/* content/weekly/
      └─ cp -r /tmp/fri-content-clone/daily/* content/daily/

   e. 清理临时目录
      └─ rm -rf /tmp/fri-content-clone

5️⃣ Next.js 构建
   命令：next build
   ↓
   Next.js 读取 content/daily/*.md（src/lib/content.ts）
   ↓
   生成静态 HTML 页面
   ↓
   优化、压缩、准备部署

6️⃣ 部署
   Vercel 将生成的静态文件部署到 CDN
   ↓
   网站 fri.z1han.com 更新完成！

7️⃣ 清理
   构建服务器销毁（包括临时的 content/ 目录）
```

#### **流程图（简化版）**

```
你的电脑
  ↓ git push
GitHub fri-portfolio
  ↓ webhook
Vercel 构建服务器
  ↓ 克隆代码仓库
  ↓ 执行 fetch-content.sh
  ↓ 用 TOKEN 克隆 fri-content
  ↓ 复制到 content/
  ↓ Next.js 读取 content/
  ↓ 生成 HTML
  ↓ 部署到 CDN
  ↓ 清理临时文件
fri.z1han.com 更新完成
```

---

## 🔑 关键组件说明

### **1. GitHub Personal Access Token**

**作用**：允许 Vercel 访问私有仓库 fri-content

**配置位置**：
- Vercel Dashboard → fri-portfolio → Settings → Environment Variables
- 变量名：`CONTENT_GITHUB_TOKEN`
- 值：GitHub Personal Access Token（需要 `repo` 权限）

**如何创建**：
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. 勾选 `repo` 权限（完整私有仓库访问）
4. 复制 token
5. 粘贴到 Vercel 环境变量

**重要提示**：
- ⚠️ Token 过期会导致构建失败（无法拉取内容）
- ⚠️ 定期检查 token 有效期
- ⚠️ Token 泄露会导致私有仓库暴露，请妥善保管

---

### **2. content/ 目录的三种状态**

| 环境 | content/ 状态 | 来源 | 作用 |
|------|-------------|------|------|
| **你的电脑** | 可选（手动复制） | 手动从 fri-content 复制 | 本地开发预览 |
| **GitHub fri-portfolio** | 不存在 | .gitignore 忽略 | 保持代码仓库干净 |
| **Vercel 构建服务器** | 临时（动态生成） | fetch-content.sh 拉取 | 供 Next.js 构建使用 |

**为什么必须存在 content/ 这个中转站？**

```javascript
// src/lib/content.ts
const contentDir = path.join(process.cwd(), 'content', 'daily');
const files = fs.readdirSync(contentDir);  // Next.js 只能读本地文件系统！
```

- ❌ Next.js 不能直接读取 GitHub 仓库
- ❌ Next.js 不能读取远程 URL
- ✅ Next.js 只能读取本地文件路径
- ✅ 所以必须先把内容拉取到本地 `content/` 目录

**类比**：
- `fri-content` = 超市（食材仓库）
- `content/` = 砧板（操作台）
- `Next.js` = 厨师（只会在砧板上操作，不会去超市拿东西）

---

### **3. fetch-content.sh 脚本详解**

**位置**：`scripts/fetch-content.sh`

**核心逻辑**：

```bash
# 1. 获取 TOKEN
TOKEN="${CONTENT_GITHUB_TOKEN:-$DIARY_GITHUB_TOKEN}"

if [ -z "$TOKEN" ]; then
  echo "ERROR: No GitHub token set"
  exit 1  # 构建失败，暴露配置问题
fi

# 2. 获取分支（支持 master/dev 分离）
BRANCH="${VERCEL_GIT_COMMIT_REF:-master}"

# 3. 克隆私有仓库
CLONE_DIR="/tmp/fri-content-clone"
git clone -b "$BRANCH" \
  "https://$TOKEN@github.com/Iceyyou/fri-content.git" \
  "$CLONE_DIR"

# 4. 复制内容
cp -r "$CLONE_DIR/diary"/* content/diary/ 2>/dev/null || true
cp -r "$CLONE_DIR/weekly"/* content/weekly/ 2>/dev/null || true
cp -r "$CLONE_DIR/daily"/* content/daily/ 2>/dev/null || true

# 5. 清理
rm -rf "$CLONE_DIR"
```

**为什么用 HTTPS 而不是 SSH？**
- Vercel 构建环境没有配置 SSH 密钥
- HTTPS + TOKEN 是标准的 CI/CD 认证方式
- 格式：`https://<TOKEN>@github.com/<USER>/<REPO>.git`

---

### **4. 分支感知机制**

**环境变量**：`VERCEL_GIT_COMMIT_REF`

Vercel 自动设置这个变量：
- `master` → 生产环境部署
- `dev` → 预览环境部署

**脚本会自动从 fri-content 的对应分支拉取内容**：
```bash
BRANCH="${VERCEL_GIT_COMMIT_REF:-master}"
git clone -b "$BRANCH" ...
```

**好处**：
- ✅ 测试环境用 dev 分支的内容
- ✅ 生产环境用 master 分支的内容
- ✅ 内容和代码的环境完全隔离

---

## ❓ 常见问题解答

### **Q1: 为什么不直接把内容放在 fri-portfolio 里？**

**A**: 为了保护隐私和代码共享。

如果把内容直接放在 fri-portfolio：
- ❌ 推送到 GitHub 时，私人日记会被公开
- ❌ 别人 fork 你的项目时，会连你的内容一起 fork
- ❌ 代码更新和内容更新混在一起，管理混乱

现在的架构：
- ✅ 代码公开（fri-portfolio），任何人可以学习和使用
- ✅ 内容私密（fri-content），只有你和授权的 Vercel 能访问
- ✅ 别人 fork 后，创建自己的 fri-content，写自己的内容

---

### **Q2: content/ 目录到底在哪里？**

**A**: **三个独立的地方，互不影响**

| 位置 | 状态 | 作用 |
|------|------|------|
| 你的电脑 `c:/Users/.../fri-portfolio/content/` | 可选（本地开发用） | 手动复制文件用于预览 |
| GitHub `Iceyyou/fri-portfolio` | **不存在** | .gitignore 忽略了 |
| Vercel 构建服务器 | 临时（动态创建） | 脚本拉取内容，构建完删除 |

**关键理解**：
- Vercel **不会访问你的电脑**
- Vercel 只从 **GitHub** 拉取代码和内容
- 你的本地 `content/` 和 Vercel 的 `content/` 完全独立

---

### **Q3: 为什么不让 Next.js 直接读取 fri-content 仓库？**

**A**: **技术限制 + 设计原则**

```javascript
// Next.js 的文件读取方式
const files = fs.readdirSync('./content/daily');  // ✅ 本地文件系统
const files = fetch('https://github.com/...');   // ❌ 不支持这样读取
```

- ❌ Next.js 的 `fs` 模块只能读取本地文件
- ❌ 不能直接读取远程 GitHub 仓库
- ❌ 硬编码绝对路径（如 `/tmp/fri-content-clone`）会破坏可移植性
- ✅ 所以必须先拉取到 `content/`，再让 Next.js 读取

---

### **Q4: TOKEN 过期了会怎样？**

**A**: **构建失败，网站无法更新**

**症状**：
- Vercel 显示 "Ready"
- 但网站内容不更新（缺少最新的日报）

**原因**：
```bash
# fetch-content.sh 执行时
git clone https://$TOKEN@github.com/Iceyyou/fri-content.git
# 返回错误：
remote: Invalid username or token.
fatal: Authentication failed
```

**解决方法**：
1. GitHub → Settings → Developer settings → Personal access tokens
2. 重新生成 token（勾选 `repo` 权限）
3. 复制新 token
4. Vercel Dashboard → Settings → Environment Variables → 编辑 `CONTENT_GITHUB_TOKEN`
5. 推送空 commit 或手动 Redeploy 触发重新构建

---

### **Q5: 本地开发时如何预览内容？**

**A**: **手动复制文件到 content/**

```bash
# 方法 1：手动复制单个文件
cp ../fri-content/daily/2026-04-16.md content/daily/

# 方法 2：复制所有文件
cp -r ../fri-content/daily/* content/daily/
cp -r ../fri-content/diary/* content/diary/
cp -r ../fri-content/weekly/* content/weekly/

# 方法 3：运行 fetch-content.sh（需要 TOKEN）
export CONTENT_GITHUB_TOKEN="your_token_here"
bash scripts/fetch-content.sh
```

**注意**：
- 本地的 `content/` 不会被提交到 Git（.gitignore）
- 你可以随意修改测试，不会影响远程仓库

---

## 🔧 故障排查指南

### **问题 1：网站看不到日报**

**排查步骤**：

1. **检查 fri-content 仓库**
   ```bash
   cd fri-content
   git log --oneline -1  # 确认最新 commit
   ls daily/             # 确认文件存在
   ```

2. **检查 Vercel 环境变量**
   - Dashboard → Settings → Environment Variables
   - 确认 `CONTENT_GITHUB_TOKEN` 存在且有效

3. **查看 Vercel 构建日志**
   - Dashboard → Deployments → 点击最新部署
   - 搜索 `[fetch-content]`
   - 检查是否有错误信息：
     - `ERROR: No GitHub token set` → TOKEN 未配置
     - `Authentication failed` → TOKEN 过期或权限不足
     - `Failed to clone repository` → 网络问题或分支不存在

4. **手动触发重新构建**
   ```bash
   cd fri-portfolio
   git commit --allow-empty -m "trigger rebuild"
   git push
   ```

---

### **问题 2：构建失败**

**常见原因**：

| 错误信息 | 原因 | 解决方法 |
|---------|------|----------|
| `No GitHub token set` | TOKEN 未配置 | 在 Vercel 添加 `CONTENT_GITHUB_TOKEN` |
| `Authentication failed` | TOKEN 过期/无效 | 重新生成 TOKEN 并更新 Vercel |
| `branch not found` | fri-content 没有对应分支 | 创建 dev 分支或修改脚本默认分支 |
| `permission denied` | TOKEN 权限不足 | 重新生成 TOKEN 并勾选 `repo` 权限 |

---

### **问题 3：本地开发正常，Vercel 部署后内容缺失**

**原因**：本地有文件，但 Vercel 拉取失败

**排查**：
1. 确认 fri-content 已推送到 GitHub
   ```bash
   cd fri-content
   git push origin master
   ```

2. 确认 Vercel TOKEN 有效
   - 手动测试：
   ```bash
   git clone https://$TOKEN@github.com/Iceyyou/fri-content.git /tmp/test
   ```

3. 检查 .gitignore 是否正确忽略 content/
   ```bash
   cat .gitignore | grep content
   # 应该输出：content/
   ```

---

## 📝 工作流程最佳实践

### **开发流程**

1. **修改代码**（fri-portfolio）
   ```bash
   cd fri-portfolio
   # 修改代码...
   git add .
   git commit -m "feat: add new feature"
   git push origin master  # 触发 Vercel 部署
   ```

2. **更新内容**（fri-content）
   ```bash
   cd fri-content
   # 编辑 daily/2026-04-16.md
   git add .
   git commit -m "add daily digest"
   git push origin master

   # 触发 fri-portfolio 重新构建
   cd ../fri-portfolio
   git commit --allow-empty -m "trigger: update content"
   git push
   ```

---

### **分支管理**

| 分支 | 用途 | 部署环境 |
|------|------|----------|
| `master` | 生产环境 | fri.z1han.com（正式） |
| `dev` | 测试环境 | Vercel Preview URL |

**重要规则**：
- ⚠️ 功能改动必须走 `dev` → 测试 → `master` 流程
- ⚠️ 内容更新可以直接推送 `master`（简化流程）
- ⚠️ 两个仓库的分支要对应（dev 对 dev，master 对 master）

---

## 🎓 关键学习总结

### **架构核心**

1. **代码与内容分离**
   - 代码公开（fri-portfolio）
   - 内容私密（fri-content）
   - 构建时动态组合

2. **TOKEN 授权机制**
   - Vercel 用 TOKEN 访问私有仓库
   - TOKEN 过期会导致构建失败
   - 定期检查 TOKEN 有效期

3. **content/ 是临时中转站**
   - 本地开发：手动复制用于预览
   - Vercel 构建：脚本动态拉取
   - 不会被提交到 Git（.gitignore）

4. **Next.js 只能读本地文件**
   - 不能直接读远程仓库
   - 必须先拉取到 `content/`
   - 这是技术限制，不是设计冗余

---

## 🔗 相关文档

- [Next.js 文档](https://nextjs.org/docs)
- [Vercel 环境变量](https://vercel.com/docs/concepts/projects/environment-variables)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Git Submodules vs Separate Repos](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

---

## 📞 联系方式

如果你 fork 了这个项目并遇到问题，可以：
- 查看本文档的故障排查部分
- 检查 Vercel 构建日志
- 确认 TOKEN 配置正确

---

**最后更新**: 2026-04-16  
**维护者**: Iceyyou  
**License**: MIT (代码部分)

