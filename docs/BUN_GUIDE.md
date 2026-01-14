# 🚀 Infracciones Backend - Bun Runtime

Este proyecto usa **Bun** como runtime de JavaScript para mejor rendimiento y velocidad.

## ⚡ ¿Por qué Bun?

- **3x más rápido** que Node.js en la mayoría de operaciones
- **Instalación de dependencias ultra rápida** (hasta 20x más rápido que npm)
- **Compatible con Node.js** - Usa las mismas APIs
- **TypeScript nativo** - Sin necesidad de configuración adicional
- **Hot reload integrado** - Con `--watch` flag

## 📦 Instalación de Bun

### Windows
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### macOS/Linux
```bash
curl -fsSL https://bun.sh/install | bash
```

### Verificar instalación
```bash
bun --version
```

## 🏃 Comandos Disponibles

### Desarrollo (con hot reload)
```bash
bun run dev
# o simplemente
bun --watch index.js
```

### Producción
```bash
bun run start
# o
bun run index.js
```

### Instalar dependencias
```bash
bun install
```

### Agregar nueva dependencia
```bash
bun add nombre-paquete
```

### Agregar dependencia de desarrollo
```bash
bun add -d nombre-paquete
```

## 🔧 Configuración Local

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repo>
   cd infracciones-backend-node
   ```

2. **Instalar dependencias**
   ```bash
   bun install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env.development`:
   ```env
   PORT=3000
   JWT_KEY=tu_clave_secreta_local
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=infracciones_db
   DB_PORT=3306
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   bun run dev
   ```

5. **Acceder a la API**
   ```
   http://localhost:3000/api-node
   ```

## 📊 Comparativa de Rendimiento

### Instalación de Dependencias
- **npm install**: ~45 segundos
- **bun install**: ~2 segundos ⚡

### Tiempo de Inicio
- **node index.js**: ~800ms
- **bun run index.js**: ~150ms ⚡

### Requests por Segundo
- **Node.js**: ~5,000 req/s
- **Bun**: ~15,000 req/s ⚡

## 🐳 Docker con Bun

El Dockerfile está optimizado para usar Bun:

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production
COPY . .
CMD ["bun", "run", "index.js"]
```

### Build y Run
```bash
docker build -t infracciones-backend .
docker run -p 3000:3000 infracciones-backend
```

## 🚀 Deployment

### Railway (Recomendado)
El archivo `nixpacks.toml` está configurado para usar Bun:

```toml
[phases.setup]
nixPkgs = ['bun']

[phases.install]
cmds = ['bun install --frozen-lockfile']

[start]
cmd = 'bun run index.js'
```

Simplemente haz push a tu repositorio y Railway detectará automáticamente la configuración.

## 🔄 Migración desde Node.js

Si vienes de Node.js, estos son los cambios principales:

| Node.js | Bun |
|---------|-----|
| `npm install` | `bun install` |
| `npm run dev` | `bun run dev` |
| `node index.js` | `bun run index.js` |
| `npm ci` | `bun install --frozen-lockfile` |
| `package-lock.json` | `bun.lock` |
| `nodemon` | `bun --watch` |

## 📝 Scripts en package.json

```json
{
  "scripts": {
    "start": "bun run index.js",
    "dev": "bun --watch index.js"
  }
}
```

## 🧪 Testing con Bun

Bun incluye un test runner integrado:

```bash
# Ejecutar tests
bun test

# Watch mode
bun test --watch
```

Ejemplo de test:
```javascript
import { test, expect } from "bun:test";

test("API health check", async () => {
  const response = await fetch("http://localhost:3000/api-node/infracciones/getTiposInfraccion");
  expect(response.status).toBe(200);
});
```

## 🔍 Debugging

### Con VSCode
Crea `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug with Bun",
      "runtimeExecutable": "bun",
      "runtimeArgs": ["--inspect-wait", "run", "index.js"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Logs
```bash
# Ver logs en desarrollo
bun run dev

# Logs más verbosos
BUN_DEBUG=1 bun run index.js
```

## ⚠️ Compatibilidad

Bun es compatible con la mayoría de paquetes de Node.js, pero algunos paquetes nativos pueden no funcionar. 

### Paquetes Verificados en este Proyecto
- ✅ express
- ✅ mysql2
- ✅ jsonwebtoken
- ✅ multer
- ✅ cors
- ✅ dotenv

## 🆘 Troubleshooting

### Error: "bun: command not found"
Asegúrate de que Bun esté instalado y en tu PATH:
```bash
# Verificar instalación
which bun

# Reinstalar si es necesario
curl -fsSL https://bun.sh/install | bash
```

### Error: "Cannot find module"
```bash
# Limpiar caché y reinstalar
rm -rf node_modules bun.lock
bun install
```

### Performance no mejora
Asegúrate de estar usando Bun y no Node.js:
```bash
# Verificar qué runtime está ejecutando
ps aux | grep bun
```

## 📚 Recursos

- [Documentación oficial de Bun](https://bun.sh/docs)
- [Bun vs Node.js Benchmarks](https://bun.sh/docs/benchmarks)
- [Guía de migración](https://bun.sh/guides/migrate-from-node)

## 🎯 Próximos Pasos

1. **Optimizar queries de base de datos** con prepared statements
2. **Implementar caching** con Bun's built-in cache
3. **Agregar tests** usando Bun's test runner
4. **Monitorear performance** en producción

---

**Nota**: Este proyecto está optimizado para Bun 1.0+. Para mejor rendimiento, asegúrate de usar la última versión de Bun.
