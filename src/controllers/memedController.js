const axios = require('axios')
const config = require('../config')

class MemedController {
  async enviarReceita(req, res) {
    try {
      const { medicamento, dosagem, frequencia, paciente_nome, paciente_cpf } = req.body
      if (!medicamento || !paciente_cpf) {
        return res.status(400).json({ erro: 'Dados obrigatórios faltando' })
      }
      const payload = {
        medicamento,
        dosagem,
        frequencia,
        paciente_nome,
        paciente_cpf,
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
      res.json({
        sucesso: true,
        receita_id: response.data.id,
        status: 'ENVIADO_MEMED'
      })
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }

  async obterStatus(req, res) {
    try {
      const { receitaId } = req.params
      const response = await axios.get(
        \https://api.memed.com.br/v1/prescricoes/\\,
        {
          headers: {
            'Authorization': \Bearer \\
          }
        }
      )
      res.json(response.data)
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }
}

module.exports = new MemedController()
