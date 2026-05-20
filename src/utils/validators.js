const Joi = require('joi')

function validarTelefone(telefone) {
  if (!telefone) return false
  const limpo = String(telefone).replace(/\D/g, '')
  return limpo.length >= 10 && limpo.length <= 13
}

function validarCPF(cpf) {
  if (!cpf) return false
  cpf = String(cpf).replace(/\D/g, '')
  if (cpf.length !== 11) return false
  if (/^(\d)\1+\$/.test(cpf)) return false
  let soma = 0
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i)
  }
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf.substring(9, 10))) return false
  soma = 0
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  return resto === parseInt(cpf.substring(10, 11))
}

function sanitizarHTML(texto) {
  if (!texto || typeof texto !== 'string') return ''
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').trim()
}

const textoSeguro = Joi.string().trim().max(5000)
const textoCurto = Joi.string().trim().max(255)

const triagemSchema = Joi.object({
  paciente: Joi.object({
    nome: textoCurto.min(3).required(),
    telefone: Joi.string().pattern(/^\d{10,13}\$/).required(),
    cpf: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    data_nascimento: Joi.string().allow('', null)
  }).required(),
  triagem: Joi.object({
    doencas: textoSeguro.required(),
    medicacao_em_uso: textoSeguro.required(),
    tempo_doenca: Joi.number().min(1).max(50000).required(),
    posologia_atual: textoSeguro.allow('', null),
    receita_vencida_dias: Joi.number().min(0).max(3650).allow(null),
    ultima_consulta: textoCurto.allow('', null),
    comorbidades: textoSeguro.allow('', null),
    alergias: textoSeguro.allow('', null)
  }).required()
})

const decisaoSchema = Joi.object({
  decisao: Joi.string().valid('APROVAR', 'RECUSAR', 'APROVADO', 'RECUSADO').required(),
  orientacoes: textoSeguro.allow('', null),
  medicamento: textoCurto.allow('', null),
  posologia: textoSeguro.allow('', null),
  receita_memed_id: textoCurto.allow('', null),
  memed_payload: Joi.object().unknown(true).allow(null)
})

const revisaoSchema = Joi.object({
  novaDecisao: Joi.string().valid('APROVAR', 'RECUSAR', 'APROVADO', 'RECUSADO').required(),
  motivoRevisao: textoSeguro.allow('', null),
  observacao: textoSeguro.allow('', null),
  medicamento: textoCurto.allow('', null),
  posologia: textoSeguro.allow('', null)
})

module.exports = { validarTelefone, validarCPF, sanitizarHTML, triagemSchema, decisaoSchema, revisaoSchema }
