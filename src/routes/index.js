const express = require('express')
const router = express.Router()

const triagemRoutes = require('./triagem')
const paymentRoutes = require('./payment')
const atendimentoRoutes = require('./atendimento')
const decisaoRoutes = require('./decisao')
const receitaRoutes = require('./receita')
const prontuarioRoutes = require('./prontuario')
const memedRoutes = require('./memed')
const suporteRoutes = require('./suporte')
const webhookRoutes = require('./webhookRoutes')

router.use(triagemRoutes)
router.use(paymentRoutes)
router.use(atendimentoRoutes)
router.use(decisaoRoutes)
router.use(receitaRoutes)
router.use(prontuarioRoutes)
router.use(memedRoutes)
router.use(suporteRoutes)
router.use(webhookRoutes)

module.exports = router
