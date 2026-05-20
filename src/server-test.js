require('dotenv').config()
const express = require('express')
const app = express()

app.use(express.json())

app.get('/healthz', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() })
})

app.get('/api/status', (req, res) => {
  res.json({ ok: true })
})

const PORT = process.env.PORT || 3002
app.listen(PORT, '0.0.0.0', () => {
  console.log('Servidor rodando em http://localhost:' + PORT)
})
