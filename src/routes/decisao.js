const express = require('express')
const router = express.Router()
const { autenticarMedico } = require('../middlewares/auth')

router.use(autenticarMedico)

router.post('/decisao/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { decisao, orientacoes } = req.body
    
    console.log('Decisao:', { id, decisao, orientacoes })
    
    return res.json({
      success: true,
      status: decisao === 'APROVAR' ? 'APROVADO' : 'RECUSADO',
      mensagem: decisao === 'APROVAR' ? 'Receita enviada via WhatsApp' : 'Paciente notificado'
    })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
})

router.post('/atendimento/:id/liberar', async (req, res) => {
  try {
    const { id } = req.params
    console.log('Liberando atendimento:', id)
    return res.json({ success: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
})

module.exports = router
