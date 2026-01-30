FROM ghcr.io/puppeteer/puppeteer:latest

# Switch to root to install dependencies
USER root

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencie (npm ci is faster and cleaner for CI/CD)
RUN npm ci

# Copy source code
COPY . .

# Expose port (Render sets PORT env var, but good to document)
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
