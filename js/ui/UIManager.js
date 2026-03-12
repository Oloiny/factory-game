/**
 * 大厂风云 - UI 管理器
 * 统一管理所有游戏 UI：事件弹窗、技能选择、胜负结算、员工详情、HUD
 */

class UIManager {
  constructor(game, scene) {
    this.game = game;       // MainGame 实例
    this.scene = scene;     // Phaser.Scene 实例

    // UI 状态
    this.activeModal = null;        // 当前打开的弹窗
    this.skillTargetMode = null;    // 技能目标选择模式 { skillId, onSelect }
    this.pendingEvents = [];        // 待处理的事件队列
    this.isProcessingEvent = false; // 是否正在处理事件弹窗

    // DOM 容器（覆盖在 Phaser canvas 上）
    this.container = null;
    this._initContainer();

    // HUD 元素（Phaser Text 对象）
    this.hudElements = {};

    // 技能目标选择高亮
    this.targetHighlights = [];
  }

  // ============================================================
  // 初始化
  // ============================================================

  _initContainer() {
    // 创建覆盖层 div，叠在 Phaser canvas 上
    this.container = document.createElement('div');
    this.container.id = 'ui-overlay';
    this.container.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 200;
      font-family: 'Microsoft YaHei', Arial, sans-serif;
    `;

    // 找到 Phaser 的父容器
    const gameContainer = document.getElementById('game-container') || document.body;
    gameContainer.style.position = 'relative';
    gameContainer.appendChild(this.container);

    // 注入全局样式
    this._injectStyles();
  }

  _injectStyles() {
    if (document.getElementById('ui-manager-styles')) return;
    const style = document.createElement('style');
    style.id = 'ui-manager-styles';
    style.textContent = `
      /* ===== 通用弹窗 ===== */
      .um-modal-backdrop {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.65);
        display: flex; align-items: center; justify-content: center;
        pointer-events: all;
        animation: um-fade-in 0.2s ease;
      }
      .um-modal {
        background: linear-gradient(135deg, #1e2a3a 0%, #2d3748 100%);
        border: 2px solid #4a90d9;
        border-radius: 12px;
        padding: 24px;
        min-width: 400px;
        max-width: 520px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,144,217,0.3);
        animation: um-slide-up 0.25s ease;
      }
      .um-modal-title {
        font-size: 18px; font-weight: bold;
        color: #f6e05e; margin-bottom: 8px;
        display: flex; align-items: center; gap: 8px;
      }
      .um-modal-desc {
        font-size: 14px; color: #a0aec0;
        margin-bottom: 20px; line-height: 1.6;
      }
      .um-modal-target {
        font-size: 13px; color: #68d391;
        margin-bottom: 16px; padding: 8px 12px;
        background: rgba(104,211,145,0.1);
        border-left: 3px solid #68d391;
        border-radius: 4px;
      }

      /* ===== 事件选项按钮 ===== */
      .um-options { display: flex; flex-direction: column; gap: 10px; }
      .um-option-btn {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 8px;
        padding: 12px 16px;
        color: #e2e8f0;
        font-size: 14px;
        cursor: pointer;
        text-align: left;
        transition: all 0.15s ease;
        pointer-events: all;
        display: flex; justify-content: space-between; align-items: center;
      }
      .um-option-btn:hover {
        background: rgba(74,144,217,0.2);
        border-color: #4a90d9;
        transform: translateX(3px);
      }
      .um-option-btn.um-disabled {
        opacity: 0.4; cursor: not-allowed;
      }
      .um-option-btn.um-disabled:hover {
        transform: none;
        background: rgba(255,255,255,0.06);
        border-color: rgba(255,255,255,0.15);
      }
      .um-option-cost {
        font-size: 12px; color: #f6ad55;
        background: rgba(246,173,85,0.15);
        padding: 2px 8px; border-radius: 4px;
        white-space: nowrap;
      }
      .um-option-cost.um-unaffordable { color: #fc8181; background: rgba(252,129,129,0.15); }

      /* ===== 技能面板 ===== */
      .um-skill-panel {
        position: absolute;
        bottom: 70px; left: 50%;
        transform: translateX(-50%);
        display: flex; gap: 10px;
        pointer-events: all;
        animation: um-fade-in 0.3s ease;
      }
      .um-skill-card {
        background: linear-gradient(135deg, #2d3748, #1a202c);
        border: 2px solid #4a5568;
        border-radius: 10px;
        padding: 10px 14px;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s ease;
        min-width: 90px;
        user-select: none;
      }
      .um-skill-card:hover {
        border-color: #4a90d9;
        transform: translateY(-4px);
        box-shadow: 0 6px 20px rgba(74,144,217,0.3);
      }
      .um-skill-card.um-active {
        border-color: #f6e05e;
        background: linear-gradient(135deg, #3d3000, #2d2200);
        box-shadow: 0 0 15px rgba(246,224,94,0.4);
      }
      .um-skill-card.um-cant-afford {
        opacity: 0.5;
        filter: grayscale(0.5);
      }
      .um-skill-icon { font-size: 24px; display: block; margin-bottom: 4px; }
      .um-skill-name { font-size: 11px; color: #e2e8f0; font-weight: bold; }
      .um-skill-cost { font-size: 10px; color: #f6ad55; margin-top: 3px; }

      /* ===== 技能目标选择提示 ===== */
      .um-target-hint {
        position: absolute;
        top: 70px; left: 50%;
        transform: translateX(-50%);
        background: rgba(246,224,94,0.15);
        border: 1px solid #f6e05e;
        border-radius: 8px;
        padding: 10px 20px;
        color: #f6e05e;
        font-size: 14px;
        pointer-events: none;
        animation: um-pulse 1s infinite;
      }
      .um-target-hint .um-cancel-target {
        margin-left: 12px;
        color: #fc8181;
        cursor: pointer;
        pointer-events: all;
        font-size: 12px;
        text-decoration: underline;
      }

      /* ===== HUD 顶部栏 ===== */
      .um-hud {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 56px;
        background: linear-gradient(90deg, rgba(26,32,44,0.95), rgba(45,55,72,0.95));
        border-bottom: 1px solid #4a5568;
        display: flex; align-items: center;
        padding: 0 16px; gap: 24px;
        pointer-events: none;
      }
      .um-hud-item { display: flex; align-items: center; gap: 6px; }
      .um-hud-label { font-size: 12px; color: #718096; }
      .um-hud-value { font-size: 15px; font-weight: bold; color: #e2e8f0; }
      .um-hud-progress-bar {
        width: 120px; height: 10px;
        background: #2d3748; border-radius: 5px; overflow: hidden;
        border: 1px solid #4a5568;
      }
      .um-hud-progress-fill {
        height: 100%; border-radius: 5px;
        background: linear-gradient(90deg, #48bb78, #68d391);
        transition: width 0.5s ease;
      }
      .um-hud-progress-fill.um-danger { background: linear-gradient(90deg, #e53e3e, #fc8181); }
      .um-hud-progress-fill.um-warning { background: linear-gradient(90deg, #d69e2e, #f6ad55); }

      /* ===== 员工状态栏（底部）===== */
      .um-employee-bar {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 64px;
        background: linear-gradient(90deg, rgba(26,32,44,0.95), rgba(45,55,72,0.95));
        border-top: 1px solid #4a5568;
        display: flex; align-items: center;
        padding: 0 12px; gap: 8px;
        pointer-events: none;
      }
      .um-emp-chip {
        display: flex; align-items: center; gap: 8px;
        background: rgba(255,255,255,0.05);
        border: 1px solid #4a5568;
        border-radius: 8px;
        padding: 6px 10px;
        cursor: pointer;
        pointer-events: all;
        transition: all 0.15s ease;
        flex: 1;
      }
      .um-emp-chip:hover { border-color: #4a90d9; background: rgba(74,144,217,0.1); }
      .um-emp-avatar {
        width: 32px; height: 32px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px;
        border: 2px solid #4a5568;
      }
      .um-emp-avatar.state-normal { border-color: #48bb78; }
      .um-emp-avatar.state-stocking { border-color: #ecc94b; }
      .um-emp-avatar.state-angry { border-color: #e53e3e; }
      .um-emp-avatar.state-resigning { border-color: #9f7aea; animation: um-pulse 0.8s infinite; }
      .um-emp-info { flex: 1; min-width: 0; }
      .um-emp-name { font-size: 12px; font-weight: bold; color: #e2e8f0; white-space: nowrap; }
      .um-emp-state { font-size: 11px; color: #718096; }
      .um-emp-mini-bars { display: flex; flex-direction: column; gap: 2px; width: 50px; }
      .um-mini-bar { height: 4px; border-radius: 2px; background: #2d3748; overflow: hidden; }
      .um-mini-bar-fill { height: 100%; border-radius: 2px; transition: width 0.3s ease; }
      .um-mini-bar-fill.sanity { background: #48bb78; }
      .um-mini-bar-fill.fatigue { background: #e53e3e; }
      .um-mini-bar-fill.loyalty { background: #4a90d9; }

      /* ===== 员工详情弹窗 ===== */
      .um-emp-detail {
        min-width: 340px; max-width: 420px;
      }
      .um-detail-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
      .um-stat-item { background: rgba(255,255,255,0.04); border-radius: 8px; padding: 10px; }
      .um-stat-label { font-size: 11px; color: #718096; margin-bottom: 4px; }
      .um-stat-bar { height: 6px; background: #2d3748; border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
      .um-stat-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
      .um-stat-value { font-size: 13px; font-weight: bold; color: #e2e8f0; }
      .um-section-title { font-size: 12px; color: #718096; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
      .um-memory-list { display: flex; flex-direction: column; gap: 6px; max-height: 120px; overflow-y: auto; margin-bottom: 16px; }
      .um-memory-item {
        font-size: 12px; color: #a0aec0;
        padding: 6px 10px;
        background: rgba(255,255,255,0.04);
        border-radius: 6px;
        border-left: 3px solid #4a5568;
        line-height: 1.4;
      }
      .um-memory-item.high-importance { border-left-color: #f6ad55; }
      .um-relation-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
      .um-relation-chip {
        font-size: 11px; padding: 4px 10px; border-radius: 12px;
        border: 1px solid;
      }
      .um-relation-chip.positive { color: #68d391; border-color: #68d391; background: rgba(104,211,145,0.1); }
      .um-relation-chip.negative { color: #fc8181; border-color: #fc8181; background: rgba(252,129,129,0.1); }
      .um-relation-chip.neutral { color: #a0aec0; border-color: #4a5568; background: rgba(255,255,255,0.04); }
      .um-buff-list { display: flex; flex-wrap: wrap; gap: 6px; }
      .um-buff-chip {
        font-size: 11px; padding: 3px 10px; border-radius: 12px;
        background: rgba(104,211,145,0.15); color: #68d391;
        border: 1px solid rgba(104,211,145,0.3);
      }
      .um-debuff-chip {
        font-size: 11px; padding: 3px 10px; border-radius: 12px;
        background: rgba(252,129,129,0.15); color: #fc8181;
        border: 1px solid rgba(252,129,129,0.3);
      }

      /* ===== 胜负结算 ===== */
      .um-result-modal { min-width: 460px; text-align: center; }
      .um-result-icon { font-size: 64px; margin: 8px 0 16px; display: block; }
      .um-result-title { font-size: 28px; font-weight: bold; margin-bottom: 8px; }
      .um-result-title.win { color: #f6e05e; }
      .um-result-title.draw { color: #f6ad55; }
      .um-result-title.lose { color: #fc8181; }
      .um-result-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 20px 0; }
      .um-result-stat { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; }
      .um-result-stat-label { font-size: 12px; color: #718096; margin-bottom: 6px; }
      .um-result-stat-value { font-size: 20px; font-weight: bold; color: #e2e8f0; }
      .um-result-grade { font-size: 48px; font-weight: bold; margin: 12px 0; }
      .um-result-comment { font-size: 14px; color: #a0aec0; margin-bottom: 24px; line-height: 1.6; }
      .um-result-btn {
        background: linear-gradient(135deg, #4a90d9, #3182ce);
        border: none; border-radius: 8px;
        padding: 12px 32px;
        color: white; font-size: 16px; font-weight: bold;
        cursor: pointer; pointer-events: all;
        transition: all 0.2s ease;
      }
      .um-result-btn:hover { transform: scale(1.05); box-shadow: 0 4px 20px rgba(74,144,217,0.4); }

      /* ===== 难度选择 ===== */
      .um-difficulty-modal { min-width: 480px; }
      .um-game-title { font-size: 32px; font-weight: bold; color: #f6e05e; text-align: center; margin-bottom: 6px; }
      .um-game-subtitle { font-size: 14px; color: #718096; text-align: center; margin-bottom: 28px; }
      .um-difficulty-cards { display: flex; gap: 12px; margin-bottom: 24px; }
      .um-diff-card {
        flex: 1; background: rgba(255,255,255,0.04);
        border: 2px solid #4a5568;
        border-radius: 10px; padding: 16px;
        cursor: pointer; pointer-events: all;
        transition: all 0.2s ease; text-align: center;
      }
      .um-diff-card:hover { border-color: #4a90d9; transform: translateY(-3px); }
      .um-diff-card.selected { border-color: #f6e05e; background: rgba(246,224,94,0.08); }
      .um-diff-icon { font-size: 32px; margin-bottom: 8px; display: block; }
      .um-diff-name { font-size: 16px; font-weight: bold; color: #e2e8f0; margin-bottom: 6px; }
      .um-diff-desc { font-size: 12px; color: #718096; line-height: 1.5; }
      .um-start-btn {
        width: 100%;
        background: linear-gradient(135deg, #f6e05e, #d69e2e);
        border: none; border-radius: 10px;
        padding: 14px; color: #1a202c;
        font-size: 18px; font-weight: bold;
        cursor: pointer; pointer-events: all;
        transition: all 0.2s ease;
      }
      .um-start-btn:hover { transform: scale(1.02); box-shadow: 0 4px 20px rgba(246,224,94,0.4); }

      /* ===== Toast 提示 ===== */
      .um-toast-container {
        position: absolute; top: 70px; right: 16px;
        display: flex; flex-direction: column; gap: 8px;
        pointer-events: none;
      }
      .um-toast {
        background: rgba(45,55,72,0.95);
        border: 1px solid #4a5568;
        border-radius: 8px;
        padding: 10px 16px;
        font-size: 13px; color: #e2e8f0;
        max-width: 260px;
        animation: um-toast-in 0.3s ease, um-toast-out 0.3s ease 2.7s forwards;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      }
      .um-toast.success { border-left: 3px solid #48bb78; }
      .um-toast.error { border-left: 3px solid #fc8181; }
      .um-toast.warning { border-left: 3px solid #f6ad55; }
      .um-toast.info { border-left: 3px solid #4a90d9; }

      /* ===== 动画 ===== */
      @keyframes um-fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes um-slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes um-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      @keyframes um-toast-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes um-toast-out { from { opacity: 1; } to { opacity: 0; transform: translateX(100%); } }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // HUD 顶部栏
  // ============================================================

  createHUD() {
    const hud = document.createElement('div');
    hud.className = 'um-hud';
    hud.innerHTML = `
      <div class="um-hud-item">
        <span class="um-hud-label">📅 天数</span>
        <span class="um-hud-value" id="hud-day">1 / 30</span>
      </div>
      <div class="um-hud-item">
        <span class="um-hud-label">📊 项目进度</span>
        <div class="um-hud-progress-bar">
          <div class="um-hud-progress-fill" id="hud-progress-fill" style="width:0%"></div>
        </div>
        <span class="um-hud-value" id="hud-progress-text">0%</span>
      </div>
      <div class="um-hud-item">
        <span class="um-hud-label">⚡ 管理点</span>
        <span class="um-hud-value" id="hud-mp">100</span>
      </div>
      <div class="um-hud-item">
        <span class="um-hud-label">💰 预算</span>
        <span class="um-hud-value" id="hud-budget">500</span>
      </div>
      <div class="um-hud-item" id="hud-event-indicator" style="display:none;">
        <span style="color:#f6e05e;animation:um-pulse 0.8s infinite">⚠️ 待处理事件</span>
      </div>
    `;
    this.container.appendChild(hud);
    this.hudEl = hud;
    return hud;
  }

  updateHUD() {
    if (!this.game) return;
    const s = this.game.getStatus();

    const dayEl = document.getElementById('hud-day');
    const fillEl = document.getElementById('hud-progress-fill');
    const textEl = document.getElementById('hud-progress-text');
    const mpEl = document.getElementById('hud-mp');
    const budgetEl = document.getElementById('hud-budget');

    if (dayEl) dayEl.textContent = `${s.day} / ${s.deadline}`;
    if (textEl) textEl.textContent = `${s.progressPercent}%`;
    if (mpEl) mpEl.textContent = s.managementPoints;
    if (budgetEl) budgetEl.textContent = `¥${s.budget}`;

    if (fillEl) {
      const pct = parseFloat(s.progressPercent);
      fillEl.style.width = `${pct}%`;
      fillEl.className = 'um-hud-progress-fill' +
        (pct >= 80 ? '' : pct >= 40 ? ' um-warning' : ' um-danger');
    }
  }

  // ============================================================
  // 员工状态栏（底部）
  // ============================================================

  createEmployeeBar() {
    const bar = document.createElement('div');
    bar.className = 'um-employee-bar';
    bar.id = 'um-employee-bar';
    this.container.appendChild(bar);
    this.empBarEl = bar;
    this.refreshEmployeeBar();
    return bar;
  }

  refreshEmployeeBar() {
    const bar = document.getElementById('um-employee-bar');
    if (!bar || !this.game) return;

    bar.innerHTML = '';

    this.game.employees.forEach(emp => {
      const stateMap = {
        normal: { label: '正常工作', emoji: '💼', color: '#48bb78' },
        stocking: { label: '摸鱼中', emoji: '🐟', color: '#ecc94b' },
        angry: { label: '暴躁！', emoji: '😤', color: '#e53e3e' },
        resigning: { label: `${emp.resignTimer || 3}天后离职`, emoji: '🏃', color: '#9f7aea' }
      };
      const st = stateMap[emp.state] || stateMap.normal;

      const roleEmoji = { programmer: '💻', pm: '📋', designer: '🎨', executive: '👔' };

      const chip = document.createElement('div');
      chip.className = 'um-emp-chip';
      chip.dataset.empId = emp.id;
      chip.innerHTML = `
        <div class="um-emp-avatar state-${emp.state}">${roleEmoji[emp.role] || '👤'}</div>
        <div class="um-emp-info">
          <div class="um-emp-name">${emp.name}</div>
          <div class="um-emp-state" style="color:${st.color}">${st.emoji} ${st.label}</div>
        </div>
        <div class="um-emp-mini-bars">
          <div class="um-mini-bar" title="情绪">
            <div class="um-mini-bar-fill sanity" style="width:${emp.sanity}%"></div>
          </div>
          <div class="um-mini-bar" title="疲劳">
            <div class="um-mini-bar-fill fatigue" style="width:${emp.fatigue}%"></div>
          </div>
          <div class="um-mini-bar" title="忠诚">
            <div class="um-mini-bar-fill loyalty" style="width:${emp.loyalty}%"></div>
          </div>
        </div>
      `;

      // 点击：进入技能目标选择 OR 查看详情
      chip.addEventListener('click', () => {
        if (this.skillTargetMode) {
          this.skillTargetMode.onSelect(emp);
          this._clearTargetMode();
        } else {
          this.showEmployeeDetail(emp);
        }
      });

      bar.appendChild(chip);
    });
  }

  // ============================================================
  // 技能面板
  // ============================================================

  createSkillPanel() {
    const panel = document.createElement('div');
    panel.className = 'um-skill-panel';
    panel.id = 'um-skill-panel';
    this.container.appendChild(panel);
    this.skillPanelEl = panel;
    this.refreshSkillPanel();
    return panel;
  }

  refreshSkillPanel() {
    const panel = document.getElementById('um-skill-panel');
    if (!panel || !this.game) return;

    panel.innerHTML = '';
    const sm = this.game.skillManager;

    Object.values(sm.skills).forEach(skill => {
      const canAfford = skill.costType === 'management'
        ? sm.managementPoints >= skill.cost
        : sm.budget >= skill.cost;

      const costLabel = skill.costType === 'management'
        ? `⚡${skill.cost}` : `💰${skill.cost}`;

      const card = document.createElement('div');
      card.className = `um-skill-card${canAfford ? '' : ' um-cant-afford'}`;
      card.innerHTML = `
        <span class="um-skill-icon">${skill.icon}</span>
        <div class="um-skill-name">${skill.name.replace(/^[^\s]+\s/, '')}</div>
        <div class="um-skill-cost">${costLabel}</div>
      `;

      card.title = skill.description;

      card.addEventListener('click', () => {
        if (!canAfford) {
          this.showToast('资源不足！', 'error');
          return;
        }
        this._handleSkillClick(skill);
      });

      panel.appendChild(card);
    });
  }

  _handleSkillClick(skill) {
    // 清除已有的目标选择模式
    this._clearTargetMode();

    if (skill.target === 'single') {
      // 需要选择目标：进入目标选择模式
      this._enterTargetMode(skill);
    } else if (skill.target === 'aoe' || skill.target === 'summon') {
      // 直接执行（AOE 或召唤）
      if (skill.id === 'bigPie') {
        // bigPie 虽然 target=single，在此不会进来，保险起见
        this._enterTargetMode(skill);
      } else {
        const result = this.game.skillManager.useSkill(skill.id);
        if (result.success) {
          this.showToast(`✅ ${skill.name} 使用成功！`, 'success');
          this.refreshSkillPanel();
          this.refreshEmployeeBar();
          this.updateHUD();
        }
      }
    }
  }

  _enterTargetMode(skill) {
    // 高亮技能卡
    document.querySelectorAll('.um-skill-card').forEach(el => el.classList.remove('um-active'));
    const cards = document.querySelectorAll('.um-skill-card');
    const skillNames = Object.values(this.game.skillManager.skills).map(s => s.id);
    const idx = skillNames.indexOf(skill.id);
    if (cards[idx]) cards[idx].classList.add('um-active');

    // 显示提示
    let hint = document.getElementById('um-target-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'um-target-hint';
      hint.id = 'um-target-hint';
      this.container.appendChild(hint);
    }
    hint.innerHTML = `点击下方员工使用 ${skill.name} <span class="um-cancel-target" id="um-cancel-target">取消</span>`;
    hint.style.display = 'block';

    document.getElementById('um-cancel-target')?.addEventListener('click', () => {
      this._clearTargetMode();
    });

    this.skillTargetMode = {
      skillId: skill.id,
      skill: skill,
      onSelect: (emp) => {
        // 画大饼需要额外输入文本
        if (skill.id === 'bigPie') {
          this._showBigPieInput(emp);
        } else {
          const result = this.game.skillManager.useSkill(skill.id, emp);
          if (result.success) {
            this.showToast(`✅ 对 ${emp.name} 使用 ${skill.name} 成功！`, 'success');
          } else {
            this.showToast(`❌ ${result.reason}`, 'error');
          }
          this.refreshSkillPanel();
          this.refreshEmployeeBar();
          this.updateHUD();
        }
      }
    };
  }

  _showBigPieInput(emp) {
    const templates = this.game.skillManager.bigPieTemplates;
    const optionsHtml = templates.map((t, i) =>
      `<div class="um-option-btn" data-idx="${i}" style="font-size:13px;">${t}</div>`
    ).join('');

    this._showModal({
      title: `🫓 对 ${emp.name} 画大饼`,
      desc: '选择一句激励话语，或者用自己的话：',
      extra: `
        <div class="um-options" id="pie-options">${optionsHtml}</div>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <input id="pie-custom-input" type="text" placeholder="自定义话语..." style="
            flex:1; background:rgba(255,255,255,0.08);
            border:1px solid #4a5568; border-radius:6px;
            padding:8px 12px; color:#e2e8f0; font-size:13px;
          ">
          <button id="pie-custom-btn" class="um-option-btn" style="white-space:nowrap;padding:8px 16px;pointer-events:all;">
            确认
          </button>
        </div>
      `,
      buttons: [],
      onClose: () => {}
    });

    // 绑定模板选择
    document.querySelectorAll('#pie-options .um-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = templates[parseInt(btn.dataset.idx)];
        this._executeBigPie(emp, text);
        this._closeModal();
      });
    });

    // 绑定自定义输入
    document.getElementById('pie-custom-btn')?.addEventListener('click', () => {
      const text = document.getElementById('pie-custom-input')?.value.trim();
      if (!text) { this.showToast('请输入话语', 'warning'); return; }
      this._executeBigPie(emp, text);
      this._closeModal();
    });
  }

  _executeBigPie(emp, text) {
    const result = this.game.skillManager.useSkill('bigPie', emp, { text });
    if (result.success) {
      const inner = result.result;
      if (inner.success) {
        this.showToast(`🫓 ${emp.name} 被激励了！进入鸡血状态`, 'success');
      } else {
        this.showToast(`😅 画饼被识破，${emp.name} 忠诚度下降`, 'warning');
      }
    }
    this.refreshSkillPanel();
    this.refreshEmployeeBar();
    this.updateHUD();
  }

  _clearTargetMode() {
    this.skillTargetMode = null;
    const hint = document.getElementById('um-target-hint');
    if (hint) hint.style.display = 'none';
    document.querySelectorAll('.um-skill-card').forEach(el => el.classList.remove('um-active'));
  }

  // ============================================================
  // 事件弹窗
  // ============================================================

  /**
   * 将事件加入队列，逐个弹出处理
   */
  queueEvent(event) {
    this.pendingEvents.push(event);
    const indicator = document.getElementById('hud-event-indicator');
    if (indicator) indicator.style.display = 'flex';
    if (!this.isProcessingEvent) {
      this._processNextEvent();
    }
  }

  _processNextEvent() {
    if (this.pendingEvents.length === 0) {
      this.isProcessingEvent = false;
      const indicator = document.getElementById('hud-event-indicator');
      if (indicator) indicator.style.display = 'none';
      return;
    }

    this.isProcessingEvent = true;
    const event = this.pendingEvents.shift();
    this.showEventModal(event);
  }

  showEventModal(event) {
    const sm = this.game.skillManager;
    const categoryEmoji = {
      breakdown: '😭', poach: '💼', argument: '🤬',
      gossip: '🗣️', breakthrough: '🎉'
    };
    const emoji = categoryEmoji[event.category] || '⚠️';

    const optionsHtml = event.options.map((opt, i) => {
      let costLabel = '';
      let canAfford = true;
      if (opt.cost) {
        if (opt.cost.management) {
          canAfford = canAfford && sm.managementPoints >= opt.cost.management;
          costLabel += `⚡${opt.cost.management} `;
        }
        if (opt.cost.budget) {
          canAfford = canAfford && sm.budget >= opt.cost.budget;
          costLabel += `💰${opt.cost.budget}`;
        }
      }
      return `
        <button class="um-option-btn${canAfford ? '' : ' um-disabled'}" data-idx="${i}" ${canAfford ? '' : 'disabled'}>
          <span>${opt.text}</span>
          ${costLabel ? `<span class="um-option-cost${canAfford ? '' : ' um-unaffordable'}">${costLabel.trim()}</span>` : ''}
        </button>
      `;
    }).join('');

    this._showModal({
      title: `${emoji} ${event.name}`,
      desc: event.description,
      extra: event.target ? `<div class="um-modal-target">👤 涉及员工：${event.target.name}（${this._roleName(event.target.role)}）</div>` : '',
      buttons: [],
      onClose: null,
      customContent: `<div class="um-options" id="event-options">${optionsHtml}</div>`
    });

    // 绑定选项
    document.querySelectorAll('#event-options .um-option-btn:not(.um-disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const result = this.game.eventSystem.resolveEvent(event, idx);
        this._closeModal();

        // 显示结果 Toast
        if (result?.result?.message) {
          this.showToast(result.result.message, 'info');
        }

        // 刷新 UI
        this.refreshEmployeeBar();
        this.updateHUD();

        // 处理下一个事件
        setTimeout(() => this._processNextEvent(), 400);
      });
    });
  }

  // ============================================================
  // 员工详情弹窗
  // ============================================================

  showEmployeeDetail(emp) {
    const roleEmoji = { programmer: '💻', pm: '📋', designer: '🎨', executive: '👔' };
    const personalityName = { normal: '普通', introvert: '内向', extrovert: '外向', perfectionist: '完美主义' };

    // 记忆列表
    const memories = emp.retrieveMemories({ topN: 5 });
    const memoriesHtml = memories.length > 0
      ? memories.map(m => `
          <div class="um-memory-item${(m.importance || 0) >= 7 ? ' high-importance' : ''}">
            ${m.content}
          </div>
        `).join('')
      : '<div style="color:#4a5568;font-size:12px;">暂无记忆</div>';

    // 关系列表
    const relations = Object.entries(emp.relationships);
    const relationsHtml = relations.length > 0
      ? relations.map(([id, val]) => {
          const target = this.game.employees.find(e => e.id === id);
          const name = target ? target.name : id;
          const cls = val > 20 ? 'positive' : val < -20 ? 'negative' : 'neutral';
          const icon = val > 20 ? '❤️' : val < -20 ? '💢' : '😐';
          return `<span class="um-relation-chip ${cls}">${icon} ${name} ${val > 0 ? '+' : ''}${Math.round(val)}</span>`;
        }).join('')
      : '<div style="color:#4a5568;font-size:12px;">暂无关系数据</div>';

    // Buff/Debuff
    const buffsHtml = emp.buffs.map(b =>
      `<span class="um-buff-chip">✨ ${b.name} (${b.duration}天)</span>`
    ).join('');
    const debuffsHtml = emp.debuffs.map(d =>
      `<span class="um-debuff-chip">💀 ${d.name} (${d.duration}天)</span>`
    ).join('');

    this._showModal({
      title: `${roleEmoji[emp.role] || '👤'} ${emp.name}`,
      desc: `${this._roleName(emp.role)} · ${personalityName[emp.personality] || '普通'} · ${emp.zone || 'desk'} 区`,
      customContent: `
        <div class="um-emp-detail">
          <div class="um-detail-stats">
            <div class="um-stat-item">
              <div class="um-stat-label">😊 情绪</div>
              <div class="um-stat-bar"><div class="um-stat-bar-fill" style="width:${emp.sanity}%;background:#48bb78"></div></div>
              <div class="um-stat-value">${Math.round(emp.sanity)} / 100</div>
            </div>
            <div class="um-stat-item">
              <div class="um-stat-label">😴 疲劳</div>
              <div class="um-stat-bar"><div class="um-stat-bar-fill" style="width:${emp.fatigue}%;background:#e53e3e"></div></div>
              <div class="um-stat-value">${Math.round(emp.fatigue)} / 100</div>
            </div>
            <div class="um-stat-item">
              <div class="um-stat-label">❤️ 忠诚</div>
              <div class="um-stat-bar"><div class="um-stat-bar-fill" style="width:${emp.loyalty}%;background:#4a90d9"></div></div>
              <div class="um-stat-value">${Math.round(emp.loyalty)} / 100</div>
            </div>
            <div class="um-stat-item">
              <div class="um-stat-label">📈 进度贡献</div>
              <div class="um-stat-bar"><div class="um-stat-bar-fill" style="width:${Math.min(100, emp.progress)}%;background:#9f7aea"></div></div>
              <div class="um-stat-value">${Math.round(emp.progress)}</div>
            </div>
          </div>
          ${buffsHtml || debuffsHtml ? `
            <div class="um-section-title">Buff / Debuff</div>
            <div class="um-buff-list" style="margin-bottom:16px;">${buffsHtml}${debuffsHtml}</div>
          ` : ''}
          <div class="um-section-title">最近记忆</div>
          <div class="um-memory-list">${memoriesHtml}</div>
          <div class="um-section-title">人际关系</div>
          <div class="um-relation-list">${relationsHtml}</div>
        </div>
      `,
      buttons: [{ text: '关闭', type: 'close' }],
      onClose: () => {}
    });
  }

  // ============================================================
  // 胜负结算
  // ============================================================

  showGameResult(outcome) {
    // outcome: 'win' | 'draw' | 'lose'
    const s = this.game.getStatus();
    const configs = {
      win: {
        icon: '🎉', title: '项目成功！',
        grade: this._calcGrade(parseFloat(s.progressPercent), s.day, s.deadline),
        comment: '你成功带领团队完成了项目！大家都会记得这段并肩作战的日子。'
      },
      draw: {
        icon: '😐', title: '勉强完成...',
        grade: 'C',
        comment: '项目虽然完成了，但延期让公司损失不小。下次要更好地管理团队状态。'
      },
      lose: {
        icon: '💀', title: '项目失败',
        grade: 'F',
        comment: '团队崩了，项目黄了。也许下次要更关注员工的心理健康？'
      }
    };
    const cfg = configs[outcome] || configs.lose;
    const gradeColors = { S: '#f6e05e', A: '#68d391', B: '#4a90d9', C: '#f6ad55', D: '#fc8181', F: '#9f7aea' };

    this._showModal({
      title: '',
      desc: '',
      customContent: `
        <div class="um-result-modal">
          <span class="um-result-icon">${cfg.icon}</span>
          <div class="um-result-title ${outcome}">${cfg.title}</div>
          <div class="um-result-grade" style="color:${gradeColors[cfg.grade] || '#e2e8f0'}">${cfg.grade}</div>
          <div class="um-result-stats">
            <div class="um-result-stat">
              <div class="um-result-stat-label">📅 用时</div>
              <div class="um-result-stat-value">${s.day} 天</div>
            </div>
            <div class="um-result-stat">
              <div class="um-result-stat-label">📊 完成度</div>
              <div class="um-result-stat-value">${s.progressPercent}%</div>
            </div>
            <div class="um-result-stat">
              <div class="um-result-stat-label">👥 存活员工</div>
              <div class="um-result-stat-value">${s.activeEmployees} 人</div>
            </div>
          </div>
          <div class="um-result-comment">${cfg.comment}</div>
          <button class="um-result-btn" id="um-restart-btn">🔄 再来一局</button>
        </div>
      `,
      buttons: [],
      onClose: null
    });

    document.getElementById('um-restart-btn')?.addEventListener('click', () => {
      location.reload();
    });
  }

  _calcGrade(progressPct, day, deadline) {
    if (progressPct >= 100 && day < deadline * 0.7) return 'S';
    if (progressPct >= 100 && day < deadline * 0.9) return 'A';
    if (progressPct >= 100) return 'B';
    if (progressPct >= 80) return 'C';
    if (progressPct >= 50) return 'D';
    return 'F';
  }

  // ============================================================
  // 难度选择开始界面
  // ============================================================

  showDifficultySelect(onStart) {
    let selectedDiff = 'normal';

    this._showModal({
      title: '',
      desc: '',
      customContent: `
        <div class="um-difficulty-modal">
          <div class="um-game-title">大厂风云</div>
          <div class="um-game-subtitle">职场抓马生存战 · 你能撑过 30 天 deadline 吗？</div>
          <div class="um-difficulty-cards">
            <div class="um-diff-card" data-diff="easy">
              <span class="um-diff-icon">😊</span>
              <div class="um-diff-name">简单</div>
              <div class="um-diff-desc">45天期限<br>情绪消耗×0.5<br>适合新手</div>
            </div>
            <div class="um-diff-card selected" data-diff="normal">
              <span class="um-diff-icon">😤</span>
              <div class="um-diff-name">普通</div>
              <div class="um-diff-desc">30天期限<br>标准数值<br>推荐体验</div>
            </div>
            <div class="um-diff-card" data-diff="hard">
              <span class="um-diff-icon">💀</span>
              <div class="um-diff-name">地狱</div>
              <div class="um-diff-desc">20天期限<br>情绪消耗×1.5<br>挑战极限</div>
            </div>
          </div>
          <button class="um-start-btn" id="um-start-game-btn">🚀 开始游戏</button>
        </div>
      `,
      buttons: [],
      onClose: null
    });

    // 难度卡片选择
    document.querySelectorAll('.um-diff-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.um-diff-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedDiff = card.dataset.diff;
      });
    });

    // 开始游戏
    document.getElementById('um-start-game-btn')?.addEventListener('click', () => {
      this._closeModal();
      // 应用难度配置
      const diffCfg = GameConfig.difficulty[selectedDiff];
      if (diffCfg) {
        GameConfig.deadline = diffCfg.deadline;
        // 应用情绪消耗倍率
        const drain = GameConfig.sanityDrain;
        Object.keys(drain).forEach(k => {
          if (typeof drain[k] === 'number') {
            drain[k] *= diffCfg.sanityDrain;
          }
        });
        // 应用进度倍率
        const prog = GameConfig.progress;
        Object.keys(prog).forEach(k => {
          if (typeof prog[k] === 'number') {
            prog[k] *= diffCfg.progressGain;
          }
        });
      }
      if (onStart) onStart(selectedDiff);
    });
  }

  // ============================================================
  // Toast 提示
  // ============================================================

  showToast(message, type = 'info') {
    let container = document.getElementById('um-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'um-toast-container';
      container.id = 'um-toast-container';
      this.container.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `um-toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // ============================================================
  // 通用弹窗
  // ============================================================

  _showModal({ title, desc, extra = '', customContent = '', buttons = [], onClose }) {
    // 关闭已有弹窗
    this._closeModal();

    const backdrop = document.createElement('div');
    backdrop.className = 'um-modal-backdrop';
    backdrop.id = 'um-modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'um-modal';

    let buttonsHtml = buttons.map((btn, i) => {
      if (btn.type === 'close') {
        return `<button class="um-option-btn" id="um-modal-close-btn" style="margin-top:12px;pointer-events:all;">${btn.text}</button>`;
      }
      return `<button class="um-option-btn" data-btn-idx="${i}" style="margin-top:8px;pointer-events:all;">${btn.text}</button>`;
    }).join('');

    modal.innerHTML = `
      ${title ? `<div class="um-modal-title">${title}</div>` : ''}
      ${desc ? `<div class="um-modal-desc">${desc}</div>` : ''}
      ${extra}
      ${customContent}
      ${buttonsHtml}
    `;

    backdrop.appendChild(modal);
    this.container.appendChild(backdrop);
    this.activeModal = backdrop;

    // 关闭按钮
    document.getElementById('um-modal-close-btn')?.addEventListener('click', () => {
      this._closeModal();
      if (onClose) onClose();
    });

    // 其他按钮
    modal.querySelectorAll('[data-btn-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.btnIdx);
        if (buttons[idx]?.onClick) {
          buttons[idx].onClick();
        }
        this._closeModal();
      });
    });
  }

  _closeModal() {
    const backdrop = document.getElementById('um-modal-backdrop');
    if (backdrop) backdrop.remove();
    this.activeModal = null;
  }

  // ============================================================
  // Tiled Zone 读取（场景搭完后使用）
  // ============================================================

  /**
   * 从 Tiled Object Layer 读取 zone 定义
   * 在 Phaser create() 中调用：uiManager.loadZonesFromTiled(this.map)
   */
  loadZonesFromTiled(tiledMap) {
    const zonesLayer = tiledMap.getObjectLayer('zones');
    if (!zonesLayer) {
      console.warn('[UIManager] Tiled 地图中未找到 "zones" Object Layer');
      return {};
    }

    const zones = {};
    zonesLayer.objects.forEach(obj => {
      zones[obj.name] = {
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height
      };
      console.log(`[UIManager] 加载 zone: ${obj.name} (${obj.x},${obj.y}) ${obj.width}x${obj.height}`);
    });

    // 挂载到 scene 供 zone 映射使用
    if (this.scene) {
      this.scene.gameZones = zones;
    }

    return zones;
  }

  /**
   * 根据像素坐标更新员工的 zone 属性
   * 在 Phaser update() 或 game.tick() 中调用
   */
  updateEmployeeZones() {
    const zones = this.scene?.gameZones;
    if (!zones || !this.game) return;

    this.game.employees.forEach(emp => {
      if (!emp.sprite) return;
      const { x, y } = emp.sprite;
      let newZone = 'desk'; // 默认

      for (const [name, rect] of Object.entries(zones)) {
        if (x >= rect.x && x <= rect.x + rect.width &&
            y >= rect.y && y <= rect.y + rect.height) {
          newZone = name;
          break;
        }
      }

      if (emp.zone !== newZone) {
        emp.zone = newZone;
      }
    });
  }

  // ============================================================
  // 工具方法
  // ============================================================

  _roleName(role) {
    const map = { programmer: '程序员', pm: '产品经理', designer: '设计师', executive: '高管', boss: '老板' };
    return map[role] || role;
  }

  /**
   * 完整初始化：创建所有 UI 组件
   * 在 Phaser create() 结束时调用
   */
  initAll() {
    this.createHUD();
    this.createEmployeeBar();
    this.createSkillPanel();
  }

  /**
   * 每帧更新（在 Phaser update() 中调用）
   */
  frameUpdate() {
    this.updateEmployeeZones();
  }

  /**
   * 每 tick 更新（在 game.tick() 结束后调用）
   */
  tickUpdate(events = []) {
    this.updateHUD();
    this.refreshEmployeeBar();
    this.refreshSkillPanel();

    // 将新事件加入队列
    events.forEach(ev => this.queueEvent(ev));

    // 检查胜负
    if (this.game.gameOver) {
      const outcome = this.game.checkGameOver();
      if (outcome) {
        setTimeout(() => this.showGameResult(outcome), 500);
      }
    }
  }
}
