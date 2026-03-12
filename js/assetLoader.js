/**
 * 大厂风云 - 素材加载器
 * 自动加载 Microverse 和 Pixel Agents 的美术素材
 */

class AssetLoader {
    constructor(scene) {
        this.scene = scene;
        this.loaded = false;
        this.progress = 0;
    }

    /**
     * 加载所有素材
     * @param {Object} callbacks - 回调函数 { onProgress, onComplete }
     */
    loadAll(callbacks = {}) {
        const { onProgress, onComplete } = callbacks;
        
        // 监听加载进度
        this.scene.load.on('filecomplete', (key, type, data) => {
            this.progress++;
            if (onProgress) {
                onProgress(this.progress, this.totalFiles);
            }
        });

        this.scene.load.on('complete', () => {
            this.loaded = true;
            if (onComplete) {
                onComplete();
            }
        });

        // 开始加载
        this.loadMicroverseAssets();
        this.loadPixelAgentsAssets();
        this.scene.load.start();
    }

    /**
     * 加载 Microverse 素材库
     */
    loadMicroverseAssets() {
        const prefix = 'microverse_';
        
        // 1. 加载办公室物件 (339 个)
        for (let i = 1; i <= 339; i++) {
            const key = `${prefix}office_${String(i).padStart(3, '0')}`;
            const path = `assets/sprites/microverse/Modern_Office_Singles_32x32_${i}.png`;
            this.scene.load.image(key, path);
        }

        // 2. 加载角色精灵表 (8 个角色)
        const characters = ['Alice', 'Grace', 'Jack', 'Joe', 'Lea', 'Monica', 'Stephen', 'Tom'];
        characters.forEach(name => {
            this.scene.load.spritesheet(
                `${prefix}char_${name.toLowerCase()}`,
                `assets/sprites/microverse/characters/${name}x32.png`,
                { frameWidth: 32, frameHeight: 32 }
            );
        });

        // 3. 加载角色头像 (8 个)
        characters.forEach(name => {
            this.scene.load.image(
                `${prefix}portrait_${name.toLowerCase()}`,
                `assets/sprites/microverse/portraits/${name}P32.png`
            );
        });

        // 4. 加载 UI 素材
        const uiFiles = [
            'GUI.png',
            'dialog_bubble_bg.png',
            'Modern_UI_Style_1_32x32.png',
            'Modern_UI_Style_2_32x32.png'
        ];
        uiFiles.forEach(file => {
            const key = `${prefix}ui_${file.replace('.png', '')}`;
            this.scene.load.image(key, `assets/sprites/microverse/ui/${file}`);
        });
    }

    /**
     * 加载 Pixel Agents 素材
     */
    loadPixelAgentsAssets() {
        const prefix = 'pixel_agents_';

        // 1. 加载角色 (6 个)
        for (let i = 0; i <= 5; i++) {
            this.scene.load.image(
                `${prefix}char_${i}`,
                `assets/sprites/pixel-agents/char_${i}.png`
            );
        }

        // 2. 加载墙壁
        this.scene.load.image(
            `${prefix}walls`,
            `assets/sprites/pixel-agents/walls.png`
        );
    }

    /**
     * 获取已加载的素材总数
     */
    get totalFiles() {
        // 339 办公室物件 + 8 角色精灵表 + 8 头像 + 4 UI + 6 角色 + 1 墙壁 = 366
        return 339 + 8 + 8 + 4 + 6 + 1;
    }

    /**
     * 创建角色动画 (基于 Microverse 精灵表)
     * @param {string} characterName - 角色名 (alice, grace, jack, etc.)
     * @param {number} frameRate - 帧率
     */
    createCharacterAnimation(characterName, frameRate = 8) {
        const key = `microverse_char_${characterName}`;
        
        // 假设精灵表布局：每行一个方向，每行 4 帧
        // 行 0: 向下，行 1: 向上，行 2: 向左，行 3: 向右
        const framesPerDirection = 4;
        const totalFrames = 16; // 4 方向 x 4 帧

        // 检查精灵表是否存在
        if (!this.scene.textures.exists(key)) {
            console.warn(`Sprite sheet not found: ${key}`);
            return;
        }

        // 创建四个方向的动画
        const directions = ['down', 'up', 'left', 'right'];
        
        directions.forEach((dir, dirIndex) => {
            const startFrame = dirIndex * framesPerDirection;
            const frames = [];
            
            for (let i = 0; i < framesPerDirection; i++) {
                frames.push(startFrame + i);
            }

            const animKey = `${characterName}_walk_${dir}`;
            
            this.scene.anims.create({
                key: animKey,
                frames: this.scene.anims.generateFrameNumbers(key, { 
                    start: frames[0], 
                    end: frames[frames.length - 1] 
                }),
                frameRate: frameRate,
                repeat: -1
            });
        });

        // 创建站立动画 (单帧)
        this.scene.anims.create({
            key: `${characterName}_idle`,
            frames: [{ key: key, frame: 0 }],
            frameRate: 1
        });
    }

    /**
     * 批量创建所有角色动画
     */
    createAllCharacterAnimations(frameRate = 8) {
        const characters = ['alice', 'grace', 'jack', 'joe', 'lea', 'monica', 'stephen', 'tom'];
        characters.forEach(name => {
            this.createCharacterAnimation(name, frameRate);
        });
    }

    /**
     * 加载素材索引文件
     * @returns {Promise<Object>} 索引数据
     */
    async loadIndex() {
        try {
            const response = await fetch('assets/sprites/microverse/asset-index.json');
            return await response.json();
        } catch (e) {
            console.warn('无法加载素材索引:', e);
            return null;
        }
    }

    /**
     * 根据类别获取办公室物件 key 列表
     * @param {string} category - 类别 (desks, chairs, storage, electronics, decorations, misc)
     * @returns {string[]} 素材 key 数组
     */
    getOfficeObjectsByCategory(category) {
        const ranges = {
            'desks': [1, 50],
            'chairs': [51, 100],
            'storage': [101, 150],
            'electronics': [151, 200],
            'decorations': [201, 250],
            'misc': [251, 339]
        };
        
        const [start, end] = ranges[category] || [1, 339];
        const keys = [];
        
        for (let i = start; i <= end; i++) {
            keys.push(`microverse_office_${String(i).padStart(3, '0')}`);
        }
        
        return keys;
    }

    /**
     * 随机选择一个办公室物件
     * @param {string} category - 可选类别
     * @returns {string} 素材 key
     */
    getRandomOfficeObject(category = null) {
        const keys = category ? this.getOfficeObjectsByCategory(category) : 
                     this.getOfficeObjectsByCategory('misc');
        return keys[Math.floor(Math.random() * keys.length)];
    }
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetLoader;
}
