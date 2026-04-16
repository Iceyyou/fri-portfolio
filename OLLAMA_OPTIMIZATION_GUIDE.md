# 优化 Ollama 脚本 - 轻量模型测试指南

## 📝 改动说明

### 1. 模型切换
- 默认从 `mistral` 改为 `qwen2:1.5b`（**超轻量**）
- 可通过环境变量 `OLLAMA_MODEL` 切换：
  ```bash
  # Linux/Mac
  OLLAMA_MODEL=phi2 node scripts/generate-daily-digest.js
  
  # Windows PowerShell
  $env:OLLAMA_MODEL="phi2"; node scripts/generate-daily-digest.js
  ```

### 2. 优化参数
- `temperature`: 0.3 → **0.2**（更确定的回答）
- `top_p`: 新增 **0.8**（减少幻觉）
- `top_k`: 新增 **40**（限制候选词）
- `num_predict`: 新增 **200**（限制输出长度）
- `timeout`: 30s → **20s**（更快超时）

### 3. 简化提示词
- 改为英文指令（轻量模型对英文理解更好）
- 移除复杂的多步骤要求
- 移除中文的例子格式

---

## 🚀 快速测试

### Step 1: 检查 Ollama 模型

**Windows PowerShell:**
```powershell
.\scripts\test-ollama-model.ps1
```

**选择 qwen2:1.5b 进行测试**

如果没有这个模型，会看到提示：
```
Download models with: ollama pull qwen2:1.5b
```

### Step 2: 下载轻量模型（如果需要）

```bash
# 下载 qwen2:1.5b（~900MB）
ollama pull qwen2:1.5b

# 或者试试其他轻量模型
ollama pull phi2          # ~1.4GB
ollama pull neural-chat   # ~4GB
```

### Step 3: 运行脚本测试

```bash
# 使用默认模型（qwen2:1.5b）
node scripts/generate-daily-digest.js

# 或指定其他模型测试
OLLAMA_MODEL=phi2 node scripts/generate-daily-digest.js
```

### Step 4: 观察输出

关注以下指标：
- **执行时间**：应该在 30-60s 内完成（vs Mistral 的 2-3min）
- **CPU 占用**：应该明显降低
- **翻译质量**：检查中文翻译是否合理

---

## 📊 性能对比表

| 模型 | 大小 | 速度 | 质量 | CPU占用 |
|------|------|------|------|--------|
| qwen2:1.5b | 900MB | ⚡⚡⚡ 快 | ⭐⭐⭐ 中 | 🟢 很低 |
| phi2 | 1.4GB | ⚡⚡⚡ 快 | ⭐⭐⭐ 中 | 🟢 很低 |
| neural-chat | 4GB | ⚡⚡ 中 | ⭐⭐⭐⭐ 好 | 🟡 中 |
| mistral | 4GB | ⚡ 慢 | ⭐⭐⭐⭐ 好 | 🔴 高 |

---

## ⚙️ 调优建议

如果翻译质量不理想，可以试：

### 降低速度，提高质量
```bash
# 改用 neural-chat（质量更好，但CPU占用中等）
OLLAMA_MODEL=neural-chat node scripts/generate-daily-digest.js
```

### 提高速度，降低CPU
脚本已经设置了参数，无需再改

### 完全离线 + 无质量损失
改用 **Google Translate API**（方案A）

---

## 🔄 如何切换回 Mistral

如果想回到原来的 Mistral：
```bash
OLLAMA_MODEL=mistral node scripts/generate-daily-digest.js
```

或者修改脚本的默认模型：
```javascript
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';
```

---

## 📝 下一步

完成测试后，反馈：
1. ✅ 执行时间（多少秒完成）
2. ✅ CPU占用变化（体感或任务管理器）
3. ✅ 翻译质量（是否满意）
4. ✅ 推荐方案（继续优化还是改用 Google Translate）
