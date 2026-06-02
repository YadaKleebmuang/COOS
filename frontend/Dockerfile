# ===== Frontend =====
FROM node:18-alpine

# ติดตั้ง pnpm
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 8888

CMD ["pnpm", "dev"]
