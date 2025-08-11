# 使用 Node.js 20 Alpine 作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖（禁用 frozen lockfile 以避免锁不一致中断）
RUN pnpm install --no-frozen-lockfile

# 复制源代码
COPY . .

# 构建前端项目
RUN pnpm run build

# 暴露端口（根据你的应用需要调整）
EXPOSE 4000

# 使用pnpm run start启动应用
CMD ["pnpm", "run", "start"]
