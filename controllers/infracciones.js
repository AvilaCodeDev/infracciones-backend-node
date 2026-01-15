import { response } from "express";
import { Select, callStoredFunction, callStoredProcedure } from "../db/connection.js"
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateFolio, uploadMultipleToCloudinary, deleteFromCloudinary, getImagesFromCloudinary } from '../helpers/cloudinary.js'
import axios from "axios";

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
            data: infracciones
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

        // Obtener evidencias desde Cloudinary
        const evidencias = await getImagesFromCloudinary(folio);

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
    let folio = null;
    let infraccionId = null;

    try {
        console.log(req.body);
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


        // Validar campos obligatorios
        if (!numero_placa || !tipo_infraccion_id || !latitud || !longitud) {
            return res.status(400).json({
                ok: false,
                response: "Faltan campos obligatorios: numero_placa, tipo_infraccion_id, latitud, longitud"
            });
        }

        // Validar que se enviaron archivos
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

        // Generar folio único
        folio = generateFolio();
        console.log(`📋 Folio generado: ${folio}`);

        // PASO 1: Insertar infracción en la base de datos
        console.log(`💾 Insertando infracción en la base de datos...`);
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
                response: "Infracción no creada en la base de datos",
            });
        }

        infraccionId = result.result;
        console.log(`✅ Infracción creada en BD con ID: ${infraccionId}`);

        // PASO 2: Subir evidencias a Cloudinary (solo si la inserción fue exitosa)
        console.log(`📸 Subiendo ${req.files.length} evidencias a Cloudinary...`);

        let evidencias = [];
        try {
            evidencias = await uploadMultipleToCloudinary(req.files, folio);
            console.log(`✅ Todas las evidencias subidas exitosamente`);
        } catch (uploadError) {
            console.error('❌ Error subiendo evidencias a Cloudinary:', uploadError);

            // IMPORTANTE: La infracción ya está en la BD, pero sin imágenes
            // Podrías decidir hacer rollback o dejar la infracción sin imágenes
            return res.status(201).json({
                ok: true,
                response: "Infracción creada pero hubo un error al subir las evidencias",
                warning: "Las imágenes no se pudieron subir a Cloudinary",
                data: {
                    folio,
                    id: infraccionId,
                    evidencias: []
                },
                token: jwt.sign({ idUsuario: req.idUsuario }, process.env.JWT_KEY, { expiresIn: '1h', })
            });
        }

        axios.post('http://localhost:3100/infracciones', {
            linea_captura: `${folio}-${fecha_hora.replace(' ', '-').replace(':', '-')}`,
            folio,
            id: infraccionId,
            placa: numero_placa.trim(),
            latitud,
            longitud,
            fecha_hora,
            alcaldia,
            estatus: "no pagada"
        })
        // PASO 3: Respuesta exitosa
        return res.status(201).json({
            ok: true,
            response: "Infracción creada exitosamente con evidencias",
            data: {
                folio,
                id: infraccionId,
                evidencias: evidencias.map((ev, index) => ({
                    index: index + 1,
                    url: ev.url,
                    public_id: ev.public_id,
                    width: ev.width,
                    height: ev.height,
                    size: ev.bytes
                }))
            },
            token: jwt.sign({ idUsuario: req.idUsuario }, process.env.JWT_KEY, { expiresIn: '1h', })
        });

    } catch (error) {
        console.error('❌ Error en createInfraccion:', error);

        // Si hubo error después de subir a Cloudinary, intentar limpiar
        if (folio && infraccionId) {
            try {
                console.log(`🗑️ Intentando limpiar evidencias de Cloudinary para folio ${folio}...`);
                await deleteFromCloudinary(folio);
            } catch (cleanupError) {
                console.error('❌ Error limpiando evidencias:', cleanupError);
            }
        }

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

const getInfraccionesAgente = async (req, res) => {
    try {
        const { id_agente } = req.body;

        const result = await callStoredProcedure('sp_infracciones_hoy_agente', [id_agente]);

        // The first element of the result array contains the rows returned by the SP
        const infracciones = result[0];

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
export {
    getInfracciones,
    getInfraccionesByPlate,
    getInfraccionById,
    createInfraccion,
    updateInfraccion,
    deleteInfraccion,
    getTiposInfraccion,
    getInfraccionesAgente
};

