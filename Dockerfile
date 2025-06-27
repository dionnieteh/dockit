FROM ghcr.io/metaphorme/vina-all:v1.2.5

# Install Node.js
RUN apt-get update && apt-get install -y curl \
 && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get install -y nodejs

WORKDIR /app

# Install Node modules
COPY package.json package-lock.json ./
RUN npm install

# Generate Prisma client & build app
COPY . .
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
