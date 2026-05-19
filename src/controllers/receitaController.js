const PDFDocument = require('pdfkit')
const QRCode = require('qrcode')
const db = require('../db-supabase-hybrid')
const { v4: uuidv4 } = require('uuid')

class ReceitaController {
  async gerar(req, res) {
    try {
      const { triagemId, medicamento, dosagem, frequencia, duracao } = req.body
      if (!triagemId || !medicamento) {
        return res.status(400).json({ erro: 'Dados obrigatórios faltando' })
      }
      const receita = {
        id: uuidv4(),
        triagemId,
        medicamento,
        dosagem,
        frequencia,
        duracao,
        data_emissao: new Date().toISOString(),
        validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
      const qrCode = await QRCode.toDataURL(JSON.stringify(receita))
      res.json({
        receita,
        qrCode,
        status: 'RECEITA_EMITIDA'
      })
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }

  async obter(req, res) {
    try {
      const { receitaId } = req.params
      const receita = await db.obterReceita(receitaId)
      if (!receita) {
        return res.status(404).json({ erro: 'Receita não encontrada' })
      }
      res.json(receita)
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }

  async listar(req, res) {
    try {
      const receitas = await db.obterReceitas()
      res.json(receitas)
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }
}

module.exports = new ReceitaController()
