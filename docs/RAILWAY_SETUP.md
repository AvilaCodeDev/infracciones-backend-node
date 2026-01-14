# 🚂 Configuración de Railway para Bun

## ⚠️ IMPORTANTE: Error NIXPACKS_PATH Resuelto

Si ves el error:
```
UndefinedVar: Usage of undefined variable '$NIXPACKS_PATH' (line 18)
```

**Solución**: Railway debe usar `nixpacks.toml`, NO el Dockerfile.

## 📋 Archivos de Configuración

### 1. `nixpacks.toml` (USAR ESTE)
Este es el archivo principal que Railway debe usar:

```toml
[phases.setup]
nixPkgs = ['bun']

[phases.install]
cmds = ['bun install --frozen-lockfile']

[phases.build]
cmds = ['mkdir -p uploads/evidencias']

[start]
cmd = 'bun run index.js'

[variables]
NODE_ENV = 'production'
```

### 2. `railway.json`
Configuración que fuerza el uso de Nixpacks:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "nixpacksConfigPath": "nixpacks.toml",
    "dockerfilePath": null
  },
  "deploy": {
    "startCommand": "bun run index.js"
  }
}
```

### 3. `.railwayignore`
Ignora el Dockerfile para que Railway use solo nixpacks:

```
Dockerfile
Dockerfile.*
```

## 🚀 Pasos para Deploy en Railway

### Opción A: Desde la UI de Railway (Recomendado)

1. **Ir a tu proyecto en Railway**
   - Dashboard → Tu Proyecto

2. **Configurar el Builder**
   - Settings → Build
   - **Builder**: Nixpacks
   - **Nixpacks Config Path**: `nixpacks.toml`
   - **Dockerfile Path**: (dejar vacío o poner `null`)

3. **Verificar Start Command**
   - Settings → Deploy
   - **Start Command**: `bun run index.js`

4. **Configurar Variables de Entorno**
   - Variables → New Variable
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

5. **Trigger Deploy**
   - Deployments → Redeploy

### Opción B: Desde Git (Automático)

1. **Commit los archivos de configuración**
   ```bash
   git add nixpacks.toml railway.json .railwayignore
   git commit -m "Configure Railway to use Bun with Nixpacks"
   git push origin main
   ```

2. **Railway detectará automáticamente**
   - Leerá `railway.json`
   - Usará `nixpacks.toml`
   - Ignorará `Dockerfile`

## 🔍 Verificar que Railway use Nixpacks

En los logs de build, deberías ver:

```
✓ Using Nixpacks
✓ Reading nixpacks.toml
✓ Installing bun
✓ Running: bun install --frozen-lockfile
✓ Build successful
✓ Starting: bun run index.js
```

**NO deberías ver**:
```
✗ Using Dockerfile
✗ RUN --mount=type=cache...
✗ NIXPACKS_PATH error
```

## 🐛 Troubleshooting

### Error: Railway sigue usando Dockerfile

**Solución 1**: Eliminar Dockerfile temporalmente
```bash
git mv Dockerfile Dockerfile.backup
git commit -m "Temporarily remove Dockerfile"
git push
```

**Solución 2**: Configurar manualmente en Railway UI
1. Settings → Build
2. Builder: **Nixpacks** (no Docker)
3. Nixpacks Config Path: `nixpacks.toml`
4. Save

**Solución 3**: Usar Railway CLI
```bash
railway up --nixpacks
```

### Error: "bun: command not found"

Verifica que `nixpacks.toml` tenga:
```toml
[phases.setup]
nixPkgs = ['bun']
```

### Error: "Cannot find module"

Verifica que la fase de instalación esté correcta:
```toml
[phases.install]
cmds = ['bun install --frozen-lockfile']
```

## 📊 Logs Esperados

### Build exitoso:
```
[nixpacks] Setting up Bun...
[nixpacks] Installing dependencies...
[nixpacks] bun install --frozen-lockfile
[nixpacks] ✓ 24 packages installed
[nixpacks] Creating uploads directory...
[nixpacks] Build complete!
```

### Deploy exitoso:
```
[deploy] Starting application...
[deploy] bun run index.js
[deploy] Server running on port 3000
[deploy] ✓ Deployment successful
```

## 🎯 Checklist de Configuración

- [ ] `nixpacks.toml` existe y está configurado
- [ ] `railway.json` tiene `"builder": "NIXPACKS"`
- [ ] `.railwayignore` incluye `Dockerfile`
- [ ] Variables de entorno configuradas en Railway
- [ ] Start command es `bun run index.js`
- [ ] Builder en Railway UI está en "Nixpacks"

## 🔗 Referencias

- [Railway Nixpacks Docs](https://docs.railway.app/deploy/builders/nixpacks)
- [Nixpacks Configuration](https://nixpacks.com/docs/configuration)
- [Bun Documentation](https://bun.sh/docs)

## 💡 Alternativa: Usar Dockerfile en Otras Plataformas

Si quieres usar Docker en Render, DigitalOcean, etc.:

1. **Renombrar el Dockerfile**:
   ```bash
   mv Dockerfile.manual Dockerfile
   ```

2. **Configurar la plataforma** para usar Docker

3. **El Dockerfile ya está optimizado para Bun**

---

**Resumen**: Railway debe usar `nixpacks.toml` (no Dockerfile) para evitar el error de `NIXPACKS_PATH`.
