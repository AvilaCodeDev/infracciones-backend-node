# Dockerfile para Dokploy, Render, DigitalOcean, etc.
# Railway debe usar nixpacks.toml en su lugar

FROM oven/bun:1

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json bun.lock* ./

# Instalar dependencias
RUN bun install

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
