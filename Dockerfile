FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY index.cjs index.js ./

# Expose port (Smithery uses 8081)
ENV PORT=8081

# Start the server
CMD ["node", "index.cjs"]
