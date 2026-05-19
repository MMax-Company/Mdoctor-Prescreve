const express = require('express')
const router = express.Router()
const prontuarioController = require('../controllers/prontuarioController')
const { autenticarMedico } = require('../middlewares/auth')

router.post('/', autenticarMedico, prontuarioController.criar.bind(prontuarioController))
router.get('/:triagemId', autenticarMedico, prontuarioController.obter.bind(prontuarioController))

module.exports = router
