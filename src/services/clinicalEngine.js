function detectarTipo(texto) {
  if (!texto) return 'OUTRO'
  const lowerText = String(texto).toLowerCase()
  if (lowerText.includes('hipert') || lowerText.includes('pressao') || lowerText.includes('has')) return 'HAS'
  if (lowerText.includes('diabetes') || lowerText.includes('acucar')) return 'DIABETES'
  if (lowerText.includes('tireo') || lowerText.includes('hipotireoidismo')) return 'HIPOTIREOIDISMO'
  if (lowerText.includes('colesterol') || lowerText.includes('dislipidemia')) return 'DISLIPIDEMIA'
  if (lowerText.includes('ansiedade') || lowerText.includes('depressao')) return 'SAUDE_MENTAL'
  return 'OUTRO'
}

function gerarQueixa(tipo) {
  const base = {
    HAS: 'Paciente em acompanhamento por hipertensao arterial sistemica, solicita renovacao de receita.',
    DIABETES: 'Paciente em acompanhamento por diabetes mellitus tipo 2, solicita continuidade do tratamento.',
    HIPOTIREOIDISMO: 'Paciente com hipotireoidismo em tratamento, solicita renovacao de medicacao.',
    DISLIPIDEMIA: 'Paciente com dislipidemia em tratamento, solicita renovacao de medicacao.',
    SAUDE_MENTAL: 'Paciente em acompanhamento por transtorno de ansiedade/depressao, solicita renovacao.',
    OUTRO: 'Paciente em acompanhamento clinico, solicita renovacao de medicacao de uso continuo.'
  }
  return base[tipo] || base.OUTRO
}

function gerarHistoria(tipo) {
  const historias = {
    HAS: 'Paciente refere estabilidade do quadro pressorio. Nega cefaleia, tontura ou palpitacoes. Sem internacoes recentes.',
    DIABETES: 'Paciente nega poliuria, polidipsia ou polifagia. Refere seguimento com nutricionista.',
    HIPOTIREOIDISMO: 'Paciente nega ganho ponderal excessivo, astenia ou intolerancia ao frio.',
    DISLIPIDEMIA: 'Paciente relata dieta hipolipidica. Nega eventos cardiovasculares previos.',
    SAUDE_MENTAL: 'Paciente relata melhora do humor e ansiedade com medicacao atual. Nega ideacao suicida.',
    OUTRO: 'Paciente refere-se assintomatico no momento. Sem intercorrencias desde o ultimo atendimento.'
  }
  return historias[tipo] || historias.OUTRO
}

function gerarExameFisico(tipo) {
  const exames = {
    HAS: 'PA informada pelo paciente como controlada. FC dentro da normalidade.',
    DIABETES: 'Paciente eutrofico. Sem lesoes de pele. Extremidades preservadas.',
    HIPOTIREOIDISMO: 'Sem sinais clinicos evidentes de descompensacao tireoidiana.',
    DISLIPIDEMIA: 'Sem alteracoes clinicas relevantes ao exame remoto.',
    SAUDE_MENTAL: 'Paciente contactuante, orientado em tempo e espaco, sem sinais aparentes de agitacao.',
    OUTRO: 'Consulta remota. Exame fisico limitado sem alteracoes relevantes relatadas.'
  }
  return exames[tipo] || exames.OUTRO
}

function gerarConduta(tipo) {
  const condutas = {
    HAS: 'Manter tratamento anti-hipertensivo atual. Orientado controle pressorio domiciliar e retorno em 3 meses.',
    DIABETES: 'Manter hipoglicemiante oral. Reforacas orientacoes dieteticas e atividade fisica regular.',
    HIPOTIREOIDISMO: 'Manter levotiroxina na dose habitual. Solicitar TSH para acompanhamento.',
    DISLIPIDEMIA: 'Manter estatina e medidas nao farmacologicas.',
    SAUDE_MENTAL: 'Manter medicacao atual. Orientado acompanhamento psicologico.',
    OUTRO: 'Manter tratamento habitual e retornar em caso de intercorrencias.'
  }
  return condutas[tipo] || condutas.OUTRO
}

function gerarRecomendacoes(tipo) {
  const recomendacoes = {
    HAS: '- Reducao do sal\n- Exercicios fisicos\n- Controle pressorio regular',
    DIABETES: '- Controle alimentar\n- Monitorizacao glicemica\n- Atividade fisica',
    HIPOTIREOIDISMO: '- Uso em jejum\n- Evitar medicacao concomitante\n- Controle laboratorial',
    DISLIPIDEMIA: '- Dieta hipolipidica\n- Atividade fisica\n- Controle periodico',
    SAUDE_MENTAL: '- Higiene do sono\n- Psicoterapia\n- Reducao de estresse',
    OUTRO: '- Hidratacao adequada\n- Habitos saudaveis\n- Retorno se necessario'
  }
  return recomendacoes[tipo] || recomendacoes.OUTRO
}

function normalizarDoencas(doencas) {
  if (Array.isArray(doencas)) return doencas.join(', ').toLowerCase()
  if (typeof doencas === 'string') return doencas.toLowerCase()
  return String(doencas || '').toLowerCase()
}

function normalizarMedicamentosReceita(receita = {}, atendimento = null) {
  let medicamentos = receita.medicamentos
  if (typeof medicamentos === 'string') {
    try {
      medicamentos = JSON.parse(medicamentos)
    } catch {
      medicamentos = null
    }
  }
  if (Array.isArray(medicamentos) && medicamentos.length > 0) return medicamentos
  const dadosClinicos = atendimento?.dados_clinicos || atendimento?.triagem || {}
  const decisao = atendimento?.decisao || {}
  return [{
    nome: decisao.medicamento_prescrito || dadosClinicos.medicacao_em_uso || receita.medicamento || 'Medicamento nao informado',
    posologia: decisao.posologia || dadosClinicos.posologia_atual || receita.posologia || 'Uso conforme orientacao medica',
    quantidade: receita.quantidade || 30,
    duracao: receita.duracao || '30 dias'
  }]
}

module.exports = { detectarTipo, gerarQueixa, gerarHistoria, gerarExameFisico, gerarConduta, gerarRecomendacoes, normalizarDoencas, normalizarMedicamentosReceita }
