const express = require('express')
const router = express.Router()
const { autenticarMedico } = require('../middlewares/auth')
const { getProntuario, getProntuarioResumido, getProntuarioPDF, exportProntuario } = require('../controllers/prontuarioController')

router.use(autenticarMedico)
router.get('/prontuario/:id', getProntuario)
router.get('/prontuario/:id/resumido', getProntuarioResumido)
router.get('/prontuario/:id/pdf', getProntuarioPDF)
router.get('/prontuario/:id/export', exportProntuario)

module.exports = router
