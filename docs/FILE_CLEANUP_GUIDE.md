# 文件整理指南

> **创建时间**: 2026-04-16  
> **目的**: 整理这一周生成的临时文件、测试文件和文档

---

## 📋 当前文件状态

### **需要保留的文件**

#### 1. **正式文档**（已完成，保留）
```
✅ docs/ARCHITECTURE.md        # 架构说明文档（刚创建，重要）
✅ OLLAMA_OPTIMIZATION_GUIDE.md # Ollama 优化指南（参考文档）
```

#### 2. **正式脚本**（生产环境使用）
```
✅ scripts/generate-daily-digest-v3.js  # 当前使用的日报生成脚本（已优化）
✅ scripts/fetch-content.sh            # Vercel 构建脚本（核心）
✅ scripts/run-fetch-content.js        # Node.js 包装器（核心）
```

#### 3. **内容文件**（需要处理）
```
📝 fri-content/daily/2026-04-14.md  # 已发布，需要推送到 fri-content 仓库
📝 fri-content/daily/2026-04-15.md  # 已发布，需要推送到 fri-content 仓库
📝 fri-content/daily/2026-04-16.md  # 已发布，需要推送到 fri-content 仓库
```

---

### **可以删除的文件**

#### 1. **测试脚本**（开发过程中的临时文件）
```
❌ scripts/generate-daily-digest-v2.js  # 旧版本，已被 v3 替代
❌ scripts/claude-translator.js         # 测试用，不再需要
❌ scripts/quick-check.js               # 临时测试脚本
❌ scripts/test-digest.js               # 测试脚本
❌ scripts/test-ollama-model.ps1        # PowerShell 测试脚本
❌ scripts/test-ollama-model.sh         # Bash 测试脚本
```

#### 2. **测试内容**
```
❌ fri-content/daily/TEST.md            # 测试文件，不是真实内容
```

#### 3. **工具目录**（自动生成，不需要提交）
```
❌ .codebuddy/                          # WorkBuddy 工具目录
❌ .workbuddy/                          # WorkBuddy 工作记录
```

**注意**: `.codebuddy/` 和 `.workbuddy/` 应该加入 `.gitignore`

---

## 🔧 整理步骤

### **第一步：处理内容文件**

内容文件需要推送到 **fri-content 独立仓库**：

```bash
# 1. 进入 fri-content 仓库
cd ../fri-content

# 2. 复制最新的日报文件
cp ../fri-portfolio/fri-content/daily/2026-04-14.md daily/
cp ../fri-portfolio/fri-content/daily/2026-04-15.md daily/
cp ../fri-portfolio/fri-content/daily/2026-04-16.md daily/

# 3. 提交并推送
git add daily/2026-04-14.md daily/2026-04-15.md daily/2026-04-16.md
git commit -m "add daily digests: 04-14 to 04-16"
git push origin master
```

---

### **第二步：清理测试文件**

回到 fri-portfolio 仓库，删除临时和测试文件：

```bash
cd ../fri-portfolio

# 删除测试脚本
rm scripts/generate-daily-digest-v2.js
rm scripts/claude-translator.js
rm scripts/quick-check.js
rm scripts/test-digest.js
rm scripts/test-ollama-model.ps1
rm scripts/test-ollama-model.sh

# 删除测试内容
rm fri-content/daily/TEST.md
```

---

### **第三步：更新 .gitignore**

确保以下内容在 `.gitignore` 中：

```bash
# 在 fri-portfolio/.gitignore 添加
.codebuddy/
.workbuddy/
fri-content/
content/
```

检查并确认：
```bash
cat .gitignore | grep -E "(codebuddy|workbuddy|fri-content|content)"
```

---

### **第四步：提交整理结果**

```bash
# 查看状态
git status

# 应该看到：
# - 新文件: docs/ARCHITECTURE.md, OLLAMA_OPTIMIZATION_GUIDE.md
# - 修改: scripts/generate-daily-digest-v3.js
# - 删除: scripts/*（测试文件）

# 分批提交
git add docs/ARCHITECTURE.md
git commit -m "docs: add architecture documentation"

git add OLLAMA_OPTIMIZATION_GUIDE.md
git commit -m "docs: add Ollama optimization guide"

git add scripts/generate-daily-digest-v3.js
git commit -m "feat: finalize daily digest generator v3"

git add .gitignore
git commit -m "chore: update gitignore to exclude tool directories"

git add -u  # 暂存所有删除操作
git commit -m "chore: remove temporary test files and scripts"

# 推送到远程
git push origin master
```

---

## 📂 整理后的目录结构

### **fri-portfolio（代码仓库）**

```
fri-portfolio/
├── docs/
│   ├── ARCHITECTURE.md              ✅ 新增：架构文档
│   └── FILE_CLEANUP_GUIDE.md        ✅ 新增：整理指南（本文件）
├── scripts/
│   ├── generate-daily-digest-v3.js  ✅ 保留：生产脚本
│   ├── fetch-content.sh             ✅ 保留：构建脚本
│   └── run-fetch-content.js         ✅ 保留：Node 包装器
├── OLLAMA_OPTIMIZATION_GUIDE.md     ✅ 保留：参考文档
├── .gitignore                       ✅ 更新：排除工具目录
└── （其他项目文件）
```

### **fri-content（内容仓库）**

```
fri-content/
├── daily/
│   ├── 2026-04-08.md  ✅
│   ├── 2026-04-09.md  ✅
│   ├── ...
│   ├── 2026-04-14.md  ✅ 新增
│   ├── 2026-04-15.md  ✅ 新增
│   └── 2026-04-16.md  ✅ 新增
├── diary/
└── weekly/
```

---

## ✅ 验证清单

整理完成后，检查以下项目：

- [ ] fri-content 仓库包含 04-14 到 04-16 的日报
- [ ] fri-portfolio 删除了所有测试脚本
- [ ] .gitignore 包含 `.codebuddy/` 和 `.workbuddy/`
- [ ] docs/ 目录包含 ARCHITECTURE.md
- [ ] git status 显示干净（没有未追踪的临时文件）
- [ ] 推送空 commit 到 fri-portfolio 触发 Vercel 构建
- [ ] 网站正常显示所有日报

---

## 🔄 触发 Vercel 更新

整理完成后，触发 Vercel 重新构建：

```bash
# 回到 fri-portfolio
cd fri-portfolio

# 推送空 commit
git commit --allow-empty -m "trigger: rebuild after content update"
git push origin master
```

等待 1-2 分钟后访问网站，确认日报正常显示。

---

## 📝 未来维护建议

### **每日日报自动化**
- ✅ 脚本已配置为每天 09:00 UTC+8 自动运行
- ✅ 输出直接到 fri-content/daily/
- ⚠️ 需要确保 Ollama 服务持续运行（localhost:11434）

### **内容发布流程**
1. 自动化脚本在 fri-portfolio/fri-content/ 生成文件
2. 手动复制到独立的 fri-content/ 仓库
3. 推送 fri-content 仓库
4. 推空 commit 到 fri-portfolio 触发 Vercel
5. Vercel 从 fri-content 拉取最新内容并部署

### **工具目录**
- `.codebuddy/` 和 `.workbuddy/` 是 WorkBuddy 的工作目录
- 包含自动化配置、记忆文件等
- 已加入 .gitignore，不会提交到仓库
- 可以保留在本地，不影响项目

---

## 🎯 核心原则

**代码与内容分离**：
- fri-portfolio = 代码（公开）
- fri-content = 内容（私密）
- 构建时动态组合

**文件分类**：
- 生产文件 → 保留并提交
- 测试文件 → 删除
- 文档文件 → 保留并整理到 docs/
- 工具目录 → .gitignore 排除

**提交规范**：
- 功能改动 → dev 分支测试 → master 合并
- 内容更新 → 直接 master（简化流程）
- 文档更新 → 直接 master

---

**最后更新**: 2026-04-16  
**维护者**: Iceyyou
