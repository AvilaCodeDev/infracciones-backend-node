import { Router } from "express";
import { validarJWT } from "../middlewares/validarJWT.js";
import upload from "../middlewares/upload.js";
import {
    getInfracciones,
    getInfraccionById,
    createInfraccion,
    updateInfraccion,
    deleteInfraccion,
    getTiposInfraccion,
    getInfraccionesByPlate
} from "../controllers/infracciones.js";

const router = Router();

// Rutas para infracciones
router.get('/', validarJWT, getInfracciones)
// Ruta POST con middleware de multer para manejar hasta 4 archivos de evidencia
router.post('/infraccionesPorPlaca', validarJWT, getInfraccionesByPlate)
router.post('/getInfraccionById', validarJWT, getInfraccionById)
router.post('/registrarInfraccion', validarJWT, upload.array('evidencias', 4), createInfraccion)

router.put('/:id', validarJWT, updateInfraccion)
router.delete('/:id', validarJWT, deleteInfraccion)

// Ruta para obtener tipos de infracción
router.get('/tipos/all', validarJWT, getTiposInfraccion)

export default router;

