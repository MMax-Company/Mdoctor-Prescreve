const express = require('express')
const router = express.Router()
const { autenticarMedico } = require('../middlewares/auth')

router.use(autenticarMedico)

router.get('/decisoes/log', (req, res) => {
  res.json({ decisoes: [] })
})

router.post('/decisao/:id', (req, res) => {
  res.json({ success: true })
})

router.get('/estatisticas/decisoes', (req, res) => {
  res.json({ total: 0, aprovadas: 0, recusadas: 0 })
})

module.exports = router
