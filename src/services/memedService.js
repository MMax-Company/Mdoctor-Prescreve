const axios = require('axios')
const config = require('../config')

class MemedService {
  async enviarPrescricao(dados) {
    try {
      const payload = {
        medicamento: dados.medicamento,
        dosagem: dados.dosagem,
        frequencia: dados.frequencia,
        duracao: dados.duracao,
        paciente_nome: dados.paciente_nome,
        paciente_cpf: dados.paciente_cpf,
        prescritor_nome: config.MEMED_PRESCRITOR_NOME,
        prescritor_board: config.MEMED_PRESCRITOR_BOARD_NUMBER
      }
      const response = await axios.post(
        'https://api.memed.com.br/v1/prescricoes',
        payload,
        {
          headers: {
            'Authorization': \Bearer \\,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (erro) {
      console.error('❌ Erro ao enviar para Memed:', erro.message)
      return null
    }
  }

  async obterStatusPrescricao(receitaId) {
    try {
      const response = await axios.get(
        \https://api.memed.com.br/v1/prescricoes/\\,
        {
          headers: {
            'Authorization': \Bearer \\
          }
        }
      )
      return response.data
    } catch (erro) {
      console.error('❌ Erro ao obter status:', erro.message)
      return null
    }
  }
}

module.exports = new MemedService()
