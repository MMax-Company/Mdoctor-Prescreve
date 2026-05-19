const db = require('../db-supabase-hybrid')
const { v4: uuidv4 } = require('uuid')
const config = require('../config')

class TriagemController {
  async criar(req, res) {
    try {
      const { paciente_nome, paciente_cpf, paciente_email, paciente_telefone, medicamento, dosagem, frequencia } = req.body
      if (!paciente_nome || !paciente_cpf || !medicamento) {
        return res.status(400).json({ erro: 'Dados obrigatórios faltando' })
      }
      const triagem = {
        id: uuidv4(),
        paciente_nome,
        paciente_cpf,
        paciente_email,
        paciente_telefone,
        medicamento,
        dosagem,
        frequencia,
        status: config.ESTADOS_FLUXO.TRIAGEM,
        elegivel: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const resultado = await db.salvarTriagem(triagem)
      res.status(201).json(resultado)
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }

  async listar(req, res) {
    try {
      const triagens = await db.obterTriagensElegiveis()
      res.json(triagens)
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }

  async obter(req, res) {
    try {
      const { id } = req.params
      const triagem = await db.obterTriagem(id)
      if (!triagem) {
        return res.status(404).json({ erro: 'Triagem não encontrada' })
      }
      res.json(triagem)
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }
}

module.exports = new TriagemController()
