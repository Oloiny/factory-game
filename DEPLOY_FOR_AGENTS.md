# 👋 给其他 Agent 的部署说明

**你好！** 如果你要帮我把"大厂风云"游戏部署到新服务器，看这份文档就够了。

我是你的同事 Agent，这个游戏是我花几天时间开发完成的。现在要迁移到新的 CVM 服务器上，可能需要你帮忙执行部署。

---

## 🎮 这是什么项目？

简单说，这是一个**职场模拟经营小游戏**：

- 玩家扮演项目经理
- 要管理员工的情绪、疲劳和工作进度
- 可以用技能卡牌（画大饼、团建、空降高管等）
- 可以拖拽员工调整工位布局
- 目标是 30 天内完成项目

技术很简单：
- **纯静态网页** - HTML + JavaScript
- **Phaser 3** - 游戏引擎（从 CDN 加载）
- **Python HTTP 服务器** - 只需要 `python3 -m http.server 8081` 就能跑

---

## 📦 文件在哪里？

游戏已经打包好了：

```
/home/admin/.openclaw/workspace/projects/pixel-rpg-v1.0-release.tar.gz
```

大小约 1.5MB，里面包含：
- 游戏主文件（index_mvp.html）
- 所有 JavaScript 代码
- 美术素材（办公桌、椅子、角色等，约 340 个文件）
- 部署文档（DEPLOY.md）
- 项目说明（PROJECT_STATUS.md）

---

## 🚀 怎么部署？

### 最简单的方式（3 步）

**1. 上传文件到新服务器**

假设新服务器 IP 是 `new-cvm-ip`，用户名是 `admin`：

```bash
scp /home/admin/.openclaw/workspace/projects/pixel-rpg-v1.0-release.tar.gz admin@new-cvm-ip:/opt/
```

**2. SSH 登录解压**

```bash
ssh admin@new-cvm-ip
cd /opt
tar -xzf pixel-rpg-v1.0-release.tar.gz
```

**3. 启动服务**

```bash
cd /opt/pixel-rpg
nohup python3 -m http.server 8081 > /var/log/pixel-rpg.log 2>&1 &
```

**完成！** 游戏就可以访问了：

```
http://new-cvm-ip:8081/index_mvp.html
```

---

## 🔧 如果要正式部署（systemd 服务）

上面那种方式重启后服务会挂。如果要长期运行，建议用 systemd：

**创建服务文件**：

```bash
sudo tee /etc/systemd/system/pixel-rpg.service > /dev/null <<'EOF'
[Unit]
Description=大厂风云游戏服务器
After=network.target

[Service]
Type=simple
User=admin
WorkingDirectory=/opt/pixel-rpg
ExecStart=/usr/bin/python3 -m http.server 8081
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

**启动服务**：

```bash
sudo systemctl daemon-reload
sudo systemctl enable pixel-rpg
sudo systemctl start pixel-rpg
```

**验证**：

```bash
sudo systemctl status pixel-rpg
curl http://localhost:8081/index_mvp.html | head -5
```

---

## 🔒 网络配置提醒

### 阿里云安全组

新服务器如果是阿里云的，记得在控制台开放端口：

1. 登录阿里云控制台
2. 进入 ECS → 安全组
3. 添加入站规则：
   - 端口：`8081/TCP`
   - 授权对象：`0.0.0.0/0`（或指定 IP）

### 防火墙

如果服务器有防火墙：

```bash
# Ubuntu (ufw)
sudo ufw allow 8081/tcp

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --reload
```

---

## ✅ 验证部署成功

**方法 1：命令行**

```bash
curl http://localhost:8081/index_mvp.html | head -5
```

应该能看到 HTML 内容。

**方法 2：浏览器访问**

```
http://new-cvm-ip:8081/index_mvp.html
```

应该能看到游戏界面，有 4 个像素风角色，左侧有状态面板，右下角有技能卡牌。

---

## 🐛 常见问题

### 问题 1: 端口被占用

```bash
# 检查谁在用 8081
sudo lsof -i :8081

# 杀掉进程
sudo kill <PID>

# 或者换个端口
python3 -m http.server 8082
```

### 问题 2: 服务启动失败

```bash
# 查看日志
sudo journalctl -u pixel-rpg -n 50

# 手动测试
cd /opt/pixel-rpg
python3 -m http.server 8081
```

### 问题 3: 页面访问不了

检查清单：
- [ ] 服务在运行吗？`systemctl status pixel-rpg`
- [ ] 端口开放了吗？`netstat -tlnp | grep 8081`
- [ ] 阿里云安全组配置了吗？
- [ ] 防火墙放行了吗？

---

## 📚 更多文档

如果遇到问题，或者想了解游戏细节：

1. **详细部署文档**: `/opt/pixel-rpg/DEPLOY.md`
   - 包含完整的部署步骤、网络配置、HTTPS 配置、故障排查等

2. **项目完整说明**: `/opt/pixel-rpg/PROJECT_STATUS.md`
   - 包含开发历史、功能列表、技术架构、待开发功能等

3. **游戏说明**: `/opt/pixel-rpg/README_MVP.md`
   - 包含游戏玩法、操作说明、技能介绍等

---

## 🎯 后续开发

如果部署完成后还要继续开发：

**第三阶段待开发功能**：
- 八卦传播系统（员工在区域间传播信息）
- 记忆流系统（员工记住发生过的事）
- 技能目标选择 UI（点击技能后选目标员工）
- 行走动画（目前是静态角色）

代码都在 `/opt/pixel-rpg/js/` 目录下，可以直接修改。

修改后不需要重启，刷新浏览器就生效（可能需要强制刷新清缓存）。

---

## 📞 联系我

如果部署过程中遇到任何问题，或者不确定该怎么做，随时问我就好！

我是你的同事 Agent，这个项目是我开发的，有任何问题我都能帮你解答。

---

**祝部署顺利！** 🎉

---

*最后更新：2026-03-12*  
*游戏版本：v1.0 MVP*  
*打包文件：pixel-rpg-v1.0-release.tar.gz (1.5MB)*
