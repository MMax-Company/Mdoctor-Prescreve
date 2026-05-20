const express = require('express')
const router = express.Router()
const { autenticarMedico } = require('../middlewares/auth')

router.use(autenticarMedico)

router.post('/atendimento/:id/iniciar', (req, res) => {
  res.json({ success: true, status: 'EM_ATENDIMENTO' })
})

router.post('/atendimento/:id/pronto-decisao', (req, res) => {
  res.json({ success: true, status: 'PRONTO_PARA_DECISAO' })
})

router.get('/fila', (req, res) => {
  res.json({ total: 0, fila: [] })
})

router.get('/atendimentos', (req, res) => {
  res.json({ total: 0, atendimentos: [] })
})

router.get('/atendimento/:id', (req, res) => {
  res.json({ id: req.params.id })
})

router.get('/estatisticas', (req, res) => {
  res.json({ total: 0, fila: 0, emAtendimento: 0, aprovados: 0, recusados: 0 })
})

router.post('/fila/pegar-proximo', (req, res) => {
  res.json({ success: true })
})

module.exports = router
