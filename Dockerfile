FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json yarn.lock* ./

# Install all dependencies (including dev dependencies for build)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy built application from builder stage
COPY --from=builder /app/build ./build

# Set environment to production
ENV NODE_ENV=production

# App Platform will provide PORT environment variable
EXPOSE 3000

# Start the application
CMD ["node", "build"]
