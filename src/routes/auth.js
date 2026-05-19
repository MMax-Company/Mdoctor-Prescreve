const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/login', authController.login.bind(authController))
router.get('/verify', authController.verificarToken.bind(authController))

module.exports = router
