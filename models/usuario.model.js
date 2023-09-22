import { DataTypes } from "sequelize";
import bcrypt from 'bcrypt';
import db from '../config/db.config.js'

const Usuario = db.define('usuarios',{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true    
    },
    nombre:{
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido_pat:{
        type:DataTypes.STRING,
        allownull:false
    },
    apellido_mat:{
        type: DataTypes.STRING,
        allowNull:false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    password:{
        type: DataTypes.STRING,
        allowNull:false
    },
    nickname:{
        type: DataTypes.STRING,
        allowNull: false
    },
    nacto:{
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    token:{
        type: DataTypes.STRING
    },
    confirmado:{
        type:DataTypes.BOOLEAN
    }
},{
    hooks:{
        //hash del passwd
        beforeCreate: async function(usuario){
            const salt = await bcrypt.genSalt(16)
            usuario.password = await bcrypt.hash(usuario.password, salt);
        }
    },
    scopes:{
        eliminarDatos:{
            attributes:{
                exclude:['password','token','confirmado','createdAt','updateAt']
            }
        }
    }
})

Usuario.prototype.verificarPassword = function(passwd){
    return bcrypt.compareSync(passwd, this.password);
}

export default Usuario;