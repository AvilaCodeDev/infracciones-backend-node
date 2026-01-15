import { callStoredFunction, callStoredProcedure } from "../db/connection.js";
import jwt from 'jsonwebtoken'

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        console.log(correo, password);
        const users = await callStoredProcedure("sp_login", [correo, password]);

        console.log(users)

        if (users.flat()[0].resultado_login == null) {
            return res.status(400).json({
                ok: false,
                response: "Usuario y/o contraseña incorrectos."
            });
        }


        return res.status(200).json({
            ...users.flat()[0].resultado_login,
            token: jwt.sign({ idUsuario: users.flat()[0].resultado_login.idUsuario }, process.env.JWT_KEY, { expiresIn: '1h', })
        });
    } catch (error) {
        console.error("Login error:", error);

        // Manejar error de sesión activa (SIGNAL desde stored procedure)
        if (error.errno === 1644 || error.code === 'ER_SIGNAL_EXCEPTION') {
            return res.status(409).json({
                ok: false,
                response: error.sqlMessage || "El usuario ya tiene una sesión activa",
                errorCode: "ACTIVE_SESSION"
            });
        }

        // Otros errores de base de datos
        return res.status(500).json({
            ok: false,
            response: error.message
        });
    }
}

const logout = async (req, res) => {
    try {
        const { idUsuario } = req.body;
        await callStoredProcedure("sp_logout", [idUsuario]);
        return res.status(200).json({
            ok: true,
            response: "Usuario desconectado exitosamente"
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            ok: false,
            response: error.message
        });
    }
}

const validateToken = async (req, res) => {
    try {
        // Si llegamos aquí, el token ya fue validado por el middleware validarJWT
        // El idUsuario está disponible en req.idUsuario
        const { idUsuario } = req;

        // Obtener la información completa del usuario desde la base de datos
        const userInfo = await callStoredFunction("get_user_by_id_fn", [idUsuario]);

        if (!userInfo || !userInfo[0] || userInfo[0].result == null) {
            return res.status(404).json({
                ok: false,
                response: "Usuario no encontrado"
            });
        }

        return res.status(200).json({

            ...userInfo[0].result,
            token: jwt.sign({ idUsuario: userInfo[0].result.idUsuario }, process.env.JWT_KEY, { expiresIn: '1h', })
        });
    } catch (error) {
        console.error("Validate token error:", error);
        return res.status(500).json({
            ok: false,
            response: error.message
        });
    }
}

export { login, validateToken, logout };