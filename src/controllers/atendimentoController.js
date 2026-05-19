const db = require('../db-supabase-hybrid')
const config = require('../config')

class AtendimentoController {
  async iniciar(req, res) {
    try {
      const { triagemId } = req.body
      if (!triagemId) {
        return res.status(400).json({ erro: 'triagemId obrigatório' })
      }
      const triagem = await db.obterTriagem(triagemId)
      if (!triagem) {
        return res.status(404).json({ erro: 'Triagem não encontrada' })
      }
      await db.atualizarStatus(triagemId, config.ESTADOS_FLUXO.EM_ATENDIMENTO)
      res.json({
        triagemId,
        status: config.ESTADOS_FLUXO.EM_ATENDIMENTO,
        paciente: triagem.paciente_nome,
        medicamento: triagem.medicamento
      })
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }

  async finalizarAtendimento(req, res) {
    try {
      const { triagemId, observacoes } = req.body
      await db.atualizarStatus(triagemId, config.ESTADOS_FLUXO.PRONTO_PARA_DECISAO)
      res.json({
        triagemId,
        status: config.ESTADOS_FLUXO.PRONTO_PARA_DECISAO,
        observacoes
      })
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }

  async listarFila(req, res) {
    try {
      const fila = await db.obterTriagensElegiveis()
      res.json({
        total: fila.length,
        pacientes: fila
      })
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }
}

module.exports = new AtendimentoController()
