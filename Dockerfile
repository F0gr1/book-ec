FROM node:20-bookworm-slim AS dependencies

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund --prefer-offline --omit=optional

FROM dependencies AS builder

ARG TARGETARCH
COPY . .
RUN if [ "$TARGETARCH" = "arm64" ]; then \
      npm install --no-save --ignore-scripts @next/swc-linux-arm64-gnu@16.2.12 sharp@0.35.3; \
    else \
      npm install --no-save --ignore-scripts @next/swc-linux-x64-gnu@16.2.12 sharp@0.35.3; \
    fi
RUN npm run build

FROM node:20-bookworm-slim AS migrator

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install --global --ignore-scripts prisma@6.19.3
COPY prisma ./prisma
CMD ["prisma", "migrate", "deploy"]

FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
