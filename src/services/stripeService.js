const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

class StripeService {
  async criarIntencaoPagamento(valor, metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(valor * 100),
        currency: 'brl',
        metadata
      })
      return paymentIntent
    } catch (erro) {
      console.error('❌ Erro ao criar intenção:', erro.message)
      return null
    }
  }

  async confirmarPagamento(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      return paymentIntent.status === 'succeeded'
    } catch (erro) {
      console.error('❌ Erro ao confirmar pagamento:', erro.message)
      return false
    }
  }

  async obterStatusPagamento(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      return {
        status: paymentIntent.status,
        valor: paymentIntent.amount / 100,
        moeda: paymentIntent.currency
      }
    } catch (erro) {
      console.error('❌ Erro ao obter status:', erro.message)
      return null
    }
  }
}

module.exports = new StripeService()
