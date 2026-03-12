# 🤖 Agent 协作说明文档

**项目名称**: 大厂风云 - 职场抓马生存战  
**创建日期**: 2026-03-10  
**当前版本**: MVP 完成 (第一阶段)  
**最后更新**: 2026-03-12 14:30

---

## 📋 项目背景

### 游戏概述
一款职场模拟经营游戏，玩家扮演管理者，通过技能卡牌管理员工情绪、疲劳和项目进度，在死线前完成项目。

### 技术栈
- **引擎**: Phaser 3.60
- **语言**: JavaScript (原生)
- **美术**: Microverse + Pixel Agents
- **部署**: Python http.server (端口 8081)

---

## 🎮 核心玩法

### 游戏目标
- 在 **死线天数** 内完成 **1000% 项目进度**
- 防止员工 **离职**（情绪<5 持续太久会跑路）

### 核心资源
| 资源 | 说明 | 变化规则 |
|------|------|----------|
| 情绪 (Sanity) | 员工心情 | 工作下降，休息恢复 |
| 疲劳 (Fatigue) | 员工疲劳度 | 工作上升，睡眠恢复 |
| 进度 (Progress) | 项目完成度 | 员工工作增加 |
| 管理点 (MP) | 技能消耗 | 每天 +10 |
| 预算 (Budget) | 技能消耗 | 不会自动恢复 |

### 员工状态机
```
正常 → 摸鱼 (情绪<30) → 暴躁 (情绪<15) → 跑路 (情绪<5)
```

### 技能卡牌 (5 张)
| 技能 | 消耗 | 效果 |
|------|------|------|
| 🫓 画大饼 | ⚡10 MP | 单体鸡血 3 天，成功率基于忠诚度 |
| 🍕 团建聚餐 | 💰50 | AOE 清负面，消耗 1 天 |
| 👔 空降高管 | 💰200 | 卷王入职，周围不公平 debuff |
| 🏖️ 强制休假 | 💰20 | 单体恢复，消耗 1 天 |
| 📢 紧急会议 | ⚡30 | 全员进度 +10，情绪 -15 |

---

## 📁 文件结构

```
pixel-rpg/
├── index_mvp.html              # 【入口】游戏主文件
├── AGENT_INSTRUCTIONS.md       # 【本文档】Agent 协作说明
├── DEPLOY.md                   # 部署文档
├── DEPLOY_FOR_AGENTS.md        # Agent 专用部署指南
├── PROJECT_STATUS.md           # 项目状态详情
├── README.md                   # 项目 README
├── README_MVP.md               # MVP 完成说明
│
├── assets/
│   ├── characters/             # 角色立绘 (28 个角色 PNG + atlas)
│   ├── maps/                   # 地图数据 (the_ville 系列)
│   └── sprites/
│       ├── microverse/         # 【主要】Microverse 办公室素材
│       │   ├── Modern_Office_Singles_32x32_{1-339}.png  # 339 个物件
│       │   ├── characters/     # 8 个角色精灵表 (1792x1280)
│       │   │   ├── Alicex32.png
│       │   │   ├── Gracex32.png
│       │   │   ├── Jackx32.png
│       │   │   ├── Joex32.png
│       │   │   ├── Leax32.png
│       │   │   ├── Monicax32.png
│       │   │   ├── Stephenx32.png
│       │   │   └── Tomx32.png
│       │   │   └── char_{0-5}.png → 符号链接到上述文件
│       │   ├── portraits/      # 8 个角色头像 (32x32)
│       │   └── ui/             # UI 素材
│       │
│       └── pixel-agents/       # 【备用】Pixel Agents 角色
│           ├── char_{0-5}.png  # 6 个角色 (112x96)
│           └── walls.png
│
├── js/
│   ├── config/
│   │   └── balance.js          # 游戏数值配置
│   ├── entities/
│   │   └── Employee.js         # 员工类（状态机/属性）
│   ├── systems/
│   │   ├── EventSystem.js      # 事件系统（10+ 危机事件）
│   │   └── SkillManager.js     # 技能管理系统
│   ├── assetLoader.js          # 资产加载器
│   └── game.js                 # 主游戏逻辑
│
└── tools/
    └── slice_spritesheet.py    # 精灵表切割工具
```

---

## 🎨 美术资产说明

### Microverse 素材库（主要使用）
- **来源**: https://github.com/KsanaDock/Microverse
- **授权**: MIT (代码) / 需确认 LimeZu 素材授权
- **内容**:
  - 339 个 32x32 办公室物件（桌子/椅子/柜子/植物/电子设备）
  - 8 个角色精灵表（1792x1280, 56 列 x40 行，每帧 32x32）
  - 8 个角色头像（32x32）
  - UI 素材（GUI/对话气泡/现代 UI 风格）

### 资产 ID 索引
```javascript
// 办公桌: ID 1-50
desk_1 → Modern_Office_Singles_32x32_1.png
// ...
desk_10 → Modern_Office_Singles_32x32_10.png

// 椅子: ID 51-60
chair_51 → Modern_Office_Singles_32x32_51.png
// ...

// 文件柜: ID 101-150
cabinet_1 → Modern_Office_Singles_32x32_101.png

// 电子设备: ID 151-200
computer_1 → Modern_Office_Singles_32x32_151.png

// 植物: ID 201-250
plant_1 → Modern_Office_Singles_32x32_201.png
plant_2 → Modern_Office_Singles_32x32_202.png

// 地板: ID 280-289
floor → Modern_Office_Singles_32x32_280.png
```

### 角色精灵表布局 (Microverse)
```
尺寸：1792x1280 (56 列 x 40 行)
帧尺寸：32x32

行布局（假设）:
- 行 0-3: 向下走动画 (帧 0-223)
- 行 4-7: 向上走动画 (帧 224-447)
- 行 8-11: 向左走动画 (帧 448-671)
- 行 12-15: 向右走动画 (帧 672-895)
- 行 16+: 其他动作/状态

⚠️ 注意：实际布局需要检查精灵表确认！
```

---

## ✅ 已完成功能 (第一阶段 MVP)

### 核心系统
- [x] 员工状态机（情绪/疲劳/忠诚度）
- [x] 自动变化系统（每 tick 更新）
- [x] 项目进度计算
- [x] 胜负判定（死线/进度/离职）

### 玩法系统
- [x] 5 个技能卡牌系统
- [x] 10+ 危机事件系统
- [x] 状态图标显示（摸鱼/暴躁/跑路）
- [x] 左侧员工状态面板

### 美术资产
- [x] Microverse 素材加载（339 个物件）
- [x] 角色精灵表加载（8 个角色）
- [x] 地板贴图平铺（ID 280）
- [x] 办公桌/椅子/电脑/植物摆放
- [x] 会议室/咖啡厅区域

### UI 系统
- [x] 顶部信息栏（天数/进度条/MP/预算）
- [x] 底部技能栏（5 张卡牌）
- [x] 事件弹窗系统
- [x] 员工状态面板（可滚动）

### 交互
- [x] 键盘控制小明移动（方向键）
- [x] 角色拖拽系统（基础）
- [x] 技能目标选择（部分）

---

## 🚧 待开发功能 (第二阶段)

### 高优先级
1. **工位拖拽系统** - 完整实现空间调度玩法
   - 拖拽员工到任意位置
   - 吸附到网格
   - 碰撞检测

2. **相邻加成系统** - 员工之间的互动
   - 老带新加成（相邻 +10% 效率）
   - 看不顺眼 debuff（相邻 -15% 情绪）
   - CP 加成（特定组合 +20%）

3. **区域系统** - 功能性房间
   - 会议室（开会用）
   - 咖啡厅（恢复情绪）
   - 吸烟区（恢复情绪但加疲劳）
   - 员工进入区域后暂时离开工作

4. **八卦传播系统** - 社交网络
   - 八卦事件生成
   - 传播机制（相邻员工）
   - 影响情绪/忠诚度

### 中优先级
5. **技能目标选择 UI** - 点击员工释放技能
6. **大饼文本库** - 50+ 种大饼文案
7. **员工个性化性格** - 内向/外向/完美主义等
8. **成就系统** - 解锁成就
9. **音效/BGM** - 背景音乐和音效

---

## 🐛 已知问题

### 角色显示问题 ⚠️ 【待修复】
**症状**: 角色只显示头顶部分，身体被截断

**可能原因**:
1. Phaser spritesheet 帧尺寸配置错误
2. Microverse 精灵表实际布局与假设不符
3. 角色图像本身的透明度/裁剪问题

**已尝试方案**:
- 使用完整图像（非 spritesheet）- 仍显示不全
- 调整帧尺寸 (16x16, 16x24, 16x32, 32x32, 32x48) - 无效
- 切换不同帧 (0, 1, 2, 3, 7, 14, 16, 21, 28, 35) - 都只显示头顶
- 调整显示尺寸 (32x32 到 96x96) - 只是缩放，不解决裁剪

**建议调试步骤**:
```javascript
// 1. 在 preload 中打印精灵表信息
this.load.on('filecomplete', (key, type, data) => {
    console.log(`Loaded: ${key}`, data);
});

// 2. 使用 Phaser 的 Texture Editor 检查精灵表
// 或使用 generateTexture 导出单帧查看

// 3. 尝试直接渲染完整图像（不切帧）
const sprite = this.add.image(x, y, 'char_0');
sprite.setDisplaySize(100, 100);

// 4. 检查 Microverse 角色文件的实际内容
// file Alicex32.png → 应该是 1792x1280
```

### 其他问题
- [ ] 浏览器缓存导致初始配置不生效（需强制刷新）
- [ ] 外网访问被阿里云安全组阻挡（需开放 8081 端口）

---

## 🚀 部署说明

### 本地运行
```bash
cd pixel-rpg
python3 -m http.server 8081
# 访问：http://localhost:8081/index_mvp.html
```

### 服务器部署
```bash
# 1. 上传文件
scp -r pixel-rpg/ user@server:/opt/

# 2. 启动服务
cd /opt/pixel-rpg
nohup python3 -m http.server 8081 > /var/log/pixel-rpg.log 2>&1 &

# 3. 或使用 systemd（见 DEPLOY.md）
sudo systemctl enable pixel-rpg
sudo systemctl start pixel-rpg
```

### 外网访问
- **服务器 IP**: 120.24.251.173 (阿里云)
- **端口**: 8081
- **安全组**: 需开放 8081/TCP 入站

---

##  数值配置

详见 `js/config/balance.js`:

```javascript
GameConfig = {
    deadline: 30,           // 死线天数
    projectTarget: 1000,    // 项目总进度目标
    
    // 员工基础属性
    sanity: { max: 100, workDrain: 15, restRecover: 20 },
    fatigue: { max: 100, workIncrease: 10, sleepRecover: 30 },
    loyalty: { max: 100, startRange: [40, 80] },
    
    // 状态阈值
    thresholds: {
        stocking: 30,   // 情绪<30 摸鱼
        angry: 15,      // 情绪<15 暴躁
        resigning: 5    // 情绪<5 跑路
    },
    
    // 技能消耗
    skills: {
        bigPie: { mp: 10 },
        teamBuilding: { money: 50 },
        newManager: { money: 200 },
        forcedLeave: { money: 20 },
        emergencyMeeting: { mp: 30 }
    }
}
```

---

## 🔧 开发调试

### 修改数值
编辑 `js/config/balance.js`

### 添加新事件
编辑 `js/systems/EventSystem.js` 的 `createEventPool()`

### 添加新技能
编辑 `js/systems/SkillManager.js` 和 HTML 中的技能栏

### 查看日志
浏览器控制台 (F12) 或服务器日志：
```bash
journalctl -u pixel-rpg -f
```

### 调试角色渲染
在 `index_mvp.html` 的 `createScene` 函数中添加：
```javascript
// 测试不同帧
for (let frame = 0; frame < 10; frame++) {
    const testSprite = scene.add.sprite(100 + frame * 50, 100, 'char_0', frame);
    testSprite.setDisplaySize(64, 64);
    scene.add.text(100 + frame * 50, 80, `帧${frame}`, {
        font: '10px Arial', fill: '#000'
    });
}
```

---

## 📝 协作指南

### Git 工作流
```bash
# 拉取最新代码
git pull origin main

# 修改后提交
git add -A
git commit -m "修复：角色显示问题 - 使用正确帧尺寸"
git push origin main
```

### 提交信息规范
```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构（非新功能/非 bug 修复）
test: 测试相关
chore: 构建/工具/配置
```

### 任务分配建议
- **Agent A**: 核心玩法系统（状态机/数值/事件）
- **Agent B**: 美术渲染（角色/动画/UI）
- **双方**: 定期 git pull 同步，避免冲突

---

## 📞 联系信息

- **GitHub**: https://github.com/Oloiny/factory-game
- **当前负责人**: 两个 Agent 协作
- **人类监督**: 小安 (东八区)

---

## 🎯 下一步行动

### 立即任务
1. 【紧急】修复角色显示问题
2. 【高优】配置阿里云安全组开放 8081 端口
3. 【中优】实现工位拖拽系统

### 本周目标
- 完成第二阶段所有高优先级功能
- 达到可发布版本
- 部署到独立 CVM

---

**最后更新**: 2026-03-12 14:30  
**文档版本**: v1.0  
**Git 提交**: 4190b7c
