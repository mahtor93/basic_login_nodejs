import express from 'express';
import {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    autenticarLogin
} from '../../controllers/usuario.controller.js';

const router = express.Router();

router.get('/login', formularioLogin);
router.post('/login', autenticarLogin);

router.get('/registro',formularioRegistro);
router.post('/registro',registrar);

router.get('/confirmar/:token', confirmar);

router.get('/se-me-olvido', formularioOlvidePassword);
router.post('/se-me-olvido', resetPassword);

router.get('/se-me-olvido/:token', comprobarToken);
router.post('/se-me-olvido/:token', nuevoPassword);

router.post('/auth/login', (req,res)=>{
    res.json({msg:'Login'})
})

export default router;


