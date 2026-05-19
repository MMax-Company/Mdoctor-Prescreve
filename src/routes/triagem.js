const express = require('express')
const router = express.Router()
const triagemController = require('../controllers/triagemController')
const { autenticarMedico } = require('../middlewares/auth')

router.post('/', triagemController.criar.bind(triagemController))
router.get('/', autenticarMedico, triagemController.listar.bind(triagemController))
router.get('/:id', autenticarMedico, triagemController.obter.bind(triagemController))

module.exports = router
