FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    tar \
    gzip \
    build-essential \
    libgl1-mesa-glx \
    libx11-6 \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# # Download and install AutoDock Tools (MGLTools)
# RUN mkdir -p /app/mgltools && \
#     wget -q http://mgltools.scripps.edu/downloads/downloads/tars/releases/REL1.5.6/mgltools_x86_64Linux2_1.5.6.tar.gz -O mgltools.tar.gz && \
#     tar -xzf mgltools.tar.gz -C /app/mgltools --strip-components=1 && \
#     rm mgltools.tar.gz

# # Download and install AutoDock Vina
# RUN mkdir -p /app/vina && \
#     wget -q https://vina.scripps.edu/wp-content/uploads/sites/55/2020/12/autodock_vina_1_1_2_linux_x86.tgz -O vina.tgz && \
#     tar -xzf vina.tgz -C /app/vina --strip-components=1 && \
#     rm vina.tgz

# Create directories for file storage
RUN mkdir -p /app/uploads /app/results

# Copy Python application files
COPY . .

# Expose port for Flask API
EXPOSE 5000

# Start the Flask application
CMD ["python", "app.py"]
