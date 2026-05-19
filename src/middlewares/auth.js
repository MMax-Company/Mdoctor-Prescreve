const jwt = require('jsonwebtoken')
const config = require('../config')

function autenticarMedico(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ erro: 'Token n\u00e3o fornecido' })
  }
  
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET)
    req.medico = decoded
    next()
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inv\u00e1lido' })
  }
}

function gerarToken(usuario) {
  return jwt.sign(
    { usuario, timestamp: Date.now() },
    config.JWT_SECRET,
    { expiresIn: '24h' }
  )
}

function validarSenha(senha) {
  return senha === config.MEDICO_PASS
}

module.exports = {
  autenticarMedico,
  gerarToken,
  validarSenha
}
