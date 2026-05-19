require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const config = require('./config')

const app = express()

// Middlewares
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Arquivos est\u00e1ticos
app.use(express.static('public'))

// Health check
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Painel m\u00e9dico
app.get('/painel-medico', (req, res) => {
  res.sendFile(__dirname + '/../public/painel-medico-premium.html')
})

// Iniciar servidor
const PORT = config.PORT
app.listen(PORT, () => {
  console.log(\✅ Doctor Prescreve rodando em http://localhost:\\)
  console.log(\📋 Painel m\u00e9dico: http://localhost:\/painel-medico\)
})

module.exports = app
