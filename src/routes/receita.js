const express = require('express')
const router = express.Router()
const { autenticarMedico } = require('../middlewares/auth')
const { criarReceita, buscarReceita, gerarPDFReceita, emitirReceita, enviarWhatsAppReceita, validarReceita, listarReceitasPaciente, cancelarReceita, renovarReceita } = require('../controllers/receitaController')

router.get('/receita/:id/validar', validarReceita)
router.use(autenticarMedico)
router.post('/receita', criarReceita)
router.get('/receita/:id', buscarReceita)
router.get('/receita/:id/pdf', gerarPDFReceita)
router.post('/receita/:id/emitir', emitirReceita)
router.post('/receita/:id/enviar-whatsapp', enviarWhatsAppReceita)
router.get('/receitas/paciente/:atendimentoId', listarReceitasPaciente)
router.post('/receita/:id/cancelar', cancelarReceita)
router.post('/receita/:id/renovar', renovarReceita)

module.exports = router
