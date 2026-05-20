const db = require('../db-supabase-hybrid')
const { safeDecrypt } = require('../utils/crypto')
const { detectarTipo, gerarQueixa, gerarHistoria, gerarExameFisico, gerarConduta, gerarRecomendacoes } = require('../services/clinicalEngine')

async function getProntuario(req, res) {
  try {
    const at = await db.buscarAtendimentoPorId(req.params.id)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    const dadosClinicos = at.dados_clinicos || at.triagem || {}
    const tipo = dadosClinicos.tipo || detectarTipo(dadosClinicos.doenca || '')
    const decisao = at.decisao || {}
    return res.json({
      paciente: {
        nome: safeDecrypt(at.paciente_nome),
        cpf: safeDecrypt(at.paciente_cpf),
        telefone: safeDecrypt(at.paciente_telefone),
        email: safeDecrypt(at.paciente_email)
      },
      dados_clinicos: dadosClinicos,
      prontuario: {
        queixa: gerarQueixa(tipo),
        historia: gerarHistoria(tipo),
        exame_fisico: gerarExameFisico(tipo),
        conduta: gerarConduta(tipo),
        medicacao: decisao.medicamento_prescrito || dadosClinicos.medicacao_em_uso || 'Nao definida',
        posologia: decisao.posologia || dadosClinicos.posologia_atual || 'Nao definida',
        recomendacoes: gerarRecomendacoes(tipo),
        data_atendimento: new Date().toISOString()
      },
      decisao_medica: decisao,
      atendimento: {
        id: at.id,
        status: at.status,
        criado_em: at.criado_em,
        pago_em: at.pago_em
      }
    })
  } catch (e) {
    console.error('getProntuario:', e.message)
    return res.status(500).json({ error: 'Erro ao carregar prontuario' })
  }
}

async function getProntuarioResumido(req, res) {
  try {
    const at = await db.buscarAtendimentoPorId(req.params.id)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    const dadosClinicos = at.dados_clinicos || at.triagem || {}
    const decisao = at.decisao || {}
    return res.json({
      paciente: safeDecrypt(at.paciente_nome),
      doenca: dadosClinicos.doenca || 'Nao especificada',
      medicacao: decisao.medicamento_prescrito || dadosClinicos.medicacao_em_uso || 'Nao definida',
      posologia: decisao.posologia || dadosClinicos.posologia_atual || 'Nao definida',
      conduta: gerarConduta(dadosClinicos.tipo || 'OUTRO')
    })
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao gerar resumo' })
  }
}

async function getProntuarioPDF(req, res) {
  try {
    const at = await db.buscarAtendimentoPorId(req.params.id)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    const dadosClinicos = at.dados_clinicos || at.triagem || {}
    const tipo = dadosClinicos.tipo || detectarTipo(dadosClinicos.doenca || '')
    const decisao = at.decisao || {}
    const html = '<html><body><h1>Prontuario Medico</h1><p>Paciente: ' + safeDecrypt(at.paciente_nome) + '</p></body></html>'
    res.setHeader('Content-Type', 'text/html')
    return res.send(html)
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao gerar prontuario' })
  }
}

async function exportProntuario(req, res) {
  try {
    const at = await db.buscarAtendimentoPorId(req.params.id)
    if (!at) {
      return res.status(404).json({ error: 'Atendimento nao encontrado' })
    }
    const dadosClinicos = at.dados_clinicos || at.triagem || {}
    const tipo = dadosClinicos.tipo || detectarTipo(dadosClinicos.doenca || '')
    const decisao = at.decisao || {}
    return res.json({
      metadata: { id: at.id, exportado_em: new Date().toISOString(), sistema: 'Doctor Prescreve' },
      paciente: { nome: safeDecrypt(at.paciente_nome), cpf: safeDecrypt(at.paciente_cpf) },
      clinico: { tipo, condicao: dadosClinicos.doenca, medicacao: dadosClinicos.medicacao_em_uso },
      decisao_medica: decisao,
      status: at.status
    })
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao exportar prontuario' })
  }
}

module.exports = { getProntuario, getProntuarioResumido, getProntuarioPDF, exportProntuario }
