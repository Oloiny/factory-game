# 🎮 大厂风云 - 项目完整进展报告

**项目名称**: 大厂风云 - 职场抓马生存战  
**项目类型**: 职场模拟经营游戏  
**技术栈**: Phaser 3.60 + HTML5 + JavaScript  
**状态**: MVP 完成 (v1.0)  
**创建日期**: 2026-03-05  
**MVP 完成**: 2026-03-12  

---

## 📋 目录

1. [项目概述](#项目概述)
2. [开发时间线](#开发时间线)
3. [已完成功能](#已完成功能)
4. [技术架构](#技术架构)
5. [美术资产](#美术资产)
6. [游戏玩法](#游戏玩法)
7. [待开发功能](#待开发功能)
8. [部署说明](#部署说明)
9. [开发笔记](#开发笔记)

---

## 项目概述

### 游戏简介

玩家扮演大厂项目经理，需要在 30 天内完成项目，同时管理员工的情绪、疲劳和进度。核心玩法是"压榨 vs 安抚"的平衡博弈。

### 核心机制

| 资源 | 说明 | 阈值 |
|------|------|------|
| **情绪 (Sanity)** | 员工心情，工作会下降 | <30 摸鱼，<15 暴躁，<5 跑路 |
| **疲劳 (Fatigue)** | 工作会上升，休息恢复 | - |
| **进度 (Progress)** | 项目完成度 | 目标 1000% |
| **管理点 (MP)** | 技能消耗 | 每天 +10 |
| **预算 (Budget)** | 技能消耗 | 不会自动恢复 |

### 游戏目标

- ✅ **胜利**: 30 天内完成 1000% 进度
- ❌ **失败**: 死线到了但进度 <80%
- ❌ **失败**: 所有人都离职

---

## 开发时间线

### 2026-03-05: 项目立项
- 确定游戏类型：职场模拟经营
- 确定技术栈：Phaser 3 + HTML5
- 创建项目目录结构

### 2026-03-08 ~ 03-10: 核心系统开发
- ✅ Employee.js - 员工类（情绪/疲劳/忠诚/进度）
- ✅ 状态机系统 - 正常/摸鱼/暴躁/跑路
- ✅ SkillManager.js - 技能卡牌系统
- ✅ EventSystem.js - 危机事件系统
- ✅ game.js - 主游戏循环

### 2026-03-11: 美术资产整合
- ✅ 下载 Microverse 素材 (339 个办公室物件)
- ✅ 下载 Pixel Agents 素材 (6 个角色)
- ✅ 创建 assetLoader.js - 素材加载器
- ✅ 创建素材索引文件

### 2026-03-11: MVP 开发（第一阶段）
- ✅ 修复角色位置（4 个员工 2x2 布局）
- ✅ 真实素材显示（桌子/椅子/植物/文件柜）
- ✅ 状态图标系统（摸鱼🐟/暴躁🔥/跑路🧳）
- ✅ 键盘控制移动（简化版滑行）

### 2026-03-11 ~ 03-12: 深度玩法（第二阶段）
- ✅ 工位拖拽系统 - 鼠标拖动调整位置
- ✅ 相邻加成系统 - 老带新/看不顺眼
- ✅ 区域系统 - 会议室/咖啡厅功能

### 2026-03-12: MVP 完成
- ✅ 打包 v1.0 (pixel-rpg-v1.0.tar.gz, 1.5MB)
- ✅ 编写部署文档 (DEPLOY.md)
- ✅ 编写本报告

---

## 已完成功能

### 核心系统 ✅

| 系统 | 文件 | 说明 |
|------|------|------|
| 员工类 | `js/entities/Employee.js` | 情绪/疲劳/忠诚/进度，状态机 |
| 技能系统 | `js/systems/SkillManager.js` | 5 个技能卡牌 |
| 事件系统 | `js/systems/EventSystem.js` | 10+ 危机事件 |
| 主游戏 | `js/game.js` | 游戏循环，相邻加成，区域效果 |
| 数值配置 | `js/config/balance.js` | 所有游戏参数 |

### 技能卡牌 ✅

| 技能 | 消耗 | 效果 | 风险 |
|------|------|------|------|
| 🫓 画大饼 | ⚡10 MP | 单体鸡血 3 天，产出×1.5 | 识破→忠诚 -20 |
| 🍕 团建聚餐 | 💰50 | AOE 清负面，情绪 +30 | 消耗 1 天时间 |
| 👔 空降高管 | 💰200 | 卷王入职，进度×3 | 周围不公平 debuff |
| 🏖️ 强制休假 | 💰20 | 单体恢复，情绪 +20 | 消耗 1 天时间 |
| 📢 紧急会议 | ⚡30 | 全员进度 +10 | 情绪 -15 |

### 危机事件 ✅

| 事件类型 | 数量 | 示例 |
|---------|------|------|
| 情绪崩溃 | 2 | 办公室崩溃大哭、砸键盘 |
| 挖角事件 | 1 | 竞品高薪挖角主策划 |
| 吵架事件 | 1 | 会议室吵架 |
| 八卦事件 | 2 | 裁员谣言、奖金传闻 |
| 突破事件 | 1 | Bug 修复（正面） |

### 空间系统 ✅

| 功能 | 说明 | 效果 |
|------|------|------|
| **工位拖拽** | 鼠标拖动员工 | 自由调整布局 |
| **相邻加成** | 距离<150 像素触发 | programmer 相邻效率 +，PM/designer 相邻情绪 - |
| **会议室** | 上方中央区域 | 进度 +0.2，情绪 -0.3 |
| **咖啡厅** | 右侧中央区域 | 情绪 +0.5，疲劳 -0.3 |

### 美术资产 ✅

| 类别 | 数量 | 来源 |
|------|------|------|
| 办公桌 | 10 种 | Microverse |
| 椅子 | 10 种 | Microverse |
| 角色 | 6 个 | Pixel Agents |
| 植物 | 2 种 | Microverse |
| 文件柜 | 1 种 | Microverse |
| 电脑 | 1 种 | Microverse |
| **总计** | **~340 文件** | - |

---

## 技术架构

### 文件结构

```
pixel-rpg/
├── index_mvp.html          # 游戏入口（主文件）
├── DEPLOY.md               # 部署文档
├── README_MVP.md           # 游戏说明
├── js/
│   ├── config/
│   │   └── balance.js      # 数值配置（可调参）
│   ├── entities/
│   │   └── Employee.js     # 员工类（状态机）
│   ├── systems/
│   │   ├── SkillManager.js # 技能系统
│   │   └── EventSystem.js  # 事件系统
│   └── game.js             # 主游戏逻辑
├── assets/
│   └── sprites/
│       ├── microverse/     # Microverse 素材
│       └── pixel-agents/   # Pixel Agents 素材
└── tools/
    └── slice_spritesheet.py # 精灵表裁剪工具（未使用）
```

### 核心类图

```
MainGame
├── employees: Employee[]
├── skillManager: SkillManager
├── eventSystem: EventSystem
└── tick() → 更新所有系统

Employee
├── sanity: number (0-100)
├── fatigue: number (0-100)
├── loyalty: number (0-100)
├── progress: number
├── state: 'normal' | 'stocking' | 'angry' | 'resigning'
├── tick() → 更新属性
└── updateState() → 检查状态变化

SkillManager
├── managementPoints: number
├── budget: number
└── useSkill(skillId, target) → 执行技能

EventSystem
├── day: number
├── eventPool: Object
└── checkDailyEvents() → 触发事件
```

### 游戏循环

```
每分钟 tick:
1. 计算相邻加成 (calculateAdjacencyBonus)
2. 计算区域效果 (updateZoneEffects)
3. 更新所有员工 (emp.tick)
4. 计算项目进度
5. 检查胜负条件
6. 每天检查事件
```

---

## 游戏玩法

### 操作说明

| 操作 | 方式 | 说明 |
|------|------|------|
| 移动员工 | 鼠标拖拽 | 点击角色拖动到新位置 |
| 使用技能 | 点击卡牌 | 右下角技能栏 |
| 处理事件 | 点击选项 | 弹窗时选择处理方式 |

### 策略要点

1. **情绪管理**
   - 保持员工情绪 >30（避免摸鱼）
   - 及时使用团建/休假恢复情绪
   - 咖啡厅是情绪恢复区

2. **空间布局**
   - programmer 相邻 → 效率加成
   - PM 和 designer 分开 → 避免情绪下降
   - 让疲劳员工去咖啡厅

3. **技能使用时机**
   - 画大饼：忠诚度高时使用（成功率高）
   - 团建：多人情绪低时使用（AOE）
   - 空降高管：进度落后时使用（但有副作用）

4. **事件处理**
   - 正面事件（Bug 修复）：选择"公开表扬"（加情绪忠诚）
   - 负面事件：根据资源选择（MP 或预算）

---

## 待开发功能

### 高优先级（第三阶段）

| 功能 | 工作量 | 说明 |
|------|--------|------|
| 八卦传播系统 | 3h | 员工在区域间传播信息 |
| 记忆流系统 | 3h | 员工记住发生过的事 |
| 技能目标选择 UI | 1h | 点击技能后选择目标 |
| 大饼文本库 | 2h | 50+ 预制文本 |

### 中优先级

| 功能 | 工作量 | 说明 |
|------|--------|------|
| 员工个性化性格 | 2h | 不同性格影响变化率 |
| 进度可视化 | 1h | 各模块进度细化 |
| 多结局系统 | 2h | 不同表现触发不同结局 |
| 成就系统 | 2h | 解锁成就和统计 |

### 低优先级（长期）

| 功能 | 工作量 | 说明 |
|------|--------|------|
| 行走动画 | 3h | 4 方向行走动画 |
| 角色表情 | 2h | 开心/生气/疲惫表情 |
| 存档/读档 | 2h | localStorage 保存 |
| 大模型集成 | 3h | AI 生成对话和事件 |
| 多人模式 | 8h | 玩家竞争管理不同团队 |

---

## 部署说明

### 快速部署

```bash
# 1. 上传
scp pixel-rpg-v1.0.tar.gz user@server:/opt/

# 2. 解压
cd /opt && tar -xzf pixel-rpg-v1.0.tar.gz

# 3. 启动
cd pixel-rpg && python3 -m http.server 8081
```

### 正式部署（systemd）

```bash
# 创建服务
sudo tee /etc/systemd/system/pixel-rpg.service > /dev/null <<'EOF'
[Unit]
Description=大厂风云游戏
After=network.target

[Service]
Type=simple
User=admin
WorkingDirectory=/opt/pixel-rpg
ExecStart=/usr/bin/python3 -m http.server 8081
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 启动
sudo systemctl daemon-reload
sudo systemctl enable pixel-rpg
sudo systemctl start pixel-rpg
```

### 访问地址

```
http://server-ip:8081/index_mvp.html
```

**详细部署文档**: 见 `DEPLOY.md`

---

## 开发笔记

### 遇到的问题与解决

#### 问题 1: 角色精灵表布局不明
- **问题**: Pixel Agents 的角色是 112x96 精灵表，不确定帧布局
- **尝试**: 假设 16x16 每帧，创建动画但显示错误
- **解决**: 简化为静态角色 + 滑行移动（方案 A）
- **后续**: 可分析实际布局后做完整动画

#### 问题 2: 状态图标不显示
- **问题**: 图标功能正常但看不到
- **原因**: 员工情绪都在 60-80（正常范围），不满足显示条件
- **解决**: 功能正常，无需修复

#### 问题 3: 浏览器缓存
- **问题**: 修改代码后刷新不生效
- **解决**: 添加时间戳参数 `?t=12345` 强制刷新

### 代码优化建议

1. **性能优化**
   - 当前每分钟更新所有状态，可优化为按需更新
   - 状态图标可复用，避免频繁创建/销毁

2. **代码结构**
   - 可提取为独立模块（ES6 modules）
   - 添加 TypeScript 类型定义

3. **可配置性**
   - 所有数值已在 `balance.js` 中，方便调整
   - 可添加配置文件热重载

### 测试建议

1. **功能测试**
   - 拖拽所有员工，验证位置保存
   - 测试所有技能卡牌
   - 触发所有类型事件

2. **平衡测试**
   - 调整 `balance.js` 数值
   - 测试不同难度（简单/正常/困难）
   - 记录通关时间和策略

3. **兼容性测试**
   - Chrome / Firefox / Safari
   - 桌面端 / 移动端
   - 不同分辨率

---

## 附录

### 相关文件

| 文件 | 用途 |
|------|------|
| `index_mvp.html` | 游戏主文件 |
| `DEPLOY.md` | 部署文档 |
| `README_MVP.md` | 游戏说明 |
| `js/config/balance.js` | 数值配置 |
| `memory/2026-03-11.md` | 开发日志 |

### 外部资源

| 资源 | 链接 |
|------|------|
| Phaser 3 文档 | https://photonstorm.github.io/phaser3-docs/ |
| Microverse | https://github.com/KsanaDock/Microverse |
| Pixel Agents | https://github.com/pablodelucca/pixel-agents |
| LimeZu 素材 | https://limezu.itch.io/ |

### 联系方式

- **项目位置**: `/opt/pixel-rpg/`
- **日志位置**: `/var/log/pixel-rpg.log`
- **打包文件**: `pixel-rpg-v1.0.tar.gz` (1.5MB)

---

**报告完成日期**: 2026-03-12  
**最后更新**: 2026-03-12  
**版本**: v1.0  
**状态**: MVP 完成，可部署
