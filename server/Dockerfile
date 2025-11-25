FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (only package files first for better cache)
COPY package*.json ./
RUN npm install --production

# Copy rest of the backend source
COPY . .

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
