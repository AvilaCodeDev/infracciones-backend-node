import { Router } from "express";
import { validarJWT } from "../middlewares/validarJWT.js";
import { getRolesUsuario, getUsers } from "../controllers/users.js";

const router = Router();

router.get('/', validarJWT, getUsers)

router.get('/userRoles', getRolesUsuario)

export default router;