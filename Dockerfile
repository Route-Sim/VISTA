# Multi-stage build: build with Bun + Vite, serve with Nginx

# 1) Builder: install deps and build static assets
FROM oven/bun:1 AS builder
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the source and build
COPY . .
RUN bunx --bun vite build

# 2) Runtime: serve static site via nginx with SPA fallback
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure nginx for single-page app (history API fallback)
RUN printf "server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n\n  location = /50x.html {\n    root /usr/share/nginx/html;\n  }\n}\n" > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Default command
CMD ["nginx", "-g", "daemon off;"]


