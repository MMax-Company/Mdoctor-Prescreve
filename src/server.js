require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3002

app.get('/', (req, res) => {
res.json({
status: 'online',
service: 'MDoctor Backend',
version: '1.0.0'
})
})

app.get('/healthz', (req, res) => {
res.json({
ok: true,
timestamp: new Date().toISOString()
})
})

app.listen(PORT, () => {
console.log(`🚀 Backend rodando na porta ${PORT}`)
})
