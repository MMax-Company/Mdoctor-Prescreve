const db = require('../db-supabase-hybrid')
const config = require('../config')

class DecisaoController {
  async aprovar(req, res) {
    try {
      const { triagemId, observacoes } = req.body
      if (!triagemId) {
        return res.status(400).json({ erro: 'triagemId obrigatório' })
      }
      await db.atualizarStatus(triagemId, config.ESTADOS_FLUXO.APROVADO)
      res.json({
        triagemId,
        status: config.ESTADOS_FLUXO.APROVADO,
        observacoes,
        timestamp: new Date().toISOString()
      })
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }

  async recusar(req, res) {
    try {
      const { triagemId, motivo } = req.body
      if (!triagemId || !motivo) {
        return res.status(400).json({ erro: 'Dados obrigatórios faltando' })
      }
      await db.atualizarStatus(triagemId, config.ESTADOS_FLUXO.RECUSADO)
      res.json({
        triagemId,
        status: config.ESTADOS_FLUXO.RECUSADO,
        motivo,
        timestamp: new Date().toISOString()
      })
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }

  async obterDecisao(req, res) {
    try {
      const { triagemId } = req.params
      const triagem = await db.obterTriagem(triagemId)
      if (!triagem) {
        return res.status(404).json({ erro: 'Triagem não encontrada' })
      }
      res.json({
        triagemId,
        status: triagem.status,
        elegivel: triagem.elegivel
      })
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }
}

module.exports = new DecisaoController()
