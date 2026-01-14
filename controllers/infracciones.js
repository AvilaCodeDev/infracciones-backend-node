import { response } from "express";
import { Select, callStoredFunction, callStoredProcedure } from "../db/connection.js"
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getInfracciones = async (req, res) => {
    try {
        const infracciones = await Select('InfraccionesView');

        res.status(200).json({
            ok: true,
            data: infracciones,
            token: jwt.sign({ idUsuario: req.idUsuario }, process.env.JWT_KEY, { expiresIn: '1h', })
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            response: error.message
        })
    }
}

const getInfraccionesByPlate = async (req, res) => {
    try {
        const { numero_placa } = req.body;

        const infracciones = await Select('InfraccionesView', [`placa = '${numero_placa}'`]);

        if (infracciones.length === 0) {
            return res.status(404).json({
                ok: false,
                response: "Infracciones no encontradas"
            })
        }

        res.status(200).json({
            ok: true,
            data: infracciones,
            token: jwt.sign({ idUsuario: req.idUsuario }, process.env.JWT_KEY, { expiresIn: '1h', })
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            response: error.message
        })
    }
}

const getInfraccionById = async (req, res) => {
    try {
        const { id } = req.body;
        const infraccion = await Select('DetalleInfraccionView', [`id = ${id}`]);

        if (infraccion.length === 0) {
            return res.status(404).json({
                ok: false,
                response: "Infracción no encontrada"
            })
        }

        // Obtener el folio de la infracción
        const folio = infraccion[0].folio;

        // Construir la ruta de la carpeta de evidencias
        const evidenciasPath = path.join(__dirname, '../uploads/evidencias', folio);

        // Array para almacenar las URLs de las evidencias
        let evidencias = [];

        // Verificar si existe la carpeta de evidencias
        if (fs.existsSync(evidenciasPath)) {
            try {
                // Leer los archivos de la carpeta
                const files = fs.readdirSync(evidenciasPath);

                // Filtrar solo archivos de imagen y tomar máximo 4
                const imageFiles = files
                    .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
                    .slice(0, 4);

                // Construir las URLs de las evidencias
                evidencias = imageFiles.map(file => ({
                    filename: file,
                    url: `/uploads/evidencias/${folio}/${file}`
                }));

                console.log(`📸 Se encontraron ${evidencias.length} evidencias para el folio ${folio}`);
            } catch (error) {
                console.error(`❌ Error al leer evidencias del folio ${folio}:`, error);
            }
        } else {
            console.warn(`⚠️ No se encontró carpeta de evidencias para el folio ${folio}`);
        }

        res.status(200).json({
            ok: true,
            data: {
                ...infraccion[0],
                evidencias
            },
            token: jwt.sign({ idUsuario: req.idUsuario }, process.env.JWT_KEY, { expiresIn: '1h', })
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            response: error.message
        })
    }
}

const createInfraccion = async (req, res) => {
    try {
        const {
            numero_placa,
            tipo_infraccion_id,
            descripcion,
            latitud,
            longitud,
            fecha_hora,
            alcaldia,
            nombre_infractor
        } = req.body;

        // El folio se genera automáticamente en el middleware de multer
        const folio = req.folio;

        if (!numero_placa || !tipo_infraccion_id || !latitud || !longitud) {
            return res.status(400).json({
                ok: false,
                response: "Faltan campos obligatorios: numero_placa, tipo_infraccion_id, latitud, longitud"
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                ok: false,
                response: "Debe proporcionar al menos una evidencia fotográfica"
            });
        }
        if (req.files.length > 4) {
            return res.status(400).json({
                ok: false,
                response: "No se pueden enviar más de 4 evidencias fotográficas"
            });
        }

        const [result] = await callStoredFunction('f_registrar_infraccion', [
            folio,
            numero_placa,
            tipo_infraccion_id,
            req.idUsuario,
            1,
            latitud,
            longitud,
            descripcion,
            fecha_hora,
            alcaldia,
            nombre_infractor
        ]);

        if (result.result == 0) {
            return res.status(400).json({
                ok: false,
                response: "Infracción no creada",
            });
        }

        return res.status(201).json({
            ok: true,
            response: "Infracción creada exitosamente",
            data: {
                folio,
                id: result.result
            },
            token: jwt.sign({ idUsuario: req.idUsuario }, process.env.JWT_KEY, { expiresIn: '1h', })
        });

    } catch (error) {
        console.error('❌ Error en createInfraccion:', error);
        return res.status(500).json({
            ok: false,
            response: error.message
        })
    }
}

const updateInfraccion = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            folio,
            fecha_hora,
            ubicacion,
            tipo_infraccion,
            descripcion,
            monto,
            estatus
        } = req.body;

        const [result] = await callStoredFunction('f_actualizar_infraccion',
            [
                +id,
                folio,
                fecha_hora,
                ubicacion,
                tipo_infraccion,
                descripcion || '',
                +monto,
                estatus
            ]);

        if (result.result == 0) {
            return res.status(400).json({
                ok: false,
                response: "Infracción no actualizada",
            });
        }

        return res.status(200).json({
            ok: true,
            response: "Infracción actualizada exitosamente",
            token: jwt.sign({ idUsuario: req.idUsuario }, process.env.JWT_KEY, { expiresIn: '1h', })
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            response: error.message
        })
    }
}

const deleteInfraccion = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await callStoredFunction('f_eliminar_infraccion', [+id]);

        if (result.result == 0) {
            return res.status(400).json({
                ok: false,
                response: "Infracción no eliminada",
            });
        }

        return res.status(200).json({
            ok: true,
            response: "Infracción eliminada exitosamente",
            token: jwt.sign({ idUsuario: req.idUsuario }, process.env.JWT_KEY, { expiresIn: '1h', })
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            response: error.message
        })
    }
}

const getTiposInfraccion = async (req, res) => {
    try {
        const tipos = await Select('tipos_infraccion');

        res.status(200).json({
            ok: true,
            data: tipos
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            response: error.message
        })
    }
}

export {
    getInfracciones,
    getInfraccionesByPlate,
    getInfraccionById,
    createInfraccion,
    updateInfraccion,
    deleteInfraccion,
    getTiposInfraccion
};
