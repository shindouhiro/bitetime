#!/bin/bash

# 设置变量
IMAGE_NAME="shindouhiro/bitetime"
VERSION=$(date +%Y%m%d-%H%M%S)
LATEST_TAG="latest"
PLATFORMS="linux/amd64"

echo "🚀 开始构建流程..."

# 检查pnpm是否安装
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm未安装，正在安装..."
    npm install -g pnpm
fi

# 清理旧的构建产物
echo "🧹 清理旧的构建产物..."
rm -rf dist/

# 本地构建
echo "📦 开始本地构建..."
echo "安装依赖..."
pnpm install
echo "开始构建..."
pnpm run build

if [ $? -ne 0 ]; then
    echo "❌ 本地构建失败!"
    exit 1
fi

# 验证构建产物
if [ ! -d "dist/public" ]; then
    echo "❌ 构建产物不完整!"
    echo "请确保 dist/public 目录存在"
    exit 1
fi

echo "✅ 本地构建成功!"
echo "📋 构建产物验证通过:"
echo "构建目录内容:"
ls -la dist/public/

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 确保启用 buildx
echo "🔧 检查并配置 buildx..."
if ! docker buildx version > /dev/null 2>&1; then
    echo "❌ Docker buildx 未安装，请先安装 buildx"
    exit 1
fi

# 创建并使用新的构建器
BUILDER_NAME="multiarch-builder"
if ! docker buildx inspect "${BUILDER_NAME}" > /dev/null 2>&1; then
    echo "🔨 创建新的构建器: ${BUILDER_NAME}"
    docker buildx create --name "${BUILDER_NAME}" --driver docker-container --bootstrap
fi
docker buildx use "${BUILDER_NAME}"

# 清理旧的构建缓存（可选）
read -p "是否清理 Docker 构建缓存？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 清理构建缓存..."
    docker buildx prune -f
fi

# 登录到 Docker Hub（如果需要）
echo "🔑 登录到 Docker Hub..."
docker login

# 构建并推送多架构镜像
echo "📦 构建并推送多架构镜像: ${IMAGE_NAME}:${VERSION}"
docker buildx build \
    --platform ${PLATFORMS} \
    --tag ${IMAGE_NAME}:${VERSION} \
    --tag ${IMAGE_NAME}:${LATEST_TAG} \
    --push \
    .

if [ $? -eq 0 ]; then
    echo "✅ 多架构镜像构建并推送成功!"
    
    # 显示镜像信息
    echo "📊 镜像信息:"
    docker buildx imagetools inspect ${IMAGE_NAME}:${VERSION}
    
    echo ""
    echo "📋 镜像详情:"
    echo "   - 版本: ${IMAGE_NAME}:${VERSION}"
    echo "   - 最新: ${IMAGE_NAME}:${LATEST_TAG}"
    echo "   - 支持架构: ${PLATFORMS}"
    echo ""
    echo "🔗 拉取命令:"
    echo "   docker pull ${IMAGE_NAME}:${VERSION}"
    echo "   docker pull ${IMAGE_NAME}:${LATEST_TAG}"
    echo ""
    echo "🚀 运行命令 (会自动选择对应架构):"
    echo "   docker run -d -p 8080:80 --name storeui ${IMAGE_NAME}:${LATEST_TAG}"
    echo ""
    echo "🌐 访问地址: http://localhost:8080"
    
    # 清理
    echo "🧹 清理构建器..."
    docker buildx stop "${BUILDER_NAME}"
else
    echo "❌ 镜像构建失败!"
    # 清理
    docker buildx stop "${BUILDER_NAME}"
    exit 1
fi 
