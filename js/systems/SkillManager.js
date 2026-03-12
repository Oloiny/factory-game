/**
 * 大厂风云 - 技能卡牌系统
 * 玩家干预手段
 */

class SkillManager {
  constructor(game) {
    this.game = game;
    this.managementPoints = 100; // 管理点数
    this.budget = 500; // 公司预算
    
    // 技能列表
    this.skills = {
      bigPie: {
        id: 'bigPie',
        name: '🫓 画大饼',
        description: '选定一个员工，输入一段话。如果画得好，该员工接下来 3 天进入鸡血状态。',
        costType: 'management',
        cost: 10,
        target: 'single',
        icon: '🫓'
      },
      teamBuilding: {
        id: 'teamBuilding',
        name: '🍕 团建聚餐',
        description: '强制所有人离开工位去聚餐。清空大部分负面情绪，有概率消除敌对记忆。',
        costType: 'budget',
        cost: 50,
        target: 'aoe',
        icon: '🍕'
      },
      newExecutive: {
        id: 'newExecutive',
        name: '👔 空降高管',
        description: '花重金招募一个全属性爆表的卷王。进度推进快，但周围员工会有不公平感。',
        costType: 'budget',
        cost: 200,
        target: 'summon',
        icon: '👔'
      },
      forcedLeave: {
        id: 'forcedLeave',
        name: '🏖️ 强制休假',
        description: '强制指定员工休假 1 天。恢复大量情绪和疲劳，但浪费时间。',
        costType: 'budget',
        cost: 20,
        target: 'single',
        icon: '🏖️'
      },
      emergencyMeeting: {
        id: 'emergencyMeeting',
        name: '📢 紧急会议',
        description: '召集所有人开会。快速推进里程碑，但消耗大量情绪。',
        costType: 'management',
        cost: 30,
        target: 'aoe',
        icon: '📢'
      }
    };
    
    // 预制大饼文本库
    this.bigPieTemplates = [
      "等上市了，大家都有期权！",
      "这个项目做成了，你就是技术总监！",
      "我看好你，好好干，明年给你加薪！",
      "我们是在改变世界，不只是写代码！",
      "年轻人不要总想着钱，要多学东西！",
      "公司不会亏待任何一个奋斗者！",
      "这个季度我们冲刺一下，奖金翻倍！",
      "你是公司的核心人才，我很重视你！"
    ];
    
    // UI 回调
    this.onSkillUsed = null;
  }
  
  // ========== 技能使用 ==========
  
  canUseSkill(skillId, target = null) {
    const skill = this.skills[skillId];
    if (!skill) return { can: false, reason: '技能不存在' };
    
    // 检查消耗
    if (skill.costType === 'management' && this.managementPoints < skill.cost) {
      return { can: false, reason: '管理点数不足' };
    }
    if (skill.costType === 'budget' && this.budget < skill.cost) {
      return { can: false, reason: '公司预算不足' };
    }
    
    // 检查目标
    if (skill.target === 'single' && !target) {
      return { can: false, reason: '需要选择目标' };
    }
    
    return { can: true };
  }
  
  useSkill(skillId, target = null, options = {}) {
    const check = this.canUseSkill(skillId, target);
    if (!check.can) {
      console.warn(`❌ 无法使用技能：${check.reason}`);
      return { success: false, reason: check.reason };
    }
    
    const skill = this.skills[skillId];
    
    // 扣除消耗
    if (skill.costType === 'management') {
      this.managementPoints -= skill.cost;
    } else if (skill.costType === 'budget') {
      this.budget -= skill.cost;
    }
    
    console.log(`🎯 使用技能：${skill.name}`);
    
    // 执行技能效果
    let result;
    switch (skillId) {
      case 'bigPie':
        result = this.useBigPie(target, options.text);
        break;
      case 'teamBuilding':
        result = this.useTeamBuilding();
        break;
      case 'newExecutive':
        result = this.useNewExecutive();
        break;
      case 'forcedLeave':
        result = this.useForcedLeave(target);
        break;
      case 'emergencyMeeting':
        result = this.useEmergencyMeeting();
        break;
    }
    
    // 回调通知
    if (this.onSkillUsed) {
      this.onSkillUsed(skillId, result);
    }
    
    return { success: true, result };
  }
  
  // ========== 技能实现 ==========
  
  useBigPie(employee, customText = null) {
    const cfg = GameConfig.skills.bigPie;
    
    // 生成或自定义文本
    const text = customText || this.bigPieTemplates[Math.floor(Math.random() * this.bigPieTemplates.length)];
    
    // 计算成功率（基于忠诚度）
    const successRate = GameConfig.employee.loyalty.bigPieSuccessRate(employee.loyalty);
    const success = Math.random() < successRate;
    
    console.log(`🫓 [画大饼] 对${employee.name}说："${text}"`);
    console.log(`成功率：${(successRate * 100).toFixed(0)}%, 结果：${success ? '✅ 成功' : '❌ 失败'}`);
    
    if (success) {
      // 成功：鸡血状态 3 天
      employee.addBuff({
        name: 'chicken_blood',
        duration: cfg.duration,
        effects: {
          progress: cfg.effects.progress,
          sanity: cfg.effects.sanity
        }
      });
      
      employee.changeSanity(5, '画大饼成功');
      employee.changeLoyalty(3, '被画饼感动');
      
      employee.addMemory({
        type: 'bigPie',
        content: `老板说："${text}"`,
        timestamp: Date.now(),
        intensity: 5,
        result: 'believed'
      });
      
      return {
        type: 'bigPie',
        success: true,
        employee: employee,
        effect: 'chicken_blood',
        duration: cfg.duration
      };
    } else {
      // 失败：忠诚度暴跌
      employee.changeLoyalty(-20, '画饼被识破');
      employee.changeSanity(-10, '听到蠢话很生气');
      
      employee.addMemory({
        type: 'bigPie',
        content: `老板说："${text}"`,
        timestamp: Date.now(),
        intensity: 8,
        result: 'seen_through'
      });
      
      // 传播八卦
      this.game.gossipSystem?.spreadGossip({
        source: employee,
        content: '老板画大饼被识破了！',
        type: 'negative'
      });
      
      return {
        type: 'bigPie',
        success: false,
        employee: employee,
        effect: 'loyalty_drop'
      };
    }
  }
  
  useTeamBuilding() {
    const cfg = GameConfig.skills.teamBuilding;
    
    console.log(`🍕 [团建聚餐] 全员去聚餐！`);
    
    const affected = [];
    
    // 对所有员工生效
    this.game.employees.forEach(emp => {
      emp.changeSanity(cfg.sanityRecover, '团建聚餐');
      emp.changeFatigue(-cfg.fatigueRecover, '团建聚餐');
      
      // 有概率消除敌对记忆
      if (Math.random() < 0.5) {
        // 简化：随机改善一个关系
        const enemies = Object.entries(emp.relationships)
          .filter(([_, val]) => val < -20);
        
        if (enemies.length > 0) {
          const [enemyId] = enemies[Math.floor(Math.random() * enemies.length)];
          const newValue = emp.relationships[enemyId] + 20;
          emp.setRelationship(enemyId, newValue);
          console.log(`  ${emp.name} 对${enemyId}的关系改善：${newValue}`);
        }
      }
      
      affected.push(emp.id);
    });
    
    // 消耗 1 天时间
    this.game.addDays(1);
    
    return {
      type: 'teamBuilding',
      affected: affected,
      daysPassed: 1
    };
  }
  
  useNewExecutive() {
    const cfg = GameConfig.skills.newExecutive;
    
    console.log(`👔 [空降高管] 招募了一位卷王高管！`);
    
    // 创建新员工（卷王）
    const executive = new Employee({
      name: '卷王',
      role: 'executive',
      sanity: 100,
      fatigue: 0,
      loyalty: 80,
      personality: 'perfectionist'
    });
    
    // 添加 Buff：进度爆表
    executive.addBuff({
      name: 'super_producer',
      duration: 999,
      effects: { progress: cfg.progress }
    });
    
    // 添加到游戏
    this.game.addEmployee(executive);
    
    // 周围员工获得不公平感 Debuff
    this.game.employees.forEach(emp => {
      if (emp !== executive) {
        emp.addDebuff({
          name: 'unfair',
          duration: 7,
          effects: { sanity: cfg.adjacentUnfair }
        });
        emp.changeSanity(-5, '看到空降高管不爽');
      }
    });
    
    return {
      type: 'newExecutive',
      executive: executive,
      affected: this.game.employees.length - 1
    };
  }
  
  useForcedLeave(employee) {
    console.log(`🏖️ [强制休假] ${employee.name} 去休假了！`);
    
    employee.changeSanity(20, '强制休假');
    employee.changeFatigue(-30, '强制休假');
    
    employee.isWorking = false;
    
    // 1 天后恢复
    setTimeout(() => {
      employee.isWorking = true;
      console.log(`  ${employee.name} 休假结束，回来工作了`);
    }, GameConfig.tickRate * 60 * 24); // 1 天
    
    // 消耗 1 天
    this.game.addDays(1);
    
    return {
      type: 'forcedLeave',
      employee: employee,
      daysPassed: 1
    };
  }
  
  useEmergencyMeeting() {
    console.log(`📢 [紧急会议] 所有人开会！`);
    
    const affected = [];
    
    this.game.employees.forEach(emp => {
      emp.changeSanity(-15, '紧急会议');
      emp.changeFatigue(-10, '紧急会议');
      emp.addProgress(10); // 快速推进进度
      
      affected.push(emp.id);
    });
    
    return {
      type: 'emergencyMeeting',
      affected: affected
    };
  }
  
  // ========== 资源恢复 ==========
  
  recoverResources() {
    // 每天恢复一些管理点数
    this.managementPoints = Math.min(100, this.managementPoints + 10);
    
    // 预算不会自动恢复（需要赚）
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkillManager;
}
