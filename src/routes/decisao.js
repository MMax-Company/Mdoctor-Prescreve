const express = require('express')
const router = express.Router()
const decisaoController = require('../controllers/decisaoController')
const { autenticarMedico } = require('../middlewares/auth')

router.post('/aprovar', autenticarMedico, decisaoController.aprovar.bind(decisaoController))
router.post('/recusar', autenticarMedico, decisaoController.recusar.bind(decisaoController))
router.get('/:triagemId', autenticarMedico, decisaoController.obterDecisao.bind(decisaoController))

module.exports = router
