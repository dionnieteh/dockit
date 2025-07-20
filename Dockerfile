# Stage 1: Node.js application build
FROM node:20-slim AS app-builder

WORKDIR /app

# Install system dependencies for build stage
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    python3.11-venv \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/bin/python3 /usr/bin/python

# Copy and install Node dependencies
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install Node modules
RUN npm ci --prefer-offline --no-audit

# Copy app source and build it
COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Generate Prisma client and build Next.js app
RUN npx prisma generate
RUN npm run build


# Stage 2: Runtime with Open Babel and AutoDockTools
FROM node:20-slim

WORKDIR /app

# Install required system packages, including build tools and Open Babel
RUN apt-get update && apt-get install -y \
    cmake \
    g++ \
    make \
    curl \
    python3 \
    python3-pip \
    wget \
    git \
    unzip \
    zlib1g-dev \
    libeigen3-dev \
    libboost-all-dev \
    python3-dev \
    python3.11-venv \
    build-essential \
    libatlas-base-dev \
    libxml2-dev \
    libopenmpi-dev \
    openbabel \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Optional: confirm obabel is installed (debug)
RUN obabel -:CC -O ethane.pdb -h

RUN ln -s /usr/bin/python3 /usr/bin/python

# Install AutoDockTools_py3 and dependencies in a virtual environment
RUN python3 -m venv /opt/autodock_env
RUN /opt/autodock_env/bin/pip install --upgrade pip
RUN /opt/autodock_env/bin/pip install git+https://github.com/Valdes-Tresanco-MS/AutoDockTools_py3 numpy

ENV PATH="/opt/autodock_env/bin:$PATH"
ENV PYTHONPATH="/opt/autodock_env/lib/python3.11/site-packages:$PYTHONPATH"

# Install AutoDock Vina
RUN wget https://github.com/ccsb-scripps/AutoDock-Vina/releases/download/v1.2.5/vina_1.2.5_linux_x86_64 \
    && chmod +x vina_1.2.5_linux_x86_64 \
    && mv vina_1.2.5_linux_x86_64 /usr/local/bin/vina

# Copy production build artifacts from app-builder stage
COPY --from=app-builder /app/.next ./.next
COPY --from=app-builder /app/node_modules ./node_modules
COPY --from=app-builder /app/package.json ./package.json
COPY --from=app-builder /app/public ./public
COPY --from=app-builder /app/prisma ./prisma
COPY --from=app-builder /app/next.config.ts ./next.config.ts
COPY --from=app-builder /app/src/scripts ./src/scripts
COPY --from=app-builder /app/src/assets ./src/assets

EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]
