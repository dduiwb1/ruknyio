# Simple Dockerfile for Railway - Feb 10 2026
FROM node:20-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm install

# Build
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

# Start
CMD ["npm", "run", "start:prod"]
