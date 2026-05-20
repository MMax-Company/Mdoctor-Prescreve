const express = require('express')
const router = express.Router()
const { criarPagamento, statusPagamento, webhookStripe } = require('../controllers/paymentController')

router.get('/payment/:id', criarPagamento)
router.get('/payment/status/:id', statusPagamento)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), webhookStripe)

module.exports = router
