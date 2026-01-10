import { response } from "express";
import { Select, callStoredFunction, callStoredProcedure } from "../db/connection.js"
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

const createUser = async (req, res) => {
    try {
        const { correo, nombre_completo, numero_empleado, telefono, rol } = req.body;
        const password = correo.split('@')[0] + numero_empleado;
        const dependencia = 'ssc';

        const [result] = await callStoredFunction('f_registrar_usuario',
            [
                +numero_empleado,
                nombre_completo,
                correo,
                telefono,
                dependencia,
                '',
                password,
                +rol,
            ]);
        console.log(result);

        if (result.result == 0) {
            return res.status(400).json({
                ok: false,
                response: "Usuario no creado",
            });
        }
        return res.status(200).json({
            ok: true,
            response: "Usuario creado exitosamente",
            data: {
                id: result.result,
                correo,
                nombre_completo,
                numero_empleado,
                telefono,
                rol
            }
        });

    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            ok: false,
            response: error.message
        })
    }
}

//TODO AgregarUsuario

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


export { getUsers, getRolesUsuario, createUser };