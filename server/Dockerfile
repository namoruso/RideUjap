FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY prisma ./prisma
RUN pnpm exec prisma generate

COPY tsconfig.json ./
COPY seed.ts ./
COPY src ./src

EXPOSE 3001

CMD ["sh", "-c", "pnpm exec prisma db push && pnpm exec tsx seed.ts && pnpm exec tsx src/index.ts"]
