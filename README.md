# 🎮 长安文豪会 - Pixel RPG

基于 Phaser 3 的像素风 RPG 游戏，集成 BehavioLab 行为经济学模拟系统。

---

## 🚀 快速开始

### 1. 启动游戏

```bash
cd /home/admin/.openclaw/workspace/projects/pixel-rpg
python3 -m http.server 8081
```

然后访问：http://localhost:8081

### 2. 操作说明

- **方向键** - 移动角色（李白）
- **右侧面板** - 使用干预工具、查看状态

---

## 📋 已完成功能

### ✅ 任务 1: 完善基础游戏

- [x] 角色 sprite（李白、杜甫、苏轼）
- [x] 场景装饰（树、桌子、酒坛）
- [x] 碰撞检测
- [x] 相机跟随
- [x] AI 自动移动

### ✅ 任务 2: UI 界面

- [x] 联句长卷面板（显示诗句）
- [x] 干预工具按钮
  - 🍶 送酒 (1 点)
  - 📖 赠书 (2 点)
  - 📜 出题 (1 点)
- [x] 角色状态面板（精力、情绪）
- [x] 游戏信息（轮次、贡献、合作率）

### ✅ 任务 3: Tavily 搜索集成

- [x] 测试脚本创建
- [ ] API Key 配置（待用户完成）
- [ ] 搜索功能测试

---

## 🎯 游戏说明

### 背景
开元盛世，长安城文风鼎盛。李白、杜甫、苏轼三人相聚酒肆，联句作诗。

### 规则
- 10 轮联句接龙
- 每轮每位文豪贡献诗句
- 总贡献>20 句，所有人获得名声

### 干预工具
| 工具 | 消耗 | 效果 |
|------|------|------|
| 🍶 送酒 | 1 点 | 李白超常发挥 |
| 📖 赠书 | 2 点 | 临时提升能力 |
| 📜 出题 | 1 点 | 改变作诗主题 |

---

## 📁 项目结构

```
pixel-rpg/
├── index.html              # 主页面 + UI
├── js/
│   └── game.js             # Phaser 3 游戏逻辑
├── test_tavily.sh          # Tavily 搜索测试
└── README.md               # 本文档
```

---

## 🔧 Tavily 搜索配置

### 获取 API Key

1. 访问 https://app.tavily.com/dashboard
2. 注册/登录
3. 复制 API Key（格式：`tvly-xxxxxxxx`）

### 配置方式

**临时配置**（当前终端会话）：
```bash
export TAVILY_API_KEY='tvly-你的 API Key'
```

**永久配置**：
```bash
echo "export TAVILY_API_KEY='tvly-你的 API Key'" >> ~/.bashrc
source ~/.bashrc
```

### 测试搜索

```bash
cd /home/admin/.openclaw/workspace/projects/pixel-rpg
./test_tavily.sh
```

---

## 🎨 角色设计

### 李白（玩家控制）
- 🎨 棕色衣服
- 🍶 手持酒壶
- ⭐ 风险偏好：0.9（豪放）
- 📊 SVO: 0.4（自利）

### 杜甫
- 🎨 深蓝色衣服
- 📖 手持书卷
- ⭐ 风险偏好：0.3（稳重）
- 📊 SVO: 0.9（亲社会）

### 苏轼
- 🎨 绿色衣服
- 📜 手持竹简
- ⭐ 风险偏好：0.6（中等）
- 📊 SVO: 0.7（中等亲社会）

---

## 📊 下一步计划

### 短期（本周）
- [ ] 集成 Tavily 搜索（待 API Key）
- [ ] 连接 BehavioLab 后端
- [ ] 真实角色 sprite 替换

### 中期
- [ ] 联句接龙游戏逻辑
- [ ] 文豪 AI 行为优化
- [ ] 成就系统

### 长期
- [ ] 多人模式
- [ ] 更多历史人物
- [ ] 扩展场景（长安酒肆、诗会）

---

## 🐛 已知问题

1. 角色 sprite 是简化的色块版本（后续替换为真实像素图）
2. 地图用渐变色代替（后续加载真实地图）
3. Tavily API Key 待配置

---

## 📝 更新日志

### 2026-03-10
- ✅ 创建基础 Phaser 3 游戏
- ✅ 添加 UI 界面（联句长卷、干预工具、状态面板）
- ✅ 实现场景装饰和碰撞检测
- ✅ 创建 Tavily 搜索测试脚本

---

## 🔗 相关项目

- [BehavioLab](../behavioral-agent-lab/) - 行为经济学实验平台
- [Generative Agents](../generative_agents/) - 斯坦福官方项目

---

**Have fun! 🎭**
