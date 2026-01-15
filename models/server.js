import express from "express";
import cors from "cors";
import authRouter from "../routes/auth.js";
import usersRouter from "../routes/users.js"
import infraccionesRouter from "../routes/infracciones.js"


import gruasRouter from "../routes/gruas.js"
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.server = createServer(this.app);
        this.io = new SocketServer(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.apiPath = "/api-node";

        this.middlewares();

        this.routes();

        this.sockets();
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());

        // Servir archivos estáticos desde la carpeta uploads
        // Servir archivos estáticos desde la carpeta uploads
        this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

        // Middleware para inyectar io
        this.app.use((req, res, next) => {
            req.io = this.io;
            next();
        });
    }

    routes() {
        this.app.use(`${this.apiPath}/auth`, authRouter);
        this.app.use(`${this.apiPath}/users`, usersRouter);
        this.app.use(`${this.apiPath}/infracciones`, infraccionesRouter);
        this.app.use(`${this.apiPath}/gruas`, gruasRouter);
    }

    sockets() {
        this.io.on('connection', (socket) => {
            console.log('Cliente conectado', socket.id);

            socket.on('disconnect', () => {
                console.log('Cliente desconectado');
            });
        });
    }

    listen() {
        this.server.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}

export { Server };