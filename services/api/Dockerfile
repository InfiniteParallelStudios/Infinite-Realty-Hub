# Multi-stage Dockerfile for Node.js API service
# Optimized for production deployment

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Copy workspace package files
COPY packages/*/package*.json ./packages/*/
COPY services/api/package*.json ./services/api/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY packages/ ./packages/
COPY services/api/ ./services/api/

# Build packages
RUN npm run build --workspace=packages/utils
RUN npm run build --workspace=packages/core-types
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=packages/api-client

# Build API service
RUN npm run build --workspace=services/api

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/services/api/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/services/api/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy built packages
COPY --from=builder --chown=nextjs:nodejs /app/packages/utils/dist ./packages/utils/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/core-types/dist ./packages/core-types/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/api-client/dist ./packages/api-client/dist

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/index.js"]
