# Use a base image with Node.js installed
FROM node:14 AS build

# Set the working directory for the build
WORKDIR /app

# Copy the client package.json and package-lock.json files
COPY client/package*.json ./client/

# Set the working directory for the client
WORKDIR /app/client

# Install the client dependencies
RUN npm install

# Copy the rest of the client files
COPY client/ .

# Build the client
RUN npm run build

# Use another base image with Node.js installed for the backend
FROM node:14

# Set the working directory for the backend
WORKDIR /app

# Copy the backend package.json and package-lock.json files
COPY backend/package*.json ./

# Install the backend dependencies
RUN npm install

# Copy the rest of the backend files
COPY backend/ .

# Copy the built client files to the backend's public directory
COPY --from=build /app/client/build ./public

# Expose the port the app runs on
EXPOSE 3000

# Run the backend server
CMD ["node", "server.js"]