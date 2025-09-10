# Stage 1: builder
FROM node:18-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: runner
FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Copy dist and polyfill
COPY --from=builder /app/dist ./dist
COPY ./polyfill.js ./polyfill.js

EXPOSE 3000

# Preload crypto polyfill before NestJS starts
CMD ["node", "-r", "/app/polyfill.js", "dist/main.js"]