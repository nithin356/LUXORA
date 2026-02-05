# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the Vite frontend
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the backend code and build artifacts
COPY server.js ./
COPY --from=build /app/dist ./dist

# Create necessary directories for persistence
RUN mkdir -p data uploads

# Expose the Express port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
