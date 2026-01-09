import jwt from 'jsonwebtoken';
import { response } from 'express';

export const validarJWT = (req, res = response, next) => {
    // Leer el token del header Authorization
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            ok: false,
            response: 'No hay token en la petición'
        });
    }

    // Extraer el token del formato "Bearer <token>"
    const token = authHeader.substring(7);

    try {
        // Verificar el token
        const { idUsuario } = jwt.verify(token, process.env.JWT_KEY);

        // Agregar el idUsuario al request para que esté disponible en los controladores
        req.idUsuario = idUsuario;

        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            response: 'Token no válido'
        });
    }
};
