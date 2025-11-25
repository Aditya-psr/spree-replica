FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the frontend source
COPY . .

# Expose frontend port (CRA/default)
EXPOSE 3000

# For Create React App, disable host check etc if needed
ENV HOST=0.0.0.0
ENV PORT=3000

# Start dev server
CMD ["npm", "start"]
