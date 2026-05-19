const express = require('express')
const router = express.Router()

const authRoutes = require('./auth')
const triagemRoutes = require('./triagem')
const paymentRoutes = require('./payment')
const atendimentoRoutes = require('./atendimento')
const decisaoRoutes = require('./decisao')
const receitaRoutes = require('./receita')
const memedRoutes = require('./memed')
const prontuarioRoutes = require('./prontuario')

router.use('/auth', authRoutes)
router.use('/triagem', triagemRoutes)
router.use('/payment', paymentRoutes)
router.use('/atendimento', atendimentoRoutes)
router.use('/decisao', decisaoRoutes)
router.use('/receita', receitaRoutes)
router.use('/memed', memedRoutes)
router.use('/prontuario', prontuarioRoutes)

module.exports = router
