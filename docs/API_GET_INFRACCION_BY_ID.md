# API: Obtener Infracción por ID con Evidencias Fotográficas

## Descripción
Este endpoint permite obtener los detalles completos de una infracción específica, incluyendo las 4 evidencias fotográficas asociadas al folio.

## Endpoint
```
POST /api-node/infracciones/getInfraccionById
```

## Headers Requeridos
```
Authorization: Bearer <token_jwt>
Content-Type: application/json
```

## Body de la Petición
```json
{
  "id": 123
}
```

### Parámetros
- `id` (number, requerido): ID de la infracción a consultar

## Respuesta Exitosa

### Status Code: 200 OK

```json
{
  "ok": true,
  "data": {
    "id": 123,
    "folio": "1257044010",
    "placa": "ABC123",
    "tipo_infraccion": "Estacionamiento prohibido",
    "descripcion": "Vehículo estacionado en zona prohibida",
    "fecha_hora": "2024-01-13T14:30:00.000Z",
    "latitud": 19.432608,
    "longitud": -99.133209,
    "alcaldia": "Cuauhtémoc",
    "nombre_infractor": "Juan Pérez",
    "estatus": "Pendiente",
    "monto": 500.00,
    "evidencias": [
      {
        "filename": "evidencia-1768284787933-48378132.jpg",
        "url": "/uploads/evidencias/1257044010/evidencia-1768284787933-48378132.jpg"
      },
      {
        "filename": "evidencia-1768284787974-989107366.jpg",
        "url": "/uploads/evidencias/1257044010/evidencia-1768284787974-989107366.jpg"
      },
      {
        "filename": "evidencia-1768284788003-216240021.jpg",
        "url": "/uploads/evidencias/1257044010/evidencia-1768284788003-216240021.jpg"
      },
      {
        "filename": "evidencia-1768284788113-221773261.jpg",
        "url": "/uploads/evidencias/1257044010/evidencia-1768284788113-221773261.jpg"
      }
    ]
  },
  "token": "nuevo_token_jwt_aqui"
}
```

### Estructura de Evidencias
Cada objeto en el array `evidencias` contiene:
- `filename` (string): Nombre del archivo de imagen
- `url` (string): Ruta relativa para acceder a la imagen

## Acceso a las Imágenes

Las imágenes pueden ser accedidas directamente mediante HTTP usando la URL proporcionada:

```
http://localhost:3000/uploads/evidencias/{folio}/{filename}
```

Por ejemplo:
```
http://localhost:3000/uploads/evidencias/1257044010/evidencia-1768284787933-48378132.jpg
```

## Respuestas de Error

### Infracción No Encontrada
**Status Code: 404 Not Found**
```json
{
  "ok": false,
  "response": "Infracción no encontrada"
}
```

### Error del Servidor
**Status Code: 500 Internal Server Error**
```json
{
  "ok": false,
  "response": "Mensaje de error específico"
}
```

## Notas Importantes

1. **Cantidad de Evidencias**: El sistema retorna un máximo de 4 evidencias fotográficas por infracción.

2. **Carpeta de Evidencias**: Si no existe la carpeta de evidencias para el folio, el array `evidencias` estará vacío pero la petición será exitosa.

3. **Formatos Soportados**: Las evidencias pueden estar en los siguientes formatos:
   - JPG/JPEG
   - PNG
   - GIF
   - WEBP

4. **Archivos Estáticos**: El servidor está configurado para servir archivos estáticos desde la carpeta `uploads`, permitiendo el acceso directo a las imágenes.

5. **Logs del Servidor**: El servidor registra información útil en la consola:
   - `📸 Se encontraron X evidencias para el folio XXXXXXXXXX` - Cuando se encuentran evidencias
   - `⚠️ No se encontró carpeta de evidencias para el folio XXXXXXXXXX` - Cuando no existe la carpeta
   - `❌ Error al leer evidencias del folio XXXXXXXXXX` - Cuando hay un error al leer los archivos

## Ejemplo de Uso

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3000/api-node/infracciones/getInfraccionById', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    id: 123
  })
});

const data = await response.json();

if (data.ok) {
  console.log('Infracción:', data.data);
  console.log('Evidencias:', data.data.evidencias);
  
  // Mostrar las imágenes
  data.data.evidencias.forEach(evidencia => {
    const imgUrl = `http://localhost:3000${evidencia.url}`;
    console.log('URL de imagen:', imgUrl);
  });
}
```

### React Native
```javascript
const fetchInfraccion = async (id) => {
  try {
    const response = await fetch('http://localhost:3000/api-node/infracciones/getInfraccionById', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id })
    });

    const data = await response.json();

    if (data.ok) {
      // Renderizar las imágenes
      return (
        <View>
          {data.data.evidencias.map((evidencia, index) => (
            <Image
              key={index}
              source={{ uri: `http://localhost:3000${evidencia.url}` }}
              style={{ width: 200, height: 200 }}
            />
          ))}
        </View>
      );
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Cambios Implementados

### 1. Controller (`controllers/infracciones.js`)
- Se agregaron imports de `fs`, `path` y `fileURLToPath`
- Se modificó la función `getInfraccionById` para:
  - Obtener el folio de la infracción
  - Construir la ruta a la carpeta de evidencias
  - Leer los archivos de imagen de la carpeta
  - Filtrar y limitar a 4 imágenes
  - Construir las URLs de acceso
  - Incluir el array de evidencias en la respuesta

### 2. Server (`models/server.js`)
- Se agregaron imports de `path` y `fileURLToPath`
- Se configuró middleware `express.static` para servir archivos desde `/uploads`
- Esto permite el acceso HTTP directo a las imágenes de evidencia

## Estructura de Archivos
```
infracciones-backend-node/
├── uploads/
│   └── evidencias/
│       └── {folio}/
│           ├── evidencia-{timestamp}-{random}.jpg
│           ├── evidencia-{timestamp}-{random}.jpg
│           ├── evidencia-{timestamp}-{random}.jpg
│           └── evidencia-{timestamp}-{random}.jpg
```
