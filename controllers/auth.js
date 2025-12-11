import { callStoredFunction } from "../db/connection.js";

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        console.log(correo, password);
        const users = await callStoredFunction("login_fn", [correo, password]);
        if (users[0].result == null) {
            return res.status(400).json({
                ok: false,
                response: "Usuario y/o contraseña incorrectos."
            });
        }


        return res.status(200).json({
            ok: true,
            response: users[0].result
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            ok: false,
            response: error.message
        });
    }
}

export { login };