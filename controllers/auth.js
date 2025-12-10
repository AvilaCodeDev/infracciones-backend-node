import { callStoredFunction } from "../db/connection.js";

const login = async (req, res) => {
    try {
        const users = await callStoredFunction("login_fn", ['adminsyscdmx@gmail.com', 'admincdmx']);
        if (users[0].result == null) {
            return res.status(400).json({
                msg: "Login failed",
                error: "Usuario y/o contraseña incorrectos."
            });
        }


        return res.status(200).json({
            data: users[0].result
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            msg: "Error fetching users",
            error: error.message
        });
    }
}

export { login };