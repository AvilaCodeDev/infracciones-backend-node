# ⚠️ IMPORTANTE: Railway debe usar nixpacks.toml, NO este Dockerfile
# Este Dockerfile es solo para deployment manual con Docker (Render, DigitalOcean, etc.)

FROM oven/bun:1

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json bun.lock* ./

# Instalar dependencias
RUN bun install --frozen-lockfile

# Copiar código fuente
COPY . .

# Crear directorio para uploads
RUN mkdir -p uploads/evidencias

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Iniciar aplicación
CMD ["bun", "run", "index.js"]
