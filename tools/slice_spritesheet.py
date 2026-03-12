#!/usr/bin/env python3
"""
裁剪 Microverse 角色精灵表
将 1792x1280 大精灵表裁剪为独立帧
"""

from PIL import Image
import os
import json

# 配置
SPRITESHEET_SIZE = (1792, 1280)  # 56列 x 40行
FRAME_SIZE = (32, 32)
COLS = SPRITESHEET_SIZE[0] // FRAME_SIZE[0]  # 56
ROWS = SPRITESHEET_SIZE[1] // FRAME_SIZE[1]  # 40

CHARACTERS = ['Alice', 'Grace', 'Jack', 'Joe', 'Lea', 'Monica', 'Stephen', 'Tom']

def slice_spritesheet(char_name, output_dir='assets/sprites/microverse/characters/sliced'):
    """裁剪单个角色的精灵表"""
    
    input_path = f'assets/sprites/microverse/characters/{char_name}x32.png'
    
    if not os.path.exists(input_path):
        print(f"⚠️  文件不存在：{input_path}")
        return
    
    img = Image.open(input_path)
    print(f"📐 {char_name}: {img.size}")
    
    # 创建输出目录
    char_dir = os.path.join(output_dir, char_name.lower())
    os.makedirs(char_dir, exist_ok=True)
    
    # 裁剪所有帧
    frame_index = 0
    for row in range(ROWS):
        for col in range(COLS):
            left = col * FRAME_SIZE[0]
            upper = row * FRAME_SIZE[1]
            right = left + FRAME_SIZE[0]
            lower = upper + FRAME_SIZE[1]
            
            frame = img.crop((left, upper, right, lower))
            
            # 检查是否是空帧 (全透明)
            if frame.getbbox() is None:
                continue
            
            # 保存帧
            frame_path = os.path.join(char_dir, f'frame_{frame_index:04d}.png')
            frame.save(frame_path)
            frame_index += 1
    
    print(f"✅ {char_name}: 裁剪完成，共 {frame_index} 帧 → {char_dir}/")
    return frame_index


def create_animation_index(output_path='assets/sprites/microverse/characters/sliced/animation_index.json'):
    """
    创建动画索引文件
    假设布局：每行一个方向，每行包含多个动画帧
    """
    
    # 基于常见的精灵表布局假设
    # 40 行可能包含：
    # - 行走动画 (4 方向 x 4 帧 = 16 行)
    # - 跑步动画 (4 方向 x 4 帧 = 16 行)
    # -  idle 动画 (4 方向 x 2 帧 = 8 行)
    # - 其他动作
    
    index = {
        "frameSize": FRAME_SIZE,
        "originalSize": SPRITESHEET_SIZE,
        "grid": {"cols": COLS, "rows": ROWS},
        "characters": {}
    }
    
    for char_name in CHARACTERS:
        char_dir = f"assets/sprites/microverse/characters/sliced/{char_name.lower()}"
        
        if os.path.exists(char_dir):
            frames = sorted([f for f in os.listdir(char_dir) if f.endswith('.png')])
            
            # 假设标准布局：每行一个方向，每行 4 帧
            # 行 0-3: 向下行走 (4 帧 x 4 行 = 16 帧)
            # 行 4-7: 向上行走
            # 行 8-11: 向左行走
            # 行 12-15: 向右行走
            # ... 其他动作
            
            index["characters"][char_name.lower()] = {
                "totalFrames": len(frames),
                "directory": char_dir,
                "assumedLayout": {
                    "walk_down": {"startRow": 0, "endRow": 4, "framesPerRow": 4},
                    "walk_up": {"startRow": 4, "endRow": 8, "framesPerRow": 4},
                    "walk_left": {"startRow": 8, "endRow": 12, "framesPerRow": 4},
                    "walk_right": {"startRow": 12, "endRow": 16, "framesPerRow": 4},
                }
            }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    
    print(f"📋 动画索引已保存：{output_path}")
    return index


if __name__ == '__main__':
    print("🎨 开始裁剪 Microverse 角色精灵表...\n")
    
    total_frames = 0
    for char in CHARACTERS:
        frames = slice_spritesheet(char)
        if frames:
            total_frames += frames
    
    print(f"\n📊 总计：{total_frames} 帧")
    
    print("\n📋 创建动画索引...")
    create_animation_index()
    
    print("\n✅ 完成!")
