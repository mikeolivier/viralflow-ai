FROM node:18-bullseye

# Install FFmpeg and other dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Create upload and processed directories
RUN mkdir -p /tmp/viralflow-uploads /tmp/viralflow-processed

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
