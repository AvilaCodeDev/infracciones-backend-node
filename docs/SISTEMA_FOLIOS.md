# Sistema de Folios y Almacenamiento de Evidencias

## 📋 Resumen

El sistema ahora genera automáticamente un **folio único de 10 dígitos** para cada infracción y organiza las evidencias fotográficas en carpetas individuales basadas en ese folio.

## 🔢 Generación de Folios

### Función `generateFolio()`

Ubicación: [`middlewares/upload.js`](file:///c:/Users/ocram/Documents/ESCOM/FEPI/infracciones-backend-node/middlewares/upload.js)

```javascript
export const generateFolio = () => {
    const min = 1000000000; // 10 dígitos mínimo
    const max = 9999999999; // 10 dígitos máximo
    const folio = Math.floor(Math.random() * (max - min + 1)) + min;
    return folio.toString();
};
```

**Características:**
- Genera números aleatorios de exactamente 10 dígitos
- Rango: 1,000,000,000 a 9,999,999,999
- Se exporta para poder usarse en otros módulos si es necesario

## 📁 Estructura de Carpetas

### Antes (Sin Folio)
```
uploads/
└── evidencias/
    ├── evidencia-1705123456789-123456789.jpg
    ├── evidencia-1705123456790-987654321.jpg
    ├── evidencia-1705123456791-456789123.jpg
    └── evidencia-1705123457000-111222333.jpg
```
❌ **Problema**: Todas las evidencias mezcladas en una sola carpeta

### Ahora (Con Folio)
```
uploads/
└── evidencias/
    ├── 7845621309/                    ← Folio de infracción #1
    │   ├── evidencia-1705123456789-123456789.jpg
    │   ├── evidencia-1705123456790-987654321.jpg
    │   └── evidencia-1705123456791-456789123.jpg
    ├── 3921847562/                    ← Folio de infracción #2
    │   ├── evidencia-1705123457000-111222333.jpg
    │   └── evidencia-1705123457001-444555666.jpg
    └── 5678901234/                    ← Folio de infracción #3
        └── evidencia-1705123457100-777888999.jpg
```
✅ **Ventajas**: 
- Evidencias organizadas por infracción
- Fácil localización de archivos
- Fácil eliminación de evidencias de una infracción específica
- Mejor gestión de almacenamiento

## 🔄 Flujo de Funcionamiento

### 1. Cliente envía petición
```javascript
POST /api/infracciones/registrarInfraccion
Content-Type: multipart/form-data

{
  numero_placa: "ABC-123",
  tipo_infraccion_id: 1,
  descripcion: "...",
  latitud: 19.432608,
  longitud: -99.133209,
  evidencias: [file1, file2, file3]
}
```

### 2. Middleware de Multer procesa archivos

**Paso 2.1**: Al recibir el primer archivo:
```javascript
destination: function (req, file, cb) {
    if (!req.folio) {
        req.folio = generateFolio();  // Genera: "7845621309"
    }
    // ...
}
```

**Paso 2.2**: Crea la carpeta con el folio:
```javascript
const folioPath = path.join(__dirname, '../uploads/evidencias', req.folio);
// Resultado: "uploads/evidencias/7845621309"

if (!fs.existsSync(folioPath)) {
    fs.mkdirSync(folioPath, { recursive: true });
    console.log(`📁 Carpeta creada para folio: ${req.folio}`);
}
```

**Paso 2.3**: Guarda cada archivo en la carpeta del folio:
```javascript
filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'evidencia-' + uniqueSuffix + ext);
}
// Resultado: "evidencia-1705123456789-123456789.jpg"
```

### 3. Controlador procesa la petición

```javascript
const createInfraccion = async (req, res) => {
    // El folio ya está disponible en req.folio
    const folio = req.folio;  // "7845621309"
    
    // Procesar evidencias
    const evidencias = req.files.map(file => ({
        filename: file.filename,
        path: file.path  // "uploads/evidencias/7845621309/evidencia-..."
    }));
    
    // Retornar respuesta con folio
    return res.json({
        ok: true,
        data: {
            folio,  // ← El cliente recibe el folio
            numero_placa,
            evidencias
        }
    });
};
```

### 4. Cliente recibe respuesta

```json
{
  "ok": true,
  "response": "Infracción creada exitosamente",
  "data": {
    "folio": "7845621309",
    "numero_placa": "ABC-123",
    "evidencias": [
      {
        "filename": "evidencia-1705123456789-123456789.jpg",
        "path": "uploads/evidencias/7845621309/evidencia-1705123456789-123456789.jpg"
      }
    ]
  }
}
```

## 💾 Integración con Base de Datos

### TODO: Guardar el Folio

Cuando implementes el guardado en base de datos, asegúrate de incluir el folio:

```javascript
const createInfraccion = async (req, res) => {
    const folio = req.folio;
    
    // Guardar en base de datos
    const [result] = await callStoredFunction('f_registrar_infraccion', [
        folio,                    // ← Agregar folio como parámetro
        numero_placa,
        tipo_infraccion_id,
        descripcion,
        latitud,
        longitud,
        req.idUsuario
    ]);
    
    // Guardar rutas de evidencias en tabla de evidencias
    for (const file of req.files) {
        await callStoredFunction('f_registrar_evidencia', [
            result.id_infraccion,
            file.filename,
            file.path
        ]);
    }
};
```

### Estructura de Tabla Sugerida

```sql
CREATE TABLE infracciones (
    id_infraccion INT PRIMARY KEY AUTO_INCREMENT,
    folio VARCHAR(10) UNIQUE NOT NULL,  -- ← Agregar campo folio
    numero_placa VARCHAR(20) NOT NULL,
    tipo_infraccion_id INT NOT NULL,
    descripcion TEXT,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    id_oficial INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- ...
);

CREATE TABLE evidencias (
    id_evidencia INT PRIMARY KEY AUTO_INCREMENT,
    id_infraccion INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_infraccion) REFERENCES infracciones(id_infraccion)
);
```

## 🔍 Búsqueda y Consulta

Con el sistema de folios, puedes:

### Buscar infracción por folio
```javascript
const getInfraccionByFolio = async (req, res) => {
    const { folio } = req.params;
    const infraccion = await Select('infracciones', [`folio = '${folio}'`]);
    // ...
};
```

### Obtener evidencias de una infracción
```javascript
const getEvidenciasByFolio = async (folio) => {
    const folioPath = path.join(__dirname, '../uploads/evidencias', folio);
    
    if (fs.existsSync(folioPath)) {
        const files = fs.readdirSync(folioPath);
        return files.map(file => ({
            filename: file,
            path: path.join(folioPath, file)
        }));
    }
    
    return [];
};
```

### Eliminar evidencias de una infracción
```javascript
const deleteEvidenciasByFolio = async (folio) => {
    const folioPath = path.join(__dirname, '../uploads/evidencias', folio);
    
    if (fs.existsSync(folioPath)) {
        fs.rmSync(folioPath, { recursive: true, force: true });
        console.log(`🗑️ Carpeta eliminada: ${folio}`);
    }
};
```

## 🎯 Ventajas del Sistema

1. **Organización**: Cada infracción tiene su propia carpeta
2. **Trazabilidad**: El folio conecta la BD con el sistema de archivos
3. **Mantenimiento**: Fácil limpieza de evidencias huérfanas
4. **Escalabilidad**: Mejor rendimiento con miles de infracciones
5. **Backup**: Fácil respaldar evidencias por infracción
6. **Auditoría**: Fácil verificar qué evidencias pertenecen a qué infracción

## ⚠️ Consideraciones

1. **Unicidad**: Aunque es muy improbable, existe una posibilidad mínima de colisión de folios. Considera validar contra la BD antes de crear la carpeta.

2. **Sincronización**: Asegúrate de que si falla el guardado en BD, también se eliminen las evidencias del filesystem.

3. **Limpieza**: Implementa un proceso periódico para eliminar carpetas de folios que no existen en la BD.

4. **Migración**: Si tienes evidencias antiguas sin folio, necesitarás un script de migración.
