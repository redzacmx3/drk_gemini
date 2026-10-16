# Multi-Stage Dockerfile für DRK Warenbestand
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; else npm install --legacy-peer-deps; fi

COPY . .
RUN npm run build

# Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN npm install -g serve

COPY --from=build /app/dist /app/dist

EXPOSE 8080

# Serve SPA
CMD ["serve", "-s", "dist", "-l", "8080"]
