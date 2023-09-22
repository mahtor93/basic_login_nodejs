import nodemailer from 'nodemailer';

const emailRegistro = async (datos) =>{
    const transport = nodemailer.createTransport({
        /*
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
        */
    });
    const { email,nombre,token } = datos;

    //enviar mail
    await transport.sendMail({
        from: 'Registro de usuario',
        to: email,
        subject: 'Confirma tu cuenta',
        text:'Confirma tu cuenta',
        html:`<p>Hola ${nombre}! para continuar, por favor, confirma tu cuenta</p>
        <p>Tu cuenta ya está lista, sólo debes confirmarla en el siguiente link:
        <a href="${process.env.BACKED_URL}:${proces.env.PORT}/auth/confirmar/${token}">Confirmar cuenta</a></p>
        <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>`
    })
}

const emailRecuperacion = async (datos) =>{
    const transport = nodemailer.createTransport({
        /*
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
        */
    });
    const{ email,nombre,token } = datos;

    //enviar mail
    await transport.sendMail({
        from: 'Administracion',
        to: email,
        subject: 'Recuperación de clave',
        text: 'Recupera tu password',
        html:`<p>Hola ${nombre}, para recuperar tu clave</p>
        <p>Ingresa en el siguiente link: </p>
        <a href="${process.env.BACKED_URL}:${process.env.PORT}/auth/se-me-olvido/${token}">Recuperar clave</a></p>
        <p>Si tu no solicitaste una recuperación, puedes ignorar este mensaje</p>
        `

    })

}

export{
    emailRegistro, emailRecuperacion
}