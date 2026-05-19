const express = require('express')
const router = express.Router()
const memedController = require('../controllers/memedController')
const { autenticarMedico } = require('../middlewares/auth')

router.post('/enviar', autenticarMedico, memedController.enviarReceita.bind(memedController))
router.get('/status/:receitaId', autenticarMedico, memedController.obterStatus.bind(memedController))

module.exports = router
