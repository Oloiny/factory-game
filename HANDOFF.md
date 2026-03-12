# 🎮 大厂风云 - 项目交接文档

**交接日期**: 2026-03-12  
**接收方**: 新 Agent  
**项目状态**: MVP 完成，第二阶段待开发

---

## 📋 项目概述

### 游戏名称
**大厂风云 - 职场抓马生存战**

### 游戏类型
职场模拟经营游戏

### 技术栈
- **引擎**: Phaser 3.60
- **语言**: JavaScript (原生)
- **美术**: Microverse + Modern Interiors + Pixel Agents
- **部署**: Python http.server 端口 8081

### 核心玩法
玩家扮演管理者，通过技能卡牌管理员工情绪、疲劳和项目进度，在死线前完成项目。

---

## 📁 项目结构

```
factory-game/
├── index_mvp.html              # 【入口】游戏主文件
├── HANDOFF.md                  # 【本文档】交接说明
├── AGENT_INSTRUCTIONS.md       # 详细 Agent 协作指南
├── DEPLOY.md                   # 部署文档
├── README.md                   # 项目 README
│
├── assets/
│   ├── modern_interiors/       # 【新增】Modern Interiors 免费包
│   │   └── Modern tiles_Free/
│   │       ├── Characters_free/    # 4 个角色 (Adam/Alex/Amelia/Bob)
│   │       ├── Interiors_free/     # 室内瓦片 (16/32/48px)
│   │       └── Room_Builder_free/  # 房间建造素材
│   │
│   ├── sprites/
│   │   ├── microverse/       # Microverse 办公室素材 (339 个)
│   │   │   ├── Modern_Office_Singles_32x32_{1-339}.png
│   │   │   ├── characters/   # 8 个角色精灵表
│   │   │   ├── portraits/    # 角色头像
│   │   │   └── ui/           # UI 素材
│   │   │
│   │   ├── pixel-agents/     # Pixel Agents 角色 (备选)
│   │   ├── tilesets/         # 地板/瓦片贴图
│   │   └── ui/               # UI 图标/背景
│   │
│   ├── scene_blueprint.png   # 场景蓝图
│   ├── preview_layout.png    # 布局预览
│   └── tiled_assets.zip      # Tiled 资产包 (2MB)
│
├── js/
│   ├── config/
│   │   └── balance.js        # 游戏数值配置
│   ├── entities/
│   │   └── Employee.js       # 员工类（状态机）
│   ├── systems/
│   │   ├── EventSystem.js    # 事件系统
│   │   └── SkillManager.js   # 技能管理
│   ├── assetLoader.js        # 资产加载器
│   └── game.js               # 主游戏逻辑
│
└── tools/
    └── slice_spritesheet.py  # 精灵表切割工具
```

---

## ✅ 已完成功能

### 核心系统
- [x] 员工状态机（情绪/疲劳/忠诚度）
- [x] 自动变化系统（每 tick 更新）
- [x] 项目进度计算
- [x] 胜负判定（死线/进度/离职）

### 玩法系统
- [x] 5 个技能卡牌系统
  - 🫓 画大饼 (⚡10 MP)
  - 🍕 团建聚餐 (💰50)
  - 👔 空降高管 (💰200)
  - 🏖️ 强制休假 (💰20)
  - 📢 紧急会议 (⚡30)
- [x] 10+ 危机事件系统
- [x] 状态图标显示（摸鱼/暴躁/跑路）
- [x] 左侧员工状态面板

### 美术资产
- [x] Microverse 素材加载（339 个物件）
- [x] Modern Interiors 角色（4 个新角色）
- [x] 地板贴图平铺
- [x] 办公桌/椅子/电脑/植物摆放
- [x] 会议室/咖啡厅区域标识

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

## 🚧 待开发功能（第二阶段）

### 高优先级
1. **工位拖拽系统** - 完整实现空间调度玩法
   - [ ] 拖拽员工到任意位置
   - [ ] 吸附到网格
   - [ ] 碰撞检测

2. **相邻加成系统** - 员工之间的互动
   - [ ] 老带新加成（相邻 +10% 效率）
   - [ ] 看不顺眼 debuff（相邻 -15% 情绪）
   - [ ] CP 加成（特定组合 +20%）

3. **区域系统** - 功能性房间
   - [ ] 会议室（开会用）
   - [ ] 咖啡厅（恢复情绪）
   - [ ] 吸烟区（恢复情绪但加疲劳）
   - [ ] 员工进入区域后暂时离开工作

4. **八卦传播系统** - 社交网络
   - [ ] 八卦事件生成
   - [ ] 传播机制（相邻员工）
   - [ ] 影响情绪/忠诚度

### 中优先级
5. **技能目标选择 UI** - 点击员工释放技能
6. **大饼文本库** - 50+ 种大饼文案
7. **员工个性化性格** - 内向/外向/完美主义等
8. **成就系统** - 解锁成就
9. **音效/BGM** - 背景音乐和音效

---

## 🐛 已知问题

### 角色显示问题 ⚠️
**症状**: 角色只显示头顶部分，身体被截断

**可能原因**:
1. Phaser spritesheet 帧尺寸配置错误
2. Microverse 精灵表实际布局与假设不符
3. 角色图像本身的透明度/裁剪问题

**建议调试步骤**:
```javascript
// 在 index_mvp.html 的 createScene 中测试
for (let frame = 0; frame < 10; frame++) {
    const testSprite = scene.add.sprite(100 + frame * 50, 100, 'char_0', frame);
    testSprite.setDisplaySize(64, 64);
    scene.add.text(100 + frame * 50, 80, `帧${frame}`, {
        font: '10px Arial', fill: '#000'
    });
}
```

### 其他问题
- [ ] 浏览器缓存导致初始配置不生效（需强制刷新）
- [ ] 外网访问被阿里云安全组阻挡（需开放 8081 端口）

---

## 🔧 开发调试

### 本地运行
```bash
cd factory-game
python3 -m http.server 8081
# 访问：http://localhost:8081/index_mvp.html
```

### 修改数值
编辑 `js/config/balance.js`

### 添加新事件
编辑 `js/systems/EventSystem.js` 的 `createEventPool()`

### 查看日志
浏览器控制台 (F12)

---

## 📊 数值配置

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

## 🎨 美术资产说明

### Microverse 素材库
- **来源**: https://github.com/KsanaDock/Microverse
- **内容**: 339 个 32x32 办公室物件 + 8 个角色精灵表

### Modern Interiors 免费包（新增）
- **角色**: Adam, Alex, Amelia, Bob (16x16)
- **动作**: 站立/行走/跑步/坐下/打电话
- **室内瓦片**: 多尺寸支持

### 资产 ID 索引
```javascript
// 办公桌: ID 1-50
desk_1 → Modern_Office_Singles_32x32_1.png

// 椅子: ID 51-60
chair_51 → Modern_Office_Singles_32x32_51.png

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

---

## 📦 Git 工作流

### 仓库地址
**https://github.com/Oloiny/factory-game**

### 基本操作
```bash
# 拉取最新代码
git pull origin main

# 修改后提交
git add -A
git commit -m "feat: 添加新功能"
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

---

## 🎯 下一步行动

### 立即任务
1. 【紧急】修复角色显示问题
2. 【高优】实现工位拖拽系统
3. 【中优】配置阿里云安全组开放 8081 端口

### 本周目标
- 完成第二阶段所有高优先级功能
- 达到可发布版本
- 部署到独立 CVM

---

## 📞 联系信息

- **GitHub**: https://github.com/Oloiny/factory-game
- **文档**: AGENT_INSTRUCTIONS.md (详细指南)
- **部署**: DEPLOY.md

---

**最后更新**: 2026-03-12 20:20  
**文档版本**: v1.0  
**Git 提交**: 1a81647
