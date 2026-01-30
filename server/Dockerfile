FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app

# Critical: Use the Chrome installed in the image, don't download another one
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

COPY package*.json ./
# Use npm install to regenerate lockfile logic if needed
RUN npm install

COPY . .

CMD ["node", "server.js"]
