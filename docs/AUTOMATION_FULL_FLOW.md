# Daily Digest 完全自动化流程说明

**更新日期**: 2026-04-16

---

## 📋 概述

每天 09:00 UTC+8 (北京时间)，自动生成 AI 行业日报并部署到网站，**全程无需人工介入**。

---

## 🔄 完整流程

```
每天 09:00 UTC+8
    ↓
【1. 生成日报】
    自动化调用: generate-daily-digest-v3.js
    - 从 follow-builders skill 获取原始数据
    - 使用 Ollama qwen2:1.5b 提取关键洞察
    - 生成 markdown 文件
    - 输出: fri-content/daily/YYYY-MM-DD.md
    ↓
【2. 推送到内容仓库】
    自动执行 Git 操作:
    - git add daily/YYYY-MM-DD.md
    - git commit -m "daily: auto-generated digest for YYYY-MM-DD"
    - git push origin master
    ↓
【3. 触发 Vercel 重新构建】
    自动推送空 commit 到代码仓库:
    - git commit --allow-empty -m "trigger: rebuild for daily digest YYYY-MM-DD"
    - git push origin master
    ↓
【4. Vercel 自动部署】
    - 检测到 fri-portfolio/master 更新
    - 执行构建脚本: fetch-content.sh
    - 从 fri-content 仓库拉取最新内容
    - 构建 Next.js 应用
    - 部署到生产环境
    ↓
【5. 用户直接查看】
    - 访问网站即可看到新内容
    - 无需任何手动操作
```

---

## 🛠️ 技术实现

### **脚本位置**
`scripts/generate-daily-digest-v3.js`

### **关键代码段**

```javascript
// Step 4: 生成文件
fs.writeFileSync(outputPath, markdown, 'utf-8');

// Step 5: 自动推送到 fri-content
execSync(`git add daily/${today}.md`, { cwd: friContentRoot });
execSync(`git commit -m "daily: auto-generated digest for ${today}"`, { cwd: friContentRoot });
execSync(`git push origin master`, { cwd: friContentRoot });

// Step 6: 触发 Vercel
execSync(`git commit --allow-empty -m "trigger: rebuild for daily digest ${today}"`, { cwd: workspaceRoot });
execSync(`git push origin master`, { cwd: workspaceRoot });
```

### **错误处理**
- Git 操作失败不影响文件生成
- 降级为"文件已生成，需手动推送"
- 输出详细日志便于排查

---

## 📂 涉及的仓库

### **1. fri-portfolio (代码仓库)**
- 公开仓库
- 存放脚本、配置、Next.js 应用代码
- 自动化配置在 `.codebuddy/automations/`

### **2. fri-content (内容仓库)**
- 私有仓库
- 存放日记、周报、日报等内容
- Vercel 构建时从这里拉取数据

### **3. 关系**
```
fri-portfolio/
├── scripts/generate-daily-digest-v3.js  ← 脚本在这里
└── .codebuddy/automations/              ← 自动化配置

fri-content/                             ← 独立仓库
└── daily/YYYY-MM-DD.md                  ← 内容输出到这里

Vercel:
fri-portfolio (master) → 触发构建 → 拉取 fri-content → 部署
```

---

## 🔍 问题排查

### **如果日报没有自动更新**

#### **1. 检查自动化是否运行**
```bash
cd c:/Users/v_btingli/WorkBuddy/20260407150730/fri-portfolio
cat .codebuddy/automations/daily-digest-generation/memory.md
```

查看最后一次执行时间和状态。

#### **2. 检查 fri-content 是否有新提交**
```bash
cd c:/Users/v_btingli/WorkBuddy/20260407150730/fri-content
git log --oneline -5
```

应该看到类似的提交：
```
xxxxxxx daily: auto-generated digest for 2026-04-17
```

#### **3. 检查 fri-portfolio 是否触发了 Vercel**
```bash
cd c:/Users/v_btingli/WorkBuddy/20260407150730/fri-portfolio
git log --oneline -5
```

应该看到类似的提交：
```
xxxxxxx trigger: rebuild for daily digest 2026-04-17
```

#### **4. 检查 Vercel 构建日志**
- 登录 Vercel Dashboard
- 查看 fri-portfolio 项目的 Deployments
- 查看最新构建的日志
- 关键点：`[fetch-content]` 的输出

---

## ⚙️ 自动化配置

### **调度规则**
```
FREQ=DAILY;BYHOUR=9;BYMINUTE=0
```
每天 09:00 UTC+8

### **工作目录**
```
c:/Users/v_btingli/WorkBuddy/20260407150730/fri-portfolio
```

### **依赖**
- Ollama 服务运行在 `localhost:11434`
- 模型: `qwen2:1.5b`
- 网络连接（用于推送到 GitHub）

---

## 🎯 关键特性

### **完全自动化**
- ✅ 无需人工检查
- ✅ 无需手动推送
- ✅ 无需触发构建
- ✅ 睡一觉起来，新内容已经在网站上了

### **可靠性**
- ✅ 错误处理完善
- ✅ 文件生成优先（即使 Git 失败也有文件）
- ✅ 详细日志输出
- ✅ 降级方案（手动推送）

### **可维护性**
- ✅ 单一脚本实现完整流程
- ✅ 清晰的步骤分离
- ✅ 易于调试和测试
- ✅ 记录完整的执行日志

---

## 📅 历史

### **2026-04-10**
- 初始实现 v3 脚本
- 集成 Ollama 提取洞察
- **缺少自动推送功能**

### **2026-04-14 到 2026-04-16**
- 发现问题：需要手动推送
- 临时方案：AI 手动推送
- 用户每天需要检查

### **2026-04-16 17:33**
- **实现完全自动化**
- 添加 Git 自动推送
- 添加 Vercel 触发
- 测试验证成功

---

## ✅ 验证

### **首次完整自动化运行**
预计: **2026-04-17 09:00 UTC+8**

### **验证清单**
- [ ] 09:00 自动化运行
- [ ] fri-content 新增提交
- [ ] fri-portfolio 触发提交
- [ ] Vercel 构建成功
- [ ] 网站显示新日报

---

**状态**: ✅ 已实现完全自动化，等待明天首次运行验证。

---

Last updated: 2026-04-16 17:35 UTC+8
