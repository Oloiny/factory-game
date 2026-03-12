/**
 * AssetLoader 使用示例
 * 在 index_pixel.html 或其他游戏文件中参考此用法
 */

// ============================================
// 基本用法
// ============================================

function preload() {
    // 创建素材加载器
    this.assetLoader = new AssetLoader(this);
    
    // 加载所有素材
    this.assetLoader.loadAll({
        onProgress: (current, total) => {
            const percent = Math.round((current / total) * 100);
            console.log(`加载进度：${percent}% (${current}/${total})`);
            // 更新 UI 进度条
            // document.getElementById('loading-progress').style.width = percent + '%';
        },
        onComplete: () => {
            console.log('✅ 所有素材加载完成!');
        }
    });
}

function create() {
    // 创建所有角色动画
    this.assetLoader.createAllCharacterAnimations(8);
    
    // 创建玩家角色 (使用 Alice)
    this.player = this.add.sprite(400, 300, 'microverse_char_alice');
    
    // 播放行走动画
    this.player.play('alice_walk_down');
    
    // 添加办公室家具
    const desk = this.add.sprite(200, 200, 'microverse_office_001'); // 办公桌
    const chair = this.add.sprite(200, 250, 'microverse_office_051'); // 椅子
    const plant = this.add.sprite(600, 400, 'microverse_office_201'); // 植物
    
    // 随机添加装饰
    const randomDecor = this.assetLoader.getRandomOfficeObject('decorations');
    this.add.sprite(100, 100, randomDecor);
}

// ============================================
// 高级用法：只加载特定素材
// ============================================

function preloadSelective() {
    // 只加载办公室物件 (不加载角色)
    for (let i = 1; i <= 339; i++) {
        this.load.image(
            `microverse_office_${String(i).padStart(3, '0')}`,
            `assets/sprites/microverse/Modern_Office_Singles_32x32_${i}.png`
        );
    }
    
    // 只加载需要的角色 (比如只加载 Alice 和 Tom)
    this.load.spritesheet(
        'microverse_char_alice',
        'assets/sprites/microverse/characters/Alicex32.png',
        { frameWidth: 32, frameHeight: 32 }
    );
    
    this.load.spritesheet(
        'microverse_char_tom',
        'assets/sprites/microverse/characters/Tomx32.png',
        { frameWidth: 32, frameHeight: 32 }
    );
}

// ============================================
// 加载素材索引并查询
// ============================================

async function loadWithIndex() {
    const assetLoader = new AssetLoader(this);
    
    // 加载索引
    const index = await assetLoader.loadIndex();
    console.log('素材索引:', index);
    
    // 查询特定类别
    console.log('办公桌素材数量:', index.officeObjects.categories.desks.ids);
    
    // 加载所有素材
    assetLoader.loadAll();
}

// ============================================
// 在 index_pixel.html 中集成
// ============================================

/*
将以下代码添加到 index_pixel.html 的 preload 函数之前:

<script src="js/assetLoader.js"></script>

然后修改 preload:

function preload() {
    const loading = document.getElementById('loading');
    
    this.load.on('complete', () => {
        loading.style.display = 'none';
    });
    
    // 使用 AssetLoader 加载所有素材
    this.assetLoader = new AssetLoader(this);
    this.assetLoader.loadAll({
        onProgress: (current, total) => {
            loading.textContent = `加载中... ${Math.round((current/total)*100)}%`;
        }
    });
}

function create() {
    // 创建角色动画
    this.assetLoader.createAllCharacterAnimations(8);
    
    // 使用真实素材替换原来的代码绘制角色
    // ... (参考上面的基本用法)
}
*/
