import { callStoredFunction } from "../db/connection.js";
import jwt from 'jsonwebtoken';


const registrarSolicitudGrua = async (req, res) => {
    try {
        const {
            infraccion_id,
            agente_id,
            fecha,
            latitud,
            longitud,
            motivo
        } = req.body;

        // Validar campos obligatorios
        if (!infraccion_id) {
            return res.status(400).json({
                ok: false,
                response: "El campo 'id_infraccion' es obligatorio"
            });
        }

        if (!agente_id) {
            return res.status(400).json({
                ok: false,
                response: "El campo 'id_agente' es obligatorio"
            });
        }

        if (!fecha) {
            return res.status(400).json({
                ok: false,
                response: "El campo 'fecha' es obligatorio"
            });
        }

        if (!latitud) {
            return res.status(400).json({
                ok: false,
                response: "El campo 'latitud' es obligatorio"
            });
        }

        if (!longitud) {
            return res.status(400).json({
                ok: false,
                response: "El campo 'longitud' es obligatorio"
            });
        }

        if (!motivo) {
            return res.status(400).json({
                ok: false,
                response: "El campo 'motivo' es obligatorio"
            });
        }

        // Validar tipos de datos
        if (isNaN(infraccion_id)) {
            return res.status(400).json({
                ok: false,
                response: "El campo 'id_infraccion' debe ser un número"
            });
        }

        if (isNaN(agente_id)) {
            return res.status(400).json({
                ok: false,
                response: "El campo 'id_agente' debe ser un número"
            });
        }

        if (isNaN(latitud)) {
            return res.status(400).json({
                ok: false,
                response: "El campo 'latitud' debe ser un número"
            });
        }

        if (isNaN(longitud)) {
            return res.status(400).json({
                ok: false,
                response: "El campo 'longitud' debe ser un número"
            });
        }

        // Validar rangos de coordenadas
        const lat = parseFloat(latitud);
        const lng = parseFloat(longitud);

        if (lat < -90 || lat > 90) {
            return res.status(400).json({
                ok: false,
                response: "La latitud debe estar entre -90 y 90"
            });
        }

        if (lng < -180 || lng > 180) {
            return res.status(400).json({
                ok: false,
                response: "La longitud debe estar entre -180 y 180"
            });
        }

        // Validar formato de fecha (YYYY-MM-DD HH:MM:SS o ISO)
        const fechaRegex = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/;
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

        if (!fechaRegex.test(fecha) && !isoRegex.test(fecha)) {
            return res.status(400).json({
                ok: false,
                response: "El formato de fecha debe ser 'YYYY-MM-DD HH:MM:SS' o ISO 8601"
            });
        }

        // Validar longitud del motivo
        if (motivo.trim().length === 0) {
            return res.status(400).json({
                ok: false,
                response: "El campo 'motivo' no puede estar vacío"
            });
        }

        if (motivo.length > 500) {
            return res.status(400).json({
                ok: false,
                response: "El campo 'motivo' no puede exceder 500 caracteres"
            });
        }

        console.log(`🚛 Registrando solicitud de grúa para infracción ${infraccion_id}`);

        // Llamar a la función almacenada para registrar la solicitud
        // Ajusta el nombre de la función según tu base de datos
        const [result] = await callStoredFunction('f_registrar_solicitud_grua', [
            infraccion_id,
            agente_id,
            '1',
            fecha,
            lat,
            lng,
            motivo.trim()
        ]);

        console.log(result);

        if (result.result == 0) {
            return res.status(400).json({
                ok: false,
                response: "No se pudo registrar la solicitud de grúa"
            });
        }

        console.log(`✅ Solicitud de grúa registrada con ID: ${result.result}`);

        try {
            const agentes = await callStoredFunction('agentes_grua_disponibles_ids_fn', []);
            console.log(agentes);
            if (agentes && agentes.length > 0 && agentes[0].result) {
                let ids = [];
                // Handle different possible return types (JSON string or direct value)
                if (typeof agentes[0].result === 'string') {
                    try {
                        // Attempt to parse if it's a JSON array string
                        const parsed = JSON.parse(agentes[0].result);
                        ids = Array.isArray(parsed) ? parsed : [parsed];
                    } catch (e) {
                        // If not JSON, maybe just a single ID string
                        ids = [agentes[0].result];
                    }
                } else {
                    // Number or other type
                    ids = [agentes[0].result];
                }

                if (req.io) {
                    ids.forEach(id => {
                        console.log(`📡 Enviando notificación a grúa ${id}`);
                        req.io.emit(`notificacion_grua_${id}`, {
                            tipo: 'NUEVA_SOLICITUD',
                            mensaje: 'Nueva solicitud de grúa disponible',
                            data: {
                                id_solicitud: result.result,
                                infraccion_id,
                                latitud: lat,
                                longitud: lng,
                                motivo: motivo.trim(),
                                fecha
                            }
                        });
                    });
                }
            }
        } catch (error) {
            console.error("⚠️ Error enviando notificaciones:", error);
        }

        return res.status(201).json({
            ok: true,
            response: "Solicitud de grúa registrada exitosamente",
            data: {
                id_solicitud: result.result,
                infraccion_id,
                agente_id,
                fecha,
                latitud: lat,
                longitud: lng,
                motivo: motivo.trim()
            },
            token: jwt.sign({ idUsuario: req.idUsuario }, process.env.JWT_KEY, { expiresIn: '1h' })
        });

    } catch (error) {
        console.error('❌ Error en registrarSolicitudGrua:', error);
        return res.status(500).json({
            ok: false,
            response: error.message
        });
    }
}

export {
    registrarSolicitudGrua
}