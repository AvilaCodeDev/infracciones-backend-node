# 📸 Configuración de Cloudinary para Almacenamiento de Imágenes

## ✅ Implementación Completada

El sistema ahora usa **Cloudinary** para almacenar las evidencias fotográficas de las infracciones, resolviendo el problema de filesystem efímero en Dokploy y otros servicios de contenedores.

---

## 🎯 Flujo de Trabajo

### 1. **Registro de Infracción** (`POST /api-node/infracciones/registrarInfraccion`)

```
Cliente → Multer (memoria) → Validación → Inserción en BD → Cloudinary → Respuesta
```

**Pasos**:
1. Cliente envía imágenes (hasta 4)
2. Multer las almacena en memoria (buffer)
3. Se validan los datos
4. **Se inserta la infracción en la base de datos**
5. **Solo si la inserción es exitosa**, se suben las imágenes a Cloudinary
6. Se retorna la respuesta con URLs de Cloudinary

**Ventajas**:
- ✅ No se suben imágenes si la transacción falla
- ✅ Rollback automático si hay error
- ✅ Imágenes persistentes (no se pierden en redeploy)

### 2. **Consulta de Infracción** (`POST /api-node/infracciones/getInfraccionById`)

```
Cliente → Consulta BD → Obtener folio → Consultar Cloudinary → Respuesta con URLs
```

**Pasos**:
1. Se consulta la infracción en la base de datos
2. Se obtiene el folio
3. Se consultan las imágenes en Cloudinary usando el folio
4. Se retornan las URLs de las imágenes

---

## 🔧 Configuración

### 1. Crear Cuenta en Cloudinary

1. Ve a [cloudinary.com](https://cloudinary.com)
2. Crea una cuenta gratuita (25GB gratis)
3. Ve al Dashboard
4. Copia tus credenciales:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Configurar Variables de Entorno

#### En Desarrollo (`.env.development`):

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

#### En Dokploy:

1. Ve a tu aplicación en Dokploy
2. Settings → Environment Variables
3. Agrega:

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

4. Redeploy

---

## 📁 Estructura de Almacenamiento en Cloudinary

```
cloudinary/
└── infracciones/
    ├── 1234567890/
    │   ├── evidencia-1-1234567890.jpg
    │   ├── evidencia-2-1234567891.jpg
    │   ├── evidencia-3-1234567892.jpg
    │   └── evidencia-4-1234567893.jpg
    ├── 9876543210/
    │   ├── evidencia-1-9876543210.jpg
    │   └── evidencia-2-9876543211.jpg
    └── ...
```

Cada folio tiene su propia carpeta con hasta 4 evidencias.

---

## 📊 Formato de Respuesta

### Crear Infracción (Exitoso):

```json
{
  "ok": true,
  "response": "Infracción creada exitosamente con evidencias",
  "data": {
    "folio": "1234567890",
    "id": 123,
    "evidencias": [
      {
        "index": 1,
        "url": "https://res.cloudinary.com/tu-cloud/image/upload/v1234567890/infracciones/1234567890/evidencia-1-1234567890.jpg",
        "public_id": "infracciones/1234567890/evidencia-1-1234567890",
        "width": 1920,
        "height": 1080,
        "size": 245678
      },
      // ... hasta 4 evidencias
    ]
  },
  "token": "nuevo_token_jwt"
}
```

### Consultar Infracción:

```json
{
  "ok": true,
  "data": {
    "id": 123,
    "folio": "1234567890",
    "placa": "ABC123",
    // ... otros campos ...
    "evidencias": [
      {
        "index": 1,
        "url": "https://res.cloudinary.com/...",
        "public_id": "infracciones/1234567890/evidencia-1-...",
        "width": 1920,
        "height": 1080,
        "format": "jpg",
        "size": 245678,
        "created_at": "2026-01-14T00:00:00Z"
      }
    ]
  },
  "token": "nuevo_token_jwt"
}
```

---

## 🔄 Manejo de Errores

### Error al Subir a Cloudinary (después de inserción exitosa):

```json
{
  "ok": true,
  "response": "Infracción creada pero hubo un error al subir las evidencias",
  "warning": "Las imágenes no se pudieron subir a Cloudinary",
  "data": {
    "folio": "1234567890",
    "id": 123,
    "evidencias": []
  }
}
```

La infracción se guarda en la BD pero sin imágenes. Puedes implementar un sistema de reintento o permitir subir las imágenes después.

---

## 🧪 Pruebas

### Con cURL:

```bash
curl -X POST http://localhost:3000/api-node/infracciones/registrarInfraccion \
  -H "Authorization: Bearer tu_token_jwt" \
  -F "numero_placa=ABC123" \
  -F "tipo_infraccion_id=1" \
  -F "latitud=19.432608" \
  -F "longitud=-99.133209" \
  -F "evidencias=@imagen1.jpg" \
  -F "evidencias=@imagen2.jpg"
```

### Con Postman:

1. Method: POST
2. URL: `http://localhost:3000/api-node/infracciones/registrarInfraccion`
3. Headers:
   - `Authorization: Bearer tu_token_jwt`
4. Body → form-data:
   - `numero_placa`: ABC123
   - `tipo_infraccion_id`: 1
   - `latitud`: 19.432608
   - `longitud`: -99.133209
   - `evidencias`: [File] imagen1.jpg
   - `evidencias`: [File] imagen2.jpg

---

## 📦 Archivos Modificados/Creados

### Nuevos Archivos:

1. **`helpers/cloudinary.js`** - Helper para Cloudinary
   - `generateFolio()` - Genera folio único
   - `uploadToCloudinary()` - Sube una imagen
   - `uploadMultipleToCloudinary()` - Sube múltiples imágenes
   - `getImagesFromCloudinary()` - Obtiene imágenes por folio
   - `deleteFromCloudinary()` - Elimina imágenes (rollback)

2. **`middlewares/uploadMemory.js`** - Multer con memoria
   - Almacena archivos en buffer (no en disco)
   - Necesario para Cloudinary

### Archivos Modificados:

1. **`controllers/infracciones.js`**
   - `createInfraccion()` - Ahora sube a Cloudinary después de BD
   - `getInfraccionById()` - Obtiene imágenes de Cloudinary

2. **`routes/infracciones.js`**
   - Usa `uploadMemory` en lugar de `upload`

---

## 🎨 Optimizaciones de Cloudinary

Las imágenes se optimizan automáticamente:

```javascript
transformation: [
    { width: 1920, height: 1080, crop: 'limit' },
    { quality: 'auto:good' }
]
```

- **Tamaño máximo**: 1920x1080 (Full HD)
- **Calidad**: Automática (optimizada)
- **Formato**: JPG (comprimido)

---

## 💰 Límites de Cloudinary (Plan Gratuito)

- **Almacenamiento**: 25GB
- **Bandwidth**: 25GB/mes
- **Transformaciones**: 25,000/mes
- **Imágenes**: Ilimitadas

Para un sistema de infracciones con ~1000 infracciones/mes y 4 imágenes c/u:
- Espacio usado: ~4GB/mes (asumiendo 1MB por imagen)
- Bandwidth: ~4GB/mes
- ✅ **Suficiente para el plan gratuito**

---

## 🔐 Seguridad

### URLs Firmadas (Opcional):

Si quieres URLs privadas que expiren:

```javascript
const signedUrl = cloudinary.url(public_id, {
    sign_url: true,
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hora
});
```

### Control de Acceso:

Cloudinary permite configurar:
- URLs privadas
- Autenticación
- Watermarks
- Restricciones de acceso

---

## 🚀 Deployment en Dokploy

1. **Agregar variables de entorno**:
   ```
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

2. **Redeploy**

3. **Verificar logs**:
   ```
   📸 Usando Cloudinary para almacenamiento de imágenes
   📋 Folio generado: 1234567890
   💾 Insertando infracción en la base de datos...
   ✅ Infracción creada en BD con ID: 123
   📸 Subiendo 4 evidencias a Cloudinary...
   ✅ Evidencia 1 subida a Cloudinary: https://...
   ✅ Evidencia 2 subida a Cloudinary: https://...
   ✅ Evidencia 3 subida a Cloudinary: https://...
   ✅ Evidencia 4 subida a Cloudinary: https://...
   ✅ Todas las evidencias subidas exitosamente
   ```

---

## ✅ Ventajas de Esta Implementación

1. **Persistencia**: Las imágenes no se pierden en redeploy
2. **Escalabilidad**: Cloudinary maneja el CDN y optimización
3. **Transaccional**: Solo se suben imágenes si la BD es exitosa
4. **Rollback**: Si falla después de subir, se limpian las imágenes
5. **Sin filesystem**: No dependemos del contenedor
6. **URLs globales**: Accesibles desde cualquier lugar
7. **Optimización automática**: Cloudinary optimiza las imágenes
8. **CDN incluido**: Entrega rápida en todo el mundo

---

## 🆘 Troubleshooting

### Error: "Missing required parameter - cloud_name"

**Solución**: Verifica que las variables de entorno estén configuradas:
```bash
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
echo $CLOUDINARY_API_SECRET
```

### Error: "Invalid API Key"

**Solución**: Verifica que el API Key y Secret sean correctos en Cloudinary Dashboard.

### Imágenes no se muestran

**Solución**: Verifica que las URLs de Cloudinary sean públicas. En Cloudinary Dashboard → Settings → Security → Restricted media types.

---

## 📚 Recursos

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Upload API](https://cloudinary.com/documentation/upload_images)

---

**¡Listo! Tu sistema ahora usa Cloudinary para almacenar imágenes de forma persistente.** 🎉
