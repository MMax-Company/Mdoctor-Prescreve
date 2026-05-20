require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src *; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval'; img-src * data: blob:; font-src * data:; connect-src *; worker-src 'self' blob:; frame-src *")
  next()
})

const atendimentos = [
  { id: 'atend_001', paciente_nome: 'João Silva', paciente_cpf: '123.456.789-01', paciente_telefone: '(11) 99999-9999', doencas: 'Diabetes Mellitus', status: 'FILA', pagamento: true, criado_em: new Date().toISOString() },
  { id: 'atend_002', paciente_nome: 'Maria Santos', paciente_cpf: '987.654.321-00', paciente_telefone: '(11) 98888-8888', doencas: 'Hipertensão Arterial', status: 'FILA', pagamento: true, criado_em: new Date(Date.now() - 300000).toISOString() },
  { id: 'atend_003', paciente_nome: 'Pedro Costa', paciente_cpf: '456.789.123-45', paciente_telefone: '(11) 97777-7777', doencas: 'Hipotireoidismo', status: 'FILA', pagamento: true, criado_em: new Date(Date.now() - 600000).toISOString() }
]

app.get('/healthz', (req, res) => res.json({ status: 'online' }))
app.get('/api/fila', (req, res) => res.json({ total: atendimentos.filter(a => a.status === 'FILA').length, atendimentos: atendimentos.filter(a => a.status === 'FILA') }))
app.get('/api/atendimento/:id', (req, res) => { const at = atendimentos.find(a => a.id === req.params.id); if (!at) return res.status(404).json({ error: 'Nao encontrado' }); res.json(at) })
app.get('/api/estatisticas', (req, res) => res.json({ totalAtendimentos: atendimentos.length, fila: atendimentos.filter(a => a.status === 'FILA').length, emAtendimento: atendimentos.filter(a => a.status === 'EM_ATENDIMENTO').length, aprovados: atendimentos.filter(a => a.status === 'APROVADO').length, recusados: atendimentos.filter(a => a.status === 'RECUSADO').length }))
app.post('/api/decisao/:id', (req, res) => { const at = atendimentos.find(a => a.id === req.params.id); if (!at) return res.status(404).json({ error: 'Nao encontrado' }); const { decisao } = req.body; at.status = decisao === 'APROVAR' ? 'APROVADO' : 'RECUSADO'; res.json({ success: true, status: at.status }) })
app.post('/api/atendimento/:id/liberar', (req, res) => { const at = atendimentos.find(a => a.id === req.params.id); if (!at) return res.status(404).json({ error: 'Nao encontrado' }); at.status = 'FILA'; res.json({ success: true }) })

app.get('/painel-medico', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/painel-medico.html'))
})

app.listen(8080, '0.0.0.0', () => {
  console.log('Servidor rodando em http://localhost:8080')
  console.log('Painel: http://localhost:8080/painel-medico')
})
