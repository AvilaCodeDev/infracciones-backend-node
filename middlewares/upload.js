import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Genera un folio aleatorio de 10 dígitos
 * @returns {string} Folio de 10 dígitos
 */
export const generateFolio = () => {
    // Generar un número aleatorio de 10 dígitos
    const min = 1000000000; // 10 dígitos mínimo
    const max = 9999999999; // 10 dígitos máximo
    const folio = Math.floor(Math.random() * (max - min + 1)) + min;
    return folio.toString();
};

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Generar folio si no existe en la request
        if (!req.folio) {
            req.folio = generateFolio();
        }

        // Crear la ruta de la carpeta con el folio
        const folioPath = path.join(__dirname, '../uploads/evidencias', req.folio);

        // Crear la carpeta si no existe
        if (!fs.existsSync(folioPath)) {
            fs.mkdirSync(folioPath, { recursive: true });
            console.log(`📁 Carpeta creada para folio: ${req.folio}`);
        }

        cb(null, folioPath);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

        // Determinar la extensión correcta
        let ext = path.extname(file.originalname);

        // Si no hay extensión, intentar obtenerla del mimetype
        if (!ext || ext === '') {
            const mimeToExt = {
                'image/jpeg': '.jpg',
                'image/jpg': '.jpg',
                'image/png': '.png',
                'image/gif': '.gif',
                'image/webp': '.webp'
            };
            ext = mimeToExt[file.mimetype] || '.jpg';
        }

        cb(null, 'evidencia-' + uniqueSuffix + ext);
    }
});

// Filtro para validar tipos de archivo (solo imágenes)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    // Validar por mimetype (más confiable que la extensión)
    if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
    }

    // Si el mimetype no está en la lista, verificar la extensión como respaldo
    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp)$/i;
    if (allowedExtensions.test(file.originalname)) {
        return cb(null, true);
    }

    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
};

// Configuración de multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Límite de 10MB por archivo (aumentado para imágenes de alta calidad)
    },
    fileFilter: fileFilter
});

export default upload;
