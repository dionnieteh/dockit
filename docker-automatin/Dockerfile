# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for bcrypt
RUN apk add --no-cache python3 make g++

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Run the application
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install dependencies for bcrypt
RUN apk add --no-cache python3 make g++

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set the correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Set the environment variable for the port
ENV PORT 3000
# Disable telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED 1

# Command to run the application
CMD ["node", "server.js"]
