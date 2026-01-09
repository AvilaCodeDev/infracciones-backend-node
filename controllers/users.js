import { response } from "express";
import { Select } from "../db/connection.js"
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

const getRolesUsuario = async (req, res) =>{
    try{
        const roles = await Select('roles');

        res.status(200).json({
            ok: true,
            data: roles
        })
    }catch(error){
        res.status(500).json({
            ok: false,
            response: error.message
        })
    }
}


export { getUsers, getRolesUsuario };