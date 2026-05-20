const express = require('express')
const router = express.Router()
const expressRaw = express.raw({ type: 'application/json' })
const { webhookAtualizarStatus } = require('../controllers/webhookController')
const { webhookMemed } = require('../controllers/memedController')
const { webhookAuth } = require('../middlewares/auth')

router.post('/webhook/stripe', expressRaw, (req, res) => {
  res.json({ received: true })
})

router.post('/webhooks/memed', express.json(), webhookMemed)

router.post('/api/webhook/atualizar-status', webhookAuth, webhookAtualizarStatus)

router.post('/api/webhook/receita', webhookAuth, webhookMemed)

module.exports = router
