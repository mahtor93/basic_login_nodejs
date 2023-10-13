import jwt from 'jsonwebtoken';
import { Usuario } from '../models/usuario.model.js'

const protegerRuta = async (req,res,next) =>{
    //verificación de Token
    const { UserToken } = req.cookies;
    if(!UserToken){
        return res.redirect('/auth/login');
    }
    try{
        //Comprobar el token
        const decoded = jwt.verify(UserToken, /*process.env.JWT_SECRET*/);
        const usuario = await Usuario.scope('eliminarDatos').findByPk(decoded.id);
        //almacenar el usuario al req.
        if(usuario){
            req.usuario = usuario
        }else{
            return res.redirect('/auth/login')
        }
        return next();
    }catch(error){
        return res.clearCookie('UserToken').redirect('/auth/login');
    }
}

export default protegerRuta;