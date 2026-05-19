require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const config = require('./config')
const routes = require('./routes')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

app.use(express.static('public'))

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/painel-medico', (req, res) => {
  res.sendFile(__dirname + '/../public/painel-medico-premium.html')
})

app.use('/api', routes)

app.use(errorHandler)

const PORT = config.PORT
app.listen(PORT, () => {
  console.log('Doctor Prescreve rodando em http://localhost:' + PORT)
  console.log('Painel medico: http://localhost:' + PORT + '/painel-medico')
  console.log('API: http://localhost:' + PORT + '/api')
})

module.exports = app
