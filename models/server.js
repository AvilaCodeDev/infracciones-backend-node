import express from "express";
import cors from "cors";
import authRouter from "../routes/auth.js";
import usersRouter from "../routes/users.js"
import infraccionesRouter from "../routes/infracciones.js"
import gruasRouter from "../routes/gruas.js"
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.apiPath = "/api-node";

        this.middlewares();

        this.routes();
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());

        // Servir archivos estáticos desde la carpeta uploads
        this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    }

    routes() {
        this.app.use(`${this.apiPath}/auth`, authRouter);
        this.app.use(`${this.apiPath}/users`, usersRouter);
        this.app.use(`${this.apiPath}/infracciones`, infraccionesRouter);
        this.app.use(`${this.apiPath}/gruas`, gruasRouter);
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}

export { Server };