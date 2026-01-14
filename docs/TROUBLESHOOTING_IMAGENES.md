# Troubleshooting - Imágenes Corruptas

## Problema
Las imágenes subidas desde React Native/Expo no se pueden abrir y muestran el error:
> "Fotos no puede abrir este archivo porque el formato no es compatible en este momento, o porque el archivo está dañado."

## Causas Comunes

### 1. **Formato de FormData Incorrecto en React Native**

El problema más común es cómo se envían las imágenes desde React Native. Asegúrate de usar el formato correcto:

#### ❌ **INCORRECTO**
```javascript
// NO uses esto
formData.append('evidencias', {
    uri: image.uri,
    type: 'image/jpeg',
    name: 'evidencia.jpg'
});
```

#### ✅ **CORRECTO**
```javascript
// Usa esto en su lugar
formData.append('evidencias', {
    uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
    type: image.type || 'image/jpeg',
    name: image.fileName || `evidencia-${Date.now()}.jpg`
});
```

### 2. **Verificar la Respuesta de expo-image-picker**

Asegúrate de que `expo-image-picker` esté devolviendo la información correcta:

```javascript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8, // Comprimir para reducir tamaño
        base64: false, // No necesitamos base64
    });

    if (!result.canceled) {
        console.log('Imagen seleccionada:', result.assets[0]);
        // Verifica que tenga: uri, type, fileName
    }
};
```

### 3. **Usar fetch en lugar de axios (Recomendado para React Native)**

```javascript
const uploadInfraccion = async (data, images) => {
    const formData = new FormData();
    
    // Agregar campos de texto
    formData.append('numero_placa', data.numero_placa);
    formData.append('tipo_infraccion_id', data.tipo_infraccion_id.toString());
    formData.append('descripcion', data.descripcion || '');
    formData.append('latitud', data.latitud.toString());
    formData.append('longitud', data.longitud.toString());

    // Agregar imágenes
    images.forEach((image, index) => {
        const imageUri = Platform.OS === 'ios' 
            ? image.uri.replace('file://', '') 
            : image.uri;

        formData.append('evidencias', {
            uri: imageUri,
            type: image.type || image.mimeType || 'image/jpeg',
            name: image.fileName || `evidencia-${index}-${Date.now()}.jpg`
        });
    });

    try {
        const response = await fetch('http://YOUR_IP:3000/api/infracciones/registrarInfraccion', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            body: formData
        });

        const result = await response.json();
        console.log('Respuesta:', result);
        return result;
    } catch (error) {
        console.error('Error al subir:', error);
        throw error;
    }
};
```

### 4. **Verificar Permisos en Android**

Si estás en Android, asegúrate de tener los permisos correctos en `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "La aplicación necesita acceso a tus fotos para adjuntar evidencias.",
          "cameraPermission": "La aplicación necesita acceso a tu cámara para tomar fotos de evidencias."
        }
      ]
    ]
  }
}
```

### 5. **Comprimir Imágenes Antes de Enviar**

Instala y usa `expo-image-manipulator` para comprimir:

```bash
npx expo install expo-image-manipulator
```

```javascript
import * as ImageManipulator from 'expo-image-manipulator';

const compressImage = async (uri) => {
    const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1920 } }], // Redimensionar a máximo 1920px de ancho
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult;
};

// Usar antes de agregar al FormData
const compressed = await compressImage(image.uri);
formData.append('evidencias', {
    uri: compressed.uri,
    type: 'image/jpeg',
    name: `evidencia-${Date.now()}.jpg`
});
```

## Debugging en el Backend

### Verificar que los archivos se están guardando correctamente

1. **Revisar los logs del servidor**
   - Busca los mensajes con 📝 y 📸 que muestran la información de los archivos recibidos

2. **Verificar la carpeta de uploads**
   ```bash
   ls -la uploads/evidencias/
   ```

3. **Intentar abrir las imágenes manualmente**
   - Navega a `uploads/evidencias/`
   - Intenta abrir las imágenes con un visor de imágenes
   - Si no se pueden abrir, el problema está en cómo se están enviando desde el cliente

4. **Verificar el tamaño del archivo**
   - Si el archivo tiene 0 bytes, no se está enviando correctamente
   - Si el archivo es muy grande (>10MB), será rechazado

## Solución Alternativa: Enviar como Base64

Si los problemas persisten, puedes enviar las imágenes como base64:

### En React Native:
```javascript
const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true, // Habilitar base64
    });

    if (!result.canceled) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        // Enviar como JSON en lugar de FormData
    }
};
```

### En el Backend:
Necesitarías modificar el controlador para aceptar base64 y convertirlo a archivo.

## Checklist de Verificación

- [ ] Las imágenes tienen un `uri` válido
- [ ] El `type` o `mimeType` es correcto (image/jpeg, image/png, etc.)
- [ ] El `name` o `fileName` incluye la extensión (.jpg, .png)
- [ ] En iOS, el URI no tiene el prefijo `file://` duplicado
- [ ] Los permisos de cámara/galería están configurados
- [ ] El servidor está recibiendo los archivos (verificar logs)
- [ ] Los archivos guardados tienen tamaño > 0 bytes
- [ ] El límite de tamaño (10MB) no se está excediendo

## Ejemplo Completo Funcional

```javascript
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

const handleSubmit = async (formData) => {
    try {
        // 1. Seleccionar imágenes
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 4,
        });

        if (result.canceled) return;

        // 2. Preparar FormData
        const data = new FormData();
        data.append('numero_placa', formData.numero_placa);
        data.append('tipo_infraccion_id', formData.tipo_infraccion_id.toString());
        data.append('descripcion', formData.descripcion || '');
        data.append('latitud', formData.latitud.toString());
        data.append('longitud', formData.longitud.toString());

        // 3. Agregar imágenes
        result.assets.forEach((asset, index) => {
            const uri = Platform.OS === 'ios' 
                ? asset.uri.replace('file://', '') 
                : asset.uri;

            data.append('evidencias', {
                uri: uri,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || `evidencia-${index}.jpg`
            });
        });

        // 4. Enviar
        const response = await fetch('http://192.168.1.100:3000/api/infracciones/registrarInfraccion', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            body: data
        });

        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Infracción creada:', result.data);
        } else {
            console.error('❌ Error:', result.response);
        }
    } catch (error) {
        console.error('❌ Error al enviar:', error);
    }
};
```

## Contacto y Soporte

Si el problema persiste después de seguir estos pasos:
1. Verifica los logs del servidor (busca los emojis 📝 📸 ✅ ❌)
2. Comparte los logs completos para diagnóstico
3. Verifica que el archivo se esté guardando en `uploads/evidencias/`
4. Intenta abrir el archivo guardado manualmente
