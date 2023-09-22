import path from 'path'

export default {
    mode: 'development',
    entry:{
        mapLocation: './src/js/mapLocation.js',
        agregarImagen: '/src/js/agregarImagen.js',
    },
    output:{
        filename: '[name].js',
        path: path.resolve('public/js'),
    },
}