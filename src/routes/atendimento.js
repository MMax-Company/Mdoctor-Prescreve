const express = require('express')
const router = express.Router()
const atendimentoController = require('../controllers/atendimentoController')
const { autenticarMedico } = require('../middlewares/auth')

router.post('/iniciar', autenticarMedico, atendimentoController.iniciar.bind(atendimentoController))
router.post('/finalizar', autenticarMedico, atendimentoController.finalizarAtendimento.bind(atendimentoController))
router.get('/fila', autenticarMedico, atendimentoController.listarFila.bind(atendimentoController))

module.exports = router
