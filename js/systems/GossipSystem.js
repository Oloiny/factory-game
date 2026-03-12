/**
 * 大厂风云 - 八卦传播系统
 * 借鉴斯坦福小镇 perceive + 简化记忆流
 *
 * 核心流程：
 *   事件发生 → 附近员工感知 → 存入带重要性分数的记忆 →
 *   在茶水间/吸烟区传播 → 影响 relationship → 玩家看到关系图谱变化
 */

class GossipSystem {
  constructor(game) {
    this.game = game;

    // 全局事件池：所有已发生的事件
    this.eventPool = [];

    // 茶水间/吸烟区：八卦传播热点
    this.gossipZones = ['cafe', 'smoking_area'];

    // 感知半径（像素）
    this.PERCEIVE_RADIUS = 200;

    // 每次感知最多接收几条事件（注意力带宽限制）
    this.ATTENTION_BANDWIDTH = 3;

    // 重要性阈值：低于此值的事件不会被主动传播
    this.SPREAD_THRESHOLD = 5;

    // 八卦衰减：每 tick 重要性 -0.5
    this.DECAY_RATE = 0.5;

    console.log('📡 八卦传播系统初始化完成');
  }

  // =====================================================
  // 事件注入：外部调用此方法触发可感知事件
  // =====================================================

  /**
   * 发布一个事件到事件池
   * @param {Object} event
   *   - type: 事件类型，见 EVENT_TYPES
   *   - subject: 事件主角（Employee 对象或 id）
   *   - content: 人类可读描述，如 "小明被老板当众批评了"
   *   - location: 发生地点（zone 字符串）
   *   - importance: 初始重要性分数 1~10
   *   - affectedRelation: 可选，{ a: empId, b: empId, delta: number }
   */
  publishEvent(event) {
    const entry = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: event.type,
      subject: event.subject,
      content: event.content,
      location: event.location || 'unknown',
      importance: event.importance || 5,
      baseImportance: event.importance || 5,
      timestamp: Date.now(),
      day: this.game.day,
      affectedRelation: event.affectedRelation || null,
      perceivedBy: [], // 已感知此事件的员工 id 列表
      spreadCount: 0,  // 被传播次数
    };

    this.eventPool.push(entry);

    // 立即让事件发生地附近的员工感知
    this._immediatePerceive(entry);

    console.log(`📢 [事件] ${entry.content} (重要性: ${entry.importance})`);
    return entry;
  }

  // =====================================================
  // 感知：事件发生时，附近员工立即感知
  // =====================================================

  _immediatePerceive(event) {
    const nearby = this._getEmployeesNearZone(event.location);
    nearby.forEach(emp => {
      if (!event.perceivedBy.includes(emp.id)) {
        this._perceiveEvent(emp, event);
      }
    });
  }

  /**
   * 员工 emp 感知事件 event
   */
  _perceiveEvent(emp, event) {
    // 已感知过就跳过
    if (event.perceivedBy.includes(emp.id)) return;

    event.perceivedBy.push(emp.id);

    // 写入员工记忆（带重要性评分）
    emp.addMemory({
      type: 'gossip_perceived',
      eventId: event.id,
      content: event.content,
      subject: typeof event.subject === 'object' ? event.subject.id : event.subject,
      importance: event.importance,
      timestamp: Date.now(),
      day: this.game.day,
      fromGossip: false, // 亲眼所见
    });

    // 根据事件类型影响员工情绪
    this._applyEventEmotion(emp, event, false);

    console.log(`👁️ [${emp.name}] 亲眼目睹：${event.content}`);
  }

  // =====================================================
  // tick：每游戏 tick 执行
  //   1. 在茶水间/吸烟区的员工互相传八卦
  //   2. 事件重要性衰减
  //   3. 清理过期事件
  // =====================================================

  tick() {
    // 1. 茶水间/吸烟区八卦传播
    this._spreadInGossipZones();

    // 2. 重要性衰减
    this._decayEvents();

    // 3. 清理超过 7 天的旧事件
    const cutoff = this.game.day - 7;
    this.eventPool = this.eventPool.filter(e => e.day >= cutoff);
  }

  _spreadInGossipZones() {
    this.gossipZones.forEach(zone => {
      const empsInZone = this.game.employees.filter(
        e => e.zone === zone && e.state !== 'resigning'
      );

      if (empsInZone.length < 2) return;

      // 两两之间互相传八卦
      for (let i = 0; i < empsInZone.length; i++) {
        for (let j = i + 1; j < empsInZone.length; j++) {
          this._gossipBetween(empsInZone[i], empsInZone[j]);
        }
      }
    });
  }

  /**
   * emp1 和 emp2 在茶水间相遇，互传八卦
   */
  _gossipBetween(emp1, emp2) {
    // emp1 把自己知道但 emp2 不知道的重要八卦告诉 emp2
    this._tellGossip(emp1, emp2);
    this._tellGossip(emp2, emp1);

    // 相遇本身会微微增加关系
    const relationDelta = 1;
    emp1.changeRelationship(emp2.id, relationDelta, '茶水间闲聊');
    emp2.changeRelationship(emp1.id, relationDelta, '茶水间闲聊');
  }

  /**
   * teller 把八卦告诉 listener
   */
  _tellGossip(teller, listener) {
    // 找出 teller 知道但 listener 不知道、且重要性足够的事件
    const knowsEvents = this.eventPool.filter(e =>
      e.perceivedBy.includes(teller.id) &&
      !e.perceivedBy.includes(listener.id) &&
      e.importance >= this.SPREAD_THRESHOLD
    );

    if (knowsEvents.length === 0) return;

    // 按重要性排序，最多传 ATTENTION_BANDWIDTH 条
    const toSpread = knowsEvents
      .sort((a, b) => b.importance - a.importance)
      .slice(0, this.ATTENTION_BANDWIDTH);

    toSpread.forEach(event => {
      // listener 接收到八卦
      event.perceivedBy.push(listener.id);
      event.spreadCount++;

      // 写入 listener 记忆
      listener.addMemory({
        type: 'gossip_heard',
        eventId: event.id,
        content: event.content,
        subject: typeof event.subject === 'object' ? event.subject.id : event.subject,
        importance: event.importance,
        timestamp: Date.now(),
        day: this.game.day,
        fromGossip: true,    // 听说的，不是亲眼见的
        toldBy: teller.id,
      });

      // 根据事件内容影响 listener 情绪和关系
      this._applyEventEmotion(listener, event, true);

      // 如果八卦涉及特定人，影响关系
      if (event.affectedRelation) {
        const rel = event.affectedRelation;
        if (listener.id === rel.a) {
          listener.changeRelationship(rel.b, rel.delta * 0.5, `听说：${event.content}`);
        } else if (listener.id === rel.b) {
          listener.changeRelationship(rel.a, rel.delta * 0.5, `听说：${event.content}`);
        } else {
          // 旁观者：对涉事双方各有轻微影响
          if (rel.a) listener.changeRelationship(rel.a, rel.delta * 0.2, `旁观：${event.content}`);
          if (rel.b) listener.changeRelationship(rel.b, rel.delta * 0.2, `旁观：${event.content}`);
        }
      }

      console.log(`🗣️ [${teller.name}→${listener.name}] 传播八卦：${event.content}`);
    });
  }

  // =====================================================
  // 情绪影响：根据事件类型决定如何影响员工
  // =====================================================

  _applyEventEmotion(emp, event, isRumor) {
    // 八卦是传言，情绪影响减半
    const factor = isRumor ? 0.5 : 1.0;

    const subjectId = typeof event.subject === 'object'
      ? event.subject.id
      : event.subject;

    switch (event.type) {
      case 'boss_rage':      // 老板发飙
        emp.changeSanity(-event.importance * factor, `${isRumor ? '听说' : '目睹'}老板发飙`);
        break;

      case 'colleague_fired': // 同事被裁
        emp.changeSanity(-event.importance * 0.8 * factor, `${isRumor ? '听说' : '目睹'}同事被裁`);
        emp.changeLoyalty(-event.importance * 0.5 * factor, '人心惶惶');
        break;

      case 'colleague_promoted': // 同事升职
        if (emp.id === subjectId) {
          emp.changeSanity(event.importance * factor, '自己升职了！');
        } else {
          // 性格影响：内向者羡慕，外向者可能嫉妒
          const delta = emp.personality === 'extrovert'
            ? -event.importance * 0.3 * factor   // 嫉妒
            : event.importance * 0.2 * factor;    // 受激励
          emp.changeSanity(delta, `${isRumor ? '听说' : '目睹'}同事升职`);
        }
        break;

      case 'overtime_announced': // 宣布加班
        emp.changeSanity(-event.importance * factor, `${isRumor ? '听说' : '得知'}要加班`);
        emp.changeLoyalty(-event.importance * 0.3 * factor, '被迫加班');
        break;

      case 'team_celebration':   // 团队庆功
        emp.changeSanity(event.importance * factor, `${isRumor ? '听说' : '参与'}团队庆功`);
        break;

      case 'colleague_conflict': // 同事吵架
        emp.changeSanity(-event.importance * 0.5 * factor, `${isRumor ? '听说' : '目睹'}同事吵架`);
        break;

      case 'salary_cut':         // 降薪
        emp.changeSanity(-event.importance * factor, `${isRumor ? '听说' : '得知'}降薪`);
        emp.changeLoyalty(-event.importance * 0.8 * factor, '降薪打击');
        break;

      default:
        // 通用：负面事件降情绪，正面事件升情绪
        if (event.importance < 0) {
          emp.changeSanity(event.importance * factor, isRumor ? '听说坏消息' : '遭遇坏事');
        }
    }
  }

  // =====================================================
  // 工具方法
  // =====================================================

  _getEmployeesNearZone(zone) {
    return this.game.employees.filter(e => e.zone === zone && e.state !== 'resigning');
  }

  _decayEvents() {
    this.eventPool.forEach(event => {
      event.importance = Math.max(0, event.importance - this.DECAY_RATE);
    });
  }

  // =====================================================
  // 查询接口：供 UI 读取
  // =====================================================

  /**
   * 获取当前最热的八卦（重要性最高的 N 条）
   */
  getHotGossip(n = 5) {
    return [...this.eventPool]
      .filter(e => e.importance > 0)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, n)
      .map(e => ({
        content: e.content,
        importance: e.importance.toFixed(1),
        spreadCount: e.spreadCount,
        day: e.day,
      }));
  }

  /**
   * 获取某员工的记忆摘要（最近 N 条）
   */
  getEmployeeMemorySummary(emp, n = 10) {
    return emp.memories
      .filter(m => m.type === 'gossip_perceived' || m.type === 'gossip_heard')
      .sort((a, b) => b.importance - a.importance)
      .slice(0, n);
  }

  /**
   * 获取关系图谱数据（供 UI 渲染）
   */
  getRelationshipGraph() {
    const nodes = this.game.employees.map(e => ({
      id: e.id,
      name: e.name,
      role: e.role,
      state: e.state,
    }));

    const edges = [];
    this.game.employees.forEach(emp => {
      Object.entries(emp.relationships).forEach(([targetId, value]) => {
        // 只输出一个方向，避免重复
        if (emp.id < targetId) {
          edges.push({
            source: emp.id,
            target: targetId,
            value: value,
            label: value >= 30 ? '好友' : value <= -30 ? '死敌' : '普通',
          });
        }
      });
    });

    return { nodes, edges };
  }

  /**
   * 打印当前八卦热榜（调试用）
   */
  printHotGossip() {
    const hot = this.getHotGossip(5);
    console.log('🔥 当前八卦热榜：');
    hot.forEach((g, i) => {
      console.log(`  ${i + 1}. [热度${g.importance}] ${g.content} (传播${g.spreadCount}次, 第${g.day}天)`);
    });
  }
}

// 预定义事件类型常量
const GOSSIP_EVENT_TYPES = {
  BOSS_RAGE: 'boss_rage',
  COLLEAGUE_FIRED: 'colleague_fired',
  COLLEAGUE_PROMOTED: 'colleague_promoted',
  OVERTIME_ANNOUNCED: 'overtime_announced',
  TEAM_CELEBRATION: 'team_celebration',
  COLLEAGUE_CONFLICT: 'colleague_conflict',
  SALARY_CUT: 'salary_cut',
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GossipSystem, GOSSIP_EVENT_TYPES };
}
