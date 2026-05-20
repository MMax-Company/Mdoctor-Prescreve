const axios = require('axios')
const WEBHOOK_URL = process.env.N8N_WHATSAPP_WEBHOOK_URL

async function enviarWhatsAppOficial(telefone, mensagem, tipo = 'notificacao') {
  if (!telefone || !mensagem) {
    console.warn('WhatsApp payload invalido')
    return false
  }
  const telefoneLimpo = String(telefone).replace(/\D/g, '')
  setImmediate(async () => {
    try {
      if (!WEBHOOK_URL) {
        console.warn('N8N_WHATSAPP_WEBHOOK_URL nao configurado')
        return
      }
      await axios.post(WEBHOOK_URL, {
        telefone: telefoneLimpo,
        mensagem,
        tipo,
        timestamp: new Date().toISOString()
      }, { timeout: 10000 })
      console.log('WhatsApp enviado: ' + telefoneLimpo)
    } catch (error) {
      console.error('WhatsApp:', error.message)
    }
  })
  return true
}

module.exports = { enviarWhatsAppOficial }
