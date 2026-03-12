/**
 * 大厂风云 - 危机事件系统
 * Roguelike 元素：随机突发事件
 */

class EventSystem {
  constructor(game) {
    this.game = game;
    this.day = 1;
    this.eventHistory = [];
    
    // 事件库
    this.eventPool = this.createEventPool();
  }
  
  createEventPool() {
    return {
      // ========== 情绪崩溃事件 ==========
      breakdown: [
        {
          id: 'breakdown_cry',
          name: '办公室崩溃大哭',
          description: '核心程序员在工位上突然崩溃大哭',
          trigger: (emp) => emp.sanity < 20,
          options: [
            {
              text: '报警开除',
              effect: (emp) => {
                emp.resign();
                return { message: '他被开除了，进度倒退 10%' };
              }
            },
            {
              text: '知心开导',
              cost: { management: 20 },
              effect: (emp) => {
                emp.changeSanity(20, '开导');
                return { message: '心情好转了' };
              }
            },
            {
              text: '给一天假',
              cost: { budget: 20 },
              effect: (emp) => {
                emp.changeSanity(15, '放假');
                emp.changeFatigue(-20, '放假');
                return { message: '休息一天后恢复了' };
              }
            }
          ]
        },
        {
          id: 'breakdown_smash',
          name: '砸键盘',
          description: '员工在工位上砸键盘',
          trigger: (emp) => emp.sanity < 15 && emp.fatigue > 70,
          options: [
            {
              text: '让他冷静一下',
              effect: (emp) => {
                emp.isWorking = false;
                emp.changeSanity(5, '冷静');
                return { message: '暂时停止工作' };
              }
            },
            {
              text: '买新键盘',
              cost: { budget: 30 },
              effect: (emp) => {
                emp.changeSanity(10, '新键盘');
                return { message: '心情好转，继续工作' };
              }
            }
          ]
        }
      ],
      
      // ========== 挖角事件 ==========
      poach: [
        {
          id: 'poach_competitor',
          name: '竞品挖角',
          description: '竞品公司正在高薪挖角你的主策划',
          trigger: (emp) => emp.loyalty < 50 && emp.role === 'pm',
          countdown: 3, // 3 天后被挖走
          options: [
            {
              text: '画更大的饼',
              cost: { management: 30 },
              effect: (emp) => {
                const success = Math.random() < 0.6;
                if (success) {
                  emp.changeLoyalty(20, '被画饼');
                  return { message: '成功留住了！' };
                } else {
                  emp.changeLoyalty(-10, '饼太难吃');
                  return { message: '画饼失败，他还是走了' };
                }
              }
            },
            {
              text: '加薪挽留',
              cost: { budget: 100 },
              effect: (emp) => {
                emp.changeLoyalty(30, '加薪');
                return { message: '加薪成功，留住了！' };
              }
            },
            {
              text: '让他走',
              effect: (emp) => {
                emp.resign();
                return { message: '他离职了，进度倒退 20%' };
              }
            }
          ]
        }
      ],
      
      // ========== 吵架事件 ==========
      argument: [
        {
          id: 'argument_meeting',
          name: '会议室吵架',
          description: '两个员工在会议室吵起来了',
          trigger: () => true,
          condition: () => this.game.employees.length >= 2,
          options: [
            {
              text: '让他们继续吵',
              effect: () => {
                // 随机两个员工
                const emp1 = this.game.employees[0];
                const emp2 = this.game.employees[1];
                emp1.changeSanity(-10, '吵架');
                emp2.changeSanity(-10, '吵架');
                emp1.setRelationship(emp2.id, -30);
                return { message: '关系恶化了' };
              }
            },
            {
              text: '介入调解',
              cost: { management: 15 },
              effect: () => {
                const emp1 = this.game.employees[0];
                const emp2 = this.game.employees[1];
                emp1.changeSanity(-5, '调解');
                emp2.changeSanity(-5, '调解');
                return { message: '暂时平息了' };
              }
            },
            {
              text: '请奶茶',
              cost: { budget: 40 },
              effect: () => {
                this.game.employees.forEach(emp => {
                  emp.changeSanity(10, '奶茶');
                });
                return { message: '奶茶治百病' };
              }
            }
          ]
        }
      ],
      
      // ========== 八卦事件 ==========
      gossip: [
        {
          id: 'gossip_layoff',
          name: '裁员谣言',
          description: '吸烟区传出公司要裁员的谣言',
          trigger: () => Math.random() < 0.3,
          condition: () => this.game.employees.length >= 3,
          options: [
            {
              text: '不回应',
              effect: () => {
                this.game.employees.forEach(emp => {
                  emp.changeSanity(-15, '裁员谣言');
                  emp.changeLoyalty(-10, '裁员谣言');
                });
                return { message: '军心涣散了' };
              }
            },
            {
              text: '发全员邮件辟谣',
              cost: { management: 20 },
              effect: () => {
                this.game.employees.forEach(emp => {
                  emp.changeSanity(5, '辟谣');
                });
                return { message: '暂时稳定了' };
              }
            },
            {
              text: '开大会安抚',
              cost: { management: 30, budget: 50 },
              effect: () => {
                this.game.employees.forEach(emp => {
                  emp.changeSanity(10, '安抚');
                  emp.changeLoyalty(5, '安抚');
                });
                return { message: '成功稳定军心' };
              }
            }
          ]
        },
        {
          id: 'gossip_bonus',
          name: '奖金传闻',
          description: '传闻说某个部门拿了 S 绩效，奖金翻倍',
          trigger: () => Math.random() < 0.4,
          options: [
            {
              text: '不回应',
              effect: () => {
                // 随机一个员工获得不公平感
                const emp = this.game.employees[Math.floor(Math.random() * this.game.employees.length)];
                emp.changeSanity(-10, '不公平');
                return { message: `${emp.name} 觉得很不服` };
              }
            },
            {
              text: '承诺公平',
              cost: { management: 10 },
              effect: () => {
                this.game.employees.forEach(emp => {
                  emp.changeSanity(3, '公平承诺');
                });
                return { message: '稍微安抚了一下' };
              }
            }
          ]
        }
      ],
      
      // ========== 突破事件（正面） ==========
      breakthrough: [
        {
          id: 'breakthrough_bug',
          name: 'Bug 修复',
          description: '程序员成功修复了一个棘手 Bug',
          trigger: (emp) => emp.role === 'programmer' && emp.sanity > 50,
          options: [
            {
              text: '公开表扬',
              effect: (emp) => {
                emp.changeSanity(15, '表扬');
                emp.changeLoyalty(5, '表扬');
                return { message: '干劲更足了！' };
              }
            },
            {
              text: '发奖金',
              cost: { budget: 30 },
              effect: (emp) => {
                emp.changeSanity(20, '奖金');
                emp.changeLoyalty(10, '奖金');
                return { message: '非常开心！' };
              }
            }
          ]
        }
      ]
    };
  }
  
  // ========== 事件触发 ==========
  
  checkDailyEvents() {
    const events = [];
    
    // 检查是否触发事件
    if (Math.random() > GameConfig.events.daily) {
      return events; // 今天没事件
    }
    
    // 遍历事件池
    const categories = Object.keys(this.eventPool);
    
    for (const category of categories) {
      const categoryEvents = this.eventPool[category];
      
      for (const eventTemplate of categoryEvents) {
        // 检查条件
        if (eventTemplate.condition && !eventTemplate.condition()) {
          continue;
        }
        
        // 找触发员工
        const candidates = this.game.employees.filter(emp => {
          if (!eventTemplate.trigger) return true;
          return eventTemplate.trigger(emp);
        });
        
        if (candidates.length > 0) {
          const target = candidates[Math.floor(Math.random() * candidates.length)];
          
          const event = {
            ...eventTemplate,
            category: category,
            target: target,
            day: this.day
          };
          
          events.push(event);
          this.eventHistory.push(event);
          
          console.log(`📢 触发事件：${event.name}`);
        }
      }
    }
    
    return events;
  }
  
  // ========== 事件处理 ==========
  
  resolveEvent(event, optionIndex) {
    const option = event.options[optionIndex];
    
    console.log(`👉 选择：${option.text}`);
    
    // 扣除消耗
    if (option.cost) {
      if (option.cost.management) {
        this.game.skillManager.managementPoints -= option.cost.management;
      }
      if (option.cost.budget) {
        this.game.skillManager.budget -= option.cost.budget;
      }
    }
    
    // 执行效果
    const result = option.effect(event.target);
    
    console.log(`✨ 结果：${result.message}`);

    // 自动向八卦系统发布事件（让员工感知并传播）
    this._publishToGossip(event, option, result);
    
    return {
      event: event,
      option: option,
      result: result
    };
  }

  /**
   * 将游戏事件转化为八卦，注入 GossipSystem
   */
  _publishToGossip(event, option, result) {
    if (!this.game.gossipSystem) return;

    const gs = this.game.gossipSystem;
    const emp = event.target;
    const empName = emp ? emp.name : '某员工';

    // 根据事件类别生成对应的八卦
    const gossipMap = {
      breakdown: {
        type: 'boss_rage',
        content: `${empName}在工位崩溃了！`,
        location: emp ? emp.zone : 'desk',
        importance: 7,
        affectedRelation: emp ? { a: emp.id, b: null, delta: -5 } : null,
      },
      poach: {
        type: 'colleague_fired',
        content: `听说${empName}被竞品高薪挖角！`,
        location: 'smoking_area',
        importance: 8,
        affectedRelation: emp ? { a: emp.id, b: null, delta: -10 } : null,
      },
      argument: {
        type: 'colleague_conflict',
        content: `${empName}和同事在会议室大吵了一架！`,
        location: 'meeting_room',
        importance: 6,
      },
      gossip: {
        type: event.id === 'gossip_layoff' ? 'colleague_fired' : 'colleague_promoted',
        content: event.id === 'gossip_layoff'
          ? '吸烟区传出裁员谣言，人心惶惶...'
          : '听说某个部门奖金翻倍了！',
        location: 'smoking_area',
        importance: event.id === 'gossip_layoff' ? 9 : 5,
      },
      breakthrough: {
        type: 'team_celebration',
        content: `${empName}修复了大 Bug，老板当众表扬！`,
        location: emp ? emp.zone : 'desk',
        importance: 4,
        affectedRelation: emp ? { a: emp.id, b: null, delta: 5 } : null,
      },
    };

    const gossipData = gossipMap[event.category];
    if (gossipData) {
      gs.publishEvent({
        ...gossipData,
        subject: emp || { id: 'unknown' },
        day: this.day,
      });
    }
  }
  
  // ========== 进度 ==========
  
  nextDay() {
    this.day++;
    console.log(`\n📅 === 第${this.day}天 ===`);
    
    // 恢复资源
    this.game.skillManager.recoverResources();
    
    // 检查事件
    const events = this.checkDailyEvents();
    
    return {
      day: this.day,
      events: events
    };
  }
  
  // ========== 统计 ==========
  
  getEventStats() {
    const stats = {};
    
    this.eventHistory.forEach(event => {
      const key = event.category;
      stats[key] = (stats[key] || 0) + 1;
    });
    
    return stats;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventSystem;
}
