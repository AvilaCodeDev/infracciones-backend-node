import { Router } from "express";
import { login, validateToken } from "../controllers/auth.js";
import { validarCampos } from "../middlewares/validarCampos.js";
import { validarJWT } from "../middlewares/validarJWT.js";
import { check } from "express-validator";

const router = Router();

router.post("/login", [
    check("correo", "El correo es obligatorio").isEmail(),
    check("password", "El password es obligatorio").not().isEmpty(),
    validarCampos
], login);

router.get("/validate-token", validarJWT, validateToken);

export default router;