const db = require('../db-supabase-hybrid')
const { encrypt, decrypt } = require('../utils/crypto')

class ProntuarioController {
  async criar(req, res) {
    try {
      const { triagemId, conteudo, tipo } = req.body
      if (!triagemId || !conteudo) {
        return res.status(400).json({ erro: 'Dados obrigatórios faltando' })
      }
      const prontuario = {
        triagemId,
        conteudo: encrypt(conteudo),
        tipo: tipo || 'GERAL',
        created_at: new Date().toISOString()
      }
      const resultado = await db.salvarProntuario(prontuario)
      res.status(201).json(resultado)
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }

  async obter(req, res) {
    try {
      const { triagemId } = req.params
      const prontuarios = await db.obterProntuarios(triagemId)
      const descriptografados = prontuarios.map(p => ({
        ...p,
        conteudo: decrypt(p.conteudo)
      }))
      res.json(descriptografados)
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }
}

module.exports = new ProntuarioController()
