#!/bin/bash
# Tavily 搜索测试脚本

# 检查 API Key 是否配置
if [ -z "$TAVILY_API_KEY" ]; then
    echo "❌ 错误：TAVILY_API_KEY 未配置"
    echo ""
    echo "请按以下步骤配置："
    echo "1. 访问 https://app.tavily.com/dashboard 获取 API Key"
    echo "2. 运行：export TAVILY_API_KEY='tvly-你的 API Key'"
    echo "3. 或者添加到 ~/.bashrc: echo 'export TAVILY_API_KEY=tvly-xxx' >> ~/.bashrc"
    echo ""
    exit 1
fi

echo "✅ Tavily API Key 已配置"
echo ""

# 测试搜索
echo "🔍 测试搜索：生成式 AI 最新进展"
echo "================================"
node /home/admin/.openclaw/workspace/skills/tavily-search/scripts/search.mjs "生成式 AI 最新进展 2026" -n 5

echo ""
echo "================================"
echo "✅ 搜索测试完成"
