# Endpoint: Crear Infracción

## Descripción
Este endpoint permite crear una nueva infracción con evidencias fotográficas. El sistema genera automáticamente un **folio único de 10 dígitos** y crea una carpeta específica para almacenar las evidencias de esa infracción.

## URL
```
POST /api/infracciones/registrarInfraccion
```

## Autenticación
Requiere JWT token en el header `Authorization`:
```
Authorization: Bearer <token>
```

## Tipo de Contenido
```
Content-Type: multipart/form-data
```

## Parámetros del Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `numero_placa` | string | Sí | Número de placa del vehículo infractor |
| `tipo_infraccion_id` | number | Sí | ID del tipo de infracción |
| `descripcion` | string | No | Descripción adicional de la infracción |
| `latitud` | number | Sí | Latitud de la ubicación de la infracción |
| `longitud` | number | Sí | Longitud de la ubicación de la infracción |
| `evidencias` | File[] | Sí | Array de 1 a 4 archivos de imagen (JPEG, JPG, PNG, GIF, WEBP) |

## Generación Automática de Folio

El sistema genera automáticamente un **folio único de 10 dígitos** para cada infracción. Este folio:
- Se genera al momento de subir las evidencias
- Es un número aleatorio entre 1000000000 y 9999999999
- Se usa como nombre de la carpeta donde se almacenan las evidencias
- Se retorna en la respuesta del endpoint

**Ejemplo de folio**: `7845621309`

## Estructura de Almacenamiento

Las evidencias se organizan de la siguiente manera:

```
uploads/
└── evidencias/
    ├── 7845621309/              ← Carpeta con el folio
    │   ├── evidencia-1705123456789-123456789.jpg
    │   ├── evidencia-1705123456790-987654321.jpg
    │   └── evidencia-1705123456791-456789123.jpg
    ├── 3921847562/              ← Otra infracción
    │   ├── evidencia-1705123457000-111222333.jpg
    │   └── evidencia-1705123457001-444555666.jpg
    └── ...
```

## Validaciones

- **Campos obligatorios**: `numero_placa`, `tipo_infraccion_id`, `latitud`, `longitud`
- **Evidencias**: 
  - Mínimo: 1 archivo
  - Máximo: 4 archivos
  - Tamaño máximo por archivo: 10MB
  - Formatos permitidos: JPEG, JPG, PNG, GIF, WEBP

## Ejemplo de Uso

### Con JavaScript (Fetch API)
```javascript
const formData = new FormData();
formData.append('numero_placa', 'ABC-123');
formData.append('tipo_infraccion_id', '1');
formData.append('descripcion', 'Exceso de velocidad en zona escolar');
formData.append('latitud', '19.432608');
formData.append('longitud', '-99.133209');

// Agregar hasta 4 evidencias
formData.append('evidencias', file1); // File object
formData.append('evidencias', file2);
formData.append('evidencias', file3);
formData.append('evidencias', file4);

const response = await fetch('http://localhost:3000/api/infracciones/registrarInfraccion', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },
    body: formData
});

const data = await response.json();
console.log(data);
```

### Con Axios
```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('numero_placa', 'ABC-123');
formData.append('tipo_infraccion_id', '1');
formData.append('descripcion', 'Exceso de velocidad en zona escolar');
formData.append('latitud', '19.432608');
formData.append('longitud', '-99.133209');

// Agregar evidencias
formData.append('evidencias', file1);
formData.append('evidencias', file2);
formData.append('evidencias', file3);
formData.append('evidencias', file4);

const response = await axios.post('http://localhost:3000/api/infracciones/registrarInfraccion', formData, {
    headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN',
        'Content-Type': 'multipart/form-data'
    }
});

console.log(response.data);
```

### Con React Native (Expo)
```javascript
const createInfraccion = async (data, images) => {
    const formData = new FormData();
    
    formData.append('numero_placa', data.numero_placa);
    formData.append('tipo_infraccion_id', data.tipo_infraccion_id);
    formData.append('descripcion', data.descripcion);
    formData.append('latitud', data.latitud);
    formData.append('longitud', data.longitud);

    // Agregar imágenes desde expo-image-picker
    images.forEach((image, index) => {
        formData.append('evidencias', {
            uri: image.uri,
            type: 'image/jpeg',
            name: `evidencia-${index}.jpg`
        });
    });

    const response = await fetch('http://localhost:3000/api/infracciones/registrarInfraccion', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        },
        body: formData
    });

    return await response.json();
};
```

## Respuestas

### Éxito (201 Created)
```json
{
    "ok": true,
    "response": "Infracción creada exitosamente",
    "data": {
        "folio": "7845621309",
        "numero_placa": "ABC-123",
        "tipo_infraccion_id": 1,
        "descripcion": "Exceso de velocidad en zona escolar",
        "latitud": 19.432608,
        "longitud": -99.133209,
        "evidencias": [
            {
                "filename": "evidencia-1705123456789-123456789.jpg",
                "originalname": "foto1.jpg",
                "mimetype": "image/jpeg",
                "size": 245678,
                "path": "uploads/evidencias/7845621309/evidencia-1705123456789-123456789.jpg"
            },
            {
                "filename": "evidencia-1705123456790-987654321.jpg",
                "originalname": "foto2.jpg",
                "mimetype": "image/jpeg",
                "size": 198765,
                "path": "uploads/evidencias/7845621309/evidencia-1705123456790-987654321.jpg"
            }
        ],
        "id_oficial": 5
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error - Campos Faltantes (400 Bad Request)
```json
{
    "ok": false,
    "response": "Faltan campos obligatorios: numero_placa, tipo_infraccion_id, latitud, longitud"
}
```

### Error - Sin Evidencias (400 Bad Request)
```json
{
    "ok": false,
    "response": "Debe proporcionar al menos una evidencia fotográfica"
}
```

### Error - Demasiadas Evidencias (400 Bad Request)
```json
{
    "ok": false,
    "response": "No se pueden enviar más de 4 evidencias fotográficas"
}
```

### Error - Tipo de Archivo Inválido (400 Bad Request)
```json
{
    "ok": false,
    "response": "Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)"
}
```

### Error - Servidor (500 Internal Server Error)
```json
{
    "ok": false,
    "response": "Mensaje de error específico"
}
```

## Notas Importantes

1. **Folio Automático**: El sistema genera automáticamente un folio único de 10 dígitos para cada infracción.

2. **Almacenamiento Organizado**: Las evidencias se guardan en carpetas individuales usando el folio como nombre: `uploads/evidencias/{folio}/`

3. **Seguridad**: El endpoint requiere autenticación JWT válida.

4. **ID del Oficial**: Se obtiene automáticamente del token JWT (`req.idUsuario`).

5. **TODO**: Actualmente la función retorna los datos procesados pero no los guarda en la base de datos. Es necesario implementar la lógica de guardado llamando a una función almacenada o insertando directamente en las tablas correspondientes. Recuerda guardar el folio en la base de datos junto con los demás datos de la infracción.

6. **Archivos**: Los archivos subidos se mantienen en el servidor organizados por folio. Considera implementar:
   - Limpieza de carpetas huérfanas (folios sin registro en BD)
   - Respaldo en la nube (AWS S3, Google Cloud Storage, etc.)
   - Optimización de imágenes antes de guardar
   - Sistema de limpieza automática de evidencias antiguas
