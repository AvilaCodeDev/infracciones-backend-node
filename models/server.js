import express from "express";
import cors from "cors";
import authRouter from "../routes/auth.js";

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 4000;
        this.apiPath = "/api-node";

        this.middlewares();

        this.routes();
    }

    middlewares() {
        // this.app.use(cors());
        this.app.use(express.json());
    }

    routes() {
        this.app.use(`${this.apiPath}/auth`, authRouter);
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}

export { Server };