require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const config = require('./config')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.use(express.static(path.join(__dirname, '../public')))

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/painel-medico', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/painel-medico-premium.html'))
})

app.get('/api/status', (req, res) => {
  res.json({
    sistema: 'Mdoctor Prescreve v4.0',
    status: 'online',
    versao: '4.0.0',
    ambiente: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  })
})

app.get('/api/mdoctor/status', (req, res) => {
  res.json({
    sistema: 'Mdoctor Prescreve v4.0',
    status: 'online',
    versao: '4.0.0',
    timestamp: new Date().toISOString()
  })
})

app.use(errorHandler)

const PORT = config.PORT
app.listen(PORT, () => {
  console.log('Doctor Prescreve rodando em http://localhost:' + PORT)
  console.log('Painel medico: http://localhost:' + PORT + '/painel-medico')
  console.log('API: http://localhost:' + PORT + '/api/status')
})

module.exports = app
