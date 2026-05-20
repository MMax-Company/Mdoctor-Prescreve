require('dotenv').config()
const path = require('path')
const fs = require('fs')

const ESTADOS_FLUXO = {
  TRIAGEM: 'TRIAGEM',
  INELEGIVEL: 'INELEGIVEL',
  AGUARDANDO_PAGAMENTO: 'AGUARDANDO_PAGAMENTO',
  FILA: 'FILA',
  EM_ATENDIMENTO: 'EM_ATENDIMENTO',
  PRONTO_PARA_DECISAO: 'PRONTO_PARA_DECISAO',
  APROVADO: 'APROVADO',
  RECUSADO: 'RECUSADO',
  RECEITA_EMITIDA: 'RECEITA_EMITIDA'
}

const TRANSICOES_VALIDAS = {
  [ESTADOS_FLUXO.TRIAGEM]: [ESTADOS_FLUXO.AGUARDANDO_PAGAMENTO, ESTADOS_FLUXO.INELEGIVEL],
  [ESTADOS_FLUXO.AGUARDANDO_PAGAMENTO]: [ESTADOS_FLUXO.FILA],
  [ESTADOS_FLUXO.FILA]: [ESTADOS_FLUXO.EM_ATENDIMENTO],
  [ESTADOS_FLUXO.EM_ATENDIMENTO]: [ESTADOS_FLUXO.PRONTO_PARA_DECISAO],
  [ESTADOS_FLUXO.PRONTO_PARA_DECISAO]: [ESTADOS_FLUXO.APROVADO, ESTADOS_FLUXO.RECUSADO],
  [ESTADOS_FLUXO.APROVADO]: [ESTADOS_FLUXO.RECEITA_EMITIDA, ESTADOS_FLUXO.RECUSADO],
  [ESTADOS_FLUXO.RECUSADO]: [ESTADOS_FLUXO.APROVADO]
}

function transicaoValida(statusAtual, novoStatus) {
  const permitidos = TRANSICOES_VALIDAS[statusAtual]
  if (!permitidos) return false
  return permitidos.includes(novoStatus)
}

const NODE_ENV = process.env.NODE_ENV || 'development'
const IS_PRODUCTION = NODE_ENV === 'production'
const IS_DEVELOPMENT = NODE_ENV !== 'production'
const PORT = process.env.PORT || 3002
const BASE_URL = process.env.BASE_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? 'https://' + process.env.RAILWAY_PUBLIC_DOMAIN : 'http://localhost:' + PORT)
const WHATSAPP_MODE = process.env.WHATSAPP_MODE || 'test'
const DB_DIR = path.join(__dirname, '..', 'data')
const PUBLIC_DIR = path.join(__dirname, '..', 'public')

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

const requiredEnvVars = ['JWT_SECRET', 'ENCRYPTION_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']

module.exports = {
  ESTADOS_FLUXO,
  TRANSICOES_VALIDAS,
  transicaoValida,
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  PORT,
  BASE_URL,
  WHATSAPP_MODE,
  DB_DIR,
  PUBLIC_DIR,
  requiredEnvVars
}
