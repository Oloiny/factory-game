// 简化版游戏配置 - 不依赖外部大文件
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let agents = [];
let decorations = [];

// 预加载资源 - 使用简单图形
function preload() {
    // 创建角色纹理（临时替代）
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // 李白 - 棕色衣服
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(4, 8, 24, 24);
    graphics.fillStyle(0xFFDBAC, 1);
    graphics.fillRect(8, 4, 16, 16);
    graphics.generateTexture('libai', 32, 32);
    graphics.clear();
    
    // 杜甫 - 深蓝色衣服
    graphics.fillStyle(0x2F4F4F, 1);
    graphics.fillRect(4, 8, 24, 24);
    graphics.fillStyle(0xFFDBAC, 1);
    graphics.fillRect(8, 4, 16, 16);
    graphics.generateTexture('dufu', 32, 32);
    graphics.clear();
    
    // 苏轼 - 绿色衣服
    graphics.fillStyle(0x228B22, 1);
    graphics.fillRect(4, 8, 24, 24);
    graphics.fillStyle(0xFFDBAC, 1);
    graphics.fillRect(8, 4, 16, 16);
    graphics.generateTexture('sushi', 32, 32);
    graphics.clear();
    
    // 树
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(12, 20, 8, 12);
    graphics.fillStyle(0x228B22, 1);
    graphics.fillCircle(16, 16, 12);
    graphics.generateTexture('tree', 32, 32);
    graphics.clear();
    
    // 桌子
    graphics.fillStyle(0x8B7355, 1);
    graphics.fillRect(0, 16, 32, 16);
    graphics.fillStyle(0x654321, 1);
    graphics.fillRect(4, 28, 4, 4);
    graphics.fillRect(24, 28, 4, 4);
    graphics.generateTexture('table', 32, 32);
    graphics.clear();
}

// 创建场景
function create() {
    // 添加背景（草地）
    const bg = this.add.graphics();
    bg.fillStyle(0x2d4a22, 1);
    bg.fillRect(0, 0, 800, 600);
    
    // 添加装饰
    addDecoration(this, 100, 150, 'tree');
    addDecoration(this, 700, 200, 'tree');
    addDecoration(this, 150, 450, 'tree');
    addDecoration(this, 650, 500, 'tree');
    addDecoration(this, 400, 300, 'table');
    
    // 创建玩家
    player = this.physics.add.sprite(400, 300, 'libai');
    player.setCollideWorldBounds(true);
    
    // 创建其他 Agent
    const dufu = this.physics.add.sprite(350, 350, 'dufu');
    const sushi = this.physics.add.sprite(450, 350, 'sushi');
    
    agents = [dufu, sushi];
    
    // 碰撞
    this.physics.add.collider(player, decorations);
    this.physics.add.collider(agents, decorations);
    this.physics.add.collider(player, agents);
    
    // 键盘
    cursors = this.input.keyboard.createCursorKeys();
    
    // UI
    createUI(this);
}

function addDecoration(scene, x, y, texture) {
    const deco = scene.physics.add.staticSprite(x, y, texture);
    decorations.push(deco);
}

function createUI(scene) {
    // 标题
    scene.add.text(20, 20, '长安文豪会', {
        font: 'bold 24px STKaiti, KaiTi, serif',
        fill: '#ffd700',
        stroke: '#000000',
        strokeThickness: 4
    });
    
    scene.add.text(20, 50, '方向键移动', {
        font: '16px STKaiti, KaiTi, serif',
        fill: '#aaaaaa'
    });
    
    // 右侧面板
    const panelX = 650;
    const panelY = 20;
    const panelBg = scene.add.graphics();
    panelBg.fillStyle(0x8B4513, 0.9);
    panelBg.fillRoundedRect(panelX, panelY, 130, 180, 10);
    panelBg.lineStyle(2, 0xDAA520);
    panelBg.strokeRoundedRect(panelX, panelY, 130, 180, 10);
    
    scene.add.text(panelX + 65, panelY + 20, '干预工具', {
        font: 'bold 16px STKaiti, KaiTi, serif',
        fill: '#ffd700'
    }).setOrigin(0.5);
    
    scene.add.text(panelX + 65, panelY + 55, '🍶 送酒', {
        font: '14px STKaiti, KaiTi, serif',
        fill: '#ffffff'
    }).setOrigin(0.5);
    
    scene.add.text(panelX + 65, panelY + 85, '📖 赠书', {
        font: '14px STKaiti, KaiTi, serif',
        fill: '#ffffff'
    }).setOrigin(0.5);
    
    scene.add.text(panelX + 65, panelY + 115, '📜 出题', {
        font: '14px STKaiti, KaiTi, serif',
        fill: '#ffffff'
    }).setOrigin(0.5);
    
    scene.add.text(panelX + 65, panelY + 150, '点数：3', {
        font: '14px STKaiti, KaiTi, serif',
        fill: '#ffff00'
    }).setOrigin(0.5);
}

// 游戏循环
function update() {
    player.setVelocity(0);
    const speed = 160;
    
    if (cursors.left.isDown) player.setVelocityX(-speed);
    else if (cursors.right.isDown) player.setVelocityX(speed);
    
    if (cursors.up.isDown) player.setVelocityY(-speed);
    else if (cursors.down.isDown) player.setVelocityY(speed);
    
    // AI 随机移动
    agents.forEach(agent => {
        if (Phaser.Math.Between(0, 100) < 2) {
            agent.setVelocityX(Phaser.Math.Between(-50, 50));
        }
        if (Phaser.Math.Between(0, 100) < 2) {
            agent.setVelocityY(Phaser.Math.Between(-50, 50));
        }
    });
}
