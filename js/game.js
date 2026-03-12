/**
 * 大厂风云 - 职场抓马生存战
 * 主游戏逻辑
 */

class MainGame {
  constructor(config) {
    this.config = config;
    this.day = 1;
    this.totalDays = GameConfig.deadline;
    this.gameOver = false;
    
    // 系统
    this.employees = [];
    this.skillManager = null;
    this.eventSystem = null;
    this.gossipSystem = null;
    
    // 项目进度
    this.projectProgress = 0;
    this.projectTarget = 1000; // 总目标
    
    // Phaser
    this.scene = null;
  }
  
  // ========== 初始化 ==========
  
  init(scene) {
    this.scene = scene;
    
    // 初始化系统
    this.skillManager = new SkillManager(this);
    this.eventSystem = new EventSystem(this);
    this.gossipSystem = {
      spreadGossip: (gossip) => {
        console.log(`📢 八卦传播：${gossip.content}`);
        // 简化版：影响周围员工
        this.employees.forEach(emp => {
          if (emp !== gossip.source) {
            emp.changeSanity(-2, '听到八卦');
          }
        });
      }
    };
    
    // 创建初始员工
    this.createInitialEmployees();
    
    console.log('🎮 大厂风云 - 职场抓马生存战 启动！');
    console.log(`📅 死线：${this.totalDays}天`);
    console.log(`📊 项目目标：${this.projectTarget}`);
  }
  
  createInitialEmployees() {
    const roles = [
      { name: '小明', role: 'programmer', personality: 'introvert' },
      { name: '小红', role: 'pm', personality: 'extrovert' },
      { name: '小刚', role: 'designer', personality: 'perfectionist' },
      { name: '小丽', role: 'programmer', personality: 'normal' }
    ];
    
    roles.forEach((r, index) => {
      const emp = new Employee({
        ...r,
        id: `emp_${index}`,
        // 测试用：不同初始情绪，方便看状态图标
        sanity: index === 0 ? 25 : (index === 1 ? 10 : (index === 2 ? 70 : 3)), // 摸鱼/暴躁/正常/跑路
        fatigue: Math.random() * 20,
        loyalty: 40 + Math.random() * 40
      });
      
      this.addEmployee(emp);
    });
  }
  
  addEmployee(employee) {
    this.employees.push(employee);
    console.log(`👤 新员工入职：${employee.name} (${employee.role})`);
  }
  
  // ========== 游戏循环 ==========
  
  tick() {
    if (this.gameOver) return;
    
    // 计算相邻加成
    this.calculateAdjacencyBonus();
    
    // 更新所有员工
    this.employees.forEach(emp => emp.tick());
    
    // 计算项目进度
    this.calculateProjectProgress();
    
    // 检查胜负
    this.checkGameOver();
  }
  
  // ========== 相邻加成系统 ==========
  
  calculateAdjacencyBonus() {
    // 计算员工之间的距离，应用相邻效果
    for (let i = 0; i < this.employees.length; i++) {
      for (let j = i + 1; j < this.employees.length; j++) {
        const emp1 = this.employees[i];
        const emp2 = this.employees[j];
        
        if (!emp1.sprite || !emp2.sprite) continue;
        
        // 计算距离
        const dx = emp1.sprite.x - emp2.sprite.x;
        const dy = emp1.sprite.y - emp2.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 相邻阈值：150 像素以内
        if (distance < 150) {
          this.applyAdjacencyEffect(emp1, emp2);
        }
      }
    }
  }
  
  applyAdjacencyEffect(emp1, emp2) {
    // 老带新加成：programmer 带 programmer
    if (emp1.role === emp2.role && emp1.role === 'programmer') {
      emp1.addProgress(0.1); // 额外进度
      emp2.addProgress(0.1);
    }
    
    // 看不顺眼 debuff：PM 和 designer 相邻会吵架
    if ((emp1.role === 'pm' && emp2.role === 'designer') ||
        (emp1.role === 'designer' && emp2.role === 'pm')) {
      emp1.changeSanity(-0.2, '看不顺眼');
      emp2.changeSanity(-0.2, '看不顺眼');
    }
  }
  
  calculateProjectProgress() {
    // 每 tick 把正在工作的员工产出累加进总进度
    this.employees.forEach(emp => {
      if (emp.isWorking && emp.state !== 'stocking' && emp.state !== 'resigning') {
        this.projectProgress += emp.progress * 0.01; // 每 tick 贡献 1% 的个人进度
      }
    });
    // 限制不超过目标
    this.projectProgress = Math.min(this.projectProgress, this.projectTarget);
  }
  
  addDays(days) {
    for (let i = 0; i < days; i++) {
      this.day++;
      this.eventSystem.day = this.day;
      this.skillManager.recoverResources();
    }
  }
  
  // ========== 胜负判定 ==========
  
  checkGameOver() {
    // 胜利：项目完成
    if (this.projectProgress >= this.projectTarget) {
      this.gameOver = true;
      console.log('🎉 恭喜！项目提前完成！');
      return 'win';
    }
    
    // 失败：死线到了
    if (this.day >= this.totalDays) {
      this.gameOver = true;
      if (this.projectProgress >= this.projectTarget * 0.8) {
        console.log('😐 项目勉强完成，但延期了...');
        return 'draw';
      } else {
        console.log('❌ 项目失败，团队被裁！');
        return 'lose';
      }
    }
    
    // 失败：所有人都跑了
    const activeEmployees = this.employees.filter(emp => emp.state !== 'resigning');
    if (activeEmployees.length === 0) {
      this.gameOver = true;
      console.log('❌ 所有人都离职了，项目黄了！');
      return 'lose';
    }
    
    return null;
  }
  
  // ========== 统计 ==========
  
  getStatus() {
    const activeEmployees = this.employees.filter(emp => emp.state !== 'resigning');
    const avgSanity = activeEmployees.reduce((sum, emp) => sum + emp.sanity, 0) / activeEmployees.length;
    const avgFatigue = activeEmployees.reduce((sum, emp) => sum + emp.fatigue, 0) / activeEmployees.length;
    
    return {
      day: this.day,
      deadline: this.totalDays,
      projectProgress: this.projectProgress,
      projectTarget: this.projectTarget,
      progressPercent: ((this.projectProgress / this.projectTarget) * 100).toFixed(1),
      employees: this.employees.length,
      activeEmployees: activeEmployees.length,
      avgSanity: avgSanity.toFixed(1),
      avgFatigue: avgFatigue.toFixed(1),
      managementPoints: this.skillManager.managementPoints,
      budget: this.skillManager.budget
    };
  }
  
  printStatus() {
    const status = this.getStatus();
    console.log(`
╔══════════════════════════════════════════════════════╗
║  📅 第${status.day}/${status.deadline}天  │  📊 进度：${status.progressPercent}%
║  👥 员工：${status.activeEmployees}/${status.employees}人  │  💰 预算：¥${status.budget}
║  😊 平均情绪：${status.avgSanity}  │  😴 平均疲劳：${status.avgFatigue}
║  ⚡ 管理点：${status.managementPoints}/100
╚══════════════════════════════════════════════════════╝
    `);
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MainGame;
}
