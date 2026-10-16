# Multi-Stage Dockerfile für DRK Warenbestand
# Der Build-Stage läuft nativ auf dem Host ($BUILDPLATFORM), um platform-agnostische Web-Dateien zu erzeugen.
# Dies verhindert das QEMU-Problem mit npm/rolldown auf ARM64.
FROM --platform=$BUILDPLATFORM node:22-bookworm-slim AS build

WORKDIR /app

# Abhängigkeiten kopieren
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Quellcode kopieren und Web-Assets (HTML/JS/CSS) kompilieren
COPY . .
RUN npm run build

# Schlanker Multi-Arch Production Runner mit Nginx für das Zielsystem ($TARGETPLATFORM)
FROM nginx:alpine AS runner

# SPA Routing Konfiguration (Fallback auf index.html für React Router / Tabs)
RUN echo 'server { \
    listen 8080; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Statische Build-Dateien übertragen
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
