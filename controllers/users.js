import { response } from "express";
import { Select } from "../db/connection.js"
import { Query } from "../db/connection.js"
import jwt from 'jsonwebtoken'

const getUsers = async (req, res) => {
    try {
        const users = await Select('UsuariosView');

        res.status(200).json({
            ok: true,
            data: users,
            token: jwt.sign({ idUsuario: req.idUsuario }, process.env.JWT_KEY, { expiresIn: '1h', })
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            response: error.message
        })
    }
}

const getRolesUsuario = async (req, res) => {
    try {
        const roles = await Select('roles');

        res.status(200).json({
            ok: true,
            data: roles
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            response: error.message
        })
    }
}

//Para registrar infracciones
const registrarInfraccion = async (req, res) => {
    try {
        //Extraccion de datos desde el post
        const { folio, fecha_infraccion, lugar, descripcion, id_estatus_infraccion } = req.body;

        //Obtencion del id del oficial que registra la infraccion
        const id_usuario_registro = req.idUsuario;

        //Validacion de campos obligatorios
        if (!folio || !lugar || !id_estatus_infraccion) {
            return res.status(400).json({ message: "Faltan campos obligatorios (folio, lugar o estatus de infraccion)" });
        }

        //Query para para llamar al procedimiento almacenado
        const query = `CALL sp_registrar_infraccion(?,?,?,?,?,?)`;

        const values = [
            folio,
            fecha_infraccion || new Date(),
            lugar,
            descripcion || '',
            id_estatus_infraccion,
            id_usuario_registro
        ];

        //Ejecucion de la consulta
        const [rows] = await Query(query, values);

        return res.status(201).json({
            ok: true,
            response: "Infraccion creada",
            data: { folio, lugar }
        })
    } catch (error) {
        console.error("Error al registrar infraccion: ", error);
        return res.status(500).json({
            ok: false,
            response: "Error en el servidor al guardar infraccion"
        });
    }
}

export { getUsers, getRolesUsuario, registrarInfraccion };