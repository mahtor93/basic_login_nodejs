/*permite crear campos por defecto en la base de datos.
es útil para los dropdowns donde el usuario tiene que elegir de una paleta de opciones
para generar un registro en la base de datos
*/

import { exit } from 'node:process';
/*Importar otros seeds de la carpeta */
import db from '../config/db.config.js';
import{ Usuario } from '../models/index.model.js';
/*Importar los modelos a utilizar*/

const importarDatos = async () =>{
    try{
        await db.authenticate();
        await db.sync();
        await Promise.all([
            /*Relacionar modelo con su respectivo seed. 
            EJ: Usuario.bulkCreate(seedUsuarios),
            
            */
        ])
        exit(0);

    }catch(error){
        console.log(error);
        exit(1);
    }
}

const eliminarDatos = async () => {
    try{
        await Promise.all([
            /*Eliminar un determinado seed.
            EJ: Usuario.destroy({ where: {}, truncate: true}),
            */
        ])
        exit(0);
    }catch(error){
        console.log(error);
        exit(1);
    }
}

//si se añade -i al comando de inicialización, se importan los datos
if(process.argv[2] === "-i"){
    importarDatos();
}

//si se añade -i al comando de inicialización, se eliminan los datos
if(process.argv[2] === "-e"){
    eliminarDatos();
}