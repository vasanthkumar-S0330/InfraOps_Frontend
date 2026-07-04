# Stage 1: Build the Vue application
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application for production
# (The VITE_API_URL should be passed as a build argument or handled by the environment)
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine AS production-stage

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from build-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
