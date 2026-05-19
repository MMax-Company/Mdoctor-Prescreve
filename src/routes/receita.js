const express = require('express')
const router = express.Router()
const receitaController = require('../controllers/receitaController')
const { autenticarMedico } = require('../middlewares/auth')

router.post('/gerar', autenticarMedico, receitaController.gerar.bind(receitaController))
router.get('/:receitaId', autenticarMedico, receitaController.obter.bind(receitaController))
router.get('/', autenticarMedico, receitaController.listar.bind(receitaController))

module.exports = router
