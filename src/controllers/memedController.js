const crypto = require('crypto')
const db = require('../db-supabase-hybrid')
const memed = require('../services/memedIntegration')
const { ESTADOS_FLUXO } = require('../config')
const { safeDecrypt } = require('../utils/crypto')
const { enviarWhatsAppOficial } = require('../services/whatsappService')

async function getTokenMemed(req, res) {
  try {
    if (!memed || typeof memed.gerarTokenPrescritor !== 'function') {
      return res.json({ token: crypto.randomBytes(32).toString('hex'), fallback: true })
    }
    const token = await memed.gerarTokenPrescritor()
    return res.json({ token })
  } catch (e) {
    console.error('getTokenMemed:', e.message)
    return res.status(500).json({ error: 'Erro ao gerar token' })
  }
}

async function getStatusMemed(req, res) {
  try {
    if (!memed || typeof memed.verificarStatusConta !== 'function') {
      return res.json({ online: false, fallback: true })
    }
    const status = await memed.verificarStatusConta()
    return res.json(status)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

async function criarPrescricaoMemed(req, res) {
  try {
    const { atendimentoId, medicamento, posologia, observacao } = req.body
    if (!atendimentoId) {
      return res.status(400).json({ error: 'atendimentoId obrigatorio' })
    }
    const at = await db.buscarAtendimentoPorId(atendimentoId)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    const resultado = await memed.gerarPrescricaoMemed(
      { paciente_nome: at.paciente_nome, paciente_cpf: at.paciente_cpf },
      medicamento,
      posologia,
      observacao
    )
    if (!resultado || !resultado.success) {
      return res.status(500).json({ error: resultado?.error || 'Erro ao gerar prescricao' })
    }
    await db.atualizarStatus(atendimentoId, ESTADOS_FLUXO.RECEITA_EMITIDA, {
      memed_prescription_id: resultado.prescriptionId,
      memed_pdf_url: resultado.pdfUrl
    })
    return res.json({ success: true, prescriptionId: resultado.prescriptionId, pdfUrl: resultado.pdfUrl })
  } catch (e) {
    console.error('criarPrescricaoMemed:', e.message)
    return res.status(500).json({ error: e.message })
  }
}

async function webhookMemed(req, res) {
  try {
    const body = req.body || {}
    const signature = req.headers['x-memed-signature']
    if (process.env.MEMED_WEBHOOK_SECRET) {
      const expected = crypto.createHmac('sha256', process.env.MEMED_WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex')
      if (signature !== expected) {
        return res.status(401).json({ error: 'Assinatura invalida' })
      }
    }
    const tipo = body.type || body.event
    if (tipo === 'prescription.completed') {
      const data = body.data || body.prescription || {}
      const atendimentoId = data.patient_external_id
      const atendimento = await db.buscarAtendimentoPorId(atendimentoId)
      if (atendimento) {
        await db.atualizarStatus(atendimento.id, ESTADOS_FLUXO.RECEITA_EMITIDA, {
          memed_prescription_id: data.external_id,
          memed_pdf_url: data.pdf_url,
          receita_emitida_em: new Date().toISOString()
        })
      }
    }
    return res.status(200).send('OK')
  } catch (e) {
    console.error('webhookMemed:', e.message)
    return res.status(400).send('Bad Request')
  }
}

module.exports = {
  getTokenMemed,
  getStatusMemed,
  criarPrescricaoMemed,
  webhookMemed
}
