# 🐳 Configuración de Dokploy para Bun

## ⚠️ Error NIXPACKS_PATH en Dokploy - SOLUCIONADO

Si ves este error en Dokploy:
```
UndefinedVar: Usage of undefined variable '$NIXPACKS_PATH' (line 18)
```

**Causa**: Dokploy está intentando usar Nixpacks automáticamente en lugar del Dockerfile.

**Solución**: Configurar Dokploy para usar el Dockerfile directamente.

---

## 🚀 Configuración en Dokploy

### Método 1: Configuración en la UI de Dokploy (Recomendado)

1. **Ir a tu aplicación en Dokploy**
   - Dashboard → Tu Aplicación

2. **Configurar Build Settings**
   - Settings → Build
   - **Build Type**: `Dockerfile`
   - **Dockerfile Path**: `Dockerfile`
   - **Build Context**: `.` (raíz del proyecto)

3. **Configurar Variables de Entorno**
   - Settings → Environment Variables
   - Agregar:
     ```
     NODE_ENV=production
     PORT=3000
     JWT_KEY=tu_clave_secreta
     DB_HOST=tu_host_mysql
     DB_USER=tu_usuario
     DB_PASSWORD=tu_password
     DB_NAME=infracciones_db
     DB_PORT=3306
     ```

4. **Configurar Puerto**
   - Settings → Network
   - **Port**: `3000`

5. **Redeploy**
   - Deployments → Redeploy

### Método 2: Archivo de Configuración `dokploy.json`

He creado el archivo `dokploy.json` que fuerza el uso de Dockerfile:

```json
{
  "buildType": "dockerfile",
  "dockerfile": "Dockerfile"
}
```

Dokploy detectará automáticamente este archivo.

---

## 📋 Dockerfile Optimizado para Dokploy

El `Dockerfile` ya está configurado correctamente:

```dockerfile
# Dockerfile para Dokploy, Render, DigitalOcean, etc.
# Railway debe usar nixpacks.toml en su lugar

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
```

---

## 🔍 Verificar Configuración

### En los logs de Dokploy deberías ver:

```
✓ Building with Dockerfile
✓ FROM oven/bun:1
✓ Installing dependencies: bun install --frozen-lockfile
✓ Build successful
✓ Starting container
✓ Running: bun run index.js
✓ Server running on port 3000
```

### NO deberías ver:

```
✗ Using Nixpacks
✗ NIXPACKS_PATH error
✗ Variable undefined
```

---

## 🐛 Troubleshooting

### Error: Dokploy sigue usando Nixpacks

**Solución 1**: Forzar Dockerfile en la UI
1. Settings → Build
2. Build Type: **Dockerfile** (no Nixpacks/Auto)
3. Save y Redeploy

**Solución 2**: Eliminar archivos de Nixpacks temporalmente
```bash
git mv nixpacks.toml nixpacks.toml.backup
git commit -m "Disable nixpacks for Dokploy"
git push
```

**Solución 3**: Usar Docker Compose (si Dokploy lo soporta)
Crear `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
```

### Error: "bun: command not found"

Verifica que el Dockerfile use la imagen correcta:
```dockerfile
FROM oven/bun:1  # ← Debe ser esta imagen oficial
```

### Error: "Cannot find bun.lock"

Si no tienes `bun.lock`, modifica el Dockerfile:
```dockerfile
COPY package.json ./
# Elimina: bun.lock*
```

O genera el lock file:
```bash
bun install
git add bun.lock
git commit -m "Add bun.lock"
git push
```

### Error: Puerto no accesible

Verifica que:
1. El Dockerfile expone el puerto 3000: `EXPOSE 3000`
2. Dokploy está configurado para el puerto 3000
3. La variable `PORT` está configurada

---

## 📊 Comparativa: Nixpacks vs Dockerfile

| Aspecto | Nixpacks | Dockerfile |
|---------|----------|------------|
| **Dokploy** | ⚠️ Problemas con variables | ✅ Funciona perfectamente |
| **Control** | Limitado | Total |
| **Velocidad** | Rápido | Rápido |
| **Debugging** | Difícil | Fácil |
| **Recomendado para Dokploy** | ❌ No | ✅ Sí |

---

## 🎯 Checklist de Configuración

- [ ] `Dockerfile` existe y está configurado
- [ ] `dokploy.json` tiene `"buildType": "dockerfile"`
- [ ] Build Type en Dokploy UI está en "Dockerfile"
- [ ] Variables de entorno configuradas
- [ ] Puerto 3000 configurado
- [ ] Redeploy realizado

---

## 🔄 Pasos para Deploy

1. **Commit los cambios**:
   ```bash
   git add Dockerfile dokploy.json
   git commit -m "Configure Dokploy to use Dockerfile with Bun"
   git push origin main
   ```

2. **Configurar en Dokploy UI**:
   - Build Type: Dockerfile
   - Dockerfile Path: Dockerfile

3. **Agregar variables de entorno**

4. **Deploy**

---

## 📦 Estructura de Archivos para Dokploy

```
infracciones-backend-node/
├── Dockerfile              ← Usar este para Dokploy
├── dokploy.json            ← Configuración de Dokploy
├── package.json            ← Scripts de Bun
├── bun.lock                ← Lock file de Bun
├── .dockerignore           ← Optimización
├── nixpacks.toml           ← Solo para Railway
└── railway.json            ← Solo para Railway
```

---

## 🌐 Acceso a la Aplicación

Una vez deployado:

```
https://tu-app.dokploy.com/api-node/infracciones/getTiposInfraccion
```

---

## 💾 Persistencia de Archivos (Uploads)

⚠️ **IMPORTANTE**: Dokploy puede tener filesystem efímero.

### Solución: Usar Volúmenes

En Dokploy UI:
1. Settings → Volumes
2. Add Volume:
   - **Container Path**: `/app/uploads`
   - **Volume Name**: `infracciones-uploads`

O en `docker-compose.yml`:
```yaml
services:
  app:
    volumes:
      - infracciones-uploads:/app/uploads

volumes:
  infracciones-uploads:
```

---

## 🔗 Recursos

- [Dokploy Documentation](https://docs.dokploy.com)
- [Bun Docker Image](https://hub.docker.com/r/oven/bun)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

---

## ✅ Resumen

**Para Dokploy**:
- ✅ Usar `Dockerfile` (NO Nixpacks)
- ✅ Configurar Build Type como "Dockerfile"
- ✅ El archivo `dokploy.json` fuerza esta configuración
- ✅ El error de `NIXPACKS_PATH` está resuelto

**Para Railway**:
- ✅ Usar `nixpacks.toml` (NO Dockerfile)
- ✅ Ver `docs/RAILWAY_SETUP.md`

Cada plataforma tiene su configuración óptima. 🎉
