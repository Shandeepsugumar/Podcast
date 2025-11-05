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

# Copy backend dependencies and install (only production deps)
COPY Backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source code
COPY Backend/ ./

# ✅ Copy built frontend into backend public folder
COPY --from=frontend-build /app/frontend/dist ./public

# ==========================================================
# Environment, Health Check, and Start
# ==========================================================
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Install curl for health check
RUN apk add --no-cache curl

# Healthcheck to verify backend is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# ==========================================================
# Start the backend (serves both frontend & API)
# ==========================================================
CMD ["node", "server.js"]
