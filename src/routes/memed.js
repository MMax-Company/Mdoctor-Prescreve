const express = require('express')
const router = express.Router()
const { autenticarMedico } = require('../middlewares/auth')
const { getTokenMemed, getStatusMemed, criarPrescricaoMemed, webhookMemed } = require('../controllers/memedController')

router.use(autenticarMedico)
router.get('/memed/token', getTokenMemed)
router.get('/memed/status', getStatusMemed)
router.post('/memed/prescricao', criarPrescricaoMemed)
router.post('/webhooks/memed', webhookMemed)

module.exports = router
