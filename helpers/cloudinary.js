import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Genera un folio aleatorio de 10 dígitos
 * @returns {string} Folio de 10 dígitos
 */
export const generateFolio = () => {
    const min = 1000000000;
    const max = 9999999999;
    const folio = Math.floor(Math.random() * (max - min + 1)) + min;
    return folio.toString();
};

/**
 * Sube una imagen a Cloudinary desde un buffer
 * @param {Buffer} buffer - Buffer de la imagen
 * @param {string} folio - Folio de la infracción
 * @param {number} index - Índice de la evidencia (1-4)
 * @returns {Promise<Object>} Resultado de Cloudinary con URL
 */
export const uploadToCloudinary = (buffer, folio, index) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `infracciones/${folio}`,
                public_id: `evidencia-${index}-${Date.now()}`,
                resource_type: 'image',
                format: 'jpg',
                transformation: [
                    { width: 1920, height: 1080, crop: 'limit' },
                    { quality: 'auto:good' }
                ]
            },
            (error, result) => {
                if (error) {
                    console.error(`❌ Error subiendo evidencia ${index} a Cloudinary:`, error);
                    reject(error);
                } else {
                    console.log(`✅ Evidencia ${index} subida a Cloudinary: ${result.secure_url}`);
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                        width: result.width,
                        height: result.height,
                        format: result.format,
                        bytes: result.bytes
                    });
                }
            }
        );

        // Convertir buffer a stream y hacer pipe a Cloudinary
        const bufferStream = Readable.from(buffer);
        bufferStream.pipe(uploadStream);
    });
};

/**
 * Sube múltiples imágenes a Cloudinary
 * @param {Array<Buffer>} files - Array de buffers de imágenes
 * @param {string} folio - Folio de la infracción
 * @returns {Promise<Array<Object>>} Array con resultados de Cloudinary
 */
export const uploadMultipleToCloudinary = async (files, folio) => {
    try {
        const uploadPromises = files.map((file, index) =>
            uploadToCloudinary(file.buffer, folio, index + 1)
        );

        const results = await Promise.all(uploadPromises);
        console.log(`📸 ${results.length} evidencias subidas exitosamente para folio ${folio}`);

        return results;
    } catch (error) {
        console.error('❌ Error subiendo evidencias a Cloudinary:', error);
        throw error;
    }
};

/**
 * Obtiene las URLs de las imágenes de Cloudinary para un folio
 * @param {string} folio - Folio de la infracción
 * @returns {Promise<Array<Object>>} Array con información de las imágenes
 */
export const getImagesFromCloudinary = async (folio) => {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: `infracciones/${folio}/`,
            max_results: 4,
            resource_type: 'image'
        });

        if (!result.resources || result.resources.length === 0) {
            console.log(`⚠️ No se encontraron evidencias en Cloudinary para folio ${folio}`);
            return [];
        }

        const evidencias = result.resources.map((resource, index) => ({
            index: index + 1,
            url: resource.secure_url,
            public_id: resource.public_id,
            width: resource.width,
            height: resource.height,
            format: resource.format,
            size: resource.bytes,
            created_at: resource.created_at
        }));

        console.log(`📸 Se encontraron ${evidencias.length} evidencias en Cloudinary para folio ${folio}`);
        return evidencias;
    } catch (error) {
        console.error('❌ Error obteniendo evidencias de Cloudinary:', error);
        // No lanzar error, solo retornar array vacío
        return [];
    }
};

/**
 * Elimina imágenes de Cloudinary (útil para rollback)
 * @param {string} folio - Folio de la infracción
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (folio) => {
    try {
        const result = await cloudinary.api.delete_resources_by_prefix(
            `infracciones/${folio}/`,
            { resource_type: 'image' }
        );
        console.log(`🗑️ Evidencias eliminadas de Cloudinary para folio ${folio}`);
        return result;
    } catch (error) {
        console.error('❌ Error eliminando evidencias de Cloudinary:', error);
        throw error;
    }
};

export default {
    generateFolio,
    uploadToCloudinary,
    uploadMultipleToCloudinary,
    getImagesFromCloudinary,
    deleteFromCloudinary
};
