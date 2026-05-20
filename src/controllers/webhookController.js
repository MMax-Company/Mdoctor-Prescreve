const db = require('../db-supabase-hybrid')
const { transicaoValida, TRANSICOES_VALIDAS } = require('../config')

async function webhookAtualizarStatus(req, res) {
  try {
    const { atendimentoId, status, observacao, payload } = req.body || {}
    if (!atendimentoId || !status) {
      return res.status(400).json({ error: 'atendimentoId e status sao obrigatorios' })
    }
    const at = await db.buscarAtendimentoPorId(atendimentoId)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    if (!transicaoValida(at.status, status)) {
      return res.status(400).json({
        error: 'Transicao invalida: ' + at.status + ' -> ' + status,
        permitidos: TRANSICOES_VALIDAS[at.status] || []
      })
    }
    const metadata = {
      webhook: true,
      atualizado_em: new Date().toISOString(),
      observacao: observacao || null,
      payload: payload || null
    }
    await db.atualizarStatus(atendimentoId, status, metadata)
    console.log('Status atualizado: ' + atendimentoId + ' -> ' + status)
    return res.json({
      success: true,
      atendimentoId,
      status_anterior: at.status,
      status_novo: status
    })
  } catch (e) {
    console.error('webhookAtualizarStatus:', e.message)
    return res.status(500).json({ error: 'Erro ao atualizar status' })
  }
}

module.exports = { webhookAtualizarStatus }
