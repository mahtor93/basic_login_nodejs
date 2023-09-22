import Usuario  from "./usuario.model";
/*
Este archivo genera las relaciones para las tablas de la base de datos.
EJ:
PT_GPS.belongsTO(Mision, { foreignKey:'FK_id_PT_GPS})
la línea anterior pone la foránea de la tabla PT_GPS en la tabla Mision, para hacer referencia a la primera desde la segunda y asociar un punto gps a la misión
*/

export { Usuario }