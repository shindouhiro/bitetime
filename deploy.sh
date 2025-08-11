#!/bin/bash

echo "🚀 完整部署脚本"
echo "================"

# 1. 构建项目
echo "📦 步骤 1: 构建项目..."
./build.sh

if [ $? -ne 0 ]; then
    echo "❌ 项目构建失败"
    exit 1
fi

# 2. 构建 Docker 镜像
echo "🐳 步骤 2: 构建 Docker 镜像..."
docker buildx build --platform linux/amd64 -t shindouhiro/bitetime:latest . --load

if [ $? -ne 0 ]; then
    echo "❌ Docker 镜像构建失败"
    exit 1
fi

echo "✅ Docker 镜像构建成功！"

# 3. 本地测试
echo "🧪 步骤 3: 本地测试..."
echo "启动测试容器在端口 4000..."

# 清理之前的测试容器
docker rm -f bitetime-test 2>/dev/null || true

# 启动新容器
docker run -d -p 4000:80 --name bitetime-test shindouhiro/bitetime:latest

if [ $? -eq 0 ]; then
    echo "✅ 容器启动成功！"
    echo "🌐 访问地址: http://localhost:4000"
    
    # 等待服务启动
    sleep 3
    
    # 测试服务
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:4000 | grep -q "200"; then
        echo "✅ 服务测试成功！"
    else
        echo "⚠️  服务可能有问题，请手动检查"
    fi
    
    echo "🛑 停止测试容器: docker stop bitetime-test && docker rm bitetime-test"
else
    echo "❌ 容器启动失败"
    exit 1
fi

# 4. 推送到 Docker Hub
echo "📤 步骤 4: 推送到 Docker Hub..."
read -p "是否推送到 Docker Hub? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker push shindouhiro/bitetime:latest
    
    if [ $? -eq 0 ]; then
        echo "✅ 镜像推送成功！"
        echo "📦 镜像地址: shindouhiro/bitetime:latest"
    else
        echo "❌ 镜像推送失败"
        exit 1
    fi
else
    echo "⏭️  跳过推送"
fi

echo "🎉 部署完成！"

