const db = require('../db-supabase-hybrid')
const config = require('../config')
const { safeDecrypt } = require('../utils/crypto')

function mascararTelefone(telefone) {
  if (!telefone) return ''
  return telefone.replace(/(\d{2})\d{5}(\d{4})/, '\*****\')
}

function mascararCPF(cpf) {
  if (!cpf) return ''
  return cpf.replace(/(\d{3})\d{3}(\d{3}\d{2})/, '\***\')
}

function formatarAtendimento(a, mascarar = true) {
  const dadosClinicos = a.dados_clinicos || a.triagem || {}
  const telefone = safeDecrypt(a.paciente_telefone)
  const cpf = safeDecrypt(a.paciente_cpf)
  return {
    id: a.id,
    paciente_nome: safeDecrypt(a.paciente_nome),
    paciente_telefone: mascarar ? mascararTelefone(telefone) : telefone,
    paciente_cpf: mascarar ? mascararCPF(cpf) : cpf,
    doencas: dadosClinicos.doenca || 'N/A',
    medicacao_em_uso: dadosClinicos.medicacao_em_uso || 'N/A',
    status: a.status,
    elegivel: a.elegivel,
    criado_em: a.criado_em
  }
}

async function iniciarAtendimento(req, res) {
  try {
    const at = await db.buscarAtendimentoPorId(req.params.id)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    if (at.status !== config.ESTADOS_FLUXO.FILA) {
      return res.status(400).json({ error: 'Status invalido: ' + at.status })
    }
    await db.atualizarStatus(req.params.id, config.ESTADOS_FLUXO.EM_ATENDIMENTO)
    return res.json({ success: true, message: 'Atendimento iniciado' })
  } catch (e) {
    console.error('iniciarAtendimento:', e.message)
    return res.status(500).json({ error: 'Erro ao iniciar atendimento' })
  }
}

async function moverParaProntoDecisao(req, res) {
  try {
    const at = await db.buscarAtendimentoPorId(req.params.id)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    if (at.status !== config.ESTADOS_FLUXO.EM_ATENDIMENTO) {
      return res.status(400).json({ error: 'Status invalido: ' + at.status })
    }
    await db.atualizarStatus(req.params.id, config.ESTADOS_FLUXO.PRONTO_PARA_DECISAO)
    return res.json({ success: true, message: 'Paciente movido para PRONTO_PARA_DECISAO' })
  } catch (e) {
    console.error('moverParaProntoDecisao:', e.message)
    return res.status(500).json({ error: 'Erro ao atualizar status' })
  }
}

async function listarFila(req, res) {
  try {
    const fila = await db.getFilaValida()
    const atendimentos = fila.map(a => formatarAtendimento(a, false))
    return res.json({ total: atendimentos.length, atendimentos })
  } catch (e) {
    console.error('listarFila:', e.message)
    return res.status(500).json({ error: 'Erro ao listar fila' })
  }
}

async function listarAtendimentos(req, res) {
  try {
    const atendimentos = await db.getAtendimentos()
    const formatados = atendimentos.map(a => formatarAtendimento(a, true))
    return res.json(formatados)
  } catch (e) {
    console.error('listarAtendimentos:', e.message)
    return res.status(500).json({ error: 'Erro ao listar atendimentos' })
  }
}

async function buscarAtendimento(req, res) {
  try {
    const at = await db.buscarAtendimentoPorId(req.params.id)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    return res.json(formatarAtendimento(at, false))
  } catch (e) {
    console.error('buscarAtendimento:', e.message)
    return res.status(500).json({ error: 'Erro ao buscar atendimento' })
  }
}

async function estatisticas(req, res) {
  try {
    const stats = await db.getEstatisticas()
    return res.json(stats || { total: 0 })
  } catch (e) {
    console.error('estatisticas:', e.message)
    return res.status(500).json({ error: 'Erro ao carregar estatisticas' })
  }
}

async function pegarProximo(req, res) {
  try {
    const atendimentos = await db.getAtendimentos()
    const proximo = atendimentos.find(a => a.pagamento && a.status === config.ESTADOS_FLUXO.FILA)
    if (!proximo) {
      return res.status(404).json({ error: 'Nenhum paciente na fila' })
    }
    await db.atualizarStatus(proximo.id, config.ESTADOS_FLUXO.EM_ATENDIMENTO)
    return res.json({ success: true, atendimento: formatarAtendimento(proximo, false) })
  } catch (e) {
    console.error('pegarProximo:', e.message)
    return res.status(500).json({ error: 'Erro ao pegar proximo atendimento' })
  }
}

module.exports = { iniciarAtendimento, moverParaProntoDecisao, listarFila, listarAtendimentos, buscarAtendimento, estatisticas, pegarProximo }
