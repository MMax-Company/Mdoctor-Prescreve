const express = require('express')
const router = express.Router()
const { autenticarMedico } = require('../middlewares/auth')
const { adicionarFilaSuporte, listarFilaSuporte, responderSuporte, listarPendentes, atenderChamado } = require('../controllers/suporteController')

router.post('/suporte/fila', adicionarFilaSuporte)
router.use(autenticarMedico)
router.get('/suporte/fila', listarFilaSuporte)
router.post('/suporte/fila/:id/responder', responderSuporte)
router.get('/suporte/pendentes', listarPendentes)
router.post('/suporte/atender/:id', atenderChamado)

module.exports = router
