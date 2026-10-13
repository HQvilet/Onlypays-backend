# Use the official Node.js image with Alpine Linux for a lightweight footprint
FROM node:20-alpine

# Create and set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Copy the prisma directory so the schema is available for code generation
COPY prisma ./prisma/

# Install dependencies (including dev so we get the prisma CLI)
RUN npm install

# Generate the Prisma client
RUN npx prisma generate

# Remove devDependencies to keep the image lightweight
RUN npm prune --omit=dev

# Copy the remaining application files
COPY . .


# Expose the application port (defaults to 4001 as configured in the backend)
EXPOSE 4001

# Start the backend server using the start script (tsx src/server.ts)
CMD ["npm", "start"]
