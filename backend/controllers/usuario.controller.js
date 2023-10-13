import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import Usuario from '../models/usuario.model.js';
import { generarId, makeJWT } from '../utilities/token.js';
import { emailRecuperacion, emailRegistro } from '../utilities/emails.js';
import  ValidarClave  from '../utilities/validaciones.js';


const formularioLogin = (req,res) =>{
    res.render('auth/login',{
        tituloPagina: 'Inciar sesión',
        csrfToken: req.csrfToken(),
    });
};

//la aplicación revisa las credenciales
const autenticarLogin = async (req,res)=>{
    await check('email').notEmpty().withMessage('El Mail es obligatorio').run(req);
    await check('password').notEmpty().withMessage('Ingresa una clave').run(req);
    const resultado = validationResult(req);
    if(!resultado.isEmpty()){
        return res.render('auth/login',{
            tituloPagina:'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        });
    }

    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email }});
    if(!usuario){
        return res.render('auth/login',{
            tituloPagina: 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario no existe'}],
        });
    }

    if(!usuario.confirmado){
        return res.render('auth/login',{
            tituloPagina: 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg:'No has confirmado tu cuenta'}],
            usuario:{
                email:req.body.email
            },
        });
    }

    if(!usuario.verificarPassword(password)){
        return res.render('auth/login',{
            tituloPagina: 'Iniciar sesión',
            csrfToken: req.csrfToken(),
            errores:[{msg:'Clave incorrecta'}],
            usuario:{
                email:req.body.email,
            },
        });
    }

    const token = makeJWT({
        id: usuario.id,
        mail: usuario.email,
        nombre: usuario.nombre,
    });

    return res.cookie('UserToken',token,{
        httpOnly:true,
        //secure:true
    }).redirect('/perfil');
};
//la aplicación valida los campos del formulario de registro
const formularioRegistro = (req,res) =>{
    
    res.render('auth/registro',{
        tituloPagina: 'Crear cuenta',
        csrfToken: req.csrfToken(),
    });
};
//la aplicación inscribe al usuario en la BD
const registrar = async (req,res) =>{
    try {
        await check('nombre').notEmpty().withMessage('Debes ingresar tu nombre').run(req);
        await check('nickname').notEmpty().withMessage('Debes ingresar tu apodo').run(req);
        await check('apellido_uno').notEmpty().withMessage('Debes ingresar tu apellido').run(req);
        await check('apellido_dos').notEmpty().withMessage('Debes ingresar tu otro apellido').run(req);
        //validar nacto.
        await check('email').notEmpty().withMessage('Debes ingresar tu email').run(req);
        await check('email').isEmail().withMessage('Email no válido').run(req);
        await check('password').notEmpty().withMessage('Debes ingresar una clave').run(req);
        await check('password').isLength({min:6}).withMessage('La clave debe ser de al menos 6 caracteres').run(req);
        if(!ValidarClave(req.body.password, req.body.repetir_password)){
            await check(req.body.repetir_password).equals(req.body.password).withMessage('Las claves no coinciden').run(req);
        }

        const resultado = validationResult(req);
        if(!resultado.isEmpty()){
            return res.render('auth/registro',{
                tituloPagina: 'Crear cuenta',
                csrfToken: req.csrfToken(),
                errores: resultado.array(),
                usuario:{
                    nickname:req.body.nickname,
                    email: req.body.email
                },
            });
        }

        const correoDuplicado = await Usuario.findOne({where:{ email: req.body.email }});
        if(correoDuplicado){
            return res.render('auth/registro',{
                tituloPagina:'Crear cuenta',
                csrfToken: req.csrfToken(),
                errores:[{msg: 'El correo ya está registrado, utiliza otro o recupera tu clave'}],
                usuario:{
                    nombre: req.body.nombre,
                    apellido_uno: req.body.apellido_uno,
                    apellido_dos: req.body.apellido_dos,
                    nickname: req.body.nickname,
                    nacto: req.body.nacto,
                    email:req.body.email,
                },
            });
        }

        const nickDuplicado = await Usuario.findOne({where:{ nickname: req.body.nickname }});
        if(nickDuplicado){
            return res.render('auth/registro',{
                tituloPagina:'Crear cuenta',
                csrfToken: req.csrfToken(),
                errores:[{msg: 'El apodo ya está en uso, elige otro'}],
                usuario:{
                    nombre: req.body.nombre,
                    apellido_uno: req.body.apellido_uno,
                    apellido_dos: req.body.apellido_dos,
                    nickname: req.body.nickname,
                    nacto: req.body.nacto,
                    email:req.body.email,
                },
            });
        }

        req.body.token = generarId();
        const usuario = await Usuario.create(req.body);

        res.render('templates/mensaje',{
            tituloPagina: 'Cuenta creada',
            mensajes: [{msg:`Enviamos un correo de verificación a ${req.body.email}`}],
        });

        emailRegistro({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token,
        });

    }catch(error){
        throw error;
    }
};
//la aplicación cambia los permisos del usuario
const confirmar = async (req,res,next) =>{
    const { token } = req.params;
    const usuario = await Usuario.findOne({where:{token}});
    if(!usuario){
        return res.render('auth/cuenta-confirmada',{
            tituloPagina:'Error de autenticación',
            mensaje: 'Hubo un error al confirmar tu cuenta',
            error: true,
        });
    }else{
        usuario.token = null;
        usuario.confirmado = true;
        return res.render('auth/cuenta-confirmada',{
            tituloPagina: 'Autenticacion Completa',
            mensaje: 'Tu cuenta ha sido confirmada',
        });
    }
};
//la aplicación renderiza el formulario para recuperar clave
const formularioOlvidePassword = (req,res) =>{
    res.render('auth/se-me-olvido',{
        tituloPagina: 'Recuperar clave',
        csrfToken: req.csrfToken(),
    });
};
//renderiza y monitorea el formulario para recuperar clave
const resetPassword = async (req,res) =>{
    try{
        await check('email').notEmpty().withMessage('Ingresa tu email').run(req);
        await check('email').isEmail().withMessage('Ingresa un email válido').run(req);

        const resultado = validationResult(req);
        if(!resultado.isEmpty()){
            return res.render('auth/se-me-olvido',{
                tituloPagina: 'Recuperar clave',
                csrfToken: req.csrfToken(),
                errores: resultado.array(),
            });
        }

        const { email } = req.body;
        const usuario = await Usuario.findOne({where:{email}});
        if(!usuario){
            return res.render('auth/se-me-olvido',{
                tituloPagina: 'Recuperar clave',
                csrfToken: req.csrfToken(),
                erroreS:[{msg:'El email ingresado no está registrado'}],
                usuario:{
                    email,
                },
            });
        }

        usuario.token = generarId();
        await usuario.save();
        emailRecuperacion({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token,
        });

        res.render('auth/se-me-olvido',{
            tituloPagina:'Recuperar clave',
            mensajes: [{msg:`Enviamos un correo de recuperación a ${req.body.email}`}],
        });

    }catch(error){
        throw error;
    }
}
//renderiza el formulario para recuperar la clave
const comprobarToken = async (req,res, next) =>{
    try{
        const { token } = req.params;
        const usuario = await Usuario.findOne({where:{token}});
        if(!usuario){
            return res.render('templates/mensaje',{
                tituloPagina: 'Recuperar clave',
                mensajes: [{msg: 'Hubo un error al validar tu información. Intenta otra vez'}],
                error: true,
            });
        }

        res.render('auth/reset-password',{
            tituloPagina: 'Crea una nueva Clave',
            csrfToken: req.csrfToken(),
        });

    }catch(error){
        throw error;
    }
}

const nuevoPassword = async (req,res) =>{
    try{
        await check('password').notEmpty().withMessage('Debes poner una clave').run(req);
        await check('password').isLength({min:6}).withMessage('El password debe ser de al menos 6 caracteres').run(req);
        if(!ValidarClave(req.body.password, req.body.repetir_password)){
            await check(req.body.repetir_password).equals(req.body.password).withMessage('Las claves no coinciden').run(req);
        }

        const resultado = validationResult(req);
        if(!resultado.isEmpty()){
            return res.render('auth/reset-password',{
                tituloPagina:'Recuperar clave',
                csrfToken: req.csrfToken(),
                errores: resultado.array(),
            });
        }

        const { token } = req.params;
        const { password } = req.body;
        const usuario = await Usuario.findOne({where:{token}});
        const salt = await bcrypt.genSalt(16);
        usuario.password = await bcrypt.hash(password, salt);

        usuario.token = null;
        await usuario.save();
        res.render('auth/cuenta-confirmada',{
            tituloPagina:'Clave reestablecida',
            mensaje:'La clave se ha cambiado con éxito.',
        });
    }catch(error){
        console.error(error);
    }
};

export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    autenticarLogin,
}