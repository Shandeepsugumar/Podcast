# --- Stage 1: Build Front-end ---
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ ./
RUN npm run build

# --- Stage 2: Build Backend ---
FROM node:18 AS backend-build
WORKDIR /app/backend
COPY Backend/package*.json ./
RUN npm install
COPY Backend/ ./
# If you need to build (e.g., transpile) for backend, do that here.
# Example: RUN npm run build
# For simplicity we'll assume no build step
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "index.js"]

# --- Final Stage: Combine or Serve ---
# Option A: Serve front and backend together (e.g., via nginx + proxy) 
# Option B: Run backend, serve frontend via backend static or separate container.
# For simplicity: separate containers is cleaner in production; but one container okay for small apps.

# Here: We'll serve both in one container via nginx for front, run backend node process.

FROM nginx:alpine AS production
# Copy front build output into nginx
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html

# Copy backend into container
COPY --from=backend-build /app/backend /usr/src/backend
WORKDIR /usr/src/backend

# Install any additional needed dependencies (if any)
# Already installed in backend build stage.

# Install curl for health-check maybe
RUN apk add --no-cache curl

# Expose ports
EXPOSE 80 4000

# Start backend in background & nginx in foreground
# For demonstration. In production use process manager or separate containers.
CMD sh -c "node /usr/src/backend/index.js & nginx -g 'daemon off;'"
