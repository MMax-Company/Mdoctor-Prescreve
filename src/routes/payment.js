const express = require('express')
const router = express.Router()
const paymentController = require('../controllers/paymentController')
const { autenticarMedico } = require('../middlewares/auth')

router.post('/intencao', paymentController.criarIntencao.bind(paymentController))
router.post('/confirmar', autenticarMedico, paymentController.confirmarPagamento.bind(paymentController))
router.get('/status/:paymentIntentId', paymentController.obterStatus.bind(paymentController))

module.exports = router
