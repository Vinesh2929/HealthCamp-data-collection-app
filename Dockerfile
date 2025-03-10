# Use Node.js as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (for caching)
COPY server/package*.json ./ 

# Install backend dependencies
RUN npm install

# Copy the entire project (frontend + backend)
COPY . .

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start the backend
CMD ["node", "server/server.js"]

