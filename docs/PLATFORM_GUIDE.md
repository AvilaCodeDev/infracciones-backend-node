# 🚀 Deployment Platform Guide

## ⚠️ Error NIXPACKS_PATH - Solución por Plataforma

Si ves este error:
```
UndefinedVar: Usage of undefined variable '$NIXPACKS_PATH' (line 18)
```

**La solución depende de tu plataforma de deployment:**

---

## 📋 Selecciona tu Plataforma

### 🐳 Dokploy
**Usar**: `Dockerfile`

**Configuración**:
```json
// dokploy.json
{
  "buildType": "dockerfile",
  "dockerfile": "Dockerfile"
}
```

**Pasos**:
1. Configurar Build Type en Dokploy UI: **Dockerfile**
2. Dockerfile Path: `Dockerfile`
3. Redeploy

📖 **[Ver Guía Completa de Dokploy →](./DOKPLOY_SETUP.md)**

---

### 🚂 Railway
**Usar**: `nixpacks.toml`

**Configuración**:
```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "nixpacksConfigPath": "nixpacks.toml",
    "dockerfilePath": null
  }
}
```

**Pasos**:
1. Configurar Builder en Railway UI: **Nixpacks**
2. Nixpacks Config Path: `nixpacks.toml`
3. Redeploy

📖 **[Ver Guía Completa de Railway →](./RAILWAY_SETUP.md)**

---

### 🎨 Render
**Usar**: `Dockerfile`

**Configuración en Render**:
- Environment: **Docker**
- Dockerfile Path: `./Dockerfile`
- Start Command: `bun run index.js`

📖 **[Ver Guía General de Deployment →](./DEPLOYMENT_GUIDE.md)**

---

### ☁️ DigitalOcean App Platform
**Usar**: `Dockerfile`

**Configuración**:
- Build Command: (automático desde Dockerfile)
- Run Command: `bun run index.js`

📖 **[Ver Guía General de Deployment →](./DEPLOYMENT_GUIDE.md)**

---

### 🌊 Heroku
**Usar**: `Dockerfile` o Buildpack

**Opción 1 - Dockerfile**:
```bash
heroku stack:set container
git push heroku main
```

**Opción 2 - Buildpack**:
```bash
heroku buildpacks:set https://github.com/oven-sh/heroku-buildpack-bun
git push heroku main
```

📖 **[Ver Guía General de Deployment →](./DEPLOYMENT_GUIDE.md)**

---

## 🗂️ Archivos de Configuración

### Para Dokploy / Render / DigitalOcean (Docker)
```
✅ Dockerfile
✅ dokploy.json (solo Dokploy)
✅ .dockerignore
❌ nixpacks.toml (ignorar)
```

### Para Railway (Nixpacks)
```
✅ nixpacks.toml
✅ railway.json
✅ .railwayignore
❌ Dockerfile (ignorar)
```

---

## 🎯 Resumen Rápido

| Plataforma | Usar | Archivo Config | Guía |
|------------|------|----------------|------|
| **Dokploy** | Dockerfile | `dokploy.json` | [DOKPLOY_SETUP.md](./DOKPLOY_SETUP.md) |
| **Railway** | Nixpacks | `railway.json` | [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) |
| **Render** | Dockerfile | - | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) |
| **DigitalOcean** | Dockerfile | - | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) |
| **Heroku** | Dockerfile/Buildpack | - | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) |

---

## 🔧 Configuración Común

### Variables de Entorno (Todas las Plataformas)
```env
NODE_ENV=production
PORT=3000
JWT_KEY=tu_clave_secreta
DB_HOST=tu_host_mysql
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=infracciones_db
DB_PORT=3306
```

### Start Command (Todas las Plataformas)
```bash
bun run index.js
```

---

## 📚 Documentación Adicional

- **[BUN_GUIDE.md](./BUN_GUIDE.md)** - Guía completa de Bun
- **[API_GET_INFRACCION_BY_ID.md](./API_GET_INFRACCION_BY_ID.md)** - API de infracciones
- **[SISTEMA_FOLIOS.md](./SISTEMA_FOLIOS.md)** - Sistema de folios
- **[API_CREAR_INFRACCION.md](./API_CREAR_INFRACCION.md)** - Crear infracciones

---

## 💡 Recomendaciones

1. **Dokploy**: Usa Dockerfile para mejor compatibilidad
2. **Railway**: Usa Nixpacks para mejor integración
3. **Producción**: Considera AWS/GCP para mayor control
4. **Desarrollo**: Railway o Dokploy son excelentes opciones

---

## 🆘 ¿Necesitas Ayuda?

1. **Identifica tu plataforma** (Dokploy, Railway, etc.)
2. **Lee la guía específica** de esa plataforma
3. **Sigue el checklist** de configuración
4. **Verifica los logs** de deployment

---

**Última actualización**: 2026-01-13
