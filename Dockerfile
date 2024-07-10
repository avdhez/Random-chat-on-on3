# Combined Dockerfile

# Stage 1: Build React App
FROM node:14 AS build
WORKDIR /app
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm install
COPY client/ .
RUN npm run build

# Stage 2: Build Backend and Serve React App
FROM node:14
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install
COPY backend/ .

# Copy React build from Stage 1
COPY --from=build /app/client/build ./public

EXPOSE 3001
CMD ["node", "server.js"]