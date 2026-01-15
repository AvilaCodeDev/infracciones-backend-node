import { callStoredFunction } from "../db/connection.js";
import jwt from 'jsonwebtoken';


const registrarSolicitudGrua = async (req, res) => {
    try {
        const {
            id_infraccion,
            id_agente,
            fecha,
            latitud,
            longitud,
            motivo
        } = req.body;

        // Validar campos obligatorios
        if (!id_infraccion) {
            return res.status(400).json({
                ok: false,
                response: "El campo 'id_infraccion' es obligatorio"
            });
        }

        if (!id_agente) {
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
        if (isNaN(id_infraccion)) {
            return res.status(400).json({
                ok: false,
                response: "El campo 'id_infraccion' debe ser un número"
            });
        }

        if (isNaN(id_agente)) {
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

        console.log(`🚛 Registrando solicitud de grúa para infracción ${id_infraccion}`);

        // Llamar a la función almacenada para registrar la solicitud
        // Ajusta el nombre de la función según tu base de datos
        const [result] = await callStoredFunction('f_registrar_solicitud_grua', [
            id_infraccion,
            id_agente,
            '1',
            fecha,
            lat,
            lng,
            motivo.trim()
        ]);

        if (result.result == 0) {
            return res.status(400).json({
                ok: false,
                response: "No se pudo registrar la solicitud de grúa"
            });
        }

        console.log(`✅ Solicitud de grúa registrada con ID: ${result.result}`);

        return res.status(201).json({
            ok: true,
            response: "Solicitud de grúa registrada exitosamente",
            data: {
                id_solicitud: result.result,
                id_infraccion,
                id_agente,
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