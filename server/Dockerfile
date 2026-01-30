FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app

# Skip downloading Chrome because the base image already has it!
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Note: We do NOT set PUPPETEER_EXECUTABLE_PATH manually anymore.
# The base image (ghcr.io/puppeteer/puppeteer) sets it to the correct location automatically.

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "server.js"]
