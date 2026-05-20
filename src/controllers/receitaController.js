const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')
const PDFDocument = require('pdfkit')
const QRCode = require('qrcode')

const db = require('../db-supabase-hybrid')
const config = require('../config')
const { safeDecrypt } = require('../utils/crypto')
const { sanitizarHTML } = require('../utils/validators')
const { enviarWhatsAppOficial } = require('../services/whatsappService')

async function criarReceita(req, res) {
  try {
    const payload = req.body || {}
    const atendimentoId = payload.atendimentoId || payload.id
    if (!atendimentoId) {
      return res.status(400).json({ error: 'atendimentoId obrigatorio' })
    }
    const at = await db.buscarAtendimentoPorId(atendimentoId)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    const dadosClinicos = at.dados_clinicos || at.triagem || {}
    const decisao = at.decisao || {}
    const medicamentoFinal = payload.medicamento || decisao.medicamento_prescrito || dadosClinicos.medicacao_em_uso
    if (!medicamentoFinal) {
      return res.status(400).json({ error: 'Medicamento nao definido' })
    }
    const receita = {
      id: uuidv4(),
      numero: 'REC-' + Date.now(),
      atendimentoId,
      paciente: { nome: safeDecrypt(at.paciente_nome), cpf: safeDecrypt(at.paciente_cpf) },
      medicamentos: [{
        nome: sanitizarHTML(medicamentoFinal),
        posologia: sanitizarHTML(payload.posologia || decisao.posologia || 'Uso conforme orientacao medica'),
        quantidade: payload.quantidade || 30,
        duracao: payload.duracao || '30 dias'
      }],
      observacoes: sanitizarHTML(payload.observacoes || ''),
      medico: {
        nome: process.env.MEDICO_NOME || 'Dr. Plantonista',
        registro: (process.env.MEDICO_CONSELHO || 'CRM') + ' ' + (process.env.MEDICO_NUMERO || '00000'),
        especialidade: process.env.MEDICO_ESPECIALIDADE || 'Clinica Geral'
      },
      data_emissao: new Date().toISOString(),
      data_validade: new Date(Date.now() + (parseInt(process.env.RECEITA_VALIDADE_DIAS) || 90) * 86400000).toISOString(),
      assinatura_digital: crypto.createHash('sha256').update(atendimentoId + Date.now()).digest('hex'),
      status: 'ATIVA',
      created_at: new Date().toISOString()
    }
    await db.salvarReceita(receita)
    return res.json({
      success: true,
      receita,
      links: {
        pdf: config.BASE_URL + '/api/receita/' + receita.id + '/pdf',
        validar: config.BASE_URL + '/api/receita/' + receita.id + '/validar'
      }
    })
  } catch (e) {
    console.error('criarReceita:', e.message)
    return res.status(500).json({ error: 'Erro ao criar receita' })
  }
}

async function buscarReceita(req, res) {
  try {
    const receita = await db.buscarReceitaPorId(req.params.id)
    if (!receita) {
      return res.status(404).json({ error: 'Receita nao encontrada' })
    }
    return res.json(receita)
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao buscar receita' })
  }
}

async function gerarPDFReceita(req, res) {
  try {
    const receita = await db.buscarReceitaPorId(req.params.id)
    if (!receita) {
      return res.status(404).json({ error: 'Receita nao encontrada' })
    }
    res.setHeader('Content-Type', 'application/pdf')
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    doc.pipe(res)
    doc.fontSize(20).text('DOCTOR PRESCREVE', { align: 'center' })
    doc.moveDown()
    doc.fontSize(16).text('RECEITA MEDICA', { align: 'center' })
    doc.moveDown()
    doc.fontSize(10).text('Numero: ' + receita.numero)
    doc.text('Data: ' + new Date(receita.data_emissao).toLocaleDateString('pt-BR'))
    doc.moveDown()
    doc.fontSize(12).text('Paciente: ' + (receita.paciente?.nome || 'N/A'))
    doc.text('CPF: ' + (receita.paciente?.cpf || 'N/A'))
    doc.moveDown()
    receita.medicamentos.forEach((med, index) => {
      doc.fontSize(11).text((index + 1) + '. ' + med.nome)
      doc.fontSize(10).text('Posologia: ' + med.posologia)
      doc.text('Quantidade: ' + med.quantidade)
      doc.moveDown()
    })
    doc.end()
  } catch (e) {
    console.error('gerarPDFReceita:', e.message)
    return res.status(500).json({ error: 'Erro ao gerar PDF' })
  }
}

async function validarReceita(req, res) {
  try {
    const receita = await db.buscarReceitaPorId(req.params.id)
    if (!receita) {
      return res.status(404).json({ valido: false })
    }
    const valida = receita.status === 'ATIVA'
    return res.json({
      valido: valida,
      numero: receita.numero,
      emissao: receita.data_emissao,
      validade: receita.data_validade
    })
  } catch (e) {
    return res.status(500).json({ valido: false })
  }
}

async function enviarWhatsAppReceita(req, res) {
  try {
    const receita = await db.buscarReceitaPorId(req.params.id)
    if (!receita) {
      return res.status(404).json({ error: 'Receita nao encontrada' })
    }
    const at = await db.buscarAtendimentoPorId(receita.atendimentoId)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    const telefone = safeDecrypt(at.paciente_telefone)
    const nome = safeDecrypt(at.paciente_nome)
    if (!telefone) {
      return res.status(400).json({ error: 'Paciente sem telefone' })
    }
    const url = config.BASE_URL + '/api/receita/' + receita.id + '/pdf'
    const mensagem = 'Receita Medica\n\nOla ' + nome + '!\n\nSua receita esta disponivel:\n\n' + url + '\n\nDoctor Prescreve'
    await enviarWhatsAppOficial(telefone, mensagem)
    return res.json({ success: true, enviado: true })
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao enviar receita' })
  }
}

async function renovarReceita(req, res) {
  try {
    const receita = await db.buscarReceitaPorId(req.params.id)
    if (!receita) {
      return res.status(404).json({ error: 'Receita nao encontrada' })
    }
    const novaReceita = {
      ...receita,
      id: uuidv4(),
      numero: 'REC-' + Date.now(),
      data_emissao: new Date().toISOString()
    }
    await db.salvarReceita(novaReceita)
    return res.json({ success: true, receita: novaReceita })
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao renovar receita' })
  }
}

module.exports = {
  criarReceita,
  buscarReceita,
  gerarPDFReceita,
  validarReceita,
  enviarWhatsAppReceita,
  renovarReceita
}
