const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const db = require('../db-supabase-hybrid')

class PaymentController {
  async criarIntencao(req, res) {
    try {
      const { triagemId, valor } = req.body
      if (!triagemId || !valor) {
        return res.status(400).json({ erro: 'Dados obrigatórios faltando' })
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(valor * 100),
        currency: 'brl',
        metadata: { triagemId }
      })
      res.json({
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id
      })
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }

  async confirmarPagamento(req, res) {
    try {
      const { paymentIntentId, triagemId } = req.body
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      if (paymentIntent.status === 'succeeded') {
        await db.atualizarStatus(triagemId, 'FILA')
        return res.json({ sucesso: true, status: 'FILA' })
      }
      res.status(400).json({ erro: 'Pagamento não confirmado' })
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }

  async obterStatus(req, res) {
    try {
      const { paymentIntentId } = req.params
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      res.json({
        status: paymentIntent.status,
        valor: paymentIntent.amount / 100
      })
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }
}

module.exports = new PaymentController()
