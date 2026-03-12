/**
 * 大厂风云 - 员工类
 * 核心状态机：情绪驱动行为
 */

class Employee {
  constructor(config) {
    // 基础信息
    this.id = config.id || `emp_${Date.now()}`;
    this.name = config.name;
    this.role = config.role; // 'programmer', 'pm', 'designer', 'boss'
    this.personality = config.personality || 'normal'; // 'normal', 'introvert', 'extrovert', 'perfectionist'
    
    // 属性
    this.sanity = config.sanity || GameConfig.employee.sanity.initial;
    this.fatigue = config.fatigue || GameConfig.employee.fatigue.initial;
    this.loyalty = config.loyalty || GameConfig.employee.loyalty.initial;
    this.progress = config.progress || GameConfig.employee.progress.base;
    
    // 状态
    this.state = 'normal'; // 'normal', 'stocking', 'angry', 'resigning'
    this.buffs = [];
    this.debuffs = [];
    
    // 位置
    this.zone = config.zone || 'desk'; // 'desk', 'meeting_room', 'cafe', 'smoking_area'
    this.deskPosition = config.deskPosition || null; // {x, y}
    
    // 关系
    this.relationships = {}; // { employeeId: value } value: -100~100
    this.memories = []; // 记忆流
    
    // 工作
    this.isWorking = true;
    this.isOvertime = false;
    this.currentTask = null;
    
    //  Sprite
    this.sprite = null;
    this.animationKey = null;
  }
  
  // ========== 状态检查 ==========
  
  updateState() {
    const thresholds = GameConfig.employee.sanity.thresholds;
    const oldState = this.state;
    
    // 根据情绪值更新状态
    if (this.sanity <= thresholds.resign) {
      this.state = 'resigning';
    } else if (this.sanity <= thresholds.angry) {
      this.state = 'angry';
    } else if (this.sanity <= thresholds.stocking) {
      this.state = 'stocking';
    } else {
      this.state = 'normal';
    }
    
    // 状态变化时触发事件
    if (oldState !== this.state) {
      this.onStateChange(oldState, this.state);
    }
    
    return this.state;
  }
  
  onStateChange(oldState, newState) {
    console.log(`[${this.name}] 状态变化：${oldState} → ${newState}`);
    
    // 添加记忆
    this.addMemory({
      type: 'state_change',
      content: `从${this.getStateName(oldState)}变成了${this.getStateName(newState)}`,
      timestamp: Date.now(),
      intensity: Math.abs(newState === 'resigning' ? 10 : 5)
    });
    
    // 状态效果
    if (newState === 'stocking') {
      this.isWorking = false; // 停止工作
    } else if (newState === 'angry') {
      // 暴躁状态会传染周围（通过 tick 返回值传递给 game.js 处理）
      this._pendingAOE = this.spreadNegativeEnergy();
    } else if (newState === 'resigning') {
      // 开始改简历，3 天后离职
      this.startResignCountdown();
    }
  }
  
  getStateName(state) {
    const names = {
      'normal': '正常',
      'stocking': '摸鱼',
      'angry': '暴躁',
      'resigning': '跑路'
    };
    return names[state] || state;
  }
  
  // ========== 属性变化 ==========
  
  changeSanity(delta, reason = '') {
    const oldSanity = this.sanity;
    this.sanity = Math.max(0, Math.min(100, this.sanity + delta));
    
    if (delta !== 0) {
      console.log(`[${this.name}] 情绪 ${oldSanity.toFixed(1)} → ${this.sanity.toFixed(1)} (${delta >= 0 ? '+' : ''}${delta.toFixed(1)}) ${reason}`);
      
      // 添加记忆（如果是重大变化）
      if (Math.abs(delta) >= 10) {
        this.addMemory({
          type: 'sanity_change',
          content: `${reason}: ${delta >= 0 ? '心情变好' : '心情变差'}`,
          timestamp: Date.now(),
          intensity: Math.abs(delta)
        });
      }
    }
    
    this.updateState();
  }
  
  changeFatigue(delta, reason = '') {
    const oldFatigue = this.fatigue;
    this.fatigue = Math.max(0, Math.min(100, this.fatigue + delta));
    
    if (delta !== 0) {
      console.log(`[${this.name}] 疲劳 ${oldFatigue.toFixed(1)} → ${this.fatigue.toFixed(1)} (${delta >= 0 ? '+' : ''}${delta.toFixed(1)}) ${reason}`);
    }
  }
  
  changeLoyalty(delta, reason = '') {
    const oldLoyalty = this.loyalty;
    this.loyalty = Math.max(0, Math.min(100, this.loyalty + delta));
    
    if (delta !== 0) {
      console.log(`[${this.name}] 忠诚 ${oldLoyalty.toFixed(1)} → ${this.loyalty.toFixed(1)} (${delta >= 0 ? '+' : ''}${delta.toFixed(1)}) ${reason}`);
    }
  }
  
  addProgress(amount) {
    this.progress += amount;
    console.log(`[${this.name}] 进度 +${amount.toFixed(1)} → ${this.progress.toFixed(1)}`);
  }
  
  // ========== Buff/Debuff 系统 ==========
  
  addBuff(buff) {
    // buff: { name, duration, effects }
    this.buffs.push(buff);
    console.log(`[${this.name}] 获得 Buff: ${buff.name} (${buff.duration}天)`);
  }
  
  addDebuff(debuff) {
    // debuff: { name, duration, effects }
    this.debuffs.push(debuff);
    console.log(`[${this.name}] 获得 Debuff: ${debuff.name} (${debuff.duration}天)`);
  }
  
  removeBuff(name) {
    this.buffs = this.buffs.filter(b => b.name !== name);
  }
  
  removeDebuff(name) {
    this.debuffs = this.debuffs.filter(d => d.name !== name);
  }
  
  getBuffEffects() {
    let effects = {};
    this.buffs.forEach(buff => {
      if (buff.effects) {
        Object.assign(effects, buff.effects);
      }
    });
    this.debuffs.forEach(debuff => {
      if (debuff.effects) {
        Object.assign(effects, debuff.effects);
      }
    });
    return effects;
  }
  
  // ========== tick 更新（每分钟调用）==========
  
  tick() {
    // 1. 更新 Buff/Debuff 持续时间
    this.updateBuffs();
    
    // 2. 根据当前行为计算属性变化
    this.calculateTickChanges();
    
    // 3. 更新状态
    this.updateState();
    
    // 4. 如果有待处理的 AOE（刚进入暴躁状态）
    if (this._pendingAOE) {
      const aoe = this._pendingAOE;
      this._pendingAOE = null;
      return aoe;
    }
    
    // 5. 如果是跑路状态，倒计时
    if (this.state === 'resigning') {
      this.resignTimer--;
      if (this.resignTimer <= 0) {
        return this.resign(); // 返回离职结果
      }
    }
    
    return null;
  }
  
  updateBuffs() {
    // 减少持续时间
    this.buffs.forEach(buff => buff.duration--);
    this.debuffs.forEach(debuff => debuff.duration--);
    
    // 移除过期的
    this.buffs = this.buffs.filter(b => b.duration > 0);
    this.debuffs = this.debuffs.filter(d => d.duration > 0);
  }
  
  calculateTickChanges() {
    const cfg = GameConfig;
    let sanityChange = 0;
    let fatigueChange = 0;
    let progressChange = 0;
    
    // 基础变化
    if (this.isWorking) {
      sanityChange -= cfg.sanityDrain.working;
      fatigueChange += cfg.fatigueGain.working;
      progressChange += cfg.progress.base;
      
      if (this.isOvertime) {
        sanityChange -= cfg.sanityDrain.overtime;
        fatigueChange += cfg.fatigueGain.overtime;
        progressChange += cfg.progress.overtime;
      }
    } else {
      // 摸鱼/休息
      sanityChange -= cfg.sanityDrain.break;
      fatigueChange += cfg.fatigueGain.break;
    }
    
    // Buff/Debuff 影响
    const effects = this.getBuffEffects();
    if (effects.sanity) sanityChange *= effects.sanity;
    if (effects.fatigue) fatigueChange *= effects.fatigue;
    if (effects.progress) progressChange *= effects.progress;
    
    // 应用变化
    this.changeSanity(sanityChange, 'tick');
    this.changeFatigue(fatigueChange, 'tick');
    if (this.isWorking && this.state !== 'stocking') {
      this.addProgress(progressChange);
    }
  }
  
  // ========== 特殊行为 ==========
  
  spreadNegativeEnergy(radius = 100) {
    // 暴躁状态：AOE 传染负能量
    console.log(`[${this.name}] 开始传播负能量！`);
    
    // 由游戏系统处理范围内的其他员工
    return {
      type: 'negative_energy_aoe',
      source: this,
      radius: radius,
      effect: { sanity: -5 }
    };
  }
  
  startResignCountdown() {
    this.resignTimer = 3; // 3 天后离职
    console.log(`[${this.name}] 开始改简历，${this.resignTimer}天后离职！`);
    
    this.addDebuff({
      name: 'resigning',
      duration: 3,
      effects: { progress: 0 } // 不再产出进度
    });
  }
  
  resign() {
    console.log(`❗ [${this.name}] 离职了！带走了所有进度 (${this.progress.toFixed(1)}%)`);
    
    // 由游戏系统处理离职后果
    return {
      type: 'resignation',
      employee: this,
      lostProgress: this.progress
    };
  }
  
  // ========== 记忆系统（借鉴斯坦福小镇记忆流）==========

  addMemory(memory) {
    // memory: { type, content, timestamp, importance, ... }
    // importance: 1~10，决定记忆的存留优先级
    if (memory.importance === undefined) {
      memory.importance = memory.intensity || 3; // 兼容旧字段
    }
    this.memories.push(memory);

    // 超过上限时，淘汰重要性最低的记忆（而非最旧的）
    if (this.memories.length > 100) {
      // 按重要性升序排，删掉最不重要的
      this.memories.sort((a, b) => (a.importance || 0) - (b.importance || 0));
      this.memories.shift();
    }
  }

  /**
   * 检索记忆：按重要性+时近性综合评分
   * @param {Object} options
   *   - topN: 返回条数（默认5）
   *   - type: 过滤类型
   *   - minImportance: 最低重要性阈值
   */
  retrieveMemories({ topN = 5, type = null, minImportance = 0 } = {}) {
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    let pool = this.memories;
    if (type) pool = pool.filter(m => m.type === type);
    if (minImportance > 0) pool = pool.filter(m => (m.importance || 0) >= minImportance);

    // 综合评分：重要性（0.6）+ 时近性（0.4）
    return pool
      .map(m => {
        const ageDays = (now - m.timestamp) / ONE_DAY_MS;
        const recencyScore = Math.max(0, 1 - ageDays / 7); // 7天内线性衰减
        const score = (m.importance || 0) * 0.6 + recencyScore * 10 * 0.4;
        return { ...m, _score: score };
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, topN);
  }

  getRecentMemories(hours = 24) {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return this.memories.filter(m => m.timestamp > cutoff);
  }

  // ========== 关系系统 ==========

  setRelationship(employeeId, value) {
    this.relationships[employeeId] = Math.max(-100, Math.min(100, value));
  }

  getRelationship(employeeId) {
    return this.relationships[employeeId] || 0;
  }

  /**
   * 变更与某员工的关系值，并记录原因
   */
  changeRelationship(employeeId, delta, reason = '') {
    const oldVal = this.getRelationship(employeeId);
    const newVal = Math.max(-100, Math.min(100, oldVal + delta));
    this.relationships[employeeId] = newVal;

    if (Math.abs(delta) >= 5) {
      console.log(`[${this.name}] 与 ${employeeId} 关系 ${oldVal.toFixed(0)} → ${newVal.toFixed(0)} (${delta >= 0 ? '+' : ''}${delta.toFixed(0)}) ${reason}`);
    }

    // 关系大幅变化时写入记忆
    if (Math.abs(delta) >= 10) {
      this.addMemory({
        type: 'relationship_change',
        content: `与${employeeId}的关系因"${reason}"变化了${delta > 0 ? '+' : ''}${delta.toFixed(0)}`,
        targetId: employeeId,
        delta,
        importance: Math.min(10, Math.abs(delta) / 5),
        timestamp: Date.now(),
      });
    }
  }
  
  // ========== 序列化 ==========
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      personality: this.personality,
      sanity: this.sanity,
      fatigue: this.fatigue,
      loyalty: this.loyalty,
      progress: this.progress,
      state: this.state,
      zone: this.zone,
      buffs: this.buffs,
      debuffs: this.debuffs
    };
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Employee;
}
