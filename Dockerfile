# Stage 1: Node.js application
FROM node:20-slim AS app-builder

WORKDIR /app

# Install system dependencies for build stage
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    python3.11-venv \
    git \
    # Add any other build-time dependencies for your Python packages if known
    # e.g., build-essential, libopenblas-dev if NumPy/SciPy need compilation
    && rm -rf /var/lib/apt/lists/*
RUN ln -s /usr/bin/python3 /usr/bin/python # Symlink for 'python' command

# Copy package files (important for npm install)
COPY package.json package-lock.json ./

# Copy the prisma directory before running npm install
COPY prisma ./prisma

# Install Node modules
RUN npm install

# Copy all application source code for building (this includes src/scripts)
COPY . .

# Generate Prisma client and build Next.js app
RUN npx prisma generate
RUN npm run build


# Stage 2: Final image with Vina tools and Next.js production build
FROM node:20-slim

WORKDIR /app

# Install system dependencies including any needed for Vina and Python runtime
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    wget \
    git \
    python3.11-venv \
    # Add build-essential for compiling numpy/scipy if needed (often required for complex Python libs)
    build-essential \
    libatlas-base-dev \
    && rm -rf /var/lib/apt/lists/*
RUN ln -s /usr/bin/python3 /usr/bin/python # Symlink for 'python' command

# Install AutoDockTools_py3 (which includes MolKit) and its dependencies
RUN python3 -m venv /opt/autodock_env
RUN /opt/autodock_env/bin/pip install --upgrade pip
RUN /opt/autodock_env/bin/pip install git+https://github.com/Valdes-Tresanco-MS/AutoDockTools_py3 \
    numpy # <--- ADDED NUMPY HERE!

# Set PYTHONPATH
ENV PATH="/opt/autodock_env/bin:$PATH"
ENV PYTHONPATH="/opt/autodock_env/lib/python3.11/site-packages:$PYTHONPATH"

# ... (rest of your Dockerfile) ...

# If you need AutoDock Vina, install it manually
RUN wget https://github.com/ccsb-scripps/AutoDock-Vina/releases/download/v1.2.5/vina_1.2.5_linux_x86_64 \
    && chmod +x vina_1.2.5_linux_x86_64 \
    && mv vina_1.2.5_linux_x86_64 /usr/local/bin/vina

# Copy built Next.js application from previous stage
COPY --from=app-builder /app/.next ./.next
COPY --from=app-builder /app/node_modules ./node_modules
COPY --from=app-builder /app/package.json ./package.json
COPY --from=app-builder /app/public ./public
COPY --from=app-builder /app/prisma ./prisma
COPY --from=app-builder /app/next.config.ts ./next.config.ts

# Copy the Python script and its containing directory structure
COPY --from=app-builder /app/src/scripts ./src/scripts

# Copy the Python script and its containing directory structure
COPY --from=app-builder /app/src/assets ./src/assets

EXPOSE 3000

# The standard Next.js production command
# Ensure your Node.js application is set up to call 'python3' or 'python'
# which now has MolKit available via the virtual environment and PYTHONPATH.
# If your Node.js app directly calls the Python script, it will now find the modules.
CMD ["/bin/sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run start"]