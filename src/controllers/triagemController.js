const { v4: uuidv4 } = require('uuid')
const db = require('../db-supabase-hybrid')
const config = require('../config')
const { encrypt } = require('../utils/crypto')
const { validarTelefone, validarCPF, sanitizarHTML } = require('../utils/validators')
const { detectarTipo, normalizarDoencas } = require('../services/clinicalEngine')
const { enviarWhatsAppOficial } = require('../services/whatsappService')

async function triagem(req, res) {
  try {
    const body = req.body || {}
    let paciente = body.paciente || { nome: body.nome, telefone: body.telefone, cpf: body.cpf, email: body.email }
    let triagem = body.triagem || { doencas: body.doencas, medicacao_em_uso: body.medicacao_em_uso, tempo_doenca: body.tempo_doenca }
    
    if (!paciente.nome || paciente.nome.trim().length < 3) {
      return res.status(400).json({ error: 'Nome invalido' })
    }
    if (!validarTelefone(paciente.telefone)) {
      return res.status(400).json({ error: 'Telefone invalido' })
    }
    if (paciente.cpf && !validarCPF(paciente.cpf)) {
      return res.status(400).json({ error: 'CPF invalido' })
    }
    if (!triagem.doencas) {
      return res.status(400).json({ error: 'Doenca nao informada' })
    }
    
    const id = uuidv4()
    const texto = normalizarDoencas(triagem.doencas)
    const tipo = detectarTipo(texto)
    const doencasElegiveis = ['has', 'diabetes', 'hipertensao', 'hipotireoidismo', 'dislipidemia']
    const elegivel = doencasElegiveis.some(d => texto.includes(d))
    
    const atendimento = {
      id,
      paciente_nome: encrypt(paciente.nome),
      paciente_cpf: encrypt(paciente.cpf || ''),
      paciente_telefone: encrypt(paciente.telefone || ''),
      paciente_email: encrypt(paciente.email || ''),
      dados_clinicos: {
        doenca: texto,
        tipo,
        medicacao_em_uso: triagem.medicacao_em_uso || null,
        tempo_doenca: triagem.tempo_doenca || null,
        elegivel_protocolo: elegivel
      },
      elegivel,
      status: elegivel ? config.ESTADOS_FLUXO.AGUARDANDO_PAGAMENTO : config.ESTADOS_FLUXO.INELEGIVEL,
      pagamento: false,
      criado_em: new Date().toISOString()
    }
    
    await db.salvarAtendimento(atendimento)
    
    if (elegivel) {
      const url = config.BASE_URL + '/api/payment/' + id
      const msg = 'Ola ' + paciente.nome + '! Sua triagem foi aprovada! Clique para pagar: ' + url
      enviarWhatsAppOficial(paciente.telefone, msg).catch(console.error)
    } else {
      const msg = 'Sua condicao nao se qualifica para renovacao remota. Procure atendimento presencial.'
      enviarWhatsAppOficial(paciente.telefone, msg).catch(console.error)
    }
    
    return res.status(201).json({ success: true, id, elegivel, atendimentoId: id })
  } catch (e) {
    console.error('Triagem:', e.message)
    return res.status(500).json({ error: 'Erro interno na triagem' })
  }
}

module.exports = { triagem }
