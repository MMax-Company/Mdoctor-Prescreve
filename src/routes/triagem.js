const express = require('express')
const router = express.Router()
const { triagem } = require('../controllers/triagemController')

router.post('/webhook/triagem', triagem)
router.post('/triagem', triagem)

module.exports = router
