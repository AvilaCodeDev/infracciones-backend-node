import { Router } from "express";
import { login } from "../controllers/auth.js";
import { validarCampos } from "../middlewares/validarCampos.js";
import { check } from "express-validator";

const router = Router();

router.post("/login", [
    check("correo", "El correo es obligatorio").isEmail(),
    check("password", "El password es obligatorio").not().isEmpty(),
    validarCampos
], login);

export default router;