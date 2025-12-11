import { response } from "express";
import { validationResult } from "express-validator";

export const validarCampos = (req, res = response, next) => {
    const errrors = validationResult(req);
    if (!errrors.isEmpty()) {
        return res.status(400).json({
            ok: false,
            errors: errrors.mapped()
        })
    }
    next();
}