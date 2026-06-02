# ===== Frontend =====
FROM node:20-slim

# ติดตั้ง pnpm
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

WORKDIR /app

# Copy เฉพาะ package.json (ไม่ copy lockfile เพราะสร้างจาก Windows)
COPY package.json pnpm-workspace.yaml ./
RUN pnpm install

COPY . .

EXPOSE 8888

CMD ["pnpm", "dev", "--host", "0.0.0.0"]
