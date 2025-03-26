# Use the official Node.js image as the base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml (or package-lock.json) to install dependencies
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install --production

# Copy the entire project to the container
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the application port
EXPOSE 5000

# Run the application
CMD ["npm", "run", "start"]
