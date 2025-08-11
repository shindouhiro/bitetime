#!/bin/bash

echo "🐳 Docker 构建脚本"
echo "=================="

# 1. 构建项目
echo "📦 步骤 1: 构建项目..."
./build.sh

# 检查构建是否成功
if [ ! -d "dist/public" ]; then
    echo "❌ 构建失败，dist/public 目录不存在"
    exit 1
fi

echo "✅ 项目构建成功！"

# 2. 构建 Docker 镜像
echo "🐳 步骤 2: 构建 Docker 镜像..."
docker buildx build --platform linux/amd64 -t shindouhiro/bitetime:latest . --load

if [ $? -eq 0 ]; then
    echo "✅ Docker 镜像构建成功！"
    echo "📦 镜像名称: shindouhiro/bitetime:latest"
    
    # 3. 测试镜像
    echo "🧪 步骤 3: 测试镜像..."
    echo "启动容器在端口 8080..."
    docker run -d -p 8080:80 --name bitetime-test shindouhiro/bitetime:latest
    
    if [ $? -eq 0 ]; then
        echo "✅ 容器启动成功！"
        echo "🌐 访问地址: http://localhost:8080"
        echo "🛑 停止测试容器: docker stop bitetime-test && docker rm bitetime-test"
    else
        echo "❌ 容器启动失败"
    fi
else
    echo "❌ Docker 镜像构建失败"
    exit 1
fi
