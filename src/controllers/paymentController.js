const db = require('../db-supabase-hybrid')
const config = require('../config')
const { safeDecrypt } = require('../utils/crypto')
const { enviarWhatsAppOficial } = require('../services/whatsappService')

const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null

async function criarPagamento(req, res) {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe nao configurado' })
    }
    const atendimentoId = req.params.id
    const at = await db.buscarAtendimentoPorId(atendimentoId)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    if (at.status !== config.ESTADOS_FLUXO.AGUARDANDO_PAGAMENTO) {
      return res.status(400).json({ error: 'Status invalido: ' + at.status })
    }
    if (at.pagamento) {
      return res.status(400).json({ error: 'Pagamento ja realizado' })
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      metadata: { atendimentoId },
      line_items: [{
        price_data: {
          currency: process.env.CURRENCY || 'brl',
          product_data: { name: 'Consulta Assincrona - Doctor Prescreve' },
          unit_amount: parseInt(process.env.PRODUCT_PRICE) || 6990
        },
        quantity: 1
      }],
      success_url: config.BASE_URL + '/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: config.BASE_URL + '/cancel'
    })
    return res.json({ url: session.url, sessionId: session.id, paymentId: session.id })
  } catch (e) {
    console.error('Stripe:', e.message)
    return res.status(500).json({ error: 'Erro ao criar pagamento' })
  }
}

async function statusPagamento(req, res) {
  try {
    const at = await db.buscarAtendimentoPorId(req.params.id)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    return res.json({ atendimentoId: at.id, pago: at.pagamento || false, status: at.status })
  } catch (e) {
    console.error('Status pagamento:', e.message)
    return res.status(500).json({ error: 'Erro ao consultar pagamento' })
  }
}

const processedStripeEvents = new Set()

async function webhookStripe(req, res) {
  const sig = req.headers['stripe-signature']
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Webhook Stripe nao configurado' })
  }
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '')
    const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
    if (processedStripeEvents.has(event.id)) {
      return res.json({ received: true, duplicate: true })
    }
    processedStripeEvents.add(event.id)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const atendimentoId = session.metadata?.atendimentoId
      if (!atendimentoId) {
        return res.json({ received: true })
      }
      const at = await db.buscarAtendimentoPorId(atendimentoId)
      if (!at || at.pagamento || at.status !== config.ESTADOS_FLUXO.AGUARDANDO_PAGAMENTO) {
        return res.json({ received: true })
      }
      await db.atualizarStatusPagamento(atendimentoId, true, config.ESTADOS_FLUXO.FILA)
      const telefone = safeDecrypt(at.paciente_telefone)
      const nome = safeDecrypt(at.paciente_nome)
      if (telefone) {
        const msg = 'Pagamento confirmado, ' + nome + '! Seu atendimento entrou na fila.'
        enviarWhatsAppOficial(telefone, msg).catch(console.error)
      }
    }
    return res.json({ received: true })
  } catch (e) {
    console.error('Webhook Stripe:', e.message)
    return res.status(400).send('Webhook Error: ' + e.message)
  }
}

module.exports = { criarPagamento, statusPagamento, webhookStripe }
