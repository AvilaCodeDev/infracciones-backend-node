import multer from 'multer';

// Configuración de multer para almacenar archivos en memoria (buffer)
// Esto es necesario para Cloudinary ya que necesita el buffer de la imagen
const storage = multer.memoryStorage();

// Filtro para validar tipos de archivo (solo imágenes)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    // Validar por mimetype
    if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
    }

    // Validar por extensión como respaldo
    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp)$/i;
    if (allowedExtensions.test(file.originalname)) {
        return cb(null, true);
    }

    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
};

// Configuración de multer
const uploadMemory = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Límite de 10MB por archivo
    },
    fileFilter: fileFilter
});

export default uploadMemory;
