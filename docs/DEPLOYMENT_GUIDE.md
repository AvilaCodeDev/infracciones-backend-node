# Guía de Deployment - Infracciones Backend (Bun)

## 🚀 Opciones de Deployment

### Opción 1: Railway (Recomendado)

Railway usa Nixpacks por defecto. He creado los archivos de configuración necesarios para usar **Bun** como runtime:

#### Archivos Creados:
- `nixpacks.toml` - Configuración de Nixpacks con Bun
- `railway.json` - Configuración de Railway
- `Dockerfile` - Dockerfile con Bun (opcional)

#### Pasos para Deploy en Railway:

1. **Conectar Repositorio**
   ```bash
   # Asegúrate de que tu código esté en GitHub
   git add .
   git commit -m "Add Bun deployment configuration"
   git push origin main
   ```

2. **Crear Proyecto en Railway**
   - Ve a [railway.app](https://railway.app)
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Selecciona tu repositorio

3. **Configurar Variables de Entorno**
   En Railway, ve a Variables y agrega:
   ```
   NODE_ENV=production
   PORT=3000
   JWT_KEY=tu_clave_secreta_jwt
   DB_HOST=tu_host_mysql
   DB_USER=tu_usuario_mysql
   DB_PASSWORD=tu_password_mysql
   DB_NAME=tu_database_name
   DB_PORT=3306
   ```

4. **Deploy Automático**
   - Railway detectará automáticamente que es un proyecto con Bun
   - Usará `nixpacks.toml` para la configuración
   - El deploy se iniciará automáticamente con `bun run index.js`

#### Solución al Error de NIXPACKS_PATH

El error que viste:
```
UndefinedVar: Usage of undefined variable '$NIXPACKS_PATH' (line 18)
```

Se resuelve con el archivo `nixpacks.toml` que define correctamente las fases de build sin usar variables no definidas.

---

### Opción 2: Docker (Render, DigitalOcean, AWS, etc.)

Si prefieres usar Docker directamente:

#### 1. Build Local (Prueba)
```bash
# Construir imagen
docker build -t infracciones-backend .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e JWT_KEY=tu_clave_secreta \
  -e DB_HOST=tu_host \
  -e DB_USER=tu_usuario \
  -e DB_PASSWORD=tu_password \
  -e DB_NAME=tu_database \
  infracciones-backend
```

#### 2. Deploy en Render
1. Conecta tu repositorio en [render.com](https://render.com)
2. Selecciona "New Web Service"
3. Configura:
   - **Environment**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Build Command**: (automático)
   - **Start Command**: `bun run index.js`

4. Agrega variables de entorno en Render

---

### Opción 3: Heroku

```bash
# Login a Heroku
heroku login

# Crear app
heroku create infracciones-backend

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set JWT_KEY=tu_clave_secreta
heroku config:set DB_HOST=tu_host
heroku config:set DB_USER=tu_usuario
heroku config:set DB_PASSWORD=tu_password
heroku config:set DB_NAME=tu_database

# Deploy
git push heroku main
```

---

## 📋 Variables de Entorno Requeridas

Asegúrate de configurar estas variables en tu plataforma de deployment:

```env
# Aplicación
NODE_ENV=production
PORT=3000

# JWT
JWT_KEY=tu_clave_secreta_muy_segura

# Base de Datos MySQL
DB_HOST=tu_host_mysql
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=infracciones_db
DB_PORT=3306
```

---

## 🗂️ Persistencia de Archivos (Uploads)

⚠️ **IMPORTANTE**: Los archivos subidos (evidencias fotográficas) se almacenan en `uploads/evidencias/`.

### Problema en Plataformas Efímeras
Railway, Heroku, y Render tienen sistemas de archivos efímeros. Los archivos subidos se perderán en cada redeploy.

### Soluciones:

#### Opción A: Almacenamiento en la Nube (Recomendado)
Migrar a un servicio de almacenamiento como:
- **AWS S3**
- **Cloudinary**
- **Google Cloud Storage**
- **Azure Blob Storage**

#### Opción B: Volúmenes Persistentes
Si usas Railway:
```bash
# Railway soporta volúmenes persistentes
# Configurar en railway.json o en la UI
```

#### Opción C: Base de Datos (No Recomendado)
Almacenar imágenes como BLOB en MySQL (no escalable)

---

## 🔍 Verificación Post-Deploy

Una vez deployado, verifica:

### 1. Health Check
```bash
curl https://tu-app.railway.app/api-node/infracciones/getTiposInfraccion
```

### 2. Test de Autenticación
```bash
curl -X POST https://tu-app.railway.app/api-node/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```

### 3. Logs
```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# Render
# Ver en la UI de Render
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
- Asegúrate de que `package.json` tenga todas las dependencias
- Verifica que `bun install` se ejecute correctamente

### Error: "Database connection failed"
- Verifica las variables de entorno de la base de datos
- Asegúrate de que la base de datos esté accesible desde internet
- Verifica el firewall/whitelist de IPs

### Error: "Port already in use"
- Railway asigna el puerto automáticamente
- Usa `process.env.PORT` en tu código (ya está configurado)

### Error: "NIXPACKS_PATH undefined"
- Usa el archivo `nixpacks.toml` proporcionado
- O cambia a Dockerfile en la configuración de Railway

---

## 📦 Archivos de Configuración Creados

1. **`Dockerfile`** - Para deployment con Docker
2. **`nixpacks.toml`** - Para Railway/Nixpacks
3. **`railway.json`** - Configuración específica de Railway
4. **`.dockerignore`** - Optimización de build de Docker

---

## 🔄 CI/CD Automático

Con Railway o Render, cada push a `main` triggerea un deploy automático:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Deploy automático iniciado
```

---

## 📊 Monitoreo

### Railway
- Dashboard con métricas de CPU, memoria, requests
- Logs en tiempo real
- Alertas automáticas

### Render
- Métricas de rendimiento
- Health checks automáticos
- Notificaciones de deploy

---

## 💡 Recomendaciones

1. **Usa Railway para desarrollo/staging** - Fácil y rápido
2. **Migra a AWS/GCP para producción** - Más control y escalabilidad
3. **Implementa almacenamiento en la nube** - Para las evidencias fotográficas
4. **Configura backups automáticos** - De la base de datos
5. **Usa variables de entorno** - Nunca hardcodees credenciales
6. **Implementa logging** - Winston o similar para producción
7. **Configura HTTPS** - Railway y Render lo proveen automáticamente

---

## 🎯 Siguiente Paso Recomendado

Para resolver el problema de almacenamiento de evidencias fotográficas, te recomiendo:

1. **Crear cuenta en Cloudinary** (gratis hasta 25GB)
2. **Instalar SDK**:
   ```bash
   bun add cloudinary multer-storage-cloudinary
   ```
3. **Modificar `middlewares/upload.js`** para usar Cloudinary en lugar del filesystem local

¿Necesitas ayuda para implementar esto?
