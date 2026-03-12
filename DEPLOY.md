# 📦 大厂风云 - 部署文档

**版本**: v1.0  
**创建时间**: 2026-03-12  
**适用环境**: Linux (Ubuntu/CentOS)

---

## 📋 前置要求

### 服务器配置
- **CPU**: 1 核 +
- **内存**: 512MB+
- **磁盘**: 100MB+
- **系统**: Ubuntu 20.04+ / CentOS 7+
- **网络**: 开放端口 8081（或自定义）

### 软件依赖
- Python 3.6+
- Node.js（可选，仅用于开发）

---

## 🚀 快速部署

### 1. 上传游戏文件

```bash
# 上传压缩包到服务器
scp pixel-rpg-v1.0.tar.gz user@your-server-ip:/opt/

# 或 rsync
rsync -avz pixel-rpg-v1.0.tar.gz user@your-server-ip:/opt/
```

### 2. 解压文件

```bash
cd /opt
tar -xzf pixel-rpg-v1.0.tar.gz
cd pixel-rpg
```

### 3. 启动服务（临时）

```bash
# 前台运行（测试用）
python3 -m http.server 8081

# 后台运行
nohup python3 -m http.server 8081 > /var/log/pixel-rpg.log 2>&1 &

# 验证
curl http://localhost:8081/index_mvp.html | head -5
```

---

## 🔧 正式部署（systemd 服务）

### 1. 创建 systemd 服务文件

```bash
sudo tee /etc/systemd/system/pixel-rpg.service > /dev/null <<'EOF'
[Unit]
Description=大厂风云 - 职场抓马生存战
After=network.target

[Service]
Type=simple
User=admin
WorkingDirectory=/opt/pixel-rpg
ExecStart=/usr/bin/python3 -m http.server 8081
Restart=always
RestartSec=5
StandardOutput=append:/var/log/pixel-rpg.log
StandardError=append:/var/log/pixel-rpg.log

# 安全限制
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF
```

### 2. 启动服务

```bash
# 重载 systemd 配置
sudo systemctl daemon-reload

# 启用开机自启
sudo systemctl enable pixel-rpg

# 启动服务
sudo systemctl start pixel-rpg

# 查看状态
sudo systemctl status pixel-rpg
```

### 3. 常用命令

```bash
# 重启服务
sudo systemctl restart pixel-rpg

# 停止服务
sudo systemctl stop pixel-rpg

# 查看日志
sudo journalctl -u pixel-rpg -f

# 查看最近 100 行日志
sudo journalctl -u pixel-rpg -n 100
```

---

## 🌐 网络配置

### 方案 A: 直接访问 IP

```
http://your-server-ip:8081/index_mvp.html
```

### 方案 B: 配置域名

1. **DNS 解析**: 将域名指向服务器 IP
   ```
   game.yourcompany.com → your-server-ip
   ```

2. **Nginx 反向代理**（推荐）:
   ```nginx
   server {
       listen 80;
       server_name game.yourcompany.com;
       
       location / {
           proxy_pass http://localhost:8081;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **访问**:
   ```
   http://game.yourcompany.com/index_mvp.html
   ```

### 方案 C: HTTPS（可选）

使用 Let's Encrypt 免费证书：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx  # Ubuntu
sudo yum install certbot python3-certbot-nginx  # CentOS

# 获取证书
sudo certbot --nginx -d game.yourcompany.com

# 自动续期（已自动添加 cron）
sudo certbot renew --dry-run
```

---

## 🔒 安全配置

### 1. 防火墙配置

```bash
# Ubuntu (ufw)
sudo ufw allow 8081/tcp
sudo ufw reload

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --reload

# 阿里云安全组
# 控制台 → ECS → 安全组 → 添加入站规则
# 端口：8081/TCP，授权对象：0.0.0.0/0 或指定 IP
```

### 2. 限制访问 IP（可选）

如果只允许公司内网访问：

```bash
# ufw 限制
sudo ufw allow from 192.168.1.0/24 to any port 8081

# 或 nginx 限制
location / {
    allow 192.168.1.0/24;
    deny all;
    proxy_pass http://localhost:8081;
}
```

---

## 📊 监控与维护

### 1. 健康检查

```bash
# 检查服务状态
systemctl is-active pixel-rpg

# 检查端口
netstat -tlnp | grep 8081

# 检查页面
curl -I http://localhost:8081/index_mvp.html
```

### 2. 日志轮转

创建日志轮转配置：

```bash
sudo tee /etc/logrotate.d/pixel-rpg > /dev/null <<'EOF'
/var/log/pixel-rpg.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 admin admin
}
EOF
```

### 3. 备份

```bash
# 备份游戏文件
tar -czf /backup/pixel-rpg-backup-$(date +%Y%m%d).tar.gz /opt/pixel-rpg/

# 备份到远程
rsync -avz /opt/pixel-rpg/ backup-server:/backup/pixel-rpg/
```

---

## 🐛 故障排查

### 问题 1: 服务无法启动

```bash
# 检查端口占用
sudo lsof -i :8081

# 检查日志
sudo journalctl -u pixel-rpg -n 50

# 手动测试
cd /opt/pixel-rpg
python3 -m http.server 8081
```

### 问题 2: 页面无法访问

```bash
# 检查防火墙
sudo ufw status
sudo firewall-cmd --list-all

# 检查阿里云安全组
# 控制台 → ECS → 安全组 → 确认 8081 端口已开放

# 本地测试
curl http://localhost:8081/index_mvp.html
```

### 问题 3: 静态资源 404

```bash
# 检查文件权限
ls -la /opt/pixel-rpg/
chmod -R 755 /opt/pixel-rpg/

# 检查文件是否存在
ls /opt/pixel-rpg/index_mvp.html
```

---

## 📦 更新部署

### 更新游戏文件

```bash
# 1. 停止服务
sudo systemctl stop pixel-rpg

# 2. 备份旧版本
cd /opt
mv pixel-rpg pixel-rpg-backup-$(date +%Y%m%d)

# 3. 解压新版本
tar -xzf pixel-rpg-v1.0.tar.gz

# 4. 启动服务
sudo systemctl start pixel-rpg

# 5. 验证
curl http://localhost:8081/index_mvp.html | head -5
```

### 回滚

```bash
# 停止服务
sudo systemctl stop pixel-rpg

# 恢复备份
cd /opt
rm -rf pixel-rpg
mv pixel-rpg-backup-YYYYMMDD pixel-rpg

# 启动服务
sudo systemctl start pixel-rpg
```

---

## 📞 联系支持

**运维文档**: 见 `/opt/pixel-rpg/README_MVP.md`  
**游戏源码**: `/opt/pixel-rpg/`  
**日志位置**: `/var/log/pixel-rpg.log`

---

**部署完成日期**: _______________  
**部署人员**: _______________  
**服务器 IP**: _______________  
**访问地址**: _______________
