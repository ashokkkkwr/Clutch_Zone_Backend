# ── STAGE 1: Build ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# set workdir
WORKDIR /app

# copy package metadata & install all (including devDeps for TS compile)
COPY package.json package-lock.json ./
RUN npm ci


# Copy Prisma schema before running generate
COPY prisma ./prisma
RUN npx prisma generate      # ✅ Now this works correctly


# copy tsconfig, source code and dotenv
COPY tsconfig.json ./
COPY src ./src
COPY .env ./

RUN npm install

# compile TS to JS (outputs to ./build per tsconfig)
RUN npx tsc

# ── STAGE 2: Runtime ─────────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# 1) install only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 2) bring in your compiled JS & env from the builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/.env .env

# 3) bring in your Prisma schema + migrations so `prisma migrate deploy` can see them
COPY --from=builder /app/prisma ./prisma

# 4) copy the generated Prisma client
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma

EXPOSE 5000

# 5) at container startup run your migrations and then the server
CMD ["sh", "-c", "npx prisma migrate deploy && node build/src/server.js"]
