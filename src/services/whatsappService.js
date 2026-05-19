const axios = require('axios')
const config = require('../config')

class WhatsappService {
  async enviarMensagem(telefone, mensagem) {
    try {
      const response = await axios.post(
        \https://api.z-api.io/instances/\/token/\/send-message\,
        {
          phone: telefone,
          message: mensagem
        }
      )
      return response.data
    } catch (erro) {
      console.error('❌ Erro ao enviar WhatsApp:', erro.message)
      return null
    }
  }

  async enviarReceita(telefone, receitaUrl) {
    try {
      const response = await axios.post(
        \https://api.z-api.io/instances/\/token/\/send-document\,
        {
          phone: telefone,
          document: receitaUrl,
          caption: 'Sua receita médica'
        }
      )
      return response.data
    } catch (erro) {
      console.error('❌ Erro ao enviar receita:', erro.message)
      return null
    }
  }

  async enviarNotificacao(telefone, tipo, dados) {
    const mensagens = {
      APROVADO: \✅ Sua receita foi aprovada! Medicamento: \\,
      RECUSADO: \❌ Sua solicitação foi recusada. Motivo: \\,
      FILA: \⏳ Você está na fila. Posição: \\,
      PRONTO: \🎉 Sua receita está pronta para retirada!\
    }
    return this.enviarMensagem(telefone, mensagens[tipo] || 'Notificação do Doctor Prescreve')
  }
}

module.exports = new WhatsappService()
