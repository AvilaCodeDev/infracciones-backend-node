import dotenv from "dotenv";

dotenv.config({ path: ".env.development" });

import { Server } from "./models/server.js";

const server = new Server();
server.listen();