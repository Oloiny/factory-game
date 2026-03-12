/**
 * 大厂风云 - 数值配置
 * 难度平衡参数
 */

const GameConfig = {
  // ========== 游戏基础 ==========
  deadline: 30,              // 死线天数
  tickRate: 1000,            // 游戏 tick 间隔 (毫秒) = 1 秒 = 1 分钟游戏时间
  
  // ========== 员工基础属性 ==========
  employee: {
    sanity: {
      max: 100,
      min: 0,
      initial: 70,
      // 阈值
      thresholds: {
        stocking: 30,        // <30 摸鱼
        angry: 15,           // <15 暴躁
        resign: 5            // <5 跑路
      }
    },
    fatigue: {
      max: 100,
      min: 0,
      initial: 0,
      recoverRate: 0.5       // 自然恢复/分钟
    },
    loyalty: {
      max: 100,
      min: 0,
      initial: 50,
      // 影响画饼成功率
      bigPieSuccessRate: (loyalty) => 0.3 + (loyalty / 100) * 0.6  // 30%-90%
    },
    progress: {
      base: 0,               // 初始进度
      target: 100            // 个人目标进度
    }
  },
  
  // ========== 情绪变化率 ==========
  sanityDrain: {
    working: 1.0,            // 工作时情绪消耗/分钟
    overtime: 2.0,           // 加班时情绪消耗/分钟
    meeting: 1.5,            // 开会时情绪消耗/分钟
    break: -0.5,             // 休息时情绪恢复/分钟
    teamBuilding: -5.0,      // 团建时情绪恢复（大量）
    
    // 环境影响
    adjacentEnemy: -0.5,     // 相邻看不顺眼的人
    adjacentFriend: 0.2,     // 相邻好友
    smokingArea: -0.3,       // 在吸烟区（可能听到八卦）
    cafe: 0.5                // 在咖啡厅（放松）
  },
  
  // ========== 疲劳变化率 ==========
  fatigueGain: {
    working: 1.5,            // 工作时疲劳增长/分钟
    overtime: 3.0,           // 加班时疲劳增长/分钟
    meeting: 1.0,            // 开会时疲劳增长/分钟
    break: -2.0,             // 休息时疲劳恢复/分钟
    teamBuilding: -10.0      // 团建时疲劳恢复（大量）
  },
  
  // ========== 进度产出 ==========
  progress: {
    base: 0.5,               // 基础产出/分钟
    chickenBlood: 1.5,       // 鸡血状态产出/分钟
    overtime: 1.0,           // 加班额外产出/分钟
    seniorMentor: 0.8,       // 老带新时导师产出/分钟
    juniorLearn: 0.3         // 老带新时学员产出/分钟
  },
  
  // ========== 技能消耗 ==========
  skills: {
    bigPie: {
      cost: 10,              // 管理点数
      duration: 3,           // 持续天数
      effects: {
        progress: 1.5,       // 产出倍率
        sanity: -0.5         // 情绪消耗增加
      }
    },
    teamBuilding: {
      cost: 50,              // 公司预算
      sanityRecover: 30,     // 情绪恢复
      fatigueRecover: 50,    // 疲劳恢复
      duration: 1            // 持续天数（占用时间）
    },
    newExecutive: {
      cost: 200,             // 公司预算
      progress: 3.0,         // 进度倍率
      adjacentUnfair: -1.0   // 周围员工不公平感/分钟
    }
  },
  
  // ========== 事件概率 ==========
  events: {
    daily: 0.3,              // 每天发生事件的概率
    crisis: {
      breakdown: 0.1,        // 情绪崩溃事件
      poach: 0.05,           // 挖角事件（当忠诚<50）
      argument: 0.15,        // 吵架事件（会议室）
      gossip: 0.2            // 八卦事件（吸烟区）
    }
  },
  
  // ========== 难度系数 ==========
  difficulty: {
    easy: {
      sanityDrain: 0.5,
      progressGain: 1.2,
      deadline: 45
    },
    normal: {
      sanityDrain: 1.0,
      progressGain: 1.0,
      deadline: 30
    },
    hard: {
      sanityDrain: 1.5,
      progressGain: 0.8,
      deadline: 20
    }
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameConfig;
}
