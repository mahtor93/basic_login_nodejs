import express from 'express';
import cookieParser from 'cookie-parser';
import db from './config/db.config.js';
import usuarioRoutes from './src/routes/usuario.routes.js';
import csurf from 'csurf';

const app = express();
app.use( express.urlencoded({extended:true}));
app.use(cookieParser());
app.use( csurf({cookie:true}));

//conexion a la BD
try{
    await db.authenticate();
    db.sync();
    console.log('Conexión correcta a la base de datos');
}catch(error){
    console.error(error);
}

//definir puerto
const port = process.env.PORT;
app.listen(port,()=>{
    console.log('Server corriendo en el puerto: '+port);
})

//ruta de archivos de vistas
app.set('view engine', 'pug');
app.set('views','./views')
app.use(express.static('public'));

//routing
app.use('/auth', usuarioRoutes);
//app.use('/', otrasRoutes)