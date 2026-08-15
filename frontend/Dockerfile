# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24.13.0-slim

########################################
# Dependencies
########################################
FROM node:${NODE_VERSION} AS deps

WORKDIR /frontend

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/usr/local/share/.cache/yarn \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    if [ -f package-lock.json ]; then \
        npm ci; \
    elif [ -f yarn.lock ]; then \
        corepack enable && yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then \
        corepack enable && pnpm install --frozen-lockfile; \
    else \
        exit 1; \
    fi

########################################
# Builder
########################################
FROM node:${NODE_VERSION} AS builder

WORKDIR /frontend

COPY --from=deps /frontend/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

RUN if [ -f package-lock.json ]; then \
        npm run build; \
    elif [ -f yarn.lock ]; then \
        corepack enable && yarn build; \
    elif [ -f pnpm-lock.yaml ]; then \
        corepack enable && pnpm build; \
    fi

########################################
# Runner
########################################
FROM node:${NODE_VERSION} AS runner

WORKDIR /frontend

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /frontend/public ./public
COPY --from=builder --chown=node:node /frontend/.next/standalone ./
COPY --from=builder --chown=node:node /frontend/.next/static ./.next/static

RUN mkdir .next && chown node:node .next

USER node

EXPOSE 3000

CMD ["node", "server.js"]