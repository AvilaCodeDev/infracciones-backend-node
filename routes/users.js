import { Router } from "express";
import { validarJWT } from "../middlewares/validarJWT.js";
import { createUser, getRolesUsuario, getUsers } from "../controllers/users.js";

const router = Router();

router.get('/', validarJWT, getUsers)
router.post('/', validarJWT, createUser)

router.get('/userRoles', getRolesUsuario)

export default router;