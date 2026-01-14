# 🚨 SOLUCIÓN URGENTE - Error NIXPACKS_PATH en Dokploy

## ⚠️ Problema
Dokploy está **ignorando** tu `Dockerfile` y `dokploy.json`, y está generando automáticamente su propio Dockerfile con Nixpacks, causando el error:

```
UndefinedVar: Usage of undefined variable '$NIXPACKS_PATH' (line 18)
```

## ✅ SOLUCIÓN: Configurar Manualmente en Dokploy UI

**Dokploy NO lee archivos de configuración automáticamente**. Debes configurarlo manualmente en la interfaz web.

---

## 📋 Pasos EXACTOS para Configurar Dokploy

### 1. Acceder a tu Aplicación en Dokploy

1. Abre Dokploy en tu navegador
2. Ve a tu proyecto/aplicación
3. Click en **Settings** o **Configuración**

### 2. Configurar el Build Method

**IMPORTANTE**: Esta es la configuración clave.

1. Busca la sección **Build Settings** o **Build Configuration**
2. Encuentra la opción **Build Method** o **Builder Type**
3. **Selecciona**: `Dockerfile` o `Docker`
   - **NO selecciones**: Nixpacks, Auto, o Buildpack
4. En **Dockerfile Path**, escribe: `Dockerfile`
5. En **Build Context**, escribe: `.` (punto)

### 3. Deshabilitar Nixpacks (Si existe la opción)

Si ves una opción para Nixpacks:
- **Nixpacks**: `Disabled` o `Off`
- **Auto-detect**: `Disabled` o `Off`

### 4. Configurar Variables de Entorno

En la sección **Environment Variables**:

```env
NODE_ENV=production
PORT=3000
JWT_KEY=tu_clave_secreta_aqui
DB_HOST=tu_host_mysql
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=infracciones_db
DB_PORT=3306
```

### 5. Configurar Puerto

En la sección **Network** o **Ports**:
- **Container Port**: `3000`
- **Exposed Port**: `3000` (o el que prefieras)

### 6. Configurar Start Command (Opcional)

Si hay una opción para **Start Command** o **Run Command**:
```bash
bun run index.js
```

### 7. Guardar y Redeploy

1. Click en **Save** o **Guardar**
2. Click en **Redeploy** o **Deploy**
3. Monitorea los logs

---

## 🔍 Verificar Configuración Correcta

En los logs de build, deberías ver:

```
✓ Building with Dockerfile
✓ Step 1/9 : FROM oven/bun:1
✓ Step 2/9 : WORKDIR /app
✓ Step 3/9 : COPY package.json bun.lock* ./
✓ Step 4/9 : RUN bun install
✓ Successfully installed packages
✓ Build complete
```

**NO deberías ver**:
```
✗ Using Nixpacks
✗ Generating Dockerfile
✗ NIXPACKS_PATH
```

---

## 🐛 Si Sigue Fallando

### Opción A: Eliminar Nixpacks del Proyecto Temporalmente

1. **Renombrar archivos de Nixpacks**:
   ```bash
   git mv nixpacks.toml nixpacks.toml.disabled
   git mv railway.json railway.json.disabled
   git commit -m "Disable Nixpacks for Dokploy"
   git push
   ```

2. **Redeploy en Dokploy**

3. **Restaurar después** (si usas Railway):
   ```bash
   git mv nixpacks.toml.disabled nixpacks.toml
   git mv railway.json.disabled railway.json
   git commit -m "Re-enable Nixpacks for Railway"
   git push
   ```

### Opción B: Usar Docker Compose

Si Dokploy soporta Docker Compose, crea `docker-compose.yml`:

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
      - JWT_KEY=${JWT_KEY}
      - DB_HOST=${DB_HOST}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
      - DB_PORT=${DB_PORT}
    volumes:
      - uploads:/app/uploads

volumes:
  uploads:
```

Luego en Dokploy:
1. Build Method: **Docker Compose**
2. Compose File: `docker-compose.yml`

### Opción C: Contactar Soporte de Dokploy

Si nada funciona, puede ser un bug de Dokploy. Contacta su soporte con:
- Logs del error
- Tu configuración
- Versión de Dokploy

---

## 📸 Capturas de Pantalla de Configuración

### Build Settings debería verse así:

```
┌─────────────────────────────────────┐
│ Build Settings                      │
├─────────────────────────────────────┤
│ Build Method:     [Dockerfile ▼]    │
│ Dockerfile Path:  Dockerfile        │
│ Build Context:    .                 │
│ Nixpacks:         [ ] Enabled       │
└─────────────────────────────────────┘
```

---

## 🎯 Checklist de Configuración

- [ ] Build Method = `Dockerfile` (NO Nixpacks)
- [ ] Dockerfile Path = `Dockerfile`
- [ ] Build Context = `.`
- [ ] Nixpacks deshabilitado (si existe la opción)
- [ ] Variables de entorno configuradas
- [ ] Puerto 3000 configurado
- [ ] Guardado y redeployado
- [ ] Logs verificados

---

## 💡 Alternativa: Usar Otra Plataforma

Si Dokploy sigue dando problemas, considera:

### Railway (Usa Nixpacks nativamente)
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render (Usa Dockerfile)
1. Conecta tu repo en render.com
2. Selecciona "Docker"
3. Deploy automático

### DigitalOcean App Platform
1. Conecta tu repo
2. Detecta Dockerfile automáticamente
3. Deploy

---

## 📞 Necesitas Ayuda Urgente?

1. **Verifica la versión de Dokploy**: Algunas versiones tienen bugs con Nixpacks
2. **Revisa la documentación de Dokploy**: Puede haber cambiado la UI
3. **Busca en Discord/Foros de Dokploy**: Otros pueden tener el mismo problema

---

## ✅ Resumen

**El problema**: Dokploy ignora tu Dockerfile y usa Nixpacks automáticamente.

**La solución**: Configurar manualmente en la UI de Dokploy:
1. Build Method → **Dockerfile**
2. Dockerfile Path → **Dockerfile**
3. Nixpacks → **Disabled**
4. Redeploy

**Si no funciona**: Considera usar Railway, Render, o DigitalOcean que tienen mejor soporte para Dockerfile.

---

**Última actualización**: 2026-01-13 22:12
