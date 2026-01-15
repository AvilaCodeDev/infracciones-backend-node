import { Router } from "express";
import { validarJWT } from "../middlewares/validarJWT.js";
import { registrarSolicitudGrua } from "../controllers/gruas.js";

const router = Router();

router.post('/solicitarGrua', validarJWT, registrarSolicitudGrua);

export default router;