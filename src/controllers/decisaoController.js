const db = require('../db-supabase-hybrid')
const config = require('../config')
const { safeDecrypt } = require('../utils/crypto')
const { sanitizarHTML } = require('../utils/validators')
const { enviarWhatsAppOficial } = require('../services/whatsappService')

async function logDecisoes(req, res) {
  try {
    const logs = await db.getDecisoesLog()
    return res.json(logs || [])
  } catch (e) {
    console.error('logDecisoes:', e.message)
    return res.status(500).json({ error: 'Erro ao carregar logs' })
  }
}

async function registrarDecisao(req, res) {
  try {
    const { id } = req.params
    const { decisao, orientacoes, medicamento, posologia } = req.body
    const at = await db.buscarAtendimentoPorId(id)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    const aprovacao = decisao === 'APROVAR' || decisao === config.ESTADOS_FLUXO.APROVADO
    const novoStatus = aprovacao ? config.ESTADOS_FLUXO.APROVADO : config.ESTADOS_FLUXO.RECUSADO
    const decisaoData = {
      status: novoStatus,
      data: new Date().toISOString(),
      medico: 'medico',
      observacao: sanitizarHTML(orientacoes || ''),
      medicamento_prescrito: medicamento || null,
      posologia: posologia || null
    }
    await db.atualizarStatus(id, novoStatus, decisaoData)
    const telefone = safeDecrypt(at.paciente_telefone)
    const nome = safeDecrypt(at.paciente_nome)
    if (telefone) {
      const msg = aprovacao ? 'Sua receita foi aprovada!' : 'Sua solicitacao nao foi aprovada.'
      enviarWhatsAppOficial(telefone, msg).catch(console.error)
    }
    return res.json({ success: true, status: novoStatus })
  } catch (e) {
    console.error('registrarDecisao:', e.message)
    return res.status(500).json({ error: 'Erro ao registrar decisao' })
  }
}

async function revisarDecisao(req, res) {
  try {
    const { id } = req.params
    const { novaDecisao, motivoRevisao } = req.body
    const at = await db.buscarAtendimentoPorId(id)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    const statusAnterior = at.status
    const aprovacao = novaDecisao === 'APROVAR'
    const novoStatus = aprovacao ? config.ESTADOS_FLUXO.APROVADO : config.ESTADOS_FLUXO.RECUSADO
    await db.atualizarStatus(id, novoStatus, { observacao: motivoRevisao || '' })
    return res.json({ success: true, status_anterior: statusAnterior, status_novo: novoStatus })
  } catch (e) {
    console.error('revisarDecisao:', e.message)
    return res.status(500).json({ error: 'Erro ao revisar decisao' })
  }
}

async function estatisticasDecisoes(req, res) {
  try {
    const logs = await db.getDecisoesLog()
    const aprovados = logs.filter(l => l.decisao === 'APROVADO').length
    const recusados = logs.filter(l => l.decisao === 'RECUSADO').length
    return res.json({
      total_decisoes: logs.length,
      aprovados: { total: aprovados, percentual: logs.length > 0 ? ((aprovados / logs.length) * 100).toFixed(2) : 0 },
      recusados: { total: recusados, percentual: logs.length > 0 ? ((recusados / logs.length) * 100).toFixed(2) : 0 }
    })
  } catch (e) {
    console.error('estatisticasDecisoes:', e.message)
    return res.status(500).json({ error: 'Erro ao carregar estatisticas' })
  }
}

module.exports = { logDecisoes, registrarDecisao, revisarDecisao, estatisticasDecisoes }
