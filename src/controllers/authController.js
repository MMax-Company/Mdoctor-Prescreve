const jwt = require('jsonwebtoken')
const config = require('../config')
const { gerarToken, validarSenha } = require('../middlewares/auth')

class AuthController {
  async login(req, res) {
    try {
      const { senha } = req.body
      if (!validarSenha(senha)) {
        return res.status(401).json({ erro: 'Senha incorreta' })
      }
      const token = gerarToken('medico')
      res.json({ token, usuario: 'medico', expira_em: '24h' })
    } catch (erro) {
      res.status(500).json({ erro: erro.message })
    }
  }

  async verificarToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      if (!token) return res.status(401).json({ valido: false })
      jwt.verify(token, config.JWT_SECRET)
      res.json({ valido: true })
    } catch (erro) {
      res.status(401).json({ valido: false })
    }
  }
}

module.exports = new AuthController()
