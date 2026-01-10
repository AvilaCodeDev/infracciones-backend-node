import { Router } from "express";
import { validarJWT } from "../middlewares/validarJWT.js";
import { getRolesUsuario, getUsers, registrarInfraccion } from "../controllers/users.js";

const router = Router();

router.get('/', validarJWT, getUsers)

router.get('/userRoles', getRolesUsuario)

router.post('/nuevaInfraccion', validarJWT, registrarInfraccion)

export default router;