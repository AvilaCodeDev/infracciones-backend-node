import { Router } from "express";
import { validarJWT } from "../middlewares/validarJWT.js";
import uploadMemory from "../middlewares/uploadMemory.js";
import {
    getInfracciones,
    getInfraccionById,
    createInfraccion,
    updateInfraccion,
    deleteInfraccion,
    getTiposInfraccion,
    getInfraccionesByPlate,
    getInfraccionesAgente
} from "../controllers/infracciones.js";

const router = Router();

// Rutas para infracciones
router.get('/', validarJWT, getInfracciones)

router.post('/infraccionesPorPlaca', getInfraccionesByPlate)
router.post('/infraccionesAgente', validarJWT, getInfraccionesAgente)
router.post('/getInfraccionById', validarJWT, getInfraccionById)
router.post('/registrarInfraccion', validarJWT, uploadMemory.array('evidencias', 4), createInfraccion)

router.put('/:id', validarJWT, updateInfraccion)
router.delete('/:id', validarJWT, deleteInfraccion)

// Ruta para obtener tipos de infracción
router.get('/tipos/all', validarJWT, getTiposInfraccion)

export default router;

