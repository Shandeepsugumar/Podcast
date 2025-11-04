# ==========================================================
# Stage 1 — Build Frontend (Vite)
# ==========================================================
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# Copy and install frontend dependencies
COPY Frontend/package*.json ./
RUN npm ci

# Copy all frontend files and build
COPY Frontend/ ./
RUN npm run build

# ==========================================================
# Stage 2 — Build Backend and bundle frontend
# ==========================================================
FROM node:20-alpine AS backend
WORKDIR /app/backend

# Copy backend dependencies
COPY Backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY Backend/ ./

# Copy built frontend into backend's public directory
COPY --from=frontend-build /app/frontend/dist ./public

# Environment setup
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Install curl for healthcheck
RUN apk add --no-cache curl

# ✅ Healthcheck — ensures backend is alive
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Start the backend (which now serves frontend too)
CMD ["node", "server.js"]
