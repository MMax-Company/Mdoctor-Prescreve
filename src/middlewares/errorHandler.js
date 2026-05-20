const config = require('../config')

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  const errorPayload = {
    message: err.message,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  }
  if (!config.IS_PRODUCTION) {
    errorPayload.stack = err.stack
  }
  console.error('ERROR', errorPayload)
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Dados invalidos',
      detalhes: err.details.map(d => ({ campo: d.path.join('.'), mensagem: d.message }))
    })
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON invalido', mensagem: 'Corpo da requisicao mal formatado' })
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token invalido' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expirado' })
  }
  return res.status(statusCode).json({
    error: config.IS_PRODUCTION && statusCode === 500 ? 'Erro interno do servidor' : err.message || 'Erro desconhecido',
    ...(config.IS_PRODUCTION ? {} : { stack: err.stack })
  })
}

function notFoundHandler(req, res) {
  return res.status(404).json({
    error: 'Rota nao encontrada',
    method: req.method,
    path: req.originalUrl
  })
}

function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

module.exports = { errorHandler, notFoundHandler, asyncHandler }
