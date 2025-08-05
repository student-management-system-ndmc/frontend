FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable 
COPY package.json pnpm-lock.yaml ./

# ===development dependencies===
FROM base AS development-dependencies
WORKDIR /app
RUN pnpm install

# ===production dependencies===
FROM base AS production-dependencies
WORKDIR /app
RUN pnpm install --production

# ===build stage===
FROM base AS build
WORKDIR /app
COPY . .
COPY --from=development-dependencies /app/node_modules ./node_modules
RUN pnpm build

# ===production stage===
FROM node:22-alpine
WORKDIR /app

RUN npm add -g serve
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
CMD ["serve","-s", "dist", "-p", "3001"]
