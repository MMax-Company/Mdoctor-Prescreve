const db = require('../db-supabase-hybrid')
const { enviarWhatsAppOficial } = require('../services/whatsappService')

const chamadosSuporte = []

async function adicionarFilaSuporte(req, res) {
  try {
    const { telefone, nome, mensagem } = req.body || {}
    if (!telefone || !nome) {
      return res.status(400).json({ error: 'telefone e nome sao obrigatorios' })
    }
    const chamado = {
      id: Date.now().toString(),
      telefone,
      nome,
      mensagem: mensagem || '',
      status: 'PENDENTE',
      criado_em: new Date().toISOString(),
      atendido_em: null
    }
    if (typeof db.adicionarFilaSuporte === 'function') {
      try {
        const registro = await db.adicionarFilaSuporte(chamado)
        return res.status(201).json({ success: true, chamado: registro })
      } catch (e) {
        console.warn('fallback suporte memoria')
      }
    }
    chamadosSuporte.push(chamado)
    return res.status(201).json({ success: true, chamado })
  } catch (e) {
    console.error('adicionarFilaSuporte:', e.message)
    return res.status(500).json({ error: 'Erro ao adicionar suporte' })
  }
}

async function listarFilaSuporte(req, res) {
  try {
    if (typeof db.getFilaSuporte === 'function') {
      try {
        const fila = await db.getFilaSuporte()
        return res.json({ total: fila.length, fila })
      } catch (e) {
        console.warn('fallback fila suporte')
      }
    }
    const pendentes = chamadosSuporte.filter(c => c.status === 'PENDENTE')
    return res.json({ total: pendentes.length, fila: pendentes })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

async function responderSuporte(req, res) {
  try {
    const { resposta } = req.body || {}
    let chamado = null
    if (typeof db.responderFilaSuporte === 'function') {
      try {
        chamado = await db.responderFilaSuporte(req.params.id, resposta)
      } catch (e) {}
    }
    if (!chamado) {
      chamado = chamadosSuporte.find(c => c.id === req.params.id)
      if (!chamado) {
        return res.status(404).json({ error: 'Chamado nao encontrado' })
      }
      if (chamado.status === 'RESPONDIDO') {
        return res.status(400).json({ error: 'Chamado ja respondido' })
      }
      chamado.status = 'RESPONDIDO'
      chamado.resposta = resposta || ''
      chamado.atendido_em = new Date().toISOString()
    }
    if (chamado.telefone && resposta) {
      enviarWhatsAppOficial(chamado.telefone, 'Suporte Doctor Prescreve\n\n' + resposta, 'suporte').catch(console.error)
    }
    return res.json({ success: true, chamado })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

async function listarPendentes(req, res) {
  try {
    const pendentes = chamadosSuporte.filter(c => c.status === 'PENDENTE')
    return res.json({ total: pendentes.length, chamados: pendentes })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

async function atenderChamado(req, res) {
  try {
    const chamado = chamadosSuporte.find(c => c.id === req.params.id)
    if (!chamado) {
      return res.status(404).json({ error: 'Chamado nao encontrado' })
    }
    chamado.status = 'ATENDIDO'
    chamado.atendido_em = new Date().toISOString()
    return res.json({ success: true, chamado })
  } catch (e) {
    console.error('atenderChamado:', e.message)
    return res.status(500).json({ error: 'Erro ao atender chamado' })
  }
}

module.exports = {
  adicionarFilaSuporte,
  listarFilaSuporte,
  responderSuporte,
  listarPendentes,
  atenderChamado
}
